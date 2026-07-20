import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import '../../core/constants/colors.dart';
import '../../core/constants/text_styles.dart';
import '../../widgets/custom_text_field.dart';
import '../../widgets/pin_confirmation_modal.dart';
import 'receipt_screen.dart';

/// Halaman Fungsional Pulsa & Paket Data (Material Design 3)
class PulseDataScreen extends StatefulWidget {
  const PulseDataScreen({super.key});

  @override
  State<PulseDataScreen> createState() => _PulseDataScreenState();
}

class _PulseDataScreenState extends State<PulseDataScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final TextEditingController _phoneController = TextEditingController();
  String _operator = 'Telkomsel';
  Map<String, String>? _selectedItem;

  final List<Map<String, String>> _pulsaList = [
    {'name': 'Pulsa 15.000', 'price': 'Rp 16.500'},
    {'name': 'Pulsa 25.000', 'price': 'Rp 26.500'},
    {'name': 'Pulsa 50.000', 'price': 'Rp 51.000'},
    {'name': 'Pulsa 100.000', 'price': 'Rp 100.500'},
    {'name': 'Pulsa 150.000', 'price': 'Rp 150.000'},
    {'name': 'Pulsa 200.000', 'price': 'Rp 199.500'},
  ];

  final List<Map<String, String>> _dataList = [
    {'name': 'Data 5 GB (30 Hari)', 'price': 'Rp 28.000', 'desc': '2 GB Utama + 3 GB Lokal'},
    {'name': 'Data 12 GB (30 Hari)', 'price': 'Rp 52.000', 'desc': '6 GB Utama + 6 GB Malam & Sosmed'},
    {'name': 'Data 25 GB (30 Hari)', 'price': 'Rp 85.000', 'desc': 'Full 24 Jam Semua Jaringan 4G/5G'},
    {'name': 'Data 50 GB VIP (30 Hari)', 'price': 'Rp 140.000', 'desc': 'Unlimited Sosmed & Streaming + 50 GB Utama'},
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  void _onPhoneChanged(String val) {
    if (val.startsWith('081') || val.startsWith('082') || val.startsWith('0852')) {
      setState(() => _operator = 'Telkomsel');
    } else if (val.startsWith('0856') || val.startsWith('0857') || val.startsWith('0815')) {
      setState(() => _operator = 'Indosat Ooredoo');
    } else if (val.startsWith('0817') || val.startsWith('0818') || val.startsWith('0877')) {
      setState(() => _operator = 'XL Axiata');
    } else if (val.startsWith('089')) {
      setState(() => _operator = 'Tri (3)');
    }
  }

  void _handlePurchase() {
    if (_phoneController.text.trim().isEmpty || _selectedItem == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Harap masukkan nomor HP dan pilih paket')),
      );
      return;
    }

    PinConfirmationModal.show(
      context,
      title: 'Konfirmasi Pembelian',
      recipientText: '$_operator • ${_phoneController.text}',
      amountText: _selectedItem!['price']!,
      onPinSuccess: () {
        final refNo = 'REF-PD${DateTime.now().millisecondsSinceEpoch.toString().substring(4)}';
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (context) => ReceiptScreen(
              title: 'Beli ${_selectedItem!['name']}',
              recipientName: 'Nomor HP: ${_phoneController.text}',
              recipientDetail: 'Operator: $_operator (${_selectedItem!['desc'] ?? "Reguler"})',
              amount: _selectedItem!['price']!,
              adminFee: 'GRATIS',
              totalAmount: _selectedItem!['price']!,
              referenceNumber: refNo,
              date: 'Hari ini, ${DateTime.now().hour}:${DateTime.now().minute.toString().padLeft(2, '0')} WIB',
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Pulsa & Paket Data'),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: AppColors.primary,
          labelColor: AppColors.primary,
          unselectedLabelColor: AppColors.textSecondary,
          tabs: const [Tab(text: 'Pulsa Reguler'), Tab(text: 'Paket Data Internet')],
        ),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                CustomTextField(
                  label: 'Nomor Handphone',
                  hint: 'Masukkan nomor HP tujuan',
                  prefixIcon: CupertinoIcons.phone_fill,
                  controller: _phoneController,
                  keyboardType: TextInputType.phone,
                  onChanged: _onPhoneChanged,
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    const Icon(CupertinoIcons.checkmark_shield_fill, color: AppColors.accentGreen, size: 16),
                    const SizedBox(width: 6),
                    Text('Operator Terdeteksi: $_operator', style: AppTextStyles.textTheme.labelSmall?.copyWith(color: AppColors.accentGreen, fontWeight: FontWeight.bold)),
                  ],
                ),
              ],
            ),
          ),
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [_buildPulsaGrid(), _buildDataList()],
            ),
          ),
          if (_selectedItem != null)
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppColors.surface,
                boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.06), blurRadius: 10, offset: const Offset(0, -4))],
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(_selectedItem!['name']!, style: AppTextStyles.textTheme.titleMedium),
                      Text(_selectedItem!['price']!, style: AppTextStyles.textTheme.headlineMedium?.copyWith(color: AppColors.primary, fontWeight: FontWeight.bold)),
                    ],
                  ),
                  ElevatedButton(
                    onPressed: _handlePurchase,
                    style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 14)),
                    child: const Text('Beli Sekarang'),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildPulsaGrid() {
    return GridView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
        childAspectRatio: 2.0,
      ),
      itemCount: _pulsaList.length,
      itemBuilder: (context, index) {
        final item = _pulsaList[index];
        final isSelected = _selectedItem == item;
        return GestureDetector(
          onTap: () => setState(() => _selectedItem = item),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 180),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: isSelected ? AppColors.primary.withOpacity(0.1) : AppColors.surface,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: isSelected ? AppColors.primary : AppColors.border, width: isSelected ? 2 : 1),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(item['name']!, style: AppTextStyles.textTheme.titleMedium),
                const SizedBox(height: 4),
                Text(item['price']!, style: AppTextStyles.textTheme.bodyMedium?.copyWith(color: AppColors.primary, fontWeight: FontWeight.bold)),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildDataList() {
    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      itemCount: _dataList.length,
      itemBuilder: (context, index) {
        final item = _dataList[index];
        final isSelected = _selectedItem == item;
        return GestureDetector(
          onTap: () => setState(() => _selectedItem = item),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 180),
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: isSelected ? AppColors.primary.withOpacity(0.1) : AppColors.surface,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: isSelected ? AppColors.primary : AppColors.border, width: isSelected ? 2 : 1),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(item['name']!, style: AppTextStyles.textTheme.titleLarge),
                      const SizedBox(height: 4),
                      Text(item['desc']!, style: AppTextStyles.textTheme.bodySmall?.copyWith(color: AppColors.textSecondary)),
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                Text(item['price']!, style: AppTextStyles.textTheme.titleMedium?.copyWith(color: AppColors.primary, fontWeight: FontWeight.bold)),
              ],
            ),
          ),
        );
      },
    );
  }
}
