import 'package:flutter/material.dart';
import '../../core/constants/colors.dart';
import '../../widgets/custom_text_field.dart';
import '../../widgets/pin_confirmation_modal.dart';
import 'receipt_screen.dart';

/// Layar Pembayaran Tagihan & Utilitas Bank bjb (PLN, PDAM Tirta, BPJS, PBB Jabar/Banten)
class PaymentScreen extends StatefulWidget {
  const PaymentScreen({super.key});

  @override
  State<PaymentScreen> createState() => _PaymentScreenState();
}

class _PaymentScreenState extends State<PaymentScreen> {
  String _selectedCategory = 'PLN';
  final _customerIdController = TextEditingController(text: '53210984712');
  bool _hasInquired = false;

  final Map<String, Map<String, dynamic>> _billers = {
    'PLN': {
      'title': 'Listrik PLN Pascabayar',
      'icon': Icons.bolt_rounded,
      'amount': 'Rp 450.000',
      'customerName': 'BILLY JONATHAN',
      'fee': 'Rp 2.500',
    },
    'PDAM': {
      'title': 'PDAM Tirta Jawa Barat',
      'icon': Icons.water_drop_rounded,
      'amount': 'Rp 128.500',
      'customerName': 'BILLY JONATHAN',
      'fee': 'Rp 2.000',
    },
    'BPJS': {
      'title': 'BPJS Kesehatan',
      'icon': Icons.health_and_safety_rounded,
      'amount': 'Rp 150.000',
      'customerName': 'BILLY JONATHAN (2 Peserta)',
      'fee': 'Rp 2.500',
    },
    'PBB': {
      'title': 'PBB Jawa Barat & Banten',
      'icon': Icons.home_work_rounded,
      'amount': 'Rp 320.000',
      'customerName': 'BILLY JONATHAN (NOP 3208...)',
      'fee': 'Gratis (Rp 0)',
    },
  };

  @override
  void dispose() {
    _customerIdController.dispose();
    super.dispose();
  }

  void _onInquire() {
    if (_customerIdController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Nomor pelanggan wajib diisi')),
      );
      return;
    }
    setState(() => _hasInquired = true);
  }

  void _onPay() {
    final bill = _billers[_selectedCategory]!;
    PinConfirmationModal.show(
      context,
      title: 'Otorisasi Pembayaran',
      subtitle: 'Bayar ${bill['title']} sebesar ${bill['amount']}',
      onPinConfirmed: (pin) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (_) => ReceiptScreen(
              title: 'Pembayaran ${bill['title']}',
              amount: bill['amount'] as String,
              receiverAccount: _customerIdController.text,
              receiverName: bill['customerName'] as String,
              category: 'Pembayaran Tagihan',
              refNumber: 'REF-BILL-${DateTime.now().millisecondsSinceEpoch.toString().substring(5)}',
              status: 'BERHASIL',
              adminFee: bill['fee'] as String,
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final bill = _billers[_selectedCategory]!;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Pembayaran & Tagihan'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Pilih Kategori Tagihan', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700)),
              const SizedBox(height: 10),

              // Biller Category List
              Row(
                children: _billers.keys.map((k) {
                  final isSelected = _selectedCategory == k;
                  final item = _billers[k]!;
                  return Expanded(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 3),
                      child: InkWell(
                        onTap: () => setState(() {
                          _selectedCategory = k;
                          _hasInquired = false;
                        }),
                        borderRadius: BorderRadius.circular(12),
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          decoration: BoxDecoration(
                            color: isSelected ? AppColors.primary : AppColors.surface,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: isSelected ? AppColors.primary : AppColors.border),
                          ),
                          child: Column(
                            children: [
                              Icon(item['icon'] as IconData, color: isSelected ? Colors.white : AppColors.primary, size: 20),
                              const SizedBox(height: 4),
                              Text(
                                k,
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w700,
                                  color: isSelected ? Colors.white : AppColors.textPrimary,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),

              const SizedBox(height: 20),

              // Input ID Pelanggan
              CustomTextField(
                controller: _customerIdController,
                label: 'Nomor Pelanggan / ID Tagihan $_selectedCategory',
                hint: 'Masukkan ID tagihan',
                keyboardType: TextInputType.number,
                prefixIcon: const Icon(Icons.receipt_long_rounded, color: AppColors.primary, size: 20),
              ),

              const SizedBox(height: 16),

              if (!_hasInquired)
                ElevatedButton(
                  onPressed: _onInquire,
                  child: const Text('Cek Rincian Tagihan'),
                ),

              // Rincian Tagihan jika sudah dicek
              if (_hasInquired) ...[
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Column(
                    children: [
                      _buildRow('Penyedia Layanan', bill['title'] as String),
                      const Divider(height: 20),
                      _buildRow('Nama Pelanggan', bill['customerName'] as String),
                      const Divider(height: 20),
                      _buildRow('ID Pelanggan', _customerIdController.text),
                      const Divider(height: 20),
                      _buildRow('Biaya Admin', bill['fee'] as String),
                      const Divider(height: 20),
                      _buildRow('Total Pembayaran', bill['amount'] as String, isBold: true),
                    ],
                  ),
                ),

                const SizedBox(height: 24),

                ElevatedButton(
                  onPressed: _onPay,
                  child: const Text('Bayar Tagihan Sekarang'),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildRow(String label, String value, {bool isBold = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
        Text(
          value,
          style: TextStyle(
            fontSize: 12,
            fontWeight: isBold ? FontWeight.w800 : FontWeight.w600,
            color: isBold ? AppColors.primary : AppColors.textPrimary,
          ),
        ),
      ],
    );
  }
}
