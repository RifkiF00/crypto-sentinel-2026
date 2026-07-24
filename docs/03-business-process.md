# 03 - Business Process & Workflow Specifications

## 1. End-to-End Business Flow Diagram

```mermaid
flowchart TD
    A[Nasabah Mengirim Transfer via Mobile Banking] --> B[Core Banking API Gateway]
    B --> C{Panggil Sentinel FDS Engine /analyze-transaction}
    C --> D[Analisis Rule Engine & Machine Learning]
    D --> E{Skor Risiko FDS}
    
    E -- Risk < 50% --> F[ALLOW: Eksekusi Mutasi Saldo & Kirim Respon Sukses]
    E -- 50% <= Risk < 85% --> G[REVIEW: Tangguhkan Transaksi & Buat Alert Kepatuhan]
    E -- Risk >= 85% --> H[BLOCK: Blokir Transaksi & Buat STR Draft]
    
    G --> I[Dashboard Analis Kepatuhan]
    H --> I
    I --> J{Tindakan Analis}
    J -- Abaikan & Tandai Aman --> K[Simpan Status Terresolusi]
    J -- Konfirmasi Fraud / Bekukan --> L[Eksekusi Pembekuan Rekening & Export LTKM ke PPATK]
```

## 2. Deskripsi Tahapan Proses Bisnis

### Tahap 1: Inisiasi & Interception Transaksi
* Nasabah memasukkan parameter transfer (rekening pengirim, rekening penerima, nominal, metode BI-FAST).
* Core Banking menghentikan sementara proses mutasi dan mengirim payload transaksi ke Sentinel FDS.

### Tahap 2: Evaluasi Keamanan Real-Time
* **Step 2.1**: Verifikasi profil risiko pengirim & penerima.
* **Step 2.2**: Pencocokan dengan *Threat Intelligence Blacklist*.
* **Step 2.3**: Inferensi *Random Forest Model* & *GNN Graph Metrics*.
* **Step 2.4**: Perhitungan *Hybrid Fusion Risk Score*.

### Tahap 3: Eksekusi Keputusan & Respon
* **Keputusan ALLOW**: Core Banking menyelesaikan transaksi, resi sukses ditampilkan ke nasabah.
* **Keputusan REVIEW**: Core Banking menangguhkan dana, resi "Transfer Ditangguhkan" ditampilkan, Alert kuning dikirim ke Dasbor.
* **Keputusan BLOCK**: Core Banking menggagalkan transaksi, pesan pemblokiran FDS ditampilkan, Alert merah & Draft STR dibuat.

### Tahap 4: Investigasi & Pelaporan Kepatuhan
* Analis Kepatuhan meneliti graf jaringan GNN di dasbor.
* Analis memilih untuk menyelesaikan (*Resolve*) atau meneruskan Laporan Transaksi Keuangan Mencurigakan (LTKM) ke PPATK.
