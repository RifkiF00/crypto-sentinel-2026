import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import '../../core/constants/colors.dart';
import '../../core/constants/text_styles.dart';
import '../../widgets/custom_text_field.dart';
import '../../widgets/pin_confirmation_modal.dart';
import 'receipt_screen.dart';

/// Halaman Fungsional Top Up E-Wallet (Gopay, OVO, DANA, ShopeePay, LinkAja, e-Money)
class TopUpScreen extends StatefulWidget {
  const TopUpScreen({super.key});

  @override
  State<TopUpScreen> createState() => _TopUpScreenState();
}

class _TopUpScreenState extends State<TopUpScreen> {
  String _selectedWallet = 'Gopay / Gojek';
  final TextEditingController _phoneController = TextEditingController();
  final TextEditingController _amountController = TextEditingController();

  final List<Map<String, dynamic>> _wallets = [
    {'name': 'Gopay / Gojek', 'icon': CupertinoIcons.creditcard_fill, 'color': Color(0xFF00AA13)},
    {'name': 'OVO Cash', 'icon': CupertinoIcons.money_dollar_circle_fill, 'color': Color(0xFF4C3494)},
    {'name': 'DANA Dompet Digital', 'icon': CupertinoIcons.device_phone_portrait, 'color': Color(0xFF118EEA)},
    {'name': 'ShopeePay', 'icon': CupertinoIcons.bag_fill, 'color': Color(0xFFEE4D2D)},
    {'name': 'LinkAja', 'icon': CupertinoIcons.link, 'color': Color(0xFFED1C24)},
    {'name': 'Mandiri e-Money / TapCash', 'icon': CupertinoIcons.creditcard, 'color': Color(0xFF003366)},
  ];

  @override
  void dispose() {
    _phoneController.dispose();
    _amountController.dispose();
    super.dispose();
  }

  void _handleTopUp() {
    if (_phoneController.text.trim().isEmpty || _amountController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Harap masukkan nomor HP/kartu dan nominal Top Up'),
          backgroundColor: AppColors.accentRed,
          behavior: SnackBarBehavior.floating,
        ),
      );
      return;
    }

    final amountText = 'Rp ${_amountController.text}';
    final adminFee = 'Rp 1.000';
    final totalAmountText = 'Rp ${_amountController.text} (+ Rp 1.000)';

    PinConfirmationModal.show(
      context,
      title: 'Konfirmasi Top Up',
      recipientText: '$_selectedWallet • ${_phoneController.text}',
      amountText: totalAmountText,
      onPinSuccess: () {
        final refNo = 'REF-TU${DateTime.now().millisecondsSinceEpoch.toString().substring(4)}';
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (context) => ReceiptScreen(
              title: 'Top Up $_selectedWallet',
              recipientName: 'Nomor Tujuan: ${_phoneController.text}',
              recipientDetail: 'Top Up Saldo $_selectedWallet',
              amount: amountText,
              adminFee: adminFee,
              totalAmount: totalAmountText,
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
      appBar: AppBar(title: const Text('Top Up Dompet Digital')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text('Pilih Layanan Dompet Digital', style: AppTextStyles.textTheme.labelLarge),
            const SizedBox(height: 12),
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 3,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: 1.1,
              ),
              itemCount: _wallets.length,
              itemBuilder: (context, index) {
                final wallet = _wallets[index];
                final isSelected = _selectedWallet == wallet['name'];
                return GestureDetector(
                  onTap: () => setState(() => _selectedWallet = wallet['name']),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 180),
                    decoration: BoxDecoration(
                      color: isSelected ? AppColors.primary.withOpacity(0.08) : AppColors.surface,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: isSelected ? AppColors.primary : AppColors.border,
                        width: isSelected ? 2 : 1,
                      ),
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(wallet['icon'], color: wallet['color'], size: 28),
                        const SizedBox(height: 6),
                        Text(
                          wallet['name'].toString().split(' ')[0],
                          style: AppTextStyles.textTheme.labelSmall?.copyWith(
                            fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                            color: isSelected ? AppColors.primary : AppColors.textPrimary,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
            const SizedBox(height: 24),

            CustomTextField(
              label: 'Nomor HP Terdaftar / Nomor Kartu',
              hint: 'Masukkan nomor HP atau kartu e-Wallet',
              prefixIcon: CupertinoIcons.phone_fill,
              controller: _phoneController,
              keyboardType: TextInputType.phone,
            ),
            const SizedBox(height: 18),

            CustomTextField(
              label: 'Nominal Top Up (Rp)',
              hint: 'Masukkan nominal top up',
              prefixIcon: CupertinoIcons.money_dollar_circle_fill,
              controller: _amountController,
              keyboardType: TextInputType.number,
              inputFormatters: [RupiahInputFormatter()],
            ),
            const SizedBox(height: 12),

            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: ['20.000', '50.000', '100.000', '200.000', '500.000'].map((amt) {
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: ActionChip(
                      label: Text('Rp $amt', style: AppTextStyles.textTheme.labelSmall?.copyWith(color: AppColors.primary)),
                      backgroundColor: AppColors.primary.withOpacity(0.08),
                      onPressed: () => setState(() => _amountController.text = amt),
                    ),
                  );
                }).toList(),
              ),
            ),
            const SizedBox(height: 32),

            ElevatedButton(
              onPressed: _handleTopUp,
              style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 18)),
              child: Text('Top Up $_selectedWallet Sekarang'),
            ),
          ],
        ),
      ),
    );
  }
}
