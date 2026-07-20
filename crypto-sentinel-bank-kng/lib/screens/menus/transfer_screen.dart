import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import '../../core/constants/colors.dart';
import '../../core/constants/text_styles.dart';
import '../../widgets/custom_text_field.dart';
import '../../widgets/pin_confirmation_modal.dart';
import '../../data/api_service.dart';
import 'receipt_screen.dart';

/// Halaman Fungsional Transfer Uang (Sesama Bank Kuningan, Bank Lain, Daftar Favorit)
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
  String _selectedTransferMethod = 'BI-FAST'; // Pilihan: 'BI-FAST' atau 'RTOL'

  String _selectedBank = 'Bank Central Asia (BCA)';
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
    {'name': 'Siti Rahma', 'account': '0987-6543-2100', 'bank': 'Bank Kuningan'},
    {'name': 'PT Maju Bersama', 'account': '8899-7766-5544', 'bank': 'Bank Mandiri'},
    {'name': 'Budi Raharjo', 'account': '1122-3344-5566', 'bank': 'BCA'},
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
    });
  }

  void _handleTransfer() {
    if (_accountController.text.trim().isEmpty || _amountController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Harap masukkan nomor rekening dan nominal transfer'),
          backgroundColor: AppColors.accentRed,
          behavior: SnackBarBehavior.floating,
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
      recipientText: '$bankName • ${_accountController.text}',
      amountText: totalAmountText,
      onPinSuccess: () async {
        // Tampilkan loading dialog
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

        // Panggil API Backend Expresso Core Banking (8080) & Crypto-Sentinel (8000)
        final result = await BankKuninganApiService.sendTransfer(
          senderAccount: '4521880292', // Rekening Budi Santoso di Core Banking
          receiverAccount: _accountController.text.trim(),
          amount: amountInt > 0 ? amountInt : 100000,
          method: _selectedTransferMethod,
          description: _noteController.text.isEmpty ? 'Transfer $bankName' : _noteController.text,
        );

        // Tutup Dialog Loading
        if (mounted) Navigator.of(context).pop();

        if (result['success'] == true) {
          final refNo = result['data']['transaction_id'] ?? 'REF-${DateTime.now().millisecondsSinceEpoch.toString().substring(3)}';
          if (mounted) {
            Navigator.pushReplacement(
              context,
              MaterialPageRoute(
                builder: (context) => ReceiptScreen(
                  title: 'Transfer $bankName',
                  recipientName: 'Penerima: ${_accountController.text}',
                  recipientDetail: '$bankName (${_noteController.text.isEmpty ? "Transfer Dana" : _noteController.text})',
                  amount: amountText,
                  adminFee: adminFee,
                  totalAmount: totalAmountText,
                  referenceNumber: refNo,
                  date: 'Hari ini, ${DateTime.now().hour}:${DateTime.now().minute.toString().padLeft(2, '0')} WIB',
                ),
              ),
            );
          }
        } else {
          // TAMPILKAN DIALOG ANCAMAN KETIKA CRYPTO-SENTINEL MEMBLOKIR TRANSAKSI
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
                      isBlocked
                          ? 'Sistem Keamanan Crypto-Sentinel FDS Engine memblokir transaksi ini karena terindikasi risiko tinggi pencucian uang/pelarian krypto (Risk Score ≥ 80%).'
                          : result['message'] ?? 'Terjadi kesalahan sistem.',
                      style: const TextStyle(fontSize: 14, height: 1.4),
                    ),
                    if (isBlocked) ...[
                      const SizedBox(height: 12),
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: Colors.red.shade50,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: Colors.red.shade200),
                        ),
                        child: Text(
                          'Detail: ${result['message']}',
                          style: TextStyle(color: Colors.red.shade900, fontSize: 12, fontWeight: FontWeight.w600),
                        ),
                      ),
                    ],
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

  Widget _buildPillLogo(String assetPath, String fallbackText, {double height = 24}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border.withOpacity(0.8)),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 6, offset: const Offset(0, 2)),
        ],
      ),
      child: Image.asset(
        assetPath,
        height: height,
        fit: BoxFit.contain,
        errorBuilder: (context, error, stackTrace) => Text(
          fallbackText,
          style: AppTextStyles.textTheme.labelSmall?.copyWith(
            fontWeight: FontWeight.bold,
            color: AppColors.primaryDark,
          ),
        ),
      ),
    );
  }

  Widget _buildNetworkLogo(String assetPath, String fallbackText, {double height = 24}) {
    return _buildPillLogo(assetPath, fallbackText, height: height);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
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
                    if (val != null) setState(() => _selectedBank = val);
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

          CustomTextField(
            label: isSesama ? 'Nomor Rekening Bank Kuningan' : 'Nomor Rekening Tujuan',
            hint: 'Masukkan 10-12 digit nomor rekening',
            prefixIcon: CupertinoIcons.creditcard_fill,
            controller: _accountController,
            keyboardType: TextInputType.number,
          ),
          const SizedBox(height: 18),

          CustomTextField(
            label: 'Nominal Transfer (Rp)',
            hint: 'Masukkan nominal transfer',
            prefixIcon: CupertinoIcons.money_dollar_circle_fill,
            controller: _amountController,
            keyboardType: TextInputType.number,
            inputFormatters: [RupiahInputFormatter()],
          ),
          const SizedBox(height: 12),

          // Pilihan Nominal Cepat
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
            // Info Biaya Admin Sesama Bank
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
            // Pilihan Metode Transfer Bank Lain (2 Pilihan: BI-FAST & RTOL)
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
            
            // Pilihan 1: BI-FAST (Lebih Rapi & Eksklusif)
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
                  boxShadow: _selectedTransferMethod == 'BI-FAST'
                      ? [BoxShadow(color: AppColors.primary.withOpacity(0.12), blurRadius: 8, offset: const Offset(0, 3))]
                      : [],
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
                        _selectedTransferMethod == 'BI-FAST'
                            ? CupertinoIcons.checkmark_alt
                            : CupertinoIcons.arrow_right_arrow_left,
                        color: _selectedTransferMethod == 'BI-FAST'
                            ? AppColors.primary
                            : AppColors.textSecondary,
                        size: 18,
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Text(
                                'BI-FAST',
                                style: AppTextStyles.textTheme.titleSmall?.copyWith(
                                  color: AppColors.primaryDark,
                                  fontWeight: FontWeight.w800,
                                ),
                              ),
                              const SizedBox(width: 8),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                                decoration: BoxDecoration(
                                  color: AppColors.primaryLight.withOpacity(0.15),
                                  borderRadius: BorderRadius.circular(6),
                                  border: Border.all(color: AppColors.primary.withOpacity(0.3), width: 0.8),
                                ),
                                child: Text(
                                  'Powered By APEX BANK BJB',
                                  style: AppTextStyles.textTheme.labelSmall?.copyWith(
                                    color: AppColors.primaryDark,
                                    fontSize: 9.5,
                                    fontWeight: FontWeight.w800,
                                    fontStyle: FontStyle.italic,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 3),
                          Text(
                            'Transfer cepat antarbank 24 jam non-stop',
                            style: AppTextStyles.textTheme.bodySmall?.copyWith(
                              color: AppColors.textSecondary,
                              fontSize: 11.5,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 10),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          'Rp 2.500',
                          style: AppTextStyles.textTheme.titleSmall?.copyWith(
                            color: AppColors.primaryDark,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Icon(
                          _selectedTransferMethod == 'BI-FAST'
                              ? CupertinoIcons.check_mark_circled_solid
                              : CupertinoIcons.circle,
                          color: _selectedTransferMethod == 'BI-FAST'
                              ? AppColors.primary
                              : AppColors.border,
                          size: 20,
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 12),

            // Pilihan 2: Transfer Online - RTOL (Lebih Rapi & Eksklusif)
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
                  boxShadow: _selectedTransferMethod == 'RTOL'
                      ? [BoxShadow(color: AppColors.primary.withOpacity(0.12), blurRadius: 8, offset: const Offset(0, 3))]
                      : [],
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
                        _selectedTransferMethod == 'RTOL'
                            ? CupertinoIcons.checkmark_alt
                            : CupertinoIcons.bolt_horizontal_circle_fill,
                        color: _selectedTransferMethod == 'RTOL'
                            ? AppColors.primary
                            : AppColors.textSecondary,
                        size: 18,
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Transfer Online (RTOL)',
                            style: AppTextStyles.textTheme.titleSmall?.copyWith(
                              color: AppColors.primaryDark,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                          const SizedBox(height: 3),
                          Text(
                            'Instan via ALTO, ATM Bersama & PRIMA',
                            style: AppTextStyles.textTheme.bodySmall?.copyWith(
                              color: AppColors.textSecondary,
                              fontSize: 11.5,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 10),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          'Rp 6.500',
                          style: AppTextStyles.textTheme.titleSmall?.copyWith(
                            color: AppColors.textPrimary,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Icon(
                          _selectedTransferMethod == 'RTOL'
                              ? CupertinoIcons.check_mark_circled_solid
                              : CupertinoIcons.circle,
                          color: _selectedTransferMethod == 'RTOL'
                              ? AppColors.primary
                              : AppColors.border,
                          size: 20,
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
          const SizedBox(height: 28),

          ElevatedButton(
            onPressed: _handleTransfer,
            style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 18)),
            child: const Text('Lanjutkan Transfer'),
          ),
          const SizedBox(height: 32),

          // Jaringan Transfer (ALTO, ATM Bersama, PRIMA) & Powered by Bank bjb
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(22),
              border: Border.all(color: AppColors.border, width: 1.2),
              boxShadow: [
                BoxShadow(color: AppColors.shadow.withOpacity(0.05), blurRadius: 16, offset: const Offset(0, 6)),
              ],
            ),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(CupertinoIcons.shield_lefthalf_fill, color: AppColors.primary, size: 16),
                    const SizedBox(width: 6),
                    Flexible(
                      child: Text(
                        'Mendukung Jaringan Transfer Real-Time Online (RTOL)',
                        style: AppTextStyles.textTheme.labelSmall?.copyWith(
                          color: AppColors.textPrimary,
                          fontWeight: FontWeight.w700,
                          letterSpacing: 0.2,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                // Deretan Logo Jaringan dalam Badge Putih Bersih
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    _buildPillLogo('assets/images/alto-logo.png', 'ALTO', height: 24),
                    const SizedBox(width: 12),
                    _buildPillLogo('assets/images/atm-bersama-logo.png', 'ATM Bersama', height: 26),
                    const SizedBox(width: 12),
                    _buildPillLogo('assets/images/prima-logo.png', 'PRIMA', height: 24),
                  ],
                ),
                const SizedBox(height: 18),
                Divider(color: AppColors.border.withOpacity(0.7), height: 1),
                const SizedBox(height: 16),
                // Powered by bank bjb dalam Badge Rapi
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: AppColors.border.withOpacity(0.8)),
                    boxShadow: [
                      BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 6),
                    ],
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        'Powered by',
                        style: AppTextStyles.textTheme.labelMedium?.copyWith(
                          color: AppColors.primaryDark,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 0.4,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Image.asset(
                        'assets/images/bjb-logo.png',
                        height: 24,
                        fit: BoxFit.contain,
                        errorBuilder: (context, error, stackTrace) => Text(
                          'bank bjb',
                          style: AppTextStyles.textTheme.labelSmall?.copyWith(fontWeight: FontWeight.bold, color: AppColors.primary),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildFavoritesTab() {
    return ListView.builder(
      padding: const EdgeInsets.all(20),
      itemCount: _favorites.length,
      itemBuilder: (context, index) {
        final fav = _favorites[index];
        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.border),
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(16),
            child: Material(
              color: Colors.transparent,
              child: ListTile(
                leading: CircleAvatar(
                  backgroundColor: AppColors.primary.withOpacity(0.12),
                  child: Text(
                    fav['name']!.substring(0, 1),
                    style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold),
                  ),
                ),
                title: Text(fav['name']!, style: AppTextStyles.textTheme.titleMedium),
                subtitle: Text('${fav['bank']} • ${fav['account']}', style: AppTextStyles.textTheme.bodySmall),
                trailing: const Icon(CupertinoIcons.arrow_right_circle_fill, color: AppColors.primary),
                onTap: () => _onFavoriteSelected(fav),
              ),
            ),
          ),
        );
      },
    );
  }
}
