# Crypto Sentinel — Implementasi Arsitektur XGNN-FDS Hibrida

## Latar Belakang & Analisis Gap

Dokumen riset yang dibagikan merekomendasikan **Arsitektur Hibrida XGNN-FDS** yang menyatukan:
- **FDS Layer**: Fondasi operasional, manajemen kasus, dan kepatuhan regulasi
- **GNN + GNNExplainer Layer**: Deteksi pola multi-hop & transparansi prediktif

Berdasarkan **audit menyeluruh seluruh kode sumber**, berikut adalah gap antara arsitektur ideal vs kondisi aktual:

---

## Hasil Audit: Kondisi Aktual vs Gap

### ✅ Yang SUDAH ADA & BERFUNGSI (Pertahankan)
| Komponen | Status | Keterangan |
|---|---|---|
| GraphSAGE GNN 562K nodes | ✅ Backend Real | `gnn_embeddings.pkl` (171MB), `gnn_scorer.py` |
| Random Forest 100 Trees | ✅ Backend Real | `ml_model.joblib` (3.2MB), 29 fitur |
| Rule Engine 13 Aturan | ✅ Backend Real | `rule_engine.py` (POJK/PPATK standards) |
| SHAP TreeExplainer | ✅ Backend Real | Diinisialisasi di startup, tersedia via `/analyze-transaction` |
| NetworkX Live Graph | ✅ Backend Real | In-memory DiGraph dibangun dari 50K baseline rows PaySim |
| LTKM / STR Generator | ✅ Backend Real | `str_generator.py` standar PPATK goAML |
| Hybrid Score Formula | ✅ Backend Real | `0.6×GNN + 0.4×Rule`, dikembalikan di response JSON |
| GNN Graph Visualization | ✅ Frontend Real | `GNNVisualization.jsx` (105KB, 2180 lines) - 3 skenario & 15 sub-indikator XAI |
| SHAP Bar Chart | ✅ Frontend Real | `ShapExplanation.jsx` di TransactionTable modal |
| ComplianceView (LTKM) | ✅ Frontend Real | Memanggil `/generate-str-html` dari FastAPI |
| RulesView (POJK 8/2023) | ✅ Frontend Real | Dual-control, audit trail |
| TransactionTable | ✅ Frontend Real | Filter, search, masking UU PDP |

### ❌ Gap KRITIS yang Harus Diisi
| Gap | Dampak | Prioritas |
|---|---|---|
| **GNNVisualization tidak terhubung ke SHAP** | Juri tidak bisa lihat penjelasan AI saat mengklik node di graf | 🔴 KRITIS |
| **AlertsView tidak generate LTKM** | Alur resolusi tiket terputus — harus pindah ke menu Kepatuhan dulu | 🔴 KRITIS |
| **Tidak ada Temporal Slider di GNN** | Riset mensyaratkan rekonstruksi kronologi (3-hop neighbor graph) | 🟠 PENTING |
| **VASP Info terpisah dari GNN** | Informasi VASP seharusnya muncul saat node exchange diklik | 🟠 PENTING |
| **MonitoringView tidak live-update transactions** | Stream berjalan tapi tidak memicu re-fetch ke API setiap polling cycle | 🟡 SEDANG |
| **Tidak ada RBAC UI** | Riset mensyaratkan role-based access control yang terlihat di UI | 🟡 SEDANG |

---

## Rencana Implementasi: 4 Tahap

### Tahap 1 — Interkoneksi GNN Canvas ↔ XAI Subgraph Panel (PALING PENTING)

Masalah paling kritis yang disebutkan riset:
> *"Pengoperasian elemen pada panel GNNExplainer secara instan menyorot subgraf yang sesuai pada kanvas utama."*

**Yang akan dilakukan:**
1. **[GNNVisualization.jsx]** — Tambah "XAI Explainer Panel" yang muncul saat node diklik di canvas graf:
   - Tampilkan skor SHAP fitur terpenting (`amount_ratio`, `is_balance_drained`, `sender_out_degree`)
   - "Sorot subgraf minimal" — transparansi node yang tidak relevan turun (opacity-reduction)
   - Label otomatis pola: `Fan-Out / Fan-In`, `Drain-to-Zero`, `Multi-Hop Smurfing`
   - Panel Interpretasi Motif: Memetakan struktur Gs ke templat pola yang diketahui

2. **[GNNVisualization.jsx]** — Tambah **Temporal Slider** (simulasi kronologi):
   - Slider menampilkan pergerakan dana dalam 3-hop neighborhood dari titik awal
   - Default: Node aktif bergerak dari kiri → kanan (pengirim → mule → VASP)

---

### Tahap 2 — AlertsView: Alur Enterprise Case Management

Masalah saat ini: AlertsView mengelola tiket tapi tidak bisa langsung generate LTKM.

**Yang akan dilakukan:**
1. **[PageViews.jsx → AlertsView]** — Tombol **"Generate LTKM / SAR"** langsung di panel detail tiket:
   - Klik tiket → panel detail terbuka → tombol "📄 Generate Draf LTKM ke PPATK"
   - Memanggil `POST /generate-str-html` di `crypto-sentinel-api :8000`
   - Membuka preview LTKM di modal baru tanpa pindah halaman
   - Status tiket otomatis berubah ke `RESOLVED - LTKM_GENERATED`

2. **[PageViews.jsx → AlertsView]** — Panel kanan: "Modul Sub-Graf Investigasi" (ringkas):
   - Saat tiket dipilih, tampilkan mini-grafik 3-hop (pengirim → mule → tujuan akhir)
   - Memanfaatkan data dari `gnn_graph_data` yang sudah ada di `mockData.js`

---

### Tahap 3 — Live Monitoring: True Real-Time Polling

Masalah: MonitoringView scanner ticker berjalan tapi transactions tidak benar-benar di-refresh.

**Yang akan dilakukan:**
1. **[PageViews.jsx → MonitoringView]** — Auto-polling `/bjb/transactions` + `/kuningan/transactions` setiap 10 detik:
   - Menggunakan `setInterval` yang sudah ada tapi diarahkan ke `fetchTransactions()` dari `api.js`
   - Jika ada transaksi baru, push ke `transactions` state via `setTransactions()`
   - Toast notifikasi: *"⚡ Transaksi baru terdeteksi dari Bank bjb [TXN-XXXX]"*

---

### Tahap 4 — RBAC UI Badge & Travel Rule Summary

Masalah: Riset menyebut RBAC & Travel Rule sebagai syarat kesiapan komersialisasi.

**Yang akan dilakukan:**
1. **[Sidebar.jsx + Header.jsx]** — Role badge di profil pengguna:
   - `Admin Regulator` → Badge `LEVEL: FULL ACCESS`
   - Ditampilkan di sidebar footer dan header
2. **[PageViews.jsx → ComplianceView]** — Tambah section **Travel Rule Summary**:
   - Panel ringkas: apakah transaksi VASP di atas $1000 memenuhi Travel Rule (FATF R.16)
   - Cukup tampilan informatif, tidak perlu form baru

---

## Open Questions

> [!IMPORTANT]
> **Q1 — Cakupan Implementasi**: Apakah Tahap 1 (GNN↔XAI Interkoneksi) dan Tahap 2 (AlertsView LTKM) cukup untuk demo, atau semua 4 tahap perlu selesai?

> [!IMPORTANT]
> **Q2 — Temporal Slider**: Slider kronologi di GNN Explorer menggunakan data skenario statis (yang sudah ada di `GNNVisualization.jsx`) atau harus memanggil API backend secara live? Live API lebih impressive tapi butuh lebih banyak waktu.

> [!NOTE]
> **Q3 — RBAC Depth**: Cukup dengan badge visual di sidebar (mudah & cepat), atau perlu implementasi real access control yang mengunci fitur tertentu berdasarkan role?

---

## Verification Plan

### Automated Build
```bash
cd dashboard-crypto-sentinel && npm run build
# Expected: exit code 0, no TypeErrors
```

### Manual Demo Verification
1. **GNN Panel XAI**: Klik node "Mule Account" di Graf GNN → Panel XAI muncul dengan SHAP bars dan highlight subgraf
2. **Alert → LTKM**: Klik tiket `CRITICAL` di AlertsView → Klik "Generate LTKM" → Modal LTKM HTML dari backend muncul
3. **Live Monitoring**: Buka Live Sentinel Stream → Lakukan transfer dari HP → Transaksi baru muncul dalam 10 detik tanpa refresh manual
