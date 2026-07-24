# 16 - Implementation Roadmap & Scaling Strategy

## 1. Roadmap Pengembangan (Phase 1 s.d Phase 4)

```
[ Phase 1: Prototype & PoC ] ──► [ Phase 2: Pilot Banking Integration ]
  - Rule Engine & ML Pipeline       - SNAP BI Gateway Production Sync
  - SQLite WAL Database             - PostgreSQL + pgvector Migration
  - React Dashboard Demo            - Latency Optimization < 30ms
          │
          ▼
[ Phase 4: Enterprise Scale ] ◄── [ Phase 3: Regulatory & PPATK Sync ]
  - Distributed GNN Inference       - Auto-submission XML to PPATK API
  - Cross-Bank Mule Sharing         - OJK Regulatory Sandbox Approval
```

## 2. Rincian Fasa Implementasi

### Phase 1: Prototype & Proof-of-Concept (Selesai - Current State)
* Model Random Forest (99.8% Accuracy) & GNN Engine terintegrasi.
* Dasbor Web React Vite & Mobile App Flutter terhubung real-time.
* Simulasi Smurfing 1-Click & Ekspor LTKM/STR PDF.

### Phase 2: Pilot Banking Integration & Performance Hardening (Q3 2026)
* Migrasi database dari SQLite ke PostgreSQL 15 Cluster dengan pengindeksan `pgvector`.
* Integrasi *Hardware Security Module (HSM)* untuk enkripsi kunci SNAP BI.
* Optimasi waktu respon FDS dari $45\text{ms}$ menjadi $\le 20\text{ms}$.

### Phase 3: Regulatory & PPATK Automated Gateway (Q4 2026)
* Pembukaan saluran aman VPN/IPSec ke Sistem Informasi Pengguna Jasa PPATK (goAML).
* Otomatisasi pengiriman berkas XML LTKM tanpa intervensi manual analis.

### Phase 4: National Cross-Bank Mule Sharing Network (2027)
* Konsorsium berbagai bank nasional untuk saling berbagi vektor embedding rekening keledai tanpa mengorbankan privasi data nasabah (*Federated Graph Learning*).
