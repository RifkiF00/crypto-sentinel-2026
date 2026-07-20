import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import '../core/constants/strings.dart';

/// Model untuk Transaksi Rekening (Mutasi)
class TransactionModel {
  final String id;
  final String title;
  final String category;
  final String date;
  final String amount;
  final bool isIncoming;

  const TransactionModel({
    required this.id,
    required this.title,
    required this.category,
    required this.date,
    required this.amount,
    required this.isIncoming,
  });
}

/// Model untuk Aksi Cepat (Quick Actions Menu)
class QuickActionModel {
  final String id;
  final String title;
  final IconData icon;
  final String? badge;

  const QuickActionModel({
    required this.id,
    required this.title,
    required this.icon,
    this.badge,
  });
}

/// Penyedia Data Mock untuk Aplikasi Bank Kuningan
class MockData {
  MockData._();

  // Data Pengguna
  static const String userName = 'Budi Santoso';
  static const String accountNumber = '1234-5678-9012';
  static const String accountBalance = 'Rp 24.550.000';

  // Daftar 8 Aksi Cepat (Quick Actions Menu)
  static const List<QuickActionModel> quickActions = [
    QuickActionModel(
      id: 'transfer',
      title: AppStrings.menuTransfer,
      icon: CupertinoIcons.arrow_right_arrow_left,
    ),
    QuickActionModel(
      id: 'topup',
      title: AppStrings.menuTopUp,
      icon: CupertinoIcons.plus_circle_fill,
    ),
    QuickActionModel(
      id: 'payment',
      title: AppStrings.menuPayment,
      icon: CupertinoIcons.doc_text_fill,
    ),
    QuickActionModel(
      id: 'qris',
      title: AppStrings.menuQris,
      icon: CupertinoIcons.qrcode_viewfinder,
      badge: 'PROMO',
    ),
    QuickActionModel(
      id: 'withdraw',
      title: AppStrings.menuCashWithdraw,
      icon: CupertinoIcons.money_dollar_circle_fill,
    ),
    QuickActionModel(
      id: 'pulsa',
      title: AppStrings.menuPulseData,
      icon: CupertinoIcons.device_phone_portrait,
    ),
    QuickActionModel(
      id: 'ewallet',
      title: AppStrings.menuEWallet,
      icon: CupertinoIcons.creditcard_fill,
    ),
    QuickActionModel(
      id: 'more',
      title: AppStrings.menuMore,
      icon: CupertinoIcons.square_grid_2x2_fill,
    ),
  ];

  // Daftar 3 Transaksi Mutasi Terakhir (Sesuai Spesifikasi)
  static const List<TransactionModel> recentTransactions = [
    TransactionModel(
      id: 'tx_01',
      title: 'Transfer dari PT Maju Bersama',
      category: 'Gaji & Honorarium',
      date: 'Hari ini, 10:15 WIB',
      amount: '+ Rp 8.500.000',
      isIncoming: true,
    ),
    TransactionModel(
      id: 'tx_02',
      title: 'Pembayaran Listrik PLN',
      category: 'Tagihan & Pembayaran',
      date: 'Kemarin, 16:45 WIB',
      amount: '- Rp 450.000',
      isIncoming: false,
    ),
    TransactionModel(
      id: 'tx_03',
      title: 'Top Up Gopay / Gojek',
      category: 'Top Up E-Wallet',
      date: '18 Juli 2026, 14:20 WIB',
      amount: '- Rp 150.000',
      isIncoming: false,
    ),
  ];
}
