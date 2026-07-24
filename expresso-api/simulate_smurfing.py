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
    
    # 10 Rekening tujuan berbeda hasil generator seeder
    recipients = [
        "8012000005",       # BCA (Eko Wijaya)
        "1370000000001",    # Mandiri (Dewi Permana)
        "0912000002",       # BNI (Eko Laksana)
        "888801000000003",  # BRI (Citra Hidayat)
        "705400000004",     # CIMB Niaga (Mega Tanjung)
        "8012000010",       # BCA (Dewi Prasetyo)
        "1370000000006",    # Mandiri (Mega Siregar)
        "0912000007",       # BNI (Hendra Kurniawan)
        "888801000000008",  # BRI (Lukman Suryadi)
        "705400000009"      # CIMB Niaga (Mega Siregar)
    ]
    
    sender = "0123456789" # Rifki Firmansyah
    amount = 60000000     # Rp 60.000.000 per transaksi
    
    print("\n--- MEMULAI SIMULASI POLA PENCUCIAN UANG (SMURFING PATTERN) ---")
    print(f"Rifki (0123456789) akan mentransfer Rp {amount:,.0f} secara beruntun ke {len(recipients)} rekening berbeda...\n")
    
    for idx, receiver in enumerate(recipients, 1):
        print(f"[{idx}/10] Mengirim Rp {amount:,.0f} ke {receiver}...")
        status, res = send_transfer(sender, receiver, amount)
        
        if status == 200:
            decision = res.get("sentinel_decision", "ALLOW")
            print(f"    -> Hasil: SUCCESS ({decision}) | Ref: {res.get('transaction_id')}")
        else:
            detail = res.get("detail", "Error")
            print(f"    -> Hasil: BLOCKED / FAILED (FDS Triggered) | Detail: {detail}")
            
        time.sleep(1.2) # Jeda singkat
        
    print("\n--- SIMULASI SELESAI ---")
    print("Silakan buka React Dashboard FDS Anda untuk melihat graf interaksi pencucian uang!")

if __name__ == "__main__":
    run_simulation()
