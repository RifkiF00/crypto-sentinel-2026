-- ================================================================
-- Schema SQL Database untuk Core Banking (expresso-api)
-- Berdasarkan Blueprint Crypto-Sentinel 2026 (KYC, NIK, Device, & IP)
-- Support: PostgreSQL, MySQL, & SQLite
-- ================================================================

-- 1. Tabel Accounts (Akun Nasabah Core Banking dengan NIK, Device Fingerprint, & IP Tepercaya)
CREATE TABLE IF NOT EXISTS accounts (
    account_id VARCHAR(20) PRIMARY KEY,
    national_id VARCHAR(16) UNIQUE NOT NULL, -- NIK KTP Nasabah (KYC & UU PDP Compliance)
    owner_name VARCHAR(100) NOT NULL,        -- Nama lengkap nasabah resmi
    balance BIGINT DEFAULT 0,                 -- Saldo Rupiah (IDR)
    risk_profile VARCHAR(10) DEFAULT 'LOW',   -- LOW | MEDIUM | HIGH
    is_active BOOLEAN DEFAULT TRUE,           -- Status rekening aktif / pasif
    is_blocked BOOLEAN DEFAULT FALSE,         -- Status pemblokiran otomatis oleh Sentinel
    registered_device VARCHAR(50),            -- Device Fingerprint tepercaya (Deteksi Device Anomaly)
    registered_ip VARCHAR(45),                -- IP Address tepercaya nasabah (Deteksi Impossible Travel)
    last_activity TIMESTAMP NULL,            -- Waktu transaksi terakhir
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabel Transactions (Riwayat Transaksi Banking)
CREATE TABLE IF NOT EXISTS transactions (
    transaction_id VARCHAR(30) PRIMARY KEY,
    sender_account VARCHAR(20) NOT NULL,
    receiver_account VARCHAR(20) NOT NULL,
    amount BIGINT NOT NULL,
    purpose_code VARCHAR(10),
    description TEXT,
    destination_type VARCHAR(20),
    ip_address VARCHAR(45),
    country_code VARCHAR(5),
    latitude FLOAT,
    longitude FLOAT,
    timestamp TIMESTAMP NOT NULL,
    sentinel_score FLOAT,
    sentinel_decision VARCHAR(10),
    status VARCHAR(15) DEFAULT 'PENDING'
);

-- 3. Tabel Sentinel Alerts (Alert Hasil Analisis Crypto-Sentinel)
CREATE TABLE IF NOT EXISTS sentinel_alerts (
    alert_id SERIAL PRIMARY KEY,
    transaction_id VARCHAR(30),
    risk_score FLOAT,
    indicators_json JSON,
    shap_values_json JSON,
    cluster_id VARCHAR(30),
    resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabel STR Drafts (Suspicious Transaction Report Drafts)
CREATE TABLE IF NOT EXISTS str_drafts (
    str_id VARCHAR(30) PRIMARY KEY,
    alert_id BIGINT,
    summary_text TEXT,
    risk_factors JSON,
    status VARCHAR(20) DEFAULT 'DRAFT',
    analyst_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================
-- Initial Seed Data: Akun Utama Tim & Threat Intelligence
-- ================================================================
INSERT INTO accounts (account_id, national_id, owner_name, balance, risk_profile, is_active, is_blocked, registered_device, registered_ip)
VALUES
    ('1234567890', '3171092802092101', 'Billy Jonathan', 125750000, 'LOW', TRUE, FALSE, 'DEV-IPHONE15-PRO-MAX', '182.16.2.89'),
    ('0123456789', '3171092802092102', 'Rifki Firmansyah', 85000000, 'LOW', TRUE, FALSE, 'DEV-ANDROID-S24-ULTRA', '182.16.2.90'),
    ('1122334455', '3171092802092103', 'Desta Erlangga', 62000000, 'LOW', TRUE, FALSE, 'DEV-IPHONE14-PRO', '182.16.2.91'),
    ('5544332211', '3171092802092104', 'Aam Setiana', 74000000, 'LOW', TRUE, FALSE, 'DEV-MACBOOK-AIR-M3', '182.16.2.92'),
    ('9876543210', '3171092802092105', 'Siti Rahma', 45000000, 'LOW', TRUE, FALSE, 'DEV-XIAOMI13-PRO', '180.252.120.45'),
    ('987654', '3171092802099901', 'Budi Santoso (Mule)', 15000000, 'MEDIUM', TRUE, FALSE, 'DEV-UNKNOWN-ANDROID-99', '36.85.15.102'),
    ('C666666666', '3171092802099902', 'Indodax Mule Account', 15000000, 'HIGH', TRUE, FALSE, 'DEV-VPN-PROXY-01', '103.28.57.12'),
    ('C999999999', '3171092802099903', 'Tokocrypto Mixer Account', 25000000, 'HIGH', TRUE, FALSE, 'DEV-MIXER-BOT-02', '45.12.89.201'),
    ('C123456789', '3171092802099904', 'Binance Exchange Account', 50000000, 'MEDIUM', TRUE, FALSE, 'DEV-API-GATEWAY-BINANCE', '52.198.112.4'),
    ('C777777777', '3171092802099905', 'Indodax Fraud Receiver', 10000000, 'HIGH', TRUE, FALSE, 'DEV-SUSPICIOUS-DEVICE-77', '185.220.101.5'),
    ('C888888888', '3171092802099906', 'Pintu Layering Account', 12000000, 'MEDIUM', TRUE, FALSE, 'DEV-LAYERING-NODE-88', '194.26.29.90')
ON CONFLICT (account_id) DO NOTHING;
