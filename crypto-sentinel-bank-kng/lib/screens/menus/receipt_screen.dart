import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import '../../core/constants/colors.dart';
import '../../core/constants/strings.dart';
import '../../core/constants/text_styles.dart';

/// Halaman Bukti Transaksi Berhasil (Struk Resi Digital).
/// Menampilkan rincian transaksi lengkap, nomor referensi, dan tombol kembali ke beranda.
class ReceiptScreen extends StatelessWidget {
  final String title;
  final String recipientName;
  final String recipientDetail;
  final String amount;
  final String adminFee;
  final String totalAmount;
  final String referenceNumber;
  final String date;

  const ReceiptScreen({
    super.key,
    required this.title,
    required this.recipientName,
    required this.recipientDetail,
    required this.amount,
    required this.adminFee,
    required this.totalAmount,
    required this.referenceNumber,
    required this.date,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.primaryDark,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Kartu Struk Utama
                Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(28),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.2),
                        blurRadius: 30,
                        offset: const Offset(0, 15),
                      ),
                    ],
                  ),
                  child: Column(
                    children: [
                      // Header Logo Bank Kuningan di Struk
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        margin: const EdgeInsets.only(bottom: 16),
                        decoration: BoxDecoration(
                          color: AppColors.background,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: AppColors.border),
                        ),
                        child: Image.asset(
                          'assets/images/bank-kuningan-logo.png',
                          height: 40,
                          fit: BoxFit.contain,
                        ),
                      ),

                      // Ikon Sukses Animasi
                      Container(
                        width: 80,
                        height: 80,
                        decoration: BoxDecoration(
                          color: AppColors.accentGreen.withOpacity(0.12),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          CupertinoIcons.checkmark_seal_fill,
                          color: AppColors.accentGreen,
                          size: 56,
                        ),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'Transaksi Berhasil!',
                        style: AppTextStyles.textTheme.headlineMedium?.copyWith(
                          color: AppColors.accentGreen,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        title,
                        style: AppTextStyles.textTheme.bodyMedium?.copyWith(
                          color: AppColors.textSecondary,
                        ),
                      ),
                      const SizedBox(height: 24),
                      Divider(color: AppColors.border.withOpacity(0.8)),
                      const SizedBox(height: 20),

                      // Nominal Utama
                      Text(
                        'TOTAL BAYAR',
                        style: AppTextStyles.textTheme.labelSmall?.copyWith(
                          color: AppColors.textSecondary,
                          letterSpacing: 1.2,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        totalAmount,
                        style: AppTextStyles.textTheme.displayMedium?.copyWith(
                          color: AppColors.primary,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      const SizedBox(height: 24),

                      // Rincian Penerima / Merchant
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: AppColors.background,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppColors.border),
                        ),
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(10),
                              decoration: BoxDecoration(
                                color: AppColors.primary.withOpacity(0.1),
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(CupertinoIcons.building_2_fill, color: AppColors.primary, size: 24),
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(recipientName, style: AppTextStyles.textTheme.titleMedium),
                                  const SizedBox(height: 2),
                                  Text(recipientDetail, style: AppTextStyles.textTheme.bodySmall),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 20),

                      // Tabel Detail Transaksi
                      _buildDetailRow('Nominal Transaksi', amount),
                      const SizedBox(height: 12),
                      _buildDetailRow('Biaya Admin', adminFee),
                      const SizedBox(height: 12),
                      _buildDetailRow('Tanggal & Waktu', date),
                      const SizedBox(height: 12),
                      _buildDetailRow('Nomor Referensi', referenceNumber),
                      const SizedBox(height: 12),
                      _buildDetailRow('Status Transaksi', 'BERHASIL / SUKSES', isHighlight: true),
                      const SizedBox(height: 20),
                      Divider(color: AppColors.border.withOpacity(0.8)),
                      const SizedBox(height: 16),

                      Text(
                        'Bank Kuningan terdaftar dan diawasi oleh Otoritas Jasa Keuangan (OJK). Simpan struk ini sebagai bukti pembayaran yang sah.',
                        textAlign: TextAlign.center,
                        style: AppTextStyles.textTheme.bodySmall?.copyWith(
                          color: AppColors.textHint,
                          fontSize: 10,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 28),

                // Tombol Bagikan & Kembali
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text('Struk berhasil disimpan ke Galeri HP Anda'),
                              behavior: SnackBarBehavior.floating,
                            ),
                          );
                        },
                        icon: const Icon(CupertinoIcons.share_up, color: Colors.white, size: 18),
                        label: const Text('Bagikan', style: TextStyle(color: Colors.white)),
                        style: OutlinedButton.styleFrom(
                          side: const BorderSide(color: Colors.white),
                          padding: const EdgeInsets.symmetric(vertical: 16),
                        ),
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      flex: 2,
                      child: ElevatedButton.icon(
                        onPressed: () {
                          Navigator.of(context).popUntil((route) => route.isFirst);
                        },
                        icon: const Icon(CupertinoIcons.house_fill, size: 18),
                        label: const Text('Kembali ke Beranda'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.accentYellow,
                          foregroundColor: AppColors.primaryDark,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value, {bool isHighlight = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: AppTextStyles.textTheme.bodyMedium?.copyWith(
            color: AppColors.textSecondary,
          ),
        ),
        Text(
          value,
          style: AppTextStyles.textTheme.bodyMedium?.copyWith(
            fontWeight: isHighlight ? FontWeight.w800 : FontWeight.w600,
            color: isHighlight ? AppColors.accentGreen : AppColors.textPrimary,
          ),
        ),
      ],
    );
  }
}
