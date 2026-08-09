# Crypto-Sentinel 2026 — Rencana Implementasi Final Pitch
*Updated: 10 Agustus 2026 — Berdasarkan `project_progress_report.md` + diskusi tim*

> **Tujuan**: Sistem siap pitch offline 25/26 Agustus + validasi pilot Bank Kuningan & Bu Fatimah (Financial Advisor BRI Kuningan)
> **Deadline**: 25 Agustus 2026 (~15 hari tersisa)
> **Tim**: Tim EXPRESSO S1251 — Rifki · Aam · Desta · Billy

---

## 📌 Status Sistem — Terverifikasi dari `project_progress_report.md`

### Fakta Dataset & Konfigurasi

| Item | Status | Keterangan |
|---|---|---|
| Dataset `paysim_sample.csv` | **50.000 baris** ✅ | Terverifikasi di terminal, bukan 10k |
| `mockData.js` angka lama | **Sudah difix** ✅ | 12.847 → 50.000, blokir 342 → 70 aktual |
| Notebook checkpoint | **Kosong** ⚠️ | Akan dikembangkan dari notebook utama |
| Flutter app | **HP asli via USB** ✅ | Bisa demo langsung di HP |
| Bank Kuningan pilot | **Simulasi** ✅ | Via Expresso API, bukan core banking asli |
| Notebook reproducible | **Ya** ✅ | Harus bisa dijalankan ulang = kredibilitas AI |
| Database `expresso.db` | **111 akun aktif** ✅ | 11 akun inti + 100 dummy prefiks bank asli |
| Tabel `str_drafts` | **Sudah ada** ✅ | Infrastruktur LTKM di DB sudah siap |

### Fitur yang Sudah Selesai Diimplementasi

| Fitur | File | Keterangan |
|---|---|---|
| Auto-detect bank dari prefiks rekening | `transfer_screen.dart` | BCA=8012, BRI=888801, dst ✅ |
| Smurfing detection (≥4 tujuan/1 jam) | `rule_engine.py` | +45 risk score ✅ |
| Script simulator smurfing | `expresso-api/simulate_smurfing.py` | Transaksi 1-3 REVIEW, 4-6 BLOCK ✅ |
| Node type fix (bank=biru, exchange=oranye) | `main.py /demo-graph` | Visualisasi GNN sudah benar ✅ |
| 3 skenario demo terdokumentasi | `project_progress_report.md` | Normal/REVIEW/BLOCK flow ✅ |
| SNAP BI header (HMAC-SHA256) | `expresso-api` | Signature auth sudah jalan ✅ |
| Upstream account freeze saat BLOCK | `main.py` | `is_blocked=True` otomatis ✅ |

---

## 🎯 Jawaban Open Questions (dari Feedback)

### 1. Flutter App → HP Asli via USB ✅
Semua screen demo (ALLOW/REVIEW/BLOCK) harus berfungsi sempurna di HP asli.
Flutter sudah bisa run lokal terhubung laptop.

### 2. Bank Kuningan → Simulasi via Expresso API
Tidak perlu integrasi real — fokus pada **demo skenario realistis** yang meyakinkan juri.
Proposal pilot tetap dibuat sebagai dokumen tertulis untuk Bu Fatimah.

### 3. STR/LTKM untuk Bu Fatimah BRI → Format Dokumen Resmi Hitam-Putih

> [!IMPORTANT]
> Bu Fatimah adalah Financial Advisor BRI — beliau familiar dengan dokumen perbankan resmi.
> STR/LTKM yang ditunjukkan **harus terlihat seperti dokumen bank asli**, bukan UI colorful.

**Format LTKM resmi di lapangan (PPATK goAML):**
- **Warna**: Hitam teks di atas putih/krem — seperti dokumen Word/PDF resmi
- **Kop surat**: Nama bank pelapor, nomor laporan, tanggal
- **Bahasa**: Indonesia formal — "Dengan hormat, bersama ini kami laporkan..."
- **Konten wajib**:
  - Identitas Pelapor (nama bank, kode bank, alamat, NPWP)
  - Identitas Nasabah Terlapor (nama, NIK, nomor rekening, alamat)
  - Rincian Transaksi Mencurigakan (tanggal, nominal, jenis, tujuan)
  - Uraian Kecurigaan (narasi alasan mengapa dicurigai)
  - Tanda tangan & jabatan pejabat bank yang berwenang (Compliance Officer)
- **Footer**: "Laporan ini bersifat RAHASIA sesuai UU No. 8 Tahun 2010 tentang TPPU"

### 4. Notebook Reproducible → Wajib Bisa Dijalankan Ulang
Untuk kredibilitas AI di depan juri teknis & Bu Fatimah, notebook harus:
- Berjalan dari Cell 1 → terakhir tanpa error
- Menampilkan output grafik secara inline (tidak perlu file eksternal)
- Ada `requirements.txt` yang jelas

---

## 📋 Pembagian Tugas Tim EXPRESSO (S1251)

| # | Nama | Role Resmi | Tanggung Jawab Utama Sprint | Beban |
|---|---|---|---|---|
| 1 | **Rifki Firmansyah** | AI Architect, Team Lead & Product Strategy | **AI/ML**: Notebook EDA 14 sel + Rule Engine 3 rule baru. **Lead**: Koordinasi, kemitraan, pitch strategy. *(Backup semua track jika perlu)* | 🔴 Berat |
| 2 | **Aam Setiana** | Frontend & Product Analyst | **Dashboard**: Landing Page redesign total + GNN Visualization redesign | 🟡 Sedang |
| 3 | **Desta Erlangga** | Backend & Integration Developer | **Backend API baru**: `/str/generate` + `/statistics` + `/risk-timeline` + `/mule-network` + STR Generator Python | 🟡 Sedang |
| 4 | **Billy Jonathan** | Cyber Security & Product Strategy | **Flutter**: Mobile 4 screen polish (Transfer → Loading → ALLOW/BLOCK). **Strategy**: Pilot Proposal + Demo Script + Security review | 🟡 Sedang |

> [!NOTE]
> Rifki sering harus backup semua kerjaan tim — ini diakui dan direncanakan. Tujuan sprint ini:
> **Rifki fokus ke AI/ML dan product strategy** yang hanya bisa dilakukan Rifki.
> Aam, Desta, Billy mengerjakan implementasi teknis masing-masing secara paralel agar Rifki tidak harus turun tangan.

---

## 📦 Proposed Changes (Diperbarui)

---

### 🟥 TRACK A — AI & Data Science (Rifki Firmansyah)

> **Hanya Rifki yang bisa mengerjakan ini** — kredibilitas AI dan machine learning adalah inti dari pitch.
> Notebook ini yang akan ditunjukkan ke Bu Fatimah (BRI) dan juri teknis dari BI/OJK.

#### [MODIFY] `crypto-sentinel-api/notebooks/01_explore_paysim.ipynb`

Notebook **reproducible** yang bisa dijalankan ulang dari awal. Akan berisi **14 sel** yang diperluas:

1. **Sel 1** — Setup: install & import library, set random seed
2. **Sel 2** — Load dataset dengan validasi path
3. **Sel 3** — Exploratory Data Analysis: shape, dtypes, missing values, duplicates
4. **Sel 4** — Statistik deskriptif + distribusi kelas fraud/normal (bar + pie chart)
5. **Sel 5** — Distribusi per tipe transaksi (TRANSFER, CASH_OUT, PAYMENT, DEBIT)
6. **Sel 6** — Analisis outlier nominal transaksi (boxplot + IQR analysis)
7. **Sel 7** — Analisis temporal (step/jam distribusi fraud)
8. **Sel 8** — Feature Engineering (amount_ratio, balance_drained, high_risk_type)
9. **Sel 9** — Korelasi fitur — heatmap Pearson dengan anotasi nilai
10. **Sel 10** — Graf Analysis: NetworkX degree distribution + top PageRank nodes (visualized)
11. **Sel 11** — Train/Test split + Random Forest training (class_weight balanced)
12. **Sel 12** — Confusion Matrix Heatmap (Seaborn, warna YlOrRd)
13. **Sel 13** — ROC-AUC Curve + Classification Report + Feature Importance chart
14. **Sel 14** — Kesimpulan akademis + rekomendasi implementasi Bank Kuningan

#### [NEW] `crypto-sentinel-api/notebooks/LTKM_Template_Generator.ipynb`

Notebook terpisah khusus untuk demo STR ke Bu Fatimah:
- Input: transaction ID yang diblokir
- Output: dokumen LTKM dalam format HTML/PDF yang bisa dicetak
- Tampilan: hitam-putih formal, kop surat Bank Kuningan, bahasa Indonesia resmi

#### [NEW] `docs/PILOT_BANK_KUNINGAN_PROPOSAL.md`

Proposal pilot 3 bulan untuk Bank Kuningan:
- Executive summary 1 halaman
- KPI terukur: # fraud dicegah, false positive rate ≤5%, latency ≤20ms
- Estimasi penghematan (ROI)
- Roadmap integrasi teknis bertahap

---

### 🟧 TRACK B — Dashboard Frontend (Aam Setiana)

> Aam sebagai Frontend & Product Analyst — bertanggung jawab penuh atas tampilan Landing Page dan GNN.
> Rifki mungkin akan review hasil akhir dari sisi product, tapi eksekusi kode di tangan Aam.

#### [MODIFY] [LandingPage.jsx](file:///d:/Crypto-Sentinel%202026/dashboard-crypto-sentinel/src/components/LandingPage.jsx)

**Redesign total** — dari halaman "cukup bagus" menjadi "WOW":
- **Hero**: Headline besar + counter animasi "Dana Diselamatkan" yang bertambah real-time
- **Attack flow diagram**: Visualisasi animated: Nasabah → Bank → FDS → 🛡️ BLOCK
- **Stats bar**: 50.000 transaksi | 99.98% akurasi | 18ms latency | 26 BPD target
- **Regulatory strip**: Badge OJK · PPATK · BI · SNAP BI · ISO 20022
- **Live log terminal**: Ticker lebih dramatis dengan warna merah-hijau yang kontras
- **CTA**: Tombol "Masuk Dashboard →" yang pulse animation

#### [MODIFY] [GNNVisualization.jsx](file:///d:/Crypto-Sentinel%202026/dashboard-crypto-sentinel/src/components/GNNVisualization.jsx)

**Redesign panel GNN** agar jelas di layar proyektor & impressive untuk juri:
- **Layout split**: Graf 65% | Info panel 35%
- **Node lebih besar** (size ×1.5), label font lebih besar, kontras tinggi
- **Edge animation**: Partikel bergerak di sepanjang edge menunjukkan aliran dana
- **Highlight path**: Saat BLOCK, seluruh jalur smurfing menyala merah berurutan
- **Risk gauge** di info panel: speedometer animasi untuk risk score
- **Tombol "🔴 Simulasi Smurfing"**: posisi prominent, warna merah, full-width

---

### 🟨 TRACK C — Rule Engine AI (Rifki) + Backend API Baru (Desta Erlangga)

#### 📊 Audit 15 Sub-Indikator Deteksi (dari Blueprint)

> [!IMPORTANT]
> Blueprint menampilkan **15 sub-indikator** dari 4 kelompok sinyal. Audit menunjukkan
> ada **2 indikator belum diimplementasi** dan **3 parsial** — harus dilengkapi agar
> jawaban ke juri BI/OJK konsisten dengan blueprint yang ditampilkan.

| # | Indikator | Kelompok | Status Saat Ini |
|---|---|---|---|
| 1 | Transaction Velocity | Behavioral | 🟡 Parsial — cek destinations ≥4, bukan frekuensi per menit |
| 2 | **Odd-Hour Activity** | Behavioral | 🔴 **Belum ada** |
| 3 | **Dormant Account Activation** | Behavioral | 🔴 **Belum ada** |
| 4 | Anomali Profil | Behavioral | ✅ Dynamic Baseline (5× avg) |
| 5 | Mule Rings (Spider Web) | Relational GNN | 🟡 Parsial — via threat intel saja |
| 6 | Layering / Chain Transactions | Relational GNN | 🟡 Parsial — smurfing detection |
| 7 | Blacklisted Wallet Linkage | Relational GNN | ✅ Threat Intel matching |
| 8 | Purpose vs Destination | Purpose Mismatch | ✅ ISO 20022 purpose_code check |
| 9 | Ledger Mismatch | Purpose Mismatch | ✅ Balance drained check |
| 10 | Impossible Travel | Technical | ✅ Haversine + speed >1000 km/h |
| 11 | Geolocation Anomaly | Technical | ✅ IP address anomaly |
| 12 | Device Integrity (VPN/Emulator) | Technical | 🟡 Parsial — device ID saja, belum VPN flag |

**Gap**: 2 belum → perlu tambah | 3 parsial → perlu perkuat | 6 sudah ✅

---

#### [MODIFY] [rule_engine.py](file:///d:/Crypto-Sentinel%202026/crypto-sentinel-api/app/rule_engine.py)

Tambahkan **3 rule baru** untuk melengkapi 15 sub-indikator blueprint:

1. **Odd-Hour Activity** *(Indikator #2 — Behavioral)*
   ```python
   # Jam transaksi 00:00-04:00 WIB = +25 risk score
   tx_hour = datetime.now().hour
   if 0 <= tx_hour <= 4:
       risk_score += 25
       reasons.append("Odd-Hour Activity: transaksi jam {} WIB (00:00-04:00)".format(tx_hour))
   ```

2. **Dormant Account Activation** *(Indikator #3 — Behavioral)*
   ```python
   # Akun tidak transaksi >30 hari tiba-tiba transfer besar
   if past_transactions:
       last_tx_date = max(past_transactions, key=lambda t: t.get("timestamp", ""))
       days_idle = (now - last_tx_date).days
       if days_idle > 30 and transaction.amount > 5_000_000:
           risk_score += 30
           reasons.append(f"Dormant Account: idle {days_idle} hari, lalu transfer besar")
   ```

3. **Device Integrity VPN/Emulator** *(Indikator #12 — Technical, diperkuat)*
   ```python
   # Detect VPN dari range IP datacenter + emulator dari user-agent
   VPN_RANGES = ["45.154.", "104.28.", "172.64.", "198.41."]
   if any(ip_addr.startswith(r) for r in VPN_RANGES):
       risk_score += 20
       reasons.append("Device Integrity: IP terdeteksi sebagai VPN/Datacenter")
   ```

#### [MODIFY] `crypto-sentinel-api/app/main.py`

Tambahan **4 endpoint baru** untuk demo validasi pilot:

1. **`POST /str/generate`** — Generate draft LTKM otomatis
   - Input: `{ transaction_id, blocked_amount, sender_account, destination }`
   - Output: JSON berisi semua field LTKM siap diisi

2. **`GET /statistics`** *(perbaiki yang sudah ada)* — Return data real dari PaySim

3. **`GET /risk-timeline`** — Distribusi risiko per jam (untuk chart baru di dashboard)

4. **`GET /mule-network/{account_id}`** — Jaringan koneksi rekening mule

#### [NEW] `crypto-sentinel-api/app/str_generator.py`

Modul Python untuk generate LTKM:
- Template PPATK-compliant dalam Bahasa Indonesia formal
- Format: JSON (untuk API) + HTML hitam-putih yang bisa di-print (untuk Bu Fatimah)
- Sesuai format laporan PPATK goAML yang dipakai bank di lapangan

---

### 🟩 TRACK D — Flutter Mobile (Billy Jonathan)

> Billy pegang Flutter M-Banking — filosofi: tampilan end-user harus seperti m-banking bank sungguhan.
> **Tidak ada loading screen artificial. Tidak ada bahasa teknis ke nasabah.**

#### Hasil Analisis Kode Aktual

> [!NOTE]
> **Flutter sudah ~85% enterprise-ready.** Struktur ALLOW/REVIEW/BLOCK sudah benar:
> - ALLOW → `ReceiptScreen` "Transaksi Berhasil!" ✅
> - REVIEW → `ReceiptScreen` isPending=true "Transaksi Diproses!" ✅
> - BLOCK → AlertDialog dengan fallback message banking-standard ✅
>
> Hanya **3 baris spesifik** yang perlu difix di [transfer_screen.dart](file:///d:/Crypto-Sentinel%202026/crypto-sentinel-bank-kng/lib/screens/menus/transfer_screen.dart):

#### [MODIFY] [transfer_screen.dart](file:///d:/Crypto-Sentinel%202026/crypto-sentinel-bank-kng/lib/screens/menus/transfer_screen.dart)

**Fix 1 — Line 211: Loading dialog expose "FDS" ke nasabah**
```diff
- Text('Memproses Transfer & Verifikasi FDS...', style: TextStyle(fontWeight: FontWeight.bold))
+ Text('Memproses transaksi...', style: TextStyle(fontWeight: FontWeight.bold))
```

**Fix 2 — Line 273: BLOCK title terlalu eksplisit & informal**
```diff
- isBlocked ? '⚠️ TRANSAKSI DIBLOKIR' : 'Gagal Transfer'
+ isBlocked ? 'Transaksi Tidak Dapat Diproses' : 'Transfer Tidak Berhasil'
```

**Fix 3 — Line 43: Label internal "(Mule Relay)" tampil ke nasabah**
```diff
- {'name': 'Budi Santoso (Mule Relay)', 'account': '987654', 'bank': 'Bank Kuningan'}
+ {'name': 'Budi Santoso', 'account': '987654', 'bank': 'Bank Kuningan'}
```

> [!IMPORTANT]
> Saat demo ke juri: tunjukkan **dua layar sekaligus**
> - 📱 **HP nasabah**: tampilan generik, tidak ada hint teknis
> - 💻 **Proyektor compliance**: dashboard real-time, GNN menyala, LTKM auto-draft
>
> Ini yang membuat juri BI/OJK/investor langsung paham: sistem **dua lapisan enterprise** seperti GPN/Visa.


---

### 🟦 TRACK E — Pitch Strategy & Pilot Proposal (Billy Jonathan + Rifki)

> Billy lead narasi bisnis & keamanan. Rifki kontribusi dari sisi product strategy dan kemitraan Bank Kuningan.

#### [MODIFY] `docs/NASKAH_DUBBING_DEMO_2MENIT.md` → Diperpanjang menjadi 4 menit

#### [NEW] STR/LTKM Template HTML (hitam-putih, format resmi PPATK)

```
┌─────────────────────────────────────────────────────┐
│              BANK KUNINGAN                          │
│    LAPORAN TRANSAKSI KEUANGAN MENCURIGAKAN          │
│    (Sesuai UU No. 8 Tahun 2010 Pasal 23 - TPPU)   │
├─────────────────────────────────────────────────────┤
│ Nomor Laporan : LTKM-BKG-2026-XXXX                 │
│ Tanggal       : [auto-fill]                         │
│ Pelapor       : Bank Kuningan, NPWP 01.XXX.XXX     │
├─────────────────────────────────────────────────────┤
│ IDENTITAS NASABAH TERLAPOR                          │
│ Nama          : [auto-fill dari transaksi]          │
│ No. Rekening  : [auto-fill]                         │
│ Nominal       : Rp [auto-fill]                      │
├─────────────────────────────────────────────────────┤
│ URAIAN KECURIGAAN                                   │
│ [AI-generated narrative...]                         │
├─────────────────────────────────────────────────────┤
│ Pejabat Pelapor: _________________ (tanda tangan)   │
│ Jabatan: Compliance Officer                         │
│ RAHASIA — UU No.8/2010 TPPU                        │
└─────────────────────────────────────────────────────┘
```

#### [NEW] `docs/PILOT_BANK_KUNINGAN_PROPOSAL.md` — Roadmap Industri

> Bagian ini diambil dari **`project_progress_report.md` Section 6** dan dijadikan konten
> roadmap di Pilot Proposal — sangat impressive untuk investor, BI, dan OJK.

Proposal akan berisi **5 fase pengembangan lanjutan** menuju production-grade:

| Fase | Fitur | Nilai untuk Bank |
|---|---|---|
| **Fase 1** | **Step-Up Authentication** (OTP + Liveness e-KTP) | Eliminasi false positive untuk REVIEW tanpa beban analis |
| **Fase 2** | **Device Fingerprinting SDK** (SHIELD/ThreatMetrix) | Deteksi emulator, root/jailbreak, kloning aplikasi |
| **Fase 3** | **Behavioral Biometrics** (pola ketikan + geseran layar) | Deteksi Account Takeover & social engineering |
| **Fase 4** | **Federated Learning** (UU PDP No.27/2022 compliant) | Berbagi kecerdasan antar bank tanpa berbagi data nasabah |
| **Fase 5** | **Neo4j Graph Database** (pengganti NetworkX in-memory) | Skalabilitas untuk miliaran transaksi saat go-live |

> Framing ke Bank Kuningan: *"Prototype ini sudah berjalan. Dengan pilot 3 bulan, kita validasi
> KPI dan siapkan Fase 1–2 untuk integrasi penuh ke core banking BPD."*

---


## 🗓️ Timeline 15 Hari (10–25 Agustus)

| Hari | Tanggal | Target | PIC |
|---|---|---|---|
| 1-2 | 10-11 Agt | Notebook EDA 14 sel + Rule Engine 3 rule baru | **Rifki** |
| 2-3 | 11-12 Agt | Backend API baru: `/str/generate` + `/statistics` + `/risk-timeline` | **Desta** |
| 3-4 | 12-13 Agt | STR/LTKM HTML template resmi hitam-putih PPATK | **Desta** |
| 4-6 | 13-15 Agt | Landing Page redesign total (hero + stats + regulatory badge) | **Aam** |
| 4-5 | 13-14 Agt | Flutter 4 screen: Transfer → Loading → ALLOW/BLOCK | **Billy** |
| 5-6 | 14-15 Agt | Pilot Proposal Bank Kuningan + Demo Script 3 menit | **Billy + Rifki** |
| 6-8 | 15-17 Agt | GNN Visualization redesign (node besar, partikel, risk gauge) | **Aam** |
| 9-10 | 18-19 Agt | Security review 15 indikator + blueprint alignment | **Billy** |
| 11-12 | 20-21 Agt | End-to-end testing: Flutter → API → Dashboard full flow | **Semua** |
| 13 | 22 Agt | Demo latihan pertama — 3 menit penuh, semua screen | **Semua** |
| 14 | 23 Agt | Dry run kedua + perbaikan minor | **Semua** |
| 15 | 24 Agt | Push GitHub final, backup, packaging | **Rifki** |
| **PITCH** | **25-26 Agt** | **🎯 PITCHING HARI H — Tim EXPRESSO S1251** | **Semua** |

---

## ✅ Verification Plan

### Automated
- `python crypto-sentinel-api/train_model.py` — metrics 99.98% terkonfirmasi
- `curl POST /str/generate` — LTKM ter-generate dengan data lengkap
- `flutter run` — semua 4 screen tampil tanpa error di HP asli

### Manual (Simulasi Pitch Day)
- Demo 3 menit penuh: Transfer Normal → BLOCK → Dashboard Alert → STR Draft
- GNN Visualization jelas terbaca di proyektor dari jarak 3 meter
- Landing page mengesankan di 3 detik pertama
- LTKM terlihat profesional dan bisa dicetak untuk Bu Fatimah

---

## 💬 Poin Diskusi Lanjutan

> [!NOTE]
> Semua open questions sudah terjawab. Ada **2 hal yang perlu diputuskan** sebelum eksekusi:

1. **Nama anggota tim**: Siapa yang pegang role Frontend (Anggota 2), Mobile (Anggota 3), dan Data Science (Anggota 4)? Agar pembagian tugas bisa lebih personal.

2. **Prioritas eksekusi pertama**: Mana yang ingin dikerjakan duluan?
   - 🅰️ **Notebook EDA** (untuk Bu Fatimah & kredibilitas AI)
   - 🅱️ **Landing Page + GNN Redesign** (untuk kesan pertama juri pitch)
   - 🅲️ **STR/LTKM Generator** (untuk validasi pilot Bank Kuningan)
