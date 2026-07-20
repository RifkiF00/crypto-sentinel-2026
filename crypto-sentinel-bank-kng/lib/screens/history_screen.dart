import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import '../core/constants/colors.dart';
import '../core/constants/text_styles.dart';
import '../widgets/transaction_item.dart';

/// Halaman Tab Mutasi Rekening & Riwayat Transaksi Fungsional
class HistoryScreen extends StatefulWidget {
  const HistoryScreen({super.key});

  @override
  State<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen> {
  String _selectedFilter = 'Semua';
  final List<String> _filters = ['Semua', 'Uang Masuk', 'Uang Keluar', 'Bulan Ini'];

  final List<Map<String, dynamic>> _allTransactions = [
    {'title': 'Transfer ke Siti Rahma', 'date': '20 Juli 2026 • 14:30', 'amount': '- Rp 250.000', 'isCredit': false},
    {'title': 'Gaji Bulan Juli - PT Teknologi Nusantara', 'date': '19 Juli 2026 • 09:00', 'amount': '+ Rp 12.500.000', 'isCredit': true},
    {'title': 'Bayar Listrik PLN Token', 'date': '18 Juli 2026 • 19:15', 'amount': '- Rp 202.500', 'isCredit': false},
    {'title': 'Top Up Gopay Dompet Digital', 'date': '18 Juli 2026 • 12:00', 'amount': '- Rp 100.000', 'isCredit': false},
    {'title': 'Transfer Masuk dari Budi Santoso', 'date': '15 Juli 2026 • 16:45', 'amount': '+ Rp 750.000', 'isCredit': true},
    {'title': 'Pembayaran QRIS Kopi Nusantara', 'date': '14 Juli 2026 • 20:10', 'amount': '- Rp 45.000', 'isCredit': false},
    {'title': 'Bayar BPJS Kesehatan Keluarga', 'date': '10 Juli 2026 • 08:30', 'amount': '- Rp 150.000', 'isCredit': false},
    {'title': 'Cashback Promo QRIS Bank Kuningan', 'date': '10 Juli 2026 • 08:31', 'amount': '+ Rp 15.000', 'isCredit': true},
  ];

  @override
  Widget build(BuildContext context) {
    final filteredList = _allTransactions.where((item) {
      if (_selectedFilter == 'Uang Masuk') return item['isCredit'] == true;
      if (_selectedFilter == 'Uang Keluar') return item['isCredit'] == false;
      return true;
    }).toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Mutasi & Riwayat'),
        actions: [
          IconButton(
            icon: const Icon(CupertinoIcons.square_arrow_down),
            tooltip: 'Unduh e-Statement',
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('e-Statement bulan Juli 2026 berhasil diunduh ke format PDF.')),
              );
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Filter Chips
          Container(
            height: 60,
            padding: const EdgeInsets.symmetric(vertical: 8),
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 20),
              itemCount: _filters.length,
              itemBuilder: (context, index) {
                final filter = _filters[index];
                final isSelected = _selectedFilter == filter;
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: FilterChip(
                    label: Text(filter),
                    selected: isSelected,
                    selectedColor: AppColors.primary,
                    labelStyle: TextStyle(color: isSelected ? Colors.white : AppColors.textPrimary, fontWeight: FontWeight.bold),
                    onSelected: (val) => setState(() => _selectedFilter = filter),
                  ),
                );
              },
            ),
          ),
          const Divider(height: 1),

          // Ringkasan Mutasi
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
            color: AppColors.primary.withOpacity(0.06),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Icon(CupertinoIcons.arrow_down_circle_fill, color: AppColors.accentGreen, size: 20),
                    const SizedBox(width: 8),
                    Text('Masuk: Rp 13.265.000', style: AppTextStyles.textTheme.labelMedium?.copyWith(color: AppColors.accentGreen, fontWeight: FontWeight.bold)),
                  ],
                ),
                Row(
                  children: [
                    const Icon(CupertinoIcons.arrow_up_circle_fill, color: AppColors.accentRed, size: 20),
                    const SizedBox(width: 8),
                    Text('Keluar: Rp 747.500', style: AppTextStyles.textTheme.labelMedium?.copyWith(color: AppColors.accentRed, fontWeight: FontWeight.bold)),
                  ],
                ),
              ],
            ),
          ),
          const Divider(height: 1),

          // Daftar Transaksi
          Expanded(
            child: ListView.separated(
              padding: const EdgeInsets.all(20),
              itemCount: filteredList.length,
              separatorBuilder: (context, index) => const Divider(height: 24),
              itemBuilder: (context, index) {
                final item = filteredList[index];
                return TransactionItem(
                  title: item['title'],
                  category: item['isCredit'] ? 'Transfer Masuk' : 'Pembayaran',
                  date: item['date'],
                  amount: item['amount'],
                  isIncoming: item['isCredit'],
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
