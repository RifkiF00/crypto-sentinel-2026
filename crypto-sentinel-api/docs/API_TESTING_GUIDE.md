# 📡 Crypto-Sentinel API — Manual Testing Documentation

**Base URL**: `http://127.0.0.1:8000`  
**Swagger UI**: http://127.0.0.1:8000/docs  
**ReDoc**: http://127.0.0.1:8000/redoc  

---

## 🚀 Cara Menjalankan Server

```powershell
# Dari direktori crypto-sentinel-api/
cd "d:\Crypto-Sentinel 2026\crypto-sentinel-api"
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

> Server butuh ~30-60 detik startup pertama (loading 308K graph)

---

## 📋 Daftar Semua Endpoint

| Method | Path | Fungsi |
|---|---|---|
| GET | `/` | Health check |
| POST | `/analyze-transaction` | **Analisis transaksi (utama)** |
| GET | `/transactions` | Daftar transaksi demo |
| GET | `/threat-intel` | Data threat intelligence |
| GET | `/statistics` | Statistik sistem |
| GET | `/validation-metrics` | Metrik performa model ML |
| GET | `/graph` | Data graph transaksi |
| GET | `/logs` | Log transaksi |
| GET | `/alerts` | Alert aktif |
| GET | `/mule-accounts` | Akun mule terdeteksi |
| GET | `/crypto-exchanges` | Data exchange kripto |
| GET | `/transaction-trend` | Tren transaksi |
| GET | `/hourly-activity` | Aktivitas per jam |
| GET | `/bank-distribution` | Distribusi antar bank |
| GET | `/blocked-patterns` | Pola yang diblokir |
| POST | `/simulate-demo` | Simulasi skenario |
| POST | `/trigger-smurfing-simulation` | Simulasi smurfing |
| POST | `/gnn-inference` | Inferensi GNN |
| GET | `/paysim-analysis` | Analisis PaySim |
| GET | `/velocity-check` | Velocity check |

---

## 🔍 Endpoint Detail

---

### 1. GET `/` — Health Check

**Test dengan curl:**
```bash
curl http://127.0.0.1:8000/
```

**Test dengan PowerShell:**
```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:8000/" -Method GET
```

**Expected Response:**
```json
{
  "status": "ok",
  "version": "0.5.0"
}
```

---

### 2. POST `/analyze-transaction` — ⭐ Analisis Transaksi (Endpoint Utama)

**Request Schema:**

| Field | Type | Required | Keterangan |
|---|---|---|---|
| `type` | string | ✅ | `PAYMENT`, `TRANSFER`, `CASH_OUT`, `CASH_IN`, `DEBIT` |
| `amount` | number | ✅ | Nominal transaksi (Rupiah) |
| `oldbalanceOrg` | number | ✅ | Saldo pengirim SEBELUM transaksi |
| `newbalanceOrig` | number | ✅ | Saldo pengirim SESUDAH transaksi |
| `destinationAccount` | string | ✅ | Nomor akun tujuan |
| `sender_account` | string | ❌ | Nomor akun pengirim (default: "A001") |
| `device_id` | string | ❌ | ID perangkat |
| `ip_address` | string | ❌ | IP address pengirim |
| `purpose_code` | string | ❌ | Kode tujuan transaksi |
| `description` | string | ❌ | Deskripsi transaksi |
| `latitude` | number | ❌ | Koordinat latitude |
| `longitude` | number | ❌ | Koordinat longitude |

---

#### 🟢 Skenario 1: Transaksi Normal (Expected: ALLOW)

```bash
curl -X POST http://127.0.0.1:8000/analyze-transaction \
  -H "Content-Type: application/json" \
  -d '{
    "type": "PAYMENT",
    "amount": 50000,
    "oldbalanceOrg": 5000000,
    "newbalanceOrig": 4950000,
    "destinationAccount": "1234567890",
    "sender_account": "0123456789",
    "device_id": "DEV-IPHONE15-PRO-MAX",
    "ip_address": "182.16.2.90",
    "purpose_code": "P001",
    "description": "Bayar tagihan listrik"
  }'
```

**PowerShell:**
```powershell
$body = @{
    type = "PAYMENT"
    amount = 50000
    oldbalanceOrg = 5000000
    newbalanceOrig = 4950000
    destinationAccount = "1234567890"
    sender_account = "0123456789"
    device_id = "DEV-IPHONE15-PRO-MAX"
    ip_address = "182.16.2.90"
    description = "Bayar tagihan listrik"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://127.0.0.1:8000/analyze-transaction" -Method POST -Body $body -ContentType "application/json"
```

**Expected:** `decision: ALLOW` | `risk_score: < 50`

---

#### 🟡 Skenario 2: Transaksi Review — Transfer nominal besar

```bash
curl -X POST http://127.0.0.1:8000/analyze-transaction \
  -H "Content-Type: application/json" \
  -d '{
    "type": "TRANSFER",
    "amount": 3000000,
    "oldbalanceOrg": 10000000,
    "newbalanceOrig": 7000000,
    "destinationAccount": "9012666666",
    "sender_account": "1234567890",
    "device_id": "DEV-IPHONE15-PRO-MAX",
    "ip_address": "182.16.2.89",
    "description": "Transfer ke rekening BCA"
  }'
```

**Expected:** `decision: REVIEW` | `risk_score: 50-79`

---

#### 🔴 Skenario 3: FRAUD — Balance Drain + TRANSFER (Expected: BLOCK)

```bash
curl -X POST http://127.0.0.1:8000/analyze-transaction \
  -H "Content-Type: application/json" \
  -d '{
    "type": "TRANSFER",
    "amount": 9500000,
    "oldbalanceOrg": 9500000,
    "newbalanceOrig": 0,
    "destinationAccount": "9012777777",
    "sender_account": "9012666666",
    "device_id": "DEV-UNKNOWN-001",
    "ip_address": "10.0.0.1",
    "description": "Transfer mendadak ke akun asing"
  }'
```

**PowerShell:**
```powershell
$body = @{
    type = "TRANSFER"
    amount = 9500000
    oldbalanceOrg = 9500000
    newbalanceOrig = 0
    destinationAccount = "9012777777"
    sender_account = "9012666666"
    device_id = "DEV-UNKNOWN-001"
    ip_address = "10.0.0.1"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://127.0.0.1:8000/analyze-transaction" -Method POST -Body $body -ContentType "application/json"
```

**Expected:** `decision: BLOCK` | `risk_score: 80-100`

---

#### 🔴 Skenario 4: FRAUD — CASH_OUT seluruh saldo

```bash
curl -X POST http://127.0.0.1:8000/analyze-transaction \
  -H "Content-Type: application/json" \
  -d '{
    "type": "CASH_OUT",
    "amount": 8000000,
    "oldbalanceOrg": 8000000,
    "newbalanceOrig": 0,
    "destinationAccount": "9012888888",
    "sender_account": "9012777777",
    "device_id": "DEV-BURNER-001",
    "ip_address": "192.168.99.1"
  }'
```

**Expected:** `decision: BLOCK` | `risk_score: 100`

---

#### 🔴 Skenario 5: Smurfing — Transfer kecil-kecil ke banyak akun

```bash
# Kirim 3x ke akun berbeda dalam waktu singkat
curl -X POST http://127.0.0.1:8000/analyze-transaction \
  -H "Content-Type: application/json" \
  -d '{
    "type": "TRANSFER",
    "amount": 4900000,
    "oldbalanceOrg": 15000000,
    "newbalanceOrig": 10100000,
    "destinationAccount": "9012999999",
    "sender_account": "9012666666",
    "device_id": "DEV-ANDROID-S24-ULTRA",
    "ip_address": "10.10.10.1",
    "description": "Pecah dana ke rekening lain"
  }'
```

---

### 3. GET `/statistics` — Statistik Sistem

```bash
curl http://127.0.0.1:8000/statistics
```

---

### 4. GET `/validation-metrics` — Metrik Model ML

```bash
curl http://127.0.0.1:8000/validation-metrics
```

**Menampilkan:** accuracy, ROC-AUC, precision, recall, F1-score model

---

### 5. GET `/transactions` — Daftar Transaksi Demo

```bash
curl http://127.0.0.1:8000/transactions
```

---

### 6. GET `/mule-accounts` — Akun Mule Terdeteksi

```bash
curl http://127.0.0.1:8000/mule-accounts
```

---

### 7. GET `/graph` — Data Graph Transaksi

```bash
curl http://127.0.0.1:8000/graph
```

---

### 8. GET `/alerts` — Alert Aktif

```bash
curl http://127.0.0.1:8000/alerts
```

---

### 9. POST `/simulate-demo` — Simulasi Skenario Demo

```bash
curl -X POST http://127.0.0.1:8000/simulate-demo \
  -H "Content-Type: application/json" \
  -d '{}'
```

---

### 10. GET `/threat-intel` — Threat Intelligence

```bash
curl http://127.0.0.1:8000/threat-intel
```

---

## 🎯 Risk Score Thresholds

| Score | Decision | Aksi |
|---|---|---|
| 0 – 59 | 🟢 **ALLOW** | Transaksi diproses normal |
| 60 – 84 | 🟡 **REVIEW** | Ditahan, perlu verifikasi manual Compliance Officer |
| 85 – 100 | 🔴 **BLOCK** | Transaksi diblokir, draft LTKM otomatis ke PPATK goAML |

---

## 🔑 Known Account Numbers (untuk testing)

| Account | Nama | Bank | Profil |
|---|---|---|---|
| `1234567890` | Billy Jonathan | Bank Kuningan | LOW risk |
| `0123456789` | Rifki Firmansyah | Bank Kuningan | LOW risk |
| `1122334455` | Desta Erlangga | Bank Kuningan | LOW risk |
| `5544332211` | Aam Setiana | Bank Kuningan | LOW risk |
| `9876543210` | Siti Rahma | Bank Kuningan | LOW risk |
| `9012666666` | PT Indodax | BCA | Exchange |
| `9012999999` | PT Tokocrypto | Mandiri | Exchange |
| `9012777777` | **Indodax Fraud Receiver** | BRI | ⚠️ HIGH risk |
| `9012888888` | PT Pintu | BNI | Exchange |

---

## 🔗 Testing via Swagger UI (Cara Paling Mudah!)

1. Buka browser: **http://127.0.0.1:8000/docs**
2. Klik endpoint yang ingin di-test
3. Klik **"Try it out"**
4. Isi JSON payload
5. Klik **"Execute"**
6. Lihat response di bawah

---

## ⚠️ Troubleshooting

| Error | Penyebab | Solusi |
|---|---|---|
| `Connection refused` | Server belum jalan | Jalankan uvicorn dulu |
| `422 Unprocessable Entity` | Field required kurang | Cek field wajib: `type`, `amount`, `oldbalanceOrg`, `newbalanceOrig`, `destinationAccount` |
| `sklearn version warning` | Beda versi scikit-learn | Tidak fatal — model tetap berjalan |
| Startup lambat | Loading 308K graph | Normal ~30-60 detik, tunggu saja |
