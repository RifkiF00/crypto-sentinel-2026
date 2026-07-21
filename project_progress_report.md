# 🛡️ Laporan Progres Proyek & Kajian Ilmiah: Crypto-Sentinel FDS

Laporan ini merangkum pencapaian arsitektur, kajian ilmiah teknologi pendukung, status proyek saat ini, serta panduan pengujian untuk persiapan pitching bank dan investor.

---

## 1. Kajian Ilmiah & Implementasi Arsitektur Keamanan

### A. Graph Neural Network (GNN) & Graph Feature Engineering
* **Landasan Teori:** Algoritma Machine Learning klasik (seperti Random Forest atau XGBoost tabular) rentan mengalami kegagalan deteksi terhadap pola pencucian uang terstruktur (*layering* & *smurfing*) karena hanya menganalisis transaksi secara individual. GNN memodelkan data keuangan sebagai grafik keterhubungan ($G = (V, E)$) di mana rekening adalah simpul (*nodes*) dan transfer dana adalah sisi (*edges*).
* **Implementasi di Proyek:** 
  * Kami menggunakan **NetworkX** di backend FDS API untuk memelihara graf transaksi dinamis in-memory.
  * Setiap transaksi yang diajukan langsung dimasukkan ke graf untuk menghitung fitur topologi: **In-Degree**, **Out-Degree**, dan **PageRank Centrality**.
  * Metrik grafis ini disuntikkan ke dalam model **Random Forest Classifier** (`ml_model.joblib`) untuk memprediksi tingkat kecurigaan secara real-time.
  * Hasil riset dan visualisasi grafik evaluasi (Confusion Matrix, ROC-AUC, Feature Importance) disinkronisasikan langsung ke Jupyter Notebook **[01_explore_paysim.ipynb](file:///d:/Crypto-Sentinel%202026/crypto-sentinel-api/notebooks/01_explore_paysim.ipynb)**.

### B. Standar SNAP BI (Standar Nasional Open API Pembayaran)
* **Landasan Teori:** Bank Indonesia mewajibkan standardisasi API bagi seluruh penyedia jasa pembayaran guna memastikan integrasi yang aman, seragam, dan berintegritas tinggi.
* **Implementasi di Proyek:**
  * Client mobile mengirimkan data transfer dengan menandatangani request payload secara digital menggunakan algoritma **HMAC-SHA256** dan sandi rahasia sandbox `KNG_SECRET_2026`.
  * Sistem menyematkan Header keamanan SNAP BI wajib pada request HTTP:
    * `X-Partner-Id` (ID institusi pengirim, e.g. `KNG-PARTNER-Billy`)
    * `X-Timestamp` (Waktu kirim ISO 8601)
    * `X-Signature` (Tanda tangan digital hasil kalkulasi HMAC)
  * Server Core Banking (`expresso-api`) divalidasi dengan memverifikasi signature tersebut sebelum dana dipotong. Jika data dirusak di tengah jalan, transaksi dibatalkan dengan error `401 Unauthorized`.

### C. Standar ISO (ISO 20022 & ISO 8583)
* **ISO 8583:** Standar lama berbasis bitmap untuk otorisasi kartu debit/kredit dan switching ATM. Di dalam proyek ini, direpresentasikan secara visual melalui logo switching lokal (**PRIMA, ALTO, ATM Bersama**) di halaman transfer.
* **ISO 20022:** Standar pesan keuangan global modern berbasis XML/JSON yang mendukung metadata transaksi kaya. Di dalam proyek ini, diimplementasikan pada kanal transfer **BI-FAST** dan kode tujuan penggunaan dana standar ISO seperti **`SALA` (Salary)** atau **`DEBT` (Debt Payment)**.

---

## 2. Kemajuan Proyek Saat Ini (Current Progress)

### 📊 Backend Core Banking (`expresso-api`)
* Menggunakan database SQLite `expresso.db` dengan struktur ORM 4 tabel: `accounts`, `transactions`, `sentinel_alerts`, and `str_drafts`.
* Saldo nasabah Billy Jonathan (`1234567890`) diperbarui secara dinamis langsung dari SQLite database.
* Ditambahkan endpoint `POST /bri/account/block/{account_id}` untuk memblokir rekening otomatis.

### 🛡️ FDS Security Engine (`crypto-sentinel-api`)
* Integrasi dual-engine: **Rule Engine** (sistem batas risiko statis) + **Machine Learning** (Random Forest teraugmentasi PageRank).
* Ditambahkan algoritma **Dynamic Historical Baseline** (deteksi nominal transfer > 5x rata-rata historis nasabah).
* Ditambahkan algoritma **Geolocation Impossible Travel** menggunakan rumus **Haversine Distance** (mendeteksi perpindahan fisik koordinat GPS instan berkecepatan > 1.000 km/jam).
* Ditambahkan endpoint `/api/v1/sentinel/str/download/{transaction_id}` untuk mengunduh laporan LTKM/STR resmi standar PPATK.

### 📱 Mobile Banking Client (`crypto-sentinel-bank-kng`)
* Saldo beranda dimuat secara real-time dari Core Banking API.
* Pengurangan saldo nasabah terhitung otomatis saat transfer berhasil atau ditangguhkan (`REVIEW`), dan memuat ulang saldo baru saat kembali ke Beranda.
* Implementasi kalkulasi tanda tangan digital HMAC-SHA256 untuk header SNAP BI.

### 🖥️ Web Analis Dashboard (`dashboard-crypto-sentinel`)
* Dashboard dibersihkan total dari data mockup offline dan data Paysim CSV statis. Tabel transaksi kini murni memuat log riil dari FDS API.
* Dilengkapi tombol merah **"Unduh STR PPATK"** pada modal detail transaksi untuk mengekspor dokumen kepatuhan hukum resmi.

---

## 3. Strategi Pitching & Skenario Pengujian Uji Coba

Untuk demonstrasi di hadapan juri dan investor, gunakan skenario terstruktur berikut:

| Skenario | Input Rekening | Nominal | Ekspektasi Hasil | Tujuan Demo |
| :--- | :--- | :--- | :--- | :--- |
| **1. Normal Transfer** | `9876543210` (Siti Rahma) | Rp 200.000 | **ALLOW (Hijau)** 🟢 | Menunjukkan kelancaran transaksi harian dan update saldo instan di HP. |
| **2. Suspicious Transfer** | `1000888888` (BNI Eksternal) | Rp 6.000.000 | **REVIEW (Kuning)** 🟡 | Menunjukkan mitigasi *False Positive* di mana transaksi ditangguhkan untuk verifikasi FDS. |
| **3. Blocked & Freeze** | `9012666666` (PT Indodax BCA) | Rp 15.000.000 | **BLOCK (Merah)** 🔴 | Menunjukkan deteksi blacklist ancaman dan pembekuan berantai akun pengirim secara otomatis. |

---

## 🎯 Target Pengembangan Selanjutnya (Next Target Recommendations)

Untuk pengembangan pasca hackathon menuju implementasi komersial:
1. **Step-Up Authentication UI Flow:** Membuat halaman input OTP SMS/WhatsApp dan Verifikasi Wajah (Liveness Biometric) di aplikasi HP jika transaksi berstatus `REVIEW`, sehingga status transfer dapat diselesaikan secara mandiri oleh nasabah.
2. **Homomorphic Encryption:** Menerapkan enkripsi data transaksi selama perjalanan menuju FDS API sehingga data privasi nasabah tidak bocor ke pihak FDS.
3. **Cellular Subnet Verification:** Meningkatkan deteksi lokasi dengan memverifikasi subnet IP BTS seluler, sehingga menghindari *false alarm* akibat IP dinamis provider HP nasabah.
