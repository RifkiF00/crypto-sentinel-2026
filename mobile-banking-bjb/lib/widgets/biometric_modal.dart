import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../core/constants/colors.dart';
import '../core/constants/strings.dart';

/// Modal Simulasi Biometrik (Fingerprint & Face ID) dengan Animasi Pulse
class BiometricModal extends StatefulWidget {
  final VoidCallback onSuccess;

  const BiometricModal({super.key, required this.onSuccess});

  static Future<void> show(BuildContext context, {required VoidCallback onSuccess}) {
    return showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) => BiometricModal(onSuccess: onSuccess),
    );
  }

  @override
  State<BiometricModal> createState() => _BiometricModalState();
}

class _BiometricModalState extends State<BiometricModal>
    with SingleTickerProviderStateMixin {
  late AnimationController _animController;
  late Animation<double> _scaleAnimation;
  bool _isAuthenticating = false;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1000),
    )..repeat(reverse: true);

    _scaleAnimation = Tween<double>(begin: 0.95, end: 1.08).animate(
      CurvedAnimation(parent: _animController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  void _authenticate() async {
    setState(() => _isAuthenticating = true);
    HapticFeedback.mediumImpact();

    await Future.delayed(const Duration(milliseconds: 900));

    if (!mounted) return;
    Navigator.pop(context);
    widget.onSuccess();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
      child: SafeArea(
        top: false,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: AppColors.border,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(height: 20),

            const Text(
              AppStrings.biometricPrompt,
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              AppStrings.biometricDesc,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 13,
                color: AppColors.textSecondary,
                height: 1.4,
              ),
            ),
            const SizedBox(height: 32),

            // Lingkaran Animasi Sensor Sidik Jari
            GestureDetector(
              onTap: _authenticate,
              child: AnimatedBuilder(
                animation: _scaleAnimation,
                builder: (context, child) {
                  return Transform.scale(
                    scale: _scaleAnimation.value,
                    child: Container(
                      width: 90,
                      height: 90,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: _isAuthenticating
                            ? AppColors.accentGreen.withOpacity(0.15)
                            : AppColors.primary.withOpacity(0.1),
                        border: Border.all(
                          color: _isAuthenticating
                              ? AppColors.accentGreen
                              : AppColors.primary,
                          width: 2.5,
                        ),
                      ),
                      child: Icon(
                        _isAuthenticating
                            ? Icons.check_circle_rounded
                            : Icons.fingerprint,
                        size: 52,
                        color: _isAuthenticating
                            ? AppColors.accentGreen
                            : AppColors.primary,
                      ),
                    ),
                  );
                },
              ),
            ),

            const SizedBox(height: 24),

            Text(
              _isAuthenticating
                  ? 'Sidik Jari Terverifikasi...'
                  : 'Sentuh sensor sidik jari untuk login',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: _isAuthenticating ? AppColors.accentGreen : AppColors.primary,
              ),
            ),

            const SizedBox(height: 24),

            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text(
                'Gunakan PIN Saja',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textSecondary,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
