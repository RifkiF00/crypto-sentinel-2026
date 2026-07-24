# 01 - Problem Analysis & Industry Domain Challenge

## 1. Latar Belakang Masalah (Domain Context)
Pesatnya perkembangan aset kripto dan keuangan digital di Indonesia menciptakan tantangan baru bagi kejahatan perbankan (Financial Crime). Pelaku kejahatan penipuan (*scam/phishing*) dan judi online tidak lagi menggunakan saluran perbankan tradisional untuk menyimpan dana hasil kejahatan, melainkan mengalirkannya secara cepat ke bursa aset kripto lokal maupun *offshore*.

## 2. Analisis Modus Operasi Utama

### A. Pola Smurfing / Structuring
* Pelaku memecah dana kejahatan bernilai besar (misal Rp 500.000.000) menjadi belasan transaksi bernilai sedang (misal Rp 60.000.000 per transaksi) yang ditransfer secara beruntun (*rapid velocity*) dalam hitungan detik.
* **Tujuan**: Menghindari ambang batas pelaporan otomatis Sistem FDS konvensional yang berfokus pada batas nominal tunggal.

### B. Jaringan Rekening Keledai (Mule Account Network)
* Dana tidak dikirim langsung ke bursa crypto, melainkan transit melalui beberapa lapis rekening orang lain (*Mule Relay*) yang dibeli atau disewa oleh sindikat.
* **Tujuan**: Memutus jejak audit (*Audit Trail*) sebelum dana dikonversi menjadi USDT/BTC di Indodax, Binance, atau Tokocrypto.

### C. Kelemahan FDS Rule-Engine Konvensional
1. **Silo Evaluation**: FDS tradisional mengevaluasi transaksi secara terisolasi tanpa melihat konteks topologi graf/jaringan antar rekening.
2. **Keterlambatan Deteksi (Post-Transaction Detection)**: Transaksi biasanya baru ditandai setelah dana berhasil keluar dari perbankan (*Cash-Out* selesai).
3. **Beban Manual Analis**: Ribuan alert palsu (*False Positives*) membingungkan analis kepatuhan sehingga proses pelaporan STR ke PPATK memakan waktu bertentangan dengan kebutuhan pembekuan cepat.

## 3. Matriks Perbandingan Sistem

| Karakteristik | FDS Tradisional | Crypto-Sentinel 2026 |
| :--- | :--- | :--- |
| **Metode Evaluasi** | Rule-Engine Statis tunggal | Hybrid Fusion (ML RandomForest + GNN + Rule-Engine) |
| **Perspektif Analisis** | Transaksi Tunggal (*Tabular*) | Jaringan Rekening & Topologi Graf (*Graph Topology*) |
| **Respon Waktu** | Pasca-Transaksi (*Batch*) | Real-Time Pre-Transaction Interception (<50ms) |
| **Deteksi Smurfing** | Lemah (Lolos jika di bawah threshold) | Sangat Kuat (Deteksi Velocity & In-Degree Spike) |
| **Integrasi Standar** | Proprietary / Legacy | ISO 20022 & SNAP BI (Bank Indonesia) |
| **Otomatisasi STR** | Manual Export CSV | Auto-drafting LTKM/STR dengan nilai SHAP Explainability |
