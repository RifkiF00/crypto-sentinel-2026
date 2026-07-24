# 05 - Conceptual Entity Relationship Diagram (ERD)

## 1. Overview Konseptual Entitas
Sistem Crypto-Sentinel 2026 berpusat pada hubungan antara **Rekening Nasabah (Accounts)**, **Transaksi Financial (Transactions)**, **Ancaman Intelijen (Threat Intel)**, **Alert FDS (Sentinel Alerts)**, dan **Laporan Keuangan Mencurigakan (STR Drafts)**.

## 2. Diagram ERD Konseptual (Mermaid)

```mermaid
erDiagram
    ACCOUNT ||--o{ TRANSACTION : "mengirim (sender)"
    ACCOUNT ||--o{ TRANSACTION : "menerima (receiver)"
    TRANSACTION ||--o| SENTINEL_ALERT : "memicu"
    SENTINEL_ALERT ||--o| STR_DRAFT : "diteruskan ke"
    THREAT_INTEL ||--o{ TRANSACTION : "mencocokkan"
    ACCOUNT ||--o{ GNN_EMBEDDING : "memiliki representasi graf"

    ACCOUNT {
        string account_id PK
        string owner_name
        float balance
        string risk_profile
        boolean is_blocked
    }

    TRANSACTION {
        string transaction_id PK
        string sender_account FK
        string receiver_account FK
        float amount
        float sentinel_score
        string sentinel_decision
        string status
    }

    SENTINEL_ALERT {
        string alert_id PK
        string transaction_id FK
        float risk_score
        json indicators
        boolean resolved
    }

    STR_DRAFT {
        string str_id PK
        string alert_id FK
        string summary_text
        string status
    }

    THREAT_INTEL {
        string account_id PK
        string risk_category
        string risk_level
    }

    GNN_EMBEDDING {
        string account_id PK
        vector embedding_vector
        float pagerank_score
    }
```

## 3. Penjelasan Hubungan Entitas
1. **Account -> Transaction**: Satu rekening nasabah dapat melakukan banyak transaksi baik sebagai pengirim (*sender*) maupun penerima (*receiver*).
2. **Transaction -> Sentinel Alert**: Transaksi yang ditandai berrisiko (`REVIEW` atau `BLOCK`) akan menghasilkan 1 baris entitas Alert.
3. **Sentinel Alert -> STR Draft**: Alert dengan keputusan `BLOCK` secara otomatis membuat 1 draft laporan STR (LTKM).
4. **Threat Intel -> Transaction**: Rekening tujuan transaksi dicocokkan dengan entitas intelijen ancaman (*blacklist/mule*).
5. **Account -> GNN Embedding**: Setiap entitas rekening diekstrak fitur grafisnya menjadi vektor embedding 128-dimensi.
