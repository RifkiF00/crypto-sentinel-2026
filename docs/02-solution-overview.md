# 02 - Solution Overview & Key Capabilities

## 1. Konsep Solusi: Crypto-Sentinel Middleware FDS
Crypto-Sentinel 2026 bertindak sebagai **Inteligent Anti-Money Laundering Middleware** yang ditempatkan di antara Core Banking System (API Gateway SNAP BI) dan Jaringan Pembayaran Nasional (BI-FAST / RTOL).

```
[ Nasabah / Attacker ] 
          │
          ▼
 [ SNAP BI Transfer API ] ──(Interception)──► [ Crypto-Sentinel FDS Engine ]
                                                          │
                                         ┌────────────────┴────────────────┐
                                         ▼                                 ▼
                              [ Decision: ALLOW ]              [ Decision: REVIEW / BLOCK ]
                                         │                                 │
                                         ▼                                 ▼
                              [ Mutasi Rekening Sukses ]        [ Respon 403 / Pending Review ]
                                                                           │
                                                                           ▼
                                                                [ Push Real-time Alert & ]
                                                                [ Forensics Graph Dashboard ]
```

## 2. Fitur Utama Platform

### A. Real-Time Pre-Transaction Interception
* Setiap transaksi diproses melalui endpoint `/analyze-transaction` dalam waktu $< 45\text{ms}$.
* Hasil keputusan dibagi menjadi 3 tingkat penanganan:
  1. **ALLOW**: Transaksi diproses normal.
  2. **REVIEW**: Transaksi ditangguhkan untuk peninjauan manual tim Kepatuhan.
  3. **BLOCK**: Transaksi diblokir otomatis demi mencegah kerugian bank/nasabah.

### B. Hybrid Machine Learning & GNN Engine
* **Random Forest Classifier**: Memprediksi probabilitas anomali berdasarkan fitur transaksi (nominal, saldo awal, rasio saldo terkuras).
* **Graph Neural Network (GNN)**: Memindai simpul jaringan transaksi (*nodes & edges*) untuk mendeteksi *mule ring*, *in-degree velocity*, dan *PageRank centrality*.

### C. Automated Threat Intel & Blacklist Sync
* Pencocokan instan terhadap daftar rekening berrisiko tinggi (*High-Risk Exchanges, Crypto Wallets, Blacklisted Accounts*).
* Sinkronisasi data ancaman real-time dari database intelijen AML.

### D. Upstream Chain Freezing & STR Auto-Drafting
* Apabila transaksi bernilai kritis terdeteksi, sistem tidak hanya memblokir transaksi tetapi juga menyiapkan draft **Laporan Transaksi Keuangan Mencurigakan (LTKM / STR)** yang siap ditinjau dan dikirim ke PPATK.
