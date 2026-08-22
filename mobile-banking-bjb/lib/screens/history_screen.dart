import 'package:flutter/material.dart';
import '../core/constants/colors.dart';
import '../data/mock_data.dart';
import '../widgets/transaction_item.dart';
import 'menus/receipt_screen.dart';

/// Layar Mutasi Rekening & Riwayat Transaksi bjb DIGI
class HistoryScreen extends StatefulWidget {
  const HistoryScreen({super.key});

  @override
  State<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen> {
  int _selectedFilterIndex = 0; // 0: Semua, 1: Masuk, 2: Keluar

  @override
  Widget build(BuildContext context) {
    const allList = MockData.fullHistory;
    final filteredList = allList.where((tx) {
      if (_selectedFilterIndex == 1) return tx.isIncoming;
      if (_selectedFilterIndex == 2) return !tx.isIncoming;
      return true;
    }).toList();

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Mutasi Rekening bjb'),
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Filter Selector Header
            Container(
              color: AppColors.surface,
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
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

                  // Ringkasan Arus Kas Bulan Ini
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: AppColors.surfaceVariant.withOpacity(0.6),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: const Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Total Masuk (Agu 2026)', style: TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                            SizedBox(height: 2),
                            Text('+ Rp 26.500.000', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.accentGreen)),
                          ],
                        ),
                        SizedBox(height: 28, child: VerticalDivider(color: AppColors.border, thickness: 1)),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Total Keluar (Agu 2026)', style: TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                            SizedBox(height: 2),
                            Text('- Rp 2.120.000', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const Divider(height: 1),

            // Daftar Transaksi Mutasi
            Expanded(
              child: filteredList.isEmpty
                  ? const Center(
                      child: Text(
                        'Tidak ada transaksi pada kategori ini',
                        style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
                      ),
                    )
                  : ListView.separated(
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                      itemCount: filteredList.length,
                      separatorBuilder: (_, __) => const Divider(height: 1, indent: 70),
                      itemBuilder: (context, index) {
                        final tx = filteredList[index];
                        return Container(
                          decoration: BoxDecoration(
                            color: AppColors.surface,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: AppColors.border.withOpacity(0.5)),
                          ),
                          margin: const EdgeInsets.only(bottom: 6),
                          child: TransactionItem(
                            transaction: tx,
                            onTap: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => ReceiptScreen(
                                    title: tx.title,
                                    amount: tx.amount.replaceAll('+', '').replaceAll('-', '').trim(),
                                    receiverAccount: '1234-5678-90',
                                    receiverName: tx.title.replaceAll('Transfer ke ', '').replaceAll('Transfer dari ', ''),
                                    category: tx.category,
                                    refNumber: tx.refNumber,
                                    status: tx.status,
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
        child: Container(
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
