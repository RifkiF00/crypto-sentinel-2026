import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'colors.dart';

/// Tipografi resmi Bank Kuningan (Material Design 3)
/// Menggunakan font modern 'Plus Jakarta Sans' / 'Outfit' via GoogleFonts untuk kesan bersih, bergengsi, dan mudah dibaca.
class AppTextStyles {
  AppTextStyles._();

  static TextTheme get textTheme {
    final baseTheme = GoogleFonts.plusJakartaSansTextTheme();

    return baseTheme.copyWith(
      // Display & Headline - Untuk Judul Utama & Angka Saldo Besar
      displayLarge: GoogleFonts.plusJakartaSans(
        fontSize: 32,
        fontWeight: FontWeight.w800,
        color: AppColors.textPrimary,
        letterSpacing: -0.5,
      ),
      displayMedium: GoogleFonts.plusJakartaSans(
        fontSize: 28,
        fontWeight: FontWeight.w700,
        color: AppColors.textPrimary,
        letterSpacing: -0.5,
      ),
      headlineLarge: GoogleFonts.plusJakartaSans(
        fontSize: 24,
        fontWeight: FontWeight.w700,
        color: AppColors.textPrimary,
      ),
      headlineMedium: GoogleFonts.plusJakartaSans(
        fontSize: 20,
        fontWeight: FontWeight.w700,
        color: AppColors.textPrimary,
      ),
      headlineSmall: GoogleFonts.plusJakartaSans(
        fontSize: 18,
        fontWeight: FontWeight.w600,
        color: AppColors.textPrimary,
      ),

      // Title - Untuk Judul Bagian & Nama Kartu
      titleLarge: GoogleFonts.plusJakartaSans(
        fontSize: 16,
        fontWeight: FontWeight.w700,
        color: AppColors.textPrimary,
      ),
      titleMedium: GoogleFonts.plusJakartaSans(
        fontSize: 14,
        fontWeight: FontWeight.w600,
        color: AppColors.textPrimary,
      ),
      titleSmall: GoogleFonts.plusJakartaSans(
        fontSize: 13,
        fontWeight: FontWeight.w600,
        color: AppColors.textSecondary,
      ),

      // Body - Untuk Teks Umum & Deskripsi
      bodyLarge: GoogleFonts.plusJakartaSans(
        fontSize: 16,
        fontWeight: FontWeight.w400,
        color: AppColors.textPrimary,
      ),
      bodyMedium: GoogleFonts.plusJakartaSans(
        fontSize: 14,
        fontWeight: FontWeight.w400,
        color: AppColors.textPrimary,
      ),
      bodySmall: GoogleFonts.plusJakartaSans(
        fontSize: 12,
        fontWeight: FontWeight.w400,
        color: AppColors.textSecondary,
      ),

      // Label - Untuk Tombol, Menu Aksi Cepat, & Tag
      labelLarge: GoogleFonts.plusJakartaSans(
        fontSize: 14,
        fontWeight: FontWeight.w600,
        color: AppColors.textPrimary,
      ),
      labelMedium: GoogleFonts.plusJakartaSans(
        fontSize: 12,
        fontWeight: FontWeight.w600,
        color: AppColors.textPrimary,
      ),
      labelSmall: GoogleFonts.plusJakartaSans(
        fontSize: 11,
        fontWeight: FontWeight.w500,
        color: AppColors.textSecondary,
      ),
    );
  }

  // Khusus untuk angka nominal saldo agar monospaced & premium
  static TextStyle get balanceAmount => GoogleFonts.plusJakartaSans(
        fontSize: 26,
        fontWeight: FontWeight.w800,
        color: AppColors.textOnPrimary,
        letterSpacing: -0.3,
      );

  static TextStyle get balanceHidden => GoogleFonts.plusJakartaSans(
        fontSize: 26,
        fontWeight: FontWeight.w800,
        color: AppColors.textOnPrimary,
        letterSpacing: 2.0,
      );
}
