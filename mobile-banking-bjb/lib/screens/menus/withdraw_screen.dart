import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../core/constants/colors.dart';
import '../../widgets/pin_confirmation_modal.dart';

/// Layar Tarik Tunai Tanpa Kartu di ATM Bank bjb
class WithdrawScreen extends StatefulWidget {
  const WithdrawScreen({super.key});

  @override
  State<WithdrawScreen> createState() => _WithdrawScreenState();
}

class _WithdrawScreenState extends State<WithdrawScreen> {
  int _selectedAmount = 200000;
  String? _generatedCode;
  Timer? _timer;
  int _remainingSeconds = 900; // 15 Menit

  final List<int> _amounts = [100000, 200000, 300000, 500000, 1000000, 1500000];

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  void _startTimer() {
    _timer?.cancel();
    _remainingSeconds = 900;
    _timer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (_remainingSeconds > 0) {
        setState(() => _remainingSeconds--);
      } else {
        t.cancel();
        setState(() => _generatedCode = null);
      }
    });
  }

  String _formatTimer(int sec) {
    final m = (sec ~/ 60).toString().padLeft(2, '0');
    final s = (sec % 60).toString().padLeft(2, '0');
    return '$m:$s';
  }

  void _onGenerateCode() {
    PinConfirmationModal.show(
      context,
      title: 'Otorisasi Tarik Tunai',
      subtitle: 'Buat kode tarik tunai Rp $_selectedAmount di ATM bjb',
      onPinConfirmed: (pin) {
        setState(() {
          _generatedCode = '882 194';
        });
        _startTimer();
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Tarik Tunai Tanpa Kartu'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Banner Informasi ATM bjb
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [AppColors.primary, AppColors.primaryDark],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.atm_rounded, color: AppColors.accentGold, size: 32),
                    SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'ATM Bank bjb & Bank Kuningan',
                            style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: Colors.white),
                          ),
                          SizedBox(height: 2),
                          Text(
                            'Tarik uang tunai tanpa kartu fisik cukup dengan kode 6 digit di seluruh ATM bjb.',
                            style: TextStyle(fontSize: 11, color: Colors.white70, height: 1.3),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              if (_generatedCode == null) ...[
                const Text('Pilih Nominal Penarikan', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
                const SizedBox(height: 12),

                // Grid Nominal Penarikan
                GridView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: _amounts.length,
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    mainAxisSpacing: 12,
                    crossAxisSpacing: 12,
                    childAspectRatio: 2.2,
                  ),
                  itemBuilder: (context, index) {
                    final amount = _amounts[index];
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
                            'Rp ${(amount / 1000).toStringAsFixed(0)}.000',
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
                  onPressed: _onGenerateCode,
                  child: const Text('Buat Kode Tarik Tunai'),
                ),
              ] else ...[
                // Card Hasil Kode 6 Digit
                Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: AppColors.primary, width: 1.5),
                  ),
                  child: Column(
                    children: [
                      const Text(
                        'KODE TRANSAKSI ATM bjb',
                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.primary),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        _generatedCode!,
                        style: const TextStyle(
                          fontSize: 34,
                          fontWeight: FontWeight.w900,
                          color: AppColors.primaryDark,
                          letterSpacing: 4.0,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.timer_outlined, color: AppColors.accentRed, size: 18),
                          const SizedBox(width: 6),
                          Text(
                            'Berlaku selama: ${_formatTimer(_remainingSeconds)}',
                            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.accentRed),
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),
                      const Divider(height: 1),
                      const SizedBox(height: 16),
                      const Text(
                        'Petunjuk di Mesin ATM bjb:\n1. Pilih menu "Transaksi Tanpa Kartu"\n2. Masukkan nomor HP Anda (+62 812-3456-7890)\n3. Masukkan 6 digit Kode di atas.',
                        style: TextStyle(fontSize: 12, color: AppColors.textSecondary, height: 1.5),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 24),

                OutlinedButton(
                  onPressed: () {
                    _timer?.cancel();
                    setState(() => _generatedCode = null);
                  },
                  child: const Text('Selesai / Buat Kode Baru'),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
