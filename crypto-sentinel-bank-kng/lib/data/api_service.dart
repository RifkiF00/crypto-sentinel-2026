import 'dart:convert';
import 'package:http/http.dart' as http;

/// Service Integrasi API Core Banking Expresso (Port 8080) & Crypto-Sentinel FDS Engine
class BankKuninganApiService {
  // Base URL Core Banking Expresso API
  static const String baseUrl = 'http://localhost:8080/api/v1';

  /// Kirim transaksi transfer (Dukungan BI-FAST & RTOL / Interbank)
  static Future<Map<String, dynamic>> sendTransfer({
    required String senderAccount,
    required String receiverAccount,
    required int amount,
    String method = 'BI-FAST',
    String purposeCode = 'SALA',
    String description = 'Transfer M-Banking Bank Kuningan',
  }) async {
    final uri = Uri.parse('$baseUrl/bri/transfer');

    try {
      final response = await http.post(
        uri,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: {
          'sender_account': senderAccount,
          'receiver_account': receiverAccount,
          'amount': amount.toString(),
          'latitude': '-6.9744',
          'longitude': '108.4832', // Koordinat Kab. Kuningan
        },
      ).timeout(const Duration(seconds: 8));

      final data = json.decode(response.body);

      if (response.statusCode == 200 || response.statusCode == 201) {
        return {
          'success': true,
          'status': data['sentinel_decision'] ?? data['status'] ?? 'ALLOW',
          'data': data,
          'message': data['message'] ?? 'Transfer Berhasil Diproses',
        };
      } else {
        // Transaksi diblokir atau error saldo/akun
        final detailMsg = data['detail'] ?? 'Transaksi Gagal Diproses';
        final isBlocked = response.statusCode == 403 || detailMsg.toString().toLowerCase().contains('blokir') || detailMsg.toString().toLowerCase().contains('sentinel');

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
}
