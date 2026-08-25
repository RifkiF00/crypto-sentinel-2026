import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import '../../core/constants/colors.dart';
import '../../widgets/quick_action_button.dart';
import 'ewallet_screen.dart';
import 'payment_screen.dart';
import 'pulse_data_screen.dart';
import 'qris_screen.dart';
import 'topup_screen.dart';
import 'transfer_screen.dart';
import 'withdraw_screen.dart';

/// Layar Menu Lengkap Seluruh 16 Layanan Bank bjb
class MoreMenuScreen extends StatelessWidget {
  const MoreMenuScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final List<Map<String, dynamic>> allServices = [
      {'title': 'Transfer', 'icon': CupertinoIcons.arrow_right_arrow_left, 'route': const TransferScreen()},
      {'title': 'Top Up', 'icon': CupertinoIcons.plus_circle_fill, 'route': const TopUpScreen()},
      {'title': 'Bayar', 'icon': CupertinoIcons.doc_text_fill, 'route': const PaymentScreen()},
      {'title': 'QRIS', 'icon': CupertinoIcons.qrcode_viewfinder, 'route': const QrisScreen()},
      {'title': 'Tarik Tunai', 'icon': CupertinoIcons.money_dollar_circle_fill, 'route': const WithdrawScreen()},
      {'title': 'Pulsa & Data', 'icon': CupertinoIcons.device_phone_portrait, 'route': const PulseDataScreen()},
      {'title': 'e-Wallet', 'icon': CupertinoIcons.creditcard_fill, 'route': const EWalletScreen()},
      {'title': 'PBB Jabar', 'icon': CupertinoIcons.building_2_fill, 'route': const PaymentScreen()},
      {'title': 'PDAM Tirta', 'icon': CupertinoIcons.drop_fill, 'route': const PaymentScreen()},
      {'title': 'BPJS Kes', 'icon': CupertinoIcons.heart_fill, 'route': const PaymentScreen()},
      {'title': 'Listrik PLN', 'icon': CupertinoIcons.bolt_fill, 'route': const PaymentScreen()},
      {'title': 'APEX bjb', 'icon': CupertinoIcons.arrow_2_squarepath, 'route': const TransferScreen()},
      {'title': 'SKNBI Kliring', 'icon': CupertinoIcons.doc_checkmark_fill, 'route': const TransferScreen()},
      {'title': 'Deposito bjb', 'icon': CupertinoIcons.chart_bar_alt_fill, 'route': null},
      {'title': 'Kredit bjb', 'icon': CupertinoIcons.briefcase_fill, 'route': null},
      {'title': 'bjb Syariah', 'icon': CupertinoIcons.star_circle_fill, 'route': null},
    ];

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Semua Layanan bjb DIGI'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Daftar 16 Layanan Digital Bank bjb',
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700),
              ),
              const SizedBox(height: 14),

              Container(
                padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.border),
                  boxShadow: const [
                    BoxShadow(color: AppColors.shadow, blurRadius: 10, offset: Offset(0, 2)),
                  ],
                ),
                child: GridView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: allServices.length,
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 4,
                    mainAxisSpacing: 18,
                    childAspectRatio: 0.85,
                  ),
                  itemBuilder: (context, index) {
                    final item = allServices[index];
                    return QuickActionButton(
                      title: item['title'] as String,
                      icon: item['icon'] as IconData,
                      onTap: () {
                        final route = item['route'] as Widget?;
                        if (route != null) {
                          Navigator.push(context, MaterialPageRoute(builder: (_) => route));
                        } else {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text('Layanan ${item['title']} segera hadir.')),
                          );
                        }
                      },
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
