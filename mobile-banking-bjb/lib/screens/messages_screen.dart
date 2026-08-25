import 'package:flutter/material.dart';
import '../core/constants/colors.dart';

/// Layar Notifikasi Transaksi & Promo Bank bjb
class MessagesScreen extends StatelessWidget {
  const MessagesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Pesan & Notifikasi bjb'),
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            // Notifikasi Keamanan
            _buildNotificationCard(
              icon: Icons.shield_rounded,
              iconColor: AppColors.primary,
              title: 'Keamanan: Login Berhasil',
              time: 'Hari ini, 08:30 WIB',
              body: 'Login berhasil pada perangkat Android (PIDI-Device-01). Pastikan selalu jaga kerahasiaan PIN bjb DIGI Anda.',
            ),
            const SizedBox(height: 12),

            // Notifikasi Transaksi
            _buildNotificationCard(
              icon: Icons.check_circle_rounded,
              iconColor: AppColors.accentGreen,
              title: 'Transfer Masuk Rp 8.500.000',
              time: 'Hari ini, 10:15 WIB',
              body: 'Dana dari PT Maju Bersama telah berhasil masuk ke Tabungan Utama Tandamata bjb Anda.',
            ),
            const SizedBox(height: 12),

            // Promo bjb
            _buildNotificationCard(
              icon: Icons.local_offer_rounded,
              iconColor: AppColors.accentGold,
              title: 'Promo Diskon QRIS bjb 30%',
              time: 'Kemarin, 12:00 WIB',
              body: 'Dapatkan cashback hingga Rp 25.000 untuk transaksi QRIS merchant kuliner se-Jawa Barat & Banten.',
            ),
            const SizedBox(height: 12),

            // Sistem bjb
            _buildNotificationCard(
              icon: Icons.info_rounded,
              iconColor: AppColors.accentSky,
              title: 'Pemeliharaan Sistem Terjadwal',
              time: '20 Agu 2026',
              body: 'Peningkatan performa RTOL APEX bjb akan dilakukan pada hari Minggu pukul 01.00 - 03.00 WIB.',
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNotificationCard({
    required IconData icon,
    required Color iconColor,
    required String title,
    required String time,
    required String body,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
        boxShadow: const [
          BoxShadow(color: AppColors.shadow, blurRadius: 8, offset: Offset(0, 2)),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: iconColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: iconColor, size: 22),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Flexible(
                      child: Text(
                        title,
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textPrimary,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 2),
                Text(
                  time,
                  style: const TextStyle(fontSize: 10, color: AppColors.textSecondary),
                ),
                const SizedBox(height: 6),
                Text(
                  body,
                  style: const TextStyle(fontSize: 12, color: AppColors.textSecondary, height: 1.4),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
