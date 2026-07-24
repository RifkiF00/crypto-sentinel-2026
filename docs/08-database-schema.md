# 08 - Full SQL Database DDL Schema

```sql
-- ================================================================
-- CRYPTO-SENTINEL 2026 DATABASE SCHEMA (DDL)
-- Target DBMS: SQLite 3 / PostgreSQL 15+
-- ================================================================

-- 1. TABEL REKENING NASABAH (ACCOUNTS)
CREATE TABLE IF NOT EXISTS accounts (
    account_id VARCHAR(32) PRIMARY KEY,
    national_id VARCHAR(16) NOT NULL,
    owner_name VARCHAR(100) NOT NULL,
    balance DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    risk_profile VARCHAR(20) NOT NULL DEFAULT 'LOW',
    is_active BOOLEAN NOT NULL DEFAULT 1,
    is_blocked BOOLEAN NOT NULL DEFAULT 0,
    registered_device VARCHAR(100),
    registered_ip VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABEL TRANSAKSI FINANCIAL (TRANSACTIONS)
CREATE TABLE IF NOT EXISTS transactions (
    transaction_id VARCHAR(64) PRIMARY KEY,
    sender_account VARCHAR(32) NOT NULL,
    receiver_account VARCHAR(32) NOT NULL,
    amount DECIMAL(18,2) NOT NULL,
    purpose_code VARCHAR(10) DEFAULT 'SALA',
    description TEXT,
    destination_type VARCHAR(20) DEFAULT 'DOMESTIC',
    ip_address VARCHAR(45),
    country_code VARCHAR(5) DEFAULT 'ID',
    latitude FLOAT DEFAULT -6.2,
    longitude FLOAT DEFAULT 106.8,
    sentinel_score FLOAT,
    sentinel_decision VARCHAR(20),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_account) REFERENCES accounts(account_id),
    FOREIGN KEY (receiver_account) REFERENCES accounts(account_id)
);

-- 3. TABEL ALERT FDS (SENTINEL ALERTS)
CREATE TABLE IF NOT EXISTS sentinel_alerts (
    alert_id VARCHAR(64) PRIMARY KEY,
    transaction_id VARCHAR(64) NOT NULL UNIQUE,
    risk_score FLOAT NOT NULL,
    indicators_json TEXT,
    shap_values_json TEXT,
    resolved BOOLEAN NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (transaction_id) REFERENCES transactions(transaction_id) ON DELETE CASCADE
);

-- 4. TABEL DRAFT LAPORAN STR/LTKM (STR DRAFTS)
CREATE TABLE IF NOT EXISTS str_drafts (
    str_id VARCHAR(64) PRIMARY KEY,
    alert_id VARCHAR(64) NOT NULL UNIQUE,
    summary_text TEXT NOT NULL,
    risk_factors TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    analyst_id VARCHAR(50) DEFAULT 'SYSTEM',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (alert_id) REFERENCES sentinel_alerts(alert_id) ON DELETE CASCADE
);

-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_tx_sender ON transactions(sender_account);
CREATE INDEX IF NOT EXISTS idx_tx_receiver ON transactions(receiver_account);
CREATE INDEX IF NOT EXISTS idx_tx_timestamp ON transactions(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_resolved ON sentinel_alerts(resolved);
```
