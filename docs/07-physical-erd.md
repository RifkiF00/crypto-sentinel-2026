# 07 - Physical Database Architecture & Indexing Strategy

## 1. Implementasi Fisik DBMS
* **Development / Prototype**: SQLite 3 dengan mode *Write-Ahead Logging (WAL Mode)* untuk eksekusi read/write paralel tanpa *locking contention*.
* **Production**: PostgreSQL 15+ dengan ekstensi `pgvector` untuk penyimpanan vektor embedding GNN dan *Partitioning by Range (timestamp)* pada tabel transaksi.

## 2. Strategi Pengindeksan Database (Indexing Strategy)

### A. Index Utama Tabel `transactions`
```sql
CREATE INDEX idx_tx_sender_timestamp ON transactions(sender_account, timestamp DESC);
CREATE INDEX idx_tx_receiver_timestamp ON transactions(receiver_account, timestamp DESC);
CREATE INDEX idx_tx_status_decision ON transactions(status, sentinel_decision);
```
* **Fungsi**: Mempercepat query deteksi *velocity* (pemecahan transaksi beruntun) dan pencarian riwayat transaksi nasabah dalam kurun waktu 24 jam / 7 hari.

### B. Index Utama Tabel `sentinel_alerts`
```sql
CREATE INDEX idx_alerts_unresolved ON sentinel_alerts(resolved, risk_score DESC);
CREATE UNIQUE INDEX idx_alerts_tx_id ON sentinel_alerts(transaction_id);
```
* **Fungsi**: Mempercepat pemuatan alert yang belum diselesaikan (*active threats*) pada Dasbor Web.

## 3. Physical Storage & Partitioning Scheme (PostgreSQL Production)

```
[ Primary Database Cluster ]
        │
        ├── Partition 2026_Q1 (transactions_2026q1)
        ├── Partition 2026_Q2 (transactions_2026q2)
        ├── Partition 2026_Q3 (transactions_2026q3)
        └── Partition 2026_Q4 (transactions_2026q4)
```

## 4. Parameter Konfigurasi Performa (WAL Mode)
```sql
PRAGMA journal_mode=WAL;
PRAGMA synchronous=NORMAL;
PRAGMA cache_size=-64000; -- 64MB Cache
PRAGMA foreign_keys=ON;
```
