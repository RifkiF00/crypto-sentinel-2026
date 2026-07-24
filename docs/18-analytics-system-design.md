# 18 - Analytics System Design & Telemetry

## 1. Overview Telemetri & Analitik FDS
Sistem analitik Crypto-Sentinel 2026 bertugas mengumpulkan, mengagregasi, dan menyajikan metrik kinerja sistem keamanan perbankan dalam bentuk dasbor visual yang interaktif.

## 2. Metrik Analitik Utama

### A. Metrik Efektivitas Pencegahan (Security Metrics)
* **Total Volume Managed**: Akumulasi total nominal dana yang dipindai oleh sistem FDS (misal Rp 15,2 Miliar).
* **Total Value Blocked**: Akumulasi nominal dana berisiko tinggi yang berhasil dicegah keluar ke bursa crypto/penipu.
* **Block Rate %**: Persentase transaksi yang diblokir terhadap total volume transaksi.

### B. Metrik Kinerja Model AI (AI Performance Metrics)
* **Confusion Matrix**: Sebaran *True Positives*, *False Positives*, *True Negatives*, dan *False Negatives*.
* **SHAP Value Explanations**: Kontribusi relatif tiap variabel terhadap keputusan pemblokiran FDS.

```
SHAP Feature Importance (Relative Weight):
--------------------------------------------------
1. Destination Threat Match : ████████████████ 35%
2. In-Degree / Velocity     : ████████████ 25%
3. Balance Drain Ratio      : █████████ 18%
4. Device / IP Anomaly      : ██████ 12%
5. Transaction Amount       : ████ 10%
--------------------------------------------------
```

## 3. Ekspor & Pelaporan Kepatuhan OJK/PPATK
Sistem menyediakan modul ekspor otomatis berkas **LTKM / STR (Suspicious Transaction Report)** yang memuat:
1. Identitas Lengkap Terlapor (Nama, NIK KTP, Rekening Asal, Device ID, IP Address).
2. Detail Rekening Tujuan & Bursa Crypto Penerima.
3. Alasan Pemblokiran FDS & Nilai SHAP Feature Importance.
4. Grafis Topologi Jaringan Keledai (GNN Mule Ring Graph).
