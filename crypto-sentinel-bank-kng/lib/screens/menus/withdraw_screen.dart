import 'dart:async';
import 'dart:math';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import '../../core/constants/colors.dart';
import '../../core/constants/text_styles.dart';
import '../../widgets/pin_confirmation_modal.dart';

/// Halaman Fungsional Tarik Tunai Tanpa Kartu (Cardless Withdrawal di ATM Bank Kuningan)
class WithdrawScreen extends StatefulWidget {
  const WithdrawScreen({super.key});

  @override
  State<WithdrawScreen> createState() => _WithdrawScreenState();
}

class _WithdrawScreenState extends State<WithdrawScreen> {
  String? _selectedAmount;
  String? _generatedCode;
  Timer? _countdownTimer;
  int _secondsRemaining = 900; // 15 Menit

  final List<String> _amounts = [
    '100.000',
    '200.000',
    '300.000',
    '500.000',
    '1.000.000',
    '1.500.000',
    '2.000.000',
  ];

  @override
  void dispose() {
    _countdownTimer?.cancel();
    super.dispose();
  }

  void _startCountdown() {
    _countdownTimer?.cancel();
    _secondsRemaining = 900;
    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_secondsRemaining > 0) {
        setState(() => _secondsRemaining--);
      } else {
        timer.cancel();
        setState(() => _generatedCode = null);
      }
    });
  }

  void _generateWithdrawCode() {
    if (_selectedAmount == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Pilih nominal tarik tunai terlebih dahulu')),
      );
      return;
    }

    PinConfirmationModal.show(
      context,
      title: 'Tarik Tunai Tanpa Kartu',
      recipientText: 'ATM Bank Kuningan (Seluruh Indonesia)',
      amountText: 'Rp $_selectedAmount',
      onPinSuccess: () {
        setState(() {
          // Generate 6 digit random code
          _generatedCode = (100000 + Random().nextInt(900000)).toString();
        });
        _startCountdown();
      },
    );
  }

  String _formatTime(int totalSeconds) {
    final minutes = totalSeconds ~/ 60;
    final seconds = totalSeconds % 60;
    return '${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    if (_generatedCode != null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Kode Tarik Tunai ATM')),
        body: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: AppColors.primary, width: 2),
                  boxShadow: [BoxShadow(color: AppColors.primary.withOpacity(0.1), blurRadius: 24)],
                ),
                child: Column(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(color: AppColors.accentYellow.withOpacity(0.2), shape: BoxShape.circle),
                      child: const Icon(CupertinoIcons.money_dollar_circle_fill, color: AppColors.primaryDark, size: 48),
                    ),
                    const SizedBox(height: 16),
                    Text('Nominal Tarik Tunai', style: AppTextStyles.textTheme.bodyMedium),
                    Text('Rp $_selectedAmount', style: AppTextStyles.textTheme.displayMedium?.copyWith(color: AppColors.primaryDark, fontWeight: FontWeight.w800)),
                    const SizedBox(height: 24),
                    Divider(color: AppColors.border.withOpacity(0.8)),
                    const SizedBox(height: 18),
                    Text('KODE TARIK TUNAI (6 DIGIT)', style: AppTextStyles.textTheme.labelSmall?.copyWith(letterSpacing: 1.5, color: AppColors.textSecondary)),
                    const SizedBox(height: 10),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 14),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withOpacity(0.08),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Text(
                        '${_generatedCode!.substring(0, 3)} - ${_generatedCode!.substring(3, 6)}',
                        style: AppTextStyles.textTheme.displaySmall?.copyWith(color: AppColors.primary, fontWeight: FontWeight.w900, letterSpacing: 4),
                      ),
                    ),
                    const SizedBox(height: 20),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(CupertinoIcons.time_solid, color: AppColors.accentRed, size: 20),
                        const SizedBox(width: 8),
                        Text(
                          'Berlaku hingga: ${_formatTime(_secondsRemaining)}',
                          style: AppTextStyles.textTheme.titleMedium?.copyWith(color: AppColors.accentRed, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 28),
              _buildInstructionCard(),
              const SizedBox(height: 28),
              ElevatedButton(
                onPressed: () => Navigator.pop(context),
                style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 18)),
                child: const Text('Selesai / Kembali ke Beranda'),
              ),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Tarik Tunai Tanpa Kartu')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.primary.withOpacity(0.08),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Row(
                children: [
                  const Icon(CupertinoIcons.info_circle_fill, color: AppColors.primary, size: 28),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Text(
                      'Tarik uang tunai di seluruh mesin ATM Bank Kuningan tanpa perlu kartu ATM fisik. Cukup gunakan kode 6 digit.',
                      style: AppTextStyles.textTheme.bodySmall?.copyWith(color: AppColors.primaryDark),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            Text('Pilih Nominal Tarik Tunai', style: AppTextStyles.textTheme.labelLarge),
            const SizedBox(height: 12),
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: 2.2,
              ),
              itemCount: _amounts.length,
              itemBuilder: (context, index) {
                final amt = _amounts[index];
                final isSelected = _selectedAmount == amt;
                return GestureDetector(
                  onTap: () => setState(() => _selectedAmount = amt),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 180),
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      color: isSelected ? AppColors.primary : AppColors.surface,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: isSelected ? AppColors.primary : AppColors.border),
                    ),
                    child: Text(
                      'Rp $amt',
                      style: AppTextStyles.textTheme.titleMedium?.copyWith(
                        color: isSelected ? Colors.white : AppColors.textPrimary,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                );
              },
            ),
            const SizedBox(height: 36),
            ElevatedButton(
              onPressed: _generateWithdrawCode,
              style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 18)),
              child: const Text('Buat Kode Tarik Tunai'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInstructionCard() {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Cara Tarik Tunai di ATM:', style: AppTextStyles.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
          const SizedBox(height: 10),
          _stepRow(1, 'Datangi mesin ATM Bank Kuningan terdekat.'),
          _stepRow(2, 'Tekan tombol hijau / pilih menu "Tarik Tunai Tanpa Kartu" di layar ATM.'),
          _stepRow(3, 'Masukkan nomor HP Anda yang terdaftar di aplikasi.'),
          _stepRow(4, 'Masukkan 6 Digit Kode Tarik Tunai di atas, dan uang akan keluar!'),
        ],
      ),
    );
  }

  Widget _stepRow(int step, String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CircleAvatar(
            radius: 10,
            backgroundColor: AppColors.primary,
            child: Text('$step', style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
          ),
          const SizedBox(width: 10),
          Expanded(child: Text(text, style: AppTextStyles.textTheme.bodySmall)),
        ],
      ),
    );
  }
}
