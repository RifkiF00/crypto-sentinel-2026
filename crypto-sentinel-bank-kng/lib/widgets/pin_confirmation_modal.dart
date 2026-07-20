import 'dart:async';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import '../core/constants/colors.dart';
import '../core/constants/text_styles.dart';

/// Modal Konfirmasi PIN 6 Digit untuk Transaksi (Transfer, Top Up, Pembayaran, dll).
/// Menggunakan keypad virtual elegan bergaya ATM/banking modern untuk keamanan dan kenyamanan.
class PinConfirmationModal extends StatefulWidget {
  final String title;
  final String amountText;
  final String recipientText;
  final VoidCallback onPinSuccess;

  const PinConfirmationModal({
    super.key,
    required this.title,
    required this.amountText,
    required this.recipientText,
    required this.onPinSuccess,
  });

  static void show(
    BuildContext context, {
    required String title,
    required String amountText,
    required String recipientText,
    required VoidCallback onPinSuccess,
  }) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => PinConfirmationModal(
        title: title,
        amountText: amountText,
        recipientText: recipientText,
        onPinSuccess: onPinSuccess,
      ),
    );
  }

  @override
  State<PinConfirmationModal> createState() => _PinConfirmationModalState();
}

class _PinConfirmationModalState extends State<PinConfirmationModal> {
  String _enteredPin = '';
  bool _isVerifying = false;
  bool _hasError = false;

  void _onNumberTapped(String number) {
    if (_enteredPin.length < 6 && !_isVerifying) {
      setState(() {
        _enteredPin += number;
        _hasError = false;
      });

      if (_enteredPin.length == 6) {
        _verifyPin();
      }
    }
  }

  void _onBackspaceTapped() {
    if (_enteredPin.isNotEmpty && !_isVerifying) {
      setState(() {
        _enteredPin = _enteredPin.substring(0, _enteredPin.length - 1);
      });
    }
  }

  void _verifyPin() {
    setState(() {
      _isVerifying = true;
    });

    // Simulasi verifikasi keamanan bank (1 detik)
    Timer(const Duration(milliseconds: 1000), () {
      if (mounted) {
        Navigator.pop(context);
        widget.onPinSuccess();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
      decoration: const BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(28),
          topRight: Radius.circular(28),
        ),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Handle indikator geser
          Container(
            width: 44,
            height: 5,
            decoration: BoxDecoration(
              color: AppColors.border,
              borderRadius: BorderRadius.circular(10),
            ),
          ),
          const SizedBox(height: 20),

          // Judul Transaksi
          Text(
            widget.title,
            style: AppTextStyles.textTheme.headlineMedium?.copyWith(
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            widget.recipientText,
            style: AppTextStyles.textTheme.bodyMedium?.copyWith(
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            widget.amountText,
            style: AppTextStyles.textTheme.headlineLarge?.copyWith(
              color: AppColors.primary,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 24),
          Divider(color: AppColors.border.withOpacity(0.6)),
          const SizedBox(height: 16),

          Text(
            'Masukkan 6 Digit PIN Bank Kuningan Anda',
            style: AppTextStyles.textTheme.labelLarge?.copyWith(
              color: AppColors.textPrimary,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 18),

          // Indikator Titik PIN 6 Digit
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(6, (index) {
              final isFilled = index < _enteredPin.length;
              return AnimatedContainer(
                duration: const Duration(milliseconds: 180),
                margin: const EdgeInsets.symmetric(horizontal: 8),
                width: isFilled ? 18 : 16,
                height: isFilled ? 18 : 16,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: _hasError
                      ? AppColors.accentRed
                      : (isFilled ? AppColors.primary : AppColors.surfaceVariant),
                  border: Border.all(
                    color: _hasError
                        ? AppColors.accentRed
                        : (isFilled ? AppColors.primary : AppColors.textHint),
                    width: 1.5,
                  ),
                ),
              );
            }),
          ),
          const SizedBox(height: 20),

          if (_isVerifying)
            const Padding(
              padding: EdgeInsets.only(bottom: 12),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(strokeWidth: 2.5, color: AppColors.primary),
                  ),
                  SizedBox(width: 10),
                  Text('Memverifikasi PIN...'),
                ],
              ),
            )
          else
            const SizedBox(height: 30),

          // Keypad Virtual Angka (1-9, 0, Backspace)
          _buildKeypad(),
          const SizedBox(height: 16),
        ],
      ),
    );
  }

  Widget _buildKeypad() {
    return Column(
      children: [
        _buildKeypadRow(['1', '2', '3']),
        const SizedBox(height: 14),
        _buildKeypadRow(['4', '5', '6']),
        const SizedBox(height: 14),
        _buildKeypadRow(['7', '8', '9']),
        const SizedBox(height: 14),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            const SizedBox(width: 80, height: 56), // Placeholder kosong kiri
            _buildKeypadButton('0'),
            _buildKeypadAction(
              icon: CupertinoIcons.delete_left_fill,
              onTap: _onBackspaceTapped,
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildKeypadRow(List<String> numbers) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: numbers.map((num) => _buildKeypadButton(num)).toList(),
    );
  }

  Widget _buildKeypadButton(String number) {
    return Material(
      color: AppColors.surfaceVariant.withOpacity(0.7),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: InkWell(
        onTap: () => _onNumberTapped(number),
        borderRadius: BorderRadius.circular(16),
        child: Container(
          width: 80,
          height: 56,
          alignment: Alignment.center,
          child: Text(
            number,
            style: AppTextStyles.textTheme.headlineLarge?.copyWith(
              color: AppColors.textPrimary,
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildKeypadAction({required IconData icon, required VoidCallback onTap}) {
    return Material(
      color: Colors.transparent,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Container(
          width: 80,
          height: 56,
          alignment: Alignment.center,
          child: Icon(icon, color: AppColors.textSecondary, size: 26),
        ),
      ),
    );
  }
}
