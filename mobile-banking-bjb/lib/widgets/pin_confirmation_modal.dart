import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../core/constants/colors.dart';
import '../core/constants/strings.dart';

/// Modal Keypad Virtual 6 Digit PIN untuk Otorisasi Transaksi
class PinConfirmationModal extends StatefulWidget {
  final String title;
  final String subtitle;
  final Function(String pin) onPinConfirmed;

  const PinConfirmationModal({
    super.key,
    this.title = AppStrings.confirmPinTitle,
    this.subtitle = AppStrings.confirmPinSubtitle,
    required this.onPinConfirmed,
  });

  static Future<void> show(
    BuildContext context, {
    String title = AppStrings.confirmPinTitle,
    String subtitle = AppStrings.confirmPinSubtitle,
    required Function(String pin) onPinConfirmed,
  }) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => PinConfirmationModal(
        title: title,
        subtitle: subtitle,
        onPinConfirmed: onPinConfirmed,
      ),
    );
  }

  @override
  State<PinConfirmationModal> createState() => _PinConfirmationModalState();
}

class _PinConfirmationModalState extends State<PinConfirmationModal> {
  String _currentPin = '';

  void _onKeyPress(String val) {
    if (_currentPin.length < 6) {
      HapticFeedback.lightImpact();
      setState(() {
        _currentPin += val;
      });

      if (_currentPin.length == 6) {
        Future.delayed(const Duration(milliseconds: 250), () {
          if (!mounted) return;
          Navigator.pop(context);
          widget.onPinConfirmed(_currentPin);
        });
      }
    }
  }

  void _onBackspace() {
    if (_currentPin.isNotEmpty) {
      HapticFeedback.selectionClick();
      setState(() {
        _currentPin = _currentPin.substring(0, _currentPin.length - 1);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
      child: SafeArea(
        top: false,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Handle Bar Modal
            Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: AppColors.border,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(height: 16),

            // Judul & Subjudul
            Text(
              widget.title,
              style: const TextStyle(
                fontSize: 17,
                fontWeight: FontWeight.w700,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              widget.subtitle,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 12,
                color: AppColors.textSecondary,
                height: 1.4,
              ),
            ),
            const SizedBox(height: 24),

            // 6 Dot Indikator PIN
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(6, (index) {
                final bool isFilled = index < _currentPin.length;
                return AnimatedContainer(
                  duration: const Duration(milliseconds: 150),
                  margin: const EdgeInsets.symmetric(horizontal: 8),
                  width: 16,
                  height: 16,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: isFilled ? AppColors.primary : AppColors.surfaceVariant,
                    border: Border.all(
                      color: isFilled ? AppColors.primary : AppColors.border,
                      width: 1.5,
                    ),
                  ),
                );
              }),
            ),
            const SizedBox(height: 32),

            // Keypad Grid 3x4
            _buildKeypadGrid(),

            const SizedBox(height: 12),
          ],
        ),
      ),
    );
  }

  Widget _buildKeypadGrid() {
    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            _buildKeyButton('1'),
            _buildKeyButton('2'),
            _buildKeyButton('3'),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            _buildKeyButton('4'),
            _buildKeyButton('5'),
            _buildKeyButton('6'),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            _buildKeyButton('7'),
            _buildKeyButton('8'),
            _buildKeyButton('9'),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            // Tombol Biometrik
            IconButton(
              iconSize: 28,
              icon: const Icon(Icons.fingerprint, color: AppColors.primary),
              onPressed: () {
                HapticFeedback.mediumImpact();
                Navigator.pop(context);
                widget.onPinConfirmed('123456'); // Bypass simulasi biometrik
              },
            ),
            _buildKeyButton('0'),
            // Tombol Hapus (Backspace)
            IconButton(
              iconSize: 26,
              icon: const Icon(Icons.backspace_outlined, color: AppColors.textSecondary),
              onPressed: _onBackspace,
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildKeyButton(String val) {
    return InkWell(
      onTap: () => _onKeyPress(val),
      borderRadius: BorderRadius.circular(36),
      child: Container(
        width: 70,
        height: 70,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: AppColors.surfaceVariant.withOpacity(0.6),
          shape: BoxShape.circle,
        ),
        child: Text(
          val,
          style: const TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.w700,
            color: AppColors.textPrimary,
          ),
        ),
      ),
    );
  }
}
