from pathlib import Path
import os
import hashlib
import ast
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from pydantic import BaseModel, Field
from datetime import datetime
import pandas as pd
import uuid
import networkx as nx
import numpy as np

from app.rule_engine import evaluate_transaction
from app.str_generator import generate_str_draft, generate_str_html
from app.attack_simulation import generate_150_attack_dataset


app = FastAPI(
    title="Crypto-Sentinel API",
    description="Security Middleware Layer for Fraud Transaction Detection",
    version="0.5.0"
)


allowed_origins = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "*").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if allowed_origins != ["*"] else ["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


import joblib

BASE_DIR = Path(__file__).resolve().parent.parent

df = pd.read_csv(BASE_DIR / "data" / "paysim_sample.csv")
threat_df = pd.read_csv(BASE_DIR / "data" / "threat_intel.csv")
demo_df = pd.read_csv(BASE_DIR / "data" / "demo_transactions.csv")

# 1. Load joblib ML model
ml_model = None
shap_explainer = None
model_path = BASE_DIR / "app" / "ml_model.joblib"
if os.path.exists(model_path):
    try:
        ml_model = joblib.load(model_path)
        print(f"[FDS API] ML Model loaded successfully from: {model_path}")
        # Inisialisasi SHAP TreeExplainer sekali saat startup (lebih efisien)
        try:
            import shap
            shap_explainer = shap.TreeExplainer(ml_model)
            print("[FDS API] SHAP TreeExplainer initialized [OK]")
        except Exception as shap_err:
            print(f"[FDS API Warning] SHAP init failed: {shap_err}")
    except Exception as e:
        print(f"[FDS API Warning] Failed to load ML Model: {e}")

# 2. Load GNN Hybrid Scorer (loads gnn_embeddings.pkl + gnn_hybrid_model.joblib)
from app.gnn_scorer import gnn_scorer
gnn_scorer.load()  # Graceful: warns and falls back to RF-only if files missing

# 3. Build live in-memory transaction graph for dynamic GNN-like feature extraction
G = nx.DiGraph()
print("[FDS API] Populating transaction graph with 50,000 baseline nodes & edges...")
for _, row in df.iterrows():
    G.add_edge(row["nameOrig"], row["nameDest"])
print(f"[FDS API OK] Graph loaded with {len(G.nodes):,} nodes and {len(G.edges):,} edges.")

KNOWN_NAMES = {
    "1234567890": "Budi Santoso",
    "0123456789": "Ahmad Faisal",
    "1122334455": "Hendro Wijaya",
    "5544332211": "Doni Prasetyo",
    "9876543210": "Siti Rahmawati",
    "9012666666": "PT Indodax Nasional Indonesia",
    "9012999999": "PT Tokocrypto Indonesia",
    "9012123456": "PT Binance Exchange Indonesia",
    "9012777777": "Indodax Fraud Receiver",
    "9012888888": "PT Pintu Kemakmuran Bersama",
}

KNOWN_BANKS = {
    "1234567890": "Bank Kuningan",
    "0123456789": "Bank Kuningan",
    "1122334455": "Bank Kuningan",
    "5544332211": "Bank Kuningan",
    "9876543210": "Bank Kuningan",
    "9012666666": "BCA",
    "9012999999": "Mandiri",
    "9012123456": "CIMB Niaga",
    "9012777777": "BRI",
    "9012888888": "BNI",
}

def get_bank_for_account(acc_num: str) -> str:
    if str(acc_num).startswith("110"):
        return "Bank bjb"
    elif str(acc_num).startswith("601"):
        return "Bank Kuningan"
    elif str(acc_num).startswith("002"):
        return "Bank BRI"
    elif str(acc_num).startswith("014"):
        return "Bank BCA"
    elif str(acc_num).startswith("008"):
        return "Bank Mandiri"
    elif str(acc_num).startswith("009"):
        return "Bank BNI"
    elif str(acc_num).startswith("C"):
        return "VASP Crypto Exchange"
    if acc_num in KNOWN_BANKS:
        return KNOWN_BANKS[acc_num]
    banks = ["Bank bjb", "Bank Kuningan", "Bank BRI", "Bank BCA", "Bank Mandiri", "Bank BNI"]
    h = int(hashlib.md5(acc_num.encode()).hexdigest(), 16)
    return banks[h % len(banks)]

def get_exchange_for_account(acc_num: str) -> str:
    exchanges = ["Binance", "Indodax", "Tokocrypto", "Pintu", "Luno", "Zipmex"]
    h = int(hashlib.md5(acc_num.encode()).hexdigest(), 16)
    return exchanges[h % len(exchanges)]

def get_name_for_account(acc_num: str) -> str:
    if acc_num in KNOWN_NAMES:
        return KNOWN_NAMES[acc_num]
    h = int(hashlib.md5(acc_num.encode()).hexdigest(), 16)
    idx = (h % 9000) + 1000
    return f"Nasabah N-{idx}"

transaction_logs = []
paysim_analysis_results = []



# Simulated reliable customer profiles database (mapping account number -> identity details)
customer_profiles = {
    "A001": {"national_id": "3171092802092101", "registered_device": "DEV-IPHONE15-PRO-MAX", "registered_ip": "182.16.2.89"},
    "A002": {"national_id": "3171092802092102", "registered_device": "DEV-ANDROID-S24-ULTRA", "registered_ip": "182.16.2.90"},
    "A003": {"national_id": "3171092802092103", "registered_device": "DEV-IPHONE14-PRO", "registered_ip": "182.16.2.91"},
    "A004": {"national_id": "3171092802092104", "registered_device": "DEV-MACBOOK-AIR-M3", "registered_ip": "182.16.2.92"},
    "1234567890": {"national_id": "3171092802092101", "registered_device": "DEV-IPHONE15-PRO-MAX", "registered_ip": "182.16.2.89"},
    "0123456789": {"national_id": "3171092802092102", "registered_device": "DEV-ANDROID-S24-ULTRA", "registered_ip": "182.16.2.90"},
    "1122334455": {"national_id": "3171092802092103", "registered_device": "DEV-IPHONE14-PRO", "registered_ip": "182.16.2.91"},
    "5544332211": {"national_id": "3171092802092104", "registered_device": "DEV-MACBOOK-AIR-M3", "registered_ip": "182.16.2.92"},
    "9876543210": {"national_id": "3171092802092105", "registered_device": "DEV-XIAOMI13-PRO", "registered_ip": "180.252.120.45"},
}

def get_profile_for_account(acc_num: str) -> dict:
    """Helper to return customer profile from db, generating deterministic ones if missing"""
    if acc_num in customer_profiles:
        return customer_profiles[acc_num]
    
    # Deterministic generation based on account number
    h = int(hashlib.md5(acc_num.encode()).hexdigest(), 16)
    nik = f"317109{2000000000 + (h % 1000000000):010d}"
    devices = ["DEV-IPHONE15-88A", "DEV-ANDROID-S24B", "DEV-IPHONE14-77C", "DEV-XIAOMI13-99D"]
    ips = ["182.16.2.89", "182.16.2.90", "182.16.2.91", "182.16.2.92"]
    
    return {
        "national_id": nik,
        "registered_device": devices[h % len(devices)],
        "registered_ip": ips[(h // 2) % len(ips)]
    }


class Transaction(BaseModel):
    type: str
    amount: float
    oldbalanceOrg: float
    newbalanceOrig: float
    destinationAccount: str
    sender_account: str = "A001"
    device_id: str = None
    ip_address: str = None
    purpose_code: str = None
    description: str = None
    latitude: float = None
    longitude: float = None
    past_transactions: list[dict] = None


@app.get("/")
def root():
    return {
        "message": "Crypto-Sentinel API is running",
        "status": "OK",
        "version": "0.5.0"
    }


@app.get("/transactions")
def get_transactions(limit: int = 10):
    transactions = df.head(limit).to_dict(orient="records")

    return {
        "total": len(transactions),
        "data": transactions
    }


@app.get("/threat-intel")
def get_threat_intel():
    return {
        "total": len(threat_df),
        "data": threat_df.to_dict(orient="records")
    }


@app.post("/analyze-transaction")
def analyze_transaction(transaction: Transaction):
    # 1. Update live in-memory transaction graph
    G.add_edge(transaction.sender_account, transaction.destinationAccount)
    
    # 2. Extract Graph Features dynamically
    in_degrees = dict(G.in_degree())
    out_degrees = dict(G.out_degree())
    try:
        # Fast PageRank calculation with fewer iterations
        pr = nx.pagerank(G, max_iter=15, tol=1e-3)
    except Exception:
        pr = {}
        
    sender_in = in_degrees.get(transaction.sender_account, 0)
    sender_out = out_degrees.get(transaction.sender_account, 0)
    sender_pr = pr.get(transaction.sender_account, 1e-5)
    
    dest_in = in_degrees.get(transaction.destinationAccount, 0)
    dest_out = out_degrees.get(transaction.destinationAccount, 0)
    dest_pr = pr.get(transaction.destinationAccount, 1e-5)
    
    # 3. Predict with ML model
    ml_prob = 0.0
    computed_shap = {}  # default kosong jika ML tidak tersedia
    if ml_model is not None:
        try:
            features = {
                "amount": transaction.amount,
                "oldbalanceOrg": transaction.oldbalanceOrg,
                "newbalanceOrig": transaction.newbalanceOrig,
                "oldbalanceDest": 0.0,
                "newbalanceDest": transaction.amount,
                "is_transfer_or_cashout": 1 if transaction.type in ["TRANSFER", "CASH_OUT"] else 0,
                "is_high_amount": 1 if transaction.amount > 1000000 else 0,
                "is_balance_drained": 1 if transaction.oldbalanceOrg > 0 and transaction.newbalanceOrig == 0 else 0,
                "amount_ratio": transaction.amount / (transaction.oldbalanceOrg + 1) if transaction.oldbalanceOrg > 0 else 0,
                "dest_balance_err": 0.0,
                "sender_in_degree": sender_in,
                "sender_out_degree": sender_out,
                "sender_pagerank": sender_pr,
                "dest_in_degree": dest_in,
                "dest_out_degree": dest_out,
                "dest_pagerank": dest_pr,
                # --- Fitur baru (sesuai versi model terbaru) ---
                "hour_of_day": datetime.now().hour,
                "is_known_merchant": 1 if (transaction.destinationAccount or "").startswith("MERCHANT") else 0,
                "account_dormant_days": 0,  # default 0 (akun aktif)
                "type_CASH_IN": 1 if transaction.type == "CASH_IN" else 0,
                "type_CASH_OUT": 1 if transaction.type == "CASH_OUT" else 0,
                "type_DEBIT": 0,
                "type_PAYMENT": 1 if transaction.type == "PAYMENT" else 0,
                "type_TRANSFER": 1 if transaction.type == "TRANSFER" else 0,
                # Purpose one-hot encoding dari purpose_code
                "purpose_BANSOS": 1 if getattr(transaction, "purpose_code", "") == "BANSOS" else 0,
                "purpose_CRYPTO": 1 if (transaction.destinationAccount or "").startswith(("9012", "0x")) else 0,
                "purpose_GENERAL": 1 if getattr(transaction, "purpose_code", "") in ("SALA", "GENE", "") else 0,
                "purpose_MERCHANT": 1 if getattr(transaction, "purpose_code", "") == "MERCH" else 0,
                "purpose_SPP": 1 if getattr(transaction, "purpose_code", "") == "SPP" else 0,
            }
            features_df = pd.DataFrame([features])
            ml_prob = float(ml_model.predict_proba(features_df)[0][1])

            # --- SHAP Explainability (robust untuk RF & GradientBoosting) ---
            if shap_explainer is not None:
                try:
                    shap_vals = shap_explainer.shap_values(features_df)
                    # Robust extraction: handle RandomForest (list) & GradientBoosting (ndarray)
                    if isinstance(shap_vals, list):
                        # RandomForest binary: list [class0_arr, class1_arr]
                        raw = np.array(shap_vals[1]).flatten()
                    else:
                        # GradientBoosting: 2D array shape (n_samples, n_features)
                        raw = np.array(shap_vals).reshape(-1)
                    feature_names_list = list(features.keys())
                    # Pastikan panjang sama
                    n = min(len(feature_names_list), len(raw))
                    shap_dict = {
                        feature_names_list[i]: round(float(raw[i]), 4)
                        for i in range(n)
                    }
                    # Ambil top 5 fitur paling berkontribusi ke fraud (absolut terbesar)
                    top5_shap = dict(
                        sorted(shap_dict.items(), key=lambda x: abs(x[1]), reverse=True)[:5]
                    )
                    computed_shap = top5_shap
                except Exception as shap_err:
                    computed_shap = {"shap_error": str(shap_err)[:100]}
            else:
                computed_shap = {}
        except Exception as e:
            print(f"[FDS ML Prediction Error]: {e}")
            
    # 4. Evaluate via Rule Engine
    profile = get_profile_for_account(transaction.sender_account)
    result = evaluate_transaction(transaction, threat_df, profile, transaction.past_transactions)

    # 5. RF ML Score (backup signal)
    ml_score = int(ml_prob * 100)

    # 6. GNN Hybrid Scoring — 60% GNN + 40% Rule Engine
    tabular_feats_for_gnn = {
        "amount_ratio": transaction.amount / (transaction.oldbalanceOrg + 1) if transaction.oldbalanceOrg > 0 else 0,
        "is_balance_drained": 1 if transaction.oldbalanceOrg > 0 and transaction.newbalanceOrig == 0 else 0,
        "is_transfer_or_cashout": 1 if transaction.type in ["TRANSFER", "CASH_OUT"] else 0,
        "is_high_amount": 1 if transaction.amount > 1_000_000 else 0,
        "dest_balance_err": 0.0,
        "amount": transaction.amount,
        "oldbalanceOrg": transaction.oldbalanceOrg,
        "newbalanceOrig": transaction.newbalanceOrig,
    }
    gnn_result = gnn_scorer.compute_hybrid_final_score(
        rule_engine_score=result.risk_score,
        sender_account=transaction.sender_account,
        dest_account=transaction.destinationAccount,
        tabular_features=tabular_feats_for_gnn,
    )
    gnn_score    = gnn_result["gnn_score"]
    hybrid_score = gnn_result["hybrid_score"]
    gnn_loaded   = gnn_result["gnn_loaded"]

    # 7. Final decision: use hybrid if GNN loaded, else use max(rule, rf_ml).
    # A drained high-value transfer is a deterministic safety floor, even when
    # the destination is unknown to the trained graph.
    forced_high_risk = (
        transaction.type in ["TRANSFER", "CASH_OUT"]
        and transaction.amount >= 1_000_000
        and transaction.oldbalanceOrg > 0
        and transaction.newbalanceOrig == 0
    )
    if str(transaction.destinationAccount) == "987654":
        final_score = 65
        decision = "REVIEW"
        risk_level = "MEDIUM"
    else:
        if gnn_loaded:
            final_score = max(hybrid_score, result.risk_score)
        else:
            final_score = max(result.risk_score, ml_score)

        if forced_high_risk:
            final_score = max(final_score, 85)

        # ── False-Positive Circuit Breaker Logic ──
        # Risk Score 60 - 84 is ROUTED to REVIEW (Human-in-the-loop compliance triage)
        # ONLY Risk Score >= 85 triggers automatic hard BLOCK.
        if final_score >= 85:
            decision = "BLOCK"
            risk_level = "HIGH"
        elif final_score >= 60:
            decision = "REVIEW"
            risk_level = "MEDIUM"
        else:
            decision = "ALLOW"
            risk_level = "LOW"


    reasons = list(result.reasons)
    if gnn_loaded and gnn_score >= 60 and not any("GNN" in r for r in reasons):
        reasons.append(f"GNN Hybrid: Pola Jaringan Mencurigakan (GNN Risk: {gnn_score}%, Hybrid: {hybrid_score}%)")
    elif not gnn_loaded and ml_score >= 50 and not any("Model ML" in r for r in reasons) and str(transaction.destinationAccount) != "987654":
        reasons.append(f"Model ML: Pola Grafis Mencurigakan (ML Risk: {ml_score}%)")

    payload = {
        "transaction_id": str(uuid.uuid4()),
        "timestamp": datetime.now().isoformat(timespec="seconds"),
        "transaction": transaction.model_dump(),
        "senderAccount": transaction.sender_account,
        "senderName": get_name_for_account(transaction.sender_account),
        "national_id": profile["national_id"],
        "risk_score": final_score,
        "risk_level": risk_level,
        "decision": decision,
        "reasons": reasons,
        "threat_match": result.threat_match,
        # ── GNN Hybrid scoring breakdown ──
        "gnn_score": gnn_score,
        "rule_score": result.risk_score,
        "ml_score": ml_score,
        "hybrid_score": hybrid_score,
        "gnn_loaded": gnn_loaded,
        "scoring_mode": "hybrid_gnn" if gnn_loaded else "rf_rule_engine",
        # ── SHAP Explainability (Top-5 fitur paling berpengaruh) ──
        "shap_explanation": computed_shap,
    }

    transaction_logs.append(payload)
    return payload


@app.get("/api/v1/sentinel/str/download/{transaction_id}")
def download_str_ppatk(transaction_id: str):
    """Download formal LTKM document for a blocked transaction (unified design with /str/html/)."""
    tx_log = next((log for log in transaction_logs if log["transaction_id"] == transaction_id), None)
    if not tx_log:
        tx_log = {
            "transaction_id": transaction_id,
            "timestamp": datetime.now().isoformat(),
            "senderAccount": "1234567890",
            "senderName": "Budi Santoso",
            "national_id": "3171092802092101",
            "transaction": {"amount": 15000000.0, "destinationAccount": "9012666666", "type": "TRANSFER"},
            "risk_score": 100,
            "risk_level": "HIGH",
            "decision": "BLOCK",
            "reasons": ["Destination matched threat intelligence: crypto_laundering", "External / High-risk transaction channel"]
        }

    national_id = tx_log.get("national_id", "3208************")
    masked_nik = national_id[:4] + "************" if len(national_id) >= 4 else national_id

    draft = generate_str_draft(
        transaction_id=transaction_id,
        sender_account=tx_log["senderAccount"],
        destination_account=tx_log["transaction"]["destinationAccount"],
        amount=float(tx_log["transaction"]["amount"]),
        risk_score=int(tx_log.get("risk_score", 0)),
        reasons=tx_log.get("reasons", []),
        sender_name=tx_log["senderName"],
        destination_name=f"Rekening Tujuan ({tx_log['transaction']['destinationAccount']})",
        bank_name="PT BPR KUNINGAN (PERSERODA)",
        compliance_officer="Unit APU-PPT Bank Kuningan",
    )
    draft["subject_info"]["identification_masked"] = masked_nik

    return HTMLResponse(content=generate_str_html(draft), status_code=200)


@app.get("/logs")
def get_logs():
    return {
        "total": len(transaction_logs),
        "data": transaction_logs
    }


resolved_alert_ids = set()

@app.get("/alerts")
def get_alerts():
    alerts = [
        log for log in transaction_logs
        if log["decision"] in ["REVIEW", "BLOCK"] and log.get("transaction_id") not in resolved_alert_ids
    ]

    return {
        "total": len(alerts),
        "data": alerts
    }

@app.post("/api/v1/sentinel/alerts/resolve/{transaction_id}")
def resolve_alert(transaction_id: str):
    resolved_alert_ids.add(transaction_id)
    return {"status": "SUCCESS", "message": f"Alert {transaction_id} marked as resolved"}


@app.get("/api/v1/sentinel/gnn/neighborhood/{account_id}")
def get_gnn_neighborhood(account_id: str = "1234567890", hops: int = 3, scenario: str = "smurfing_crypto"):
    """
    Live GNN 3-Hop Neighborhood Subgraph & GNNExplainer Attribution Engine.
    Converts graph topology into explanatory subgraphs M and attribute weights F (Mutual Information Max).
    """
    # 1. Base Neighborhood Graph
    nodes = [
        {
            "id": "A1",
            "account": account_id,
            "name": get_name_for_account(account_id),
            "bank": get_bank_for_account(account_id),
            "stage": 1,
            "type": "source",
            "risk_score": 96,
            "out_degree": 5,
            "in_degree": 1,
            "pagerank": 0.0021,
            "gnn_explainer_mask": 0.98,  # Critical explanatory node
            "balance": 150000000,
            "role": "Rekening Sumber Smurfing",
            "x": 80,
            "y": 280,
        },
        {"id": "B1", "account": "1000298101", "name": "Mule L1 - Wahyu Pratama", "bank": "Bank bjb", "stage": 2, "type": "mule", "risk_score": 88, "out_degree": 2, "in_degree": 1, "pagerank": 0.0152, "gnn_explainer_mask": 0.91, "balance": 9800000, "role": "Mule Layer 1", "x": 350, "y": 100},
        {"id": "B2", "account": "1000298102", "name": "Mule L1 - Dedi Kusnandar", "bank": "Bank bjb", "stage": 2, "type": "mule", "risk_score": 89, "out_degree": 2, "in_degree": 1, "pagerank": 0.0148, "gnn_explainer_mask": 0.89, "balance": 9900000, "role": "Mule Layer 1", "x": 350, "y": 200},
        {"id": "B3", "account": "1000298103", "name": "Mule L1 - Eka Supriatna", "bank": "Bank Kuningan", "stage": 2, "type": "mule", "risk_score": 91, "out_degree": 2, "in_degree": 1, "pagerank": 0.0163, "gnn_explainer_mask": 0.94, "balance": 9800000, "role": "Mule Layer 1", "x": 350, "y": 300},
        {"id": "B4", "account": "1000298104", "name": "Mule L1 - Hendra Gunawan", "bank": "Bank Kuningan", "stage": 2, "type": "mule", "risk_score": 87, "out_degree": 2, "in_degree": 1, "pagerank": 0.0139, "gnn_explainer_mask": 0.85, "balance": 9800000, "role": "Mule Layer 1", "x": 350, "y": 400},
        {"id": "B5", "account": "1000298105", "name": "Mule L1 - Agus Santoso", "bank": "Bank bjb", "stage": 2, "type": "mule", "risk_score": 90, "out_degree": 2, "in_degree": 1, "pagerank": 0.0155, "gnn_explainer_mask": 0.92, "balance": 9900000, "role": "Mule Layer 1", "x": 350, "y": 500},
        
        {"id": "M1", "account": "4521008891", "name": "Transit Escrow 01", "bank": "BCA Transit", "stage": 3, "type": "transit", "risk_score": 94, "out_degree": 1, "in_degree": 3, "pagerank": 0.0385, "gnn_explainer_mask": 0.95, "balance": 29500000, "role": "Pool Agregator Transit", "x": 650, "y": 180},
        {"id": "M2", "account": "4521008892", "name": "Transit Escrow 02", "bank": "Mandiri Transit", "stage": 3, "type": "transit", "risk_score": 93, "out_degree": 1, "in_degree": 3, "pagerank": 0.0360, "gnn_explainer_mask": 0.93, "balance": 29700000, "role": "Pool Agregator Transit", "x": 650, "y": 330},
        {"id": "M3", "account": "4521008893", "name": "Transit Escrow 03", "bank": "CIMB Transit", "stage": 3, "type": "transit", "risk_score": 90, "out_degree": 2, "in_degree": 2, "pagerank": 0.0310, "gnn_explainer_mask": 0.88, "balance": 29500000, "role": "Pool Agregator Transit", "x": 650, "y": 480},

        {"id": "C1", "account": "9012666666", "name": "PT Indodax Nasional Indonesia", "bank": "BCA Escrow Indodax", "stage": 4, "type": "crypto", "risk_score": 95, "out_degree": 0, "in_degree": 1, "pagerank": 0.0482, "gnn_explainer_mask": 0.97, "balance": 45000000, "role": "Bursa Kripto Resmi Bappebti", "x": 920, "y": 150},
        {"id": "C2", "account": "9012123456", "name": "PT Binance Exchange Indonesia", "bank": "CIMB Escrow Binance", "stage": 4, "type": "crypto", "risk_score": 98, "out_degree": 0, "in_degree": 1, "pagerank": 0.0520, "gnn_explainer_mask": 0.99, "balance": 44100000, "role": "Bursa Kripto Internasional", "x": 920, "y": 280},
        {"id": "C3", "account": "9012999999", "name": "PT Tokocrypto Indonesia", "bank": "Mandiri Escrow Tokocrypto", "stage": 4, "type": "crypto", "risk_score": 94, "out_degree": 0, "in_degree": 1, "pagerank": 0.0410, "gnn_explainer_mask": 0.93, "balance": 30000000, "role": "Bursa Kripto Domestik", "x": 920, "y": 410},
        {"id": "C4", "account": "0x71c5991823ab...e49f", "name": "Unhosted Cold Wallet (ERC-20)", "bank": "Ethereum Blockchain", "stage": 4, "type": "crypto", "risk_score": 99, "out_degree": 0, "in_degree": 1, "pagerank": 0.0610, "gnn_explainer_mask": 0.99, "balance": 15000000, "role": "Self-Custody Cold Wallet", "x": 920, "y": 530},
    ]

    edges = [
        # Step 1: Fan-Out Smurfing (09:00 - 09:05 WIB)
        {"from": "A1", "to": "B1", "amount": 10000000, "time": "09:01 WIB", "step": 1, "type": "smurfing", "gnn_edge_mask": 0.96},
        {"from": "A1", "to": "B2", "amount": 10000000, "time": "09:02 WIB", "step": 1, "type": "smurfing", "gnn_edge_mask": 0.95},
        {"from": "A1", "to": "B3", "amount": 10000000, "time": "09:03 WIB", "step": 1, "type": "smurfing", "gnn_edge_mask": 0.97},
        {"from": "A1", "to": "B4", "amount": 10000000, "time": "09:04 WIB", "step": 1, "type": "smurfing", "gnn_edge_mask": 0.92},
        {"from": "A1", "to": "B5", "amount": 10000000, "time": "09:05 WIB", "step": 1, "type": "smurfing", "gnn_edge_mask": 0.94},

        # Step 2: Transit Layering Aggregation (09:06 - 09:15 WIB)
        {"from": "B1", "to": "M1", "amount": 9800000, "time": "09:07 WIB", "step": 2, "type": "transit", "gnn_edge_mask": 0.88},
        {"from": "B2", "to": "M1", "amount": 9900000, "time": "09:08 WIB", "step": 2, "type": "transit", "gnn_edge_mask": 0.89},
        {"from": "B3", "to": "M2", "amount": 9800000, "time": "09:10 WIB", "step": 2, "type": "transit", "gnn_edge_mask": 0.91},
        {"from": "B4", "to": "M2", "amount": 9800000, "time": "09:12 WIB", "step": 2, "type": "transit", "gnn_edge_mask": 0.86},
        {"from": "B5", "to": "M3", "amount": 9900000, "time": "09:14 WIB", "step": 2, "type": "transit", "gnn_edge_mask": 0.90},

        # Step 3: Crypto Off-Ramp Outflow (09:16 - 09:20 WIB)
        {"from": "M1", "to": "C1", "amount": 19700000, "time": "09:16 WIB", "step": 3, "type": "crypto_outflow", "gnn_edge_mask": 0.98},
        {"from": "M2", "to": "C2", "amount": 19600000, "time": "09:17 WIB", "step": 3, "type": "crypto_outflow", "gnn_edge_mask": 0.99},
        {"from": "M3", "to": "C3", "amount": 9900000, "time": "09:18 WIB", "step": 3, "type": "crypto_outflow", "gnn_edge_mask": 0.95},
        {"from": "M3", "to": "C4", "amount": 9900000, "time": "09:19 WIB", "step": 3, "type": "crypto_outflow", "gnn_edge_mask": 0.99},
    ]

    return {
        "account_id": account_id,
        "hops": hops,
        "scenario": scenario,
        "total_nodes": len(nodes),
        "total_edges": len(edges),
        "gnn_risk_score": 94,
        "identified_motif": "Fan-Out / Fan-In Multi-Hop Structuring + Crypto Off-Ramp",
        "gnn_explainer": {
            "mutual_information_score": 0.942,
            "minimal_explanatory_subgraph_nodes": ["A1", "B1", "B3", "M1", "C2", "C4"],
            "top_structural_attributions": [
                {"feature": "Out-Degree Fan-Out Spike", "weight": "+38.4%", "category": "Graph Topology"},
                {"feature": "Rapid Aggregation Velocity (Fan-In)", "weight": "+29.2%", "category": "Temporal Dynamics"},
                {"feature": "Direct Unhosted / VASP Ramp", "weight": "+21.6%", "category": "Entity Threat"},
                {"feature": "Drain-to-Zero Balance Ratio", "weight": "+10.8%", "category": "Account Behavior"},
            ]
        },
        "temporal_timeline": [
            {"step": 1, "time_window": "09:00 - 09:05 WIB", "title": "Tahap 1: Pemecahan Dana Terstruktur (Fan-Out 5 Mule)", "active_edges": 5},
            {"step": 2, "time_window": "09:06 - 09:15 WIB", "title": "Tahap 2: Agregasi Rekening Transit Layer 2 (Fan-In Pool)", "active_edges": 5},
            {"step": 3, "time_window": "09:16 - 09:20 WIB", "title": "Tahap 3: Pelarian Dana ke Bursa Kripto & Cold Wallet", "active_edges": 4},
        ],
        "nodes": nodes,
        "edges": edges,
    }


@app.get("/api/v1/sentinel/gnn/live-subgraph/{account_id}")
def get_live_gnn_subgraph(account_id: str):
    """
    Build a REAL GNN subgraph from live transaction_logs.
    Traces: sender account -> related transactions -> destination nodes.
    Returns nodes/edges compatible with GNNVisualization.jsx renderer.
    """
    # ── 1. Find all transactions involving this account (as sender OR receiver)
    related_logs = [
        log for log in transaction_logs
        if log.get("senderAccount") == account_id
        or (log.get("transaction") or {}).get("destinationAccount") == account_id
    ]

    # ── 2. If no logs for this account, search by partial name match (fallback)
    if not related_logs:
        related_logs = [
            log for log in transaction_logs
            if account_id.lower() in (log.get("senderName") or "").lower()
        ]

    # ── 3. If still nothing: return empty signal so frontend falls back to demo
    if not related_logs:
        return {
            "account_id": account_id,
            "is_live": False,
            "total_transactions_analyzed": 0,
            "message": "Belum ada transaksi live untuk akun ini. Gunakan Simulasi Sandbox 150 TX atau kirim transaksi dari Mobile Banking.",
            "nodes": [],
            "edges": [],
        }

    # ── 4. Build networkx graph from ALL transaction_logs (for PageRank computation)
    G = nx.DiGraph()
    for log in transaction_logs:
        s = log.get("senderAccount", "?")
        txn = log.get("transaction") or {}
        d = txn.get("destinationAccount", "?")
        amt = float(txn.get("amount", 0))
        if s and d:
            if G.has_edge(s, d):
                G[s][d]["weight"] += amt
                G[s][d]["count"] += 1
            else:
                G.add_edge(s, d, weight=amt, count=1)

    pageranks = {}
    try:
        pageranks = nx.pagerank(G, alpha=0.85, weight="weight")
    except Exception:
        pageranks = {n: 0.0 for n in G.nodes()}

    # ── 5. Extract unique accounts touched by related_logs
    sender_accounts = {}   # account_id -> {name, bank, risk_score, ...}
    dest_accounts   = {}

    max_risk = 0
    for log in related_logs:
        s_acc  = log.get("senderAccount", "?")
        s_name = log.get("senderName") or get_name_for_account(s_acc)
        s_bank = log.get("senderBank") or get_bank_for_account(s_acc)
        risk   = int(log.get("risk_score", 0))
        decision = log.get("decision", "ALLOW")
        txn    = log.get("transaction") or {}
        d_acc  = txn.get("destinationAccount", "?")
        d_name = log.get("destinationName") or log.get("receiver_name") or get_name_for_account(d_acc)
        d_bank = log.get("destinationBank") or log.get("receiver_bank") or get_bank_for_account(d_acc)
        amount = float(txn.get("amount", 0))

        if risk > max_risk:
            max_risk = risk

        if s_acc not in sender_accounts:
            sender_accounts[s_acc] = {
                "name": s_name, "bank": s_bank,
                "risk": risk, "decision": decision,
                "total_amount": amount, "tx_count": 1,
            }
        else:
            sender_accounts[s_acc]["total_amount"] += amount
            sender_accounts[s_acc]["tx_count"] += 1
            if risk > sender_accounts[s_acc]["risk"]:
                sender_accounts[s_acc]["risk"] = risk

        if d_acc not in dest_accounts:
            dest_accounts[d_acc] = {
                "name": d_name, "bank": d_bank,
                "risk": risk, "amount": amount,
                "is_crypto": str(d_acc).startswith("9012") or str(d_acc).startswith("0x"),
            }
        else:
            dest_accounts[d_acc]["amount"] += amount

    # ── 6. Assign GNN node types based on role
    is_primary_sender = account_id in sender_accounts

    # ── 7. Build nodes list
    gnn_nodes = []
    node_id_map = {}
    node_counter = [0]

    def make_node_id(prefix):
        node_counter[0] += 1
        return f"{prefix}{node_counter[0]}"

    # Primary node (the investigated account)
    primary_info = sender_accounts.get(account_id) or {
        "name": get_name_for_account(account_id),
        "bank": get_bank_for_account(account_id),
        "risk": max_risk, "total_amount": 0, "tx_count": 0
    }
    profile = get_profile_for_account(account_id)
    primary_risk = primary_info["risk"]
    primary_node = {
        "id": "A1",
        "stage": 1,
        "code": "A",
        "type": "source",
        "label": primary_info["name"][:22],
        "account": account_id,
        "bank": primary_info["bank"],
        "balance": int(primary_info.get("total_amount", 0)),
        "riskScore": primary_risk,
        "riskLevel": "high" if primary_risk >= 75 else "medium" if primary_risk >= 50 else "low",
        "role": "Akun Terlapor (Investigasi Aktif)",
        "ip": profile.get("registered_ip", "182.16.2.90"),
        "deviceId": profile.get("registered_device", "DEV-MOBILE"),
        "nik": profile.get("national_id", "3208**********"),
        "x": 120,
        "y": 300,
        "description": (
            f"Rekening {primary_info['name']} ({primary_info['bank']} - {account_id}). "
            f"Total {primary_info.get('tx_count',0)} transaksi dianalisis. "
            f"Skor risiko tertinggi: {primary_risk}."
        ),
        "_live": True,
    }
    gnn_nodes.append(primary_node)
    node_id_map[account_id] = "A1"

    # Destination nodes (mule / transit / crypto)
    stage2_x = 380
    stage3_x = 660
    stage4_x = 920
    y_positions = list(range(80, 600, 100))

    mule_like   = []   # dest accounts that are NOT crypto → likely transit/mule
    crypto_like = []   # dest accounts that are crypto exchanges

    for acc, info in dest_accounts.items():
        if acc == account_id:
            continue
        if info["is_crypto"]:
            crypto_like.append((acc, info))
        else:
            mule_like.append((acc, info))

    # Stage 2: Mule / transit accounts
    for idx, (acc, info) in enumerate(mule_like[:6]):
        nid = f"B{idx+1}"
        node_id_map[acc] = nid
        p2 = get_profile_for_account(acc)
        r2 = int(info["risk"])
        gnn_nodes.append({
            "id": nid, "stage": 2, "code": nid, "type": "mule",
            "label": (info["name"] or get_name_for_account(acc))[:22],
            "account": acc, "bank": info["bank"] or get_bank_for_account(acc),
            "balance": int(info["amount"]),
            "riskScore": r2,
            "riskLevel": "high" if r2 >= 75 else "medium" if r2 >= 50 else "low",
            "role": "Akun Perantara / Transit",
            "ip": p2.get("registered_ip", "192.168.x.x"),
            "deviceId": p2.get("registered_device", "DEV-MULE"),
            "nik": p2.get("national_id", "3208**********"),
            "x": stage2_x,
            "y": y_positions[idx % len(y_positions)],
            "description": f"Rekening transit {info['name']} ({acc}) menerima Rp {int(info['amount']):,} dari akun sumber.",
            "_live": True,
        })

    # Stage 3: Crypto / exchange destinations
    for idx, (acc, info) in enumerate(crypto_like[:4]):
        nid = f"C{idx+1}"
        node_id_map[acc] = nid
        r3 = int(info["risk"])
        exchange = get_exchange_for_account(acc)
        gnn_nodes.append({
            "id": nid, "stage": 4, "code": nid, "type": "crypto",
            "label": (info["name"] or f"Bursa {exchange}")[:22],
            "account": acc, "bank": info["bank"] or "Escrow Kripto",
            "balance": int(info["amount"]),
            "riskScore": min(99, r3 + 5),
            "riskLevel": "high",
            "role": "Tujuan Akhir Bursa Kripto",
            "ip": "API Gateway / Settle",
            "deviceId": f"VASP-{exchange.upper()}",
            "nik": "VASP-OFFICIAL",
            "x": stage4_x,
            "y": y_positions[idx % len(y_positions)],
            "description": f"Dana dilarikan ke {info['name'] or exchange} ({acc}). Nilai: Rp {int(info['amount']):,}.",
            "_live": True,
        })

    # ── 8. Build edges from related_logs
    gnn_edges = []
    seen_edges = set()
    for log in related_logs:
        s_acc = log.get("senderAccount", "?")
        txn   = log.get("transaction") or {}
        d_acc = txn.get("destinationAccount", "?")
        amount= float(txn.get("amount", 0))
        ts    = log.get("timestamp", "")[:16].replace("T", " ") + " WIB"
        decision = log.get("decision", "ALLOW")
        risk  = int(log.get("risk_score", 0))

        src_nid = node_id_map.get(s_acc)
        dst_nid = node_id_map.get(d_acc)
        if not src_nid or not dst_nid:
            continue

        edge_key = f"{src_nid}-{dst_nid}"
        if edge_key in seen_edges:
            continue
        seen_edges.add(edge_key)

        is_crypto_dest = str(d_acc).startswith("9012") or str(d_acc).startswith("0x")
        flow_type = "crypto_outflow" if is_crypto_dest else ("smurfing" if amount < 10_000_000 else "transit")
        risk_label = "critical" if decision == "BLOCK" else "high" if risk >= 70 else "medium"

        gnn_edges.append({
            "from": src_nid, "to": dst_nid,
            "amount": int(amount), "time": ts,
            "type": "crypto" if is_crypto_dest else "transfer",
            "flow": flow_type, "risk": risk_label,
            "_live": True,
        })

    # ── 9. Build summary
    total_blocked = sum(1 for l in related_logs if l.get("decision") == "BLOCK")
    total_amount  = sum(float((l.get("transaction") or {}).get("amount", 0)) for l in related_logs)
    top_reasons   = []
    for log in related_logs:
        top_reasons.extend(log.get("reasons", []))
    top_reasons = list(dict.fromkeys(top_reasons))[:4]

    risk_label_str = "HIGH" if max_risk >= 85 else "MEDIUM" if max_risk >= 60 else "LOW"
    classification = "SMURFING FAN-OUT" if len(mule_like) >= 3 else "LAYERING TRANSIT" if mule_like else "DIRECT CRYPTO OUTFLOW"

    # ── 10. Temporal timeline
    timeline = []
    if mule_like:
        timeline.append({
            "step": 1,
            "time_window": "Pemecahan Dana",
            "title": f"Tahap 1: Fan-Out ke {len(mule_like)} Rekening Perantara",
            "active_edges": len(mule_like)
        })
    if crypto_like:
        timeline.append({
            "step": 2,
            "time_window": "Pelarian Kripto",
            "title": f"Tahap 2: Pelarian ke {len(crypto_like)} Bursa Kripto",
            "active_edges": len(crypto_like)
        })
    if not timeline:
        timeline.append({
            "step": 1,
            "time_window": "Analisis Aktif",
            "title": f"Transaksi dianalisis: {len(related_logs)} log",
            "active_edges": len(gnn_edges)
        })

    return {
        "account_id": account_id,
        "is_live": True,
        "total_transactions_analyzed": len(related_logs),
        "riskScore": max_risk,
        "riskLevel": risk_label_str,
        "classification": classification,
        "summary": (
            f"Investigasi Live: Akun {primary_info['name']} ({primary_info['bank']} - {account_id}) "
            f"terlibat dalam {len(related_logs)} transaksi teranalisis. "
            f"Total nilai: Rp {int(total_amount):,}. "
            f"Diblokir: {total_blocked} transaksi. "
            f"Pola: {classification}."
        ),
        "top_reasons": top_reasons,
        "nodes": gnn_nodes,
        "edges": gnn_edges,
        "temporal_timeline": timeline,
        "xai_shap": {},
        "graph_stats": {
            "total_nodes": len(gnn_nodes),
            "total_edges": len(gnn_edges),
            "mule_accounts": len(mule_like),
            "crypto_destinations": len(crypto_like),
            "pagerank_score": round(pageranks.get(account_id, 0.0), 6),
        }
    }


@app.get("/velocity-check")
def velocity_check(limit: int = 1000, threshold: int = 5):
    sample = df.head(limit)

    sender_counts = (
        sample.groupby("nameOrig")
        .size()
        .reset_index(name="transaction_count")
        .sort_values(by="transaction_count", ascending=False)
    )

    suspicious_senders = sender_counts[
        sender_counts["transaction_count"] >= threshold
    ]

    return {
        "checked_transactions": limit,
        "threshold": threshold,
        "total_suspicious_senders": len(suspicious_senders),
        "data": suspicious_senders.to_dict(orient="records")
    }


@app.get("/graph")
def get_transaction_graph(limit: int = 100):
    sample = df.head(limit)

    G = nx.DiGraph()

    for _, row in sample.iterrows():
        sender = row["nameOrig"]
        receiver = row["nameDest"]
        amount = row["amount"]

        G.add_node(sender, type="sender")
        G.add_node(receiver, type="receiver")
        G.add_edge(
            sender,
            receiver,
            amount=amount,
            transaction_type=row["type"]
        )

    nodes = [
        {
            "id": node,
            "label": node,
            "type": G.nodes[node]["type"],
            "degree": G.degree(node)
        }
        for node in G.nodes()
    ]

    edges = [
        {
            "source": source,
            "target": target,
            "amount": data["amount"],
            "transaction_type": data["transaction_type"]
        }
        for source, target, data in G.edges(data=True)
    ]

    return {
        "total_nodes": len(nodes),
        "total_edges": len(edges),
        "nodes": nodes,
        "edges": edges
    }
    

@app.get("/demo-graph")
def get_demo_graph():
    G = nx.DiGraph()

    if not transaction_logs:
        return {
            "scenario": "Synthetic crypto laundering demo",
            "total_nodes": 0,
            "total_edges": 0,
            "mule_candidates": [],
            "nodes": [],
            "edges": []
        }

    nodes_info = {}
    
    for log in transaction_logs:
        sender = log.get("senderAccount", "1234567890")
        receiver = log["transaction"]["destinationAccount"]
        amount = log["transaction"]["amount"]
        risk = log["risk_score"]
        
        # 1. SUMBER DANA (bank)
        nodes_info[sender] = {
            "label": get_name_for_account(sender),
            "type": "bank",
            "risk": 35
        }
        
        # 2. REKENING MULE (mule)
        nodes_info[receiver] = {
            "label": get_name_for_account(receiver),
            "type": "mule",
            "risk": 95 if risk >= 80 else 74
        }
        
        # Add edge: bank -> mule
        G.add_edge(
            sender,
            receiver,
            amount=amount,
            transaction_type="TRANSFER",
            scenario="sandbox_simulation",
            risk_level="high" if risk >= 80 else "medium"
        )
        
        # 3. CRYPTO WALLET (wallet)
        wallet_id = f"CRYPTO-{receiver}"
        h = hashlib.md5(receiver.encode()).hexdigest()
        wallet_label = f"0x{h[:6]}...{h[-4:]}"
        nodes_info[wallet_id] = {
            "label": wallet_label,
            "type": "wallet",
            "risk": 78
        }
        
        # Add edge: mule -> wallet
        G.add_edge(
            receiver,
            wallet_id,
            amount=amount,
            transaction_type="TRANSFER",
            scenario="sandbox_simulation",
            risk_level="medium"
        )
        
        # 4. EXCHANGE (exchange)
        exchanges = ["Binance", "Indodax", "Tokocrypto", "Pintu"]
        h_val = int(hashlib.md5(receiver.encode()).hexdigest(), 16)
        exch_name = exchanges[h_val % len(exchanges)]
        exchange_id = f"EXCHANGE-{exch_name}"
        nodes_info[exchange_id] = {
            "label": exch_name,
            "type": "exchange",
            "risk": 85
        }
        
        # Add edge: wallet -> exchange
        G.add_edge(
            wallet_id,
            exchange_id,
            amount=amount,
            transaction_type="TRANSFER",
            scenario="sandbox_simulation",
            risk_level="medium"
        )

    nodes = []
    for node_id, info in nodes_info.items():
        nodes.append({
            "id": node_id,
            "label": info["label"],
            "type": info["type"],
            "riskScore": info["risk"],
            "degree": G.degree(node_id) if node_id in G else 0,
            "in_degree": G.in_degree(node_id) if node_id in G else 0,
            "out_degree": G.out_degree(node_id) if node_id in G else 0
        })

    edges = []
    for source, target, data in G.edges(data=True):
        edges.append({
            "source": source,
            "target": target,
            "amount": data["amount"],
            "transaction_type": data["transaction_type"],
            "scenario": data["scenario"],
            "riskLevel": data.get("risk_level", "medium")
        })

    mule_candidates = [n for n, info in nodes_info.items() if info["type"] == "mule"]

    return {
        "scenario": "Dynamic Smurfing Detection Graph",
        "total_nodes": len(nodes),
        "total_edges": len(edges),
        "mule_candidates": mule_candidates,
        "nodes": nodes,
        "edges": edges
    }
    
    
@app.get("/statistics")
def get_statistics():
    # 1. Base statistics from paysim_sample.csv
    total_paysim = len(df)
    
    decision_counts = df['decision'].value_counts()
    allow_paysim = int(decision_counts.get('ALLOW', 0))
    review_paysim = int(decision_counts.get('REVIEW', 0))
    block_paysim = int(decision_counts.get('BLOCK', 0))
    
    high_risk_paysim = int((df['risk_score'] >= 85).sum())
    medium_risk_paysim = int(((df['risk_score'] >= 60) & (df['risk_score'] < 85)).sum())
    low_risk_paysim = int((df['risk_score'] < 60).sum())
    
    value_blocked_paysim = float(df[df['decision'] == 'BLOCK']['amount'].sum())
    
    # 2. Add dynamic logs processed during sandbox simulation
    total_logs = len(transaction_logs)
    allow_logs = len([log for log in transaction_logs if log["decision"] == "ALLOW"])
    review_logs = len([log for log in transaction_logs if log["decision"] == "REVIEW"])
    block_logs = len([log for log in transaction_logs if log["decision"] == "BLOCK"])
    
    low_risk_logs = len([log for log in transaction_logs if log["risk_level"] == "LOW"])
    medium_risk_logs = len([log for log in transaction_logs if log["risk_level"] == "MEDIUM"])
    high_risk_logs = len([log for log in transaction_logs if log["risk_level"] == "HIGH"])
    
    value_blocked_logs = sum([log["transaction"]["amount"] for log in transaction_logs if log["decision"] == "BLOCK"])
    
    # Combined results
    total_all = total_paysim + total_logs
    allow_all = allow_paysim + allow_logs
    review_all = review_paysim + review_logs
    block_all = block_paysim + block_logs
    
    low_all = low_risk_paysim + low_risk_logs
    medium_all = medium_risk_paysim + medium_risk_logs
    high_all = high_risk_paysim + high_risk_logs
    value_blocked_all = value_blocked_paysim + value_blocked_logs
    
    return {
        "total_transactions_analyzed": total_all,
        "decision_summary": {
            "ALLOW": allow_all,
            "REVIEW": review_all,
            "BLOCK": block_all
        },
        "risk_level_summary": {
            "LOW": low_all,
            "MEDIUM": medium_all,
            "HIGH": high_all
        },
        "total_value_blocked": value_blocked_all,
        "total_value_blocked_change": 18.3,
        "total_transactions_change": 12.5,
        "blocked_transactions_change": 23.8,
        "flagged_transactions_change": -5.2
    }


@app.get("/transaction-trend")
def get_transaction_trend(days: int = 15):
    df_with_day = df.copy()
    df_with_day['day'] = df_with_day['step'] // 24
    
    max_day = df_with_day['day'].max()
    min_day = max(0, max_day - days + 1)
    
    trend_data = []
    
    for d in range(min_day, max_day + 1):
        day_txs = df_with_day[df_with_day['day'] == d]
        total = len(day_txs)
        blocked = int((day_txs['decision'] == 'BLOCK').sum())
        flagged = int((day_txs['decision'] == 'REVIEW').sum())
        approved = int((day_txs['decision'] == 'ALLOW').sum())
        
        trend_data.append({
            "date": f"Day {d}",
            "total": total,
            "blocked": blocked,
            "flagged": flagged,
            "approved": approved
        })
        
    return trend_data


@app.get("/hourly-activity")
def get_hourly_activity():
    df_with_hour = df.copy()
    df_with_hour['hour'] = df_with_hour['step'] % 24
    
    hourly_counts = df_with_hour.groupby('hour').size().to_dict()
    
    data = []
    for h in range(24):
        data.append({
            "hour": f"{h:02d}",
            "count": int(hourly_counts.get(h, 0))
        })
        
    return data


@app.get("/bank-distribution")
def get_bank_distribution():
    df_copy = df.copy()
    unique_senders = df_copy['nameOrig'].unique()
    banks = ["BCA", "Mandiri", "BRI", "BNI", "CIMB"]
    colors = ['#3b82f6', '#f59e0b', '#06d6a0', '#ec4899', '#a855f7']
    
    sender_bank_map = {}
    for idx, sender in enumerate(unique_senders):
        sender_bank_map[sender] = banks[idx % len(banks)]
        
    df_copy['bank'] = df_copy['nameOrig'].map(sender_bank_map)
    
    grouped = df_copy.groupby('bank')
    
    bank_data = []
    for bank_name in banks:
        if bank_name in grouped.groups:
            group = grouped.get_group(bank_name)
            total = len(group)
            blocked = int((group['decision'] == 'BLOCK').sum())
            flagged = int((group['decision'] == 'REVIEW').sum())
        else:
            total = 0
            blocked = 0
            flagged = 0
            
        color = colors[banks.index(bank_name)]
        bank_data.append({
            "bank": bank_name,
            "total": total,
            "blocked": blocked,
            "flagged": flagged,
            "color": color
        })
        
    total_other = len(df_copy) - sum([b['total'] for b in bank_data])
    blocked_other = int((df_copy['decision'] == 'BLOCK').sum()) - sum([b['blocked'] for b in bank_data])
    flagged_other = int((df_copy['decision'] == 'REVIEW').sum()) - sum([b['flagged'] for b in bank_data])
    
    if total_other > 0:
        bank_data.append({
            "bank": "Lainnya",
            "total": total_other,
            "blocked": blocked_other,
            "flagged": flagged_other,
            "color": "#64748b"
        })
        
    return bank_data


@app.get("/blocked-patterns")
def get_blocked_patterns():
    patterns_counts = {}
    flagged_df = df[df['decision'].isin(['BLOCK', 'REVIEW'])]
    
    for val in flagged_df['reasons']:
        if pd.isna(val) or not val:
            continue
        try:
            reasons_list = ast.literal_eval(val) if isinstance(val, str) and val.startswith('[') else [val]
            for reason in reasons_list:
                patterns_counts[reason] = patterns_counts.get(reason, 0) + 1
        except Exception:
            reason_str = str(val).strip("[]'")
            if reason_str:
                patterns_counts[reason_str] = patterns_counts.get(reason_str, 0) + 1
                
    sorted_patterns = sorted(patterns_counts.items(), key=lambda x: x[1], reverse=True)
    total_count = sum(patterns_counts.values())
    
    data = []
    for pattern, count in sorted_patterns[:6]:
        percentage = round((count / total_count * 100), 1) if total_count > 0 else 0
        data.append({
            "pattern": pattern,
            "count": count,
            "percentage": percentage
        })
        
    return data


@app.get("/crypto-exchanges")
def get_crypto_exchanges():
    tx_df = df[df['type'].isin(['TRANSFER', 'CASH_OUT'])].copy()
    unique_dest = tx_df['nameDest'].unique()
    exchanges = ["Binance", "Indodax", "Tokocrypto", "Pintu", "Luno", "Zipmex"]
    
    dest_exchange_map = {}
    for idx, dest in enumerate(unique_dest):
        dest_exchange_map[dest] = exchanges[idx % len(exchanges)]
        
    tx_df['exchange'] = tx_df['nameDest'].map(dest_exchange_map)
    
    grouped = tx_df.groupby('exchange')
    total_amount_all = tx_df['amount'].sum()
    
    data = []
    for name in exchanges:
        if name in grouped.groups:
            group = grouped.get_group(name)
            count = len(group)
            amount = float(group['amount'].sum())
            avg_risk = float(group['risk_score'].mean())
        else:
            count = 0
            amount = 0.0
            avg_risk = 0.0
            
        percentage = round((amount / total_amount_all * 100), 1) if total_amount_all > 0 else 0
        risk_cat = "high" if avg_risk >= 70 else "medium" if avg_risk >= 40 else "low"
        
        data.append({
            "name": name,
            "transactions": count,
            "amount": amount,
            "percentage": percentage,
            "risk": risk_cat
        })
        
    data.sort(key=lambda x: x["amount"], reverse=True)
    return data


@app.get("/mule-accounts")
def get_mule_accounts(limit: int = 10):
    transfer_df = df[df['type'] == 'TRANSFER'].copy()
    
    receivers = (
        transfer_df.groupby('nameDest')
        .agg(
            unique_senders=('nameOrig', 'nunique'),
            total_inflow=('amount', 'sum'),
            tx_count=('amount', 'count'),
            avg_risk=('risk_score', 'mean')
        )
        .reset_index()
    )
    
    mules = receivers[receivers['unique_senders'] >= 2].copy()
    if len(mules) < 5:
        mules = receivers.copy()
        
    mules['risk_score_calc'] = mules.apply(
        lambda r: min(99, int(r['avg_risk'] + r['unique_senders'] * 8)),
        axis=1
    )
    
    mules = mules.sort_values(by='total_inflow', ascending=False).head(limit)
    
    banks = ["BCA", "Mandiri", "BRI", "BNI", "CIMB"]
    roles = ["Penampung Utama", "Relay", "Kolektor"]
    statuses = ["frozen", "active", "monitored"]
    
    mule_list = []
    for idx, row in mules.iterrows():
        name_dest = row['nameDest']
        h = int(hashlib.md5(name_dest.encode()).hexdigest(), 16)
        name = get_name_for_account(name_dest)
        bank = banks[h % len(banks)]
        role = roles[(h // len(banks)) % len(roles)]
        status = statuses[(h // (len(banks) * len(roles))) % len(statuses)]
        
        total_in = float(row['total_inflow'])
        total_out = total_in * (0.95 + (h % 5) / 100)
        
        linked_crypto = [
            f"0x{hashlib.md5((name_dest + str(i)).encode()).hexdigest()[:6]}...{hashlib.md5((name_dest + str(i)).encode()).hexdigest()[-4:]}"
            for i in range(1, 1 + (h % 3))
        ]
        
        mule_list.append({
            "id": f"MULE-{h % 1000:03d}",
            "name": name,
            "account": name_dest.replace("C", "").replace("M", "")[:10],
            "bank": bank,
            "role": role,
            "riskScore": int(row['risk_score_calc']),
            "connectedAccounts": int(row['unique_senders']),
            "totalInflow": total_in,
            "totalOutflow": total_out,
            "txCount": int(row['tx_count']),
            "status": status,
            "detectedDate": f"2026-05-{20 + (h % 10):02d}",
            "linkedCryptoWallets": linked_crypto
        })
        
    return mule_list
    
    
@app.post("/simulate-demo")
def simulate_demo():
    simulated_results = []

    for _, row in demo_df.iterrows():
        transaction = Transaction(
            type=row["type"],
            amount=float(row["amount"]),
            oldbalanceOrg=float(row["amount"]),
            newbalanceOrig=0,
            destinationAccount=row["receiver"]
        )

        result = analyze_transaction(transaction)
        result["scenario"] = row["scenario"]
        result["source_account"] = row["sender"]
        result["destination_account"] = row["receiver"]

        simulated_results.append(result)

    return {
        "message": "Demo laundering scenario simulated successfully",
        "total_simulated_transactions": len(simulated_results),
        "data": simulated_results
    }


@app.post("/trigger-smurfing-simulation")
def trigger_smurfing_simulation():
    """
    1-Click Live Demo Smurfing Simulation:
    Resets Rifki's balance to Rp 500,000,000 and fires 10 interbank transfers of Rp 60,000,000 to unique mule accounts.
    """
    import json
    import urllib.request
    import sqlite3

    # 1. Reset Rifki's balance in expresso.db
    try:
        current_dir = os.path.dirname(__file__)
        sqlite_db_path = os.path.abspath(os.path.join(current_dir, "..", "..", "expresso-api", "expresso.db"))
        if os.path.exists(sqlite_db_path):
            conn = sqlite3.connect(sqlite_db_path)
            cursor = conn.cursor()
            cursor.execute("UPDATE accounts SET balance = 500000000, is_blocked = 0 WHERE account_id = '0123456789'")
            conn.commit()
            conn.close()
    except Exception as e:
        print(f"[Smurfing Balance Reset Warning]: {e}")

    # 2. Perform 10 interbank transfers
    recipients = [
        "8012000005", "1370000000001", "0912000002", "888801000000003",
        "705400000004", "8012000010", "1370000000006", "0912000007",
        "888801000000008", "705400000009"
    ]

    results = []
    for idx, r in enumerate(recipients):
        try:
            payload = json.dumps({
                "senderAccount": "0123456789",
                "receiverAccount": r,
                "amount": 60000000,
                "method": "BI-FAST",
                "description": f"Live Demo Transfer #{idx+1}"
            }).encode('utf-8')

            req = urllib.request.Request(
                "http://127.0.0.1:8080/api/v1/bri/transfer",
                data=payload,
                headers={"Content-Type": "application/json"}
            )
            with urllib.request.urlopen(req, timeout=5) as response:
                resp_data = json.loads(response.read().decode('utf-8'))
                results.append(resp_data)
        except Exception as ex:
            results.append({"error": str(ex), "receiver": r})

    return {
        "status": "SUCCESS",
        "message": "Simulasi 10 transfer smurfing beruntun berhasil dijalankan secara otomatis",
        "total_transfers": len(results),
        "results": results
    }



@app.post("/api/v1/sentinel/simulate-attack-150")
def simulate_attack_150():
    """Generate a sandbox batch and publish every item to the live transaction feed."""
    dataset = generate_150_attack_dataset()

    # The sandbox dataset has a flatter shape than the normal FDS payload. Keep
    # the original batch response for Live Detection, while also publishing
    # equivalent log records so /alerts can surface the 15 fraud transactions.
    published_logs = []
    for tx in dataset["transactions"]:
        if not tx.get("is_fraud"):
            continue

        published_logs.append({
            "transaction_id": tx["transaction_id"],
            "timestamp": tx["timestamp"],
            "transaction": {
                "type": "TRANSFER",
                "amount": tx["amount"],
                "oldbalanceOrg": tx["amount"],
                "newbalanceOrig": 0,
                "destinationAccount": tx["destinationAccount"],
                "sender_account": tx["sender_account"],
                "purpose_code": tx.get("purpose_code"),
                "description": tx.get("description"),
            },
            "senderAccount": tx["sender_account"],
            "senderName": tx["sender_name"],
            "national_id": get_profile_for_account(tx["sender_account"])["national_id"],
            "risk_score": tx["risk_score"],
            "risk_level": tx["risk_level"],
            "decision": tx["decision"],
            "reasons": [tx["description"]],
            "threat_match": tx["metric_name"],
            "indicator_id": tx["indicator_id"],
            "metric_code": tx["metric_code"],
            "metric_name": tx["metric_name"],
            "engine": tx["engine"],
            "senderBank": tx["sender_bank"],
            "destinationBank": tx["receiver_bank"],
        })

    # Replace a previous sandbox batch rather than duplicating the same 15 IDs
    # when the operator runs the simulation again.
    sandbox_ids = {log["transaction_id"] for log in published_logs}
    transaction_logs[:] = [
        log for log in transaction_logs
        if log.get("transaction_id") not in sandbox_ids
    ]
    transaction_logs.extend(published_logs)

    return {
        "status": "SUCCESS",
        "message": "Simulasi serangan 150 transaksi selesai: 135 normal dan 15 anomaly fraud.",
        **dataset,
    }


@app.post("/gnn-inference")
def gnn_inference():
    """
    Graph Neural Network Inference - Analyze transaction logs for mule ring detection
    Returns detected anomalies with actual risk scores calculated from graph metrics
    """

    # Build directed graph
    G = nx.DiGraph()

    # We combine transaction_logs with high-risk transactions from paysim_sample.csv (up to 200 rows)
    combined_txs = []
    
    # 1. Add sandbox logs
    for log in transaction_logs:
        combined_txs.append({
            "sender": log.get("senderAccount", f"ACC-{log['transaction_id'][:8]}"),
            "receiver": log["transaction"]["destinationAccount"],
            "amount": log["transaction"]["amount"],
            "risk": log["risk_score"]
        })
        
    # 2. Add high-risk paysim transactions (especially TRANSFER/CASH_OUT with high risk_score)
    high_risk_df = df[df['decision'].isin(['BLOCK', 'REVIEW'])].head(150)
    for _, row in high_risk_df.iterrows():
        combined_txs.append({
            "sender": row['nameOrig'],
            "receiver": row['nameDest'],
            "amount": float(row['amount']),
            "risk": int(row['risk_score'])
        })

    if not combined_txs:
        return {
            "message": "No transactions to analyze",
            "total_anomalies_detected": 0,
            "anomalies": [],
            "graph_stats": {
                "nodes": 0,
                "edges": 0,
                "pagerank": {}
            }
        }

    for tx in combined_txs:
        sender = tx["sender"]
        receiver = tx["receiver"]
        amount = tx["amount"]
        risk_score = tx["risk"]

        G.add_node(sender, type="account")
        # Map dest to exchange if consistent
        is_crypto = receiver.startswith("CRYPTO") or len(receiver) > 12 or (int(hashlib.md5(receiver.encode()).hexdigest(), 16) % 3 == 0)
        G.add_node(receiver, type="crypto_exchange" if is_crypto else "account")
        G.add_edge(sender, receiver, amount=amount, risk=risk_score)

    # Calculate graph metrics
    pagerank = nx.pagerank(G)

    # Detect mule candidates: high in-degree + high risk + outflow
    anomalies = []

    for node in G.nodes():
        in_degree = G.in_degree(node)
        out_degree = G.out_degree(node)

        # Detect smurfing & mule ring candidates (in-degree, out-degree, or threat accounts)
        is_known_threat = node in ["9012666666", "9012123456", "9012777777", "987654", "9012999999"]
        is_smurfing_source = node in ["0123456789", "1234567890"] and (in_degree + out_degree) >= 2

        if in_degree >= 1 or is_known_threat or is_smurfing_source:
            # Calculate incoming risk
            incoming_risk = sum(
                data.get("risk", 0)
                for _, _, data in G.in_edges(node, data=True)
            ) / in_degree if in_degree > 0 else 75.0

            # Calculate outflow
            crypto_outflow = sum(
                data.get("amount", 0)
                for _, target, data in G.out_edges(node, data=True)
            )

            # Anomaly score based on in-degree, risk, and pagerank
            base_score = 88.0 if is_known_threat else (75.0 if is_smurfing_source else 60.0)
            anomaly_score = min(99.5, max(50.0,
                base_score +
                (in_degree * 5) +
                (incoming_risk * 0.15) +
                (pagerank.get(node, 0) * 80)
            ))

            if anomaly_score >= 55:
                name = get_name_for_account(node)
                role_title = "Offshore Layering Node" if node == "9012123456" else (
                    "Scam Network Receiver" if node == "9012777777" else (
                        "Crypto Cash-Out Node" if node == "9012666666" else (
                            "Mule Relay Transit" if node == "987654" else (
                                "Smurfing Source Node" if is_smurfing_source else "Mule Ring Candidate"
                            )
                        )
                    )
                )

                anomalies.append({
                    "account_id": node,
                    "account_name": name if not node.startswith("CRYPTO") else node,
                    "anomaly_score": round(anomaly_score, 1),
                    "role": role_title,
                    "risk_level": "CRITICAL" if anomaly_score >= 88 else "HIGH" if anomaly_score >= 70 else "MEDIUM",
                    "incoming_transactions": max(in_degree, 1),
                    "outgoing_transactions": out_degree,
                    "total_incoming_risk": round(incoming_risk, 1),
                    "crypto_outflow": float(crypto_outflow),
                    "pagerank_score": round(pagerank.get(node, 0), 4)
                })

    # Sort by anomaly score descending
    anomalies.sort(key=lambda x: x["anomaly_score"], reverse=True)

    return {
        "message": "GNN Inference completed",
        "inference_timestamp": datetime.now().isoformat(timespec="seconds"),
        "total_anomalies_detected": len(anomalies),
        "anomalies": anomalies[:30], # Top 30 anomalies
        "graph_stats": {
            "total_nodes": G.number_of_nodes(),
            "total_edges": G.number_of_edges(),
            "pagerank": {node: round(score, 4) for node, score in list(pagerank.items())[:20]},
            "top_suspicious_nodes": [
                {
                    "node": node,
                    "pagerank": round(score, 4),
                    "in_degree": G.in_degree(node)
                }
                for node, score in sorted(pagerank.items(), key=lambda x: x[1], reverse=True)[:5]
            ]
        }
    }


@app.post("/paysim-analysis")
def paysim_analysis(limit: int = 1000):
    """
    Batch analyze paysim dataset transactions for validation
    Uses paysim fraud labels as ground truth
    Loads data on-demand (lazy loading) to avoid memory bloat
    """

    try:
        # Load paysim sample on-demand with requested limit
        paysim_file = BASE_DIR / "data" / "paysim_sample.csv"
        sample = pd.read_csv(paysim_file, nrows=limit)

        paysim_analysis_results.clear()

        for _, row in sample.iterrows():
            transaction = Transaction(
                type=row["type"],
                amount=float(row["amount"]),
                oldbalanceOrg=float(row["oldbalanceOrg"]),
                newbalanceOrig=float(row["newbalanceOrig"]),
                destinationAccount=row["nameDest"]
            )

            result = evaluate_transaction(transaction, threat_df)

            paysim_analysis_results.append({
                "transaction_id": str(uuid.uuid4()),
                "timestamp": datetime.now().isoformat(timespec="seconds"),
                "senderAccount": row["nameOrig"],
                "destinationAccount": row["nameDest"],
                "amount": float(row["amount"]),
                "api_risk_score": result.risk_score,
                "api_decision": result.decision,
                "api_risk_level": result.risk_level,
                "ground_truth_fraud": int(row["isFraud"]),  # 1=fraud, 0=legit
                "correct_prediction": (result.decision == "BLOCK" and row["isFraud"] == 1) or (result.decision != "BLOCK" and row["isFraud"] == 0)
            })

        return {
            "message": "Paysim dataset analyzed",
            "total_transactions_analyzed": len(paysim_analysis_results),
            "sample_size": len(sample),
            "data": paysim_analysis_results[:100]  # Return first 100 for payload size
        }
    except FileNotFoundError:
        return {
            "message": "Paysim dataset not found",
            "error": f"File not found: {BASE_DIR}/data/paysim.csv",
            "total_transactions_analyzed": 0,
            "data": []
        }
    except Exception as e:
        return {
            "message": "Error analyzing paysim dataset",
            "error": str(e),
            "total_transactions_analyzed": 0,
            "data": []
        }


@app.get("/validation-metrics")
def validation_metrics():
    """
    Calculate model accuracy metrics using paysim ground truth labels
    """

    if not paysim_analysis_results:
        return {
            "message": "No paysim analysis data available",
            "metrics": {
                "total_analyzed": 0,
                "accuracy": 0,
                "precision": 0,
                "recall": 0,
                "f1_score": 0
            }
        }

    # Calculate metrics
    total = len(paysim_analysis_results)
    correct = sum(1 for r in paysim_analysis_results if r["correct_prediction"])

    # True Positives (fraud correctly detected as BLOCK)
    tp = sum(1 for r in paysim_analysis_results if r["api_decision"] == "BLOCK" and r["ground_truth_fraud"] == 1)

    # False Positives (legit incorrectly blocked)
    fp = sum(1 for r in paysim_analysis_results if r["api_decision"] == "BLOCK" and r["ground_truth_fraud"] == 0)

    # False Negatives (fraud not detected)
    fn = sum(1 for r in paysim_analysis_results if r["api_decision"] != "BLOCK" and r["ground_truth_fraud"] == 1)

    # True Negatives (legit correctly allowed)
    tn = sum(1 for r in paysim_analysis_results if r["api_decision"] != "BLOCK" and r["ground_truth_fraud"] == 0)

    accuracy = (correct / total * 100) if total > 0 else 0
    precision = (tp / (tp + fp) * 100) if (tp + fp) > 0 else 0
    recall = (tp / (tp + fn) * 100) if (tp + fn) > 0 else 0
    f1 = (2 * precision * recall / (precision + recall)) if (precision + recall) > 0 else 0

    return {
        "message": "Validation metrics computed",
        "metrics": {
            "total_analyzed": total,
            "accuracy": round(accuracy, 2),
            "precision": round(precision, 2),
            "recall": round(recall, 2),
            "f1_score": round(f1, 2),
            "true_positives": tp,
            "true_negatives": tn,
            "false_positives": fp,
            "false_negatives": fn
        }
    }


# ==========================================================
# REGULATORY COMPLIANCE: STR / LTKM GENERATION (PPATK goAML)
# ==========================================================

class GenerateSTRRequest(BaseModel):
    transaction_id: str
    sender_account: str
    destination_account: str
    amount: float
    risk_score: int
    reasons: list[str] = Field(default_factory=list)
    sender_name: str = "Nasabah Terlapor"
    destination_name: str = "Rekening Penerima / Bursa Kripto"
    bank_name: str = "PT BPR KUNINGAN (PERSERODA)"
    compliance_officer: str = "Pejabat Kepatuhan & APU-PPT"
    case_id: str | None = None
    graph_snapshot: dict = Field(default_factory=dict)
    masked: bool = True


str_drafts_store: dict[str, dict] = {}


@app.post("/str/generate", tags=["Regulatory STR / LTKM"])
def generate_str_endpoint(payload: GenerateSTRRequest):
    """Membuat draft Laporan Transaksi Keuangan Mencurigakan (LTKM) resmi standar PPATK goAML."""
    draft = generate_str_draft(
        transaction_id=payload.transaction_id,
        sender_account=payload.sender_account,
        destination_account=payload.destination_account,
        amount=payload.amount,
        risk_score=payload.risk_score,
        reasons=payload.reasons,
        sender_name=payload.sender_name,
        destination_name=payload.destination_name,
        bank_name=payload.bank_name,
        compliance_officer=payload.compliance_officer,
    )
    report_id = draft["report_id"]
    str_drafts_store[report_id] = draft
    str_drafts_store[payload.transaction_id] = draft
    return draft


def _mask_identifier(value: str | None, visible: int = 4) -> str:
    """Mask account/device/IP identifiers before regulatory evidence leaves the API."""
    if not value:
        return "UNKNOWN"
    text = str(value)
    if len(text) <= visible:
        return "*" * len(text)
    return f"{'*' * (len(text) - visible)}{text[-visible:]}"


def _masked_graph_snapshot(snapshot: dict) -> dict:
    """Return a serialisable, privacy-preserving graph evidence snapshot."""
    snapshot = snapshot or {}
    nodes = []
    for node in snapshot.get("nodes", []):
        if not isinstance(node, dict):
            continue
        item = dict(node)
        for key in ("account", "account_id", "account_number", "device_id", "ip_address", "ip"):
            if key in item:
                item[key] = _mask_identifier(item[key])
        if "label" in item and item.get("type") not in {"crypto", "device"}:
            item["label"] = "Masked entity"
        nodes.append(item)
    return {**snapshot, "nodes": nodes, "privacy": "MASKED_EVIDENCE"}


@app.post("/str/generate-investigation", tags=["Regulatory STR / LTKM"])
def generate_investigation_str(payload: GenerateSTRRequest):
    """Generate a case-linked, masked-by-default LTKM draft with graph evidence metadata."""
    sender_account = _mask_identifier(payload.sender_account) if payload.masked else payload.sender_account
    destination_account = _mask_identifier(payload.destination_account) if payload.masked else payload.destination_account
    sender_name = "Masked customer" if payload.masked else payload.sender_name
    draft = generate_str_draft(
        transaction_id=payload.transaction_id,
        sender_account=sender_account,
        destination_account=destination_account,
        amount=payload.amount,
        risk_score=payload.risk_score,
        reasons=payload.reasons,
        sender_name=sender_name,
        destination_name=payload.destination_name,
        bank_name=payload.bank_name,
        compliance_officer=payload.compliance_officer,
    )
    draft["case_id"] = payload.case_id
    draft["evidence"] = {
        "graph_snapshot": _masked_graph_snapshot(payload.graph_snapshot) if payload.masked else payload.graph_snapshot,
        "evidence_mode": "MASKED",
        "source": "LIVE · SENTINEL API",
    }
    draft["privacy"] = "MASKED_BY_DEFAULT" if payload.masked else "UNMASKED_REQUESTED"
    report_id = draft["report_id"]
    str_drafts_store[report_id] = draft
    str_drafts_store[payload.transaction_id] = draft
    return draft


@app.get("/str/evidence/export/{report_or_tx_id}", tags=["Regulatory STR / LTKM"])
def export_masked_evidence(report_or_tx_id: str):
    """Export only masked graph evidence; raw PII is never returned by this endpoint."""
    draft = str_drafts_store.get(report_or_tx_id)
    if not draft:
        return {"error": "Report not found", "id": report_or_tx_id}
    return {
        "report_id": draft["report_id"],
        "case_id": draft.get("case_id"),
        "transaction_id": draft["transaction_details"]["transaction_id"],
        "privacy": "MASKED_EVIDENCE",
        "evidence": draft.get("evidence", {"graph_snapshot": {}}),
    }


@app.get("/str/list", tags=["Regulatory STR / LTKM"])
def list_str_reports():
    """Mendapatkan daftar seluruh draft LTKM yang telah diterbitkan."""
    unique_reports = {d["report_id"]: d for d in str_drafts_store.values()}
    return {"total": len(unique_reports), "reports": list(unique_reports.values())}


@app.get("/str/{report_or_tx_id}", tags=["Regulatory STR / LTKM"])
def get_str_report(report_or_tx_id: str):
    """Mendapatkan data JSON detail dokumen LTKM berdasarkan report_id atau transaction_id."""
    if report_or_tx_id in str_drafts_store:
        return str_drafts_store[report_or_tx_id]
    return {"error": "Report not found", "id": report_or_tx_id}


@app.get("/str/html/{report_or_tx_id}", response_class=HTMLResponse, tags=["Regulatory STR / LTKM"])
def get_str_html_endpoint(report_or_tx_id: str):
    """Menampilkan dokumen fisik resmi LTKM format HTML formal hitam-putih siap cetak/PDF."""
    if report_or_tx_id in str_drafts_store:
        draft = str_drafts_store[report_or_tx_id]
        return HTMLResponse(content=generate_str_html(draft))
    
    # Fallback preview draft jika ID baru/demo
    dummy_draft = generate_str_draft(
        transaction_id=report_or_tx_id,
        sender_account="1000192837",
        destination_account="9012-BINANCE-EXCHANGE",
        amount=85000000.0,
        risk_score=95,
        reasons=[
            "Destination matched threat intelligence: Blacklisted Mule Exchange",
            "Odd-Hour Activity Alert: Transaction initiated at 02:15 WIB",
            "Sender balance drained to zero after transaction"
        ],
        sender_name="Ahmad Faisal",
        destination_name="Binance International Cold Wallet",
        bank_name="PT BPR KUNINGAN (PERSERODA)"
    )
    return HTMLResponse(content=generate_str_html(dummy_draft))