import 'package:flutter/cupertino.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';

import '../../core/constants/colors.dart';
import '../../data/api_service.dart';
import '../../data/mock_data.dart';
import '../../widgets/custom_text_field.dart';
import '../../widgets/pin_confirmation_modal.dart';
import 'receipt_screen.dart';

/// Halaman Transfer Dana bjb — Mengikuti alur real DIGI bank bjb
class TransferScreen extends StatefulWidget {
  const TransferScreen({super.key});

  @override
  State<TransferScreen> createState() => _TransferScreenState();
}

class _TransferScreenState extends State<TransferScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final TextEditingController _accountController = TextEditingController();
  final TextEditingController _amountController  = TextEditingController();
  final TextEditingController _noteController    = TextEditingController();

  // Antar-bank: 3 metode real BJB DIGI
  String _selectedTransferMethod = 'BI_FAST';
  String _selectedBank = 'Bank Central Asia (BCA)';

  // Wajib verifikasi rekening dulu (default false, seperti BJB real)
  bool   _isAccountVerified = false;
  String _verifiedName      = '';
  bool   _isVerifying       = false;

  // ── Data Referensi ──────────────────────────────────────────────────────────

  /// Bank beserta panjang nomor rekening yang valid
  final List<Map<String, dynamic>> _bankList = const [
    {'name': 'Bank Central Asia (BCA)',           'digits': [10]},
    {'name': 'Bank Mandiri',                       'digits': [13]},
    {'name': 'Bank Rakyat Indonesia (BRI)',        'digits': [15]},
    {'name': 'Bank Negara Indonesia (BNI)',        'digits': [10]},
    {'name': 'Bank Syariah Indonesia (BSI)',       'digits': [10]},
    {'name': 'Bank CIMB Niaga',                    'digits': [13]},
    {'name': 'Bank Permata',                       'digits': [10]},
    {'name': 'Bank Danamon',                       'digits': [10]},
    {'name': 'Bank Tabungan Negara (BTN)',         'digits': [15]},
    {'name': 'GoPay',                              'digits': [10, 12]},
    {'name': 'OVO',                                'digits': [10, 12]},
    {'name': 'DANA',                               'digits': [10, 12]},
    {'name': 'ShopeePay',                          'digits': [10, 12]},
  ];

  List<String> get _banks => _bankList.map((b) => b['name'] as String).toList();

  /// Metode transfer antar-bank DIGI bjb (sesuai lapangan)
  static const List<Map<String, String>> _antarBankMethods = [
    {
      'key':     'BI_FAST',
      'label':   'Transfer via BI-FAST',
      'fee':     'Rp 2.500',
      'desc':    'Real-time 24/7 • Jaringan BI-FAST Bank Indonesia',
      'badge':   '⚡ Instan',
    },
    {
      'key':     'FLIP',
      'label':   'Transfer via FLIP',
      'fee':     'Rp 2.000',
      'desc':    'Real-time • Ekonomis via FLIP Payment Gateway',
      'badge':   '💸 Termurah',
    },
    {
      'key':     'BANK_LAIN',
      'label':   'Transfer Bank Lain',
      'fee':     'Rp 6.500',
      'desc':    'Real-time via Jaringan SKN/ATM Bersama/Prima',
      'badge':   '🏦 Standar',
    },
  ];

  /// Nominal cepat (sesuai BJB DIGI)
  static const List<String> _quickAmounts = [
    '50.000', '100.000', '200.000', '500.000', '1.000.000', '2.000.000', '5.000.000',
  ];

  /// Favorit tersimpan dari Database Cloud & Crypto Watchlist
  final List<Map<String, String>> _favorites = const [
    {'name': 'Billy Jonathan',               'account': '1234567890',    'bank': 'Bank Kuningan'},
    {'name': 'Rifki Firmansyah',             'account': '0123456789',    'bank': 'Bank bjb'},
    {'name': 'Desta Erlangga',               'account': '1122334455',    'bank': 'Bank bjb'},
    {'name': 'Aam Setiana',                  'account': '5544332211',    'bank': 'Bank Mandiri'},
    {'name': 'Siti Rahma',                   'account': '9876543210',    'bank': 'Bank bjb'},
    {'name': 'Budi Santoso',                 'account': '8820192831',    'bank': 'Bank Central Asia (BCA)'},
    {'name': 'PT Indodax Nasional Indonesia','account': '9012666666',    'bank': 'Bank Central Asia (BCA)'},
    {'name': 'PT Binance Exchange Indonesia','account': '9012123456',    'bank': 'Bank CIMB Niaga'},
    {'name': 'PT Tokocrypto Indonesia',      'account': '9012999999',    'bank': 'Bank Mandiri'},
    {'name': 'PT Pintu Kemakmuran Bersama',  'account': '9012888888',    'bank': 'Bank Negara Indonesia (BNI)'},
    {'name': 'Indodax Fraud Receiver',       'account': '9012777777',    'bank': 'Bank Rakyat Indonesia (BRI)'},
    {'name': 'Mule Transit Ring L1',         'account': '9012000001',    'bank': 'Bank Central Asia (BCA)'},
  ];

  // ── Lifecycle ───────────────────────────────────────────────────────────────

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _tabController.addListener(() {
      // Reset verifikasi saat ganti tab
      if (!_tabController.indexIsChanging) return;
      setState(() {
        _isAccountVerified = false;
        _verifiedName      = '';
        _accountController.clear();
      });
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    _accountController.dispose();
    _amountController.dispose();
    _noteController.dispose();
    super.dispose();
  }

  // ── Helper ──────────────────────────────────────────────────────────────────

  String? _validateAccountLength(String acc, {bool isSesama = false}) {
    if (acc.isEmpty) return 'Nomor rekening tidak boleh kosong';
    if (acc.length < 5) return 'Nomor rekening minimal 5 digit';
    return null;
  }

  Map<String, String> _getMethodInfo(String key) =>
      _antarBankMethods.firstWhere((m) => m['key'] == key,
          orElse: () => _antarBankMethods.first);

  String _feeForMethod(String key) => _getMethodInfo(key)['fee'] ?? 'Rp 2.500';

  // ── Actions ─────────────────────────────────────────────────────────────────

  void _verifyAccount() async {
    final acc = _accountController.text.trim().replaceAll(RegExp(r'\D'), '');
    if (acc.isEmpty) {
      _snack('Masukkan nomor rekening terlebih dahulu', isError: true);
      return;
    }

    final isSesama = _tabController.index == 0;
    final err = _validateAccountLength(acc, isSesama: isSesama);
    if (err != null) { _snack(err, isError: true); return; }

    setState(() => _isVerifying = true);

    // Coba ambil nama live dari Core Banking API
    try {
      final res = await BjbApiService.getAccountInfo(acc);
      if (res['success'] == true && res['ownerName'] != null) {
        if (!mounted) return;
        setState(() {
          _isVerifying = false;
          _isAccountVerified = true;
          _verifiedName = res['ownerName'];
        });
        _snack('Rekening valid: ${res['ownerName']}');
        return;
      }
    } catch (_) {}

    // Fallback dictionary nama lengkap untuk demo
    final mockNames = {
      '1234567890':     'Billy Jonathan',
      '0123456789':     'Rifki Firmansyah',
      '1122334455':     'Desta Erlangga',
      '5544332211':     'Aam Setiana',
      '9876543210':     'Siti Rahma',
      '8820192831':     'Budi Santoso',
      '9012666666':     'PT Indodax Nasional Indonesia',
      '9012123456':     'PT Binance Exchange Indonesia',
      '9012999999':     'PT Tokocrypto Indonesia',
      '9012888888':     'PT Pintu Kemakmuran Bersama',
      '9012777777':     'Indodax Fraud Receiver',
      '9012000001':     'Mule Transit Ring L1',
    };
    final name = mockNames[acc] ??
        'Rekening $acc · ${isSesama ? "Bank bjb" : _selectedBank}';

    if (!mounted) return;
    setState(() {
      _isVerifying       = false;
      _isAccountVerified = true;
      _verifiedName      = name;
    });
    _snack('Rekening valid: $name');
  }

  void _selectQuickAmount(String raw) {
    setState(() => _amountController.text = raw.replaceAll('.', ''));
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
      _verifiedName      = fav['name'] ?? '';
    });
  }

  void _snack(String msg, {bool isError = false}) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(msg),
      backgroundColor: isError ? AppColors.accentRed : AppColors.accentGreen,
    ));
  }

  void _handleTransfer() {
    if (!_isAccountVerified) { _verifyAccount(); return; }

    final rawAmt = _amountController.text.replaceAll(RegExp(r'\D'), '');
    if (rawAmt.isEmpty) { _snack('Masukkan nominal transfer', isError: true); return; }
    final amountInt = int.tryParse(rawAmt) ?? 0;
    if (amountInt < 10000) { _snack('Minimal transfer Rp 10.000', isError: true); return; }

    final isSesama = _tabController.index == 0;
    final bankName = isSesama ? 'Bank bjb' : _selectedBank;
    final method   = isSesama ? 'SESAMA_BJB' : _selectedTransferMethod;
    final feeLabel = isSesama ? 'GRATIS' : _feeForMethod(_selectedTransferMethod);
    final amtStr   = 'Rp ${_formatAmount(amountInt)}';
    final totalStr = isSesama ? amtStr : '$amtStr (+ ${_feeForMethod(_selectedTransferMethod)})';

    PinConfirmationModal.show(
      context,
      title:    'Konfirmasi Transfer bjb',
      subtitle: '$_verifiedName · $bankName\nTotal: $totalStr',
      onPinConfirmed: (pin) async {
        showDialog(
          context: context,
          barrierDismissible: false,
          builder: (_) => const Center(
            child: Card(
              child: Padding(
                padding: EdgeInsets.all(24),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    CircularProgressIndicator(color: AppColors.primary),
                    SizedBox(height: 16),
                    Text('Memproses via Sentinel FDS…',
                        style: TextStyle(fontWeight: FontWeight.bold)),
                  ],
                ),
              ),
            ),
          ),
        );

        final result = await BjbApiService.sendTransfer(
          senderAccount:   MockData.accountNumber.replaceAll('-', ''),
          receiverAccount: _accountController.text.trim(),
          amount:          amountInt,
          method:          method,
          description:     _noteController.text.isEmpty
              ? (isSesama ? 'Transfer Sesama Bank bjb' : 'Transfer $bankName')
              : _noteController.text,
        );

        if (mounted) Navigator.of(context).pop();

        if (result['success'] == true) {
          final refNo     = 'BJB${DateTime.now().millisecondsSinceEpoch.toString().substring(5)}';
          final isPending = result['status'] == 'REVIEW';
          if (mounted) {
            Navigator.pushReplacement(context, MaterialPageRoute(
              builder: (_) => ReceiptScreen(
                title:           isPending ? 'Transfer Ditangguhkan FDS' : 'Transfer $bankName',
                amount:          amtStr,
                receiverAccount: _accountController.text.trim(),
                receiverName:    _verifiedName,
                bankName:        bankName,
                category:        isSesama ? 'Transfer Sesama bjb' : 'Transfer Antar-Bank',
                refNumber:       refNo,
                status:          isPending ? 'PENDING REVIEW FDS' : 'BERHASIL',
                adminFee:        feeLabel,
              ),
            ));
          }
        } else {
          final blocked = result['isBlocked'] == true;
          if (mounted) {
            showDialog(
              context: context,
              builder: (_) => AlertDialog(
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                title: Row(children: [
                  Icon(blocked ? Icons.shield_outlined : Icons.error_outline,
                      color: blocked ? Colors.red : Colors.orange, size: 26),
                  const SizedBox(width: 8),
                  Expanded(child: Text(
                    blocked ? 'Transaksi Ditolak Sentinel' : 'Transfer Gagal',
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                  )),
                ]),
                content: Text(result['message'] ?? 'Terjadi kesalahan.'),
                actions: [
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
                    onPressed: () => Navigator.of(context).pop(),
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

  static String _formatAmount(int v) => v.toString().replaceAllMapped(
    RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.',
  );

  // ── Build ───────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    final tabs = [
      _buildFormTab(isSesama: true),
      _buildFormTab(isSesama: false),
      _buildFavoritesTab(),
    ];

    final body = kIsWeb
        ? LayoutBuilder(builder: (_, c) => TabBarView(
            controller: _tabController,
            children: tabs.map((t) => SizedBox(height: c.maxHeight, child: t)).toList(),
          ))
        : TabBarView(controller: _tabController, children: tabs);

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
          tabs: const [Tab(text: 'Sesama bjb'), Tab(text: 'Antar-Bank'), Tab(text: 'Favorit')],
        ),
      ),
      body: body,
    );
  }

  // ── Form Tab ────────────────────────────────────────────────────────────────

  Widget _buildFormTab({required bool isSesama}) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 40),
      children: [
        // 1. Kartu Sumber Dana
        _buildSourceCard(),

        const SizedBox(height: 16),

        // 2. Pilih Bank Tujuan (antar-bank)
        if (!isSesama) ...[
          _buildLabel('Pilih Bank / E-Wallet Tujuan'),
          const SizedBox(height: 8),
          _buildBankDropdown(),
          const SizedBox(height: 18),
        ],

        // 3. Nomor Rekening + tombol Cek (suffixIcon — hindari Row+Expanded di ListView)
        _buildLabel(isSesama ? 'Nomor Rekening bjb (14 digit)' : 'Nomor Rekening Tujuan'),
        const SizedBox(height: 8),
        _buildAccountField(isSesama: isSesama),
        const SizedBox(height: 16),

        // 4. Konten setelah verifikasi
        if (_isAccountVerified) ...[
          _buildVerifiedBadge(isSesama: isSesama),
          const SizedBox(height: 20),

          _buildLabel('Nominal Transfer (Rp)'),
          const SizedBox(height: 8),
          CustomTextField(
            label: '',
            hint: 'Masukkan nominal',
            prefixIcon: const Icon(Icons.payments_outlined, color: AppColors.primary, size: 20),
            controller: _amountController,
            keyboardType: TextInputType.number,
          ),
          const SizedBox(height: 10),

          // Quick amount chips
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: _quickAmounts.map((a) => Padding(
                padding: const EdgeInsets.only(right: 8),
                child: ActionChip(
                  label: Text('Rp $a',
                      style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.w700, fontSize: 11)),
                  backgroundColor: AppColors.primary.withOpacity(0.08),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  onPressed: () => _selectQuickAmount(a),
                ),
              )).toList(),
            ),
          ),
          const SizedBox(height: 18),

          _buildLabel('Catatan (Opsional)'),
          const SizedBox(height: 8),
          CustomTextField(
            label: '',
            hint: 'Tambahkan catatan transfer',
            prefixIcon: const Icon(Icons.edit_note_rounded, color: AppColors.primary, size: 22),
            controller: _noteController,
          ),
          const SizedBox(height: 24),

          // Biaya / Metode transfer
          if (isSesama)
            _buildFeeCard()
          else
            _buildMethodSelector(),

          const SizedBox(height: 28),

          // Tombol Lanjutkan
          SizedBox(
            width: double.infinity,
            height: 52,
            child: ElevatedButton(
              onPressed: _handleTransfer,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primaryDark,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
              child: const Text('Lanjutkan ke Konfirmasi',
                  style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold)),
            ),
          ),
        ] else ...[
          // Info: belum verifikasi
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.blue.shade50,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: Colors.blue.shade200),
            ),
            child: Row(
              children: [
                Icon(Icons.info_outline_rounded, color: Colors.blue.shade700, size: 22),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    'Masukkan nomor rekening lalu tekan "Cek" untuk memverifikasi nama pemilik rekening.',
                    style: TextStyle(color: Colors.blue.shade800, fontSize: 13, height: 1.4),
                  ),
                ),
              ],
            ),
          ),
        ],
      ],
    );
  }

  // ── Sub-widgets ─────────────────────────────────────────────────────────────

  Widget _buildLabel(String text) => Text(text,
      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.textPrimary));

  Widget _buildSourceCard() => Container(
    padding: const EdgeInsets.all(14),
    decoration: BoxDecoration(
      color: AppColors.surface,
      borderRadius: BorderRadius.circular(14),
      border: Border.all(color: AppColors.border),
    ),
    child: Row(
      children: [
        Container(
          padding: const EdgeInsets.all(9),
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
              Text('bjb Tandamata Utama',
                  style: TextStyle(fontSize: 11, color: AppColors.textSecondary, fontWeight: FontWeight.w500)),
              Text(MockData.accountNumber,
                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, letterSpacing: 0.5)),
              Text('Saldo: ${MockData.accountBalance}',
                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.primary)),
            ],
          ),
        ),
      ],
    ),
  );

  Widget _buildBankDropdown() => Container(
    padding: const EdgeInsets.symmetric(horizontal: 14),
    decoration: BoxDecoration(
      color: AppColors.surface,
      borderRadius: BorderRadius.circular(12),
      border: Border.all(color: AppColors.border, width: 1.2),
    ),
    child: DropdownButtonHideUnderline(
      child: DropdownButton<String>(
        value: _selectedBank,
        isExpanded: true,
        icon: const Icon(CupertinoIcons.chevron_down, size: 16, color: AppColors.primary),
        onChanged: (v) {
          if (v != null) {
            setState(() {
              _selectedBank       = v;
              _isAccountVerified  = false;
              _verifiedName       = '';
              _accountController.clear();
            });
          }
        },
        items: _banks.map((b) => DropdownMenuItem(
          value: b,
          child: Text(b, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500)),
        )).toList(),
      ),
    ),
  );

  Widget _buildAccountField({required bool isSesama}) => CustomTextField(
    label: '',
    hint: isSesama ? 'Contoh: 00123456789012 (14 digit)' : 'Masukkan nomor rekening',
    prefixIcon: const Icon(Icons.pin_rounded, color: AppColors.primary, size: 20),
    suffixIcon: _isVerifying
        ? const Padding(
            padding: EdgeInsets.all(12),
            child: SizedBox(
              width: 20,
              height: 20,
              child: CircularProgressIndicator(color: AppColors.primary, strokeWidth: 2.5),
            ),
          )
        : TextButton(
            onPressed: _verifyAccount,
            style: TextButton.styleFrom(
              foregroundColor: AppColors.primaryDark,
              padding: const EdgeInsets.symmetric(horizontal: 14),
              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
            ),
            child: const Text('Cek', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 13)),
          ),
    controller: _accountController,
    keyboardType: TextInputType.number,
    onChanged: (v) {
      if (_isAccountVerified) setState(() { _isAccountVerified = false; _verifiedName = ''; });
    },
  );

  Widget _buildVerifiedBadge({required bool isSesama}) => Container(
    padding: const EdgeInsets.all(14),
    decoration: BoxDecoration(
      color: AppColors.accentGreen.withOpacity(0.08),
      borderRadius: BorderRadius.circular(14),
      border: Border.all(color: AppColors.accentGreen.withOpacity(0.4), width: 1.2),
    ),
    child: Row(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: const BoxDecoration(color: AppColors.accentGreen, shape: BoxShape.circle),
          child: const Icon(CupertinoIcons.checkmark_alt, color: Colors.white, size: 16),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('REKENING TERVERIFIKASI',
                  style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold,
                      color: AppColors.accentGreen, letterSpacing: 0.8)),
              const SizedBox(height: 2),
              Text(_verifiedName,
                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
              Text('${isSesama ? "Bank bjb" : _selectedBank} · ${_accountController.text}',
                  style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
            ],
          ),
        ),
        IconButton(
          icon: const Icon(Icons.edit_outlined, size: 18, color: AppColors.textSecondary),
          tooltip: 'Ganti rekening',
          onPressed: () => setState(() { _isAccountVerified = false; _verifiedName = ''; }),
        ),
      ],
    ),
  );

  Widget _buildFeeCard() => Container(
    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
    decoration: BoxDecoration(
      color: AppColors.accentGreen.withOpacity(0.07),
      borderRadius: BorderRadius.circular(14),
      border: Border.all(color: AppColors.accentGreen.withOpacity(0.3), width: 1.2),
    ),
    child: Row(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: const BoxDecoration(color: AppColors.accentGreen, shape: BoxShape.circle),
          child: const Icon(CupertinoIcons.checkmark_shield_fill, color: Colors.white, size: 18),
        ),
        const SizedBox(width: 12),
        const Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Biaya Layanan',
                  style: TextStyle(fontSize: 11, color: AppColors.textSecondary, fontWeight: FontWeight.w600)),
              SizedBox(height: 2),
              Text('GRATIS (Rp 0)',
                  style: TextStyle(color: AppColors.accentGreen, fontWeight: FontWeight.w800, fontSize: 15)),
              Text('Pindah Buku Real-Time Sesama Bank bjb',
                  style: TextStyle(fontSize: 11, color: AppColors.textSecondary)),
            ],
          ),
        ),
      ],
    ),
  );

  Widget _buildMethodSelector() => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      _buildLabel('Pilih Metode Transfer'),
      const SizedBox(height: 10),
      ..._antarBankMethods.map((m) {
        final sel = _selectedTransferMethod == m['key'];
        return Padding(
          padding: const EdgeInsets.only(bottom: 10),
          child: InkWell(
            onTap: () => setState(() => _selectedTransferMethod = m['key']!),
            borderRadius: BorderRadius.circular(14),
            child: Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: sel ? AppColors.primary.withOpacity(0.06) : AppColors.surface,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                  color: sel ? AppColors.primary : AppColors.border,
                  width: sel ? 1.8 : 1.0,
                ),
              ),
              child: Row(
                children: [
                  Icon(sel ? Icons.radio_button_checked : Icons.radio_button_off,
                      color: sel ? AppColors.primary : AppColors.textSecondary, size: 20),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Text(m['label']!,
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                            const Spacer(),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                              decoration: BoxDecoration(
                                color: sel ? AppColors.primary : AppColors.border,
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(m['fee']!,
                                  style: TextStyle(
                                    fontSize: 11, fontWeight: FontWeight.w800,
                                    color: sel ? Colors.white : AppColors.textSecondary,
                                  )),
                            ),
                          ],
                        ),
                        const SizedBox(height: 2),
                        Text(m['desc']!,
                            style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                        const SizedBox(height: 4),
                        Text(m['badge']!,
                            style: TextStyle(
                              fontSize: 11, fontWeight: FontWeight.w700,
                              color: sel ? AppColors.primary : AppColors.textSecondary,
                            )),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      }),
    ],
  );

  // ── Favorites Tab ───────────────────────────────────────────────────────────

  Widget _buildFavoritesTab() {
    return ListView.separated(
      padding: const EdgeInsets.all(20),
      itemCount: _favorites.length,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (context, i) {
        final fav   = _favorites[i];
        final isBjb = fav['bank'] == 'Bank bjb';
        return Material(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(16),
          child: InkWell(
            borderRadius: BorderRadius.circular(16),
            onTap: () => _onFavoriteSelected(fav),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.border),
              ),
              child: Row(
                children: [
                  CircleAvatar(
                    backgroundColor: isBjb
                        ? AppColors.primary.withOpacity(0.1)
                        : AppColors.accentSky.withOpacity(0.1),
                    child: Text(fav['name']![0],
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          color: isBjb ? AppColors.primary : AppColors.accentSky,
                        )),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(fav['name']!,
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                        const SizedBox(height: 2),
                        Text('${fav['bank']} · ${fav['account']}',
                            style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                      ],
                    ),
                  ),
                  const Icon(CupertinoIcons.chevron_right, size: 16, color: AppColors.textSecondary),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}
