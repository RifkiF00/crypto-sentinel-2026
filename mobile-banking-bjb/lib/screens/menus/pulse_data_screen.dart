import 'package:flutter/material.dart';
import '../../core/constants/colors.dart';
import '../../widgets/custom_text_field.dart';
import '../../widgets/pin_confirmation_modal.dart';
import 'receipt_screen.dart';

/// Layar Pembelian Pulsa & Paket Data Bank bjb (Auto-detect Operator)
class PulseDataScreen extends StatefulWidget {
  const PulseDataScreen({super.key});

  @override
  State<PulseDataScreen> createState() => _PulseDataScreenState();
}

class _PulseDataScreenState extends State<PulseDataScreen> {
  final _phoneController = TextEditingController(text: '081234567890');
  String _operatorName = 'Telkomsel';
  int _selectedDenom = 50000;
  int _tabIndex = 0; // 0: Pulsa, 1: Paket Data

  final List<Map<String, dynamic>> _pulsaList = [
    {'denom': 25000, 'price': 'Rp 26.000'},
    {'denom': 50000, 'price': 'Rp 51.000'},
    {'denom': 100000, 'price': 'Rp 100.500'},
    {'denom': 150000, 'price': 'Rp 150.000'},
    {'denom': 200000, 'price': 'Rp 199.000'},
    {'denom': 500000, 'price': 'Rp 495.000'},
  ];

  final List<Map<String, dynamic>> _dataList = [
    {'title': 'Internet Max 10 GB', 'desc': '30 Hari, Semua Jaringan', 'price': 'Rp 45.000'},
    {'title': 'Internet OMG! 25 GB', 'desc': '30 Hari + 2 GB Kuota Nonton', 'price': 'Rp 85.000'},
    {'title': 'Unlimited Harian 50 GB', 'desc': '30 Hari FUP 2 GB/Hari', 'price': 'Rp 120.000'},
  ];

  @override
  void initState() {
    super.initState();
    _detectOperator(_phoneController.text);
  }

  @override
  void dispose() {
    _phoneController.dispose();
    super.dispose();
  }

  void _detectOperator(String number) {
    if (number.startsWith('0811') || number.startsWith('0812') || number.startsWith('0813') || number.startsWith('0821') || number.startsWith('0822') || number.startsWith('0852')) {
      setState(() => _operatorName = 'Telkomsel');
    } else if (number.startsWith('0814') || number.startsWith('0815') || number.startsWith('0816') || number.startsWith('0855') || number.startsWith('0856') || number.startsWith('0857') || number.startsWith('0858')) {
      setState(() => _operatorName = 'Indosat Ooredoo');
    } else if (number.startsWith('0817') || number.startsWith('0818') || number.startsWith('0819') || number.startsWith('0859') || number.startsWith('0877') || number.startsWith('0878')) {
      setState(() => _operatorName = 'XL Axiata');
    } else if (number.startsWith('0895') || number.startsWith('0896') || number.startsWith('0897') || number.startsWith('0898') || number.startsWith('0899')) {
      setState(() => _operatorName = 'Tri (3)');
    } else {
      setState(() => _operatorName = 'Operator Seluler');
    }
  }

  void _onPurchase() {
    final phone = _phoneController.text.trim();
    if (phone.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Nomor ponsel wajib diisi')),
      );
      return;
    }

    final itemTitle = _tabIndex == 0 ? 'Pulsa $_operatorName $_selectedDenom' : 'Paket Data $_operatorName';
    final priceStr = _tabIndex == 0 ? 'Rp 51.000' : 'Rp 85.000';

    PinConfirmationModal.show(
      context,
      title: 'Otorisasi Pembelian Pulsa',
      subtitle: 'Beli $itemTitle ke $phone ($priceStr)',
      onPinConfirmed: (pin) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (_) => ReceiptScreen(
              title: itemTitle,
              amount: priceStr,
              receiverAccount: phone,
              receiverName: _operatorName,
              category: 'Isi Ulang Pulsa & Data',
              refNumber: 'REF-PULSA-${DateTime.now().millisecondsSinceEpoch.toString().substring(5)}',
              status: 'BERHASIL',
              adminFee: 'Rp 1.000',
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Pulsa & Paket Data'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Input Nomor Telepon
              CustomTextField(
                controller: _phoneController,
                label: 'Nomor Ponsel Tujuan',
                hint: '08xxxxxxxxxx',
                keyboardType: TextInputType.phone,
                prefixIcon: const Icon(Icons.phone_android_rounded, color: AppColors.primary, size: 20),
                suffixIcon: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                  child: Chip(
                    label: Text(_operatorName, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: Colors.white)),
                    backgroundColor: AppColors.primaryDark,
                    padding: EdgeInsets.zero,
                    visualDensity: VisualDensity.compact,
                  ),
                ),
                onChanged: _detectOperator,
              ),

              const SizedBox(height: 20),

              // Tab Pulsa / Paket Data
              Row(
                children: [
                  _buildTabButton('Pulsa Reguler', 0),
                  const SizedBox(width: 8),
                  _buildTabButton('Paket Kuota Data', 1),
                ],
              ),

              const SizedBox(height: 16),

              if (_tabIndex == 0) ...[
                // Grid Pilihan Pulsa
                GridView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: _pulsaList.length,
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    mainAxisSpacing: 10,
                    crossAxisSpacing: 10,
                    childAspectRatio: 1.9,
                  ),
                  itemBuilder: (context, index) {
                    final item = _pulsaList[index];
                    final denom = item['denom'] as int;
                    final isSelected = _selectedDenom == denom;
                    return InkWell(
                      onTap: () => setState(() => _selectedDenom = denom),
                      borderRadius: BorderRadius.circular(12),
                      child: Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: isSelected ? AppColors.primary.withOpacity(0.1) : AppColors.surface,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: isSelected ? AppColors.primary : AppColors.border,
                            width: isSelected ? 1.5 : 1,
                          ),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              'Pulsa ${(denom / 1000).toStringAsFixed(0)}K',
                              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              item['price'] as String,
                              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.primary),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ] else ...[
                // List Paket Data
                ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: _dataList.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 10),
                  itemBuilder: (context, index) {
                    final item = _dataList[index];
                    return Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: AppColors.surface,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppColors.border),
                      ),
                      child: Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(item['title'] as String, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700)),
                                const SizedBox(height: 2),
                                Text(item['desc'] as String, style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                                const SizedBox(height: 4),
                                Text(item['price'] as String, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.primary)),
                              ],
                            ),
                          ),
                          ElevatedButton(
                            style: ElevatedButton.styleFrom(minimumSize: const Size(70, 34)),
                            onPressed: _onPurchase,
                            child: const Text('Beli', style: TextStyle(fontSize: 12)),
                          ),
                        ],
                      ),
                    );
                  },
                ),
              ],

              const SizedBox(height: 32),

              if (_tabIndex == 0)
                ElevatedButton(
                  onPressed: _onPurchase,
                  child: const Text('Beli Pulsa Sekarang'),
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTabButton(String label, int index) {
    final isSelected = _tabIndex == index;
    return Expanded(
      child: InkWell(
        onTap: () => setState(() => _tabIndex = index),
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: isSelected ? AppColors.primary : AppColors.surface,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: isSelected ? AppColors.primary : AppColors.border),
          ),
          child: Center(
            child: Text(
              label,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w700,
                color: isSelected ? Colors.white : AppColors.textPrimary,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
