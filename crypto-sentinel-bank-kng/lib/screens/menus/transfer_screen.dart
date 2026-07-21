import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import '../../core/constants/colors.dart';
import '../../core/constants/text_styles.dart';
import '../../widgets/custom_text_field.dart';
import '../../widgets/pin_confirmation_modal.dart';
import '../../data/api_service.dart';
import 'receipt_screen.dart';

/// Halaman Fungsional Transfer Uang M-Banking Bank Kuningan (Multi-Step Verification)
class TransferScreen extends StatefulWidget {
  const TransferScreen({super.key});

  @override
  State<TransferScreen> createState() => _TransferScreenState();
}

class _TransferScreenState extends State<TransferScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final TextEditingController _accountController = TextEditingController();
  final TextEditingController _amountController = TextEditingController();
  final TextEditingController _noteController = TextEditingController();

  String _selectedTransferMethod = 'BI-FAST';
  String _selectedBank = 'Bank Central Asia (BCA)';

  bool _isAccountVerified = false;
  String _verifiedName = '';
  bool _isVerifying = false;

  final List<String> _banks = [
    'Bank Central Asia (BCA)',
    'Bank Mandiri',
    'Bank Rakyat Indonesia (BRI)',
    'Bank Negara Indonesia (BNI)',
    'Bank Syariah Indonesia (BSI)',
    'Bank CIMB Niaga',
    'Bank Permata',
  ];

  final List<Map<String, String>> _favorites = [
    {'name': 'Siti Rahma', 'account': '9876543210', 'bank': 'Bank Kuningan'},
    {'name': 'PT Indodax Nasional Indonesia', 'account': '9012666666', 'bank': 'BCA'},
    {'name': 'PT Binance Exchange Indonesia', 'account': '9012123456', 'bank': 'CIMB Niaga'},
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _accountController.dispose();
    _amountController.dispose();
    _noteController.dispose();
    super.dispose();
  }

  void _verifyAccount() async {
    final raw = _accountController.text.trim();
    final acc = raw.replaceAll(RegExp(r'[^0-9A-Za-z]'), '');

    if (raw.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Harap masukkan nomor rekening tujuan'),
          backgroundColor: AppColors.accentRed,
        ),
      );
      return;
    }

    setState(() => _isVerifying = true);

    // Deteksi Bank otomatis berdasarkan awalan nomor rekening
    String detectedBank = _selectedBank;
    if (acc.startsWith('8012')) {
      detectedBank = 'Bank Central Asia (BCA)';
    } else if (acc.startsWith('13700')) {
      detectedBank = 'Bank Mandiri';
    } else if (acc.startsWith('0912')) {
      detectedBank = 'Bank Negara Indonesia (BNI)';
    } else if (acc.startsWith('888801')) {
      detectedBank = 'Bank Rakyat Indonesia (BRI)';
    } else if (acc.startsWith('7054')) {
      detectedBank = 'Bank CIMB Niaga';
    } else if (acc.startsWith('9012666666')) {
      detectedBank = 'Bank Central Asia (BCA)';
    } else if (acc.startsWith('9012999999')) {
      detectedBank = 'Bank Mandiri';
    } else if (acc.startsWith('9012123456')) {
      detectedBank = 'Bank CIMB Niaga';
    } else if (acc.startsWith('9012777777')) {
      detectedBank = 'Bank Rakyat Indonesia (BRI)';
    } else if (acc.startsWith('9012888888')) {
      detectedBank = 'Bank Negara Indonesia (BNI)';
    }

    try {
      final res = await BankKuninganApiService.getAccountInfo(acc);
      if (res['success'] == true && res['ownerName'] != 'Billy Jonathan') {
        setState(() {
          _isVerifying = false;
          _isAccountVerified = true;
          _verifiedName = res['ownerName'] ?? 'Nama Tidak Diketahui';
          _selectedBank = detectedBank;
        });
        return;
      }
    } catch (e) {
      print('[Verification Warning] Gagal fetch ke API: $e');
    }

    // Fallback static untuk demo dan blacklisted exchanges
    String name = 'Nasabah Terverifikasi';
    if (acc == '9876543210' || acc == '098765432100') {
      name = 'Siti Rahma';
    } else if (acc == '1234567890') {
      name = 'Billy Jonathan';
    } else if (acc == '0123456789') {
      name = 'Rifki Firmansyah';
    } else if (acc == '9012666666') {
      name = 'PT Indodax Nasional Indonesia';
    } else if (acc == '9012999999') {
      name = 'PT Tokocrypto Indonesia';
    } else if (acc == '9012123456') {
      name = 'PT Binance Exchange Indonesia';
    } else if (acc == '9012777777') {
      name = 'Indodax Fraud Receiver';
    } else if (acc == '9012888888') {
      name = 'PT Pintu Kemakmuran Bersama';
    } else {
      name = 'Rekening ${_accountController.text} (${_tabController.index == 0 ? "Bank Kuningan" : detectedBank})';
    }

    if (mounted) {
      setState(() {
        _isVerifying = false;
        _isAccountVerified = true;
        _verifiedName = name;
        _selectedBank = detectedBank;
      });
    }
  }

  void _selectQuickAmount(String amount) {
    setState(() {
      _amountController.text = amount;
    });
  }

  void _onFavoriteSelected(Map<String, String> fav) {
    setState(() {
      if (fav['bank'] == 'Bank Kuningan') {
        _tabController.animateTo(0);
      } else {
        _tabController.animateTo(1);
        _selectedBank = fav['bank'] ?? 'Bank Central Asia (BCA)';
      }
      _accountController.text = fav['account'] ?? '';
      _isAccountVerified = true;
      _verifiedName = fav['name'] ?? 'Siti Rahma';
    });
  }

  void _handleTransfer() {
    if (!_isAccountVerified) {
      _verifyAccount();
      return;
    }

    if (_amountController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Harap masukkan nominal transfer'),
          backgroundColor: AppColors.accentRed,
        ),
      );
      return;
    }

    final isSesama = _tabController.index == 0;
    final bankName = isSesama ? 'Bank Kuningan' : _selectedBank;
    final amountInt = int.tryParse(_amountController.text.replaceAll(RegExp(r'[^0-9]'), '')) ?? 0;
    final amountText = 'Rp ${_amountController.text}';
    final adminFee = isSesama ? 'GRATIS' : 'Rp ${_selectedTransferMethod == 'BI-FAST' ? "2.500" : "6.500"} ($_selectedTransferMethod)';
    final totalAmountText = isSesama ? amountText : 'Rp ${_amountController.text} (+ Rp ${_selectedTransferMethod == 'BI-FAST' ? "2.500" : "6.500"})';

    PinConfirmationModal.show(
      context,
      title: 'Konfirmasi Transfer',
      recipientText: '$_verifiedName • $bankName',
      amountText: totalAmountText,
      onPinSuccess: () async {
        showDialog(
          context: context,
          barrierDismissible: false,
          builder: (ctx) => const Center(
            child: Card(
              child: Padding(
                padding: EdgeInsets.all(24.0),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    CircularProgressIndicator(color: AppColors.primary),
                    SizedBox(height: 16),
                    Text('Memproses Transfer & Verifikasi FDS...', style: TextStyle(fontWeight: FontWeight.bold)),
                  ],
                ),
              ),
            ),
          ),
        );

        String sanitizedReceiver = _accountController.text.trim().replaceAll(RegExp(r'[^0-9A-Za-z]'), '');
        if (sanitizedReceiver == '098765432100') {
          sanitizedReceiver = '9876543210';
        }

        final result = await BankKuninganApiService.sendTransfer(
          senderAccount: '1234567890', // Rekening Billy Jonathan di Core Banking
          receiverAccount: sanitizedReceiver,
          amount: amountInt > 0 ? amountInt : 100000,
          method: _selectedTransferMethod,
          description: _noteController.text.isEmpty ? 'Transfer $bankName' : _noteController.text,
        );

        if (mounted) Navigator.of(context).pop();

        if (result['success'] == true) {
          final refNo = result['data']['transaction_id'] ?? 'REF-${DateTime.now().millisecondsSinceEpoch.toString().substring(3)}';
          final isPending = result['status'] == 'REVIEW';
          
          if (mounted) {
            Navigator.pushReplacement(
              context,
              MaterialPageRoute(
                builder: (context) => ReceiptScreen(
                  title: isPending ? 'Transfer Ditangguhkan' : 'Transfer $bankName',
                  recipientName: 'Penerima: $_verifiedName',
                  recipientDetail: '$bankName (${_noteController.text.isEmpty ? "Transfer Dana" : _noteController.text})',
                  amount: amountText,
                  adminFee: adminFee,
                  totalAmount: totalAmountText,
                  referenceNumber: refNo,
                  date: 'Hari ini, ${DateTime.now().hour}:${DateTime.now().minute.toString().padLeft(2, '0')} WIB',
                  isPending: isPending,
                ),
              ),
            );
          }
        } else {
          final isBlocked = result['isBlocked'] == true || result['status'] == 'BLOCK';
          if (mounted) {
            showDialog(
              context: context,
              builder: (ctx) => AlertDialog(
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                title: Row(
                  children: [
                    Icon(
                      isBlocked ? Icons.shield_outlined : Icons.error_outline,
                      color: isBlocked ? Colors.red : Colors.orange,
                      size: 28,
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        isBlocked ? '⚠️ TRANSAKSI DIBLOKIR' : 'Gagal Transfer',
                        style: TextStyle(
                          color: isBlocked ? Colors.red : Colors.black87,
                          fontWeight: FontWeight.bold,
                          fontSize: 18,
                        ),
                      ),
                    ),
                  ],
                ),
                content: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      result['message'] ?? 'Demi keamanan, transaksi Anda tidak dapat diproses saat ini. Silakan hubungi Customer Service Bank Kuningan di 1500000.',
                      style: const TextStyle(fontSize: 14, height: 1.4),
                    ),
                  ],
                ),
                actions: [
                  TextButton(
                    onPressed: () => Navigator.of(ctx).pop(),
                    child: const Text('Tutup', style: TextStyle(fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
            );
          }
        }
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Transfer Uang'),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: AppColors.primary,
          labelColor: AppColors.primary,
          unselectedLabelColor: AppColors.textSecondary,
          labelStyle: AppTextStyles.textTheme.labelLarge,
          tabs: const [
            Tab(text: 'Sesama Bank'),
            Tab(text: 'Bank Lain'),
            Tab(text: 'Favorit'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildFormTab(isSesama: true),
          _buildFormTab(isSesama: false),
          _buildFavoritesTab(),
        ],
      ),
    );
  }

  Widget _buildFormTab({required bool isSesama}) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          if (!isSesama) ...[
            Text('Pilih Bank Tujuan', style: AppTextStyles.textTheme.labelLarge),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppColors.border, width: 1.2),
              ),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<String>(
                  value: _selectedBank,
                  icon: const Icon(CupertinoIcons.chevron_down, size: 18, color: AppColors.primary),
                  onChanged: (val) {
                    if (val != null) {
                      setState(() {
                        _selectedBank = val;
                        _isAccountVerified = false;
                      });
                    }
                  },
                  items: _banks.map((bank) {
                    return DropdownMenuItem<String>(
                      value: bank,
                      child: Text(bank, style: AppTextStyles.textTheme.bodyMedium),
                    );
                  }).toList(),
                ),
              ),
            ),
            const SizedBox(height: 18),
          ],

          Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Expanded(
                child: CustomTextField(
                  label: isSesama ? 'Nomor Rekening Bank Kuningan' : 'Nomor Rekening Tujuan',
                  hint: 'Masukkan nomor rekening',
                  prefixIcon: CupertinoIcons.creditcard_fill,
                  controller: _accountController,
                  keyboardType: TextInputType.text,
                  onChanged: (val) {
                    if (_isAccountVerified) {
                      setState(() => _isAccountVerified = false);
                    }
                  },
                ),
              ),
              const SizedBox(width: 10),
              SizedBox(
                height: 52,
                child: ElevatedButton(
                  onPressed: _isVerifying ? null : _verifyAccount,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                  ),
                  child: _isVerifying
                      ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                      : const Text('Cek', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          if (_isAccountVerified) ...[
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.primary.withOpacity(0.08),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.primary.withOpacity(0.4), width: 1.2),
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: const BoxDecoration(
                      color: AppColors.primary,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(CupertinoIcons.checkmark_alt, color: Colors.white, size: 20),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'IDENTITAS PENERIMA TERVERIFIKASI',
                          style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.primary, letterSpacing: 0.8),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          _verifiedName,
                          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.black87),
                        ),
                        Text(
                          '${isSesama ? "Bank Kuningan" : _selectedBank} • ${_accountController.text}',
                          style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            CustomTextField(
              label: 'Nominal Transfer (Rp)',
              hint: 'Masukkan nominal transfer',
              prefixIcon: CupertinoIcons.money_dollar_circle_fill,
              controller: _amountController,
              keyboardType: TextInputType.number,
              inputFormatters: [RupiahInputFormatter()],
            ),
            const SizedBox(height: 12),

            Text('Pilihan Cepat', style: AppTextStyles.textTheme.bodySmall?.copyWith(color: AppColors.textSecondary)),
            const SizedBox(height: 8),
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: ['50.000', '100.000', '250.000', '500.000', '1.000.000'].map((amt) {
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: ActionChip(
                      label: Text('Rp $amt', style: AppTextStyles.textTheme.labelSmall?.copyWith(color: AppColors.primary)),
                      backgroundColor: AppColors.primary.withOpacity(0.08),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      onPressed: () => _selectQuickAmount(amt),
                    ),
                  );
                }).toList(),
              ),
            ),
            const SizedBox(height: 18),

            CustomTextField(
              label: 'Catatan Transfer (Opsional)',
              hint: 'Masukkan catatan transfer (opsional)',
              prefixIcon: CupertinoIcons.doc_text_fill,
              controller: _noteController,
            ),
            const SizedBox(height: 24),

            if (isSesama) ...[
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
                decoration: BoxDecoration(
                  color: AppColors.accentGreen.withOpacity(0.08),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.accentGreen.withOpacity(0.3), width: 1.2),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: AppColors.accentGreen.withOpacity(0.15),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(CupertinoIcons.checkmark_shield_fill, color: AppColors.accentGreen, size: 22),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Biaya Admin Bank',
                            style: AppTextStyles.textTheme.labelSmall?.copyWith(
                              color: AppColors.textSecondary,
                              fontWeight: FontWeight.w600,
                              letterSpacing: 0.5,
                            ),
                          ),
                          const SizedBox(height: 3),
                          Text(
                            'GRATIS (Tanpa Biaya)',
                            style: AppTextStyles.textTheme.titleSmall?.copyWith(
                              color: AppColors.accentGreen,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ] else ...[
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Pilih Metode Transfer', style: AppTextStyles.textTheme.labelLarge),
                  Text(
                    '2 Layanan Tersedia',
                    style: AppTextStyles.textTheme.labelSmall?.copyWith(
                      color: AppColors.primary,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              
              GestureDetector(
                onTap: () => setState(() => _selectedTransferMethod = 'BI-FAST'),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: _selectedTransferMethod == 'BI-FAST'
                        ? AppColors.primary.withOpacity(0.06)
                        : AppColors.surface,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: _selectedTransferMethod == 'BI-FAST'
                          ? AppColors.primary
                          : AppColors.border.withOpacity(0.8),
                      width: _selectedTransferMethod == 'BI-FAST' ? 1.8 : 1.0,
                    ),
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: _selectedTransferMethod == 'BI-FAST'
                              ? AppColors.primary.withOpacity(0.15)
                              : AppColors.border.withOpacity(0.3),
                          shape: BoxShape.circle,
                        ),
                        child: Icon(
                          CupertinoIcons.bolt_fill,
                          size: 20,
                          color: _selectedTransferMethod == 'BI-FAST' ? AppColors.primary : AppColors.textSecondary,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'BI-FAST (Rekomendasi)',
                              style: AppTextStyles.textTheme.bodyMedium?.copyWith(
                                fontWeight: FontWeight.bold,
                                color: _selectedTransferMethod == 'BI-FAST' ? AppColors.primaryDark : AppColors.textPrimary,
                              ),
                            ),
                            Text(
                              'Biaya Rp 2.500 • Real-Time 24/7 (SNAP BI)',
                              style: AppTextStyles.textTheme.bodySmall?.copyWith(color: AppColors.textSecondary),
                            ),
                          ],
                        ),
                      ),
                      Radio<String>(
                        value: 'BI-FAST',
                        groupValue: _selectedTransferMethod,
                        activeColor: AppColors.primary,
                        onChanged: (val) {
                          if (val != null) setState(() => _selectedTransferMethod = val);
                        },
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 10),

              GestureDetector(
                onTap: () => setState(() => _selectedTransferMethod = 'RTOL'),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: _selectedTransferMethod == 'RTOL'
                        ? AppColors.primary.withOpacity(0.06)
                        : AppColors.surface,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: _selectedTransferMethod == 'RTOL'
                          ? AppColors.primary
                          : AppColors.border.withOpacity(0.8),
                      width: _selectedTransferMethod == 'RTOL' ? 1.8 : 1.0,
                    ),
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: _selectedTransferMethod == 'RTOL'
                              ? AppColors.primary.withOpacity(0.15)
                              : AppColors.border.withOpacity(0.3),
                          shape: BoxShape.circle,
                        ),
                        child: Icon(
                          CupertinoIcons.paperplane_fill,
                          size: 20,
                          color: _selectedTransferMethod == 'RTOL' ? AppColors.primary : AppColors.textSecondary,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Real-Time Online (RTOL)',
                              style: AppTextStyles.textTheme.bodyMedium?.copyWith(
                                fontWeight: FontWeight.bold,
                                color: _selectedTransferMethod == 'RTOL' ? AppColors.primaryDark : AppColors.textPrimary,
                              ),
                            ),
                            Text(
                              'Biaya Rp 6.500 • Jaringan ATM Bersama / ALTO / PRIMA',
                              style: AppTextStyles.textTheme.bodySmall?.copyWith(color: AppColors.textSecondary),
                            ),
                          ],
                        ),
                      ),
                      Radio<String>(
                        value: 'RTOL',
                        groupValue: _selectedTransferMethod,
                        activeColor: AppColors.primary,
                        onChanged: (val) {
                          if (val != null) setState(() => _selectedTransferMethod = val);
                        },
                      ),
                    ],
                  ),
                ),
              ),
            ],
            const SizedBox(height: 28),

            SizedBox(
              height: 52,
              child: ElevatedButton(
                onPressed: _handleTransfer,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryDark,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  elevation: 2,
                ),
                child: const Text(
                  'Lanjutkan ke Konfirmasi',
                  style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                ),
              ),
            ),
          ] else ...[
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.amber.shade50,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: Colors.amber.shade300),
              ),
              child: Row(
                children: [
                  Icon(CupertinoIcons.info_circle_fill, color: Colors.amber.shade800, size: 22),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'Silakan tekan tombol "Cek" untuk memverifikasi nama pemilik rekening penerima terlebih dahulu.',
                      style: TextStyle(color: Colors.amber.shade900, fontSize: 13, height: 1.4),
                    ),
                  ),
                ],
              ),
            ),
          ],
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildFavoritesTab() {
    return ListView.separated(
      padding: const EdgeInsets.all(20),
      itemCount: _favorites.length,
      separatorBuilder: (context, index) => const SizedBox(height: 12),
      itemBuilder: (context, index) {
        final fav = _favorites[index];
        return Card(
          elevation: 0.5,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: BorderSide(color: AppColors.border.withOpacity(0.6)),
          ),
          child: ListTile(
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            leading: CircleAvatar(
              backgroundColor: AppColors.primary.withOpacity(0.1),
              child: Text(
                fav['name']![0],
                style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.primary),
              ),
            ),
            title: Text(fav['name']!, style: AppTextStyles.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.bold)),
            subtitle: Text('${fav['bank']} • ${fav['account']}', style: AppTextStyles.textTheme.bodySmall),
            trailing: const Icon(CupertinoIcons.chevron_right, size: 16, color: AppColors.textSecondary),
            onTap: () => _onFavoriteSelected(fav),
          ),
        );
      },
    );
  }
}
