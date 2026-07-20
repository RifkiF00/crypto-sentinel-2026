import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import '../core/constants/colors.dart';
import '../core/constants/text_styles.dart';

/// Halaman Tab Pesan (Notifikasi Transaksi & Kotak Masuk Promo)
class MessagesScreen extends StatefulWidget {
  const MessagesScreen({super.key});

  @override
  State<MessagesScreen> createState() => _MessagesScreenState();
}

class _MessagesScreenState extends State<MessagesScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  final List<Map<String, dynamic>> _notifs = [
    {'title': 'Transfer Masuk Berhasil', 'desc': 'Dana sebesar Rp 750.000 dari Budi Santoso telah masuk ke rekening Anda.', 'time': '15 Juli, 16:45', 'icon': CupertinoIcons.arrow_down_left_circle_fill, 'color': AppColors.accentGreen},
    {'title': 'Pembayaran Listrik Berhasil', 'desc': 'Tagihan PLN Token Rp 202.500 telah dibayar dengan sukses.', 'time': '18 Juli, 19:15', 'icon': CupertinoIcons.checkmark_seal_fill, 'color': AppColors.primary},
    {'title': 'Keamanan PIN Terverifikasi', 'desc': 'PIN Bank Kuningan Anda berhasil diperbarui dan aktif.', 'time': '10 Juli, 08:00', 'icon': CupertinoIcons.lock_shield_fill, 'color': AppColors.primaryDark},
  ];

  final List<Map<String, dynamic>> _promos = [
    {'title': 'Cashback 50% QRIS Kopi Nusantara!', 'desc': 'Nikmati potongan langsung hingga Rp 25.000 setiap transaksi pakai QRIS Bank Kuningan.', 'date': 'Berlaku s/d 31 Juli 2026', 'code': 'VIBEQRIS50'},
    {'title': 'Buka Deposito Bunga Spesial 6.5%', 'desc': 'Investasikan dana masa depan Anda sekarang juga dengan bunga tertinggi & dijamin LPS.', 'date': 'Promo Terbatas', 'code': 'DEPOSITO65'},
    {'title': 'Transfer Online (RTOL) Cepat & Aman', 'desc': 'Kirim uang realtime ke bank mana saja didukung jaringan ALTO, ATM Bersama & PRIMA.', 'date': 'Aktif 24/7', 'code': 'RTOLFAST'},
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Kotak Pesan'),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: AppColors.primary,
          labelColor: AppColors.primary,
          unselectedLabelColor: AppColors.textSecondary,
          tabs: const [Tab(text: 'Notifikasi'), Tab(text: 'Promo Eksklusif')],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [_buildNotifsTab(), _buildPromosTab()],
      ),
    );
  }

  Widget _buildNotifsTab() {
    return ListView.separated(
      padding: const EdgeInsets.all(20),
      itemCount: _notifs.length,
      separatorBuilder: (context, index) => const Divider(height: 24),
      itemBuilder: (context, index) {
        final item = _notifs[index];
        return Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: (item['color'] as Color).withOpacity(0.12), shape: BoxShape.circle),
              child: Icon(item['icon'], color: item['color'], size: 24),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(item['title'], style: AppTextStyles.textTheme.titleMedium),
                  const SizedBox(height: 4),
                  Text(item['desc'], style: AppTextStyles.textTheme.bodySmall?.copyWith(color: AppColors.textSecondary)),
                  const SizedBox(height: 6),
                  Text(item['time'], style: AppTextStyles.textTheme.labelSmall?.copyWith(color: AppColors.textHint, fontSize: 10)),
                ],
              ),
            ),
          ],
        );
      },
    );
  }

  Widget _buildPromosTab() {
    return ListView.builder(
      padding: const EdgeInsets.all(20),
      itemCount: _promos.length,
      itemBuilder: (context, index) {
        final promo = _promos[index];
        return Container(
          margin: const EdgeInsets.only(bottom: 16),
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: AppColors.accentYellow, width: 1.5),
            boxShadow: [BoxShadow(color: AppColors.shadow.withOpacity(0.06), blurRadius: 14)],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(color: AppColors.accentYellow.withOpacity(0.2), borderRadius: BorderRadius.circular(8)),
                child: Text('PROMO SPESIAL', style: AppTextStyles.textTheme.labelSmall?.copyWith(color: AppColors.primaryDark, fontWeight: FontWeight.bold)),
              ),
              const SizedBox(height: 10),
              Text(promo['title'], style: AppTextStyles.textTheme.titleLarge),
              const SizedBox(height: 6),
              Text(promo['desc'], style: AppTextStyles.textTheme.bodySmall?.copyWith(color: AppColors.textSecondary)),
              const SizedBox(height: 14),
              Divider(color: AppColors.border.withOpacity(0.6)),
              const SizedBox(height: 10),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(promo['date'], style: AppTextStyles.textTheme.labelSmall?.copyWith(color: AppColors.accentGreen)),
                  ElevatedButton(
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('Voucher "${promo['code']}" berhasil disalin!')),
                      );
                    },
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      minimumSize: const Size(0, 36),
                    ),
                    child: const Text('Gunakan'),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }
}
