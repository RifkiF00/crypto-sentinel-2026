import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import '../core/constants/colors.dart';
import '../data/mock_data.dart';

/// Item Mutasi Transaksi Rekening Bank bjb
class TransactionItem extends StatelessWidget {
  final TransactionModel transaction;
  final VoidCallback? onTap;

  const TransactionItem({
    super.key,
    required this.transaction,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Row(
          children: [
            // Ikon Kategori (+ Hijau Masuk / - Merah Keluar)
            Container(
              width: 42,
              height: 42,
              decoration: BoxDecoration(
                color: transaction.isIncoming
                    ? AppColors.accentGreen.withOpacity(0.1)
                    : AppColors.primary.withOpacity(0.08),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Center(
                child: Icon(
                  transaction.isIncoming
                      ? CupertinoIcons.arrow_down_left
                      : CupertinoIcons.arrow_up_right,
                  color: transaction.isIncoming
                      ? AppColors.accentGreen
                      : AppColors.primary,
                  size: 20,
                ),
              ),
            ),
            const SizedBox(width: 14),

            // Deskripsi & Waktu Transaksi
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    transaction.title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 3),
                  Text(
                    '${transaction.category} • ${transaction.date}',
                    style: const TextStyle(
                      fontSize: 11,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(width: 8),

            // Nominal Transaksi
            Text(
              transaction.amount,
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w700,
                color: transaction.isIncoming
                    ? AppColors.accentGreen
                    : AppColors.textPrimary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
