import 'package:flutter/material.dart';
import '../../core/constants/colors.dart';
import 'topup_screen.dart';

/// Layar Ringkasan e-Wallet Tersambung Bank bjb
class EWalletScreen extends StatelessWidget {
  const EWalletScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('e-Wallet Tersambung'),
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            const Text(
              'Dompet Digital Terhubung ke Rekening bjb',
              style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 12),

            _buildWalletCard(
              context,
              name: 'GoPay',
              phone: '0812-3456-7890',
              balance: 'Rp 425.000',
              color: const Color(0xFF00AED6),
            ),
            const SizedBox(height: 12),
            _buildWalletCard(
              context,
              name: 'OVO',
              phone: '0812-3456-7890',
              balance: 'Rp 150.000',
              color: const Color(0xFF4C3494),
            ),
            const SizedBox(height: 12),
            _buildWalletCard(
              context,
              name: 'DANA',
              phone: '0812-3456-7890',
              balance: 'Rp 880.000',
              color: const Color(0xFF118EEA),
            ),
            const SizedBox(height: 12),
            _buildWalletCard(
              context,
              name: 'ShopeePay',
              phone: '0812-3456-7890',
              balance: 'Rp 65.000',
              color: const Color(0xFFEE4D2D),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildWalletCard(
    BuildContext context, {
    required String name,
    required String phone,
    required String balance,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Center(
              child: Text(
                name[0],
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: color),
              ),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(name, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
                const SizedBox(height: 2),
                Text(phone, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                const SizedBox(height: 4),
                Text('Saldo: $balance', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.primary)),
              ],
            ),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              minimumSize: const Size(80, 36),
              padding: const EdgeInsets.symmetric(horizontal: 12),
            ),
            onPressed: () {
              Navigator.push(context, MaterialPageRoute(builder: (_) => const TopUpScreen()));
            },
            child: const Text('Top Up', style: TextStyle(fontSize: 12)),
          ),
        ],
      ),
    );
  }
}
