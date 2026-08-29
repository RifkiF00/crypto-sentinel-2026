import 'dart:convert';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:http/http.dart' as http;
import 'package:crypto/crypto.dart';

/// Service Integrasi API Core Banking bjb & Crypto-Sentinel FDS Engine (Port 8080)
class BjbApiService {
  // Auto-detect: localhost saat di Web/Chrome, IP LAN saat di HP Android
  static String get baseUrl => kIsWeb
      ? 'http://localhost:8080/api/v1'
      : 'http://192.168.100.8:8080/api/v1';

  /// Kirim transaksi transfer (Dukungan Sesama bjb Rp 0, RTOL via APEX bjb, & SKNBI)
  static Future<Map<String, dynamic>> sendTransfer({
    required String senderAccount,
    required String receiverAccount,
    required int amount,
    String method = 'SESAMA_BJB', // SESAMA_BJB, RTOL_APEX, SKNBI
    String purposeCode = 'SALA',
    String description = 'Transfer bjb DIGI Mobile Banking',
  }) async {
    final uri = Uri.parse('$baseUrl/bjb/transfer');


    // 1. Generate SNAP BI Security Signature via HMAC-SHA256
    const String partnerId = 'BJB-PARTNER-Billy';
    final String timestamp = DateTime.now().toUtc().toIso8601String();
    const String secret = 'BJB_SECRET_DIGDAYA_2026';

    // Gunakan formula HMAC dengan method (sesuai backend PARTNER_SECRETS BJB)
    final String message = '$partnerId|$timestamp|$senderAccount|$receiverAccount|$amount|$method';
    final keyBytes = utf8.encode(secret);
    final messageBytes = utf8.encode(message);
    final hmacSha256 = Hmac(sha256, keyBytes);
    final signature = hmacSha256.convert(messageBytes).toString();

    try {
      final response = await http.post(
        uri,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-Partner-Id': partnerId,
          'X-Timestamp': timestamp,
          'X-Signature': signature,
        },
        body: {
          'sender_account': senderAccount,
          'receiver_account': receiverAccount,
          'amount': amount.toString(),
          'method': method,          // ← WAJIB: dikirim ke server agar HMAC-SHA256 cocok
          'latitude': '-6.9175',    // Koordinat Bandung / Jawa Barat
          'longitude': '107.6191',
        },
      ).timeout(const Duration(seconds: 8));

      // Guard: parse JSON aman — backend kadang return HTML saat 500
      Map<String, dynamic> data;
      try {
        data = json.decode(response.body) as Map<String, dynamic>;
      } catch (_) {
        // Server return HTML/plain-text (mis. 500 Internal Server Error)
        final statusCode = response.statusCode;
        String errMsg;
        if (statusCode == 500) {
          errMsg = 'Server backend mengalami kesalahan internal (500).\n'
              'Pastikan Crypto-Sentinel AI Engine (port 8000) sudah berjalan.';
        } else if (statusCode == 502 || statusCode == 503) {
          errMsg = 'Server tidak dapat dihubungi (${statusCode}).\n'
              'Pastikan semua service sudah aktif via START-ALL.bat.';
        } else {
          errMsg = 'Response tidak valid dari server (HTTP $statusCode).\n'
              'Body: ${response.body.length > 100 ? response.body.substring(0, 100) : response.body}';
        }
        return {
          'success': false,
          'isBlocked': false,
          'status': 'SERVER_ERROR',
          'message': errMsg,
        };
      }

      if (response.statusCode == 200 || response.statusCode == 201) {
        return {
          'success': true,
          'status': data['sentinel_decision'] ?? data['status'] ?? 'ALLOW',
          'data': data,
          'message': data['message'] ?? 'Transfer Berhasil Diproses oleh Bank bjb',
        };
      } else {
        // Transaksi diblokir Sentinel FDS atau error saldo
        final detailMsg = data['detail'] ?? data['message'] ?? 'Transaksi Gagal Diproses';
        final isBlocked = response.statusCode == 403 ||
            detailMsg.toString().toLowerCase().contains('blokir') ||
            detailMsg.toString().toLowerCase().contains('sentinel') ||
            detailMsg.toString().toLowerCase().contains('diblokir');

        return {
          'success': false,
          'isBlocked': isBlocked,
          'status': isBlocked ? 'BLOCK' : 'FAILED',
          'message': detailMsg.toString(),
          'data': data,
        };
      }
    } catch (e) {
      // Koneksi ke backend gagal — tampilkan error yang jelas
      return {
        'success': false,
        'isBlocked': false,
        'status': 'CONNECTION_ERROR',
        'message': 'Gagal terhubung ke Server Core Banking (8080).\n'
            'Pastikan jaringan aktif dan server berjalan.\nError: $e',
      };
    }
  }

  /// Ambil data akun nasabah dinamis dari Core Banking API
  static Future<Map<String, dynamic>> getAccountInfo(String accountId) async {
    final uri = Uri.parse('$baseUrl/bjb/account/$accountId');
    try {
      final response = await http.get(uri).timeout(const Duration(seconds: 4));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return {
          'success': true,
          'ownerName': data['owner_name'],
          'balance': data['balance'],
          'isBlocked': data['is_blocked'],
        };
      }
    } catch (_) {}

    // Fallback Mock data Rifki Firmansyah
    return {
      'success': false,
      'ownerName': 'Rifki Firmansyah',
      'balance': 499700000,
      'isBlocked': false,
    };
  }

  /// Ambil riwayat transaksi live dari Core Banking API
  /// Filter berdasarkan account (sender atau receiver)
  static Future<List<Map<String, dynamic>>> getTransactions({
    String? accountId,
    int limit = 10,
  }) async {
    final uri = Uri.parse('$baseUrl/bjb/transactions?limit=$limit');

    try {
      final response = await http.get(uri).timeout(const Duration(seconds: 5));
      if (response.statusCode == 200) {
        final List<dynamic> raw = json.decode(response.body);
        // Filter transaksi milik akun ini (sebagai sender atau receiver)
        final filtered = raw.where((tx) {
          if (accountId == null) return true;
          final sender = tx['sender_account']?.toString() ?? '';
          final receiver = tx['receiver_account']?.toString() ?? '';
          return sender == accountId || receiver == accountId;
        }).take(limit).toList();

        return filtered.map<Map<String, dynamic>>((tx) {
          final sender = tx['sender_account']?.toString() ?? '';
          final isOutgoing = sender == accountId;
          final amount = tx['amount'] ?? 0;
          final status = tx['sentinel_decision'] ?? tx['status'] ?? 'BERHASIL';
          final receiver = tx['receiver_account']?.toString() ?? '';
          final txType = tx['method'] ?? tx['type'] ?? 'TRANSFER';

          return {
            'id': tx['transaction_id'] ?? tx['id'] ?? '-',
            'title': isOutgoing
                ? 'Transfer ke $receiver'
                : 'Transfer dari $sender',
            'category': txType,
            'date': tx['timestamp'] ?? tx['created_at'] ?? '-',
            'amount': isOutgoing
                ? '- Rp ${_formatAmount(amount)}'
                : '+ Rp ${_formatAmount(amount)}',
            'isIncoming': !isOutgoing,
            'status': status == 'BLOCK' ? 'DIBLOKIR FDS' : 'BERHASIL',
            'refNumber': tx['transaction_id'] ?? 'REF-BJB-2026',
            'isBlocked': status == 'BLOCK',
          };
        }).toList();
      }
    } catch (_) {}

    // Fallback: list kosong jika server offline
    return [];
  }

  static String _formatAmount(dynamic amount) {
    try {
      final num = int.parse(amount.toString());
      return num.toString().replaceAllMapped(
        RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
        (m) => '${m[1]}.',
      );
    } catch (_) {
      return amount.toString();
    }
  }
}
