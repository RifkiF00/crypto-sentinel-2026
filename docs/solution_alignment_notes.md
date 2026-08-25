# Notulensi Diskusi & Perubahan Solusi — Crypto-Sentinel 2026
**Dokumen untuk klaim: Solution Alignment Level 3**
*Tim EXPRESSO S1251 — Program PIDI Digdaya Hackathon & Inkubasi 2026*

---

## 📋 Ringkasan Diskusi dengan Offtaker

Tim EXPRESSO S1251 telah melakukan dua sesi diskusi mendalam dengan dua offtaker perbankan untuk menyelaraskan solusi Crypto-Sentinel dengan kebutuhan nyata industri perbankan Indonesia.

---

## 🏦 Sesi 1 — Bank BJB (Bank Pembangunan Daerah Jabar-Banten)

**Kategori Offtaker:** Perusahaan BUMD
**Bentuk Ketertarikan:** Wadah Piloting/PoC · Implementasi Solusi · Mentoring · Akses Networking
**Status Komunikasi:** Solution Alignment (Level 4)
**Format Uji Coba:** Sandbox dengan data simulasi (bukan data nasabah nyata)

### Topik Pembahasan

#### 1. Penyelarasan Fitur dengan Kebutuhan BJB
Tim mempresentasikan seluruh komponen Crypto-Sentinel kepada tim IT dan Compliance Bank BJB. Diskusi berfokus pada relevansi sistem dengan kebutuhan AML/APU-PPT yang saat ini dijalankan oleh BJB.

#### 2. Anonimisasi & Privasi Data Nasabah
**Masukan BJB:**
> Seluruh data nasabah yang ditampilkan di dashboard (nomor rekening, nama, NIK) wajib dianonimkan sesuai standar keamanan perbankan BJB dan UU PDP No. 27/2022. Data tidak boleh ditampilkan dalam format mentah.

**Perubahan Solusi yang Diperlukan:**
- Implementasi pseudonimisasi nomor rekening (contoh: `1234567890` menjadi `****7890`)
- Masking nama nasabah di dashboard compliance
- Masking NIK/data identitas di laporan LTKM untuk tampilan internal

#### 3. Cakupan Indikator FDS
**Masukan BJB:**
> Sistem FDS internal BJB memiliki ratusan jenis alert. Crypto-Sentinel saat ini memiliki 13 indikator utama dan 15 sub-indikator — perlu roadmap perluasan untuk mendekati standar enterprise.

**Perubahan Solusi yang Diperlukan:**
- Roadmap penambahan indikator secara bertahap pasca-inkubasi
- Fokus fase pertama: indikator paling kritis untuk BPR/BPD (crypto outflow, smurfing, dormant)
- Dokumentasi gap analisis antara indikator Crypto-Sentinel vs standar FDS enterprise

#### 4. Laporan LTKM/STR
**Masukan BJB:**
> Format laporan LTKM yang dihasilkan Crypto-Sentinel dinilai sudah bagus dan mirip dengan format standar yang biasa digunakan, mengacu pada format goAML PPATK dan UU TPPU No. 8/2010.

**Status:** Tidak ada perubahan signifikan diperlukan.

#### 5. Smart Circuit Breaker — Kekhawatiran False Positive
**Masukan BJB:**
> BJB menyampaikan kekhawatiran terkait fitur Smart Circuit Breaker (pemblokiran transaksi otomatis real-time). Jika terjadi false positive — transaksi nasabah yang sah diblokir — hal ini akan mempertaruhkan integritas dan kredibilitas bank.

**Perubahan Solusi yang Disepakati:**
- Mode Circuit Breaker diubah: **REVIEW dulu, BLOCK setelah human approval** untuk transaksi zona abu-abu (skor 60–84)
- Hanya transaksi skor ≥85 (risiko VERY HIGH) yang dapat auto-block
- Tambahkan mekanisme human-in-the-loop: analis compliance mereview alert sebelum transaksi diblokir permanen
- Tambahkan fitur Override untuk analis

---

## 🏦 Sesi 2 — Bank Kuningan (BPR Kuningan)

**Kategori Offtaker:** Perusahaan BUMD
**Bentuk Ketertarikan:** Wadah Piloting/PoC · Implementasi Solusi · Mentoring · Akses Networking
**Status Komunikasi:** Collaboration Planning (Level 5) — Surat Balasan Kesediaan Pilot telah dikirim
**Format Uji Coba:** Sandbox dengan data simulasi / dummy profile nasabah

### Topik Pembahasan

#### 1. Dummy Profile Nasabah untuk Uji Coba
**Masukan Bank Kuningan:**
> Untuk keperluan uji coba sandbox, dibutuhkan profil nasabah simulasi yang realistis mencerminkan karakteristik nasabah BPR Kuningan (lokasi Jawa Barat, transaksi RTOL/SKNBI, nominal sesuai segmen BPR).

**Perubahan Solusi yang Diperlukan:**
- Buat dataset dummy nasabah spesifik Bank Kuningan (nama, rekening, kota, riwayat transaksi)
- Simulasikan pola transaksi harian BPR (nominal lebih kecil, transaksi antar nasabah daerah)

#### 2. Deteksi Perpindahan Dana Lintas Kota
**Masukan Bank Kuningan:**
> Bank Kuningan melihat pola fraud di mana pelaku melakukan transaksi dari kota yang berbeda dalam waktu sangat singkat — indikasi akun diakses oleh pihak lain atau digunakan sindikat yang beroperasi di berbagai kota.

**Perubahan Solusi yang Diperlukan:**
- Implementasi rule Impossible Travel Detection: transaksi dari koordinat/kota berbeda dalam interval kurang dari 30 menit memicu alert
- Integrasi data geolokasi IP ke rule engine (sudah ada field `ip_address`, `latitude`, `longitude` di API)
- Tambah sub-indikator: `geo_velocity_anomaly`

#### 3. Case Management System (CMS)
**Masukan Bank Kuningan:**
> Dibutuhkan sistem manajemen kasus fraud untuk tim compliance agar dapat mengelola, menginvestigasi, dan menutup setiap alert yang dihasilkan Crypto-Sentinel secara terstruktur. CMS yang dimaksud adalah sistem ticketing/workflow investigasi alert.

**Perubahan Solusi yang Diperlukan:**
- Tambah tabel `case_logs` di database dengan field: case_id, alert_id, status (OPEN/IN_REVIEW/CLOSED), assigned_to, notes, resolved_at
- Tambah endpoint API: `PATCH /cases/{id}/status`, `POST /cases/{id}/notes`
- Tampilan CMS di dashboard: tabel kasus, filter status, form catatan investigasi
- Audit trail per kasus: log siapa mereview kapan

#### 4. Audit Trail & Kebijakan 1 Akun 1 Device
**Masukan Bank Kuningan:**
> Bank Kuningan meminta implementasi kebijakan 1 akun hanya boleh aktif di 1 perangkat sekaligus. Jika akun diakses dari perangkat berbeda, sistem harus mendeteksi dan mengirim alert.

**Perubahan Solusi yang Diperlukan:**
- Implementasi device binding: simpan `device_id` saat login pertama
- Deteksi akses dari `device_id` berbeda → trigger alert ke compliance
- Log seluruh aktivitas login: timestamp, IP, device_id, lokasi (audit trail)
- Uji coba: simulasi login dari beberapa perangkat berbeda untuk memvalidasi deteksi IP anomali

---

## 📊 Tabel Perubahan Solusi Berdasarkan Feedback Offtaker

| # | Feedback Offtaker | Bank | Perubahan Solusi | Status |
|---|---|---|---|---|
| 1 | Data nasabah wajib dianonimkan | BJB | Pseudonimisasi rekening dan nama di dashboard | Planned |
| 2 | FDS memiliki ratusan indikator | BJB | Roadmap perluasan indikator (fase 2) | Roadmap |
| 3 | False positive Circuit Breaker berbahaya | BJB | Human-in-the-loop: auto-block hanya >=85, review untuk 60-84 | Planned |
| 4 | Override mechanism untuk nasabah | BJB | Fitur override analis di dashboard | Planned |
| 5 | Butuh dummy profile nasabah BPR | Kuningan | Dataset simulasi nasabah BPR lokal | Planned |
| 6 | Deteksi transaksi lintas kota | Kuningan | Rule Impossible Travel (geo_velocity_anomaly) | Planned |
| 7 | Butuh Case Management System | Kuningan | Modul CMS: OPEN ke IN_REVIEW ke CLOSED + audit trail | Planned |
| 8 | Kebijakan 1 akun 1 device | Kuningan | Device binding + deteksi IP anomali | Planned |
| 9 | Format LTKM sudah bagus | BJB | Tidak ada perubahan | Selesai |
| 10 | Integrasi SNAP BI | BJB + Kuningan | HMAC-SHA256 multi-partner sudah aktif | Selesai |

---

## Perubahan Solusi yang Sudah Diimplementasi

| Perubahan | File | Keterangan |
|---|---|---|
| Multi-Partner SNAP BI Auth (KNG + BJB) | expresso-api/routers/transfers.py | BJB dan Kuningan kini bisa kirim request dengan secret key berbeda |
| Fix field method di Flutter Kuningan | crypto-sentinel-bank-kng/lib/data/api_service.dart | Sesuai format SNAP BI yang diminta Bank Kuningan |
| SHAP Explainability (transparansi AI) | crypto-sentinel-api/app/main.py | Merespons kekhawatiran BJB soal explainability keputusan circuit breaker |

---

*Dokumen ini dibuat berdasarkan notulensi diskusi tim EXPRESSO S1251 dengan offtaker Bank BJB dan Bank Kuningan dalam rangka program PIDI Digdaya Hackathon & Inkubasi 2026.*
