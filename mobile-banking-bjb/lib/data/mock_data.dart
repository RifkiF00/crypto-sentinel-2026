import 'package:flutter/cupertino.dart';
import '../core/constants/strings.dart';

/// Model Transaksi Rekening (Mutasi)
class TransactionModel {
  final String id;
  final String title;
  final String category;
  final String date;
  final String amount;
  final bool isIncoming;
  final String status;
  final String refNumber;

  const TransactionModel({
    required this.id,
    required this.title,
    required this.category,
    required this.date,
    required this.amount,
    required this.isIncoming,
    this.status = 'BERHASIL',
    this.refNumber = 'REF-BJB-2026',
  });
}

/// Model Aksi Cepat Dashboard
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

/// Model Bank Tujuan Transfer
class BankDestination {
  final String code;
  final String name;
  final String alias;
  final bool isBjb;
  final int adminFee;

  const BankDestination({
    required this.code,
    required this.name,
    required this.alias,
    this.isBjb = false,
    this.adminFee = 2500,
  });
}

/// Penyedia Data Mock untuk bjb DIGI Mobile Banking
class MockData {
  MockData._();

  // Data Profil Nasabah
  static const String userName = 'Billy Jonathan';
  static const String userPhone = '+62 812-3456-7890';
  static const String userEmail = 'billy.jonathan@bankbjb.co.id';
  static const String accountNumber = '0012-3456-7890';
  static const String accountType = 'bjb Tandamata Utama';
  static const String accountBalance = 'Rp 24.550.000';
  static const int balanceValue = 24550000;

  // 8 Layanan Cepat di Beranda
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

  // 3 Mutasi Terakhir (Dashboard)
  static const List<TransactionModel> recentTransactions = [
    TransactionModel(
      id: 'TX-BJB-01',
      title: 'Transfer Masuk Honorarium PIDI',
      category: 'Transfer Masuk',
      date: 'Hari ini, 10:15 WIB',
      amount: '+ Rp 8.500.000',
      isIncoming: true,
      refNumber: 'REF20260823001',
    ),
    TransactionModel(
      id: 'TX-BJB-02',
      title: 'Pembayaran Tagihan PLN Pascabayar',
      category: 'Tagihan & Utilitas',
      date: 'Kemarin, 16:45 WIB',
      amount: '- Rp 450.000',
      isIncoming: false,
      refNumber: 'REF20260822002',
    ),
    TransactionModel(
      id: 'TX-BJB-03',
      title: 'Top Up Gopay Saldo Customer',
      category: 'Top Up E-Wallet',
      date: '18 Agu 2026, 14:20 WIB',
      amount: '- Rp 150.000',
      isIncoming: false,
      refNumber: 'REF20260818003',
    ),
  ];

  // Riwayat Mutasi Lengkap
  static const List<TransactionModel> fullHistory = [
    TransactionModel(
      id: 'TX-BJB-01',
      title: 'Transfer Masuk Honorarium PIDI',
      category: 'Transfer Masuk',
      date: '23 Agu 2026, 10:15 WIB',
      amount: '+ Rp 8.500.000',
      isIncoming: true,
      refNumber: 'REF20260823001',
    ),
    TransactionModel(
      id: 'TX-BJB-02',
      title: 'Pembayaran Tagihan PLN Pascabayar',
      category: 'Tagihan & Utilitas',
      date: '22 Agu 2026, 16:45 WIB',
      amount: '- Rp 450.000',
      isIncoming: false,
      refNumber: 'REF20260822002',
    ),
    TransactionModel(
      id: 'TX-BJB-03',
      title: 'Top Up Gopay Saldo Customer',
      category: 'Top Up E-Wallet',
      date: '18 Agu 2026, 14:20 WIB',
      amount: '- Rp 150.000',
      isIncoming: false,
      refNumber: 'REF20260818003',
    ),
    TransactionModel(
      id: 'TX-BJB-04',
      title: 'Transfer Antar-Bank via RTOL APEX bjb',
      category: 'Transfer Keluar',
      date: '15 Agu 2026, 09:30 WIB',
      amount: '- Rp 1.200.000',
      isIncoming: false,
      refNumber: 'REF20260815004',
    ),
    TransactionModel(
      id: 'TX-BJB-05',
      title: 'Pembayaran PBB Jawa Barat',
      category: 'Pajak Daerah',
      date: '12 Agu 2026, 11:00 WIB',
      amount: '- Rp 320.000',
      isIncoming: false,
      refNumber: 'REF20260812005',
    ),
    TransactionModel(
      id: 'TX-BJB-06',
      title: 'Transfer Masuk Payroll Bank bjb',
      category: 'Transfer Masuk',
      date: '01 Agu 2026, 08:00 WIB',
      amount: '+ Rp 18.000.000',
      isIncoming: true,
      refNumber: 'REF20260801006',
    ),
  ];

  // Daftar Bank Tujuan
  static const List<BankDestination> bankList = [
    BankDestination(
      code: '110',
      name: 'Bank bjb (PT Bank Pembangunan Daerah Jawa Barat dan Banten)',
      alias: 'Bank bjb',
      isBjb: true,
      adminFee: 0,
    ),
    BankDestination(
      code: '014',
      name: 'BCA (Bank Central Asia)',
      alias: 'BCA',
      adminFee: 2500,
    ),
    BankDestination(
      code: '008',
      name: 'Bank Mandiri',
      alias: 'Mandiri',
      adminFee: 2500,
    ),
    BankDestination(
      code: '002',
      name: 'BRI (Bank Rakyat Indonesia)',
      alias: 'BRI',
      adminFee: 2500,
    ),
    BankDestination(
      code: '009',
      name: 'BNI (Bank Negara Indonesia)',
      alias: 'BNI',
      adminFee: 2500,
    ),
    BankDestination(
      code: '022',
      name: 'CIMB Niaga',
      alias: 'CIMB',
      adminFee: 2500,
    ),
    BankDestination(
      code: '013',
      name: 'Bank Permata',
      alias: 'Permata',
      adminFee: 2500,
    ),
    BankDestination(
      code: '451',
      name: 'BSI (Bank Syariah Indonesia)',
      alias: 'BSI',
      adminFee: 2500,
    ),
  ];
}
