# Notulensi Uji Keselarasan Solusi (Solution Alignment Testing)
**Crypto-Sentinel 2026 — Tim EXPRESSO S1251**
**Program:** PIDI Digdaya Hackathon & Inkubasi 2026
**Dokumen untuk klaim:** Solution Alignment Level 3
**Tanggal Pengujian:** 25 Agustus 2026

---

## Informasi Umum

| Item | Detail |
|---|---|
| Nama Produk | Crypto-Sentinel 2026 |
| Versi | v0.5.0 (SHAP + GNN Hybrid) |
| Tim | EXPRESSO S1251 — Rifki · Aam · Desta · Billy |
| Offtaker 1 | Bank BJB (Bank Pembangunan Daerah Jabar-Banten) — BUMD |
| Offtaker 2 | Bank Kuningan (BPR Kuningan) — BUMD |
| Metode Pengujian | Demo langsung + diskusi kebutuhan + sandbox simulasi |
| Lingkungan | Lokal (localhost:8000 AI Engine, localhost:8080 Core Banking, localhost:5173 Dashboard) |

---

## Bagian A — Pengujian Bersama Bank BJB

### TC-BJB-01: Penyelarasan Fitur Sistem dengan Kebutuhan AML/APU-PPT

| Field | Isi |
|---|---|
| **ID Test Case** | TC-BJB-01 |
| **Nama Pengujian** | Penyelarasan fitur Crypto-Sentinel dengan kebutuhan AML/APU-PPT BJB |
| **Tujuan** | Memverifikasi apakah fitur utama sistem relevan dengan proses kepatuhan AML yang dijalankan BJB |
| **Pelaksana** | Tim EXPRESSO S1251 + Tim IT & Compliance Bank BJB |
| **Langkah Pengujian** | 1. Presentasi seluruh komponen: FDS AI, Rule Engine, Dashboard, LTKM Generator, Mobile App. 2. Demo live transaksi simulasi. 3. Diskusi relevansi dengan SOP internal BJB. |
| **Hasil yang Diharapkan** | Semua komponen dianggap relevan dengan kebutuhan AML BJB |
| **Hasil Aktual** | Komponen relevan. Catatan: FDS internal BJB memiliki ratusan indikator vs 13 indikator Crypto-Sentinel — gap diakui, roadmap diperlukan |
| **Status** | PASS dengan catatan |
| **Tindak Lanjut** | Buat roadmap perluasan indikator FDS untuk fase inkubasi |

---

### TC-BJB-02: Uji Anonimisasi Data Nasabah di Dashboard

| Field | Isi |
|---|---|
| **ID Test Case** | TC-BJB-02 |
| **Nama Pengujian** | Anonimisasi data nasabah sesuai standar keamanan BJB & UU PDP |
| **Tujuan** | Memverifikasi apakah data sensitif nasabah sudah terlindungi di tampilan dashboard |
| **Pelaksana** | Tim EXPRESSO S1251 + Tim Compliance Bank BJB |
| **Langkah Pengujian** | 1. Buka dashboard compliance. 2. Periksa tampilan nomor rekening, nama, NIK di tabel transaksi. 3. Bandingkan dengan standar anonimisasi UU PDP No. 27/2022. |
| **Hasil yang Diharapkan** | Nomor rekening dan data identitas ditampilkan dalam format anonim (misal: `****7890`) |
| **Hasil Aktual** | FAIL — Data nasabah masih ditampilkan secara penuh (contoh: `1234567890`, nama lengkap tanpa masking) |
| **Status** | FAIL |
| **Perubahan Solusi** | Implementasi pseudonimisasi: rekening → `****7890`, nama → inisial, NIK → `****XXXX` |
| **Tindak Lanjut** | Buat fungsi `maskAccount()` dan `maskName()` di semua komponen dashboard yang menampilkan data nasabah |

---

### TC-BJB-03: Uji Format Laporan LTKM / STR Generator

| Field | Isi |
|---|---|
| **ID Test Case** | TC-BJB-03 |
| **Nama Pengujian** | Validasi format laporan LTKM terhadap standar PPATK goAML |
| **Tujuan** | Memverifikasi apakah laporan LTKM yang dihasilkan sistem sesuai format standar pelaporan PPATK |
| **Pelaksana** | Tim EXPRESSO S1251 + Tim Compliance Bank BJB |
| **Langkah Pengujian** | 1. Trigger transaksi fraudulent (skor ≥85). 2. Buka endpoint `/str/generate`. 3. Download PDF LTKM. 4. Bandingkan struktur dengan template PPATK goAML. |
| **Hasil yang Diharapkan** | Format LTKM mencakup: identitas pelapor, identitas terlapor, deskripsi transaksi mencurigakan, dasar hukum (UU No. 8/2010) |
| **Hasil Aktual** | PASS — Format dinilai sudah bagus dan mirip dengan standar yang biasa digunakan tim compliance BJB |
| **Status** | PASS |
| **Tindak Lanjut** | Tidak ada perubahan signifikan diperlukan |

---

### TC-BJB-04: Uji Smart Circuit Breaker — Risiko False Positive

| Field | Isi |
|---|---|
| **ID Test Case** | TC-BJB-04 |
| **Nama Pengujian** | Evaluasi risiko false positive pada fitur Smart Circuit Breaker |
| **Tujuan** | Menilai apakah mekanisme auto-block dapat memblokir transaksi legitimate yang merugikan nasabah dan reputasi bank |
| **Pelaksana** | Tim EXPRESSO S1251 + Tim IT & Compliance Bank BJB |
| **Langkah Pengujian** | 1. Simulasikan transaksi legitimate nominal besar (skor 60–70). 2. Amati keputusan sistem (ALLOW/REVIEW/BLOCK). 3. Diskusikan implikasi jika auto-block diterapkan pada skor tersebut. |
| **Hasil yang Diharapkan** | Sistem hanya auto-block pada skor sangat tinggi (≥85); skor menengah masuk antrean review manual |
| **Hasil Aktual** | FAIL — Sistem sebelumnya bisa auto-block pada skor 60+ tanpa intervensi manusia, menimbulkan risiko false positive |
| **Status** | FAIL — Perlu perbaikan |
| **Perubahan Solusi** | Ubah logika: skor 60–84 → status REVIEW (human approval dahulu); skor ≥85 → auto-BLOCK. Tambah tombol Override untuk analis compliance |
| **Tindak Lanjut** | Update rule threshold di `rule_engine.py` + tambah endpoint `POST /alerts/{id}/override` |

---

## Bagian B — Pengujian Bersama Bank Kuningan (BPR)

### TC-KNG-01: Uji Kesesuaian Skenario Transaksi BPR

| Field | Isi |
|---|---|
| **ID Test Case** | TC-KNG-01 |
| **Nama Pengujian** | Validasi skenario transaksi dengan dummy profile nasabah BPR Kuningan |
| **Tujuan** | Memverifikasi apakah sistem dapat diuji menggunakan data simulasi yang merepresentasikan nasabah BPR lokal |
| **Pelaksana** | Tim EXPRESSO S1251 + Staf IT Bank Kuningan |
| **Langkah Pengujian** | 1. Buat dummy profile nasabah BPR (nama, rekening, kota Kuningan). 2. Simulasikan transaksi RTOL dan SKNBI dari mobile app. 3. Verifikasi deteksi di dashboard. |
| **Hasil yang Diharapkan** | Transaksi simulasi terdeteksi dan terlacak di dashboard dengan profil nasabah yang realistis |
| **Hasil Aktual** | PASS dengan catatan — Transaksi berhasil diproses. Catatan: dummy profile saat ini generik, belum spesifik karakteristik nasabah BPR Kuningan (nominal kecil, transaksi lokal Jabar) |
| **Status** | PASS dengan catatan |
| **Perubahan Solusi** | Buat dataset dummy nasabah spesifik BPR Kuningan dengan karakteristik transaksi yang representatif |
| **Tindak Lanjut** | Generate 50+ akun simulasi dengan pola transaksi khas BPR Kuningan |

---

### TC-KNG-02: Uji Deteksi Perpindahan Dana Lintas Kota (Impossible Travel)

| Field | Isi |
|---|---|
| **ID Test Case** | TC-KNG-02 |
| **Nama Pengujian** | Deteksi anomali geolokasi — transaksi dari kota berbeda dalam waktu singkat |
| **Tujuan** | Memverifikasi apakah sistem mampu mendeteksi pola fraud di mana akun diakses dari lokasi berbeda dalam interval tidak masuk akal |
| **Pelaksana** | Tim EXPRESSO S1251 + Staf IT Bank Kuningan |
| **Langkah Pengujian** | 1. Kirim transaksi dari IP lokasi Kuningan (lat: -6.97, long: 108.49). 2. Dalam <10 menit, kirim transaksi dari IP lokasi Jakarta (lat: -6.20, long: 106.80). 3. Periksa apakah sistem mendeteksi anomali geolokasi. |
| **Hasil yang Diharapkan** | Sistem memicu alert Impossible Travel jika jarak >100 km dalam <30 menit |
| **Hasil Aktual** | FAIL — Rule engine belum memiliki sub-indikator `geo_velocity_anomaly`. Field `latitude` dan `longitude` sudah tersedia di API tetapi belum digunakan dalam scoring |
| **Status** | FAIL |
| **Perubahan Solusi** | Tambah rule baru di `rule_engine.py`: hitung jarak haversine antar transaksi berurutan, jika >100km dalam <30 menit → +25 poin risiko |
| **Tindak Lanjut** | Implementasi `geo_velocity_anomaly` rule di sprint berikutnya |

---

### TC-KNG-03: Uji Case Management System (CMS) untuk Tim Compliance

| Field | Isi |
|---|---|
| **ID Test Case** | TC-KNG-03 |
| **Nama Pengujian** | Evaluasi ketersediaan modul manajemen kasus fraud untuk analis |
| **Tujuan** | Memverifikasi apakah sistem menyediakan workflow investigasi alert yang terstruktur bagi tim compliance |
| **Pelaksana** | Tim EXPRESSO S1251 + Tim Compliance Bank Kuningan |
| **Langkah Pengujian** | 1. Trigger alert fraud dari transaksi simulasi. 2. Coba ubah status alert (OPEN → IN_REVIEW → CLOSED). 3. Coba tambahkan catatan investigasi. 4. Cek riwayat audit siapa yang mereview. |
| **Hasil yang Diharapkan** | Dashboard memiliki modul CMS dengan status tracking, form catatan, dan audit trail per kasus |
| **Hasil Aktual** | FAIL — Dashboard hanya memiliki tombol "Resolve" tanpa status tracking terstruktur, tanpa form catatan investigasi, tanpa audit trail |
| **Status** | FAIL |
| **Perubahan Solusi** | Buat tabel `case_logs` di database. Tambah endpoint `PATCH /cases/{id}/status` dan `POST /cases/{id}/notes`. Buat komponen CMS di dashboard |
| **Tindak Lanjut** | Implementasi modul CMS sebagai fitur prioritas berikutnya |

---

### TC-KNG-04: Uji Audit Trail & Kebijakan 1 Akun 1 Device

| Field | Isi |
|---|---|
| **ID Test Case** | TC-KNG-04 |
| **Nama Pengujian** | Deteksi akses akun dari perangkat berbeda (device binding) |
| **Tujuan** | Memverifikasi apakah sistem mendeteksi dan memblokir akses akun yang sama dari lebih dari satu perangkat |
| **Pelaksana** | Tim EXPRESSO S1251 + Staf IT Bank Kuningan |
| **Langkah Pengujian** | 1. Login ke mobile app dari Perangkat A. 2. Login akun yang sama dari Perangkat B. 3. Periksa apakah sistem mendeteksi dan mengirim alert. 4. Verifikasi log aktivitas di dashboard. |
| **Hasil yang Diharapkan** | Sistem memblokir/mengirim alert saat akun yang sama diakses dari perangkat berbeda |
| **Hasil Aktual** | FAIL — Sistem belum memiliki fitur device binding. Multi-device login diizinkan tanpa alert |
| **Status** | FAIL |
| **Perubahan Solusi** | Implementasi `device_id` binding di tabel nasabah. Deteksi `device_id` berbeda saat login → trigger alert compliance. Simpan log: timestamp, IP, device_id, lokasi |
| **Tindak Lanjut** | Implementasi device binding di `expresso-api` dan update Flutter mobile app |

---

## Ringkasan Hasil Pengujian

| ID | Nama Pengujian | Offtaker | Status |
|---|---|---|---|
| TC-BJB-01 | Penyelarasan fitur dengan kebutuhan AML/APU-PPT | Bank BJB | PASS (dengan catatan) |
| TC-BJB-02 | Anonimisasi data nasabah di dashboard | Bank BJB | FAIL → Planned fix |
| TC-BJB-03 | Format laporan LTKM / STR | Bank BJB | PASS |
| TC-BJB-04 | Risiko false positive Smart Circuit Breaker | Bank BJB | FAIL → Planned fix |
| TC-KNG-01 | Skenario transaksi dummy BPR Kuningan | Bank Kuningan | PASS (dengan catatan) |
| TC-KNG-02 | Deteksi transaksi lintas kota (Impossible Travel) | Bank Kuningan | FAIL → Planned fix |
| TC-KNG-03 | Case Management System untuk compliance | Bank Kuningan | FAIL → Planned fix |
| TC-KNG-04 | Audit trail dan 1 akun 1 device | Bank Kuningan | FAIL → Planned fix |

**Total:** 3 PASS / 5 FAIL (semua FAIL memiliki rencana perbaikan terdokumentasi)

---

## Perubahan Solusi yang Sudah Diimplementasi

| Perubahan | File | Tanggal |
|---|---|---|
| Multi-Partner SNAP BI Auth (KNG + BJB) | `expresso-api/routers/transfers.py` | 25 Agustus 2026 |
| Fix field `method` di Flutter Mobile Kuningan | `crypto-sentinel-bank-kng/lib/data/api_service.dart` | 25 Agustus 2026 |
| SHAP Explainability — transparansi keputusan AI | `crypto-sentinel-api/app/main.py` | 26 Agustus 2026 |

---

*Dokumen ini dibuat berdasarkan notulensi diskusi tim EXPRESSO S1251 dengan offtaker Bank BJB dan Bank Kuningan dalam rangka program PIDI Digdaya Hackathon & Inkubasi 2026. Seluruh pengujian dilakukan dalam lingkungan sandbox dengan data simulasi.*
