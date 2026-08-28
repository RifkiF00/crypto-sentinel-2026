import 'package:flutter/material.dart';
import '../core/constants/colors.dart';
import '../data/api_service.dart';
import '../data/mock_data.dart';
import '../widgets/transaction_item.dart';
import 'menus/receipt_screen.dart';

/// Layar Mutasi Rekening — LIVE dari database expresso-api
class HistoryScreen extends StatefulWidget {
  const HistoryScreen({super.key});

  @override
  State<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen> {
  static const String _bjbAccountId = '1234567890';

  int _selectedFilterIndex = 0;
  bool _isLoading = true;
  List<Map<String, dynamic>> _allTxList = [];

  @override
  void initState() {
    super.initState();
    _fetchHistory();
  }

  Future<void> _fetchHistory() async {
    setState(() => _isLoading = true);
    final txList = await BjbApiService.getTransactions(
      accountId: _bjbAccountId,
      limit: 50,
    );
    if (mounted) {
      setState(() {
        _allTxList = txList;
        _isLoading = false;
      });
    }
  }

  List<Map<String, dynamic>> get _filteredList {
    if (_selectedFilterIndex == 1) return _allTxList.where((tx) => tx['isIncoming'] == true).toList();
    if (_selectedFilterIndex == 2) return _allTxList.where((tx) => tx['isIncoming'] == false).toList();
    return _allTxList;
  }

  String get _totalMasuk {
    int total = 0;
    for (final tx in _allTxList) {
      if (tx['isIncoming'] == true) {
        // Parse angka dari string "+ Rp 500.000"
        final raw = tx['amount'].toString().replaceAll(RegExp(r'[^0-9]'), '');
        total += int.tryParse(raw) ?? 0;
      }
    }
    return _formatAmount(total);
  }

  String get _totalKeluar {
    int total = 0;
    for (final tx in _allTxList) {
      if (tx['isIncoming'] == false) {
        final raw = tx['amount'].toString().replaceAll(RegExp(r'[^0-9]'), '');
        total += int.tryParse(raw) ?? 0;
      }
    }
    return _formatAmount(total);
  }

  String _formatAmount(int amount) {
    return amount.toString().replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
      (m) => '${m[1]}.',
    );
  }

  @override
  Widget build(BuildContext context) {
    final now = DateTime.now();
    final bulan = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'][now.month - 1];
    final periodLabel = '$bulan ${now.year}';

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Mutasi Rekening'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            tooltip: 'Refresh',
            onPressed: _fetchHistory,
          ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Header Filter + Ringkasan
            Container(
              color: AppColors.surface,
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
              child: Column(
                children: [
                  // Filter Chips
                  Row(
                    children: [
                      _buildFilterChip('Semua', 0),
                      const SizedBox(width: 8),
                      _buildFilterChip('Uang Masuk', 1),
                      const SizedBox(width: 8),
                      _buildFilterChip('Uang Keluar', 2),
                    ],
                  ),

                  const SizedBox(height: 14),

                  // Ringkasan Arus Kas — Kalkulasi dari transaksi live
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: AppColors.surfaceVariant.withOpacity(0.6),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: _isLoading
                        ? const Center(
                            child: SizedBox(
                              height: 28,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: AppColors.primary,
                              ),
                            ),
                          )
                        : Row(
                            mainAxisAlignment: MainAxisAlignment.spaceAround,
                            children: [
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text('Total Masuk ($periodLabel)',
                                      style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                                  const SizedBox(height: 2),
                                  Text('+ Rp $_totalMasuk',
                                      style: const TextStyle(
                                          fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.accentGreen)),
                                ],
                              ),
                              const SizedBox(
                                  height: 28, child: VerticalDivider(color: AppColors.border, thickness: 1)),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text('Total Keluar ($periodLabel)',
                                      style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                                  const SizedBox(height: 2),
                                  Text('- Rp $_totalKeluar',
                                      style: const TextStyle(
                                          fontSize: 13,
                                          fontWeight: FontWeight.w700,
                                          color: AppColors.textPrimary)),
                                ],
                              ),
                            ],
                          ),
                  ),
                ],
              ),
            ),

            const Divider(height: 1),

            // Daftar Transaksi Live
            Expanded(
              child: _isLoading
                  ? const Center(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          CircularProgressIndicator(color: AppColors.primary),
                          SizedBox(height: 14),
                          Text('Memuat mutasi rekening...', style: TextStyle(color: AppColors.textSecondary)),
                        ],
                      ),
                    )
                  : _filteredList.isEmpty
                      ? Center(
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.receipt_long_outlined, size: 48, color: AppColors.textSecondary.withOpacity(0.4)),
                              const SizedBox(height: 12),
                              const Text(
                                'Tidak ada transaksi pada kategori ini',
                                style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
                              ),
                            ],
                          ),
                        )
                      : ListView.separated(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                          itemCount: _filteredList.length,
                          separatorBuilder: (_, __) => const SizedBox(height: 8),
                          itemBuilder: (context, index) {
                            final tx = _filteredList[index];
                            final liveModel = TransactionModel(
                              id: tx['id'] ?? '-',
                              title: tx['title'] ?? '-',
                              category: tx['category'] ?? 'TRANSFER',
                              date: tx['date'] ?? '-',
                              amount: tx['amount'] ?? '-',
                              isIncoming: tx['isIncoming'] == true,
                              status: tx['status'] ?? 'BERHASIL',
                              refNumber: tx['refNumber'] ?? '-',
                            );
                            return Container(
                              decoration: BoxDecoration(
                                color: AppColors.surface,
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(
                                  color: tx['isBlocked'] == true
                                      ? AppColors.accentRed.withOpacity(0.3)
                                      : AppColors.border.withOpacity(0.5),
                                ),
                                boxShadow: const [
                                  BoxShadow(color: AppColors.shadow, blurRadius: 4, offset: Offset(0, 1)),
                                ],
                              ),
                              child: TransactionItem(
                                transaction: liveModel,
                                onTap: () {
                                  Navigator.push(
                                    context,
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
                              ),
                            );
                          },
                        ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFilterChip(String label, int index) {
    final isSelected = _selectedFilterIndex == index;
    return Expanded(
      child: InkWell(
        onTap: () => setState(() => _selectedFilterIndex = index),
        borderRadius: BorderRadius.circular(20),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(vertical: 8),
          decoration: BoxDecoration(
            color: isSelected ? AppColors.primary : AppColors.surfaceVariant,
            borderRadius: BorderRadius.circular(20),
          ),
          child: Center(
            child: Text(
              label,
              style: TextStyle(
                fontSize: 12,
                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                color: isSelected ? Colors.white : AppColors.textSecondary,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
