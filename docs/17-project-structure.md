# 17 - Project Structure & Directory Layout

```text
Crypto-Sentinel 2026/
├── crypto-sentinel-api/          # Engine AI/ML FastAPI Server (Port 8000)
│   ├── app/
│   │   ├── main.py               # Application entry point & API routes
│   │   ├── rule_engine.py        # Rule Engine (ISO 20022 & Behavioral Check)
│   │   └── test_api.py           # Unit tests
│   ├── data/
│   │   ├── paysim_sample.csv     # Training dataset
│   │   └── threat_intel.csv      # Blacklist threat intelligence
│   ├── models/
│   │   └── gnn_rf_pipeline.pkl   # Serialized ML Model Pipeline
│   └── train_model.py            # Model training & metrics exporter
│
├── expresso-api/                 # Core Banking API Gateway (Port 8080)
│   ├── main.py                   # FastAPI server entry point
│   ├── seeder.py                 # SQLite 111-Accounts generator
│   ├── simulate_smurfing.py      # Standalone Smurfing pattern script
│   ├── expresso.db               # SQLite Database File
│   ├── models/
│   │   └── db_models.py          # SQLAlchemy ORM Data Models
│   └── routers/
│       └── transfers.py          # SNAP BI Transfer Routes
│
├── dashboard-crypto-sentinel/    # Compliance Analyst Web Dashboard (Port 5173)
│   ├── src/
│   │   ├── App.jsx               # Main React Application & Polling Engine
│   │   ├── components/
│   │   │   ├── PageViews.jsx     # Live Monitoring & Alerts Views
│   │   │   └── GNNVisualization.jsx # Interactive GNN Topology Graph
│   │   ├── data/
│   │   │   └── mockData.js       # Dynamic metrics & fallbacks
│   │   └── services/
│   │       └── api.js            # Unified API Client Service
│   └── package.json
│
├── crypto-sentinel-bank-kng/     # Mobile Banking Flutter Client
│   ├── lib/
│   │   ├── main.dart             # Flutter app entry point
│   │   ├── data/
│   │   │   └── api_service.dart  # Core Banking HTTP Client
│   │   └── screens/
│   │       ├── transfer_screen.dart # Mobile Transfer Form UI
│   │       └── receipt_screen.dart  # Transaction Receipt UI
│   └── pubspec.yaml
│
└── docs/                         # Project Architecture Documentation
    ├── 00-project-overview.md
    ├── 01-problem-analysis.md
    └── ... (19 Documentation Files)
```
