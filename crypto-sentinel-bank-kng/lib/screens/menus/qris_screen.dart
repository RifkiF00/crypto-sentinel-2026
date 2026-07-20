import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import '../../core/constants/colors.dart';
import '../../core/constants/text_styles.dart';
import '../../widgets/custom_text_field.dart';
import '../../widgets/pin_confirmation_modal.dart';
import 'receipt_screen.dart';

/// Halaman Simulasi Kamera Pemindai QRIS (Material Design 3)
class QrisScreen extends StatefulWidget {
  const QrisScreen({super.key});

  @override
  State<QrisScreen> createState() => _QrisScreenState();
}

class _QrisScreenState extends State<QrisScreen> with SingleTickerProviderStateMixin {
  late AnimationController _scannerController;
  late Animation<double> _scannerAnimation;
  bool _isFlashlightOn = false;
  bool _showPaymentModal = false;

  // Merchant mock untuk simulasi scan
  final Map<String, String> _mockMerchant = {
    'name': 'Kopi Nusantara Kencana',
    'id': 'QRIS-ID-88992233',
    'location': 'Kuningan, Jawa Barat',
  };
  final TextEditingController _amountController = TextEditingController(text: '45000');

  @override
  void initState() {
    super.initState();
    _scannerController = AnimationController(vsync: this, duration: const Duration(milliseconds: 1800))..repeat(reverse: true);
    _scannerAnimation = Tween<double>(begin: 0.1, end: 0.9).animate(CurvedAnimation(parent: _scannerController, curve: Curves.easeInOut));
  }

  @override
  void dispose() {
    _scannerController.dispose();
    _amountController.dispose();
    super.dispose();
  }

  void _triggerMockScan() {
    setState(() {
      _showPaymentModal = true;
    });
  }

  void _handlePayQris() {
    final amountText = 'Rp ${_amountController.text}';
    PinConfirmationModal.show(
      context,
      title: 'Bayar QRIS',
      recipientText: '${_mockMerchant['name']} (${_mockMerchant['location']})',
      amountText: amountText,
      onPinSuccess: () {
        final refNo = 'REF-QR${DateTime.now().millisecondsSinceEpoch.toString().substring(4)}';
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (context) => ReceiptScreen(
              title: 'Pembayaran QRIS',
              recipientName: _mockMerchant['name']!,
              recipientDetail: 'ID Merchant: ${_mockMerchant['id']} • ${_mockMerchant['location']}',
              amount: amountText,
              adminFee: 'GRATIS (Promo)',
              totalAmount: amountText,
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
    if (_showPaymentModal) {
      return Scaffold(
        appBar: AppBar(
          title: const Text('Pembayaran QRIS'),
          leading: IconButton(icon: const Icon(CupertinoIcons.arrow_left), onPressed: () => setState(() => _showPaymentModal = false)),
        ),
        body: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Kartu Merchant
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppColors.border),
                  boxShadow: [BoxShadow(color: AppColors.shadow.withOpacity(0.08), blurRadius: 20)],
                ),
                child: Column(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(color: AppColors.primary.withOpacity(0.1), shape: BoxShape.circle),
                      child: const Icon(CupertinoIcons.qrcode_viewfinder, color: AppColors.primary, size: 44),
                    ),
                    const SizedBox(height: 14),
                    Text(_mockMerchant['name']!, style: AppTextStyles.textTheme.headlineMedium, textAlign: TextAlign.center),
                    const SizedBox(height: 4),
                    Text('${_mockMerchant['location']} • ${_mockMerchant['id']}', style: AppTextStyles.textTheme.bodySmall, textAlign: TextAlign.center),
                    const SizedBox(height: 16),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(color: AppColors.accentGreen.withOpacity(0.12), borderRadius: BorderRadius.circular(10)),
                      child: Text('QRIS TERVERIFIKASI OJK & BI', style: AppTextStyles.textTheme.labelSmall?.copyWith(color: AppColors.accentGreen, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 28),

              CustomTextField(
                label: 'Nominal Bayar (Rp)',
                hint: 'Masukkan nominal',
                prefixIcon: CupertinoIcons.money_dollar_circle_fill,
                controller: _amountController,
                keyboardType: TextInputType.number,
              ),
              const SizedBox(height: 16),
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: ['15000', '25000', '45000', '75000', '120000'].map((amt) {
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
              const SizedBox(height: 36),

              ElevatedButton(
                onPressed: _handlePayQris,
                style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 18)),
                child: const Text('Bayar QRIS Sekarang'),
              ),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: Colors.black,
      body: SafeArea(
        child: Stack(
          children: [
            // Latar Kamera Gelap dengan Viewport
            Positioned.fill(
              child: Container(
                decoration: const BoxDecoration(
                  gradient: RadialGradient(colors: [Color(0xFF1E293B), Colors.black], radius: 0.8),
                ),
              ),
            ),

            // Frame Pemindai QR di Tengah
            Center(
              child: Container(
                width: 280,
                height: 280,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: AppColors.accentYellow, width: 3),
                  boxShadow: [BoxShadow(color: AppColors.accentYellow.withOpacity(0.2), blurRadius: 30)],
                ),
                child: AnimatedBuilder(
                  animation: _scannerAnimation,
                  builder: (context, child) {
                    return Align(
                      alignment: Alignment(0, (_scannerAnimation.value * 2) - 1),
                      child: Container(
                        height: 3,
                        margin: const EdgeInsets.symmetric(horizontal: 12),
                        decoration: BoxDecoration(
                          color: AppColors.accentGreen,
                          boxShadow: [BoxShadow(color: AppColors.accentGreen, blurRadius: 10, spreadRadius: 2)],
                        ),
                      ),
                    );
                  },
                ),
              ),
            ),

            // Header Top Bar
            Positioned(
              top: 16,
              left: 16,
              right: 16,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  IconButton(
                    icon: const Icon(CupertinoIcons.clear_circled_solid, color: Colors.white, size: 32),
                    onPressed: () => Navigator.pop(context),
                  ),
                  Text('Pemindai QRIS Bank Kuningan', style: AppTextStyles.textTheme.titleMedium?.copyWith(color: Colors.white)),
                  IconButton(
                    icon: Icon(_isFlashlightOn ? CupertinoIcons.lightbulb_fill : CupertinoIcons.lightbulb, color: _isFlashlightOn ? AppColors.accentYellow : Colors.white, size: 28),
                    onPressed: () => setState(() => _isFlashlightOn = !_isFlashlightOn),
                  ),
                ],
              ),
            ),

            // Bottom Info & Simulasi Scan Button
            Positioned(
              bottom: 40,
              left: 24,
              right: 24,
              child: Column(
                children: [
                  Text(
                    'Arahkan kamera ke kode QRIS merchant atau toko.',
                    style: AppTextStyles.textTheme.bodyMedium?.copyWith(color: Colors.white70),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 24),
                  ElevatedButton.icon(
                    onPressed: _triggerMockScan,
                    icon: const Icon(CupertinoIcons.qrcode),
                    label: const Text('Simulasi Scan Berhasil (Mock Merchant)'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.accentYellow,
                      foregroundColor: AppColors.primaryDark,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
