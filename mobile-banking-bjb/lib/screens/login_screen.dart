import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../core/constants/colors.dart';
import '../core/constants/strings.dart';
import '../widgets/biometric_modal.dart';
import '../widgets/custom_text_field.dart';
import 'main_screen.dart';

/// Layar Login bjb DIGI Mobile Banking
class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _usernameController = TextEditingController(text: 'billy.jonathan');
  final _pinController = TextEditingController(text: '123456');
  bool _isLoading = false;

  @override
  void dispose() {
    _usernameController.dispose();
    _pinController.dispose();
    super.dispose();
  }

  void _onLogin() async {
    FocusScope.of(context).unfocus();
    final username = _usernameController.text.trim();
    final pin = _pinController.text.trim();

    if (username.isEmpty || pin.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Username dan PIN wajib diisi')),
      );
      return;
    }

    setState(() => _isLoading = true);
    HapticFeedback.mediumImpact();

    await Future.delayed(const Duration(milliseconds: 700));

    if (!mounted) return;
    setState(() => _isLoading = false);

    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (context) => const MainScreen()),
    );
  }

  void _onBiometricLogin() {
    BiometricModal.show(
      context,
      onSuccess: () {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (context) => const MainScreen()),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                // Logo & Emblem Bank bjb
                Image.asset(
                  'assets/images/bjb-logo.png',
                  height: 52,
                  errorBuilder: (_, __, ___) => Container(
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                    decoration: BoxDecoration(
                      color: AppColors.primary,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Text(
                      'bank bjb',
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w900,
                        color: Colors.white,
                        letterSpacing: 1.0,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 12),

                // Subtitle DIGI bjb
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                  decoration: BoxDecoration(
                    color: AppColors.accentGold.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Text(
                    'DIGI MOBILE BANKING',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w800,
                      color: AppColors.primaryDark,
                      letterSpacing: 1.2,
                    ),
                  ),
                ),

                const SizedBox(height: 32),

                // Card Form Login
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: AppColors.border),
                    boxShadow: const [
                      BoxShadow(
                        color: AppColors.shadow,
                        blurRadius: 16,
                        offset: Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        AppStrings.loginTitle,
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 4),
                      const Text(
                        AppStrings.loginSubtitle,
                        style: TextStyle(
                          fontSize: 12,
                          color: AppColors.textSecondary,
                          height: 1.4,
                        ),
                      ),
                      const SizedBox(height: 20),

                      // Input Username
                      CustomTextField(
                        controller: _usernameController,
                        label: AppStrings.usernameLabel,
                        hint: AppStrings.usernameHint,
                        prefixIcon: const Icon(Icons.person_outline_rounded, color: AppColors.primary, size: 20),
                      ),
                      const SizedBox(height: 16),

                      // Input PIN 6 Digit
                      CustomTextField(
                        controller: _pinController,
                        label: AppStrings.pinLabel,
                        hint: AppStrings.pinHint,
                        isPassword: true,
                        keyboardType: TextInputType.number,
                        prefixIcon: const Icon(Icons.lock_outline_rounded, color: AppColors.primary, size: 20),
                      ),

                      const SizedBox(height: 12),

                      // Lupa PIN
                      Align(
                        alignment: Alignment.centerRight,
                        child: TextButton(
                          onPressed: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Silakan hubungi bjb Call 14049 untuk reset PIN.')),
                            );
                          },
                          style: TextButton.styleFrom(padding: EdgeInsets.zero),
                          child: const Text(
                            AppStrings.forgotPin,
                            style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.primary),
                          ),
                        ),
                      ),

                      const SizedBox(height: 16),

                      // Tombol Masuk Utama
                      ElevatedButton(
                        onPressed: _isLoading ? null : _onLogin,
                        child: _isLoading
                            ? const SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5),
                              )
                            : const Text(AppStrings.loginButton),
                      ),

                      const SizedBox(height: 12),

                      // Tombol Login Biometrik
                      OutlinedButton.icon(
                        onPressed: _onBiometricLogin,
                        icon: const Icon(Icons.fingerprint, color: AppColors.primary, size: 22),
                        label: const Text('Login dengan Sidik Jari'),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 24),

                // Footer Proteksi Keamanan
                const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.verified_user_rounded, color: AppColors.accentGreen, size: 16),
                    SizedBox(width: 6),
                    Text(
                      AppStrings.fdsProtected,
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w500,
                        color: AppColors.textSecondary,
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
}
