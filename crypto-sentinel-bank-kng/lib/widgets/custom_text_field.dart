import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../core/constants/colors.dart';
import '../core/constants/text_styles.dart';

/// Input Text kustom yang bersih dan modern untuk aplikasi Bank Kuningan.
/// Mendukung toggle show/hide untuk PIN dan input biasa untuk Username.
class CustomTextField extends StatefulWidget {
  final String label;
  final String hint;
  final IconData prefixIcon;
  final bool isPassword;
  final TextEditingController? controller;
  final TextInputType keyboardType;
  final int? maxLength;
  final ValueChanged<String>? onChanged;
  final List<TextInputFormatter>? inputFormatters;

  const CustomTextField({
    super.key,
    required this.label,
    required this.hint,
    required this.prefixIcon,
    this.isPassword = false,
    this.controller,
    this.keyboardType = TextInputType.text,
    this.maxLength,
    this.onChanged,
    this.inputFormatters,
  });

  @override
  State<CustomTextField> createState() => _CustomTextFieldState();
}

class _CustomTextFieldState extends State<CustomTextField> {
  late bool _obscureText;

  @override
  void initState() {
    super.initState();
    _obscureText = widget.isPassword;
  }

  void _toggleVisibility() {
    setState(() {
      _obscureText = !_obscureText;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          widget.label,
          style: AppTextStyles.textTheme.labelLarge?.copyWith(
            color: AppColors.textPrimary,
            fontWeight: FontWeight.w700,
          ),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: widget.controller,
          obscureText: _obscureText,
          keyboardType: widget.keyboardType,
          maxLength: widget.maxLength,
          onChanged: widget.onChanged,
          inputFormatters: widget.inputFormatters,
          autocorrect: false,
          enableSuggestions: false,
          textInputAction: widget.isPassword ? TextInputAction.done : TextInputAction.next,
          style: AppTextStyles.textTheme.bodyLarge?.copyWith(
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
            letterSpacing: _obscureText ? 3.0 : 0.0,
          ),
          decoration: InputDecoration(
            hintText: widget.hint,
            hintStyle: AppTextStyles.textTheme.bodyMedium?.copyWith(
              color: AppColors.textHint,
              letterSpacing: 0.0,
            ),
            counterText: '',
            prefixIcon: Icon(
              widget.prefixIcon,
              color: AppColors.primary,
              size: 22,
            ),
            suffixIcon: widget.isPassword
                ? IconButton(
                    icon: Icon(
                      _obscureText ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                      color: AppColors.textSecondary,
                    ),
                    onPressed: _toggleVisibility,
                    tooltip: _obscureText ? 'Tampilkan PIN' : 'Sembunyikan PIN',
                  )
                : null,
          ),
        ),
      ],
    );
  }
}

/// Formatter untuk mengubah angka menjadi format Rupiah (dengan pemisah titik) secara otomatis.
class RupiahInputFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(
    TextEditingValue oldValue,
    TextEditingValue newValue,
  ) {
    if (newValue.text.isEmpty) {
      return newValue.copyWith(text: '');
    }
    final cleanText = newValue.text.replaceAll(RegExp(r'[^0-9]'), '');
    if (cleanText.isEmpty) {
      return newValue.copyWith(text: '');
    }
    final formatted = _formatNumber(cleanText);
    return TextEditingValue(
      text: formatted,
      selection: TextSelection.collapsed(offset: formatted.length),
    );
  }

  static String _formatNumber(String s) {
    final buffer = StringBuffer();
    for (int i = 0; i < s.length; i++) {
      if (i > 0 && (s.length - i) % 3 == 0) {
        buffer.write('.');
      }
      buffer.write(s[i]);
    }
    return buffer.toString();
  }
}
