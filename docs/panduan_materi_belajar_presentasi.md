# 📚 Kit Belajar & Penguasaan Materi: Crypto-Sentinel 2026
## Rangkuman Konsep Teknis, Arsitektur Perbankan, Regulasi, & Strategi Presentasi
*Dokumen ini disusun sebagai panduan belajar komprehensif untuk penguasaan materi pitching & tanya-jawab (Q&A) dengan Dewan Juri, Regulator (BI & OJK), Investor, dan Calon Mitra Perbankan.*

---

## 📑 DAFTAR ISI
1. [Arsitektur Integrasi Bank: Mengapa Tidak Perlu Ubah Core Banking?](#1-arsitektur-integrasi-bank-mengapa-tidak-perlu-ubah-core-banking)
2. [Keamanan Data & Privasi: Apakah Kita Mengambil Data Nasabah?](#2-keamanan-data--privasi-apakah-kita-mengambil-data-nasabah)
3. [Perbandingan FDS Global: Mengapa BPR Butuh Solusi Lokal?](#3-perbandingan-fds-global-mengapa-bpr-butuh-solusi-lokal)
4. [Mengapa Pilot di Bank Kuningan adalah Langkah Juara?](#4-mengapa-pilot-di-bank-kuningan-adalah-langkah-juara)
5. [Fakta Sistem Pembayaran: Memahami BPR, BPD, BI-FAST, SKNBI, & VA](#5-fakta-sistem-pembayaran-memahami-bpr-bpd-bi-fast-sknbi--va)
6. [Studi Kasus Kejahatan Finansial Nyata (Judol, Smurfing, & Rekening Pasif)](#6-studi-kasus-kejahatan-finansial-nyata-judol-smurfing--rekening-pasif)
7. [Regulasi Kunci: POJK No. 12 Tahun 2024 sebagai Pendorong Pasar](#7-regulasi-kunci-pojk-no-12-tahun-2024-sebagai-pendorong-pasar)
8. [Federated Learning: Konsep, Manfaat, & Kaitannya dengan UU PDP](#8-federated-learning-konsep-manfaat--kaitannya-dengan-uu-pdp)
9. [Dilema Interface: Dashboard Monitoring vs Case Management App](#9-dilema-interface-dashboard-monitoring-vs-case-management-app)
10. [Dashboard Menampilkan Nama Nasabah — Salah atau Benar?](#10-dashboard-menampilkan-nama-nasabah--salah-atau-benar)
11. [Configurable Decision Engine: Auto-Block vs Notifikasi vs Keduanya](#11-configurable-decision-engine-auto-block-vs-notifikasi-vs-keduanya)
12. [Strategi Kompetisi: Mengumpulkan 1000+ PIDI Points Menuju Final](#12-strategi-kompetisi-mengumpulkan-1000-pidi-points-menuju-final)
13. [Bank Pertanyaan & Jawaban Cerdas untuk Sesi Q&A Juri](#13-bank-pertanyaan--jawaban-cerdas-untuk-sesi-qa-juri)
14. [Deteksi Rekening Mule & Analisis False Positive (Bansos, WiFi, Deadline)](#14-deteksi-rekening-mule--analisis-false-positive-bansos-wifi-deadline)

---

## 1. Arsitektur Integrasi Bank: Mengapa Tidak Perlu Ubah Core Banking?

### A. Masalah di Dunia Perbankan
*Core Banking System* (CBS) seperti Temenos T24, FinnOne, atau USSI IBS adalah **"Holy Ground"** perbankan. Bank sangat ketat dan tidak akan mengizinkan aplikasi pihak ketiga mengubah kode program atau struktur database inti mereka karena risiko *downtime*, korupsi data, dan audit regulasi.

### B. Solusi: Arsitektur "Sidecar" / Non-Intrusive (Plug-and-Play)
Crypto-Sentinel tidak duduk di dalam Core Banking, melainkan bekerja sebagai **Sidecar Middleware (Pengawas Luar)**.

```
┌──────────────────────────────────────────────────────────────────┐
│                      LINGKUNGAN BANK                             │
│                                                                  │
│  [Core Banking / SIBAKU]  ──(Replikasi Log Transaksi Read-Only)──┐
│             ▲                                                    │
│             │                                                    ▼
│  [Aplikasi Kasir / Teller]                         ┌───────────────────────────┐
│             ▲                                      │   CRYPTO-SENTINEL ENGINE   │
│             │ (Tetap jalan normal)                 │  - 15 Rules APU-PPT       │
│  [Nasabah Bertransaksi]                            │  - Graph Neural Network   │
│                                                    └─────────────┬─────────────┘
│                                                                  │ (Alert <20ms)
│                                                                  ▼
│                                                    ┌───────────────────────────┐
│                                                    │  DASHBOARD COMPLIANCE     │
│                                                    │  (Petugas Kepatuhan)      │
└────────────────────────────────────────────────────┴───────────────────────────┘
```

### C. 3 Pilihan Teknis Integrasi:
1. **API Webhook (Paling Praktis):** Setiap ada transaksi baru, middleware bank mengirim salinan payload JSON ke endpoint `/api/v1/analyze` kita.
2. **Database CDC (Change Data Capture / Debezium):** Mesin kita membaca riwayat transaksi secara *read-only* langsung dari log database tanpa membebani performa query bank.
3. **Message Broker (Kafka / RabbitMQ):** Menjadi *subscriber* pasif pada antrean transaksi bank.

---

## 2. Keamanan Data & Privasi: Apakah Kita Mengambil Data Nasabah?

### Jawabannya: YA, AI membaca data transaksi, TETAPI dengan 2 Prinsip Ketat:

### A. Prinsip On-Premise / Jaringan Lokal Bank (Data TIDAK Pernah Keluar)
- Software Crypto-Sentinel di-install di dalam ruang server atau *private intranet* milik Bank Kuningan itu sendiri.
- Data transaksi nasabah **TIDAK PERNAH dikirim ke cloud publik, tidak ke laptop pribadi pengembang, dan tidak keluar dari gedung bank**.

### B. Prinsip Minimalisasi Data (*Data Minimization* per UU PDP No. 27/2022)
AI hanya membutuhkan data numerik dan perilaku pola transaksi, bukan data identitas rahasia:

| Data yang DIBACA AI (Perilaku Transaksi) | Data yang TIDAK PERNAH DISENTUH (Rahasia Nasabah) |
|---|---|
| ✅ Nominal transaksi (misal: Rp 4.900.000) | ❌ **NIK / Nomor KTP** |
| ✅ Waktu & Jam transaksi (misal: 02.15 WIB) | ❌ **PIN / Password / OTP** |
| ✅ Frekuensi transaksi (misal: 10x dalam 1 jam) | ❌ **Nama Ibu Kandung** |
| ✅ Saldo sebelum & sesudah | ❌ **Alamat Rumah / Nomor HP Pribadi** |
| ✅ ID Rekening (disamarkan/di-hash: `SHA256`) | ❌ **Foto Wajah / Tanda Tangan** |

> **Analogi Satpam & Metal Detector untuk Juri:**
> *"Ibarat petugas satpam yang memeriksa tas pengunjung di lobi bank menggunakan metal detector. Satpam hanya mendeteksi apakah ada benda berbahaya atau tidak. Satpam tidak membaca surat pribadi di dalam tas, dan satpam bekerja di dalam bank — tas pengunjung tidak pernah dibawa keluar gedung bank."*

---

## 3. Perbandingan FDS Global: Mengapa BPR Butuh Solusi Lokal?

| Nama FDS | Asal Negara | Profil & Pengguna | Kelemahan Fatal untuk BPR |
|---|---|---|---|
| **NICE Actimize** | 🇺🇸 USA / 🇮🇱 Israel | Pemimpin pasar global. Dipakai Bank Mandiri, BRI, BCA, BNI. | Biaya lisensi **miliaran rupiah/tahun**, butuh server raksasa & tim IT khusus. |
| **Feedzai** | 🇵🇹 Portugal / 🇺🇸 USA | AI/ML FDS untuk bank digital & payment gateway multinasional. | Kontrak minimum jutaan USD, berbasis cloud asing. |
| **ThetaRay** | 🇮🇱 Israel / 🇺🇸 USA | Spesialis AML transaksi valuta asing & perdagangan internasional. | Sangat rumit, tidak dirancang untuk alur kasir/BPR daerah. |
| **Crypto-Sentinel** | 🇮🇩 **Indonesia (UNIKU)** | Dirancang khusus untuk BPR & BPD daerah (Kepatuhan POJK 12/2024). | ✅ Ringan, Plug-and-Play, Bahasa Indonesia, **Terjangkau & Ada Draf LTKM PPATK**. |

> **Poin Kunci:** Bank besar sudah punya software mahal. Tapi **1.600+ BPR di Indonesia sama sekali tidak memiliki FDS otomatis**. Crypto-Sentinel mengisi celah pasar (*blue ocean*) yang diabaikan vendor global.

---

## 4. Mengapa Pilot di Bank Kuningan adalah Langkah Juara?

1. **Prioritas Utama OJK & Bank Indonesia:**
   Program PIDI Hackathon mencari inovasi yang memperkuat **ketahanan keuangan daerah (Problem Statement 1)**. Melindungi BPR daerah yang rentan memberikan nilai dampak (*impact score*) jauh lebih tinggi di mata juri daripada sekadar membuat konsep teoritis untuk bank besar di Jakarta.
2. **Kecepatan Validasi Lapangan (*Speed of Execution*):**
   Mendapatkan izin pilot di bank BUMN butuh 6–12 bulan birokrasi. Di Bank Kuningan, kita memiliki akses langsung ke Kabag Ekonomi dan Direksi Kepatuhan dalam hitungan hari.
3. **Strategi *Beachhead Market*:**
   Validasi di Bank Kuningan adalah bukti nyata (*evidence*) untuk memenangkan Capstone, sebelum melakukan ekspansi ke BPD bank bjb dan ribuan BPR lainnya di Jawa Barat.

---

## 5. Fakta Sistem Pembayaran: Memahami BPR, BPD, BI-FAST, SKNBI, & VA

```
┌────────────────────────────────────────────────────────────────────────┐
│ BANK INDONESIA (Regulator Sistem Pembayaran)                           │
│  ├─ BI-FAST (Transfer Ritel Nasional Real-Time, Rp 2.500, Max 250 Juta)│
│  └─ SKNBI / RTGS (Kliring Nasional & Nilai Besar)                      │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                ┌──────────────────┴──────────────────┐
                ▼                                     ▼
   [BANK UMUM & BPD (e.g. bank bjb)]       [BPR (e.g. Bank Kuningan)]
   - Peserta Langsung BI-FAST              - BUKAN Peserta Langsung BI-FAST
   - Memiliki Core Banking Kompleks        - Core Banking: SIBAKU / USSI
   - Punya Mobile Banking Mandiri          - Menggunakan BJB sebagai Apex Bank
   - Kanal: BI-FAST & RTOL                 - Kanal: Teller, Kolektor, Apex VA
```

### A. Batas Nominal Transfer (Limit Regulasi BI):
- **SKNBI (Kliring):** Batas maksimal **Rp 1.000.000.000,- (1 Miliar Rupiah)** per transaksi, biaya Rp 2.900,- (penyelesaian berkala dalam hari kerja).
- **Virtual Account (VA) Apex bjb:** Transfer instan antarbank dengan limit harian m-banking (Rp 25 Juta s/d Rp 50 Juta per hari).

### B. 4 Alur Transaksi Harian di BPR:
1. **Setoran / Tarikan Tunai di Kasir:** Nasabah transaksi di kantor cabang (dicatat di CBS SIBAKU).
2. **Kolektor Lapangan:** Petugas menjemput tabungan pedagang pasar menggunakan aplikasi EDC/Android.
3. **Transfer Keluar:** Nasabah BPR transfer ke bank lain via perantara bank bjb (SKNBI/RTOL).
4. **Transfer Masuk:** Uang masuk dari luar kota via Virtual Account bank bjb.

---

## 6. Studi Kasus Kejahatan Finansial Nyata (Judol, Smurfing, & Rekening Pasif)

### A. Modus Rekening Pasif (Dormant Account Abuse)
- **Fakta PPATK:** Sepanjang 2024, lebih dari **28.000 rekening diblokir** karena terkait judi online.
- **Cara Kerja Sindikat:** Membeli buku tabungan tidak aktif milik warga seharga Rp 300rb - Rp 500rb. Rekening yang biasanya hanya bersaldo Rp 20.000 mendadak menerima puluhan transfer masuk dari luar daerah.

### B. Modus Pemecahan Transaksi (Smurfing / Structuring)
- **Ambang Batas PPATK:** Bank wajib lapor Transaksi Keuangan Tunai (TKT) jika nominal $\ge$ Rp 500 Juta.
- **Cara Kriminal Menghindar:** Dana dipecah menjadi transaksi kecil Rp 2 juta – Rp 4,9 juta berkali-kali dalam sehari agar tidak dicurigai teller.

### C. Modus Perputaran Kilat (Rapid Turnover / Pass-Through)
- Uang masuk jam 10:15 WIB, lalu pada jam 10:20 WIB seluruh saldo langsung ditarik tunai habis di kantor kas tanpa ada saldo mengendap.

---

## 7. Regulasi Kunci: POJK No. 12 Tahun 2024 sebagai Pendorong Pasar

*Peraturan Otoritas Jasa Keuangan (POJK) No. 12 Tahun 2024 tentang Penerapan Strategi Anti Fraud bagi Lembaga Jasa Keuangan (LJK).*

### 4 Pilar Wajib Anti-Fraud OJK:
1. **Pencegahan:** Standarisasi KYC/CDD dan pembinaan pegawai.
2. **Deteksi:** **Pemantauan transaksi mencurigakan secara otomatis (Fungsi Crypto-Sentinel).**
3. **Investigasi, Pelaporan, & Sanksi:** Standarisasi pelaporan ke OJK dan PPATK (LTKM).
4. **Pemantauan & Evaluasi:** Audit berkala terhadap kelemahan sistem.

---

## 8. Federated Learning: Konsep, Manfaat, & Kaitannya dengan UU PDP

```
          ┌──────────────────────────────────────────────┐
          │         SERVER AGREGASI GLOBAL PUSAT         │
          │         (Konsorsium OJK / Asosiasi)          │
          └──────▲──────────────────▲──────────────────▲─┘
                 │                  │                  │
         (Hanya Kirim Bobot) (Hanya Bobot)     (Hanya Bobot)
                 │                  │                  │
        ┌────────┴───────┐  ┌───────┴────────┐ ┌───────┴────────┐
        │ BPR KUNINGAN   │  │  BPD BJB       │ │  BPR CIAMIS    │
        │ [Data Lokal]   │  │ [Data Lokal]   │ │ [Data Lokal]   │
        │ (Latih Mandiri)│  │ (Latih Mandiri)│ │ (Latih Mandiri)│
        └────────────────┘  └────────────────┘ └────────────────┘
```
1. **Local Training:** Setiap bank melatih model GNN secara lokal menggunakan data internalnya.
2. **Weight Sharing:** Bank hanya mengirimkan **bobot matematis model (weights)** ke server pusat — bukan data nasabah.
3. **Agregasi FedAvg:** Server pusat menggabungkan bobot menjadi satu **Model Global Cerdas**.
4. **Distribusi:** Model global dikirim kembali ke seluruh bank peserta.

---

## 9. Dilema Interface: Dashboard Monitoring vs Case Management App

| Tipe Tampilan | Pengguna Target | Fungsi Utama | Status di Crypto-Sentinel |
|---|---|---|---|
| **Monitoring Dashboard** | *Compliance Officer*, Direktur Kepatuhan | Memantau anomali real-time, grafik relasi rekening, tren risiko per jam. | ✅ **Sudah Live** (Dashboard React) |
| **Case Management Portal** | Analis APU-PPT | Investigasi mendalam akun tersangka, one-click unduh dokumen bukti & laporan LTKM. | 🟡 **Sedang Diselesaikan** (STR Generator) |
| **Mobile Banking** | Nasabah Umum | Bertransaksi normal; menerima alert penolakan jika transaksi berbahaya. | ✅ **Sudah Ada** (Flutter App & Expresso API) |

---

## 10. Strategi Kompetisi: Mengumpulkan 1000+ PIDI Points Menuju Final

```
TARGET POIN CRYPTO-SENTINEL:
┌──────────────────────────────────────────────────────────┬───────────┐
│ Komponen Aktivitas                                       │ Target    │
├──────────────────────────────────────────────────────────┼───────────┤
│ Functional Prototype L3 (Live API + Dashboard + App)     │ +150 Poin │
│ Pitch Deck Submission (14 Slide Sesuai Guideline)        │ +300 Poin │
│ Kehadiran & Kemajuan Mentoring 4 Pekan                   │ +400 Poin │
│ Partisipasi Webinar Tematik #1, #2, #3 + Kuis            │ +150 Poin │
│ Business Matching L5 (LoI Pilot Project Bank Kuningan)   │ +150 Poin │
│ Validasi Pengguna (User Testing Direktur Kepatuhan)      │ +200 Poin │
├──────────────────────────────────────────────────────────┼───────────┤
│ TOTAL AKUMULASI POTENSIAL                                │ 1.350 Poin│
└──────────────────────────────────────────────────────────┴───────────┘
```

---

## 11. Bank Pertanyaan & Jawaban Cerdas untuk Sesi Q&A Juri

### Q1: *"Apakah data nasabah bank aman saat dianalisis oleh Crypto-Sentinel?"*
> **Jawaban:**
> *"Sangat aman. Sistem kami di-deploy secara on-premise di dalam jaringan lokal bank. Data identitas sensitif (PII seperti NIK, Password, No HP) tidak pernah disentuh atau diekspor keluar. Kami hanya memproses metadata transaksi numerik sesuai kaidah UU Perlindungan Data Pribadi (UU No. 27/2022)."*

### Q2: *"Kenapa memilih BPR Bank Kuningan daripada bank umum besar?"*
> **Jawaban:**
> *"Bank umum besar sudah memiliki anggaran untuk membeli software global. Sebaliknya, 1.600+ BPR di Indonesia saat ini diwajibkan oleh POJK No. 12/2024 untuk memiliki sistem anti-fraud, namun tidak memiliki solusi yang terjangkau. Memulai pilot di Bank Kuningan membuktikan dampak nyata solusi kami di akar rumput perbankan daerah sebelum kami ekspansi ke skala nasional."*

### Q3: *"Apa bedanya sistem ini dengan rule-based engine bawaan Core Banking?"*
> **Jawaban:**
> *"Core banking konvensional hanya memiliki rule kaku berbasis ambang batas statis (misal: lapor jika transaksi > 100 juta). Sindikat kejahatan mengakalinya dengan teknik smurfing di bawah batas tersebut. Crypto-Sentinel menggabungkan Rule Engine 15 sub-indikator APU-PPT dengan Graph Neural Network (GNN) yang mampu memetakan relasi tersembunyi antar-rekening dan anomali perilaku dalam hitungan milidetik."*

---

## 10. Dashboard Menampilkan Nama Nasabah — Salah atau Benar?

### Jawabannya: TIDAK SALAH — Asal Dipahami Konteksnya

Dashboard Crypto-Sentinel menampilkan nama nasabah untuk **Compliance Officer bank** — karyawan bank yang secara hukum dan jabatan **berhak melihat data nasabah** untuk keperluan investigasi. Ini persis seperti sistem monitoring internal yang sudah ada di setiap bank.

### Dua Syarat Wajib agar Legal:

| Syarat | Penjelasan |
|---|---|
| **On-Premise** | Dashboard berjalan di server **milik bank**. Developer Crypto-Sentinel di luar **TIDAK bisa** melihat data nasabah. |
| **Akses Terbatas** | Hanya login Compliance Officer yang berwenang, bukan semua karyawan. |

### Analogi Tepat:
> *"Detektif di kepolisian punya akses ke data tersangka untuk menginvestigasi — itu sah karena jabatan dan wewenangnya. Compliance Officer BPR juga punya hak akses yang sama terhadap data nasabah yang perlu diinvestigasi, selama dilakukan di dalam sistem bank."*

### Cara Menjelaskan ke Bank / Juri:
> *"Dashboard kami berjalan di infrastruktur server bank. Data nasabah hanya terlihat oleh Compliance Officer yang berwenang. Kami sebagai developer di luar tidak memiliki akses ke data nasabah tersebut sama sekali."*

---

## 11. Configurable Decision Engine: Auto-Block vs Notifikasi vs Keduanya

### Pertanyaan: Apakah Sistem yang Auto-Blokir Lebih Baik dari yang Hanya Kirim Notifikasi?

**Ya, lebih kuat — dan Crypto-Sentinel punya KEDUANYA sekaligus.**

### Perbandingan Dua Mode:

| Aspek | ⚠️ AI Hanya Notifikasi | ✅ AI Auto-Blokir (Crypto-Sentinel) |
|---|---|---|
| **Kecepatan respons** | Lambat — tunggu manusia | <18ms — langsung |
| **Efektivitas** | Fraud bisa sudah terjadi | Fraud **tidak pernah terjadi** |
| **Nilai bagi bank** | Informatif tapi reaktif | Preventif — jauh lebih bernilai |
| **Risiko false positive** | Hampir nol | Ada — tapi threshold bisa dikonfigurasi |

### Kunci Utama: BANK yang Memilih Level Otonomi AI-nya

```
API Crypto-Sentinel mengembalikan rekomendasi:
{
  "decision": "BLOCKED",
  "risk_score": 0.94,
  "reason": "smurfing_detected"
}

APLIKASI BANK yang kemudian memutuskan tindakannya:
→ if decision == "BLOCKED": reject_transaction()      ← Auto-block
→ if decision == "BLOCKED": send_alert_to_officer()   ← Hanya notifikasi
→ if decision == "BLOCKED": hold_pending_review()     ← Semi-autonomous
```

Kita tidak memaksa keputusan ke bank — kita **merekomendasikan dengan cepat dan akurat**. Bank yang memilih seberapa besar otonomi yang diberikan ke AI.

### Dua Lapis Perlindungan Crypto-Sentinel:

```
┌─────────────────────────────────────────────────────────────┐
│  CRYPTO-SENTINEL — DUA LAPIS PERLINDUNGAN                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  LAYER 1: MOBILE BANKING (Pre-Authorization)               │
│  Flutter App → CS API (<18ms) → APPROVED/PENDING/BLOCKED   │
│  ✅ Auto-block SEBELUM transaksi terjadi                    │
│  ✅ Cocok untuk bank yang punya mobile banking              │
│                                                             │
│  LAYER 2: BPR TELLER MONITORING (Post-Transaction)         │
│  CBS Teller → Core Banking → Log → CS Alert Dashboard       │
│  ✅ Notifikasi & draft LTKM untuk Compliance Officer        │
│  ✅ Cocok untuk Bank Kuningan (teller-based)                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Ini Standar Industri Global — Bukan Hal Baru!

| Sistem | Mode Keputusan |
|---|---|
| **Visa/Mastercard 3D Secure** | Auto-decline sebelum merchant di-charge |
| **GoPay / OVO / DANA** | Fraud engine analisis dulu → baru kirim ke bank mitra |
| **Mobile Banking BCA/Mandiri** | Fraud engine internal validasi sebelum ke Core Banking |
| **Crypto-Sentinel Mobile** | Sama persis — Flutter App → CS API (<18ms) → BARU ke Core Banking |

### Kalimat Kunci untuk Juri (Hafal Ini!):
> *"Sistem kami menggunakan arsitektur Configurable Decision Engine. Bank bisa memilih berapa besar otonomi yang diberikan ke AI — dari mode full-monitoring (hanya notifikasi), semi-autonomous (tahan transaksi sambil tunggu approval officer), hingga mode full-autonomous (auto-block langsung di bawah 18ms). Ini memberikan fleksibilitas bagi setiap bank sesuai selera risiko mereka — persis seperti yang sudah dilakukan VISA dan Mastercard selama puluhan tahun."*

---

## 12. Strategi Kompetisi: Mengumpulkan 1000+ PIDI Points Menuju Final

```
TARGET POIN CRYPTO-SENTINEL:
┌──────────────────────────────────────────────────────────┬───────────┐
│ Komponen Aktivitas                                       │ Target    │
├──────────────────────────────────────────────────────────┼───────────┤
│ Functional Prototype L3 (Live API + Dashboard + App)     │ +150 Poin │
│ Pitch Deck Submission (14 Slide Sesuai Guideline)        │ +300 Poin │
│ Kehadiran & Kemajuan Mentoring 4 Pekan                   │ +400 Poin │
│ Partisipasi Webinar Tematik #1, #2, #3 + Kuis            │ +150 Poin │
│ Business Matching L5 (LoI Pilot Project Bank Kuningan)   │ +150 Poin │
│ Validasi Pengguna (User Testing Direktur Kepatuhan)      │ +200 Poin │
├──────────────────────────────────────────────────────────┼───────────┤
│ TOTAL AKUMULASI POTENSIAL                                │ 1.350 Poin│
└──────────────────────────────────────────────────────────┴───────────┘
```

---

## 13. Bank Pertanyaan & Jawaban Cerdas untuk Sesi Q&A Juri

### Q1: *"Apakah data nasabah bank aman saat dianalisis oleh Crypto-Sentinel?"*
> **Jawaban:**
> *"Sangat aman. Sistem kami di-deploy secara on-premise di dalam jaringan lokal bank. Data identitas sensitif (PII seperti NIK, Password, No HP) tidak pernah disentuh atau diekspor keluar. Kami hanya memproses metadata transaksi numerik sesuai kaidah UU Perlindungan Data Pribadi (UU No. 27/2022)."*

### Q2: *"Kenapa memilih BPR Bank Kuningan daripada bank umum besar?"*
> **Jawaban:**
> *"Bank umum besar sudah memiliki anggaran untuk membeli software global. Sebaliknya, 1.600+ BPR di Indonesia saat ini diwajibkan oleh POJK No. 12/2024 untuk memiliki sistem anti-fraud, namun tidak memiliki solusi yang terjangkau. Memulai pilot di Bank Kuningan membuktikan dampak nyata solusi kami di akar rumput perbankan daerah sebelum kami ekspansi ke skala nasional."*

### Q3: *"Apa bedanya sistem ini dengan rule-based engine bawaan Core Banking?"*
> **Jawaban:**
> *"Core banking konvensional hanya memiliki rule kaku berbasis ambang batas statis (misal: lapor jika transaksi > 100 juta). Sindikat kejahatan mengakalinya dengan teknik smurfing di bawah batas tersebut. Crypto-Sentinel menggabungkan Rule Engine 15 sub-indikator APU-PPT dengan Graph Neural Network (GNN) yang mampu memetakan relasi tersembunyi antar-rekening dan anomali perilaku dalam hitungan milidetik."*

### Q4: *"Dashboard kamu menampilkan nama nasabah — bukankah itu melanggar privasi?"*
> **Jawaban:**
> *"Tidak melanggar. Dashboard kami berjalan secara on-premise di dalam server milik bank, bukan di cloud kami. Yang melihat data nasabah hanya Compliance Officer bank yang secara jabatan memiliki hak akses tersebut — sama seperti sistem internal bank yang sudah ada. Kami sebagai developer di luar tidak memiliki akses ke data nasabah tersebut."*

### Q5: *"Apakah AI kamu yang memutuskan blokir transaksi? Apakah bank kehilangan kontrol?"*
> **Jawaban:**
> *"Bank tidak kehilangan kontrol sama sekali. API kami mengembalikan rekomendasi dengan risk score dan alasannya. Aplikasi bank yang memutuskan apakah mau mengikuti rekomendasi — dalam mode auto-block untuk digital banking, atau mode notifikasi manual untuk BPR. Ini sama persis dengan cara kerja Visa dan Mastercard: mereka memberi skor risiko, tapi bank penerbit yang memutuskan akhirnya."*

### Q6: *"Bagaimana jika AI salah blokir transaksi sah (false positive)? Nasabah komplain ke bank?"*
> **Jawaban:**
> *"Ini kenapa kami merancang sistem dengan threshold yang bisa dikonfigurasi. Di tahap pilot BPR, kami menggunakan mode notifikasi (bukan auto-block) agar officer tetap punya kontrol penuh. Auto-block hanya diaktifkan di kanal digital seperti mobile banking, di mana false positive bisa langsung di-override oleh nasabah melalui verifikasi tambahan — sama seperti sistem OTP yang sudah familiar."*

### Q7: *"Bagaimana sistem membedakan rekening mule dengan penerima bansos atau tukang WiFi yang polanya mirip?"*
> **Jawaban:**
> *"Kunci perbedaannya bukan pada siapa yang mengirim, tapi pada apa yang terjadi dengan uang setelah diterima. Rekening mule selalu 'drain-to-zero' — dikuras habis ke satu tujuan dalam hitungan jam. Sebaliknya, WiFi provider menyalurkan uangnya ke PLN, gaji karyawan, dan operasional beragam. Penerima bansos menggunakannya untuk belanja kebutuhan sehari-hari secara bertahap. Sistem kami menganalisis outflow pattern, bukan hanya inflow pattern. Selain itu, kami menerapkan empat lapis konteks: whitelist institusi, ISO 20022 purpose code, timing pattern bulanan, dan perilaku pengeluaran rekening penerima."*

### Q8: *"Bagaimana sistem menangani penerima bansos yang akunnya dormant lalu tiba-tiba aktif?"*
> **Jawaban:**
> *"Sistem kami menggunakan mekanisme whitelist untuk institusi pemerintah. Jika pengirim adalah rekening Kemensos atau BNPB yang terdaftar, skor risiko otomatis dikurangi dan aturan Dormant Activation tidak dipicu. Yang tetap kami awasi adalah: apakah dana bansos yang masuk langsung dikuras ke rekening asing atau exchange kripto dalam waktu singkat — itu adalah pola fraud bansos yang nyata terjadi di lapangan, bukan penerima yang sah."*

### Q9: *"Bedanya Kliring (SKNBI) dan BI-FAST apa? Dan Virtual Account masuk kategori mana?"*
> **Jawaban:**
> *"Kliring atau SKNBI adalah sistem batch — transaksi dikumpulkan dulu, dikirim bersama beberapa kali sehari di jam kerja, mirip angkutan umum dengan jadwal tetap. BI-FAST adalah sistem real-time — uang sampai dalam kurang dari 25 detik, 24 jam 7 hari, seperti ojek online yang langsung berangkat. Virtual Account bukan jaringan transfer — ia hanya nomor identifikasi unik untuk tujuan pembayaran, seperti alamat rumah. Untuk mengirim ke Virtual Account, bisa pakai BI-FAST atau SKNBI tergantung pilihan bank. Bank Kuningan sebagai BPR tidak bisa langsung pakai BI-FAST atau SKNBI — harus lewat bank mitra bjb yang kemudian melakukan transfer ke jaringan nasional."*

### Q10: *"Federated Learning sudah berjalan? Seberapa efektif dibanding pendekatan single-bank?"*
> **Jawaban:**
> *"Federated Learning adalah roadmap Fase 2 kami. Di Fase 1 — pilot Bank Kuningan — kami sudah memiliki empat lapis deteksi kuat: threat intelligence blacklist, drain-to-zero behavior analysis, whitelist institusi, dan timing pattern recognition. Ini cukup efektif untuk mendeteksi mule internal BPR. Federated Learning kami rencanakan bersama bjb di Fase 2, di mana sinyal fraud lintas bank dibagikan tanpa ada data nasabah yang keluar dari server masing-masing bank — sepenuhnya compliant UU PDP No.27/2022. Dengan FL, jika 200 bank mendeteksi rekening yang sama suspicious dalam 2 jam, Bank Kuningan otomatis mendapat peringatan sebelum nasabahnya sempat transfer ke rekening tersebut."*

### Q11: *"Sebenarnya sistem ini lebih cocok di bjb daripada Bank Kuningan, bukan?"*
> **Jawaban:**
> *"Secara teknis memang benar — bjb memiliki BI-FAST langsung, mobile banking, dan volume transaksi yang lebih tinggi, sehingga fitur auto-block real-time dan GNN bekerja lebih optimal. Namun kami memilih Bank Kuningan secara strategis karena dua alasan. Pertama, 1.600+ BPR di Indonesia adalah pasar yang underserved — mereka diwajibkan POJK No.12/2024 untuk punya sistem anti-fraud tapi tidak mampu beli solusi global seharga jutaan dolar. Kedua, ada satu fakta menarik: jika bjb mengadopsi Crypto-Sentinel, mereka otomatis memantau semua transaksi dari BPR mitra mereka — termasuk Bank Kuningan — karena Bank Kuningan menggunakan bjb sebagai bank koresponden. Jadi Bank Kuningan adalah pintu masuk ke pasar BPR, dan bjb adalah jembatan menuju perlindungan sistemik seluruh ekosistem perbankan daerah."*

---

## 14. Deteksi Rekening Mule & Analisis False Positive (Bansos, WiFi, Deadline)

### Pola Rekening Mule yang Dideteksi AI

Rekening mule = pos penampung sementara sindikat kejahatan sebelum uang diteruskan ke tujuan akhir.

```
[Banyak pengirim berbeda]
Andi, Budi, Cici, Dedi, Eni
         ↓↓↓↓↓
   [REKENING MULE]  ──►  [1 Tujuan]  ──►  Exchange Kripto
    Bank Kuningan
```

**Lima sinyal mule yang dikombinasikan AI:**

| Sinyal | Deskripsi | Skor |
|---|---|---|
| **Fan-in Pattern** | ≥5 pengirim unik dalam 1 jam | +40 |
| **Drain-to-Zero** | Saldo dikuras >90% dalam <1 jam setelah terima | +35 |
| **Dormant Activation** | Akun idle >30 hari, tiba-tiba sangat aktif | +30 |
| **Rapid Cycling** | Uang masuk → keluar dalam <10 menit | +45 |
| **Threat Intel Match** | Rekening tujuan ada di blacklist PPATK/OJK | +100 |

> Empat sinyal teratas bersamaan → skor ≥150 → **BLOCK + draft LTKM otomatis**

---

### Kenapa Rule Naif "Banyak Kirim ke 1 Rekening = Mule" Salah

Banyak kasus legitim yang polanya SAMA dengan mule:

| Kasus | Kenapa Bukan Mule |
|---|---|
| Deadline SPP sekolah | Rutin tanggal tetap, tujuan = institusi pendidikan |
| Iuran koperasi/arisan | Nominal tetap, komunitas terikat |
| Tukang WiFi/ISP kecil | Outflow ke PLN, gaji — bukan ke exchange kripto |
| Penerima bansos | Pengirim = instansi pemerintah (diwhitelist) |
| Agen pembayaran | Pass-through ke merchant resmi (PLN, BPJS) |

**Cara AI membedakannya — 4 Lapis Konteks:**

1. **Whitelist Institusi** → PLN, BPJS, Kemensos, Sekolah Negeri: skor -30, bypass rule
2. **ISO 20022 Purpose Code** → EDUC, HLTH, GOVT, SALA: threshold berbeda
3. **Timing Pattern** → Deadline bulanan = lonjakan periodik terprediksi ≠ smurfing acak
4. **Destination Behavior** → Mule drain-to-zero ke 1 tujuan; legit outflow beragam

---

### Tiga Skenario Bansos

| Skenario | Pola | Keputusan Sistem |
|---|---|---|
| **Penyaluran legit** | Pemerintah → penerima, pengirim diwhitelist | ALLOW (whitelist override Dormant Rule) |
| **Fraud bansos** | Terima dari pemerintah → drain ke exchange dalam 30 menit | REVIEW/BLOCK |
| **Agen bansos** | Terima lump sum → distribusikan ke banyak penerima | Butuh whitelist agen resmi Kemensos |

---

### Hierarki Efektivitas Deteksi

| Level | Metode | Efektivitas | Tersedia |
|---|---|---|---|
| 1 | Whitelist + Purpose Code | ⭐⭐⭐ | ✅ Fase 1 |
| 2 | Timing Pattern Analysis | ⭐⭐ | ✅ Fase 1 |
| 3 | Destination Behavior / Drain-to-Zero | ⭐⭐⭐⭐ | ✅ Fase 1 |
| 4 | Threat Intelligence Blacklist | ⭐⭐⭐⭐ | ✅ Fase 1 |
| 5 | Multi-bank Destination Velocity | ⭐⭐⭐⭐ | 🔵 Fase 2 |
| **6** | **Federated Learning Full** | **⭐⭐⭐⭐⭐** | **🔵 Fase 2** |

> **Insight**: Fase 1 cukup kuat untuk mule internal BPR. Federated Learning dibutuhkan untuk sindikat yang beroperasi terkoordinasi lintas banyak bank sekaligus.

---

### Alur Lengkap Pembayaran Bank Kuningan

```
NASABAH BANK KUNINGAN
         ↓ (teller input di SIBAKU)
   Rekening Giro Bank Kuningan di bjb
   (Bank Kuningan simpan uang di bjb sebagai bank koresponden)
         ↓ (instruksi transfer)
   bjb sebagai Bank Perantara
         ├── ke bank lain via BI-FAST (real-time <25 detik, 24/7)
         └── ke bank lain via SKNBI/Kliring (batch, jam kerja)
```

**Titik Kritis — Jendela Pencegahan:**
> Setelah instruksi dari SIBAKU dikirim ke bjb dan bjb teruskan via BI-FAST — uang sudah irreversible dalam 25 detik. Crypto-Sentinel mendeteksi anomali DI SIBAKU, sebelum instruksi itu sampai ke bjb. Itulah jendela pencegahan kami.

---

*Disimpan di: `docs/panduan_materi_belajar_presentasi.md`*
