import 'package:flutter/material.dart';
import '../constants/colors.dart';
import '../constants/text_styles.dart';

/// Tema Utama Aplikasi Bank Kuningan (Material Design 3)
class AppTheme {
  AppTheme._();

  static ThemeData get lightTheme {
    final baseColorScheme = ColorScheme.fromSeed(
      seedColor: AppColors.primary,
      primary: AppColors.primary,
      onPrimary: AppColors.textOnPrimary,
      secondary: AppColors.accentYellow,
      onSecondary: AppColors.textOnYellow,
      tertiary: AppColors.accentGreen,
      error: AppColors.accentRed,
      surface: AppColors.surface,
      onSurface: AppColors.textPrimary,
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: baseColorScheme,
      scaffoldBackgroundColor: AppColors.background,
      textTheme: AppTextStyles.textTheme,

      // App Bar Theme
      appBarTheme: AppBarTheme(
        backgroundColor: AppColors.background,
        foregroundColor: AppColors.textPrimary,
        elevation: 0,
        centerTitle: false,
        titleTextStyle: AppTextStyles.textTheme.headlineMedium,
      ),

      // Card Theme
      cardTheme: CardThemeData(
        color: AppColors.surface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: AppColors.border, width: 1),
        ),
        margin: EdgeInsets.zero,
      ),

      // Elevated Button Theme (Tombol Utama)
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: AppColors.textOnPrimary,
          elevation: 0,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
          ),
          textStyle: AppTextStyles.textTheme.labelLarge?.copyWith(
            color: AppColors.textOnPrimary,
            fontSize: 16,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),

      // Outlined Button Theme
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.primary,
          side: const BorderSide(color: AppColors.primary, width: 1.5),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
          ),
          textStyle: AppTextStyles.textTheme.labelLarge?.copyWith(
            color: AppColors.primary,
            fontSize: 16,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),

      // Text Button Theme
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: AppColors.primary,
          textStyle: AppTextStyles.textTheme.labelLarge?.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
      ),

      // Input Decoration Theme (Text Field)
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.surface,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        hintStyle: AppTextStyles.textTheme.bodyMedium?.copyWith(
          color: AppColors.textHint,
        ),
        labelStyle: AppTextStyles.textTheme.bodyMedium?.copyWith(
          color: AppColors.textSecondary,
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: AppColors.border, width: 1.2),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: AppColors.border, width: 1.2),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: AppColors.primary, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: AppColors.accentRed, width: 1.2),
        ),
      ),

      // Navigation Bar Theme (Bottom Navigation)
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: AppColors.surface,
        indicatorColor: AppColors.primary.withOpacity(0.12),
        labelTextStyle: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return AppTextStyles.textTheme.labelMedium?.copyWith(
              color: AppColors.primary,
              fontWeight: FontWeight.w700,
            );
          }
          return AppTextStyles.textTheme.labelMedium?.copyWith(
            color: AppColors.textSecondary,
            fontWeight: FontWeight.w500,
          );
        }),
        iconTheme: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return const IconThemeData(color: AppColors.primary, size: 26);
          }
          return const IconThemeData(color: AppColors.textSecondary, size: 24);
        }),
      ),
    );
  }
}
