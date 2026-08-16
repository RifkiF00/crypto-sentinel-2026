"""
Script: prepare_dataset.py
Tujuan: Sampling stratifikasi dari paysimfull.csv (6.3M) + generate paysim_sample.csv baru
Strategi:
  - Ambil SEMUA fraud rows (~8,213 baris)
  - Ambil 300,000 normal rows (stratified per tipe transaksi)
  - Tambahkan kolom custom (risk_score, decision, dll) agar kompatibel dengan main.py
  - Simpan ke crypto-sentinel-api/data/paysim_sample.csv (menggantikan yang lama)

SMOTE: Dilakukan di notebook saat training, BUKAN di sini.
       (SMOTE hanya pada training set, bukan di raw CSV)
"""

import os
import sys
import pandas as pd
import numpy as np

sys.stdout.reconfigure(encoding='utf-8')
np.random.seed(42)

# ─── Paths ────────────────────────────────────────────────────────
BASE = r"d:\Crypto-Sentinel 2026\crypto-sentinel-api\data"
FULL_PATH   = os.path.join(BASE, "paysimfull.csv")
OUTPUT_PATH = os.path.join(BASE, "paysim_sample.csv")
BACKUP_PATH = os.path.join(BASE, "paysim_sample_50k_backup.csv")

# ─── Config ───────────────────────────────────────────────────────
N_NORMAL = 300_000   # normal transactions to sample

print("=" * 65)
print("CRYPTO-SENTINEL — Dataset Preparation")
print("=" * 65)

# ─── 1. Backup existing sample ────────────────────────────────────
if os.path.exists(OUTPUT_PATH):
    import shutil
    shutil.copy(OUTPUT_PATH, BACKUP_PATH)
    print(f"[OK] Backup existing sample → {BACKUP_PATH}")

# ─── 2. Load full PaySim (chunked for memory efficiency) ──────────
print(f"\nLoading paysimfull.csv ({os.path.getsize(FULL_PATH)/1024/1024:.0f} MB)...")
print("     This may take 1-2 minutes...")

# Read with explicit dtypes to speed up
dtype_map = {
    "step": "int32",
    "amount": "float32",
    "oldbalanceOrg": "float32",
    "newbalanceOrig": "float32",
    "oldbalanceDest": "float32",
    "newbalanceDest": "float32",
    "isFraud": "int8",
    "isFlaggedFraud": "int8",
}
df_full = pd.read_csv(FULL_PATH, dtype=dtype_map)
print(f"[OK] Loaded: {len(df_full):,} rows | Columns: {list(df_full.columns)}")

# ─── 3. Separate fraud vs normal ──────────────────────────────────
fraud_df  = df_full[df_full["isFraud"] == 1].copy()
normal_df = df_full[df_full["isFraud"] == 0].copy()

print(f"\nFraud rows (ALL)  : {len(fraud_df):,}")
print(f"Normal rows total : {len(normal_df):,}")
print(f"Fraud rate full   : {len(fraud_df)/len(df_full)*100:.4f}%")

# Free full dataset from memory
del df_full

# ─── 4. Stratified sample of normal transactions ──────────────────
# Sample proportionally per transaction type to preserve distribution
print(f"\nSampling {N_NORMAL:,} normal transactions (stratified by type)...")

type_counts = normal_df["type"].value_counts(normalize=True)
print("Type distribution in normal:")
for t, p in type_counts.items():
    n = int(p * N_NORMAL)
    print(f"  {t:<10}: {p*100:.1f}% → {n:,} samples")

normal_sample = normal_df.groupby("type", group_keys=False).apply(
    lambda x: x.sample(n=int(len(x) / len(normal_df) * N_NORMAL),
                        random_state=42)
)

# Ensure exactly N_NORMAL rows (fix rounding)
if len(normal_sample) < N_NORMAL:
    extra = normal_df[~normal_df.index.isin(normal_sample.index)].sample(
        n=N_NORMAL - len(normal_sample), random_state=99
    )
    normal_sample = pd.concat([normal_sample, extra])
elif len(normal_sample) > N_NORMAL:
    normal_sample = normal_sample.sample(n=N_NORMAL, random_state=42)

print(f"[OK] Normal sample: {len(normal_sample):,} rows")
del normal_df

# ─── 5. Combine fraud + normal ────────────────────────────────────
df = pd.concat([fraud_df, normal_sample], ignore_index=True)
df = df.sample(frac=1, random_state=42).reset_index(drop=True)  # shuffle

print(f"\nCombined dataset: {len(df):,} rows")
print(f"  Fraud : {df['isFraud'].sum():,} ({df['isFraud'].mean()*100:.4f}%)")
print(f"  Normal: {(df['isFraud']==0).sum():,}")

# ─── 6. Add custom columns (kompatibel dengan main.py) ────────────
print("\nAdding custom feature columns...")

# risk_type: rule-based
def get_risk_type(row):
    if row["isFraud"] == 1:
        return "MONEY_LAUNDERING"
    if row["type"] in ["TRANSFER", "CASH_OUT"] and row["amount"] > 1_000_000:
        if row["oldbalanceOrg"] > 0 and row["newbalanceOrig"] == 0:
            return "SMURFING"
        return "HIGH_RISK_TRANSFER"
    if row["type"] == "CASH_OUT" and row["amount"] > 5_000_000:
        return "LARGE_CASH_OUT"
    return "NORMAL"

# Vectorized risk_score
df["high_amount"]     = (df["amount"] > 1_000_000).astype("int8")
df["balance_drained"] = ((df["oldbalanceOrg"] > 0) &
                         (df["newbalanceOrig"] == 0)).astype("int8")

# risk_score: weighted formula (0-100)
df["risk_score"] = (
    df["isFraud"] * 80 +
    df["high_amount"] * 10 +
    df["balance_drained"] * 10 +
    df["type"].isin(["TRANSFER", "CASH_OUT"]).astype(int) * 5
).clip(0, 100).astype("int8")

# decision
df["decision"] = df["risk_score"].apply(
    lambda s: "BLOCK" if s >= 85 else ("REVIEW" if s >= 60 else "ALLOW")
)

# risk_type (apply only on sample for speed - vectorized approx)
conditions = [
    df["isFraud"] == 1,
    (df["type"].isin(["TRANSFER", "CASH_OUT"])) & (df["amount"] > 1_000_000) & (df["balance_drained"] == 1),
    (df["type"].isin(["TRANSFER", "CASH_OUT"])) & (df["amount"] > 1_000_000),
    (df["type"] == "CASH_OUT") & (df["amount"] > 5_000_000),
]
choices = ["MONEY_LAUNDERING", "SMURFING", "HIGH_RISK_TRANSFER", "LARGE_CASH_OUT"]
df["risk_type"] = np.select(conditions, choices, default="NORMAL")

# reasons
df["reasons"] = df.apply(
    lambda r: "|".join(filter(None, [
        "high_amount" if r["high_amount"] else "",
        "balance_drained" if r["balance_drained"] else "",
        "fraud_flag" if r["isFraud"] else "",
    ])) or "none",
    axis=1
)

print("[OK] Custom columns added")

# ─── 7. Validate column compatibility with existing main.py ───────
required_cols = [
    "step", "type", "amount", "nameOrig", "oldbalanceOrg",
    "newbalanceOrig", "nameDest", "oldbalanceDest", "newbalanceDest",
    "isFraud", "isFlaggedFraud", "risk_type", "high_amount",
    "risk_score", "decision", "balance_drained", "reasons"
]
missing = [c for c in required_cols if c not in df.columns]
if missing:
    print(f"[WARN] Missing columns: {missing}")
else:
    print("[OK] All required columns present")

# Reorder to match original CSV column order
df = df[required_cols]

# ─── 8. Save ──────────────────────────────────────────────────────
print(f"\nSaving to {OUTPUT_PATH}...")
df.to_csv(OUTPUT_PATH, index=False)

size_mb = os.path.getsize(OUTPUT_PATH) / 1024 / 1024
print(f"[DONE] Saved!")
print(f"  Rows  : {len(df):,}")
print(f"  Fraud : {df['isFraud'].sum():,}")
print(f"  Size  : {size_mb:.1f} MB")
print(f"  Path  : {OUTPUT_PATH}")

# ─── 9. Summary stats ─────────────────────────────────────────────
print("\n" + "=" * 65)
print("DATASET SUMMARY")
print("=" * 65)
print(f"Total transactions : {len(df):,}")
print(f"Fraud cases        : {df['isFraud'].sum():,} ({df['isFraud'].mean()*100:.4f}%)")
print(f"Decision breakdown :")
print(df["decision"].value_counts().to_string())
print(f"\nType breakdown:")
print(df["type"].value_counts().to_string())
print("=" * 65)
print("Next step: Run notebook 01_explore_paysim.ipynb with SMOTE enabled")
print("           SMOTE akan dilakukan hanya pada X_train (setelah split)")
print("=" * 65)
