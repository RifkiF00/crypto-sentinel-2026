import 'package:flutter/material.dart';
import '../core/constants/colors.dart';
import '../core/constants/strings.dart';
import '../data/api_service.dart';
import '../data/mock_data.dart';
import '../widgets/balance_card.dart';
import '../widgets/quick_action_button.dart';
import '../widgets/transaction_item.dart';
import 'menus/ewallet_screen.dart';
import 'menus/more_menu_screen.dart';
import 'menus/payment_screen.dart';
import 'menus/pulse_data_screen.dart';
import 'menus/qris_screen.dart';
import 'menus/receipt_screen.dart';
import 'menus/topup_screen.dart';
import 'menus/transfer_screen.dart';
import 'menus/withdraw_screen.dart';

/// Dashboard Beranda bjb DIGI Mobile Banking
class HomeScreen extends StatefulWidget {
  final ValueChanged<int>? onNavigateTab;

  const HomeScreen({super.key, this.onNavigateTab});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  // === Live data state ===
  static const String _bjbAccountId = '1234567890'; // Billy Jonathan di DB
  String _userName = MockData.userName;
  String _accountBalance = MockData.accountBalance;
  bool _isLoadingAccount = true;
  bool _isLoadingTx = true;
  List<Map<String, dynamic>> _liveTxList = [];

  @override
  void initState() {
    super.initState();
    _fetchLiveData();
  }

  Future<void> _fetchLiveData() async {
    // Fetch saldo & nama akun
    final accountInfo = await BjbApiService.getAccountInfo(_bjbAccountId);
    if (mounted) {
      setState(() {
        _userName = accountInfo['ownerName'] ?? MockData.userName;
        final bal = accountInfo['balance'];
        if (bal != null) {
          final formatted = bal.toString().replaceAllMapped(
            RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
            (m) => '${m[1]}.',
          );
          _accountBalance = 'Rp $formatted';
        }
        _isLoadingAccount = false;
      });
    }

    // Fetch riwayat transaksi live dari DB
    final txList = await BjbApiService.getTransactions(
      accountId: _bjbAccountId,
      limit: 10,
    );
    if (mounted) {
      setState(() {
        _liveTxList = txList;
        _isLoadingTx = false;
      });
    }
  }

  String _getGreeting() {
    final hour = DateTime.now().hour;
    if (hour >= 5 && hour < 11) return AppStrings.greetingMorning;
    if (hour >= 11 && hour < 15) return AppStrings.greetingAfternoon;
    if (hour >= 15 && hour < 18) return AppStrings.greetingEvening;
    return AppStrings.greetingNight;
  }

  void _onQuickActionTapped(String id) {
    switch (id) {
      case 'transfer':
        Navigator.push(context, MaterialPageRoute(builder: (_) => const TransferScreen()));
        break;
      case 'topup':
        Navigator.push(context, MaterialPageRoute(builder: (_) => const TopUpScreen()));
        break;
      case 'payment':
        Navigator.push(context, MaterialPageRoute(builder: (_) => const PaymentScreen()));
        break;
      case 'qris':
        Navigator.push(context, MaterialPageRoute(builder: (_) => const QrisScreen()));
        break;
      case 'withdraw':
        Navigator.push(context, MaterialPageRoute(builder: (_) => const WithdrawScreen()));
        break;
      case 'pulsa':
        Navigator.push(context, MaterialPageRoute(builder: (_) => const PulseDataScreen()));
        break;
      case 'ewallet':
        Navigator.push(context, MaterialPageRoute(builder: (_) => const EWalletScreen()));
        break;
      case 'more':
        Navigator.push(context, MaterialPageRoute(builder: (_) => const MoreMenuScreen()));
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 1. Top Header: Sapaan Waktu, Avatar & Brand Logo bjb
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 44,
                        height: 44,
                        decoration: const BoxDecoration(
                          gradient: LinearGradient(
                            colors: [AppColors.primary, AppColors.accentSky],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          shape: BoxShape.circle,
                        ),
                        child: const Center(
                          child: Text(
                            'BJ',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w700,
                              color: Colors.white,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                           Text(
                             '${_getGreeting()},',
                             style: const TextStyle(
                               fontSize: 12,
                               fontWeight: FontWeight.w500,
                               color: AppColors.textSecondary,
                             ),
                           ),
                           Text(
                             _userName,
                             style: const TextStyle(
                               fontSize: 16,
                               fontWeight: FontWeight.w800,
                               color: AppColors.textPrimary,
                               letterSpacing: -0.3,
                             ),
                           ),
                        ],
                      ),
                    ],
                  ),

                  // Logo Bank bjb Emblem
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: AppColors.primary,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Text(
                      'bank bjb',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w900,
                        color: Colors.white,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 20),

              // 2. Kartu Saldo Eksklusif Bank bjb (LIVE dari DB)
              _isLoadingAccount
                  ? const Center(
                      child: Padding(
                        padding: EdgeInsets.all(24.0),
                        child: CircularProgressIndicator(color: AppColors.primary),
                      ),
                    )
                  : BalanceCard(
                      userName: _userName,
                      accountNumber: MockData.accountNumber,
                      balance: _accountBalance,
                    ),

              const SizedBox(height: 24),

              // 3. Grid 8 Layanan Menu Cepat bjb
              const Text(
                AppStrings.quickActionsTitle,
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 14),

              Container(
                padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.border),
                  boxShadow: const [
                    BoxShadow(color: AppColors.shadow, blurRadius: 10, offset: Offset(0, 2)),
                  ],
                ),
                child: GridView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: MockData.quickActions.length,
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 4,
                    mainAxisSpacing: 16,
                    childAspectRatio: 0.85,
                  ),
                  itemBuilder: (context, index) {
                    final item = MockData.quickActions[index];
                    return QuickActionButton(
                      title: item.title,
                      icon: item.icon,
                      badge: item.badge,
                      onTap: () => _onQuickActionTapped(item.id),
                    );
                  },
                ),
              ),

              const SizedBox(height: 24),

              // 4. Banner Keamanan Transaksi (Profesional)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF003B7B), Color(0xFF00A3E0)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: const [
                    BoxShadow(color: Color(0x25004F9F), blurRadius: 12, offset: Offset(0, 4)),
                  ],
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.15),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.shield_rounded, color: AppColors.accentGold, size: 28),
                    ),
                    const SizedBox(width: 14),
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Transaksi Anda Terlindungi',
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w800,
                              color: Colors.white,
                            ),
                          ),
                          SizedBox(height: 2),
                          Text(
                            'Sistem deteksi fraud AI aktif 24/7 menjaga setiap transaksi Anda secara real-time.',
                            style: TextStyle(fontSize: 11, color: Colors.white70, height: 1.3),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),


              // 5. Mutasi Rekening Terakhir & CTA Lihat Semua
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    AppStrings.recentTransactionsTitle,
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  InkWell(
                    onTap: () {
                      widget.onNavigateTab?.call(1); // Pindah ke tab Mutasi
                    },
                    child: const Text(
                      AppStrings.seeAll,
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: AppColors.primary,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),

              // 5. Mutasi Rekening — LIVE dari DB (fallback ke empty/loading state)
              if (_isLoadingTx)
                const Center(
                  child: Padding(
                    padding: EdgeInsets.symmetric(vertical: 24),
                    child: CircularProgressIndicator(color: AppColors.primary),
                  ),
                )
              else if (_liveTxList.isEmpty)
                Container(
                  padding: const EdgeInsets.all(28),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: const Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.receipt_long_outlined, size: 40, color: AppColors.textSecondary),
                        SizedBox(height: 10),
                        Text(
                          'Belum ada riwayat transaksi',
                          style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
                        ),
                      ],
                    ),
                  ),
                )
              else
                Container(
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.border),
                    boxShadow: const [
                      BoxShadow(color: AppColors.shadow, blurRadius: 10, offset: Offset(0, 2)),
                    ],
                  ),
                  // Gunakan Column+map bukan ListView.separated untuk
                  // menghindari RenderBox constraint error di SingleChildScrollView
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      for (int i = 0; i < _liveTxList.length; i++) ...[
                        Builder(builder: (ctx) {
                          final tx = _liveTxList[i];
                          final liveModel = TransactionModel(
                            id: tx['id'] ?? '-',
                            title: tx['title'] ?? '-',
                            category: tx['category'] ?? 'TRANSFER',
                            date: tx['date'] ?? '-',
                            amount: tx['amount'] ?? '-',
                            isIncoming: tx['isIncoming'] == true,
                            status: tx['status'] ?? 'BERHASIL',
                            refNumber: tx['refNumber'] ?? 'REF-BJB',
                          );
                          return TransactionItem(
                            transaction: liveModel,
                            onTap: () {
                              Navigator.push(
                                ctx,
                                MaterialPageRoute(
                                  builder: (_) => ReceiptScreen(
                                    title: liveModel.title,
                                    amount: liveModel.amount
                                        .replaceAll('+ ', '')
                                        .replaceAll('- ', '')
                                        .trim(),
                                    receiverAccount: '-',
                                    receiverName: liveModel.title,
                                    category: liveModel.category,
                                    refNumber: liveModel.refNumber,
                                    status: liveModel.status,
                                  ),
                                ),
                              );
                            },
                          );
                        }),
                        if (i < _liveTxList.length - 1)
                          const Divider(height: 1, indent: 70),
                      ],
                    ],
                  ),
                ),


              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }
}
