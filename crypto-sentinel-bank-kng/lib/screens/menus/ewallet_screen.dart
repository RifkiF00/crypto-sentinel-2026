import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import '../../core/constants/colors.dart';
import '../../core/constants/text_styles.dart';
import 'topup_screen.dart';

/// Halaman Fungsional Dompet Digital & E-Wallet (Material Design 3)
class EWalletScreen extends StatelessWidget {
  const EWalletScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final List<Map<String, dynamic>> savedWallets = [
      {'name': 'Gopay (Budi Santoso)', 'phone': '0812-3456-7890', 'balance': 'Rp 145.000', 'color': Color(0xFF00AA13)},
      {'name': 'OVO Cash Utama', 'phone': '0812-3456-7890', 'balance': 'Rp 88.500', 'color': Color(0xFF4C3494)},
      {'name': 'DANA Premium', 'phone': '0812-3456-7890', 'balance': 'Rp 320.000', 'color': Color(0xFF118EEA)},
      {'name': 'ShopeePay Belanja', 'phone': '0812-3456-7890', 'balance': 'Rp 12.500', 'color': Color(0xFFEE4D2D)},
    ];

    return Scaffold(
      appBar: AppBar(title: const Text('Dompet Digital')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(colors: [AppColors.primary, AppColors.primaryLight]),
                borderRadius: BorderRadius.circular(24),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Total Saldo E-Wallet Tersambung', style: AppTextStyles.textTheme.bodyMedium?.copyWith(color: Colors.white70)),
                      const SizedBox(height: 6),
                      Text('Rp 566.000', style: AppTextStyles.textTheme.headlineLarge?.copyWith(color: Colors.white, fontWeight: FontWeight.w800)),
                    ],
                  ),
                  ElevatedButton(
                    onPressed: () {
                      Navigator.push(context, MaterialPageRoute(builder: (context) => const TopUpScreen()));
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.accentYellow,
                      foregroundColor: AppColors.primaryDark,
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    ),
                    child: const Text('+ Top Up Baru'),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            Text('Dompet Tersimpan Anda', style: AppTextStyles.textTheme.labelLarge),
            const SizedBox(height: 12),
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: savedWallets.length,
              itemBuilder: (context, index) {
                final wallet = savedWallets[index];
                return Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 48,
                        height: 48,
                        decoration: BoxDecoration(color: wallet['color'].withOpacity(0.12), shape: BoxShape.circle),
                        child: Icon(CupertinoIcons.creditcard_fill, color: wallet['color'], size: 24),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(wallet['name'], style: AppTextStyles.textTheme.titleMedium),
                            const SizedBox(height: 2),
                            Text(wallet['phone'], style: AppTextStyles.textTheme.bodySmall?.copyWith(color: AppColors.textSecondary)),
                          ],
                        ),
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(wallet['balance'], style: AppTextStyles.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                          const SizedBox(height: 4),
                          GestureDetector(
                            onTap: () {
                              Navigator.push(context, MaterialPageRoute(builder: (context) => const TopUpScreen()));
                            },
                            child: Text('Isi Ulang >', style: AppTextStyles.textTheme.labelSmall?.copyWith(color: AppColors.primary)),
                          ),
                        ],
                      ),
                    ],
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
