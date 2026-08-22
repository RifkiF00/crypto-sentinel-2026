import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import '../../core/constants/colors.dart';
import '../../widgets/custom_text_field.dart';
import '../../widgets/pin_confirmation_modal.dart';
import 'receipt_screen.dart';

/// Layar Top Up E-Wallet & Uang Elektronik Bank bjb
class TopUpScreen extends StatefulWidget {
  const TopUpScreen({super.key});

  @override
  State<TopUpScreen> createState() => _TopUpScreenState();
}

class _TopUpScreenState extends State<TopUpScreen> {
  String _selectedWallet = 'GoPay';
  final _phoneController = TextEditingController(text: '081234567890');
  int _selectedAmount = 100000;

  final List<String> _wallets = ['GoPay', 'OVO', 'DANA', 'ShopeePay', 'LinkAja', 'e-Money bjb'];
  final List<int> _presets = [20000, 50000, 100000, 200000, 500000, 1000000];

  @override
  void dispose() {
    _phoneController.dispose();
    super.dispose();
  }

  void _onProcessTopUp() {
    final phone = _phoneController.text.trim();
    if (phone.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Nomor ponsel akun e-wallet wajib diisi')),
      );
      return;
    }

    PinConfirmationModal.show(
      context,
      title: 'Konfirmasi Top Up $_selectedWallet',
      subtitle: 'Isi saldo Rp ${NumberFormat('#,###', 'id_ID').format(_selectedAmount)} ke $phone',
      onPinConfirmed: (pin) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (_) => ReceiptScreen(
              title: 'Top Up $_selectedWallet',
              amount: 'Rp ${NumberFormat('#,###', 'id_ID').format(_selectedAmount)}',
              receiverAccount: phone,
              receiverName: 'Billy Jonathan ($_selectedWallet)',
              category: 'Top Up E-Wallet',
              refNumber: 'REF-TOPUP-${DateTime.now().millisecondsSinceEpoch.toString().substring(5)}',
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
        title: const Text('Top Up E-Wallet'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Pilih Dompet Digital', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700)),
              const SizedBox(height: 10),

              // Wallet Selector Grid
              GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: _wallets.length,
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 3,
                  mainAxisSpacing: 10,
                  crossAxisSpacing: 10,
                  childAspectRatio: 2.3,
                ),
                itemBuilder: (context, index) {
                  final wallet = _wallets[index];
                  final isSelected = _selectedWallet == wallet;
                  return InkWell(
                    onTap: () {
                      HapticFeedback.selectionClick();
                      setState(() => _selectedWallet = wallet);
                    },
                    borderRadius: BorderRadius.circular(10),
                    child: Container(
                      decoration: BoxDecoration(
                        color: isSelected ? AppColors.primary.withOpacity(0.1) : AppColors.surface,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                          color: isSelected ? AppColors.primary : AppColors.border,
                          width: isSelected ? 1.5 : 1,
                        ),
                      ),
                      child: Center(
                        child: Text(
                          wallet,
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                            color: isSelected ? AppColors.primary : AppColors.textPrimary,
                          ),
                        ),
                      ),
                    ),
                  );
                },
              ),

              const SizedBox(height: 20),

              // Input Nomor Telepon
              CustomTextField(
                controller: _phoneController,
                label: 'Nomor Ponsel Akun $_selectedWallet',
                hint: 'Contoh: 081234567890',
                keyboardType: TextInputType.phone,
                prefixIcon: const Icon(Icons.phone_android_rounded, color: AppColors.primary, size: 20),
              ),

              const SizedBox(height: 24),

              const Text('Pilih Nominal Saldo', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700)),
              const SizedBox(height: 10),

              // Nominal Grid
              GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: _presets.length,
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  mainAxisSpacing: 10,
                  crossAxisSpacing: 10,
                  childAspectRatio: 2.2,
                ),
                itemBuilder: (context, index) {
                  final amount = _presets[index];
                  final isSelected = _selectedAmount == amount;
                  return InkWell(
                    onTap: () {
                      HapticFeedback.selectionClick();
                      setState(() => _selectedAmount = amount);
                    },
                    borderRadius: BorderRadius.circular(12),
                    child: Container(
                      decoration: BoxDecoration(
                        color: isSelected ? AppColors.primary : AppColors.surface,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: isSelected ? AppColors.primary : AppColors.border,
                        ),
                      ),
                      child: Center(
                        child: Text(
                          'Rp ${NumberFormat('#,###', 'id_ID').format(amount)}',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                            color: isSelected ? Colors.white : AppColors.textPrimary,
                          ),
                        ),
                      ),
                    ),
                  );
                },
              ),

              const SizedBox(height: 32),

              ElevatedButton(
                onPressed: _onProcessTopUp,
                child: const Text('Lanjutkan Pembayaran Top Up'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
