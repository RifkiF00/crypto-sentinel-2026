# 13 - System Architecture & Deployment Topology

## 1. Arsitektur Komponen Microservices

```
                       ┌─────────────────────────┐
                       │  Mobile Banking Flutter │
                       └────────────┬────────────┘
                                    │ (REST / JSON)
                                    ▼
                       ┌─────────────────────────┐
                       │ Core Banking Gateway    │
                       │ (Expresso API Port 8080)│
                       └────────────┬────────────┘
                                    │
                  ┌─────────────────┴─────────────────┐
                  │ (HTTP / Async)                    │ (SQLite Sync)
                  ▼                                   ▼
┌───────────────────────────────────┐    ┌───────────────────────────┐
│ Crypto-Sentinel FDS Engine        │    │ Core Banking DB           │
│ (FastAPI Server Port 8000)        │    │ (expresso.db)             │
│                                   │    └───────────────────────────┘
│  ├─ Rule Engine (rule_engine.py)  │
│  ├─ RandomForest Model (rf.pkl)   │
│  ├─ GNN Engine (NetworkX/PyG)     │
│  └─ Threat Intel Filter           │
└─────────────────┬─────────────────┘
                  │ (REST / Polling Sync)
                  ▼
┌───────────────────────────────────┐
│ React Vite FDS Dashboard          │
│ (Frontend Port 5173)              │
└───────────────────────────────────┘
```

## 2. Rincian Port Service & Teknologi
1. **Core Banking API (`expresso-api`)**:
   * Port: `8080`
   * Tech Stack: Python 3.10, FastAPI, SQLAlchemy, Uvicorn.
   * Fungsi: Simulasi API Gateway Bank Indonesia (SNAP BI).
2. **Sentinel FDS AI Engine (`crypto-sentinel-api`)**:
   * Port: `8000`
   * Tech Stack: Python 3.10, Scikit-Learn, NetworkX, Pandas, NumPy.
   * Fungsi: Model Machine Learning & GNN Inference.
3. **FDS Compliance Dashboard (`dashboard-crypto-sentinel`)**:
   * Port: `5173`
   * Tech Stack: React 18, Vite, Framer Motion, Lucide Icons, Recharts.
   * Fungsi: Dasbor visualisasi tim Kepatuhan.
4. **Mobile Banking Client (`crypto-sentinel-bank-kng`)**:
   * Platform: Flutter / Dart (Android & iOS).
   * Fungsi: Simulasi transaksi mobile nasabah real-time.
