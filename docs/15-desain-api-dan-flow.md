# 15 - RESTful API Specification & Sequence Flow

## 1. Daftar Utama Endpoint API

### A. Endpoint Sentinel FDS AI (`http://localhost:8000`)

#### `POST /analyze-transaction`
Mengevaluasi transaksi secara real-time.
* **Request Body**:
  ```json
  {
    "type": "TRANSFER",
    "amount": 60000000.0,
    "oldbalanceOrg": 500000000.0,
    "newbalanceOrig": 440000000.0,
    "destinationAccount": "8012000005",
    "sender_account": "0123456789",
    "ip_address": "180.252.120.45",
    "purpose_code": "SALA"
  }
  ```
* **Response Body**:
  ```json
  {
    "transaction_id": "TXN-20260724-F39046",
    "risk_score": 65.0,
    "risk_level": "MEDIUM",
    "decision": "REVIEW",
    "reasons": [
      "Rekening penerima (Budi Santoso) terindikasi sebagai Mule Relay Transit"
    ]
  }
  ```

#### `POST /gnn-inference`
Menjalankan analisis topologi graf GNN untuk menemukan simpul anomali.
* **Response Body**:
  ```json
  {
    "message": "GNN Inference completed",
    "total_anomalies_detected": 4,
    "anomalies": [
      {
        "account_id": "9012123456",
        "account_name": "PT Binance Exchange Indonesia",
        "anomaly_score": 99.2,
        "role": "Offshore Layering Node",
        "risk_level": "CRITICAL"
      }
    ]
  }
  ```

---

### B. Endpoint Core Banking SNAP BI (`http://localhost:8080`)

#### `POST /api/v1/bri/transfer`
Endpoint transfer berstandar SNAP BI Bank Indonesia.

#### `GET /api/v1/bri/transactions`
Mengambil seluruh riwayat transaksi dari Database SQLite `expresso.db`.

#### `POST /api/v1/bri/simulate-smurfing`
Memicu 5–10 transaksi pemecahan dana beruntun secara otomatis untuk simulasi live demo.
