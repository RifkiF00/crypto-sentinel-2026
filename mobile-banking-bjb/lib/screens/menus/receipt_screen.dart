import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../core/constants/colors.dart';
import '../main_screen.dart';

/// Layar Struk Bukti Transaksi Resmi Bank bjb
class ReceiptScreen extends StatelessWidget {
  final String title;
  final String amount;
  final String receiverAccount;
  final String receiverName;
  final String? bankName;
  final String category;
  final String refNumber;
  final String status;
  final String adminFee;

  const ReceiptScreen({
    super.key,
    required this.title,
    required this.amount,
    required this.receiverAccount,
    required this.receiverName,
    this.bankName,
    required this.category,
    required this.refNumber,
    this.status = 'BERHASIL',
    this.adminFee = 'Gratis (Rp 0)',
  });

  @override
  Widget build(BuildContext context) {
    final bool isSuccess = status == 'BERHASIL';

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Bukti Transaksi Resmi'),
        automaticallyImplyLeading: false,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            children: [
              // Card Struk
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppColors.border),
                  boxShadow: const [
                    BoxShadow(color: AppColors.shadow, blurRadius: 16, offset: Offset(0, 4)),
                  ],
                ),
                child: Column(
                  children: [
                    // Header Logo & Status
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'bank bjb',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w900,
                            color: AppColors.primary,
                            letterSpacing: 0.5,
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: isSuccess
                                ? AppColors.accentGreen.withOpacity(0.12)
                                : AppColors.accentGold.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            status,
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w800,
                              color: isSuccess ? AppColors.accentGreen : AppColors.primaryDark,
                            ),
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 20),

                    // Ikon Centang Sukses
                    Container(
                      width: 56,
                      height: 56,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: isSuccess
                            ? AppColors.accentGreen.withOpacity(0.12)
                            : AppColors.accentGold.withOpacity(0.2),
                      ),
                      child: Icon(
                        isSuccess ? Icons.check_circle_rounded : Icons.hourglass_top_rounded,
                        color: isSuccess ? AppColors.accentGreen : AppColors.accentGold,
                        size: 36,
                      ),
                    ),

                    const SizedBox(height: 16),

                    // Nominal Transaksi
                    Text(
                      amount,
                      style: const TextStyle(
                        fontSize: 26,
                        fontWeight: FontWeight.w900,
                        color: AppColors.textPrimary,
                        letterSpacing: -0.5,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      title,
                      textAlign: TextAlign.center,
                      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textSecondary),
                    ),

                    const SizedBox(height: 20),
                    const Divider(height: 1),
                    const SizedBox(height: 16),

                    // Detail Data Struk
                    _buildReceiptRow('Nomor Referensi', refNumber, canCopy: true, context: context),
                    const SizedBox(height: 12),
                    _buildReceiptRow('Waktu Transaksi', '23 Agu 2026, 01:55 WIB'),
                    const SizedBox(height: 12),
                    _buildReceiptRow('Kategori', category),
                    const SizedBox(height: 12),
                    _buildReceiptRow('Rekening Sumber', '0012-3456-7890 (Billy Jonathan)'),
                    const SizedBox(height: 12),
                    _buildReceiptRow('Tujuan / Penerima', '$receiverName ($receiverAccount)'),
                    if (bankName != null) ...[
                      const SizedBox(height: 12),
                      _buildReceiptRow('Bank Penerima', bankName!),
                    ],
                    const SizedBox(height: 12),
                    _buildReceiptRow('Biaya Transaksi', adminFee),

                    const SizedBox(height: 20),
                    const Divider(height: 1),
                    const SizedBox(height: 14),

                    // Watermark Keamanan
                    const Text(
                      'Resi ini adalah bukti pembayaran yang sah diterbitkan oleh PT Bank Pembangunan Daerah Jawa Barat dan Banten, Tbk (Bank bjb).',
                      textAlign: TextAlign.center,
                      style: TextStyle(fontSize: 10, color: AppColors.textSecondary, height: 1.4),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // Action Buttons: Share, Download & Home
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Struk berhasil dibagikan')),
                        );
                      },
                      icon: const Icon(Icons.share_rounded, size: 18),
                      label: const Text('Bagikan'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Struk disimpan ke galeri')),
                        );
                      },
                      icon: const Icon(Icons.download_rounded, size: 18),
                      label: const Text('Unduh PDF'),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 12),

              ElevatedButton(
                onPressed: () {
                  Navigator.pushAndRemoveUntil(
                    context,
                    MaterialPageRoute(builder: (_) => const MainScreen()),
                    (route) => false,
                  );
                },
                child: const Text('Kembali ke Beranda'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildReceiptRow(String label, String value, {bool canCopy = false, BuildContext? context}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
        const SizedBox(width: 12),
        Flexible(
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Flexible(
                child: Text(
                  value,
                  textAlign: TextAlign.end,
                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
                ),
              ),
              if (canCopy && context != null) ...[
                const SizedBox(width: 4),
                InkWell(
                  onTap: () {
                    Clipboard.setData(ClipboardData(text: value));
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Nomor referensi disalin!'), duration: Duration(seconds: 1)),
                    );
                  },
                  child: const Icon(Icons.copy_rounded, size: 12, color: AppColors.primary),
                ),
              ],
            ],
          ),
        ),
      ],
    );
  }
}
