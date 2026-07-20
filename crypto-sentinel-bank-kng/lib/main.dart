import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'core/constants/colors.dart';
import 'core/constants/strings.dart';
import 'core/theme/app_theme.dart';
import 'screens/login_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();

  // Atur orientasi potret dan gaya status bar agar selaras dengan desain Deep Blue
  SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
      systemNavigationBarColor: AppColors.surface,
      systemNavigationBarIconBrightness: Brightness.dark,
    ),
  );

  runApp(const BankKuninganApp());
}

/// Entry point untuk Aplikasi Bank Kuningan (Material Design 3)
class BankKuninganApp extends StatelessWidget {
  const BankKuninganApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: AppStrings.appName,
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      home: const LoginScreen(),
    );
  }
}
