import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import '../core/constants/colors.dart';
import '../core/constants/strings.dart';
import '../core/constants/text_styles.dart';
import '../widgets/biometric_modal.dart';
import '../widgets/custom_text_field.dart';
import 'main_screen.dart';

/// Screen 1: Login Screen
/// Tampilan utama masuk ke aplikasi Bank Kuningan (Material Design 3).
/// Memuat logo di tengah, input username murni, input PIN dengan show/hide toggle,
/// tombol utama Masuk, tombol Biometric Login, serta tautan Lupa PIN dan Bantuan.
class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final TextEditingController _usernameController = TextEditingController();
  final TextEditingController _pinController = TextEditingController();

  @override
  void dispose() {
    _usernameController.dispose();
    _pinController.dispose();
    super.dispose();
  }

  void _handleLogin() {
    // Validasi sederhana front-end
    if (_usernameController.text.trim().isEmpty || _pinController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              const Icon(CupertinoIcons.exclamationmark_triangle_fill, color: AppColors.accentYellow),
              const SizedBox(width: 10),
              Text(
                'Harap masukkan Username dan PIN Anda dengan lengkap',
                style: AppTextStyles.textTheme.bodyMedium?.copyWith(color: Colors.white),
              ),
            ],
          ),
          backgroundColor: AppColors.primaryDark,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        ),
      );
      return;
    }

    _navigateToDashboard();
  }

  void _navigateToDashboard() {
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (context) => const MainScreen()),
    );
  }

  void _showBiometricModal() {
    BiometricModal.show(context, onSuccess: _navigateToDashboard);
  }

  void _showInfoDialog(String title, String message) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text(title, style: AppTextStyles.textTheme.headlineMedium),
        content: Text(message, style: AppTextStyles.textTheme.bodyMedium),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Tutup'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 24),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 420),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  SizedBox(height: size.height * 0.02),

                  // Header Logo Bank Kuningan
                  RepaintBoundary(
                    child: Center(
                      child: Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: AppColors.surface,
                          borderRadius: BorderRadius.circular(24),
                          boxShadow: [
                            BoxShadow(
                              color: AppColors.primary.withOpacity(0.08),
                              blurRadius: 24,
                              offset: const Offset(0, 12),
                            ),
                          ],
                        ),
                        child: Image.asset(
                          'assets/images/bank-kuningan-logo.png',
                          height: 90,
                          cacheWidth: 300,
                          fit: BoxFit.contain,
                          errorBuilder: (context, error, stackTrace) => Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(
                                CupertinoIcons.building_2_fill,
                                color: AppColors.primary,
                                size: 56,
                              ),
                              const SizedBox(height: 8),
                              Text(
                                AppStrings.appName.toUpperCase(),
                                style: AppTextStyles.textTheme.titleLarge?.copyWith(
                                  color: AppColors.primary,
                                  fontWeight: FontWeight.w800,
                                  letterSpacing: 1.5,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 32),

                  // Teks Sambutan
                  Text(
                    AppStrings.loginTitle,
                    style: AppTextStyles.textTheme.headlineLarge?.copyWith(
                      color: AppColors.textPrimary,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 6),
                  Text(
                    AppStrings.loginSubtitle,
                    style: AppTextStyles.textTheme.bodyMedium?.copyWith(
                      color: AppColors.textSecondary,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 36),

                  // Form Kartu Login
                  RepaintBoundary(
                    child: Container(
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        color: AppColors.surface,
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(color: AppColors.border, width: 1),
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.shadow.withOpacity(0.06),
                            blurRadius: 20,
                            offset: const Offset(0, 8),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                        // Input Username (Strictly Username)
                        CustomTextField(
                          label: AppStrings.usernameLabel,
                          hint: AppStrings.usernameHint,
                          prefixIcon: CupertinoIcons.person_solid,
                          controller: _usernameController,
                          keyboardType: TextInputType.text,
                        ),
                        const SizedBox(height: 20),

                        // Input PIN (dengan Show/Hide Toggle)
                        CustomTextField(
                          label: AppStrings.pinLabel,
                          hint: AppStrings.pinHint,
                          prefixIcon: CupertinoIcons.lock_shield_fill,
                          isPassword: true,
                          controller: _pinController,
                          keyboardType: TextInputType.number,
                          maxLength: 6,
                        ),
                        const SizedBox(height: 28),

                        // Tombol Utama Masuk (Deep Blue)
                        ElevatedButton(
                          onPressed: _handleLogin,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.primary,
                            padding: const EdgeInsets.symmetric(vertical: 18),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16),
                            ),
                            elevation: 4,
                            shadowColor: AppColors.primary.withOpacity(0.3),
                          ),
                        child: const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              AppStrings.loginButton,
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w700,
                                letterSpacing: 0.5,
                              ),
                            ),
                            SizedBox(width: 8),
                            Icon(CupertinoIcons.arrow_right, size: 20),
                          ],
                        ),
                        ),
                      ],
                    ),
                  ),
                  ),
                  const SizedBox(height: 24),

                  // Tombol Biometric Login & Tautan Bantuan
                  Column(
                    children: [
                      // Tombol Biometric
                      Material(
                        color: Colors.transparent,
                        child: InkWell(
                          onTap: _showBiometricModal,
                          borderRadius: BorderRadius.circular(16),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                            decoration: BoxDecoration(
                              color: AppColors.primary.withOpacity(0.06),
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(
                                color: AppColors.primary.withOpacity(0.18),
                                width: 1.2,
                              ),
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(
                                  CupertinoIcons.viewfinder_circle_fill,
                                  color: AppColors.primary,
                                  size: 26,
                                ),
                                const SizedBox(width: 12),
                                Text(
                                  AppStrings.biometricLogin,
                                  style: AppTextStyles.textTheme.labelLarge?.copyWith(
                                    color: AppColors.primary,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 28),

                      // Tautan Lupa PIN? & Bantuan
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          TextButton(
                            onPressed: () => _showInfoDialog(
                              AppStrings.forgotPin,
                              'Silakan kunjungi kantor cabang Bank Kuningan terdekat dengan membawa KTP dan Buku Tabungan untuk melakukan reset PIN Anda.',
                            ),
                            child: const Text(AppStrings.forgotPin),
                          ),
                          Container(
                            margin: const EdgeInsets.symmetric(horizontal: 12),
                            width: 4,
                            height: 4,
                            decoration: const BoxDecoration(
                              color: AppColors.textHint,
                              shape: BoxShape.circle,
                            ),
                          ),
                          TextButton(
                            onPressed: () => _showInfoDialog(
                              AppStrings.help,
                              'Layanan Pelanggan Bank Kuningan aktif 24 Jam.\nHubungi Call Center: 1500-123 atau WA Resmi: 0811-2345-6789.',
                            ),
                            child: const Text(AppStrings.help),
                          ),
                        ],
                      ),
                    ],
                  ),
                  SizedBox(height: size.height * 0.02),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
