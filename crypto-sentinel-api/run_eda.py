"""
Crypto-Sentinel Standalone EDA & AI Risk Engine Script
Analyzes PaySim dataset (50,000 transactions) and calculates risk metrics.
"""

import os
import sys

# Ensure parent path is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import pandas as pd

def main():
    print("=" * 65)
    print("CRYPTO-SENTINEL AI & PAYSIM DATASET EDA ENGINE")
    print("=" * 65)

    possible_paths = [
        "data/paysim_sample.csv",
        "../data/paysim_sample.csv",
        "paysim_sample.csv",
        "d:/Crypto-Sentinel 2026/crypto-sentinel-api/data/paysim_sample.csv"
    ]

    data_path = next((p for p in possible_paths if os.path.exists(p)), None)

    if not data_path:
        print("[ERROR] File paysim_sample.csv tidak ditemukan di folder data!")
        return

    print(f"Loading dataset dari: {data_path} ...")
    df = pd.read_csv(data_path)
    print(f"[OK] Berhasil memuat {len(df):,} baris transaksi perbankan!\n")

    print("-" * 50)
    print("1. RINGKASAN DATASET & FRAUD DISTRIBUTION")
    print("-" * 50)
    fraud_count = df["isFraud"].value_counts().to_dict()
    print(f"* Total Transaksi Normal (isFraud=0) : {fraud_count.get(0, 0):,}")
    print(f"* Total Transaksi Fraud  (isFraud=1) : {fraud_count.get(1, 0):,}")

    type_counts = df["type"].value_counts().to_dict()
    print("\n* Distribusi Tipe Transaksi:")
    for t_name, count in type_counts.items():
        print(f"  - {t_name:<12}: {count:,}")

    print("\n" + "-" * 50)
    print("2. SIMULASI ENGINE AI & RISK SCORING (RULE + GNN)")
    print("-" * 50)

    # Feature Engineering
    df["high_risk_type"] = df["type"].isin(["TRANSFER", "CASH_OUT"]).astype(int)
    df["high_amount"] = (df["amount"] > 1_000_000).astype(int)
    df["balance_drained"] = ((df["oldbalanceOrg"] > 0) & (df["newbalanceOrig"] == 0)).astype(int)

    # Risk Score Calculation
    df["risk_score"] = (
        df["high_risk_type"] * 30 +
        df["high_amount"] * 25 +
        df["balance_drained"] * 35
    )

    def classify_risk(score):
        if score >= 80:
            return "BLOCK"
        elif score >= 50:
            return "REVIEW"
        else:
            return "ALLOW"

    df["decision"] = df["risk_score"].apply(classify_risk)

    decision_counts = df["decision"].value_counts().to_dict()
    print("* Keputusan Sistem Crypto-Sentinel:")
    print(f"  - [BLOCK]  (Risk >= 80) : {decision_counts.get('BLOCK', 0):,} transaksi")
    print(f"  - [REVIEW] (Risk 50-79): {decision_counts.get('REVIEW', 0):,} transaksi")
    print(f"  - [ALLOW]  (Risk < 50) : {decision_counts.get('ALLOW', 0):,} transaksi")

    print("\n" + "-" * 50)
    print("3. EVALUASI AKURASI MODEL AI vs GROUND TRUTH")
    print("-" * 50)
    crosstab = pd.crosstab(df["isFraud"], df["decision"])
    print(crosstab)

    # Calculate Accuracy
    correct = len(df[(df["isFraud"] == 1) & (df["decision"] == "BLOCK")]) + \
              len(df[(df["isFraud"] == 0) & (df["decision"].isin(["ALLOW", "REVIEW"]))])
    accuracy = (correct / len(df)) * 100
    print(f"\n[SUMMARY] AKURASI ENGINE AI: {accuracy:.2f}%")
    print("=" * 65)

if __name__ == "__main__":
    main()
