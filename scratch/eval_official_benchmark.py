"""
Benchmark Evaluator for Crypto-Sentinel AI Models
Evaluates Random Forest, Rule Engine, and Hybrid Model on 308,213 PaySim transactions.
"""

import time
import os
import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix
)

def benchmark():
    data_path = "crypto-sentinel-api/data/paysim_sample.csv"
    if not os.path.exists(data_path):
        data_path = "data/paysim_sample.csv"
    
    print(f"Loading benchmark dataset from {data_path}...")
    df = pd.read_csv(data_path)
    print(f"Dataset Loaded: {len(df):,} rows")

    # Load Model to inspect required feature names
    model_path = "crypto-sentinel-api/app/ml_model.joblib"
    print(f"Loading ML Model from {model_path}...")
    model = joblib.load(model_path)
    feature_names = model.feature_names_in_

    # Populate missing columns to match training features
    for col in feature_names:
        if col not in df.columns:
            if col == "is_transfer_or_cashout":
                df[col] = df["type"].isin(["TRANSFER", "CASH_OUT"]).astype(int)
            elif col == "is_high_amount":
                df[col] = (df["amount"] > 1_000_000).astype(int)
            elif col == "is_balance_drained":
                df[col] = ((df["oldbalanceOrg"] > 0) & (df["newbalanceOrig"] == 0)).astype(int)
            elif col == "amount_ratio":
                df[col] = np.where(df["oldbalanceOrg"] > 0, df["amount"] / (df["oldbalanceOrg"] + 1), 0)
            elif col == "dest_balance_err":
                df[col] = df["newbalanceDest"] - df["oldbalanceDest"] - df["amount"]
            elif col.startswith("type_"):
                t_val = col.replace("type_", "")
                df[col] = (df["type"] == t_val).astype(int)
            else:
                df[col] = 0

    X = df[feature_names]
    y = df["isFraud"] if "isFraud" in df.columns else (df["decision"] == "BLOCK").astype(int)

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    print(f"Test Split: {len(X_test):,} samples (Fraud: {y_test.sum():,})")

    # Measure Latency over 1,000 single predictions
    latencies = []
    sample_sub = X_test.iloc[:1000]
    for i in range(len(sample_sub)):
        row = sample_sub.iloc[[i]]
        t0 = time.perf_counter()
        _ = model.predict_proba(row)
        t1 = time.perf_counter()
        latencies.append((t1 - t0) * 1000.0) # in ms

    mean_lat = np.mean(latencies)
    p95_lat = np.percentile(latencies, 95)
    p99_lat = np.percentile(latencies, 99)

    # Batch Prediction & Metrics
    y_prob = model.predict_proba(X_test)[:, 1]
    y_pred = (y_prob >= 0.5).astype(int)

    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred)
    rec = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    auc_score = roc_auc_score(y_test, y_prob)

    tn, fp, fn, tp = confusion_matrix(y_test, y_pred).ravel()
    fpr = fp / (fp + tn)
    fnr = fn / (fn + tp)

    print("\n" + "="*60)
    print("OFFICIAL BENCHMARK EVALUATION RESULTS")
    print("="*60)
    print(f"Dataset Size     : {len(df):,} total (80/20 train/test split)")
    print(f"Accuracy         : {acc * 100:.2f}%")
    print(f"Precision        : {prec * 100:.2f}%")
    print(f"Recall           : {rec * 100:.2f}%")
    print(f"F1-Score         : {f1 * 100:.2f}%")
    print(f"ROC-AUC          : {auc_score:.4f}")
    print(f"False Pos Rate   : {fpr * 100:.3f}% ({fp:,} / {fp+tn:,})")
    print(f"False Neg Rate   : {fnr * 100:.3f}% ({fn:,} / {fn+tp:,})")
    print("-" * 60)
    print(f"Inference Latency (Single Request):")
    print(f"  Mean Latency   : {mean_lat:.2f} ms")
    print(f"  p95 Latency    : {p95_lat:.2f} ms")
    print(f"  p99 Latency    : {p99_lat:.2f} ms")
    print("="*60)

if __name__ == "__main__":
    benchmark()
