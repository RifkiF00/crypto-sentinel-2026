import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import '../core/constants/colors.dart';
import '../core/constants/strings.dart';
import '../core/constants/text_styles.dart';
import 'home_screen.dart';
import 'login_screen.dart';
import 'history_screen.dart';
import 'messages_screen.dart';

/// Kontainer Bottom Navigation Bar untuk aplikasi Bank Kuningan.
/// Mengatur 4 Tab: Beranda, Mutasi, Pesan, dan Akun.
class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int _selectedIndex = 0;

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  void _confirmLogout() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text('Keluar Aplikasi?', style: AppTextStyles.textTheme.headlineMedium),
        content: Text(
          'Apakah Anda yakin ingin keluar dari akun Bank Kuningan Anda saat ini?',
          style: AppTextStyles.textTheme.bodyMedium,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Batal'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              Navigator.of(context).pushReplacement(
                MaterialPageRoute(builder: (context) => const LoginScreen()),
              );
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.accentRed),
            child: const Text('Keluar'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    // Tampilan Tab: Tab 0 = HomeScreen, Tab 1 = Mutasi, Tab 2 = Pesan, Tab 3 = Akun
    final List<Widget> pages = [
      const HomeScreen(),
      const HistoryScreen(),
      const MessagesScreen(),
      _buildAccountPage(),
    ];

    return Scaffold(
      body: IndexedStack(
        index: _selectedIndex,
        children: pages,
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          boxShadow: [
            BoxShadow(
              color: AppColors.shadow.withOpacity(0.08),
              blurRadius: 20,
              offset: const Offset(0, -6),
            ),
          ],
        ),
        child: NavigationBar(
          selectedIndex: _selectedIndex,
          onDestinationSelected: _onItemTapped,
          backgroundColor: AppColors.surface,
          elevation: 0,
          height: 68,
          destinations: const [
            NavigationDestination(
              icon: Icon(CupertinoIcons.house),
              selectedIcon: Icon(CupertinoIcons.house_fill, color: AppColors.primary),
              label: AppStrings.navHome,
            ),
            NavigationDestination(
              icon: Icon(CupertinoIcons.list_bullet_indent),
              selectedIcon: Icon(CupertinoIcons.list_bullet_indent, color: AppColors.primary),
              label: AppStrings.navHistory,
            ),
            NavigationDestination(
              icon: Icon(CupertinoIcons.chat_bubble_2),
              selectedIcon: Icon(CupertinoIcons.chat_bubble_2_fill, color: AppColors.primary),
              label: AppStrings.navMessages,
            ),
            NavigationDestination(
              icon: Icon(CupertinoIcons.person),
              selectedIcon: Icon(CupertinoIcons.person_fill, color: AppColors.primary),
              label: AppStrings.navAccount,
            ),
          ],
        ),
      ),
    );
  }

  // Halaman Placeholder untuk Tab Mutasi dan Pesan
  Widget _buildPlaceholderPage(String title, IconData icon, String description) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(title),
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(32.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: AppColors.primary.withOpacity(0.08),
                  shape: BoxShape.circle,
                ),
                child: Icon(icon, size: 64, color: AppColors.primary),
              ),
              const SizedBox(height: 24),
              Text(
                title,
                style: AppTextStyles.textTheme.headlineLarge,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 12),
              Text(
                description,
                style: AppTextStyles.textTheme.bodyMedium?.copyWith(
                  color: AppColors.textSecondary,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 32),
              ElevatedButton.icon(
                onPressed: () => _onItemTapped(0),
                icon: const Icon(CupertinoIcons.arrow_left, size: 18),
                label: const Text('Kembali ke Beranda'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // Halaman Khusus untuk Tab Akun / Profil
  Widget _buildAccountPage() {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text(AppStrings.navAccount),
        actions: [
          IconButton(
            icon: const Icon(CupertinoIcons.power, color: AppColors.accentRed),
            onPressed: _confirmLogout,
            tooltip: 'Keluar Akun',
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        child: Column(
          children: [
            // Logo Resmi Bank Kuningan
            Container(
              margin: const EdgeInsets.only(bottom: 20),
              padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 20),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: AppColors.border),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Image.asset(
                    'assets/images/bank-kuningan-logo.png',
                    height: 44,
                    fit: BoxFit.contain,
                  ),
                ],
              ),
            ),

            // Kartu Profil Nasabah
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: AppColors.border),
                boxShadow: [
                  BoxShadow(color: AppColors.shadow.withOpacity(0.05), blurRadius: 16),
                ],
              ),
              child: Row(
                children: [
                  Container(
                    width: 70,
                    height: 70,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [AppColors.primaryDark, AppColors.primary],
                      ),
                      shape: BoxShape.circle,
                      border: Border.all(color: AppColors.accentYellow, width: 2.5),
                    ),
                    child: const Center(
                      child: Text(
                        'BS',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 24,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 18),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Budi Santoso', style: AppTextStyles.textTheme.headlineMedium),
                        const SizedBox(height: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: AppColors.accentGreen.withOpacity(0.12),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            'Status Akun: AKTIF',
                            style: AppTextStyles.textTheme.labelSmall?.copyWith(
                              color: AppColors.accentGreen,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Daftar Pengaturan
            _buildSettingsGroup('Pengaturan Keamanan', [
              _buildSettingsItem(CupertinoIcons.lock_shield_fill, 'Ubah PIN Bank Kuningan', 'Perbarui 6 digit PIN secara berkala'),
              _buildSettingsItem(CupertinoIcons.viewfinder_circle_fill, 'Biometric Login', 'Aktifkan sidik jari atau Face ID', trailingSwitch: true),
              _buildSettingsItem(CupertinoIcons.device_phone_portrait, 'Perangkat Terdaftar', 'Kelola perangkat yang terhubung'),
            ]),
            const SizedBox(height: 20),

            _buildSettingsGroup('Layanan & Bantuan', [
              _buildSettingsItem(CupertinoIcons.question_circle_fill, 'Pusat Bantuan (FAQ)', 'Tanya jawab seputar transaksi bank'),
              _buildSettingsItem(CupertinoIcons.phone_fill, 'Hubungi Call Center 24 Jam', '1500-123 (Bebas Pulsa)'),
              _buildSettingsItem(CupertinoIcons.doc_text_fill, 'Syarat & Ketentuan', 'Kebijakan privasi dan layanan'),
            ]),
            const SizedBox(height: 28),

            // Tombol Logout
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: _confirmLogout,
                icon: const Icon(CupertinoIcons.power, color: AppColors.accentRed),
                label: Text(
                  'Keluar dari Akun Bank Kuningan',
                  style: AppTextStyles.textTheme.labelLarge?.copyWith(color: AppColors.accentRed),
                ),
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: AppColors.accentRed, width: 1.5),
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
              ),
            ),
            const SizedBox(height: 20),
            Text(
              'Versi Aplikasi 1.0.0 (Material Design 3)',
              style: AppTextStyles.textTheme.bodySmall?.copyWith(color: AppColors.textHint),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildSettingsGroup(String title, List<Widget> items) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 4, bottom: 8),
          child: Text(title, style: AppTextStyles.textTheme.titleMedium),
        ),
        Container(
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: AppColors.border),
          ),
          child: Column(
            children: items,
          ),
        ),
      ],
    );
  }

  Widget _buildSettingsItem(IconData icon, String title, String subtitle, {bool trailingSwitch = false}) {
    return Material(
      color: Colors.transparent,
      child: ListTile(
        leading: Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: AppColors.primary.withOpacity(0.08),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(icon, color: AppColors.primary, size: 22),
        ),
        title: Text(title, style: AppTextStyles.textTheme.titleMedium),
        subtitle: Text(subtitle, style: AppTextStyles.textTheme.bodySmall),
        trailing: trailingSwitch
            ? Switch(value: true, onChanged: (v) {}, activeColor: AppColors.primary)
            : const Icon(CupertinoIcons.chevron_right, size: 18, color: AppColors.textSecondary),
        onTap: () {},
      ),
    );
  }
}
