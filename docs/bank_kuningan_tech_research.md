# 🏦 Deep Research: Arsitektur Teknis & Operasional Bank Kuningan
## Dokumen Referensi Teknis & Validasi Presentasi Capstone PIDI 2026

---

## 1. Profil & Status Kelembagaan Terkini
- **Nama Resmi:** PT Perseroda Bank Perekonomian Rakyat Kuningan (Transformasi dari Perumda BPR Bank Kuningan per 2024/2026).
- **Status:** Badan Usaha Milik Daerah (BUMD) Pemerintah Kabupaten Kuningan.
- **Regulator Utama:** Otoritas Jasa Keuangan (OJK KR 2 Jawa Barat / KOJK Cirebon) dan Bank Indonesia.
- **Klasifikasi:** Bank Perekonomian Rakyat (BPR) — Lembaga Jasa Keuangan Penyimpan Dana & Penyalur Kredit Mikro/UMKM/Pegawai Daerah.

---

## 2. Arsitektur Teknologi & Kanal Transaksi Aktual

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    EKOSISTEM TRANSAKSI BANK KUNINGAN                    │
│                                                                         │
│  [Nasabah / Debitur / ASN]                                              │
│       │                                                                 │
│       ├── (1) Transaksi Kasir/Teller di Kantor Cabang / Kas             │
│       ├── (2) Petugas Lapangan / Kolektor (Mobile EDC/Collector App)    │
│       └── (3) Transfer Antarbank via Bank Mitra (Apex Bank bjb)         │
│                                                                         │
│                                ↓                                        │
│  [Core Banking System (CBS) & Portal Internal SIBAKU]                   │
│  - Database Nasabah (CIF) & Rekening Tabungan/Deposito/Kredit           │
│  - Ledger Transaksi & Jurnal Finansial                                  │
│                                                                         │
│                                ↓                                        │
│  [Integrasi Eksternal / Pelaporan Regulasi]                             │
│  - OJK APOLO & SLIK (Pelaporan Keuangan & Debitur)                      │
│  - PPATK goAML / GRIPS (Pelaporan LTKM & Transaksi Tunai > 500 Juta)    │
└─────────────────────────────────────────────────────────────────────────┘
```

### Karakteristik Sistem:
1. **Core Banking System (CBS):**
   - Transaksi harian (setoran tunai, penarikan, transfer antar rekening, pencairan kredit, angsuran) dicatat langsung ke dalam database CBS/SIBAKU.
2. **Kanal Transfer Antarbank:**
   - Karena BPR bukan peserta langsung RTGS/BI-FAST, transaksi transfer ke bank umum dilakukan melalui **Apex Bank (bank bjb)** atau mekanisme Virtual Account/Kliring BPD.
3. **Pelaporan Kepatuhan (APU-PPT):**
   - Petugas Kepatuhan (*Compliance Officer*) menyaring transaksi secara berkala untuk membuat **Laporan Transaksi Keuangan Mencurigakan (LTKM)** ke aplikasi **goAML PPATK**.

---

## 3. Titik Rawan Kejahatan Finansial di Tingkat BPR (Fakta Lapangan)

1. **Penyalahgunaan Rekening Pasif (Dormant Account):**
   - Rekening tabungan lama yang saldonya minim tiba-tiba menerima aliran dana berulang dari luar daerah dalam jumlah banyak (indikasi rekening penampung judol / phising).
2. **Pola Pemecahan Transaksi (Smurfing / Structuring):**
   - Pelaku memecah setoran atau transfer di bawah Rp 5.000.000,- beberapa kali dalam satu hari di berbagai unit/kas BPR agar tidak memicu ambang batas laporan tunai PPATK (Rp 500 juta).
3. **Perputaran Cepat (Rapid Turnover / U-Turn Transaction):**
   - Dana masuk dalam jumlah besar, lalu dalam hitungan menit/jam langsung ditarik tunai atau dipindahkan ke rekening lain tanpa sisa saldo mengendap.
4. **Penyimpangan Internal & Kredit Topengan:**
   - Transaksi di jam tidak wajar (*odd-hour*) atau pencairan yang dialirkan ke rekening pihak terafiliasi.

---

## 4. Landasan Hukum & Regulasi: Mengapa Bank Kuningan Membutuhkan FDS?

1. **POJK No. 12 Tahun 2024:**
   - Tentang *Penerapan Strategi Anti Fraud bagi Lembaga Jasa Keuangan*.
   - **Kewajiban:** Seluruh LJK termasuk BPR/BPRS **wajib memiliki 4 pilar anti-fraud** (Pencegahan, Deteksi, Investigasi & Sanksi, Pemantauan & Evaluasi).
   - **Masalah BPR:** BPR tidak memiliki anggaran miliaran rupiah untuk membeli software anti-fraud global seperti SAS, NICE Actimize, atau Feedzai.
2. **UU No. 8 Tahun 2010 & UU No. 27 Tahun 2022 (UU PDP):**
   - Kewajiban Prinsip Mengenali Pengguna Jasa (PMPJ) dan Perlindungan Data Pribadi nasabah.

---

## 5. Solusi Crypto-Sentinel: Desain Non-Intrusive (Plug & Play)

### Cara Kerja Integrasi Tanpa Mengganggu Core Banking:
```
[Database SIBAKU / CBS Bank Kuningan]
            │
            │  (1) Replikasi Read-Only Log Transaksi (via Webhook / CDC / API)
            ▼
┌─────────────────────────────────────────────────────────┐
│              CRYPTO-SENTINEL ENGINE                     │
│                                                         │
│  [15 Rule Engine Sub-Indikator APU-PPT]                 │
│         +                                               │
│  [Graph Neural Network (GNN) Relationship Analyzer]     │
└─────────────────────────────────────────────────────────┘
            │
            │  (2) Real-time Alert & Risk Scoring (<20ms)
            ▼
┌─────────────────────────────────────────────────────────┐
│     DASHBOARD COMPLIANCE OFFICER BANK KUNINGAN          │
│  - Alert Prioritas Tinggi (Merah/Kuning)                 │
│  - Visualisasi Graf Hubungan Rekening Mencurigakan      │
│  - One-Click Generator Draft LTKM Format PPATK          │
└─────────────────────────────────────────────────────────┘
```

### Keunggulan untuk Bank Kuningan:
- ✅ **Nol Modifikasi Core:** Tidak mengubah struktur database atau logika bisnis CBS yang sudah berjalan.
- ✅ **Data Privacy Safe:** Data sensitif PII (NIK, Password, No HP) dapat di-masking / di-hash sebelum dianalisis.
- ✅ **Gratis di Tahap Pilot:** Membantu BPR memenuhi audit OJK (POJK 12/2024) tanpa beban capex.
