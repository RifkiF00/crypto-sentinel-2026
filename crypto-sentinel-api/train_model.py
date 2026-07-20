"""
Crypto-Sentinel Machine Learning Model Training & Evaluation Pipeline
Trains Random Forest Classifier on PaySim dataset.
Generates Confusion Matrix, ROC-AUC Curve, Feature Importance Plots, and saves ml_model.joblib.
"""

import os
import sys
import joblib
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    roc_curve,
    auc,
    accuracy_score,
    precision_score,
    recall_score,
    f1_score
)

# Set dark theme style for plots
plt.style.use('dark_background')
plt.rcParams['font.family'] = 'sans-serif'

def main():
    print("=" * 70)
    print("CRYPTO-SENTINEL ML MODEL TRAINING & EVALUATION PIPELINE")
    print("=" * 70)

    # 1. Load Dataset
    possible_paths = [
        "data/paysim_sample.csv",
        "../data/paysim_sample.csv",
        "paysim_sample.csv",
        "d:/Crypto-Sentinel 2026/crypto-sentinel-api/data/paysim_sample.csv"
    ]
    data_path = next((p for p in possible_paths if os.path.exists(p)), None)

    if not data_path:
        print("[ERROR] Dataset paysim_sample.csv not found!")
        return

    print(f"Loading dataset from: {data_path} ...")
    df = pd.read_csv(data_path)
    print(f"[OK] Loaded {len(df):,} transactions.\n")

    # 2. Feature Engineering & Preprocessing
    print("Preprocessing & Feature Engineering ...")
    
    # Feature 1: High risk transaction type (TRANSFER or CASH_OUT)
    df["is_transfer_or_cashout"] = df["type"].isin(["TRANSFER", "CASH_OUT"]).astype(int)
    
    # Feature 2: High amount threshold (> 1,000,000 IDR / USD equivalent)
    df["is_high_amount"] = (df["amount"] > 1_000_000).astype(int)
    
    # Feature 3: Balance drained flag (oldbalanceOrg > 0 and newbalanceOrig == 0)
    df["is_balance_drained"] = ((df["oldbalanceOrg"] > 0) & (df["newbalanceOrig"] == 0)).astype(int)
    
    # Feature 4: Amount to old balance ratio
    df["amount_ratio"] = np.where(df["oldbalanceOrg"] > 0, df["amount"] / (df["oldbalanceOrg"] + 1), 0)
    
    # Feature 5: Dest balance error (newbalanceDest - oldbalanceDest - amount)
    df["dest_balance_err"] = df["newbalanceDest"] - df["oldbalanceDest"] - df["amount"]
    
    # One-hot encode type
    type_dummies = pd.get_dummies(df["type"], prefix="type", drop_first=False)
    
    feature_cols = [
        "amount",
        "oldbalanceOrg",
        "newbalanceOrig",
        "oldbalanceDest",
        "newbalanceDest",
        "is_transfer_or_cashout",
        "is_high_amount",
        "is_balance_drained",
        "amount_ratio",
        "dest_balance_err"
    ] + list(type_dummies.columns)

    X = pd.concat([df[feature_cols[:10]], type_dummies], axis=1)
    y = df["isFraud"]

    print(f"[OK] Features matrix shape: {X.shape}, Target distribution: Fraud={y.sum()}, Normal={len(y)-y.sum()}")

    # 3. Train-Test Split (80% Train, 20% Test)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    print(f"[OK] Train set: {len(X_train):,} samples, Test set: {len(X_test):,} samples.\n")

    # 4. Multi-Epoch Simulated Training Loop
    print("Training Random Forest Classifier (100 Trees) with Class Balancing ...")
    model = RandomForestClassifier(
        n_estimators=100,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1
    )

    epochs = 5
    epoch_acc = []
    epoch_loss = []

    for epoch in range(1, epochs + 1):
        model.set_params(n_estimators=epoch * 20)
        model.fit(X_train, y_train)
        
        train_preds = model.predict(X_train)
        acc = accuracy_score(y_train, train_preds)
        loss = 1.0 - acc
        
        epoch_acc.append(acc)
        epoch_loss.append(loss)
        print(f"  --> Epoch {epoch}/{epochs} [Trees: {epoch*20:3d}] - Train Accuracy: {acc*100:.2f}% | Loss: {loss:.4f}")

    print("\n[OK] Model training completed successfully!")

    # 5. Evaluate Model on Test Set
    y_pred = model.predict(X_test)
    y_proba = model.predict_proba(X_test)[:, 1]

    test_acc = accuracy_score(y_test, y_pred)
    test_prec = precision_score(y_test, y_pred, zero_division=0)
    test_rec = recall_score(y_test, y_pred, zero_division=0)
    test_f1 = f1_score(y_test, y_pred, zero_division=0)
    fpr, tpr, _ = roc_curve(y_test, y_proba)
    roc_auc = auc(fpr, tpr)

    print("\n" + "=" * 70)
    print("MODEL PERFORMANCE EVALUATION METRICS")
    print("=" * 70)
    print(f"* Accuracy  : {test_acc*100:.2f}%")
    print(f"* Precision : {test_prec*100:.2f}%")
    print(f"* Recall    : {test_rec*100:.2f}%")
    print(f"* F1-Score  : {test_f1*100:.2f}%")
    print(f"* ROC-AUC   : {roc_auc:.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=["Normal (0)", "Fraud (1)"]))

    # 6. Generate & Save High-Resolution Charts
    charts_dir = r"d:\Crypto-Sentinel 2026\crypto-sentinel-api\notebooks\charts"
    os.makedirs(charts_dir, exist_ok=True)

    # Chart 1: Confusion Matrix Heatmap
    plt.figure(figsize=(7, 6))
    cm = confusion_matrix(y_test, y_pred)
    sns.heatmap(
        cm, annot=True, fmt="d", cmap="YlGnBu", cbar=True,
        xticklabels=["Normal", "Fraud"],
        yticklabels=["Normal", "Fraud"],
        linewidths=1, linecolor="#1f2937"
    )
    plt.title("Confusion Matrix Heatmap - CryptoSentinel AI", fontsize=14, fontweight="bold", color="#00f5c8", pad=15)
    plt.xlabel("Predicted Class", fontsize=12, labelpad=10)
    plt.ylabel("Actual Ground Truth", fontsize=12, labelpad=10)
    plt.tight_layout()
    cm_path = os.path.join(charts_dir, "confusion_matrix.png")
    plt.savefig(cm_path, dpi=300)
    plt.close()
    print(f"[PLOT] Saved Confusion Matrix plot to: {cm_path}")

    # Chart 2: ROC-AUC Curve
    plt.figure(figsize=(7, 6))
    plt.plot(fpr, tpr, color="#00f5c8", lw=3, label=f"ROC Curve (AUC = {roc_auc:.4f})")
    plt.plot([0, 1], [0, 1], color="#ef4444", lw=2, linestyle="--", label="Random Classifier")
    plt.xlim([0.0, 1.0])
    plt.ylim([0.0, 1.05])
    plt.xlabel("False Positive Rate (FPR)", fontsize=12, labelpad=10)
    plt.ylabel("True Positive Rate (TPR / Recall)", fontsize=12, labelpad=10)
    plt.title("ROC-AUC Curve - CryptoSentinel Model", fontsize=14, fontweight="bold", color="#818cf8", pad=15)
    plt.legend(loc="lower right", fontsize=11)
    plt.grid(True, alpha=0.15)
    plt.tight_layout()
    roc_path = os.path.join(charts_dir, "roc_curve.png")
    plt.savefig(roc_path, dpi=300)
    plt.close()
    print(f"[PLOT] Saved ROC Curve plot to: {roc_path}")

    # Chart 3: Feature Importance Bar Chart
    plt.figure(figsize=(9, 6))
    importances = model.feature_importances_
    indices = np.argsort(importances)[::-1][:10]
    top_features = [X.columns[i] for i in indices]
    top_importances = importances[indices]

    sns.barplot(x=top_importances, y=top_features, palette="mako")
    plt.title("Top 10 Feature Importances in Money Laundering Detection", fontsize=13, fontweight="bold", color="#f59e0b", pad=15)
    plt.xlabel("Relative Importance Score", fontsize=11, labelpad=10)
    plt.ylabel("Feature Name", fontsize=11)
    plt.tight_layout()
    fi_path = os.path.join(charts_dir, "feature_importance.png")
    plt.savefig(fi_path, dpi=300)
    plt.close()
    print(f"[PLOT] Saved Feature Importance plot to: {fi_path}")

    # Chart 4: Training Loss & Accuracy Curve
    plt.figure(figsize=(8, 5))
    plt.plot(range(1, epochs + 1), [a * 100 for a in epoch_acc], marker="o", color="#10b981", lw=2.5, label="Training Accuracy (%)")
    plt.plot(range(1, epochs + 1), [l * 100 for l in epoch_loss], marker="s", color="#ef4444", lw=2.5, label="Training Loss (%)")
    plt.title("Model Training & Loss Curves across Epochs", fontsize=13, fontweight="bold", color="#3b82f6", pad=15)
    plt.xlabel("Epoch / Iteration", fontsize=11)
    plt.ylabel("Percentage (%)", fontsize=11)
    plt.legend(loc="center right")
    plt.grid(True, alpha=0.15)
    plt.tight_layout()
    loss_path = os.path.join(charts_dir, "training_loss_accuracy.png")
    plt.savefig(loss_path, dpi=300)
    plt.close()
    print(f"[PLOT] Saved Training Loss & Accuracy plot to: {loss_path}")

    # 7. Save Trained Model Weights
    model_save_path = r"d:\Crypto-Sentinel 2026\crypto-sentinel-api\app\ml_model.joblib"
    joblib.dump(model, model_save_path)
    print(f"\n[SAVE] Saved trained Random Forest model to: {model_save_path}")
    print("=" * 70)
    print("ML MODEL TRAINING PIPELINE COMPLETED SUCCESSFULLY!")
    print("=" * 70)

if __name__ == "__main__":
    main()
