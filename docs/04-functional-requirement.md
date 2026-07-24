# 04 - Functional & Non-Functional Requirements

## 1. Functional Requirements (FR)

### Module 1: Core Banking & SNAP BI Gateway
* **FR-CB-001**: Sistem harus menyediakan endpoint transfer berstandar SNAP BI Bank Indonesia (`/api/v1/bri/transfer`).
* **FR-CB-002**: Sistem harus mendukung transfer sesama bank dan transfer interbank (BCA, Mandiri, Indodax, Binance).
* **FR-CB-003**: Sistem harus menghentikan mutasi saldo apabila keputusan FDS bernilai `REVIEW` atau `BLOCK`.

### Module 2: Sentinel FDS AI Middleware Engine
* **FR-AI-001**: Sistem harus menyediakan endpoint evaluasi risiko real-time `POST /analyze-transaction`.
* **FR-AI-002**: Sistem harus menghitung skor risiko gabungan (*Hybrid Fusion Score*) dari Rule Engine dan Model ML.
* **FR-AI-003**: Sistem harus menjalankan inferensi Graph Neural Network `POST /gnn-inference` untuk mendeteksi simpul *mule ring*.
* **FR-AI-004**: Sistem harus mendeteksi pola pemecahan transaksi beruntun (*smurfing / structuring*).

### Module 3: Compliance & Forensics Dashboard
* **FR-DB-001**: Dasbor harus menampilkan pemantauan transaksi *real-time* dengan filter waktu (1 Hari, 7 Hari, Semua).
* **FR-DB-002**: Dasbor harus menyediakan visualisasi Graf Interaktif GNN (Nodes: Bank, Mule, Wallet, Exchange).
* **FR-DB-003**: Dasbor harus mendukung fitur penyelesaian alert (*Abaikan & Tandai Aman*) yang tersimpan permanen di DB & LocalStorage.
* **FR-DB-004**: Dasbor harus menyediakan generator Laporan LTKM/STR resmi berformat PDF/Markdown.

---

## 2. Non-Functional Requirements (NFR)

### NFR-1: Performance & Latency
* **NFR-PERF-01**: Waktu respon evaluasi FDS `POST /analyze-transaction` harus $\le 50\text{ms}$ pada p95.
* **NFR-PERF-02**: Dasbor web harus mampu me-render graf topologi GNN hingga $500+$ simpul tanpa *lag* ($\ge 60\text{ FPS}$).

### NFR-2: Security & Compliance
* **NFR-SEC-01**: Seluruh komunikasi API harus dilindungi oleh enkripsi TLS 1.3 dan tanda tangan HMAC SHA-256 (SNAP BI Standard).
* **NFR-SEC-02**: Kerangka kerja sistem harus mematuhi regulasi OJK dan Undang-Undang No. 8 Tahun 2010 tentang TPPU.

### NFR-3: Availability & Scalability
* **NFR-AVAIL-01**: Middleware FDS harus memiliki ketersediaan (*uptime*) minimal $99.99\%$.
* **NFR-AVAIL-02**: Database SQLite/PostgreSQL harus mendukung transaksi pencatatan paralel (*WAL Mode Enabled*).
