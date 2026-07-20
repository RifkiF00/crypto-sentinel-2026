import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import '../../core/constants/colors.dart';
import '../../core/constants/text_styles.dart';
import 'transfer_screen.dart';
import 'topup_screen.dart';
import 'payment_screen.dart';
import 'qris_screen.dart';
import 'withdraw_screen.dart';
import 'pulse_data_screen.dart';
import 'ewallet_screen.dart';

/// Halaman Grid Lengkap Semua Menu Layanan Perbankan Bank Kuningan (Material Design 3)
class MoreMenuScreen extends StatelessWidget {
  const MoreMenuScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final List<Map<String, dynamic>> allServices = [
      {'title': 'Transfer', 'icon': CupertinoIcons.arrow_right_arrow_left_square_fill, 'color': Color(0xFF003366), 'screen': const TransferScreen()},
      {'title': 'Top Up E-Wallet', 'icon': CupertinoIcons.plus_rectangle_fill_on_rectangle_fill, 'color': Color(0xFF008000), 'screen': const TopUpScreen()},
      {'title': 'Pembayaran', 'icon': CupertinoIcons.doc_text_fill, 'color': Color(0xFFFF9900), 'screen': const PaymentScreen()},
      {'title': 'Scan QRIS', 'icon': CupertinoIcons.qrcode_viewfinder, 'color': Color(0xFFD32F2F), 'screen': const QrisScreen()},
      {'title': 'Tarik Tunai ATM', 'icon': CupertinoIcons.money_dollar_circle_fill, 'color': Color(0xFF1A528A), 'screen': const WithdrawScreen()},
      {'title': 'Pulsa & Data', 'icon': CupertinoIcons.device_phone_portrait, 'color': Color(0xFF008080), 'screen': const PulseDataScreen()},
      {'title': 'Dompet Digital', 'icon': CupertinoIcons.creditcard_fill, 'color': Color(0xFF4C3494), 'screen': const EWalletScreen()},
      {'title': 'Investasi Reksadana', 'icon': CupertinoIcons.chart_bar_alt_fill, 'color': Color(0xFF2E7D32)},
      {'title': 'Deposito Berjangka', 'icon': CupertinoIcons.lock_shield_fill, 'color': Color(0xFF1565C0)},
      {'title': 'Pinjaman KTA', 'icon': CupertinoIcons.person_crop_circle_badge_checkmark, 'color': Color(0xFFE65100)},
      {'title': 'Asuransi Kesehatan', 'icon': CupertinoIcons.heart_circle_fill, 'color': Color(0xFFC2185B)},
      {'title': 'Zakat & Wakaf', 'icon': CupertinoIcons.gift_fill, 'color': Color(0xFF00695C)},
      {'title': 'Buka Rekening Baru', 'icon': CupertinoIcons.folder_badge_plus, 'color': Color(0xFF455A64)},
      {'title': 'Valuta Asing (Forex)', 'icon': CupertinoIcons.globe, 'color': Color(0xFF283593)},
      {'title': 'Tiket & Travel', 'icon': CupertinoIcons.airplane, 'color': Color(0xFF0277BD)},
      {'title': 'Pusat Bantuan CS', 'icon': CupertinoIcons.question_circle_fill, 'color': Color(0xFF37474F)},
    ];

    return Scaffold(
      appBar: AppBar(title: const Text('Semua Layanan Bank Kuningan')),
      body: GridView.builder(
        padding: const EdgeInsets.all(20),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 4,
          crossAxisSpacing: 14,
          mainAxisSpacing: 20,
          childAspectRatio: 0.8,
        ),
        itemCount: allServices.length,
        itemBuilder: (context, index) {
          final srv = allServices[index];
          return GestureDetector(
            onTap: () {
              if (srv.containsKey('screen') && srv['screen'] != null) {
                Navigator.push(context, MaterialPageRoute(builder: (context) => srv['screen']));
              } else {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Layanan "${srv['title']}" segera hadir dalam pembaruan berikutnya.'),
                    behavior: SnackBarBehavior.floating,
                  ),
                );
              }
            },
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  width: 58,
                  height: 58,
                  decoration: BoxDecoration(
                    color: (srv['color'] as Color).withOpacity(0.12),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Icon(srv['icon'], color: srv['color'], size: 28),
                ),
                const SizedBox(height: 8),
                Text(
                  srv['title'],
                  style: AppTextStyles.textTheme.bodySmall?.copyWith(fontSize: 11, fontWeight: FontWeight.w600),
                  textAlign: TextAlign.center,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
