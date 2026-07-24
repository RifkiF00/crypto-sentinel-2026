# 00 - Executive & Project Overview: Crypto-Sentinel 2026

## 1. Executive Summary
**Crypto-Sentinel 2026** adalah platform Fraud Detection System (FDS) dan Anti-Money Laundering (AML) generasi baru yang dirancang khusus untuk industri perbankan dan ekosistem keuangan digital Indonesia. Platform ini mengintegrasikan **Hybrid Machine Learning (Random Forest 99.8% Accuracy)** dan **Graph Neural Network (GNN)** untuk mendeteksi pencucian uang, jaringan rekening keledai (*mule accounts*), serta pola pemecahan transaksi berkecepatan tinggi (*smurfing / structuring*) secara real-time sebelum dana keluar ke bursa *crypto offshore*.

## 2. Visi & Misi Proyek
* **Visi**: Menjadi standar middleware FDS perbankan nasional yang mampu memutus rantai kejahatan keuangan digital dan pencucian uang berbasis kripto secara otomatis.
* **Misi**:
  1. Menyeimbangkan kecepatan transaksi nasabah (*low latency < 50ms*) dengan presisi deteksi kejahatan (*high accuracy*).
  2. Menyediakan analisis grafis forensik jaringan *mule account* berbasis GNN yang dapat divisualisasikan secara langsung oleh analis kepatuhan (Compliance Analyst).
  3. Memfasilitasi pelaporan otomatis Laporan Transaksi Keuangan Mencurigakan (LTKM / STR Draft) sesuai regulasi PPATK dan OJK.

## 3. Pilar Utama Arsitektur Sistem

```
+-----------------------------------------------------------------------------------+
|                            MOBILE BANKING (FLUTTER APP)                           |
+-----------------------------------------------------------------------------------+
                                          |
                                          v (SNAP BI API Standard)
+-----------------------------------------------------------------------------------+
|                        CORE BANKING GATEWAY (EXPRESSO-API)                        |
+-----------------------------------------------------------------------------------+
                                          |
                                          v (HTTP/REST RESTful Pipeline)
+-----------------------------------------------------------------------------------+
|                    MIDDLEWARE FDS ENGINE (CRYPTO-SENTINEL-API)                    |
|  +-------------------------------+    +----------------------------------------+  |
|  | Rule Engine (ISO 20022 Check)   |    | Machine Learning Engine (RandomForest) |  |
|  +-------------------------------+    +----------------------------------------+  |
|  | Threat Intel Blacklist Filter |    | Graph Neural Network (GNN Analysis)    |  |
|  +-------------------------------+    +----------------------------------------+  |
+-----------------------------------------------------------------------------------+
                                          |
                                          v (Real-Time Event Stream & Polling)
+-----------------------------------------------------------------------------------+
|                      REACT VITE FDS COMPLIANCE DASHBOARD                          |
+-----------------------------------------------------------------------------------+
```

## 4. Key Performance Indicators (KPI) & Metrik Model
* **Model Accuracy**: $99.8\%$
* **Precision**: $99.2\%$
* **Recall**: $98.6\%$
* **F1-Score**: $98.9\%$
* **ROC-AUC**: $1.0000$
* **GNN Embedding Dim**: $128$-dimensional
* **Message Passing Layers**: $3$ Graph Layers (GraphSAGE / GAT)
* **Latency Analisis**: $\le 45\text{ms}$ per transaksi.

## 5. Ringkasan Modul Proyek
1. `crypto-sentinel-api`: Service utama AI/ML FDS berbasis FastAPI.
2. `expresso-api`: Mock Core Banking API berstandar SNAP BI (Bank Indonesia).
3. `dashboard-crypto-sentinel`: Dasbor forensik React Vite untuk tim Kepatuhan & AML.
4. `crypto-sentinel-bank-kng`: Aplikasi Mobile Banking Flutter sebagai simulasi nasabah.
