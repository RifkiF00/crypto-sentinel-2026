import 'package:flutter/material.dart';

/// Palet warna resmi Bank bjb (Material Design 3)
class AppColors {
  AppColors._();

  // Warna Utama Bank bjb
  static const Color primary = Color(0xFF004F9F);      // Deep Royal Blue bjb
  static const Color primaryDark = Color(0xFF0B3B7B);  // Dark Blue untuk Gradient & Status Bar
  static const Color primaryLight = Color(0xFF1E6FD9); // Royal Blue Highlight

  // Warna Aksen Bank bjb
  static const Color accentSky = Color(0xFF00A3E0);    // Sky Blue bjb
  static const Color accentGold = Color(0xFFFDB913);   // Kuning / Gold Aksen bjb
  static const Color accentYellow = Color(0xFFFFC72C); // Warm Gold
  static const Color accentGreen = Color(0xFF10B981);  // Pemasukan / Berhasil
  static const Color accentRed = Color(0xFFEF4444);    // Pengeluaran / Error

  // Latar Belakang & Permukaan (Background & Surface)
  static const Color background = Color(0xFFF8FAFC);   // Off-White Slate
  static const Color surface = Color(0xFFFFFFFF);      // White card surface
  static const Color surfaceVariant = Color(0xFFF1F5F9); // Container subtle

  // Teks & Keterangan
  static const Color textPrimary = Color(0xFF0F172A);  // Slate 900 - Teks utama
  static const Color textSecondary = Color(0xFF64748B);// Slate 500 - Teks sekunder
  static const Color textHint = Color(0xFF94A3B8);     // Slate 400 - Placeholder
  static const Color textOnPrimary = Color(0xFFFFFFFF);// Teks di atas warna utama
  static const Color textOnGold = Color(0xFF0B3B7B);   // Deep Blue di atas aksen gold

  // Garis Batas & Pembatas
  static const Color border = Color(0xFFE2E8F0);       // Slate 200
  static const Color divider = Color(0xFFF1F5F9);      // Slate 100

  // Efek Bayangan & Kaca (Shadow & Glassmorphism)
  static const Color shadow = Color(0x12004F9F);       // Subtle Royal Blue Shadow
  static const Color glassWhite = Color(0x26FFFFFF);   // Transparansi putih di atas gradient bjb
}
