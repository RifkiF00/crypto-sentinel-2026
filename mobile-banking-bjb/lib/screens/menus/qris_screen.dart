import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../core/constants/colors.dart';
import '../../widgets/pin_confirmation_modal.dart';
import 'receipt_screen.dart';

/// Layar QRIS Bank bjb (Scanner Kamera & Simulasi Pembayaran Merchant)
class QrisScreen extends StatefulWidget {
  const QrisScreen({super.key});

  @override
  State<QrisScreen> createState() => _QrisScreenState();
}

class _QrisScreenState extends State<QrisScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _laserController;
  late Animation<double> _laserAnimation;
  bool _flashOn = false;

  @override
  void initState() {
    super.initState();
    _laserController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1600),
    )..repeat(reverse: true);

    _laserAnimation = Tween<double>(begin: 0.05, end: 0.95).animate(
      CurvedAnimation(parent: _laserController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _laserController.dispose();
    super.dispose();
  }

  void _onPayMerchant(String merchantName, int amount) {
    HapticFeedback.mediumImpact();
    PinConfirmationModal.show(
      context,
      title: 'Otorisasi QRIS bjb',
      subtitle: 'Bayar Rp 45.000 ke $merchantName',
      onPinConfirmed: (pin) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (_) => ReceiptScreen(
              title: 'QRIS $merchantName',
              amount: 'Rp 45.000',
              receiverAccount: 'NMID: ID1020039182991',
              receiverName: merchantName,
              category: 'QRIS Pembayaran',
              refNumber: 'REF-QRIS-${DateTime.now().millisecondsSinceEpoch.toString().substring(5)}',
              status: 'BERHASIL',
              adminFee: 'Gratis (Rp 0)',
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A192F),
      appBar: AppBar(
        title: const Text('QRIS bjb', style: TextStyle(color: Colors.white)),
        backgroundColor: const Color(0xFF0A192F),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: SafeArea(
        child: Column(
          children: [
            const SizedBox(height: 20),
            const Text(
              'Arahkan kamera ke QRIS Standar Bank Indonesia',
              style: TextStyle(fontSize: 13, color: Colors.white70),
            ),
            const SizedBox(height: 32),

            // Scanner Viewfinder
            Center(
              child: Stack(
                children: [
                  Container(
                    width: 260,
                    height: 260,
                    decoration: BoxDecoration(
                      color: Colors.black.withOpacity(0.4),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: Colors.white30, width: 1.5),
                    ),
                  ),

                  // Animated Laser
                  AnimatedBuilder(
                    animation: _laserAnimation,
                    builder: (context, child) {
                      return Positioned(
                        top: 260 * _laserAnimation.value,
                        left: 12,
                        right: 12,
                        child: Container(
                          height: 2,
                          decoration: const BoxDecoration(
                            gradient: LinearGradient(
                              colors: [
                                Colors.transparent,
                                AppColors.accentSky,
                                Colors.white,
                                AppColors.accentSky,
                                Colors.transparent,
                              ],
                            ),
                            boxShadow: [
                              BoxShadow(color: AppColors.accentSky, blurRadius: 8, spreadRadius: 2),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ],
              ),
            ),

            const SizedBox(height: 28),

            // Kontrol Senter & Galeri
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                IconButton(
                  iconSize: 26,
                  style: IconButton.styleFrom(
                    backgroundColor: Colors.white.withOpacity(_flashOn ? 0.3 : 0.1),
                    padding: const EdgeInsets.all(12),
                  ),
                  icon: Icon(_flashOn ? Icons.flash_on_rounded : Icons.flash_off_rounded, color: Colors.white),
                  onPressed: () => setState(() => _flashOn = !_flashOn),
                ),
                const SizedBox(width: 24),
                IconButton(
                  iconSize: 26,
                  style: IconButton.styleFrom(
                    backgroundColor: Colors.white.withOpacity(0.1),
                    padding: const EdgeInsets.all(12),
                  ),
                  icon: const Icon(Icons.image_rounded, color: Colors.white),
                  onPressed: () => _onPayMerchant('Kopi Sejahtera Bandung', 45000),
                ),
              ],
            ),

            const Spacer(),

            // Simulasi Cepat
            Padding(
              padding: const EdgeInsets.all(24),
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.accentSky,
                  foregroundColor: Colors.white,
                ),
                icon: const Icon(Icons.qr_code_scanner_rounded),
                label: const Text('Simulasi Scan Merchant (Rp 45.000)'),
                onPressed: () => _onPayMerchant('Kopi Sejahtera Bandung', 45000),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
