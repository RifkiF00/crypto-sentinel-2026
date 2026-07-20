import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import '../core/constants/colors.dart';
import '../core/constants/text_styles.dart';

/// Item Daftar Mutasi Rekening dengan indikator warna yang jelas:
/// - Hijau (`AppColors.accentGreen`) dan ikon panah bawah untuk uang masuk.
/// - Merah (`AppColors.accentRed`) dan ikon panah atas untuk uang keluar.
class TransactionItem extends StatelessWidget {
  final String title;
  final String category;
  final String date;
  final String amount;
  final bool isIncoming;

  const TransactionItem({
    super.key,
    required this.title,
    required this.category,
    required this.date,
    required this.amount,
    required this.isIncoming,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border, width: 1),
      ),
      child: Row(
        children: [
          // Lingkaran Indikator Ikon Warna (Hijau / Merah)
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: isIncoming
                  ? AppColors.accentGreen.withOpacity(0.12)
                  : AppColors.accentRed.withOpacity(0.12),
              shape: BoxShape.circle,
            ),
            child: Icon(
              isIncoming
                  ? CupertinoIcons.arrow_down_left_circle_fill
                  : CupertinoIcons.arrow_up_right_circle_fill,
              color: isIncoming ? AppColors.accentGreen : AppColors.accentRed,
              size: 26,
            ),
          ),
          const SizedBox(width: 14),

          // Detail Transaksi (Judul, Kategori & Tanggal)
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: AppTextStyles.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w700,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 3),
                Row(
                  children: [
                    Text(
                      category,
                      style: AppTextStyles.textTheme.bodySmall?.copyWith(
                        color: AppColors.primaryLight,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 6),
                      child: Text(
                        '•',
                        style: AppTextStyles.textTheme.bodySmall,
                      ),
                    ),
                    Expanded(
                      child: Text(
                        date,
                        style: AppTextStyles.textTheme.bodySmall?.copyWith(
                          color: AppColors.textSecondary,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(width: 10),

          // Nominal Transaksi (Hijau atau Merah)
          Text(
            amount,
            style: AppTextStyles.textTheme.titleMedium?.copyWith(
              color: isIncoming ? AppColors.accentGreen : AppColors.accentRed,
              fontWeight: FontWeight.w800,
            ),
          ),
        ],
      ),
    );
  }
}
