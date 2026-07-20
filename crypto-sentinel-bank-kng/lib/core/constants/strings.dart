/// Daftar seluruh teks dan string bahasa Indonesia yang digunakan di dalam aplikasi.
/// Menggunakan bahasa sehari-hari yang mudah dipahami, ramah, dan profesional tanpa jargon teknis.
class AppStrings {
  AppStrings._();

  // Nama Aplikasi & Identitas
  static const String appName = 'Bank Kuningan';
  static const String tagline = 'Keuangan Mudah dan Aman';

  // Login Screen
  static const String loginTitle = 'Masuk ke Akun Anda';
  static const String loginSubtitle = 'Kelola keuangan Anda dengan mudah dan aman';
  static const String usernameLabel = 'Nama Pengguna (Username)';
  static const String usernameHint = 'Masukkan username Anda';
  static const String pinLabel = 'PIN Bank Kuningan';
  static const String pinHint = 'Masukkan 6 digit PIN Anda';
  static const String loginButton = 'Masuk';
  static const String biometricLogin = 'Masuk dengan Sidik Jari / Face ID';
  static const String forgotPin = 'Lupa PIN?';
  static const String help = 'Bantuan';

  // Home Screen (Dashboard)
  static const String greetingPrefix = 'Halo,';
  static const String accountNumberLabel = 'Nomor Rekening';
  static const String accountBalanceLabel = 'Saldo Rekening';
  static const String copyAccountNumber = 'Salin';
  static const String accountNumberCopied = 'Nomor rekening berhasil disalin';
  static const String hiddenBalance = 'Rp •••••••••';

  // Quick Actions Menu
  static const String menuTransfer = 'Transfer';
  static const String menuTopUp = 'Top Up';
  static const String menuPayment = 'Pembayaran';
  static const String menuQris = 'QRIS';
  static const String menuCashWithdraw = 'Tarik Tunai';
  static const String menuPulseData = 'Pulsa & Data';
  static const String menuEWallet = 'E-Wallet';
  static const String menuMore = 'Lainnya';

  // Recent Transactions
  static const String recentTransactionsTitle = 'Mutasi Terakhir';
  static const String viewAll = 'Lihat Semua';
  static const String incomingTx = 'Masuk';
  static const String outgoingTx = 'Keluar';

  // Bottom Navigation Bar
  static const String navHome = 'Beranda';
  static const String navHistory = 'Mutasi';
  static const String navMessages = 'Pesan';
  static const String navAccount = 'Akun';

  // Placeholder Screens
  static const String featureInDevelopment = 'Fitur Sedang Dikembangkan';
  static const String featureInDevelopmentDesc = 'Halaman ini merupakan tampilan contoh untuk menu utama. Fitur lengkap akan tersedia pada rilis selanjutnya.';

  // Biometric Bottom Sheet
  static const String biometricTitle = 'Verifikasi Biometrik';
  static const String biometricInstruction = 'Sentuh sensor sidik jari atau lihat ke kamera untuk masuk ke Bank Kuningan';
  static const String biometricCancel = 'Batal';
  static const String biometricSuccess = 'Verifikasi Berhasil!';
}
