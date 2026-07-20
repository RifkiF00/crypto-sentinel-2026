import 'package:flutter/material.dart';
import '../core/constants/colors.dart';
import '../core/constants/text_styles.dart';

/// Tombol Aksi Cepat berbentuk lingkaran ikon dengan label sederhana di bawahnya.
/// Digunakan pada grid atau baris menu cepat di halaman utama.
class QuickActionButton extends StatelessWidget {
  final String title;
  final IconData icon;
  final String? badgeText;
  final VoidCallback onTap;

  const QuickActionButton({
    super.key,
    required this.title,
    required this.icon,
    this.badgeText,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Stack(
            clipBehavior: Clip.none,
            children: [
              Container(
                width: 58,
                height: 58,
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  shape: BoxShape.circle,
                  border: Border.all(color: AppColors.border, width: 1),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.primary.withOpacity(0.06),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Icon(
                  icon,
                  color: AppColors.primary,
                  size: 26,
                ),
              ),
              if (badgeText != null)
                Positioned(
                  top: -4,
                  right: -8,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: AppColors.accentYellow,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: AppColors.surface, width: 1.5),
                    ),
                    child: Text(
                      badgeText!,
                      style: AppTextStyles.textTheme.labelSmall?.copyWith(
                        color: AppColors.primaryDark,
                        fontSize: 9,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            title,
            style: AppTextStyles.textTheme.labelMedium?.copyWith(
              color: AppColors.textPrimary,
              fontWeight: FontWeight.w600,
            ),
            textAlign: TextAlign.center,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}
