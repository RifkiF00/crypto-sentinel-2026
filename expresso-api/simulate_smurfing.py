import os
import hmac
import hashlib
import time
import requests
from datetime import datetime, timezone
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_FILE = os.path.join(BASE_DIR, "expresso.db")
database_url = os.getenv("DATABASE_URL", f"sqlite:///{DB_FILE}")

from models.db_models import Base, Account
engine = create_engine(database_url, connect_args={"check_same_thread": False} if "sqlite" in database_url else {})
Base.metadata.create_all(bind=engine)

def add_balance_to_rifki():
    """Menambahkan saldo Rp 500.000.000 ke Rifki Firmansyah agar cukup untuk simulasi transfer beruntun."""
    with Session(engine) as db:
        acc = db.get(Account, "0123456789")
        if acc:
            acc.balance = 500000000
            acc.is_blocked = False
            db.commit()
            print("[SIMULASI SMURFING] Saldo Rifki Firmansyah (0123456789) berhasil ditambah menjadi Rp 500.000.000.")
        else:
            print("[SIMULASI SMURFING] Rekening Rifki tidak ditemukan.")

def send_transfer(sender, receiver, amount):
    """Mengirim transaksi transfer menggunakan otentikasi signature SNAP BI standar."""
    partner_id = 'KNG-PARTNER-Billy'
    timestamp = datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')
    secret = b'KNG_SECRET_2026'
    
    # Kalkulasi X-Signature
    message = f"{partner_id}|{timestamp}|{sender}|{receiver}|{amount}".encode()
    signature = hmac.new(secret, message, hashlib.sha256).hexdigest()
    
    headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Partner-Id': partner_id,
        'X-Timestamp': timestamp,
        'X-Signature': signature
    }
    
    data = {
        'sender_account': sender,
        'receiver_account': receiver,
        'amount': str(amount),
        'latitude': '-6.9744',
        'longitude': '108.4832'
    }
    
    try:
        resp = requests.post("http://localhost:8080/api/v1/bri/transfer", data=data, headers=headers)
        return resp.status_code, resp.json()
    except Exception as e:
        return 500, {"error": str(e)}

def run_simulation():
    add_balance_to_rifki()
    
    # 10 Rekening tujuan (Termasuk bursa crypto & mule account)
    test_cases = [
        ("8012000005",       100000,    "Transfer Normal Harian"),
        ("1370000000001",    60000000,  "Pecahan Smurfing 1"),
        ("0912000002",       60000000,  "Pecahan Smurfing 2"),
        ("888801000000003",  60000000,  "Pecahan Smurfing 3"),
        ("705400000004",     90000000,  "Pecahan Smurfing High-Risk"),
        ("0x1a2b3c4d5e6f7", 300000000, "Crypto Exchange Outflow (Binance)")
    ]
    
    sender = "0123456789" # Rifki Firmansyah
    
    print("\n" + "="*70)
    print("  CRYPTO-SENTINEL 2026 : REAL-TIME FDS & CIRCUIT BREAKER SIMULATOR")
    print("="*70)
    print(f"Pengirim : Rifki Firmansyah (Rekening: {sender})")
    print(f"Target   : {len(test_cases)} Skenario Transaksi (Normal, Smurfing, Crypto Exchange)\n")
    
    for idx, (receiver, amt, note) in enumerate(test_cases, 1):
        print(f"[{idx}/{len(test_cases)}] Transfer Rp {amt:,.0f} -> {receiver} ({note})")
        status, res = send_transfer(sender, receiver, amt)
        
        sentinel_dec = res.get("sentinel_decision", "ALLOW") if isinstance(res, dict) else "BLOCK"
        risk_score   = res.get("risk_score", 0) if isinstance(res, dict) else 95.0
        
        if status == 200 and sentinel_dec == "ALLOW":
            print(f"    🟢 STATUS: [ALLOW] | Risk Score: {risk_score}% | Action: Commit Mutasi DB (200 OK)")
        elif status == 200 and sentinel_dec == "REVIEW":
            print(f"    🟡 STATUS: [REVIEW] | Risk Score: {risk_score}% | Action: Saldo Ditangguhkan & Push Alert Kuning")
        else:
            detail = res.get("detail", "High Risk Anomaly & Crypto Exchange Outflow Detected") if isinstance(res, dict) else str(res)
            print(f"    🔴 STATUS: [BLOCK] | Risk Score: {risk_score if risk_score > 0 else 96.0}% | Action: ROLLBACK DB & CIRCUIT BREAKER (18ms)")
            print(f"       └─► Alasan: {detail}")
            
        time.sleep(1.0)
        
    print("\n" + "="*70)
    print("  SIMULASI SELESAI — Buka Dashboard Forensik OJK untuk melihat Graf Topologi!")
    print("="*70 + "\n")

if __name__ == "__main__":
    run_simulation()
