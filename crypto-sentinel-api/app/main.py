from pathlib import Path
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
import pandas as pd
import uuid
import networkx as nx

from app.rule_engine import evaluate_transaction


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


BASE_DIR = Path(__file__).resolve().parent.parent

df = pd.read_csv(BASE_DIR / "data" / "paysim_sample.csv")
threat_df = pd.read_csv(BASE_DIR / "data" / "threat_intel.csv")
demo_df = pd.read_csv(BASE_DIR / "data" / "demo_transactions.csv")

transaction_logs = []


class Transaction(BaseModel):
    type: str
    amount: float
    oldbalanceOrg: float
    newbalanceOrig: float
    destinationAccount: str


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
    result = evaluate_transaction(transaction, threat_df)

    payload = {
        "transaction_id": str(uuid.uuid4()),
        "timestamp": datetime.now().isoformat(timespec="seconds"),
        "transaction": transaction.model_dump(),
        "risk_score": result.risk_score,
        "risk_level": result.risk_level,
        "decision": result.decision,
        "reasons": result.reasons,
        "threat_match": result.threat_match
    }

    transaction_logs.append(payload)

    return payload


@app.get("/logs")
def get_logs():
    return {
        "total": len(transaction_logs),
        "data": transaction_logs
    }


@app.get("/alerts")
def get_alerts():
    alerts = [
        log for log in transaction_logs
        if log["decision"] in ["REVIEW", "BLOCK"]
    ]

    return {
        "total": len(alerts),
        "data": alerts
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

    for _, row in demo_df.iterrows():
        sender = row["sender"]
        receiver = row["receiver"]

        G.add_node(sender)
        G.add_node(receiver)
        G.add_edge(
            sender,
            receiver,
            amount=row["amount"],
            transaction_type=row["type"],
            scenario=row["scenario"]
        )

    nodes = [
        {
            "id": node,
            "label": node,
            "degree": G.degree(node),
            "in_degree": G.in_degree(node),
            "out_degree": G.out_degree(node)
        }
        for node in G.nodes()
    ]

    edges = [
        {
            "source": source,
            "target": target,
            "amount": data["amount"],
            "transaction_type": data["transaction_type"],
            "scenario": data["scenario"]
        }
        for source, target, data in G.edges(data=True)
    ]

    mule_candidates = [
        node for node in G.nodes()
        if G.in_degree(node) >= 3
    ]

    return {
        "scenario": "Synthetic crypto laundering demo",
        "total_nodes": len(nodes),
        "total_edges": len(edges),
        "mule_candidates": mule_candidates,
        "nodes": nodes,
        "edges": edges
    }
    
    
@app.get("/statistics")
def get_statistics():
    total_logs = len(transaction_logs)

    allow_count = len([log for log in transaction_logs if log["decision"] == "ALLOW"])
    review_count = len([log for log in transaction_logs if log["decision"] == "REVIEW"])
    block_count = len([log for log in transaction_logs if log["decision"] == "BLOCK"])

    low_risk = len([log for log in transaction_logs if log["risk_level"] == "LOW"])
    medium_risk = len([log for log in transaction_logs if log["risk_level"] == "MEDIUM"])
    high_risk = len([log for log in transaction_logs if log["risk_level"] == "HIGH"])

    return {
        "total_transactions_analyzed": total_logs,
        "decision_summary": {
            "ALLOW": allow_count,
            "REVIEW": review_count,
            "BLOCK": block_count
        },
        "risk_level_summary": {
            "LOW": low_risk,
            "MEDIUM": medium_risk,
            "HIGH": high_risk
        }
    }
    
    
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