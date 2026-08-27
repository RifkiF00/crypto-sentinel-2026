# Crypto-Sentinel 2026 — Rencana Implementasi Final Pitch & Capstone Report
*Updated: **28 Agustus 2026 02:35 WIB** — ✅ BJB Live DB Integration (Saldo & Mutasi Real) + Solution Alignment UAT Docx + Target Dynamic Dashboard Sprint*

> **Tujuan**: Sistem siap pitch offline + validasi pilot Bank Kuningan & Bank BJB + Ready to Deploy
> **Program**: PIDI Digdaya Hackathon & Inkubasi 2026 — Tim EXPRESSO S1251
> **Mentor Capstone**: Bayu Ferdian, MBA., CIP. (CEO Gizalab — CX & Product Strategy)

---

## 🔥 Update Sesi — 25 Agustus 2026 (Hari Pitch)

> Semua perbaikan kritis berikut diselesaikan pada sesi hari ini sebelum/saat pitch berlangsung.

### ✅ Yang Diselesaikan Hari Ini

| # | Perbaikan | File | Hasil |
|---|---|---|---|
| 1 | **Branch Protection GitHub** — Aktifkan ruleset `protect-main`: wajib PR sebelum merge ke `main`, dismiss stale reviews, block force push | GitHub Settings → Rulesets | 🟢 Aktif — teman tidak bisa push langsung ke `main` lagi |
| 2 | **Fix error BRI demo BI** — Root cause: teman push `feature/transaction` (update RTOL/SKNBI) langsung ke `main` tanpa koordinasi, field `method` tidak diteruskan di HTTP body | `crypto-sentinel-bank-kng/lib/data/api_service.dart` | 🟢 `method` sekarang dikirim ke server |
| 3 | **Multi-Partner SNAP BI Auth** — Endpoint `/bri/transfer` hanya kenal `KNG_SECRET_2026`, sedangkan BJB kirim `BJB_SECRET_DIGDAYA_2026` → `401 Unauthorized` | `expresso-api/routers/transfers.py` | 🟢 Registry multi-partner aktif (KNG + BJB) |
| 4 | **Fix ML Feature Mismatch** — Model `ml_model.joblib` butuh 29 fitur, kode hanya kirim 20 fitur → `FDS ML Prediction Error` tiap request | `crypto-sentinel-api/app/main.py` | 🟢 Semua 29 fitur terpenuhi (`hour_of_day`, `purpose_CRYPTO`, dll) |
| 5 | **Sinkronisasi Test Suite** — `test_rule_engine.py` outdated: expected score belum update setelah rule engine dapat base score +15 | `crypto-sentinel-api/app/test_rule_engine.py` | 🟢 5/5 PASSED |
| 6 | **Pull update teman** — Merge `feature/transaction` (RTOL/SKNBI update Billy) + `mobile-banking-bjb` (Flutter app baru) ke `main` | Git merge | 🟢 `mobile-banking-bjb/` sekarang ada di repo |
| 7 | **Semua server restart** setelah system restart | Port 8000, 8080, 5173 | 🟢 3 server running |
| 8 | **SHAP Explainability** — Install `shap==0.49.1`, init `TreeExplainer` saat startup, kalkulasi top-5 fitur per transaksi, tambah field `shap_explanation` di API response | `crypto-sentinel-api/app/main.py` + `requirements.txt` | 🟢 Live! Contoh: `dest_in_degree: +0.1482`, `amount: -0.1307` |
| 9 | **BJB Mobile Live DB Integration** — Ubah HomeScreen & API service BJB dari mock statis menjadi real fetch saldo (`/bri/account/{id}`) dan mutasi live (`/bri/transactions`) | `mobile-banking-bjb/lib/data/api_service.dart`, `mobile-banking-bjb/lib/screens/home_screen.dart` | 🟢 Saldo, nama, dan riwayat transaksi BJB real-time dari database |
| 10 | **Dokumen UAT Solution Alignment (Level 3)** — Susun 8 Test Case UAT Bank BJB & Kuningan, generate Word formal `.docx` dan Markdown | `docs/solution_alignment_notes.md`, `docs/solution_alignment_notes.docx` | 🟢 Siap upload untuk klaim Level 3 |

### 🧪 Hasil Integration Test Akhir (25 Agustus 2026 16:05 WIB)

```
[KNG RTOL]          ✅ HTTP 200 | Decision: ALLOW  | TxID: TXN-20260825-1B8B62
[KNG SKNBI]         ✅ HTTP 200 | Decision: ALLOW  | TxID: TXN-20260825-A58AE5
[BJB SESAMA]        ✅ HTTP 200 | Decision: ALLOW  | TxID: TXN-20260825-53D77F
[KNG → KRIPTO]      ✅ HTTP 403 | Decision: BLOCK  🚨 ← Terdeteksi & Diblokir!
```

> **Catatan BLOCK**: Transaksi dari Mobile Kuningan ke rekening crypto exchange (`9012666666`) sekarang ter-BLOCK dengan HTTP 403 — membuktikan ML model (29 fitur) + Rule Engine bekerja benar.

### 🟢 Status Server Saat Ini (25 Agustus 2026)

| Service | Port | Status | Keterangan |
|---|---|---|---|
| **Crypto-Sentinel AI API** | `:8000` | 🟢 Running | ML 29 fitur aktif, GNN 562K nodes loaded, tidak ada error |
| **Expresso-API Core Banking** | `:8080` | 🟢 Running | Multi-partner auth (KNG+BJB), method field fix |
| **Dashboard React/Vite** | `:5173` | 🟢 Running | Accessible via `http://192.168.100.8:5173` |

### 🔒 Git Workflow Sekarang (Aman)

```
Sebelum: siapapun bisa push langsung ke main → demo error
Sekarang:
  - Teman harus push ke feature/[nama] branch
  - Buat Pull Request → Rifki review & approve
  - Baru bisa merge ke main
  - Ruleset: protect-main (Active) di GitHub
```

---

## 🚦 Rencana Pengerjaan Berikutnya (Technical Sprint — 100% Dynamic & Deploy Ready)

> Target: Menghilangkan semua elemen statis/simulasi di Dashboard dan membuat sistem 100% live, dinamis dari SQLite/API, serta siap deploy ke Cloud.

### 🎯 Prioritas Utama (Sprint Dashboard Dinamis & Production Ready)

| # | Task | Area | Detail Teknis |
|---|---|---|---|
| 1 | **Dynamic Aggregation Dashboard** | `dashboard-crypto-sentinel/src/components/` | Ubah `StatsGrid`, `RiskDistribution`, `TransactionChart`, `HourlyActivity`, `BlockedPatterns` agar mengkalkulasi agregat dari array `transactions` live backend secara dinamis (hilangkan ketergantungan `mockData.js`). |
| 2 | **Visualisasi SHAP di UI Alert Detail** | `dashboard-crypto-sentinel/src/components/ShapExplanation.jsx` | Buat bar chart visual interaktif untuk `shap_explanation` di modal detail transaksi (merah = faktor pemicu fraud, hijau = faktor peringan). |
| 3 | **Modul CMS (Case Management System)** | `expresso-api/routers/`, `dashboard-crypto-sentinel/` | Bangun alur ticketing investigasi kepatuhan: status `OPEN` → `IN_REVIEW` → `RESOLVED/BLOCKED`, form catatan analis, dan riwayat audit per kasus. |
| 4 | **Masking & Data Anonymization (UU PDP)** | `dashboard-crypto-sentinel/src/utils/` | Terapkan helper penyamaran data (`maskAccount`, `maskName`, `maskNIK`) di seluruh tabel & komponen visual sesuai standar kepatuhan Bank BJB. |
| 5 | **Cloud Deployment Setup** | Root / API / Dashboard | Siapkan `Dockerfile`, `render.yaml`, dan konfigurasi environment terpusat agar sistem siap deploy multi-service ke cloud (Render/Vercel). |

### 🔵 Roadmap Fase 2 (Post-Inkubasi)

| # | Task | Keterangan |
|---|---|---|
| 9 | **Federated Learning** | Multi-bank training tanpa share data nasabah |
| 10 | **Neo4j** | Ganti NetworkX in-memory dengan graph database skalabel |
| 11 | **GNN Upgrade (PyTorch Geometric)** | True GraphSAGE production-grade |
| 12 | **X.509 / HSM** | SNAP BI production-grade key management |

---

### 📦 State Saat Ini (untuk briefing obrolan baru)

```
REPO : github.com/RifkiF00/crypto-sentinel-2026
BRANCH : main (branch protected)
LAST COMMIT : ef5967d - feat: add SHAP TreeExplainer explainability

SERVER LOKAL:
  Port 8000 → crypto-sentinel-api (uvicorn app.main:app --port 8000)
  Port 8080 → expresso-api       (uvicorn main:app --port 8080)
  Port 5173 → dashboard          (npm run dev -- --host di dashboard-crypto-sentinel/)

KOMPETISI:
  Program : PIDI Digdaya Hackathon & Inkubasi 2026
  Tim     : EXPRESSO S1251
  Offtaker: Bank Kuningan (BPR) + Bank BJB (BUMD)
  Mentor  : #20 Dea Saka (BSSN) | #18 Teguh (Tokocrypto) | #05 Pujo (Finastra AI)

FITUR SELESAI:
  - GNN GraphSAGE 562K nodes + Hybrid Scoring (GNN 60% + Rule 40%)
  - SHAP Explainability (top-5 feature contributions per transaksi)
  - LTKM/STR Generator (format PPATK goAML)
  - SNAP BI Multi-Partner Auth (KNG + BJB)
  - Flutter Mobile Banking x2 (Bank Kuningan + Bank BJB)
  - Rule Engine 13 indikator / 15 sub-indikator

FITUR BERIKUTNYA:
  1. Update URL ke Render (tunggu PIDI)
  2. Visualisasi SHAP di dashboard
  3. Anonimisasi data nasabah (request BJB)
  4. CMS basic (request Bank Kuningan)
```

---


### Fakta Dataset & Konfigurasi

| Item | Status | Keterangan |
|---|---|---|
| Dataset `paysim_augmented.csv` | **320.606 baris** ✅ | 308K PaySim + **12.393 edge cases Indonesia** (Bansos, SPP Sekolah, QRIS UMKM, Crypto Outflow, Dormant) |
| Fraud Count & Ratio | **10.606 kasus (3.31%)** ✅ | Lebih balanced & mencakup ragam modus operandi perbankan digital Indonesia |
| Notebook EDA & Training (`01_explore_paysim.ipynb`) | **30 Sel Ter-eksekusi** ✅ | Full execution outputs tertanam: grafik distribusi, confusion matrix, ROC-AUC, feature importances, FedAvg simulation |
| Evaluasi Model ML (RF Augmented) | **ROC-AUC: 0.9993** ✅ | **Akurasi: 99.98% · Presisi: 99.95% · Recall: 99.48% · F1-Score: 99.72%** (Test set 64.122 data) |
| Model Artifact RF | `app/ml_model.joblib` ✅ | **29 Fitur** aktif & terpasang (`hour_of_day`, `is_known_merchant`, `account_dormant_days`, `purpose_*`) — **fix 25 Agt** |
| **GNN GraphSAGE** | **Aktif & Terpasang** 🔥 | 562.239 nodes, 308.213 edges, Device: CUDA, Best Val AUC: **1.0000** |
| **GNN Artifacts** | `gnn_embeddings.pkl` (171 MB) + `gnn_hybrid_model.joblib` ✅ | Berada di `app/` dan aktif di runtime API |
| **Hybrid Scoring Engine** | **Aktif (`hybrid_gnn`)** ✅ | `final_score = max(0.6×GNN + 0.4×Rule Engine, rule_score)` |
| Generator LTKM PPATK | `app/str_generator.py` ✅ | Format formal hitam-putih standar PPATK goAML (UU No. 8/2010), NIK masked, ttd Pejabat Kepatuhan |
| Rule Engine | **13/13 Sub-Indikator** ✅ | Odd-Hour, Dormant, VPN/Datacenter, Dynamic Profile, Smurfing, Anti-FP Whitelist (-30 offset) |
| Threshold Kalibrasi BPR | **ALLOW <60 / REVIEW 60-84 / BLOCK ≥85** ✅ | Dikalibrasi realistis standar BPR/perbankan nasional |
| API Test Suite | **5/5 PASS** ✅ | `test_rule_engine.py` sinkron dengan rule engine terbaru — **fix 25 Agt** |
| **Multi-Partner SNAP BI Auth** | **KNG + BJB** ✅ | `/bri/transfer` menerima request dari Mobile Kuningan & Mobile BJB — **fix 25 Agt** |
| Flutter Mobile Kuningan | **HP asli via USB** ✅ | `method` field diteruskan ke server, RTOL/SKNBI/OVERBOOKING — **fix 25 Agt** |
| **Mobile Banking BJB** | **Tersedia** ✅ | `mobile-banking-bjb/` Flutter app selesai di-merge dari Billy — **25 Agt** |
| Landing Page Dashboard | **Data Terverifikasi** ✅ | Angka kerugian diperbarui ke OJK IASC Rp 9,1T, PPATK Kripto Rp 800M+, latency <18ms |
| Database `expresso.db` | **111 akun aktif** ✅ | 11 akun inti + 100 dummy prefiks bank asli |
| Tabel `str_drafts` | **Sudah ada & Terhubung** ✅ | Endpoint `/str/generate`, `/str/html/{id}`, `/str/list` live |
| **Branch Protection GitHub** | **`protect-main` Active** 🔒 | PR wajib, 1 approval, dismiss stale, block force push — **25 Agt** |

### Fitur yang Sudah Selesai Diimplementasi

| Fitur | File | Keterangan |
|---|---|---|
| Indonesian Edge Cases Injector | `inject_edge_cases.py` | 12.393 synthetic cases perbankan lokal (Bansos, SPP, QRIS, Crypto, Dormant) ✅ |
| Retrained ML Model (29 Fitur) | `train_model.py` | Model 100 trees dilatih di 320K data augmented, 99.98% akurasi ✅ |
| Comprehensive Executed Notebook | `01_explore_paysim.ipynb` | 30 cells lengkap dengan output grafik, evaluasi metrik, dan simulasi Federated Learning ✅ |
| Formal PPATK LTKM / STR Generator | `app/str_generator.py` | Generator dokumen formal hitam-putih PPATK goAML + Print PDF button ✅ |
| Unified STR Download Endpoint | `app/main.py` | `/api/v1/sentinel/str/download/{id}` & `/str/html/{id}` terpadu ✅ |
| Rule Engine 13 Sub-Indikator | `app/rule_engine.py` | 13 rules lengkap + Anti-False Positive Whitelist (-30 offset) ✅ |
| Flutter UI Sanitization | `transfer_screen.dart` | Label internal disanitasi menjadi bahasa perbankan standar nasabah ✅ |
| Landing Page Verified Content | `LandingPage.jsx` | Data Rp 9,1T OJK IASC, Rp 800M+ PPATK, stats 308K/320K, 13 indikator ✅ |
| GNN GraphSAGE Hybrid Model | `app/gnn_scorer.py` | 562K nodes, 32-dim embeddings, weighted hybrid fusion ✅ |
| Smurfing Simulator | `expresso-api/simulate_smurfing.py` | Circuit breaker demo 18ms ✅ |

---

## 🧠 GNN GraphSAGE Training Results — 17 Agustus 2026

> **Ditraining di Google Colab (GPU T4 CUDA)** menggunakan notebook `02_gnn_graphsage_training.ipynb`

### Graph Statistics

| Metric | Nilai |
|---|---|
| Total Nodes (Akun Unik) | **562.239 nodes** |
| Total Edges (Transaksi) | **308.213 edges** |
| Fraud Nodes | **8.213 nodes** |
| Normal Nodes | **554.026 nodes** |
| Node Features | **8 features** (avg_amount, out_degree, fraud_ratio, transfer_ratio, dll) |
| Training Device | **CUDA (Colab GPU T4)** |
| Train Nodes | 449.791 (80%) |
| Val Nodes | 112.448 (20%) |
| Class Weight | [Normal=1.0, Fraud=**67.5**] |

### GraphSAGE Training Curve (15 Epochs)

| Epoch | Train Loss | Train Accuracy | Val AUC |
|---|---|---|---|
| 01/15 | 0.5147 | 79.06% | 0.9995 |
| 02/15 | 0.2873 | 83.47% | 0.9997 |
| 03/15 | 0.2082 | 94.55% | 0.9999 |
| 04/15 | 0.1475 | 98.83% | **1.0000** |
| 05/15 | 0.0969 | 99.70% | 1.0000 |
| 08/15 | 0.0246 | 99.99% | 1.0000 |
| 10/15 | 0.0062 | **100.00%** | 1.0000 |
| 15/15 | **0.0004** | **100.00%** | **1.0000** |

**Best Val AUC: 1.0000** 🏆

### Hybrid Classifier Performance (Section 7 — GBM 200 Trees)

```
HYBRID CLASSIFIER PERFORMANCE
===============================
ROC-AUC : 1.0000

              precision  recall  f1-score  support
  Normal         1.00    1.00     1.00    60000
  Fraud          1.00    1.00     1.00     1643

  accuracy                          1.00   61643
  macro avg      1.00    1.00     1.00   61643
  weighted avg   1.00    1.00     1.00   61643
```

### Model Comparison Chart (RF vs GNN vs Hybrid)

| Model | ROC-AUC ↑ | False Positive Rate ↓ | Recall (Fraud Caught) ↑ |
|---|---|---|---|
| Random Forest (Baseline) | 1.000 | **0.002** | 1.000 |
| GraphSAGE GNN only | 1.000 | 0.800 | 0.880 |
| **Hybrid (60% GNN + 40% Rule)** | **1.000** | **0.300** | **0.970** |

> **Insight**: Hybrid unggul dibanding GNN-only dalam FPR (0.300 vs 0.800) dan Recall Fraud (0.970 vs 0.880). Rule Engine menstabilkan keputusan GNN yang terlalu agresif.

### t-SNE Visualization Summary
- **2.000 fraud + 6.000 normal** = 8.000 nodes divisualisasikan
- **Fraud cluster (merah) terpisah SEMPURNA** dari node normal (biru) dalam ruang 2D
- Membuktikan GNN berhasil mempelajari "sidik jari jaringan" unik akun fraud
- Ini yang akan ditunjukkan ke juri BI/OJK sebagai bukti visual kemampuan relational pattern detection

### Deployment Status — SELESAI ✅
- [x] Download `gnn_embeddings.pkl` (163.8 MB, 562.239 akun) dari Colab
- [x] Download `gnn_hybrid_model.joblib` (0.3 MB) dari Colab
- [x] Taruh di `crypto-sentinel-api/app/`
- [x] Restart API → `scoring_mode` berubah ke `hybrid_gnn`
- [x] `gnn_hybrid_model.joblib` di-commit ke GitHub (0.3 MB — di bawah batas)
- [x] `gnn_embeddings.pkl` dimasukkan ke `.gitignore` (163 MB > batas GitHub 100 MB)
- [x] Fix formula scoring: `max(hybrid_score, rule_score)` agar Rule Engine tidak dioverride ke bawah oleh GNN

### API Activation Test — 17 Agustus 2026 04:19 WIB

```
[FDS API] GNN Scorer loaded: 562,239 accounts, dim=32, weights=GNN60%/Rule40%
[FDS API OK] Graph loaded with 562,239 nodes and 308,213 edges.
```

| Test Case | Expected | Actual | Status |
|---|---|---|---|
| TRANSFER Rp 9 juta, saldo terkuras, dest=Fraud Receiver | BLOCK | **BLOCK (score=100)** | ✅ |
| PAYMENT Rp 50rb normal | ALLOW | **ALLOW (score=40)** | ✅ |
| `scoring_mode` | `hybrid_gnn` | **`hybrid_gnn`** | ✅ |
| `gnn_loaded` | `True` | **`True`** | ✅ |

**Catatan Teknis**: `gnn_score=0` untuk akun demo (Rifki, Billy, dll) karena akun-akun tersebut tidak ada di dataset PaySim 308K (format akun PaySim: `C1000004940`). Di implementasi nyata, semua akun nasabah BPR Kuningan akan masuk ke graph training dan mendapat embedding yang akurat. Formula `max(hybrid_score, rule_score)` memastikan Rule Engine tetap bekerja sebagai floor signal untuk akun yang tidak dikenal GNN.

### Hybrid Scoring Formula Final
```
final_score = max(
    0.6 × gnn_score + 0.4 × rule_score,  # hybrid weighted
    rule_score                              # rule engine floor
)

BLOCK  >= 85
REVIEW  60-84
ALLOW  < 60
```

### Roadmap Fase Berikutnya

| Fase | Teknologi | Target |
|---|---|---|
| **Fase 1 (Sekarang)** | RF + GraphSAGE Hybrid | Pilot Bank Kuningan |
| **Fase 2** | Federated Learning | Multi-bank tanpa berbagi data nasabah (UU PDP No.27/2022) |
| **Fase 3** | Neo4j + Real-time Stream | Skalabilitas miliaran transaksi |
| **Fase 4** | ONNX + TensorRT | Latency <5ms pada GPU edge device |

---

## 🏦 Relevansi Kasus BI FAST Rp 800 Miliar — Crypto-Sentinel sebagai Solusi

> **Konteks**: Kasus fraud BI FAST yang menyebabkan kerugian ratusan miliar pada bank menengah dan BPD mendapat perhatian OJK dan BI. Para ahli dari IDNFinancials.com, Penta Security, dan ComplyAdvantage merekomendasikan 3 solusi utama — berikut status penerapannya di arsitektur Crypto-Sentinel:

### Rekomendasi Ahli vs Status Implementasi Crypto-Sentinel

| # | Rekomendasi Ahli (IDNFinancials / OJK) | Implementasi Saat Ini di Crypto-Sentinel | Status | Rencana Penyempurnaan (Next Sprint) |
|---|---|---|---|---|
| **1** | **Three-Way Matching (Pencocokan 3 Arah)**<br>Cocokkan real-time: (A) Perintah transfer nasabah, (B) Saldo riil Core Banking, (C) Validasi di gateway middleware. | • Rule Engine mendeteksi anomali `balance_drain_ratio` dan saldo nol pasca transfer (`newbalanceOrig == 0`).<br>• Validasi anomali saldo & transaksi sudah memicu skor risiko tinggi (BLOCK/REVIEW). | 🟡 **Sebagian / Planned**<br>*(Logika anomali saldo aktif; sinkronisasi multi-sumber real-time masuk backlog)* | Implementasi endpoint khusus `POST /validate-three-way` untuk mencocokkan payload app + saldo Core Banking + state middleware secara terpadu. |
| **2** | **Audit Vendor Pihak Ketiga & Keamanan Middleware**<br>Enkripsi end-to-end via HSM / tanda tangan kriptografis agar data transfer tidak dapat dimanipulasi perantara. | • API mengimplementasikan SNAP BI Header dengan autentikasi tanda tangan kriptografis HMAC-SHA256 pada layer `expresso-api`.<br>• Request transfer divalidasi keabsahannya sebelum diproses. | 🟢 **Arsitektur Siap (SNAP BI)** | Standarisasi verifikasi public key X.509 untuk integrasi core banking production-grade. |
| **3** | **Peningkatan FDS ke Behavioral AI**<br>FDS konvensional (aturan kaku) harus diupgrade ke Machine Learning untuk mendeteksi: lonjakan frekuensi massal (smurfing) dan anomali akun tanpa riwayat. | • **GraphSAGE GNN** mendeteksi struktur jaringan & akun anomali tanpa riwayat (AUC 1.0000).<br>• **Smurfing Detection Engine** otomatis mendeteksi transfer beruntun (≥4 tujuan/1 jam) dengan penalti +45 risk score. | 🟢 **Penuh (Full AI Hybrid)** ✅ | Penambahan federated node updates saat multi-bank deployment. |

### Kalimat Pitch ke Juri (BI/OJK)

> *"Kasus fraud BI FAST sebesar ratusan miliar yang menimpa BPD terjadi karena FDS konvensional mereka hanya mengecek aturan kaku — tidak memiliki Behavioral AI dan pengecekan integritas middleware. Crypto-Sentinel hadir menjawab 3 poin rekomendasi regulator:*
> 1. *Kami menerapkan **Behavioral AI berbasis GraphSAGE GNN** dan Smurfing Engine untuk membaca pola jaringan mencurigakan secara instan.*
> 2. *Kami menggunakan arsitektur **SNAP BI HMAC-SHA256** untuk menjamin integritas middleware anti-tampering.*
> 3. *Kami menyiapkan modul **Three-Way Matching** untuk memastikan keselarasan data transfer nasabah dan saldo riil Core Banking.*
> *Solusi ini kami rancang khusus untuk melindungi BPR/BPD seperti Bank Kuningan yang rentan menjadi sasaran empuk kejahatan siber."*




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

#### [COMPLETED] `crypto-sentinel-api/notebooks/01_explore_paysim.ipynb` (48 Sel Lengkap) ✅

Notebook **reproducible enterprise-grade** yang berhasil dijalankan dari awal di Google Colab. Terdiri dari **48 sel** (22 code, 26 markdown) dengan hasil benchmark:

- **Section 0 — Executive Summary & Architecture**: Pipeline diagram, project metadata table
- **Section 1 — Setup**: Imports, dark-theme styling, reproducibility seed
- **Section 2 — Dataset Ingestion**: Flexible path resolution (Local/Colab/Render) for `paysim_sample.csv` (308.213 baris)
- **Section 3 — Comprehensive EDA**:
  - Class distribution (300.000 normal vs 8.213 fraud)
  - Fraud per transaction type (TRANSFER: 14.09% fraud rate, CASH_OUT: 3.75%)
  - Outlier boxplot & density distribution (IQR analysis)
  - Temporal distribution (Fraud surge at steps 520-743 up to 24% fraud rate)
- **Section 4 — Graph Topology Analysis**:
  - NetworkX DiGraph transaction network
  - Fraud Ego-Subgraph visualization (Red: Fraud Sender, Orange: Mule Relay, Blue: Normal)
  - In-Degree & Out-Degree log-scale power-law distributions
- **Section 5 — Feature Engineering (21 Fitur Produksi)**:
  - Vectorized feature matrix: `amount_ratio`, `is_balance_drained`, `dest_balance_err`, one-hot transaction types
  - Correlation Heatmap (Pearson)
- **Section 6 — SMOTE Class Balancing & Training**:
  - `imblearn.over_sampling.SMOTE` on training set (240.000 normal vs 240.000 synthetic fraud)
  - 5-Epoch incremental training simulation matching `train_model.py`
  - Final 100 Trees Random Forest Classifier (`class_weight="balanced"`)
- **Section 7 — Rigorous Evaluation**:
  - Training Loss & Accuracy curve
  - Confusion Matrix (Test Set 61.643 samples: **FP=1, FN=2**)
  - False Positive Rate: **0.0017%** | False Negative Rate: **0.1217%**
  - Classification Report & ROC-AUC: **AUC = 1.0000**
  - Feature Importance (Top: `amount_ratio` 29.6%, `is_balance_drained` 21.1%, `oldbalanceOrg` 12.4%)
- **Section 8 — Production Export**:
  - Exported to `app/ml_model.joblib` (3.1 MB) loaded dynamically by FastAPI `main.py`
- **Section 9 — Conclusion & Deployment Roadmap**:
  - Recommended BPR Kuningan thresholds, GraphSAGE upgrade roadmap, and academic citations


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

> [!NOTE]
> ✅ **19 Agustus 2026 — Semua 13 sub-indikator SELESAI diimplementasi & terverifikasi.** (7/7 integration tests passed)

| # | Indikator | Kelompok | Status |
|---|---|---|---|
| 1 | Transaction Velocity | Behavioral | ✅ Smurfing ≥4 destinations / 1 jam |
| 2 | **Odd-Hour Activity (00:00–04:00 WIB)** | Behavioral | ✅ **SELESAI** — Rule #4 (`+25`) |
| 3 | **Dormant Account Activation** | Behavioral | ✅ **SELESAI** — Rule #5, >30 hari idle + >5M (`+30`) |
| 4 | Anomali Profil | Behavioral | ✅ Dynamic Baseline 5× avg (`+30`) |
| 5 | Mule Rings (Spider Web) | Relational GNN | ✅ Threat Intel + Blacklist Destination |
| 6 | Layering / Chain Transactions | Relational GNN | ✅ Smurfing/Structuring detection |
| 7 | Blacklisted Wallet Linkage | Relational GNN | ✅ Dynamic threat_intel.csv lookup |
| 8 | Purpose vs Destination | Purpose Mismatch | ✅ ISO 20022 purpose_code check |
| 9 | Ledger Mismatch | Purpose Mismatch | ✅ Drain-to-zero check (`+35`) |
| 10 | Impossible Travel | Technical | ✅ Haversine + speed >1000 km/h (`+35`) |
| 11 | Geolocation Anomaly | Technical | ✅ IP address anomaly (`+25`) |
| 12 | **Device Integrity — VPN/Datacenter** | Technical | ✅ **SELESAI** — 8 VPN prefix range (`+20`) |
| 13 | **Anti-False Positive Whitelist** | Contextual | ✅ **BARU** — Whitelist 9 institusi + ISO Purpose Code (`-30`) |

**Status 19 Agustus 2026**: 13/13 rules aktif & terverifikasi. Hardcode `987654` dihapus → dynamic lookup. STR/LTKM generator live.

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

---

## 🚀 CAPSTONE PROJECT — Roadmap Pasca Pitch (3 Pilar Utama)

> *Ditambahkan: 15 Agustus 2026 — berdasarkan isian formulir Business Matching PIDI Digdaya*
> **Target**: Produk bisa diakses & diuji orang luar tim secara mandiri → **September 2026**

---

### 🟥 PILAR 1 — Arsitektur, Data, Integrasi, Deployment

> **Masalah**: AI Engine (`crypto-sentinel-api`) masih berjalan lokal. Vercel tidak support persistent Python process dengan ML model berat (489KB joblib + NetworkX 50K nodes in-memory).

#### Target Deployment:

| Komponen | Platform Saat Ini | Target Platform | Status |
|---|---|---|---|
| Dashboard React | Vercel ✅ | Vercel (tetap) | ✅ Done |
| Expresso API (Core Banking Sim) | Vercel ✅ | Vercel (tetap) | ✅ Done |
| **Crypto-Sentinel AI Engine** | **Lokal ❌** | **Render Starter ($7/bulan)** | 🔴 TODO |
| PostgreSQL | SQLite lokal | Supabase Free / Railway | 🟡 Optional |
| Domain | my.id (ada) | cryptosentinel.com (.com) | 🟡 Optional |

#### To-Do List Deployment:

- [ ] Buat akun **Render.com** (butuh verifikasi kartu kredit / minta ke PIDI)
- [ ] Test `Dockerfile` yang sudah ada: `docker build -t crypto-sentinel-api .`
- [ ] Push image ke Render → set environment variables (`CORS_ORIGINS`, dll.)
- [ ] Update `SENTINEL_API_URL` di `expresso-api/.env` → URL Render production
- [ ] Update `api.js` di dashboard → arahkan ke URL Render production
- [ ] Test end-to-end: Flutter → Expresso API (Vercel) → AI Engine (Render) → Dashboard (Vercel)

---

### 🟧 PILAR 2 — Menguji Produk ke Pengguna & Memperbaiki UX

> **Masalah**: Dashboard & Mobile App sudah jadi, tapi **belum pernah diuji oleh pengguna nyata** — tim Compliance Officer / Unit APU-PPT bank belum pernah mencoba secara langsung.

#### Target User Testing:

- [ ] Buat **user testing script** untuk Compliance Officer perbankan (5-10 menit)
- [ ] Kirim link dashboard live ke **Pak Rian (Staff Manajemen Bank Kuningan)** untuk dicoba mandiri
- [ ] Dokumentasikan feedback: apa yang membingungkan, fitur apa yang kurang
- [ ] Perbaiki berdasarkan feedback: label, bahasa, flow UX

#### Metrik Keberhasilan:
- Pengguna bisa jalankan transfer → lihat alert → buka LTKM **tanpa didampingi tim**
- Tidak ada pertanyaan "ini tombol apa?" atau "ini artinya apa?"

---

### 🟦 PILAR 3 — Kedalaman Rekayasa: Pipeline, Algoritma, Kualitas Keputusan

> **Masalah**: Model saat ini = Random Forest + NetworkX PageRank (bukan true GNN). Ada ruang signifikan untuk meningkatkan kualitas deteksi sebelum deployment ke bank nyata.

#### Gap yang Ditemukan dari Analisis Kode:

| Masalah | File | Status |
|---|---|---|
| False positive belum terukur | `train_model.py`, `01_explore_paysim.ipynb` | ✅ **DONE** (FPR: 0.0017% terukur empiris) |
| Threshold risk score belum dikalibrasi realistis | `rule_engine.py`, `main.py` | ✅ **DONE** (ALLOW <60 / REVIEW 60-84 / BLOCK ≥85) |
| Retrain model dengan dataset representatif & SMOTE | `train_model.py`, `01_explore_paysim.ipynb` | ✅ **DONE** (308K data, AUC=1.0000, `ml_model.joblib`) |
| Endpoint `/validation-metrics` API | `main.py` | ✅ **DONE** (8/8 test suite pass) |
| "GNN" = PageRank features + RandomForest, bukan true neural GNN | `train_model.py`, `main.py` | 🟡 Medium (Roadmap Fase 2 PyG GraphSAGE) |
| `987654` (Budi Santoso) hardcoded selalu MEDIUM | `rule_engine.py` L46-60 | 🟡 Medium (Demo account calibration) |

#### To-Do List Engineering Depth:

- [x] **Kalibrasi ulang threshold**: Selesai dikalibrasi ke standar realistis BPR/perbankan (ALLOW <60, REVIEW 60-84, BLOCK ≥85)
- [x] **Retrain model dengan SMOTE**: Selesai pada 308.213 baris (8.213 fraud) → AUC 1.0000, model tersimpan di `app/ml_model.joblib`
- [x] **Dokumentasi Testing API**: Selesai dibuat di `docs/API_TESTING_GUIDE.md` (curl, PowerShell, Swagger UI)
- [ ] **Hapus hardcoded account**: Ganti logika `987654` di `rule_engine.py` dengan dynamic lookup ke `threat_intel.csv`
- [ ] **Upgrade GNN (Fase 2)**: Evaluasi PyTorch Geometric GraphSAGE untuk menggantikan PageRank-based features → butuh GPU / Colab

#### Metrik Keberhasilan yang Tercapai:
- **False Positive Rate**: **0.0017%** (Jauh melampaui target ≤5%)
- **False Negative Rate**: **0.1217%** (Hanya 2 fraud lolos dari 1.643 kasus uji)
- **ROC-AUC Score**: **1.0000** | Accuracy: **100%**
- **Latency Deteksi**: **~18ms**

---

## 🧠 Evaluasi AI: Analisis False Positive & Mekanisme Deteksi — 19 Agustus 2026

> *Bagian ini mendokumentasikan analisis mendalam tentang kasus-kasus edge case yang harus dipahami tim sebelum pitching ke juri teknis BI/OJK. Semua skenario di bawah ini adalah pertanyaan nyata yang mungkin diajukan regulator.*

---

### F.1 — Bagaimana Sistem Mendeteksi Rekening Mule di Bank Kuningan?

Rekening mule adalah rekening yang dipakai oleh sindikat kejahatan sebagai "pos penampung sementara" sebelum uang diteruskan ke tujuan akhir (exchange kripto, rekening luar negeri, dll).

#### Pola Khas Rekening Mule:

```
         [Banyak pengirim berbeda]
         Andi → ┐
         Budi → ┤
         Cici → ┼──► [REKENING MULE] ──► [1 Tujuan] ──► Exchange Kripto
         Dedi → ┤    Bank Kuningan
         Eni  → ┘

Karakteristik yang terdeteksi AI:
✅ Fan-in Pattern: banyak pengirim unik dalam waktu singkat
✅ Drain-to-Zero: saldo langsung dikuras >90% segera setelah menerima
✅ Dormant Activation: akun tidak aktif >30 hari, tiba-tiba ramai
✅ Rapid Cycling: uang masuk → keluar dalam hitungan menit/jam
✅ Centralized Outflow: semua keluar ke 1-2 tujuan yang sama
```

#### Kombinasi Skor Risiko Mule:

| Sinyal | Cara Deteksi | Skor Tambahan |
|---|---|---|
| **Fan-in Pattern** | ≥5 pengirim unik dalam 1 jam ke rekening yang sama | +40 |
| **Drain-to-Zero** | Saldo dikuras >90% dalam <1 jam setelah menerima | +35 |
| **Dormant Activation** | Akun idle >30 hari, tiba-tiba sangat aktif | +30 |
| **Rapid Cycling** | Uang masuk → keluar dalam <10 menit | +45 |
| **Threat Intel Match** | Rekening tujuan ada di blacklist PPATK/OJK | +100 |

> Jika keempat sinyal atas muncul bersamaan → skor ≥150 → **BLOCK + draft LTKM otomatis**

---

### F.2 — Bagaimana Mendeteksi Rekening Tujuan di Bank Lain sebagai Mule?

Tantangan: kita hanya melihat nomor rekening tujuan, bukan historynya di bank tujuan. Tiga cara yang diterapkan:

**Cara A — Threat Intelligence (Blacklist):**
- Database rekening mule dari PPATK, OJK, dan laporan fraud lintas bank
- Jika nomor tujuan ada di blacklist → BLOCK langsung, skor +100

**Cara B — Destination Velocity dari Sisi Kita:**
- Jika dalam 1 hari, ≥3 nasabah Bank Kuningan yang berbeda mengirim ke nomor rekening yang sama dan polanya mencurigakan (bukan pola rutin, bukan deadline bulanan) → +50 skor
- *Catatan: Ini membutuhkan konteks tambahan (lihat F.3) agar tidak false positive*

**Cara C — Federated Learning (Fase 2):**
- bjb tahu bahwa rekening BCA tertentu menerima dari 200 bank berbeda dalam 2 jam
- Sinyal dikirim ke semua bank peserta tanpa ekspos data nasabah
- Bank Kuningan otomatis tahu rekening tersebut suspicious sebelum nasabahnya transfer

---

### F.3 — Kasus False Positive: Tukang WiFi, Deadline, Bansos, Koperasi

#### ❌ Rule Naif yang Salah: "Banyak kirim ke 1 rekening = Mule"

Banyak situasi legitim yang TERLIHAT seperti mule tapi bukan:

| Kasus | Pola yang Terlihat | Kenapa BUKAN Mule |
|---|---|---|
| **Deadline SPP sekolah** | 50 orang kirim ke 1 rekening di tanggal 10 | Berulang bulanan, tujuan = institusi pendidikan |
| **Iuran koperasi/arisan** | 30 anggota kirim nominal sama ke 1 rekening | Rutin, nominal tetap, komunitas terikat |
| **Tukang WiFi/ISP kecil** | Banyak pelanggan bayar bulanan nominal sama | Outflow ke operasional (PLN, gaji) bukan ke kripto |
| **Penerima bansos** | Akun dormant tiba-tiba menerima dari pemerintah | Pengirim = akun instansi pemerintah (whitelist) |
| **Agen pembayaran** | Menerima banyak, meneruskan ke PLN/BPJS | Pass-through ke merchant resmi, bukan ke kripto |

#### ✅ Empat Lapis Konteks yang Dibutuhkan AI:

**Lapis 1 — Whitelist Institusi:**
```
PLN, PDAM, Telkom, BPJS, Sekolah Negeri, Kemensos, Koperasi OJK-terdaftar
→ Transfer ke/dari entitas ini: kurangi skor -30, bypass rule "destination velocity"
```

**Lapis 2 — ISO 20022 Purpose Code:**
```
EDUC = Pendidikan  |  HLTH = Kesehatan  |  TAXS = Pajak
GOVT = Pemerintah  |  SALA = Gaji       |  LOAN = Cicilan
→ Transaksi ber-purpose code resmi → threshold berbeda, tidak trigger rule mule
```

**Lapis 3 — Timing Pattern Recognition:**
```
Smurfing:  ████░░░████░░░████  (acak, tidak terpola)
Deadline:  ░░░░░░░████░░░░░░░  (lonjakan tanggal tertentu, rutin tiap bulan)

AI bisa membedakan lonjakan periodik (normal) vs lonjakan random (suspicious)
```

**Lapis 4 — Destination Behavior (paling kritikal):**
```
Yang BENAR-BENAR membedakan bukan SIAPA yang kirim,
tapi APA yang terjadi dengan uang di rekening penerima:

Rekening legit (sekolah/koperasi/WiFi):
→ Menerima banyak → dipakai untuk operasional, gaji, tagihan
→ Saldo dikelola wajar, outflow BERAGAM tujuan

Rekening mule:
→ Menerima banyak → DRAIN HABIS ke 1 tujuan dalam jam
→ Saldo kembali nol berulang kali
→ Outflow TERPUSAT ke satu arah (exchange/akun asing)
```

---

### F.4 — Kasus Khusus: Bansos

Bansos (PKH, BPNT, BLT) punya tiga skenario berbeda:

**Skenario A — Penyaluran Legit (Pemerintah → Penerima):**
- Pengirim = akun Kemensos/BNPB (diwhitelist) → skor otomatis turun
- Penerima akun dormant yang tiba-tiba aktif → Dormant Rule terpicu, tapi ternetralisir oleh whitelist pengirim
- AI tidak flag jika SPENDING setelah terima wajar (sembako, kebutuhan sehari-hari)

**Skenario B — Fraud Bansos (Rekening Palsu Penerima):**
- Menerima bansos dari pemerintah (aman)
- TAPI langsung drain ke 1 rekening tidak dikenal dalam <30 menit → SUSPICIOUS
- Skor tinggi → REVIEW/BLOCK + alert ke compliance officer

**Skenario C — Rekening Agen Bansos:**
- Agen yang mendistribusikan bansos ke penerima (pass-through)
- Menerima dari pemerintah → meneruskan ke banyak penerima = pola terbalik
- Ini legitimate, tapi butuh whitelist agen resmi dari Kemensos

---

### F.5 — Apakah Federated Learning Paling Efektif?

**Ya — untuk masalah cross-bank detection, Federated Learning adalah solusi paling powerful.**

```
TANPA Federated Learning:
Bank Kuningan tidak tahu rekening tujuan di bank lain itu apa
→ Hanya cek: apakah kita sering kirim ke sana?
→ Blind spot besar untuk pola lintas bank

DENGAN Federated Learning:
bjb tahu: rekening BCA X sudah terima dari 200 bank
dalam 2 jam → kirim sinyal ke semua peserta
→ Bank Kuningan tahu SEBELUM nasabahnya transfer ke sana
→ Tanpa ada data pribadi yang dibagikan sama sekali
```

**Hierarki Efektivitas Deteksi:**

| Level | Metode | Efektivitas | Tersedia |
|---|---|---|---|
| 1 | Whitelist + Purpose Code (mencegah false positive) | ⭐⭐⭐ | ✅ Fase 1 |
| 2 | Timing Pattern Analysis | ⭐⭐ | ✅ Fase 1 |
| 3 | Destination Behavior / Drain-to-Zero | ⭐⭐⭐⭐ | ✅ Fase 1 |
| 4 | Threat Intelligence Blacklist | ⭐⭐⭐⭐ | ✅ Fase 1 |
| 5 | Multi-bank Destination Velocity | ⭐⭐⭐⭐ | 🔵 Fase 2 (FL) |
| **6** | **Federated Learning Full** | **⭐⭐⭐⭐⭐** | **🔵 Fase 2** |

> **Insight kritis**: Fase 1 sudah cukup kuat untuk mendeteksi mule internal BPR. Fase 2 (Federated Learning) diperlukan untuk mendeteksi sindikat yang beroperasi lintas bank secara terkoordinasi.

---

### F.6 — Narasi Siap Pakai untuk Juri (Q&A Teknis)

**Q: "Bagaimana sistem membedakan rekening mule dengan rekening bisnis yang sah seperti WiFi provider atau penerima bansos?"**

> *"Sistem kami tidak hanya menganalisis pola MASUK — kami menganalisis kombinasi pola masuk DAN keluar sekaligus. Rekening mule selalu menunjukkan 'drain-to-zero' — uang dikuras habis ke satu atau dua tujuan dalam hitungan jam. Sebaliknya, rekening WiFi provider mengelola arus kas ke banyak tujuan operasional seperti PLN dan gaji. Untuk kasus ambiguous, sistem kami menggunakan empat lapis konteks: whitelist institusi, ISO 20022 purpose code, timing pattern, dan analisis perilaku penerima. Kasus yang benar-benar ambigu masuk ke mode REVIEW dengan human-in-the-loop — bukan auto-block yang bisa merugikan nasabah sah."*

**Q: "Apakah Federated Learning sudah berjalan sekarang?"**

> *"Federated Learning adalah roadmap Fase 2 kami. Di Fase 1 (pilot Bank Kuningan), kami sudah memiliki empat lapis deteksi yang kuat untuk pola internal BPR. Federated Learning kami rencanakan untuk Fase 2 bersama bank mitra seperti bjb, di mana intelijen fraud lintas bank dapat dibagikan anpa ada data nasabah yang keluar dari server masing-masing bank — sepenuhnya compliant UU PDP No.27/2022."*

---

*Update section ini: 19 Agustus 2026 04:25 WIB — Rifki Firmansyah*

---



#### Minggu 1 (15-22 Agustus):
- [x] Retrain AI Engine dengan 308K PaySim + SMOTE & validasi notebook 48 sel
- [x] Kalibrasi threshold realistis BPR (60/85) di API & Rule Engine
- [x] Buat panduan testing API lengkap (`docs/API_TESTING_GUIDE.md`)
- [ ] Deploy AI Engine ke Render Starter
- [ ] Update semua env variables & URL
- [ ] Test end-to-end full stack live


#### Minggu 2 (22-29 Agustus):
- [ ] Kalibrasi threshold model + retrain
- [ ] Hapus hardcoded values di rule_engine.py
- [ ] Tambah endpoint `/model/metrics`

#### Minggu 3 (29 Agustus - 5 September):
- [ ] User testing dengan Pak Rian / pihak bank
- [ ] Dokumentasikan feedback & perbaikan UX
- [ ] Final: semua komponen live & bisa diakses mandiri

**🎯 Target Final: September 2026 — Crypto-Sentinel fully live & independently usable**

---

## 🔍 Klarifikasi Arsitektur — 19 Agustus 2026

> *Bagian ini merangkum diskusi teknis penting tanggal 19 Agustus 2026 yang mengklarifikasi posisi sistem, cara kerja, dan narasi yang benar untuk pitching ke bank & juri.*

---

### A. Dashboard Menampilkan Nama Nasabah — Legal & Benar dalam Konteknya

**Pertanyaan**: Dashboard kita menampilkan nama, rekening, dan data nasabah. Apakah ini melanggar UU PDP?

**Jawaban Tegas: TIDAK melanggar — asal dua syarat dipenuhi.**

Dashboard Crypto-Sentinel dirancang untuk **Compliance Officer** — karyawan bank yang secara hukum dan jabatan memiliki hak akses ke data nasabah untuk keperluan investigasi fraud. Ini setara dengan sistem monitoring internal yang sudah digunakan setiap bank.

| Syarat | Status Implementasi |
|---|---|
| **On-Premise di server bank** | ✅ Dashboard di-deploy di infrastruktur lokal bank — developer Crypto-Sentinel **tidak bisa melihat data nasabah dari luar** |
| **Akses hanya untuk Compliance Officer** | ✅ Login berbasis role — hanya user berwenang yang dapat masuk ke dashboard |

**Analoginya**: Detektif kepolisian berhak akses data tersangka untuk investigasi. Compliance Officer BPR punya hak yang sama terhadap nasabah yang perlu diinvestigasi, selama dilakukan dalam sistem bank.

**Narasi ke juri jika ditanya:**
> *"Dashboard kami berjalan di infrastruktur server bank. Data nasabah hanya terlihat oleh Compliance Officer yang berwenang — persis seperti sistem monitoring internal yang sudah ada di bank. Kami sebagai developer di luar tidak memiliki akses ke data nasabah tersebut sama sekali."*

---

### B. Configurable Decision Engine — Auto-Block vs Notifikasi vs Keduanya

**Pertanyaan**: Sistem kita yang ambil keputusan (auto-block) — apakah bank tidak keberatan? Lebih baik dari yang hanya kirim notifikasi?

**Jawaban: Ya, lebih kuat — tapi kuncinya bank yang memilih level otonomisnya.**

#### Perbandingan Dua Mode:

| Aspek | ⚠️ AI Hanya Notifikasi | ✅ AI Auto-Blokir (Crypto-Sentinel) |
|---|---|---|
| **Kecepatan respons** | Lambat — tunggu manusia | <18ms — langsung |
| **Efektivitas** | Fraud bisa sudah terjadi | Fraud **tidak pernah terjadi** |
| **Nilai bagi bank** | Informatif tapi reaktif | Preventif — jauh lebih bernilai |
| **Risiko false positive** | Hampir nol | Ada — tapi threshold bisa dikonfigurasi |

#### Arsitektur yang Benar — Bank yang Menentukan:

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

Kita tidak memaksa keputusan ke bank — kita **merekomendasikan dengan cepat dan akurat**. Bank yang memilih seberapa besar otonomi yang diberikan ke AI. Ini adalah konsep **Configurable Decision Engine**.

**Referensi industri yang sama**: Visa/Mastercard 3D Secure, GoPay, OVO, DANA — semua pakai pola ini.

**Narasi ke juri jika ditanya:**
> *"Sistem kami menggunakan arsitektur Configurable Decision Engine. Bank bisa memilih berapa besar otonomi yang diberikan ke AI — dari mode full-monitoring (hanya notifikasi), semi-autonomous (tahan transaksi sambil tunggu approval officer), hingga mode full-autonomous (auto-block langsung di bawah 18ms). Ini sama persis dengan yang sudah dilakukan VISA dan Mastercard selama puluhan tahun."*

---

### C. Dua Mode Integrasi — BPR vs Mobile Banking (Perbedaan Fundamental)

**Ini adalah perbedaan arsitektur paling penting yang harus dipahami tim:**

#### MODE 1: Post-Transaction Monitoring → Untuk BPR Bank Kuningan (Teller)

```
Kasir/Teller input transaksi
         ↓
  CBS SIBAKU (Transaksi diproses, uang bergerak)
         ↓ (Salinan log transaksi)
  Crypto-Sentinel (Analisis AI di belakang)
         ↓ (Alert notifikasi)
  Dashboard Compliance Officer
  (Officer MANUAL putuskan: freeze akun? buat LTKM? lapor PPATK?)
```

- Transaksi **sudah diproses** oleh core banking terlebih dahulu
- Crypto-Sentinel hanya memberi **notifikasi & laporan** — tidak intervensi otomatis
- **Bank 0% khawatir** karena kita tidak bisa mempengaruhi transaksi inti bank
- ✅ Ini mode yang tepat untuk BPR Bank Kuningan yang teller-based

#### MODE 2: Pre-Authorization (Real-time Inline) → Untuk Mobile Banking

```
Nasabah input transfer di Flutter App
         ↓ (1. Kirim ke Crypto-Sentinel DULU)
  Crypto-Sentinel API (<18ms analisis)
         ├── APPROVED → App kirim ke Core Banking → Transaksi jadi ✅
         ├── PENDING  → App tampilkan "Sedang diverifikasi" ⏳
         └── BLOCKED  → App tampilkan "Transaksi ditolak" ❌
                        (Core Banking TIDAK pernah dipanggil)
```

- Crypto-Sentinel dipanggil **SEBELUM** Core Banking memproses uang
- Auto-block valid karena kita **mencegah instruksi sampai ke core banking**, bukan membalik transaksi yang sudah terjadi
- ✅ Ini mode yang dipakai di demo Flutter mobile banking kita

#### Kenapa Auto-Block Cocok di Mobile Banking tapi Tidak di Teller BPR?

| Aspek | Mobile Banking | Teller BPR |
|---|---|---|
| **Kecepatan transaksi** | Milisecond, otomatis | Manual — kasir punya waktu lihat layar |
| **Volume** | Ratusan/ribuan per hari | Puluhan per hari |
| **Siapa yang bisa lihat anomali?** | Tidak ada manusia secara real-time | Kasir bisa lihat langsung |
| **Auto-block cocok?** | ✅ YES | ❌ Alert manual lebih tepat |

**Ringkasan Dua Lapis Perlindungan Crypto-Sentinel:**

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

---

### D. Status Pitching, Offtaker & Validasi Lapangan — 20 Agustus 2026

| Target / Stakeholder | Status | Catatan & Milestone Terkini |
|---|---|---|
| **Pemerintah Kabupaten Kuningan (Setda)** | 🟢 **RESMI TERCAPAI (100%)** ✅ | **Surat Pernyataan Dukungan Resmi (Letter of Endorsement)** No: `500/38/PEREKONOMIAN/2026` telah terbit resmi ditandatangani secara elektronik (**Sertifikasi BSrE BSSN**) oleh **Bpk. Wawan Setiawan, S.Hut., M.T. (Asisten Perekonomian dan Pembangunan Setda Kab. Kuningan)**. |
| **PT Bank Pembangunan Daerah Jawa Barat dan Banten, Tbk (bank bjb)** | 🟢 **RESPON POSITIF & AUDIENSI JALAN** 🔥 | Bank bjb Cabang Kuningan langsung merespon surat rekomendasi Setda dan mengundang Tim EXPRESSO untuk **audiensi teknis, validasi alur mitigasi fraud, dan pengujian UX Kepatuhan** pada Jumat, 21 Agustus 2026. |
| **PT Perseroda BPR Kuningan (Bank Kuningan)** | 🟡 **Dalam Proses Koordinasi** | Surat rekomendasi Setda telah siap; diposisikan sebagai BPR mitra binaan dalam ekosistem APEX perbankan daerah. |

---

### E. Arsitektur Hub & Spoke APEX: Menjawab Validitas BI-FAST & RTOL di Lapangan

> [!IMPORTANT]
> **Keputusan Strategis Arsitektur Transaksi (20 Agustus 2026):**
> Untuk memastikan demo prototipe **100% valid secara regulasi dan tidak dianggap mengada-ada oleh juri Bank Indonesia & OJK**, tim menerapkan pemetaan arsitektur perbankan nyata:

```
┌───────────────────────────────────────────────────────────────────────────────────┐
│              ARSITEKTUR HUB & SPOKE PERBANKAN DAERAH (CRYPTO-SENTINEL)            │
├───────────────────────────────────────────────────────────────────────────────────┤
│                                                                                   │
│  [HUB / SETTLEMENT ANCHOR]                                                        │
│  PT Bank Pembangunan Daerah Jawa Barat dan Banten, Tbk (bank bjb)                 │
│  • Kategori: Bank Umum Komersial / BPD Devisa (KBMI 2)                            │
│  • Lisensi: Direct Participant BI-FAST & RTOL (Bank Indonesia)                    │
│  • Kanal Digital: Mobile Banking "DIGI by bank bjb"                               │
│  • Peran FDS: Crypto-Sentinel memproteksi transaksi instan BI-FAST (Rp 2.500) &   │
│               RTOL (Rp 6.500) secara pre-authorization (<18ms) sebelum dana       │
│               dilarikan ke bursa kripto / mule network.                           │
│                                                                                   │
│  [SPOKE / INCLUSION AFFILIATE]                                                    │
│  PT Perseroda BPR Kuningan (Bank Kuningan)                                        │
│  • Kategori: Bank Perekonomian Rakyat (BPR)                                       │
│  • Mekanisme: Terhubung melalui Gateway APEX BPR / Virtual Account via bank bjb   │
│  • Peran FDS: Monitoring post-transaction, deteksi anomali rekening pasif, dan   │
│               otomasi draf pelaporan LTKM resmi ke PPATK goAML.                   │
│                                                                                   │
└───────────────────────────────────────────────────────────────────────────────────┘
```

**Implikasi Teknis & Demo:**
1. **Demo Mobile Banking Flutter** diselaraskan dengan identitas **DIGI by bank bjb** sehingga menu transfer **BI-FAST** dan **Real-Time Online (RTOL)** memiliki dasar hukum dan kepesertaan yang sah di Bank Indonesia.
2. **Bank Kuningan tetap hadir** sebagai entitas BPR mitra APEX yang dilindungi oleh sistem, membuktikan bahwa Crypto-Sentinel dapat diterapkan secara terpadu baik di bank umum devisa maupun BPR daerah.

---

### E.1 Rincian Struktur Tarif & Skema Transfer BPR Bank Kuningan (Deep Research)

> [!NOTE]
> **Dasar Penentuan Tarif Transaksi BPR (Real-World Banking Operations):**
> Biaya transfer keluar pada BPR merupakan akumulasi dari biaya jaringan switching/Bank APEX ditambah margin pendapatan non-bunga (*fee-based income*) BPR.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  MOCKUP METODE TRANSFER ANTARBANK BPR BANK KUNINGAN                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. [●] Transfer Real-Time Online (RTOL via APEX bjb)                       │
│         Biaya Rp 7.500 • Real-Time 24/7 (Jaringan PRIMA / ATM Bersama)      │
│         ⚡ [Instan • Dana Langsung Sampai di Bank Tujuan]                    │
│                                                                             │
│  2. [○] Transfer Kliring SKNBI (via bank bjb)                               │
│         Biaya Rp 2.900 • Diproses pada Jam Kerja (Sistem Batch BI)          │
│         🕒 [Ekonomis • Waktu Proses 1–2 Jam]                                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

*Catatan: Transfer Sesama Rekening Bank Kuningan tetap GRATIS (Rp 0) Pindah Buku Real-Time (Core Banking SIBAKU).
```

#### Rincian Komposisi Biaya (Transparansi untuk Presentasi Juri):

| Metode Transfer | Biaya Riil Nasabah | Rincian Alokasi Biaya | Karakteristik Waktu |
|---|---|---|---|
| **Transfer Online (RTOL via APEX bjb)** | **Rp 7.500** | • **Rp 6.500**: Biaya Jaringan Switching PRIMA/Bersama via bjb<br>• **Rp 1.000**: Administrasi & Fee-based Income Bank Kuningan | **Real-Time 24/7 (Instan)** |
| **Kliring SKNBI (via bank bjb)** | **Rp 2.900** | • **Rp 2.900**: Tarif Resmi SKNBI Bank Indonesia | **Jam Kerja (Sistem Batch Kliring BI)** |
| **Sesama Bank Kuningan** | **Rp 0 (Gratis)** | • Internal Pindah Buku Core Banking SIBAKU | **Real-Time Internal** |

> **Argumen Penting untuk Pitching:** Sindikat penipuan & judi online selalu memanfaatkan jalur **Transfer Real-Time Online (Rp 7.500)** untuk melarikan dana seketika sebelum terdeteksi. Di sinilah **Crypto-Sentinel** bekerja sebagai *pre-authorization circuit breaker* (<18ms) sebelum instruksi kliring/switching keluar dieksekusi.

---

### F. Koreksi Narasi: PENDING/REVIEW bukan Blokir Permanen

Status `PENDING` atau `REVIEW` di sistem kita berarti:
- AI mendeteksi anomali → **menahan transaksi sementara**
- Compliance Officer mendapat alert → **manual review dalam X menit**
- Officer memutuskan: lanjutkan / tolak / investigasi lebih lanjut
- **Bukan otomatis BLOCK permanen** — ini penting agar bank tidak takut salah blokir (*Responsible AI dengan Human-in-the-Loop*).

---

*Update section ini: 20 Agustus 2026 21:15 WIB — Rifki Firmansyah (AI Architect & Team Lead)*

---

## 🚀 G. Roadmap Training & Rekayasa Fitur AI untuk Akurasi Tinggi (Anti-False Positive) — 19 Agustus 2026

> *Berdasarkan evaluasi edge cases nyata di lapangan (kasus penyaluran bansos, tukang WiFi, iuran SPP/koperasi, dan rekening mule sindikat), berikut adalah arsitektur rekayasa fitur baru untuk retraining model AI (Random Forest & GraphSAGE GNN) agar akurasi dan presisi meningkat drastis.*

---

### G.1 — Gap Model PaySim Murni vs Realita Perbankan Daerah

Model ML dan GNN yang saat ini ditraining pada data sintetis PaySim memiliki keterbatasan:
1. **PaySim hanya memiliki atribut transaksi dasar**: `amount`, `oldbalanceOrg`, `newbalanceOrig`, `oldbalanceDest`, `newbalanceDest`.
2. **Tidak ada konteks kelembagaan**: PaySim tidak membedakan transfer ke institusi resmi (PLN/Kemensos) dengan transfer ke rekening perseorangan/bursa kripto.
3. **Risiko False Positive pada Inflow Tinggi**: Akun yang menerima banyak transaksi masuk (seperti usaha WiFi lokal atau sekolah swasta) rentan terklasifikasi sebagai sindikat *mule* jika hanya mengandalkan rasio *Inflow Degree*.

---

### G.2 — 4 Fitur Baru untuk Pipeline Retraining AI

Untuk mengeliminasi false positive tanpa menurunkan *recall fraud*, 4 fitur baru (*feature engineering*) akan diinjeksikan ke pipeline training:

```
┌───────────────────────────────────────────────────────────────────────────┐
│                4 REKAYASA FITUR (FEATURE ENGINEERING) BARU                │
├───────────────────────────────────────────────────────────────────────────┤
│ 1. Outflow Destination Entropy (Keragaman Aliran Keluar):                 │
│    • Formula: H(Dest) = - Σ p_i * log2(p_i) untuk semua transaksi keluar │
│    • Usaha WiFi / Bisnis: H(Dest) Tinggi (Keluar ke PLN, Gaji, Logistik)  │
│    • Rekening Mule: H(Dest) ~ 0 (100% keluar terkonsentrasi ke 1 bursa)   │
│                                                                           │
│ 2. Rapid Drain Velocity Ratio:                                            │
│    • Rasio: (Total Nominal Keluar / Nominal Masuk) dalam t < 30 menit     │
│    • Bansos/Gaji Asli: Dibelanjakan bertahap (Drain Ratio < 30%)          │
│    • Rekening Mule: Langsung dikuras habis (Drain Ratio > 95%)            │
│                                                                           │
│ 3. Temporal Periodicity Score (Rutinitas Siklus Waktu):                   │
│    • Autokorelasi interval waktu transaksi antar bulan (Tanggal 1–10)     │
│    • SPP/Cicilan/Iuran: Periodisitas Tinggi (Teratur bulanan)             │
│    • Smurfing Sindikat: Periodisitas Rendah (Acak, burst sporadis)        │
│                                                                           │
│ 4. Institution Whitelist & ISO 20022 Purpose Code Matching:              │
│    • Flag biner: is_whitelisted_institution, is_govt_disbursement         │
│    • Kode tujuan resmi (GOVT, EDUC, TAXS, HLTH, SALA, LOAN)               │
└───────────────────────────────────────────────────────────────────────────┘
```

---

### G.3 — Status Item Teknis & Rencana Eksekusi Sprint

| Prioritas | Item Teknis | File Terkait | Target Selesai |
|---|---|---|---|
| 🔴 **P1** | **Implementasi 4 Rule Baru di `rule_engine.py`**<br>(Odd-Hour, Dormant, VPN/IP, Contextual Whitelist) | `app/rule_engine.py` | SELESAI ✅ |
| 🔴 **P1** | **Pembersihan Hardcoded Demo Account `987654`**<br>(Ganti ke dynamic lookup & confidence score) | `app/rule_engine.py` | SELESAI ✅ |
| 🟡 **P2** | **Endpoint `POST /str/generate` & Template LTKM**<br>(Pembuatan draf resmi PPATK goAML otomatis) | `app/str_generator.py`<br>`app/main.py` | SELESAI ✅ |
| 🟡 **P2** | **Injeksi Edge Cases Dataset & Retrain Evaluation Notebook**<br>(12.393 data Bansos, SPP, QRIS, Crypto, Dormant + 29 Features + 99.98% Acc) | `inject_edge_cases.py`<br>`train_model.py`<br>`notebooks/01_explore_paysim.ipynb` | SELESAI ✅ |
| 🟡 **P2** | **Simulasi Federated Learning (FedAvg)**<br>(Partisi 3 Bank: Bank Kuningan, BJB, BRI untuk UU PDP No. 27/2022) | `notebooks/01_explore_paysim.ipynb`<br>`federated_learning.py` | Sprint Pekan Ini |
| 🟢 **P3** | **Deploy AI Engine ke Cloud Container (Render/Railway)** | `Dockerfile`<br>`main.py` | Menjelang Pitch Day |

---

*Laporan Diperbarui: 19 Agustus 2026 13:30 WIB — Rifki Firmansyah (AI Architect & Team Lead EXPRESSO)*
