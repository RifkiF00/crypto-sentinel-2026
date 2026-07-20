import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import '../core/constants/colors.dart';
import '../core/constants/strings.dart';
import '../core/constants/text_styles.dart';

/// Kartu Saldo Eksklusif Bank Kuningan berwarna Deep Blue bergradasi.
/// Menampilkan nomor rekening, saldo aktual, serta tombol Eye Icon untuk menyembunyikan atau menampilkan saldo.
class BalanceCard extends StatefulWidget {
  final String accountNumber;
  final String balance;

  const BalanceCard({
    super.key,
    required this.accountNumber,
    required this.balance,
  });

  @override
  State<BalanceCard> createState() => _BalanceCardState();
}

class _BalanceCardState extends State<BalanceCard> {
  bool _isBalanceVisible = true;

  void _toggleBalanceVisibility() {
    setState(() {
      _isBalanceVisible = !_isBalanceVisible;
    });
  }

  void _copyAccountNumber(BuildContext context) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(CupertinoIcons.checkmark_circle_fill, color: AppColors.accentGreen),
            const SizedBox(width: 10),
            Text(
              AppStrings.accountNumberCopied,
              style: AppTextStyles.textTheme.bodyMedium?.copyWith(color: Colors.white),
            ),
          ],
        ),
        backgroundColor: AppColors.primaryDark,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        duration: const Duration(seconds: 2),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [
            AppColors.primaryDark,
            AppColors.primary,
            AppColors.primaryLight,
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(22),
        boxShadow: const [
          BoxShadow(
            color: AppColors.shadow,
            blurRadius: 20,
            offset: Offset(0, 10),
          ),
        ],
      ),
      child: Stack(
        children: [
          // Aksen dekoratif melingkar di sudut kanan atas (Glassmorphism effect)
          Positioned(
            right: -30,
            top: -30,
            child: Container(
              width: 140,
              height: 140,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.white.withOpacity(0.06),
              ),
            ),
          ),
          Positioned(
            right: 40,
            bottom: -40,
            child: Container(
              width: 120,
              height: 120,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppColors.accentYellow.withOpacity(0.08),
              ),
            ),
          ),

          // Konten Kartu Saldo
          Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header Kartu: Label Nomor Rekening & Tombol Copy
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          AppStrings.accountNumberLabel.toUpperCase(),
                          style: AppTextStyles.textTheme.labelSmall?.copyWith(
                            color: AppColors.textOnPrimary.withOpacity(0.7),
                            letterSpacing: 1.2,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            Text(
                              widget.accountNumber,
                              style: AppTextStyles.textTheme.titleMedium?.copyWith(
                                color: AppColors.textOnPrimary,
                                fontWeight: FontWeight.w700,
                                letterSpacing: 1.5,
                              ),
                            ),
                            const SizedBox(width: 8),
                            InkWell(
                              onTap: () => _copyAccountNumber(context),
                              borderRadius: BorderRadius.circular(6),
                              child: Padding(
                                padding: const EdgeInsets.all(4.0),
                                child: Icon(
                                  CupertinoIcons.doc_on_clipboard,
                                  color: AppColors.accentYellow.withOpacity(0.9),
                                  size: 16,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ],
                ),

                const SizedBox(height: 24),
                Divider(color: Colors.white.withOpacity(0.12), height: 1),
                const SizedBox(height: 20),

                // Bagian Saldo & Eye Icon Toggle
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          AppStrings.accountBalanceLabel,
                          style: AppTextStyles.textTheme.bodyMedium?.copyWith(
                            color: AppColors.textOnPrimary.withOpacity(0.8),
                          ),
                        ),
                        const SizedBox(height: 6),
                        AnimatedSwitcher(
                          duration: const Duration(milliseconds: 250),
                          child: Text(
                            _isBalanceVisible ? widget.balance : AppStrings.hiddenBalance,
                            key: ValueKey<bool>(_isBalanceVisible),
                            style: _isBalanceVisible
                                ? AppTextStyles.balanceAmount
                                : AppTextStyles.balanceHidden,
                          ),
                        ),
                      ],
                    ),

                    // Eye Icon Button untuk Toggle Saldo
                    Material(
                      color: Colors.white.withOpacity(0.15),
                      shape: const CircleBorder(),
                      child: InkWell(
                        onTap: _toggleBalanceVisibility,
                        customBorder: const CircleBorder(),
                        child: Padding(
                          padding: const EdgeInsets.all(10.0),
                          child: Icon(
                            _isBalanceVisible
                                ? CupertinoIcons.eye_slash_fill
                                : CupertinoIcons.eye_fill,
                            color: AppColors.textOnPrimary,
                            size: 22,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
