import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:crypto/crypto.dart';

/// Service Integrasi API Core Banking Expresso (Port 8080) & Crypto-Sentinel FDS Engine
class BankKuninganApiService {
  // Base URL Core Banking Expresso API
  static const String baseUrl = 'http://192.168.100.8:8080/api/v1';

  /// Kirim transaksi transfer (Dukungan RTOL via APEX bjb & Kliring SKNBI / Interbank)
  static Future<Map<String, dynamic>> sendTransfer({
    required String senderAccount,
    required String receiverAccount,
    required int amount,
    String method = 'RTOL',
    String purposeCode = 'SALA',
    String description = 'Transfer M-Banking Bank Kuningan',
  }) async {
    final uri = Uri.parse('$baseUrl/bri/transfer');

    // 1. Generate SNAP BI Security Signature via HMAC-SHA256
    final String partnerId = 'KNG-PARTNER-Billy';
    final String timestamp = DateTime.now().toUtc().toIso8601String();
    final String secret = 'KNG_SECRET_2026';

    final String message = '$partnerId|$timestamp|$senderAccount|$receiverAccount|$amount';
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
          'method': method,          // ← diteruskan ke server
          'latitude': '-6.9744',
          'longitude': '108.4832',  // Koordinat Kab. Kuningan
        },
      ).timeout(const Duration(seconds: 8));

      // Guard: parse JSON aman jika backend return non-JSON / error
      Map<String, dynamic> data;
      try {
        data = json.decode(response.body) as Map<String, dynamic>;
      } catch (_) {
        final statusCode = response.statusCode;
        String errMsg = 'Response tidak valid dari server (HTTP $statusCode).';
        if (statusCode == 500) {
          errMsg = 'Server backend mengalami kesalahan internal (500).\nPastikan Core Banking & AI Engine berjalan.';
        } else if (statusCode == 502 || statusCode == 503) {
          errMsg = 'Server tidak dapat dihubungi ($statusCode).\nPastikan semua service aktif via START-ALL.bat.';
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
          'message': data['message'] ?? 'Transfer Berhasil Diproses',
        };
      } else {
        // Transaksi diblokir atau error saldo/akun
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
      // Return fallback response jika backend lapor offline
      return {
        'success': false,
        'isBlocked': false,
        'status': 'ERROR',
        'message': 'Gagal terhubung ke Server Core Banking (8080): $e',
      };
    }
  }

  /// Ambil data profil & saldo nasabah dinamis dari Core Banking API
  static Future<Map<String, dynamic>> getAccountInfo(String accountId) async {
    final uri = Uri.parse('$baseUrl/bri/account/$accountId');
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
    } catch (e) {
      print('[API Error] Gagal mengambil data akun $accountId: $e');
    }
    return {
      'success': false,
      'ownerName': 'Billy Jonathan',
      'balance': 24550000,
      'isBlocked': false,
    };
  }

  /// Ambil riwayat transaksi live dari Core Banking API
  static Future<List<Map<String, dynamic>>> getTransactions({
    String? accountId,
    int limit = 10,
  }) async {
    final uri = Uri.parse('$baseUrl/bri/transactions?limit=$limit');
    try {
      final response = await http.get(uri).timeout(const Duration(seconds: 5));
      if (response.statusCode == 200) {
        final List<dynamic> raw = json.decode(response.body);
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
            'title': isOutgoing ? 'Transfer ke $receiver' : 'Transfer dari $sender',
            'category': txType,
            'date': tx['timestamp'] ?? tx['created_at'] ?? '-',
            'amount': isOutgoing ? '- Rp $amount' : '+ Rp $amount',
            'isIncoming': !isOutgoing,
            'status': status == 'BLOCK' ? 'DIBLOKIR FDS' : 'BERHASIL',
            'refNumber': tx['transaction_id'] ?? 'REF-KNG-2026',
            'isBlocked': status == 'BLOCK',
          };
        }).toList();
      }
    } catch (_) {}
    return [];
  }
}

