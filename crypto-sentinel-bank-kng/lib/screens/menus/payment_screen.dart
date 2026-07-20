import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import '../../core/constants/colors.dart';
import '../../core/constants/text_styles.dart';
import '../../widgets/custom_text_field.dart';
import '../../widgets/pin_confirmation_modal.dart';
import 'receipt_screen.dart';

/// Halaman Fungsional Pembayaran Tagihan (PLN, BPJS, PDAM, Internet, dll)
class PaymentScreen extends StatefulWidget {
  const PaymentScreen({super.key});

  @override
  State<PaymentScreen> createState() => _PaymentScreenState();
}

class _PaymentScreenState extends State<PaymentScreen> {
  String _selectedCategory = 'PLN Listrik (Token / Tagihan)';
  final TextEditingController _idController = TextEditingController();
  bool _isChecking = false;
  Map<String, String>? _billDetail;

  final List<Map<String, dynamic>> _categories = [
    {'name': 'PLN Listrik (Token / Tagihan)', 'icon': CupertinoIcons.bolt_fill, 'color': Color(0xFFFFCC00)},
    {'name': 'BPJS Kesehatan', 'icon': CupertinoIcons.heart_fill, 'color': Color(0xFF008000)},
    {'name': 'PDAM Air Bersih', 'icon': CupertinoIcons.drop_fill, 'color': Color(0xFF1A528A)},
    {'name': 'Internet & WiFi Rumah', 'icon': CupertinoIcons.wifi, 'color': Color(0xFF003366)},
    {'name': 'Kartu Kredit Bank', 'icon': CupertinoIcons.creditcard, 'color': Color(0xFF64748B)},
    {'name': 'Pajak PBB / Daerah', 'icon': CupertinoIcons.doc_text, 'color': Color(0xFFD32F2F)},
  ];

  @override
  void dispose() {
    _idController.dispose();
    super.dispose();
  }

  void _checkBill() {
    if (_idController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Harap masukkan Nomor ID Pelanggan / Nomor Tagihan')),
      );
      return;
    }

    setState(() {
      _isChecking = true;
      _billDetail = null;
    });

    Future.delayed(const Duration(milliseconds: 900), () {
      if (mounted) {
        setState(() {
          _isChecking = false;
          _billDetail = {
            'customerName': 'Budi Santoso',
            'customerID': _idController.text,
            'period': 'Juli 2026',
            'amount': 'Rp 345.500',
            'adminFee': 'Rp 2.500',
            'total': 'Rp 348.000',
          };
        });
      }
    });
  }

  void _handlePayment() {
    if (_billDetail == null) return;

    PinConfirmationModal.show(
      context,
      title: 'Pembayaran $_selectedCategory',
      recipientText: 'ID: ${_billDetail!['customerID']} (${_billDetail!['customerName']})',
      amountText: _billDetail!['total']!,
      onPinSuccess: () {
        final refNo = 'REF-PY${DateTime.now().millisecondsSinceEpoch.toString().substring(4)}';
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (context) => ReceiptScreen(
              title: 'Bayar $_selectedCategory',
              recipientName: 'Pelanggan: ${_billDetail!['customerName']} (${_billDetail!['customerID']})',
              recipientDetail: 'Tagihan Periode ${_billDetail!['period']}',
              amount: _billDetail!['amount']!,
              adminFee: _billDetail!['adminFee']!,
              totalAmount: _billDetail!['total']!,
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
      appBar: AppBar(title: const Text('Pembayaran Tagihan')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text('Kategori Tagihan', style: AppTextStyles.textTheme.labelLarge),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppColors.border),
              ),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<String>(
                  value: _selectedCategory,
                  isExpanded: true,
                  icon: const Icon(CupertinoIcons.chevron_down, color: AppColors.primary),
                  onChanged: (val) {
                    if (val != null) setState(() => _selectedCategory = val);
                  },
                  items: _categories.map((cat) {
                    return DropdownMenuItem<String>(
                      value: cat['name'],
                      child: Row(
                        children: [
                          Icon(cat['icon'], color: cat['color'], size: 20),
                          const SizedBox(width: 12),
                          Expanded(child: Text(cat['name'], style: AppTextStyles.textTheme.bodyMedium)),
                        ],
                      ),
                    );
                  }).toList(),
                ),
              ),
            ),
            const SizedBox(height: 20),

            CustomTextField(
              label: 'Nomor ID Pelanggan / VA / Tagihan',
              hint: 'Masukkan nomor pelanggan Anda',
              prefixIcon: CupertinoIcons.barcode_viewfinder,
              controller: _idController,
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: 20),

            OutlinedButton.icon(
              onPressed: _isChecking ? null : _checkBill,
              icon: _isChecking
                  ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2))
                  : const Icon(CupertinoIcons.search),
              label: Text(_isChecking ? 'Mengecek Tagihan...' : 'Cek Rincian Tagihan'),
              style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16)),
            ),
            const SizedBox(height: 24),

            if (_billDetail != null) ...[
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: AppColors.primary, width: 1.5),
                  boxShadow: [BoxShadow(color: AppColors.primary.withOpacity(0.08), blurRadius: 16)],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Rincian Tagihan', style: AppTextStyles.textTheme.titleLarge),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: AppColors.accentGreen.withOpacity(0.12),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text('BELUM DIBAYAR', style: AppTextStyles.textTheme.labelSmall?.copyWith(color: AppColors.accentGreen, fontWeight: FontWeight.bold)),
                        ),
                      ],
                    ),
                    const Divider(height: 24),
                    _buildBillRow('Nama Pelanggan', _billDetail!['customerName']!),
                    _buildBillRow('ID Pelanggan', _billDetail!['customerID']!),
                    _buildBillRow('Periode', _billDetail!['period']!),
                    _buildBillRow('Tagihan Pokok', _billDetail!['amount']!),
                    _buildBillRow('Biaya Admin Bank', _billDetail!['adminFee']!),
                    const Divider(height: 24),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('TOTAL TAGIHAN', style: AppTextStyles.textTheme.titleMedium),
                        Text(
                          _billDetail!['total']!,
                          style: AppTextStyles.textTheme.headlineMedium?.copyWith(color: AppColors.primary, fontWeight: FontWeight.w800),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: _handlePayment,
                style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 18)),
                child: const Text('Bayar Tagihan Sekarang'),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildBillRow(String label, String val) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: AppTextStyles.textTheme.bodyMedium?.copyWith(color: AppColors.textSecondary)),
          Text(val, style: AppTextStyles.textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}
