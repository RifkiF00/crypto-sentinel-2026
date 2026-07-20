import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import '../core/constants/colors.dart';
import '../core/constants/strings.dart';
import '../core/constants/text_styles.dart';
import '../data/mock_data.dart';
import '../widgets/balance_card.dart';
import '../widgets/quick_action_button.dart';
import '../widgets/transaction_item.dart';
import 'menus/transfer_screen.dart';
import 'menus/topup_screen.dart';
import 'menus/payment_screen.dart';
import 'menus/qris_screen.dart';
import 'menus/withdraw_screen.dart';
import 'menus/pulse_data_screen.dart';
import 'menus/ewallet_screen.dart';
import 'menus/more_menu_screen.dart';

/// Screen 2: Home Screen (Dashboard)
/// Menampilkan sapaan pengguna, notifikasi, BalanceCard eksklusif bergradasi Deep Blue,
/// grid aksi cepat (Transfer, Top Up, Pembayaran, QRIS, dll), serta daftar mutasi terbaru.
class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  String _getDynamicGreeting() {
    final hour = DateTime.now().hour;
    if (hour >= 4 && hour < 11) {
      return 'Selamat Pagi, 👋';
    } else if (hour >= 11 && hour < 15) {
      return 'Selamat Siang, 🌤️';
    } else if (hour >= 15 && hour < 19) {
      return 'Selamat Sore, 🌅';
    } else {
      return 'Selamat Malam, 🌙';
    }
  }

  void _onQuickActionTapped(BuildContext context, String actionId, String title) {
    Widget? targetScreen;
    switch (actionId) {
      case 'transfer':
        targetScreen = const TransferScreen();
        break;
      case 'topup':
        targetScreen = const TopUpScreen();
        break;
      case 'pay':
        targetScreen = const PaymentScreen();
        break;
      case 'qris':
        targetScreen = const QrisScreen();
        break;
      case 'withdraw':
        targetScreen = const WithdrawScreen();
        break;
      case 'pulse':
        targetScreen = const PulseDataScreen();
        break;
      case 'wallet':
        targetScreen = const EWalletScreen();
        break;
      case 'more':
        targetScreen = const MoreMenuScreen();
        break;
    }

    if (targetScreen != null) {
      Navigator.push(context, MaterialPageRoute(builder: (context) => targetScreen!));
    }
  }

  void _showActionFeedback(BuildContext context, String actionName) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(CupertinoIcons.info_circle_fill, color: AppColors.accentYellow),
            const SizedBox(width: 10),
            Text(
              'Membuka menu $actionName...',
              style: AppTextStyles.textTheme.bodyMedium?.copyWith(color: Colors.white),
            ),
          ],
        ),
        backgroundColor: AppColors.primaryDark,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        duration: const Duration(milliseconds: 1500),
      ),
    );
  }

  void _showNotifications(BuildContext context) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      backgroundColor: AppColors.surface,
      builder: (context) => Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Notifikasi Baru',
                  style: AppTextStyles.textTheme.headlineMedium,
                ),
                IconButton(
                  icon: const Icon(CupertinoIcons.clear_circled_solid, color: AppColors.textSecondary),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Material(
              color: Colors.transparent,
              child: ListTile(
                contentPadding: EdgeInsets.zero,
                leading: Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: AppColors.accentYellow.withOpacity(0.2),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(CupertinoIcons.bell_fill, color: AppColors.primaryDark),
                ),
                title: Text('Promo Spesial QRIS', style: AppTextStyles.textTheme.titleMedium),
                subtitle: Text('Dapatkan cashback hingga Rp 50.000 untuk transaksi QRIS hari ini!', style: AppTextStyles.textTheme.bodySmall),
              ),
            ),
            const Divider(),
            Material(
              color: Colors.transparent,
              child: ListTile(
                contentPadding: EdgeInsets.zero,
                leading: Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: AppColors.accentGreen.withOpacity(0.15),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(CupertinoIcons.checkmark_shield_fill, color: AppColors.accentGreen),
                ),
                title: Text('Keamanan Akun Terjaga', style: AppTextStyles.textTheme.titleMedium),
                subtitle: Text('PIN Anda berhasil diverifikasi pada login sesi ini.', style: AppTextStyles.textTheme.bodySmall),
              ),
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: RefreshIndicator(
          color: AppColors.primary,
          onRefresh: () async {
            await Future.delayed(const Duration(milliseconds: 800));
          },
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header: Greeting Pengguna & Tombol Lonceng Notifikasi
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        // Avatar Pengguna
                        Container(
                          width: 48,
                          height: 48,
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [AppColors.primary, AppColors.primaryLight],
                            ),
                            shape: BoxShape.circle,
                            border: Border.all(color: AppColors.accentYellow, width: 2),
                          ),
                          child: const Center(
                            child: Text(
                              'BS',
                              style: TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.w800,
                                fontSize: 16,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 14),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              _getDynamicGreeting(),
                              style: AppTextStyles.textTheme.labelMedium?.copyWith(
                                color: AppColors.textSecondary,
                                fontWeight: FontWeight.w600,
                                fontSize: 13,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              MockData.userName,
                              style: AppTextStyles.textTheme.headlineMedium?.copyWith(
                                color: AppColors.textPrimary,
                                fontWeight: FontWeight.w800,
                                fontSize: 18,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),

                    // Lonceng Notifikasi dengan Badge Merah
                    Stack(
                      children: [
                        Material(
                          color: AppColors.surface,
                          shape: const CircleBorder(),
                          child: InkWell(
                            onTap: () => _showNotifications(context),
                            customBorder: const CircleBorder(),
                            child: Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                border: Border.all(color: AppColors.border, width: 1),
                              ),
                              child: const Icon(
                                CupertinoIcons.bell_fill,
                                color: AppColors.primaryDark,
                                size: 24,
                              ),
                            ),
                          ),
                        ),
                        Positioned(
                          right: 8,
                          top: 8,
                          child: Container(
                            width: 11,
                            height: 11,
                            decoration: BoxDecoration(
                              color: AppColors.accentRed,
                              shape: BoxShape.circle,
                              border: Border.all(color: AppColors.surface, width: 2),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 18),

                // Banner Spesial 1 Kotak: Eksklusif & Elegan (Bank Kuningan + Kompetisi Hackathon)
                Container(
                  width: double.infinity,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [
                        Color(0xFF0C2652), // Deep Royal Navy
                        Color(0xFF144492), // Sapphire Blue
                        Color(0xFF1B53B8), // Vibrant Blue
                      ],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      stops: [0.0, 0.6, 1.0],
                    ),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: AppColors.accentYellow.withOpacity(0.7), width: 1.5),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF0C2652).withOpacity(0.25),
                        blurRadius: 16,
                        offset: const Offset(0, 6),
                      ),
                    ],
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(20),
                    child: Stack(
                      children: [
                        // Aksen dekoratif melingkar bercahaya di latar belakang
                        Positioned(
                          right: -25,
                          top: -25,
                          child: Container(
                            width: 110,
                            height: 110,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              gradient: RadialGradient(
                                colors: [
                                  AppColors.accentYellow.withOpacity(0.25),
                                  Colors.transparent,
                                ],
                              ),
                            ),
                          ),
                        ),
                        Positioned(
                          right: 40,
                          bottom: -30,
                          child: Container(
                            width: 90,
                            height: 90,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: Colors.white.withOpacity(0.04),
                            ),
                          ),
                        ),

                        // Konten Utama Banner
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                          child: Row(
                            children: [
                              // Pojok Kiri: Wadah Logo Bank Kuningan yang Elegan
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(10),
                                  border: Border.all(color: AppColors.accentYellow.withOpacity(0.4), width: 1),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.black.withOpacity(0.12),
                                      blurRadius: 6,
                                      offset: const Offset(0, 2),
                                    ),
                                  ],
                                ),
                                child: Image.asset(
                                  'assets/images/bank-kuningan-logo.png',
                                  height: 26,
                                  fit: BoxFit.contain,
                                ),
                              ),
                              const SizedBox(width: 14),

                              // Sebelah Kanan: Informasi Kompetisi dengan Tipografi Modern
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Row(
                                      children: [
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2.5),
                                          decoration: BoxDecoration(
                                            color: AppColors.accentYellow,
                                            borderRadius: BorderRadius.circular(5),
                                            boxShadow: [
                                              BoxShadow(color: AppColors.accentYellow.withOpacity(0.4), blurRadius: 4),
                                            ],
                                          ),
                                          child: Row(
                                            mainAxisSize: MainAxisSize.min,
                                            children: [
                                              const Icon(CupertinoIcons.rosette, color: AppColors.primaryDark, size: 11),
                                              const SizedBox(width: 4),
                                              Text(
                                                'KOMPETISI',
                                                style: AppTextStyles.textTheme.labelSmall?.copyWith(
                                                  color: AppColors.primaryDark,
                                                  fontWeight: FontWeight.w900,
                                                  fontSize: 8.5,
                                                  letterSpacing: 0.6,
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                        const SizedBox(width: 6),
                                        Text(
                                          '• OFFICIAL ENTRY',
                                          style: AppTextStyles.textTheme.labelSmall?.copyWith(
                                            color: AppColors.accentYellow,
                                            fontWeight: FontWeight.w800,
                                            fontSize: 8.5,
                                            letterSpacing: 0.5,
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 5),
                                    Text(
                                      'PIDI DIGDAYA x Hackathon',
                                      style: AppTextStyles.textTheme.titleSmall?.copyWith(
                                        color: Colors.white,
                                        fontWeight: FontWeight.w800,
                                        fontSize: 14,
                                        letterSpacing: 0.3,
                                      ),
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                    const SizedBox(height: 2),
                                    Row(
                                      children: [
                                        Expanded(
                                          child: Text(
                                            'Karya Inovasi Digital untuk Kompetisi',
                                            style: AppTextStyles.textTheme.bodySmall?.copyWith(
                                              color: Colors.white.withOpacity(0.88),
                                              fontSize: 11,
                                            ),
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                        ),
                                        const Icon(
                                          CupertinoIcons.sparkles,
                                          color: AppColors.accentYellow,
                                          size: 14,
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 18),

                // Balance Card (Kartu Saldo Deep Blue)
                const BalanceCard(
                  accountNumber: MockData.accountNumber,
                  balance: MockData.accountBalance,
                ),
                const SizedBox(height: 32),

                // Quick Actions Menu (8 Menu Aksi Cepat)
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Menu Layanan',
                      style: AppTextStyles.textTheme.titleLarge,
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withOpacity(0.08),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        'Cepat & Praktis',
                        style: AppTextStyles.textTheme.labelSmall?.copyWith(
                          color: AppColors.primary,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                GridView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 4,
                    mainAxisSpacing: 18,
                    crossAxisSpacing: 12,
                    childAspectRatio: 0.85,
                  ),
                  itemCount: MockData.quickActions.length,
                  itemBuilder: (context, index) {
                    final action = MockData.quickActions[index];
                    return QuickActionButton(
                      title: action.title,
                      icon: action.icon,
                      badgeText: action.badge,
                      onTap: () => _onQuickActionTapped(context, action.id, action.title),
                    );
                  },
                ),
                const SizedBox(height: 28),

                // Recent Transactions (Daftar Mutasi Terakhir)
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      AppStrings.recentTransactionsTitle,
                      style: AppTextStyles.textTheme.titleLarge,
                    ),
                    TextButton(
                      onPressed: () => _showActionFeedback(context, AppStrings.viewAll),
                      child: const Row(
                        children: [
                          Text(AppStrings.viewAll),
                          SizedBox(width: 4),
                          Icon(CupertinoIcons.chevron_right, size: 14),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),

                ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: MockData.recentTransactions.length,
                  itemBuilder: (context, index) {
                    final tx = MockData.recentTransactions[index];
                    return TransactionItem(
                      title: tx.title,
                      category: tx.category,
                      date: tx.date,
                      amount: tx.amount,
                      isIncoming: tx.isIncoming,
                    );
                  },
                ),
                const SizedBox(height: 24),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
