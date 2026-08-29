import os
import sqlite3
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session
from dotenv import load_dotenv

# Load env in expresso-api
load_dotenv('expresso-api/.env')

import sys
sys.path.insert(0, os.path.abspath('expresso-api'))

from models.db_models import Base, Account, Transaction, SentinelAlert, STRDraft, engine
from datetime import datetime

print("1. Re-creating tables in Neon PostgreSQL with updated column widths...")
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)
print("   Tables created successfully in Neon!")

print("2. Migrating data from SQLite expresso.db to Neon PostgreSQL...")
sqlite_conn = sqlite3.connect('expresso-api/expresso.db')
sqlite_conn.row_factory = sqlite3.Row
cur = sqlite_conn.cursor()

with Session(engine) as pg_session:
    # 2.1 Migrate accounts
    cur.execute("SELECT * FROM accounts")
    acc_rows = cur.fetchall()
    for r in acc_rows:
        acc = Account(
            account_id=str(r["account_id"]),
            national_id=str(r["national_id"]) if r["national_id"] else None,
            owner_name=str(r["owner_name"]),
            balance=int(r["balance"]),
            risk_profile=str(r["risk_profile"]),
            is_active=bool(r["is_active"]),
            is_blocked=bool(r["is_blocked"]),
            registered_device=str(r["registered_device"]) if r["registered_device"] else None,
            registered_ip=str(r["registered_ip"]) if r["registered_ip"] else None
        )
        pg_session.add(acc)
    pg_session.commit()
    print(f"   [OK] Migrated {len(acc_rows)} accounts to Neon!")

    # 2.2 Migrate transactions
    cur.execute("SELECT * FROM transactions")
    tx_rows = cur.fetchall()
    for r in tx_rows:
        ts = r["timestamp"]
        if isinstance(ts, str):
            try:
                ts = datetime.fromisoformat(ts)
            except Exception:
                ts = datetime.utcnow()
        tx = Transaction(
            transaction_id=str(r["transaction_id"]),
            sender_account=str(r["sender_account"]),
            receiver_account=str(r["receiver_account"]),
            amount=int(r["amount"]),
            purpose_code=str(r["purpose_code"]) if r["purpose_code"] else None,
            description=str(r["description"]) if r["description"] else None,
            destination_type=str(r["destination_type"]) if r["destination_type"] else None,
            ip_address=str(r["ip_address"]) if r["ip_address"] else None,
            country_code=str(r["country_code"]) if r["country_code"] else None,
            latitude=float(r["latitude"]) if r["latitude"] is not None else None,
            longitude=float(r["longitude"]) if r["longitude"] is not None else None,
            timestamp=ts,
            sentinel_score=float(r["sentinel_score"]) if r["sentinel_score"] is not None else None,
            sentinel_decision=str(r["sentinel_decision"]) if r["sentinel_decision"] else None,
            status=str(r["status"]) if r["status"] else 'PENDING'
        )
        pg_session.add(tx)
    pg_session.commit()
    print(f"   [OK] Migrated {len(tx_rows)} transactions to Neon!")

sqlite_conn.close()

# Verify counts in Neon
with Session(engine) as pg_session:
    total_acc = pg_session.query(Account).count()
    total_tx = pg_session.query(Transaction).count()
    print(f"\n=======================================================")
    print(f"  NEON POSTGRESQL VERIFICATION RESULT:")
    print(f"  - Total Accounts in Cloud     : {total_acc}")
    print(f"  - Total Transactions in Cloud : {total_tx}")
    print(f"=======================================================")
