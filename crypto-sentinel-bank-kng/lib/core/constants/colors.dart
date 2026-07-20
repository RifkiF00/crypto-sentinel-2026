import 'package:flutter/material.dart';

/// Daftar warna konstanta untuk aplikasi Bank Kuningan (Material Design 3)
class AppColors {
  AppColors._();

  // Warna Utama (Sesuai Spesifikasi Bank Kuningan)
  static const Color primary = Color(0xFF003366);      // Deep Blue
  static const Color primaryDark = Color(0xFF001F3F);  // Lebih gelap untuk gradient & status bar
  static const Color primaryLight = Color(0xFF1A528A); // Lebih terang untuk aksen hover/card

  // Warna Aksen
  static const Color accentYellow = Color(0xFFFFCC00); // Golden Yellow
  static const Color accentGreen = Color(0xFF008000);  // Green (Untuk pemasukan/sukses)
  static const Color accentRed = Color(0xFFD32F2F);    // Red (Untuk pengeluaran/peringatan)

  // Latar Belakang & Permukaan (Background & Surface)
  static const Color background = Color(0xFFF8F9FA);   // Very light gray/blue
  static const Color surface = Color(0xFFFFFFFF);      // White card surface
  static const Color surfaceVariant = Color(0xFFEFF2F5); // Container secondary

  // Teks & Border
  static const Color textPrimary = Color(0xFF1E293B);  // Slate 800 - Teks utama
  static const Color textSecondary = Color(0xFF64748B);// Slate 500 - Teks sekunder
  static const Color textHint = Color(0xFF94A3B8);     // Slate 400 - Placeholder
  static const Color textOnPrimary = Color(0xFFFFFFFF);// Teks di atas latar Deep Blue
  static const Color textOnYellow = Color(0xFF003366); // Deep Blue di atas warna emas

  // Garis Batas & Pembatas
  static const Color border = Color(0xFFE2E8F0);       // Slate 200
  static const Color divider = Color(0xFFF1F5F9);      // Slate 100

  // Efek Bayangan & Kaca (Shadow & Glassmorphism)
  static const Color shadow = Color(0x14003366);       // Subtle Deep Blue Shadow
  static const Color glassWhite = Color(0x26FFFFFF);   // Transparansi putih pada kartu Deep Blue
}
