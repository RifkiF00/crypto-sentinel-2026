# 06 - Logical Database Model (Logical ERD)

## 1. Spesifikasi Relasional Ter-Normalisasi (3NF)

### A. Tabel `accounts`
* `account_id` (VARCHAR(32), Primary Key)
* `national_id` (VARCHAR(16), Not Null)
* `owner_name` (VARCHAR(100), Not Null)
* `balance` (DECIMAL(18,2), Default 0.00)
* `risk_profile` (VARCHAR(20), Default 'LOW')
* `is_active` (BOOLEAN, Default True)
* `is_blocked` (BOOLEAN, Default False)
* `registered_device` (VARCHAR(100))
* `registered_ip` (VARCHAR(45))
* `created_at` (TIMESTAMP)

### B. Tabel `transactions`
* `transaction_id` (VARCHAR(64), Primary Key)
* `sender_account` (VARCHAR(32), Foreign Key -> accounts.account_id)
* `receiver_account` (VARCHAR(32), Foreign Key -> accounts.account_id)
* `amount` (DECIMAL(18,2), Not Null)
* `purpose_code` (VARCHAR(10))
* `description` (TEXT)
* `destination_type` (VARCHAR(20))
* `ip_address` (VARCHAR(45))
* `country_code` (VARCHAR(5))
* `latitude` (FLOAT)
* `longitude` (FLOAT)
* `sentinel_score` (FLOAT)
* `sentinel_decision` (VARCHAR(20))
* `status` (VARCHAR(20), Default 'PENDING')
* `timestamp` (TIMESTAMP, Index)

### C. Tabel `sentinel_alerts`
* `alert_id` (VARCHAR(64), Primary Key)
* `transaction_id` (VARCHAR(64), Foreign Key -> transactions.transaction_id)
* `risk_score` (FLOAT, Not Null)
* `indicators_json` (JSON / TEXT)
* `shap_values_json` (JSON / TEXT)
* `resolved` (BOOLEAN, Default False, Index)
* `created_at` (TIMESTAMP)

### D. Tabel `str_drafts`
* `str_id` (VARCHAR(64), Primary Key)
* `alert_id` (VARCHAR(64), Foreign Key -> sentinel_alerts.alert_id)
* `summary_text` (TEXT)
* `risk_factors` (JSON / TEXT)
* `status` (VARCHAR(20), Default 'DRAFT')
* `analyst_id` (VARCHAR(50))
* `created_at` (TIMESTAMP)

---

## 2. Kardinalitas dan Integritas Relasi
* `accounts (1)` ke `transactions (N)` via `sender_account` (ON DELETE RESTRICT)
* `accounts (1)` ke `transactions (N)` via `receiver_account` (ON DELETE RESTRICT)
* `transactions (1)` ke `sentinel_alerts (0..1)` via `transaction_id` (ON DELETE CASCADE)
* `sentinel_alerts (1)` ke `str_drafts (0..1)` via `alert_id` (ON DELETE CASCADE)
