import 'dart:async';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import '../core/constants/colors.dart';
import '../core/constants/strings.dart';
import '../core/constants/text_styles.dart';

/// Bottom Sheet Simulasi Biometric Login (Sidik Jari / Face ID).
/// Memberikan efek animasi interaktif saat disentuh, kemudian mengarahkan ke halaman utama.
class BiometricModal extends StatefulWidget {
  final VoidCallback onSuccess;

  const BiometricModal({super.key, required this.onSuccess});

  static void show(BuildContext context, {required VoidCallback onSuccess}) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => BiometricModal(onSuccess: onSuccess),
    );
  }

  @override
  State<BiometricModal> createState() => _BiometricModalState();
}

class _BiometricModalState extends State<BiometricModal>
    with SingleTickerProviderStateMixin {
  late AnimationController _pulseController;
  late Animation<double> _pulseAnimation;
  bool _isVerifying = false;
  bool _isSuccess = false;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat(reverse: true);

    _pulseAnimation = Tween<double>(begin: 1.0, end: 1.15).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  void _triggerScan() {
    if (_isVerifying || _isSuccess) return;

    setState(() {
      _isVerifying = true;
    });

    Timer(const Duration(milliseconds: 1500), () {
      if (mounted) {
        setState(() {
          _isVerifying = false;
          _isSuccess = true;
        });

        Timer(const Duration(milliseconds: 800), () {
          if (mounted) {
            Navigator.pop(context);
            widget.onSuccess();
          }
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
      decoration: const BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(28),
          topRight: Radius.circular(28),
        ),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Handle indikator geser
          Container(
            width: 44,
            height: 5,
            decoration: BoxDecoration(
              color: AppColors.border,
              borderRadius: BorderRadius.circular(10),
            ),
          ),
          const SizedBox(height: 24),

          Text(
            AppStrings.biometricTitle,
            style: AppTextStyles.textTheme.headlineLarge?.copyWith(
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            AppStrings.biometricInstruction,
            textAlign: TextAlign.center,
            style: AppTextStyles.textTheme.bodyMedium?.copyWith(
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 36),

          // Sensor Sidik Jari Interaktif
          GestureDetector(
            onTap: _triggerScan,
            child: AnimatedBuilder(
              animation: _pulseAnimation,
              builder: (context, child) {
                return Transform.scale(
                  scale: _isVerifying ? 1.0 : _pulseAnimation.value,
                  child: Container(
                    width: 110,
                    height: 110,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: _isSuccess
                          ? AppColors.accentGreen.withOpacity(0.15)
                          : (_isVerifying
                              ? AppColors.accentYellow.withOpacity(0.2)
                              : AppColors.primary.withOpacity(0.08)),
                      border: Border.all(
                        color: _isSuccess
                            ? AppColors.accentGreen
                            : (_isVerifying
                                ? AppColors.accentYellow
                                : AppColors.primary),
                        width: 2.5,
                      ),
                      boxShadow: [
                        if (!_isSuccess)
                          BoxShadow(
                            color: AppColors.primary.withOpacity(0.12),
                            blurRadius: 20,
                            spreadRadius: 4,
                          ),
                      ],
                    ),
                    child: Icon(
                      _isSuccess
                          ? CupertinoIcons.checkmark_alt
                          : CupertinoIcons.viewfinder_circle_fill,
                      size: 56,
                      color: _isSuccess
                          ? AppColors.accentGreen
                          : (_isVerifying
                              ? AppColors.accentYellow
                              : AppColors.primary),
                    ),
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 24),

          // Status Teks
          Text(
            _isSuccess
                ? AppStrings.biometricSuccess
                : (_isVerifying
                    ? 'Membaca sidik jari...'
                    : 'Sentuh ikon di atas untuk memindai'),
            style: AppTextStyles.textTheme.titleMedium?.copyWith(
              color: _isSuccess
                  ? AppColors.accentGreen
                  : (_isVerifying ? AppColors.primary : AppColors.textSecondary),
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 36),

          // Tombol Batal
          SizedBox(
            width: double.infinity,
            child: OutlinedButton(
              onPressed: () => Navigator.pop(context),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: AppColors.border),
                foregroundColor: AppColors.textSecondary,
              ),
              child: const Text(AppStrings.biometricCancel),
            ),
          ),
          const SizedBox(height: 16),
        ],
      ),
    );
  }
}
