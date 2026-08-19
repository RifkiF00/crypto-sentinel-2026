"""
inject_edge_cases.py — Crypto-Sentinel 2026
Menambahkan transaksi khas perbankan Indonesia ke dataset PaySim.
Output: data/paysim_augmented.csv
"""
import os
import random
import numpy as np
import pandas as pd

random.seed(42)
np.random.seed(42)

BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
INPUT_CSV  = os.path.join(BASE_DIR, "data", "paysim_sample.csv")
OUTPUT_CSV = os.path.join(BASE_DIR, "data", "paysim_augmented.csv")

# ── Account ID generators ─────────────────────────────────────────────────────
def gen_personal():   return "C" + str(random.randint(1_000_000_000, 9_999_999_999))
def gen_himbara():
    p = random.choice(["HIMBARA_BRI", "HIMBARA_BNI", "HIMBARA_MANDIRI"])
    return f"{p}_{random.randint(100000,999999)}"
def gen_school():     return f"SEKOLAH_{random.randint(1000,9999)}_KNG"
def gen_merchant():   return random.choice(["M_INDOMARET_QR","M_ALFAMART_QR","M_GOFOOD_QR","M_SHOPEE_PAY","M_GRAB_QR"])
def gen_crypto():     return random.choice(["INDODAX_HOT_WALLET","PINTU_EXCHANGE_ADDR","TOKOCRYPTO_COLD","BINANCE_ID_ADDR"])

# ── Row builder ────────────────────────────────────────────────────────────────
def row(step, tx_type, amount, name_orig, old_bal_o, dest, old_bal_d,
        is_fraud, purpose_code, hour,
        is_known_merchant=0, dormant_days=0,
        risk_score=None, decision=None, reasons="none"):
    new_bal_o  = max(0.0, old_bal_o - amount)
    new_bal_d  = old_bal_d + amount
    bd         = 1 if (old_bal_o > 0 and new_bal_o == 0) else 0
    rs         = (95 if is_fraud else random.randint(0,20)) if risk_score is None else risk_score
    dec        = ("BLOCK" if is_fraud else "ALLOW") if decision is None else decision
    return {
        "step": step, "type": tx_type, "amount": round(amount,2),
        "nameOrig": name_orig, "oldbalanceOrg": round(old_bal_o,2),
        "newbalanceOrig": round(new_bal_o,2), "nameDest": dest,
        "oldbalanceDest": round(old_bal_d,2), "newbalanceDest": round(new_bal_d,2),
        "isFraud": int(is_fraud), "isFlaggedFraud": int(is_fraud),
        "risk_type": "FRAUD" if is_fraud else "NORMAL",
        "high_amount": 1 if amount > 1_000_000 else 0,
        "risk_score": rs, "decision": dec,
        "balance_drained": bd, "reasons": reasons,
        "purpose_code": purpose_code, "hour_of_day": hour,
        "is_known_merchant": is_known_merchant,
        "account_dormant_days": dormant_days,
    }

# ── Category generators ────────────────────────────────────────────────────────
def bansos_normal(n=3000):
    out = []
    for _ in range(n):
        amt = random.uniform(300_000, 600_000)
        out.append(row(random.randint(1,744),"TRANSFER",amt,gen_himbara(),
                       amt*random.uniform(50,200),gen_personal(),random.uniform(0,500_000),
                       0,"BANSOS",random.randint(8,15),
                       risk_score=random.randint(0,15),decision="ALLOW"))
    return out

def bansos_smurfing(n=200):
    out = []
    for _ in range(n):
        src   = gen_himbara()
        total = random.uniform(55_000_000, 90_000_000)
        nd    = random.randint(4, 7)
        per   = total / nd
        for _ in range(nd):
            out.append(row(random.randint(1,744),"TRANSFER",per,src,total*1.1,
                           gen_personal(),0,1,"BANSOS",random.randint(0,4),
                           risk_score=random.randint(88,100),decision="BLOCK",
                           reasons="smurfing_pattern|odd_hour|high_velocity"))
    return out

def spp_normal(n=2000):
    out = []
    for _ in range(n):
        amt = random.uniform(200_000, 1_500_000)
        out.append(row(random.randint(1,744),"TRANSFER",amt,gen_personal(),
                       amt*random.uniform(1.5,5),gen_school(),
                       random.uniform(1_000_000,50_000_000),
                       0,"SPP",random.randint(7,16),
                       risk_score=random.randint(0,10),decision="ALLOW"))
    return out

def spp_fraud(n=100):
    out = []
    for _ in range(n):
        amt = random.uniform(5_000_000, 15_000_000)
        out.append(row(random.randint(1,744),"TRANSFER",amt,gen_personal(),
                       amt*1.05,gen_personal(),0,1,"SPP",random.randint(22,23),
                       risk_score=random.randint(80,100),decision="BLOCK",
                       reasons="purpose_mismatch|odd_hour|high_amount"))
    return out

def merchant_normal(n=5000):
    out = []
    for _ in range(n):
        amt = random.uniform(10_000, 500_000)
        out.append(row(random.randint(1,744),"PAYMENT",amt,gen_personal(),
                       amt*random.uniform(2,10),gen_merchant(),
                       random.uniform(0,10_000_000),
                       0,"MERCHANT",random.randint(8,22),
                       is_known_merchant=1,risk_score=random.randint(0,8),decision="ALLOW"))
    return out

def merchant_fraud(n=300):
    out = []
    for _ in range(n):
        amt = round(random.uniform(1_000_000, 10_000_000), -5)
        name = "M_PALSU_" + str(random.randint(1000,9999))
        out.append(row(random.randint(1,744),"CASH_OUT",amt,name,
                       amt*1.1,gen_personal(),0,1,"MERCHANT",random.randint(0,5),
                       is_known_merchant=0,risk_score=random.randint(85,100),decision="BLOCK",
                       reasons="unknown_merchant|round_amount|cashout_pattern"))
    return out

def crypto_outflow(n=500):
    out = []
    for _ in range(n):
        amt = random.uniform(10_000_000, 300_000_000)
        out.append(row(random.randint(1,744),"TRANSFER",amt,gen_personal(),
                       amt*random.uniform(1.0,1.5),gen_crypto(),
                       random.uniform(0,1_000_000_000),
                       1,"CRYPTO",random.randint(0,23),
                       risk_score=random.randint(90,100),decision="BLOCK",
                       reasons="crypto_exchange_destination|threat_intel_match|high_amount"))
    return out

def dormant_reactivation(n=400):
    out = []
    for _ in range(n):
        amt = random.uniform(5_000_000, 90_000_000)
        d   = random.randint(180, 730)
        out.append(row(random.randint(1,744),"TRANSFER",amt,gen_personal(),
                       amt*random.uniform(1,3),gen_personal(),0,1,"GENERAL",
                       random.randint(0,23),dormant_days=d,
                       risk_score=random.randint(80,100),decision="BLOCK",
                       reasons="dormant_activation|high_amount"))
    return out

# ── Main ────────────────────────────────────────────────────────────────────────
def main():
    print("=" * 70)
    print("  CRYPTO-SENTINEL 2026 — DATASET EDGE CASE INJECTOR")
    print("=" * 70)

    print(f"\n[1/4] Loading original dataset...")
    df_orig = pd.read_csv(INPUT_CSV)
    print(f"      Original rows : {len(df_orig):,}")
    fraud_orig = df_orig["isFraud"].sum()
    print(f"      Fraud cases   : {fraud_orig:,}")

    print("\n[2/4] Generating Indonesian banking edge cases...")
    all_rows = []
    categories = [
        ("Bansos Normal        ", bansos_normal,        3000),
        ("Bansos Smurfing      ", bansos_smurfing,        200),
        ("SPP/BOP Normal       ", spp_normal,            2000),
        ("SPP Fraud            ", spp_fraud,              100),
        ("Merchant QRIS Normal ", merchant_normal,       5000),
        ("Merchant Fraud       ", merchant_fraud,         300),
        ("Crypto Outflow       ", crypto_outflow,         500),
        ("Dormant Reactivation ", dormant_reactivation,   400),
    ]
    for label, fn, count in categories:
        rows = fn(count)
        all_rows.extend(rows)
        fraud_n = sum(1 for r in rows if r["isFraud"] == 1)
        print(f"      + {label}: {len(rows):5,} rows  ({fraud_n} fraud)")

    df_new = pd.DataFrame(all_rows)
    new_fraud = df_new["isFraud"].sum()
    print(f"\n      Total new rows  : {len(df_new):,}")
    print(f"      New fraud rows  : {new_fraud:,}")

    print("\n[3/4] Merging datasets...")
    # Add new feature columns to original with safe defaults
    for col, default in [
        ("purpose_code", "GENERAL"),
        ("hour_of_day", 12),
        ("is_known_merchant", 0),
        ("account_dormant_days", 0),
    ]:
        if col not in df_orig.columns:
            df_orig[col] = default

    # Align column order
    all_cols = list(df_orig.columns)
    for col in df_new.columns:
        if col not in all_cols:
            all_cols.append(col)

    df_orig = df_orig.reindex(columns=all_cols)
    df_new  = df_new.reindex(columns=all_cols)

    df_combined = pd.concat([df_orig, df_new], ignore_index=True)
    df_combined = df_combined.sample(frac=1, random_state=42).reset_index(drop=True)

    total = len(df_combined)
    fraud = int(df_combined["isFraud"].sum())
    normal = total - fraud
    print(f"      Combined total  : {total:,}")
    print(f"      Fraud cases     : {fraud:,} ({fraud/total*100:.2f}%)")
    print(f"      Normal cases    : {normal:,}")
    print("\n      Purpose code distribution:")
    pc = df_combined["purpose_code"].value_counts()
    for k, v in pc.items():
        print(f"        {k:20s} : {v:,}")

    print(f"\n[4/4] Saving to: {OUTPUT_CSV}")
    df_combined.to_csv(OUTPUT_CSV, index=False)
    size_mb = os.path.getsize(OUTPUT_CSV) / 1_048_576
    print(f"      File saved! Size: {size_mb:.1f} MB")

    print("\n" + "=" * 70)
    print("  SELESAI — Update train_model.py to use paysim_augmented.csv")
    print("=" * 70)

if __name__ == "__main__":
    main()
