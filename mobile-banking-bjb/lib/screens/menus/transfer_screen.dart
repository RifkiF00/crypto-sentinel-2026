import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import '../../core/constants/colors.dart';
import '../../data/api_service.dart';
import '../../data/mock_data.dart';
import '../../widgets/custom_text_field.dart';
import '../../widgets/pin_confirmation_modal.dart';
import 'receipt_screen.dart';

/// Halaman Transfer Dana bjb (100% Mengadopsi Arsitektur Teruji Crypto-Sentinel Bank Kuningan)
class TransferScreen extends StatefulWidget {
  const TransferScreen({super.key});

  @override
  State<TransferScreen> createState() => _TransferScreenState();
}

class _TransferScreenState extends State<TransferScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final TextEditingController _accountController = TextEditingController(text: '9876543210');
  final TextEditingController _amountController = TextEditingController(text: '500000');
  final TextEditingController _noteController = TextEditingController(text: 'Transfer bjb DIGI');

  String _selectedTransferMethod = 'RTOL';
  String _selectedBank = 'Bank Central Asia (BCA)';

  bool _isAccountVerified = true;
  String _verifiedName = 'Siti Rahmawati (bjb Tandamata)';
  bool _isVerifying = false;

  final List<String> _banks = const [
    'Bank Central Asia (BCA)',
    'Bank Mandiri',
    'Bank Rakyat Indonesia (BRI)',
    'Bank Negara Indonesia (BNI)',
    'Bank Syariah Indonesia (BSI)',
    'Bank CIMB Niaga',
    'Bank Permata',
  ];

  final List<Map<String, String>> _favorites = const [
    {'name': 'Siti Rahmawati', 'account': '9876543210', 'bank': 'Bank bjb'},
    {'name': 'Budi Santoso', 'account': '8820192831', 'bank': 'Bank Central Asia (BCA)'},
    {'name': 'Desta Erlangga', 'account': '1122334455', 'bank': 'Bank bjb'},
    {'name': 'Aam Setiana', 'account': '1310029384912', 'bank': 'Bank Mandiri'},
    {'name': 'PT Indodax Nasional Indonesia', 'account': '9012666666', 'bank': 'Bank Central Asia (BCA)'},
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

    await Future.delayed(const Duration(milliseconds: 400));

    if (!mounted) return;

    String name = 'Nasabah Terverifikasi';
    if (acc == '9876543210') {
      name = 'Siti Rahmawati (bjb Tandamata)';
    } else if (acc == '8820192831') {
      name = 'Budi Santoso';
    } else if (acc == '1122334455') {
      name = 'Desta Erlangga (Bank bjb)';
    } else if (acc == '1310029384912') {
      name = 'Aam Setiana';
    } else if (acc == '9012666666') {
      name = 'PT Indodax Nasional Indonesia';
    } else {
      name = 'Rekening ${_accountController.text} (${_tabController.index == 0 ? "Bank bjb" : _selectedBank})';
    }

    setState(() {
      _isVerifying = false;
      _isAccountVerified = true;
      _verifiedName = name;
    });

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Rekening Valid: $_verifiedName'),
        backgroundColor: AppColors.accentGreen,
      ),
    );
  }

  void _selectQuickAmount(String amount) {
    setState(() {
      _amountController.text = amount.replaceAll('.', '');
    });
  }

  void _onFavoriteSelected(Map<String, String> fav) {
    setState(() {
      if (fav['bank'] == 'Bank bjb') {
        _tabController.animateTo(0);
      } else {
        _tabController.animateTo(1);
        _selectedBank = fav['bank'] ?? 'Bank Central Asia (BCA)';
      }
      _accountController.text = fav['account'] ?? '';
      _isAccountVerified = true;
      _verifiedName = fav['name'] ?? 'Siti Rahmawati';
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
    final bankName = isSesama ? 'Bank bjb' : _selectedBank;
    final amountInt = int.tryParse(_amountController.text.replaceAll(RegExp(r'[^0-9]'), '')) ?? 0;
    final amountText = 'Rp ${_amountController.text}';
    final adminFee = isSesama
        ? 'GRATIS (Rp 0)'
        : (_selectedTransferMethod == 'RTOL'
            ? 'Rp 2.500 (RTOL via APEX bjb)'
            : 'Rp 2.900 (SKNBI via bank bjb)');
    final totalAmountText = isSesama
        ? amountText
        : 'Rp ${_amountController.text} (+ ${_selectedTransferMethod == 'RTOL' ? "Rp 2.500" : "Rp 2.900"})';

    PinConfirmationModal.show(
      context,
      title: 'Konfirmasi Transfer bjb',
      subtitle: '$_verifiedName • $bankName\nTotal: $totalAmountText',
      onPinConfirmed: (pin) async {
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
                    Text('Memproses via SNAP BI & Sentinel FDS...', style: TextStyle(fontWeight: FontWeight.bold)),
                  ],
                ),
              ),
            ),
          ),
        );

        final result = await BjbApiService.sendTransfer(
          senderAccount: MockData.accountNumber.replaceAll('-', ''),
          receiverAccount: _accountController.text.trim(),
          amount: amountInt > 0 ? amountInt : 500000,
          method: isSesama ? 'SESAMA_BJB' : (_selectedTransferMethod == 'RTOL' ? 'RTOL_APEX' : 'SKNBI'),
          description: _noteController.text.isEmpty ? (isSesama ? 'Transfer Sesama Bank bjb' : 'Transfer $bankName') : _noteController.text,
        );

        if (mounted) Navigator.of(context).pop();

        if (result['success'] == true) {
          final refNo = 'REF-BJB-${DateTime.now().millisecondsSinceEpoch.toString().substring(3)}';
          final isPending = result['status'] == 'REVIEW';
          
          if (mounted) {
            Navigator.pushReplacement(
              context,
              MaterialPageRoute(
                builder: (context) => ReceiptScreen(
                  title: isPending ? 'Transfer Ditangguhkan FDS' : 'Transfer $bankName',
                  amount: amountText,
                  receiverAccount: _accountController.text.trim(),
                  receiverName: _verifiedName,
                  bankName: bankName,
                  category: isSesama ? 'Transfer Sesama bjb' : 'Transfer Antar-Bank',
                  refNumber: refNo,
                  status: isPending ? 'PENDING REVIEW FDS' : 'BERHASIL',
                  adminFee: adminFee,
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
                        isBlocked ? 'Transaksi Ditolak Sentinel FDS' : 'Transfer Gagal',
                        style: TextStyle(
                          color: isBlocked ? Colors.red : Colors.black87,
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                    ),
                  ],
                ),
                content: Text(
                  result['message'] ?? 'Demi keamanan, transaksi Anda diblokir oleh Crypto-Sentinel FDS Bank bjb.',
                  style: const TextStyle(fontSize: 13, height: 1.4),
                ),
                actions: [
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
                    onPressed: () => Navigator.of(ctx).pop(),
                    child: const Text('Tutup'),
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
        title: const Text('Transfer Dana'),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: AppColors.primary,
          labelColor: AppColors.primary,
          unselectedLabelColor: AppColors.textSecondary,
          labelStyle: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700),
          unselectedLabelStyle: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500),
          tabs: const [
            Tab(text: 'Sesama BJB'),
            Tab(text: 'Antar-Bank'),
            Tab(text: 'Favorit'),
          ],
        ),
      ),
      // LayoutBuilder dibutuhkan agar TabBarView memberikan
      // bounded constraints ke SingleChildScrollView di Flutter Web
      body: LayoutBuilder(
        builder: (context, constraints) {
          return TabBarView(
            controller: _tabController,
            children: [
              _buildFormTab(isSesama: true, constraints: constraints),
              _buildFormTab(isSesama: false, constraints: constraints),
              _buildFavoritesTab(constraints: constraints),
            ],
          );
        },
      ),
    );
  }

  Widget _buildFormTab({required bool isSesama, required BoxConstraints constraints}) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: ConstrainedBox(
        constraints: BoxConstraints(minHeight: constraints.maxHeight - 48),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Kartu Sumber Dana
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.border),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.account_balance_wallet_rounded, color: AppColors.primary, size: 22),
                ),
                const SizedBox(width: 12),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Sumber Dana: bjb Tandamata Utama', style: TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                      Text(MockData.accountNumber, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700)),
                      Text('Saldo: ${MockData.accountBalance}', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.primary)),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          if (!isSesama) ...[
            const Text('Pilih Bank Tujuan', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700)),
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
                      child: Text(bank, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500)),
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
                  label: isSesama ? 'Nomor Rekening Bank bjb' : 'Nomor Rekening Tujuan',
                  hint: 'Masukkan nomor rekening',
                  prefixIcon: const Icon(Icons.pin_rounded, color: AppColors.primary, size: 20),
                  controller: _accountController,
                  keyboardType: TextInputType.number,
                  onChanged: (val) {
                    if (_isAccountVerified) {
                      setState(() => _isAccountVerified = false);
                    }
                  },
                ),
              ),
              const SizedBox(width: 10),
              SizedBox(
                height: 48,
                child: ElevatedButton(
                  onPressed: _isVerifying ? null : _verifyAccount,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primaryDark,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    padding: const EdgeInsets.symmetric(horizontal: 18),
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
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppColors.accentGreen.withOpacity(0.1),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppColors.accentGreen.withOpacity(0.4), width: 1.2),
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: const BoxDecoration(
                      color: AppColors.accentGreen,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(CupertinoIcons.checkmark_alt, color: Colors.white, size: 18),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'IDENTITAS PENERIMA TERVERIFIKASI',
                          style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.accentGreen, letterSpacing: 0.8),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          _verifiedName,
                          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.black87),
                        ),
                        Text(
                          '${isSesama ? "Bank bjb" : _selectedBank} • ${_accountController.text}',
                          style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
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
              prefixIcon: const Icon(Icons.payments_outlined, color: AppColors.primary, size: 20),
              controller: _amountController,
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: 12),

            const Text('Pilihan Cepat Nominal', style: TextStyle(fontSize: 11, color: AppColors.textSecondary, fontWeight: FontWeight.w600)),
            const SizedBox(height: 8),
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: ['50.000', '100.000', '250.000', '500.000', '1.000.000'].map((amt) {
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: ActionChip(
                      label: Text('Rp $amt', style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.w700, fontSize: 12)),
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
              prefixIcon: const Icon(Icons.edit_note_rounded, color: AppColors.primary, size: 22),
              controller: _noteController,
            ),
            const SizedBox(height: 24),

            if (isSesama) ...[
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                decoration: BoxDecoration(
                  color: AppColors.accentGreen.withOpacity(0.08),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppColors.accentGreen.withOpacity(0.3), width: 1.2),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: const BoxDecoration(
                        color: AppColors.accentGreen,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(CupertinoIcons.checkmark_shield_fill, color: Colors.white, size: 20),
                    ),
                    const SizedBox(width: 12),
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Biaya Admin Bank',
                            style: TextStyle(color: AppColors.textSecondary, fontWeight: FontWeight.w600, fontSize: 11),
                          ),
                          SizedBox(height: 2),
                          Text(
                            'GRATIS (Rp 0)',
                            style: TextStyle(color: AppColors.accentGreen, fontWeight: FontWeight.w800, fontSize: 14),
                          ),
                          Text(
                            'Pindah Buku Real-Time Bank bjb',
                            style: TextStyle(color: AppColors.textSecondary, fontSize: 11),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ] else ...[
              const Text('Pilih Metode Transfer Antar-Bank', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700)),
              const SizedBox(height: 10),
              
              // 1. RTOL via APEX bjb
              InkWell(
                onTap: () => setState(() => _selectedTransferMethod = 'RTOL'),
                borderRadius: BorderRadius.circular(14),
                child: Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: _selectedTransferMethod == 'RTOL'
                        ? AppColors.primary.withOpacity(0.06)
                        : AppColors.surface,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(
                      color: _selectedTransferMethod == 'RTOL' ? AppColors.primary : AppColors.border,
                      width: _selectedTransferMethod == 'RTOL' ? 1.8 : 1.0,
                    ),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Icon(
                        _selectedTransferMethod == 'RTOL' ? Icons.radio_button_checked : Icons.radio_button_off,
                        color: _selectedTransferMethod == 'RTOL' ? AppColors.primary : AppColors.textSecondary,
                        size: 20,
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Transfer Real-Time Online (RTOL via APEX bjb)',
                              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                            ),
                            const SizedBox(height: 2),
                            const Text(
                              'Biaya: Rp 2.500 • Real-Time 24/7 (Jaringan PRIMA & ATM Bersama)',
                              style: TextStyle(fontSize: 11, color: AppColors.textSecondary),
                            ),
                            const SizedBox(height: 6),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: AppColors.accentGold.withOpacity(0.2),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: const Text(
                                '⚡ [Instan • Dana Langsung Sampai]',
                                style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: AppColors.primaryDark),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 10),

              // 2. SKNBI Kliring
              InkWell(
                onTap: () => setState(() => _selectedTransferMethod = 'SKNBI'),
                borderRadius: BorderRadius.circular(14),
                child: Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: _selectedTransferMethod == 'SKNBI'
                        ? AppColors.primary.withOpacity(0.06)
                        : AppColors.surface,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(
                      color: _selectedTransferMethod == 'SKNBI' ? AppColors.primary : AppColors.border,
                      width: _selectedTransferMethod == 'SKNBI' ? 1.8 : 1.0,
                    ),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Icon(
                        _selectedTransferMethod == 'SKNBI' ? Icons.radio_button_checked : Icons.radio_button_off,
                        color: _selectedTransferMethod == 'SKNBI' ? AppColors.primary : AppColors.textSecondary,
                        size: 20,
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Transfer Kliring SKNBI (via bank bjb)',
                              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                            ),
                            const SizedBox(height: 2),
                            const Text(
                              'Biaya: Rp 2.900 • Jam Kerja Bank Indonesia (Batch)',
                              style: TextStyle(fontSize: 11, color: AppColors.textSecondary),
                            ),
                            const SizedBox(height: 6),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: AppColors.accentSky.withOpacity(0.15),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: const Text(
                                '🕒 [Ekonomis • Sistem Batch BI]',
                                style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: AppColors.primary),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
            const SizedBox(height: 28),

            ElevatedButton(
              onPressed: _handleTransfer,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primaryDark,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                minimumSize: const Size.fromHeight(50),
              ),
              child: const Text(
                'Lanjutkan ke Konfirmasi',
                style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold),
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
        ),
      ),
    );
  }

  Widget _buildFavoritesTab({required BoxConstraints constraints}) {
    return ConstrainedBox(
      constraints: BoxConstraints(minHeight: constraints.maxHeight - 48),
      child: ListView.separated(
        padding: const EdgeInsets.all(20),
        itemCount: _favorites.length,
        separatorBuilder: (context, index) => const SizedBox(height: 12),
        itemBuilder: (context, index) {
        final fav = _favorites[index];
        final isBjb = fav['bank'] == 'Bank bjb';
        return Container(
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.border),
          ),
          child: ListTile(
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            leading: CircleAvatar(
              backgroundColor: isBjb ? AppColors.primary.withOpacity(0.1) : AppColors.accentSky.withOpacity(0.1),
              child: Text(
                fav['name']![0],
                style: TextStyle(fontWeight: FontWeight.bold, color: isBjb ? AppColors.primary : AppColors.accentSky),
              ),
            ),
            title: Text(fav['name']!, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
            subtitle: Text('${fav['bank']} • ${fav['account']}', style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
            trailing: const Icon(CupertinoIcons.chevron_right, size: 16, color: AppColors.textSecondary),
            onTap: () => _onFavoriteSelected(fav),
          ),
        );
      },
    );
  }
}
