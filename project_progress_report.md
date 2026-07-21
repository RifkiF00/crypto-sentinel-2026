# 🛡️ Laporan Akhir Progres Proyek & Kajian Ilmiah: Crypto-Sentinel FDS

Dokumen ini disusun sebagai panduan komprehensif, tinjauan ilmiah, dan spesifikasi arsitektur teknis dari sistem **Crypto-Sentinel Fraud Detection System (FDS)**. Laporan ini dirancang untuk memenuhi kebutuhan dokumentasi hackathon, presentasi investor (*pitching*), serta kebutuhan pengujian akademis.

---

## 1. Kajian Literatur & Landasan Teoritis

### A. SNAP BI (Standar Nasional Open API Pembayaran Indonesia)
**SNAP BI** adalah standarisasi teknologi Open API pembayaran yang ditetapkan oleh Bank Indonesia berdasarkan Peraturan Anggota Deputi Gubernur (PADG) No. 23/18/PADG/2021. Standar ini bertujuan menciptakan ekosistem pembayaran yang interkonektif, aman, dan efisien di Indonesia.

* **Metode Keamanan & Kriptografi:**
  * SNAP BI mewajibkan penggunaan kriptografi dua tingkat: **Asymmetric Signature** (menggunakan SHA256withRSA untuk registrasi token) dan **Symmetric Signature** (menggunakan HMAC-SHA256 untuk setiap transaksi transfer dana).
  * HMAC-SHA256 dibentuk dengan menggabungkan kunci rahasia (*client secret*) dan string pesan terstruktur yang terdiri dari parameter identitas partner, stempel waktu, dan data transaksi.
* **Standardisasi Header HTTP:**
  Setiap request API transfer wajib menyertakan:
  * `X-Partner-Id`: ID identitas unik partner bank/fintech.
  * `X-Timestamp`: Stempel waktu transaksi dengan format ISO 8601 UTC (e.g. `2026-07-22T02:00:00Z`).
  * `X-Signature`: Tanda tangan digital hasil kalkulasi HMAC-SHA256 untuk memvalidasi integritas payload.
* **Standardisasi Response Code:**
  Mengadopsi format kode terstandardisasi, misalnya status sukses didefinisikan dengan struktur kode berawalan `200` (e.g. `2001100` untuk transaksi transfer dana domestik sukses).

### B. Standar ISO 20022
**ISO 20022** adalah standar global modern untuk pertukaran pesan keuangan (*financial messaging*) yang menggantikan standar lama SWIFT MT. ISO 20022 menggunakan skema XML atau JSON yang sangat kaya akan metadata (*rich metadata*).

* **Penerapan Fitur Kunci:**
  * **Purpose Code:** Menyediakan kolom klasifikasi tujuan penggunaan dana yang terstandardisasi secara global. Contoh: `SALA` (Salary/Pembayaran Gaji), `DEBT` (Debt Payment/Pembayaran Utang), `TREA` (Treasury/Transfer internal kas).
  * **Identitas Tambahan:** Mendukung penulisan koordinat geografis (GPS lat/long), alamat IP terperinci, data identitas KTP (NIK), dan ID perangkat keras pengirim.

### C. Standar ISO 8583
**ISO 8583** adalah standar pesan transaksi keuangan tradisional berbasis transmisi bitmapped yang digunakan secara luas pada jaringan kartu kredit, mesin EDC, dan jaringan ATM.
* **Switching Lokal:** Standar ini menjadi dasar komunikasi bagi perusahaan switching lokal di Indonesia seperti **PRIMA, ALTO, dan ATM Bersama** untuk memproses otorisasi tarik tunai dan transfer instan antarbank.

### D. Perbandingan BI-FAST vs RTOL (Real-Time Online)
Di Indonesia, transfer antarbank ritel dilayani oleh dua infrastruktur utama:

| Parameter | BI-FAST | RTOL (Real-Time Online) |
| :--- | :--- | :--- |
| **Infrastruktur** | Dikelola oleh Bank Indonesia | Dikelola oleh Jaringan Switching (Prima, Alto, ATM Bersama) |
| **Dasar Pesan** | ISO 20022 (Rich Metadata) | ISO 8583 (Bitmap Payload) |
| **Limit Nominal** | Hingga Rp 250.000.000 / transaksi | Maksimal Rp 50.000.000 / transaksi |
| **Biaya Maksimal** | Rp 2.500 | Rp 6.500 |
| **Kelebihan** | Memuat informasi detail tujuan penggunaan dana | Kompatibilitas tinggi dengan ATM tradisional |

### E. Graph Neural Network (GNN) & Graph Feature Engineering
Pada deteksi kejahatan keuangan (AML/FDS), sindikat pencucian uang sering memecah aliran dana mereka melalui banyak akun perantara (*mule accounts*) dengan pola transaksi berantai (*layering*).
* **Teori Agregasi:** GNN bekerja dengan cara **Neighborhood Aggregation / Message Passing** di mana representasi numerik suatu akun diperbarui secara iteratif berdasarkan transaksi yang masuk dan keluar dari tetangganya.
* **Graph Feature Engineering:** Dalam prototype kita, FDS mengekstrak properti grafis topologi:
  * **In-Degree:** Jumlah transaksi masuk unik. Akun mule biasanya memiliki In-Degree tinggi sebelum cash-out.
  * **Out-Degree:** Jumlah transaksi keluar unik.
  * **PageRank Centrality:** Mengukur tingkat pengaruh akun dalam grafik jaringan transaksi. Rekening bursa kripto atau penampung gelap akan memiliki PageRank yang sangat tinggi karena menjadi simpul pusaran dana.

---

## 2. Arsitektur Sistem & Aliran Data (Data Flow)

Sistem **Crypto-Sentinel** dibangun di atas arsitektur terdistribusi empat komponen utama:

```mermaid
graph TD
    A[Flutter App: Bank Kuningan Mobile] -- "1. HTTP Request + SNAP BI Headers" --> B[FastAPI: Expresso Core Banking]
    B -- "2. HTTP Request + Graph Features" --> C[FastAPI: Crypto-Sentinel FDS Engine]
    C -- "3. ML Score + GNN Evaluation Result" --> B
    B -- "4. Commit DB & Block/Allow Response" --> A
    C -- "5. Push Analyzed Logs" --> D[React: Analyst Forensic Dashboard]
```

### Detail Alur Transaksi:
1. **Inisiasi:** Billy Jonathan mengklik transfer Rp 15.000.000 ke PT Indodax BCA di aplikasi HP.
2. **SNAP BI Signature:** HP mengkalkulasi signature HMAC-SHA256 dan menyisipkannya ke header HTTP, lalu mengirimkannya ke `/bri/transfer` (`expresso-api`).
3. **Verifikasi Core Banking:** Core Banking memvalidasi signature. Jika lolos, ia membaca database SQLite untuk mengambil data 5 transaksi terakhir pengirim, lalu meneruskan transaksi + koordinat + riwayat tersebut ke FDS API (`crypto-sentinel-api`).
4. **FDS Assessment:** FDS memasukkan transaksi ke graf in-memory (NetworkX) untuk menghitung PageRank, menggabungkannya dengan ML Random Forest, mengevaluasi aturan anomali lokasi (Haversine), dan membalikkan keputusan (`BLOCK`).
5. **Freeze & Lock:** Core Banking menerima keputusan `BLOCK`. Core banking membatalkan transfer, mencatat alarm, membekukan rekening Billy secara berantai (*Upstream Freezing*), dan mengirim respons error ke HP. Dashboard memperbarui datanya secara real-time.

---

## 3. Struktur Database Prototype (`expresso.db`)

Database core banking kita dikelola menggunakan SQLite dengan rincian skema tabel sebagai berikut:

### A. Tabel `accounts` (Data Rekening Nasabah)
| Nama Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `account_id` | `VARCHAR(20)` [PK] | Nomor rekening unik 10-digit (e.g. `1234567890`). |
| `national_id` | `VARCHAR(16)` [Unique] | NIK KTP pemilik (digunakan untuk KYC & STR PPATK). |
| `owner_name` | `VARCHAR(100)` | Nama lengkap pemilik rekening. |
| `balance` | `BIGINT` | Saldo riil nasabah (dalam satuan Rupiah). |
| `risk_profile` | `VARCHAR(10)` | Profil risiko bawaan (`LOW`, `MEDIUM`, `HIGH`). |
| `is_blocked` | `BOOLEAN` | Status pemblokiran otomatis akibat FDS. |
| `registered_device`| `VARCHAR(50)` | Hardware ID perangkat HP terdaftar milik nasabah. |
| `registered_ip` | `VARCHAR(45)` | Alamat IP jaringan terdaftar. |

### B. Tabel `transactions` (Log Transaksi Transfer)
| Nama Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `transaction_id` | `VARCHAR(30)` [PK] | ID Transaksi unik berformat `TXN-YYYYMMDD-XXXX`. |
| `sender_account` | `VARCHAR(20)` | Nomor rekening pengirim. |
| `receiver_account`| `VARCHAR(20)` | Nomor rekening penerima. |
| `amount` | `BIGINT` | Nominal dana yang dikirimkan. |
| `purpose_code` | `VARCHAR(10)` | Kode tujuan transfer ISO 20022 (e.g. `SALA`). |
| `sentinel_score` | `FLOAT` | Skor risiko FDS terhitung (0-100%). |
| `sentinel_decision`| `VARCHAR(10)` | Hasil evaluasi FDS (`ALLOW`, `REVIEW`, `BLOCK`). |
| `status` | `VARCHAR(15)` | Status transaksi akhir (`SUCCESS`, `PENDING`, `FAILED`). |
| `latitude` / `longitude` | `FLOAT` | Titik koordinat GPS lokasi pengirim saat transaksi. |

### C. Tabel `sentinel_alerts` (Alarm FDS)
| Nama Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `alert_id` | `INTEGER` [PK, Auto] | ID Alert alarm FDS. |
| `transaction_id` | `VARCHAR(30)` | Menghubungkan alarm ke transaksi terdeteksi. |
| `risk_score` | `FLOAT` | Skor risiko FDS. |
| `indicators_json` | `JSON` | List teks aturan FDS yang dilanggar (*reasons*). |
| `resolved` | `BOOLEAN` | Status peninjauan manual analis bank. |

### D. Tabel `str_drafts` (Laporan Transaksi Kepatuhan PPATK)
| Nama Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `str_id` | `VARCHAR(30)` [PK] | Nomor referensi dokumen laporan LTKM PPATK. |
| `alert_id` | `INTEGER` | Menghubungkan dokumen ke alert FDS terkait. |
| `summary_text` | `TEXT` | Narasi kronologi anomali keuangan buatan AI FDS. |
| `status` | `VARCHAR(20)` | Status laporan (`DRAFT` atau `SENT`). |

---

## 4. Rincian Data Akun Seeder (111 Akun Aktif)

Database lokal kita telah di-seed dengan total **111 akun aktif** untuk mensimulasikan lingkungan graf perbankan secara realistis.

### A. Daftar 11 Akun Inti & Blacklist Strategis
| Nomor Rekening | Nama Pemilik | Bank | Risk Profile | Saldo Awal | Peran / Deskripsi |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`1234567890`** | Billy Jonathan | Bank Kuningan | LOW | Rp 125.750.000 | Nasabah pengirim utama (uji HP). |
| **`0123456789`** | Rifki Firmansyah | Bank Kuningan | LOW | Rp 85.000.000 | Akun anggota tim 1. |
| **`1122334455`** | Desta Erlangga | Bank Kuningan | LOW | Rp 62.000.000 | Akun anggota tim 2. |
| **`5544332211`** | Aam Setiana | Bank Kuningan | LOW | Rp 74.000.000 | Akun anggota tim 3. |
| **`9876543210`** | Siti Rahma | Bank Kuningan | LOW | Rp 45.000.000 | Akun tujuan transfer domestik aman. |
| **`987654`** | Budi Santoso | Bank Kuningan | MEDIUM | Rp 15.000.000 | Rekening keledai (*Mule Account*) lokal. |
| **`9012666666`** | PT Indodax Nasional Indonesia | BCA | HIGH | Rp 15.000.000 | Rekening Escrow Indodax (Blacklist HIGH). |
| **`9012999999`** | PT Tokocrypto Indonesia | Mandiri | HIGH | Rp 25.000.000 | Rekening Escrow Tokocrypto (Blacklist HIGH). |
| **`9012123456`** | PT Binance Exchange Indonesia | CIMB Niaga | MEDIUM | Rp 50.000.000 | Rekening Escrow Binance (Medium Risk). |
| **`9012777777`** | Indodax Fraud Receiver | BRI | HIGH | Rp 10.000.000 | Akun terlarang/Scam (Blacklist HIGH). |
| **`9012888888`** | PT Pintu Kemakmuran Bersama | BNI | MEDIUM | Rp 12.000.000 | Rekening Escrow Pintu Exchange. |

### B. 100 Rekening Dummy Tambahan (`1000000001` s/d `1000000100`)
Sistem secara otomatis memproduksi 100 akun nasabah realistis Indonesia (misal: "Citra Hidayat", "Mega Permana") dengan properti matematika deterministik:
* **Nomor Rekening:** Mulai dari `1000000001` hingga `1000000100`.
* **NIK (KTP):** Dihasilkan berdasarkan kode wilayah kependudukan asli Indonesia (misal: `3171` Jakarta Pusat, `3273` Bandung).
* **Saldo Awal:** Didistribusikan secara acak matematis antara Rp 2.500.000 hingga Rp 150.000.000.
* **Risk Profile:** 90% LOW, sisanya di-set sebagai HIGH/MEDIUM untuk menyediakan variasi analisis anomali pada grafik visualisasi dashboard.

---

## 5. Use Cases & Panduan Demo Uji Coba Hackathon

Gunakan tiga skenario teruji berikut untuk mendemonstrasikan pertahanan FDS di hadapan juri:

```mermaid
sequenceDiagram
    actor U as User (HP)
    participant C as Core Banking (8080)
    participant F as FDS Engine (8000)
    participant D as Dashboard (5173)

    Note over U,D: Skenario 1: Transfer Normal (Rp 200.000 ke Siti Rahma)
    U->>C: Transfer Rp 200rb (HMAC SNAP BI signed)
    C->>F: Analyze Transaction
    F-->>C: Result: ALLOW (Score: 0%)
    C->>U: Success Receipt (Hijau) 🟢
    C->>D: Real-time Approved Log

    Note over U,D: Skenario 2: Transfer Mencurigakan (Rp 6.000.000 ke BNI 1000888888)
    U->>C: Transfer Rp 6jt
    C->>F: Analyze Transaction
    F-->>C: Result: REVIEW (Score: 50% - High Amount)
    C->>U: Pending Receipt (Kuning) 🟡
    C->>D: Real-time Flagged Alert (Unduh STR)

    Note over U,D: Skenario 3: Transfer Berbahaya (Rp 15.000.000 ke PT Indodax BCA)
    U->>C: Transfer Rp 15jt
    C->>F: Analyze Transaction
    F-->>C: Result: BLOCK (Score: 100% - Blacklist Threat)
    C->>C: Freeze Sender Account (is_blocked = True)
    C->>U: Error Popup: Transaksi Diblokir 🔴
    C->>D: Real-time Blocked Alert + Upstream Freeze Tag
```

---

## 6. Rencana Target Selanjutnya (Future Target Recommendations)

1. **Step-Up Authentication Integration:**
   Menyediakan halaman OTP khusus dan deteksi keaktifan biometrik (*Liveness Face Verification*) jika transaksi terdeteksi `REVIEW`. Hal ini meminimalisir intervensi manual analis bank dan meningkatkan kelancaran transaksi nasabah yang sah (*customer journey*).
2. **Homomorphic Encryption:**
   Menerapkan enkripsi data yang memungkinkan FDS API memproses dan memetakan model ML/GNN tanpa perlu membuka enkripsi data pribadi nasabah (menghormati privasi penuh di bawah UU Pelindungan Data Pribadi).
3. **Graph Neural Network Terpusat (DGL / PyTorch Geometric):**
   Meningkatkan *Graph Feature Engineering* saat ini ke model GNN penuh (seperti **GraphSAGE** atau **GAT**) yang dilatih secara dinamis menggunakan framework deep learning grafis guna mendeteksi rantai pencucian uang berstruktur kompleks secara otomatis.
