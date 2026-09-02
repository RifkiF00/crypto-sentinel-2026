import os
import random
import hashlib
from datetime import datetime, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
try:
    from dotenv import load_dotenv
    load_dotenv("expresso-api/.env")
except ImportError:
    pass

import sys
sys.path.insert(0, os.path.abspath('expresso-api'))

from models.db_models import Base, Account, Transaction, SentinelAlert, engine

print("=== GENERATING REALISTIC BANKING ACCOUNTS WITH CRA (CUSTOMER RISK ASSESSMENT) ===")

FIRST_NAMES = ["Budi", "Agus", "Dewi", "Siti", "Ahmad", "Rina", "Eko", "Dede", "Heri", "Sri", "Rizky", "Fitri", "Ade", "Bambang", "Novi", "Endang", "Tri", "Yudi", "Asep", "Iwan", "Mega", "Fajar", "Maya", "Indra", "Putri", "Bayu", "Lestari", "Yoga", "Ratna", "Gilang"]
LAST_NAMES = ["Kurniawan", "Suryadi", "Pratama", "Firmansyah", "Permana", "Wibowo", "Setiawan", "Hidayat", "Saputra", "Wijaya", "Santoso", "Laksana", "Ramadhan", "Nugroho", "Gunawan", "Siregar", "Nasution", "Pramudya", "Hartono", "Kusuma"]

CITIES = [
    {"city": "Bandung", "prov": "3204", "lat": -6.9175, "lon": 107.6191},
    {"city": "Kuningan", "prov": "3208", "lat": -6.9765, "lon": 108.4834},
    {"city": "Jakarta Selatan", "prov": "3174", "lat": -6.2615, "lon": 106.8106},
    {"city": "Surabaya", "prov": "3578", "lat": -7.2575, "lon": 112.7521},
    {"city": "Semarang", "prov": "3374", "lat": -6.9667, "lon": 110.4167},
    {"city": "Medan", "prov": "1271", "lat": 3.5952, "lon": 98.6722},
    {"city": "Bekasi", "prov": "3275", "lat": -6.2383, "lon": 106.9756},
]

OCCUPATIONS_STANDARD = [
    {"job": "PNS / ASN Pemerintah Daerah", "income": 12000000, "base_risk": 10.0},
    {"job": "Karyawan Swasta BUMN / Perbankan", "income": 15000000, "base_risk": 12.0},
    {"job": "Pengusaha UMKM / Pedagang", "income": 25000000, "base_risk": 25.0},
    {"job": "Tenaga Medis / Dokter", "income": 35000000, "base_risk": 8.0},
    {"job": "Guru / Dosen Universitas", "income": 9500000, "base_risk": 10.0},
    {"job": "Profesional IT / Konsultan", "income": 28000000, "base_risk": 18.0},
]

OCCUPATIONS_HIGH_RISK = [
    {"job": "Mahasiswa / Belum Bekerja (Nominee Candidate)", "income": 1500000, "base_risk": 85.0},
    {"job": "Buruh Harian Lepas (Rekening Sewa / Mule)", "income": 2000000, "base_risk": 90.0},
    {"job": "Trader Kripto Independen (High Volume)", "income": 75000000, "base_risk": 78.0},
]

CRYPTO_DESTINATIONS = [
    {"id": "C666666666", "name": "PT Indodax Nasional Indonesia (VASP Escrow Node)", "exchange": "Indodax", "ip": "103.28.57.12"},
    {"id": "C999999999", "name": "PT Tokocrypto Binance Hub (VASP Liquidity Bridge)", "exchange": "Tokocrypto", "ip": "45.12.89.201"},
    {"id": "C123456789", "name": "Binance Global VASP Gateway", "exchange": "Binance", "ip": "52.198.112.4"},
    {"id": "C777777777", "name": "PT Pintu Kemana Saja (VASP Settlement Pool)", "exchange": "Pintu", "ip": "185.220.101.5"},
    {"id": "C888888888", "name": "PT Rekeningku Dotcom Indonesia", "exchange": "Reku", "ip": "194.26.29.90"},
]

def generate_nik(prov_code):
    dob = f"{random.randint(10,28):02d}{random.randint(1,12):02d}{random.randint(75,99):02d}"
    seq = f"{random.randint(1,9999):04d}"
    return f"{prov_code}{dob}{seq}"

def generate_accounts():
    accounts = []
    
    # 1. Primary Core Accounts (Executive & Anchor)
    accounts.append(Account(
        account_id="1234567890",
        national_id="3171092802092101",
        owner_name="Billy Jonathan",
        balance=125750000,
        risk_profile="LOW",
        risk_score=8.5,
        mule_probability=0.01,
        occupation="Direktur Utama / Tech Executive",
        monthly_income=120000000,
        pep_status=False,
        cdd_edd_status="CDD_STANDARD",
        is_active=True,
        is_blocked=False,
        registered_device="DEV-IPHONE15-PRO-MAX",
        registered_ip="182.16.2.89"
    ))
    accounts.append(Account(
        account_id="0123456789",
        national_id="3171092802092102",
        owner_name="Rifki Firmansyah",
        balance=85000000,
        risk_profile="LOW",
        risk_score=10.2,
        mule_probability=0.02,
        occupation="Chief Technology Officer",
        monthly_income=85000000,
        pep_status=False,
        cdd_edd_status="CDD_STANDARD",
        is_active=True,
        is_blocked=False,
        registered_device="DEV-ANDROID-S24-ULTRA",
        registered_ip="182.16.2.90"
    ))
    accounts.append(Account(
        account_id="1122334455",
        national_id="3171092802092103",
        owner_name="Desta Erlangga",
        balance=62000000,
        risk_profile="LOW",
        risk_score=9.8,
        mule_probability=0.01,
        occupation="Lead AI Researcher",
        monthly_income=65000000,
        pep_status=False,
        cdd_edd_status="CDD_STANDARD",
        is_active=True,
        is_blocked=False,
        registered_device="DEV-IPHONE14-PRO",
        registered_ip="182.16.2.91"
    ))
    accounts.append(Account(
        account_id="5544332211",
        national_id="3171092802092104",
        owner_name="Aam Setiana",
        balance=74000000,
        risk_profile="LOW",
        risk_score=11.5,
        mule_probability=0.03,
        occupation="Security Middleware Engineer",
        monthly_income=70000000,
        pep_status=False,
        cdd_edd_status="CDD_STANDARD",
        is_active=True,
        is_blocked=False,
        registered_device="DEV-MACBOOK-AIR-M3",
        registered_ip="182.16.2.92"
    ))

    # 2. Add Crypto Destination Exchange Accounts
    for crypto in CRYPTO_DESTINATIONS:
        accounts.append(Account(
            account_id=crypto["id"],
            national_id=f"9999{crypto['id']}",
            owner_name=crypto["name"],
            balance=5000000000,
            risk_profile="HIGH",
            risk_score=94.0,
            mule_probability=0.89,
            occupation="Badan Usaha VASP Terdaftar Bappebti",
            monthly_income=10000000000,
            pep_status=False,
            cdd_edd_status="EDD_COMPLETED",
            is_active=True,
            is_blocked=False,
            registered_device=f"GATEWAY-{crypto['exchange'].upper()}-01",
            registered_ip=crypto["ip"]
        ))

    # 3. Generate 2,500 Realistic Bank Accounts with Multi-Bank Codes & Rich CRA
    bank_configs = [
        {"prefix": "110", "ratio": 1000, "name": "Bank bjb"},
        {"prefix": "601", "ratio": 500, "name": "Bank Kuningan"},
        {"prefix": "002", "ratio": 400, "name": "Bank BRI"},
        {"prefix": "014", "ratio": 250, "name": "Bank BCA"},
        {"prefix": "008", "ratio": 250, "name": "Bank Mandiri"},
        {"prefix": "009", "ratio": 100, "name": "Bank BNI"},
    ]

    for cfg in bank_configs:
        for i in range(cfg["ratio"]):
            acc_id = f"{cfg['prefix']}{random.randint(10000000, 99999999)}"
            city_info = random.choice(CITIES)
            nik = generate_nik(city_info["prov"])
            name = f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"
            
            # CRA Risk Distribution: 84% LOW, 10% MEDIUM, 6% HIGH
            r_val = random.random()
            if r_val < 0.84:
                r_prof = "LOW"
                job_info = random.choice(OCCUPATIONS_STANDARD)
                r_score = round(random.uniform(5.0, 32.0), 1)
                mule_prob = round(random.uniform(0.01, 0.12), 2)
                bal = random.randint(1500000, 60000000)
                is_blocked = False
                cdd_status = "CDD_STANDARD"
                is_pep = random.random() < 0.02
            elif r_val < 0.94:
                r_prof = "MEDIUM"
                job_info = random.choice(OCCUPATIONS_STANDARD)
                r_score = round(random.uniform(40.0, 68.0), 1)
                mule_prob = round(random.uniform(0.20, 0.48), 2)
                bal = random.randint(500000, 20000000)
                is_blocked = False
                cdd_status = "EDD_REQUIRED"
                is_pep = random.random() < 0.08
            else:
                r_prof = "HIGH"
                job_info = random.choice(OCCUPATIONS_HIGH_RISK)
                r_score = round(random.uniform(75.0, 96.5), 1)
                mule_prob = round(random.uniform(0.70, 0.96), 2)
                bal = random.randint(100000, 3500000)
                is_blocked = random.choice([True, False])
                cdd_status = "EDD_REQUIRED"
                is_pep = False

            dev_type = random.choice(["DEV-IPHONE13", "DEV-ANDROID-S23", "DEV-XIAOMI12", "DEV-OPPO-RENO", "DEV-WEB-BROWSER", "DEV-VIVO-Y21"])
            ip_addr = f"{random.randint(36,202)}.{random.randint(10,250)}.{random.randint(1,254)}.{random.randint(1,254)}"

            accounts.append(Account(
                account_id=acc_id,
                national_id=nik,
                owner_name=f"{name} ({cfg['name']})",
                balance=bal,
                risk_profile=r_prof,
                risk_score=r_score,
                mule_probability=mule_prob,
                occupation=job_info["job"],
                monthly_income=job_info["income"],
                pep_status=is_pep,
                cdd_edd_status=cdd_status,
                is_active=True,
                is_blocked=is_blocked,
                registered_device=dev_type,
                registered_ip=ip_addr
            ))

    return accounts

def generate_transactions_and_alerts(accounts):
    transactions = []
    alerts = []
    
    bjb_mules = [a for a in accounts if a.account_id.startswith("110") and a.risk_profile == "HIGH"]
    kuningan_mules = [a for a in accounts if a.account_id.startswith("601") and a.risk_profile == "HIGH"]
    bca_mules = [a for a in accounts if a.account_id.startswith("014") and a.risk_profile == "HIGH"]
    normal_accounts = [a for a in accounts if a.risk_profile == "LOW" and not a.account_id.startswith("C")]

    now = datetime.utcnow()

    # --- SCENARIO 1: Heavy Bank bjb Cross-Border Crypto Smurfing ---
    if bjb_mules:
        primary_bjb_mule = bjb_mules[0]
        indodax = CRYPTO_DESTINATIONS[0]
        
        for i in range(45):
            sender = random.choice(normal_accounts)
            tx_id = f"TX-BJB-SMURF-{1000+i}"
            amt = random.randint(3000000, 9500000)
            t_time = now - timedelta(minutes=random.randint(5, 180))
            
            transactions.append(Transaction(
                transaction_id=tx_id,
                sender_account=sender.account_id,
                receiver_account=primary_bjb_mule.account_id,
                amount=amt,
                purpose_code="01",
                description="Transfer Titipan Kemitraan Kripto",
                destination_type="BANK_INTERNAL",
                ip_address=sender.registered_ip,
                country_code="ID",
                latitude=-6.9175,
                longitude=107.6191,
                timestamp=t_time,
                sentinel_score=0.78,
                sentinel_decision="REVIEW",
                status="COMPLETED"
            ))

        tx_dump_id = f"TX-BJB-DUMP-001"
        transactions.append(Transaction(
            transaction_id=tx_dump_id,
            sender_account=primary_bjb_mule.account_id,
            receiver_account=indodax["id"],
            amount=385000000,
            purpose_code="04",
            description="Escrow Withdrawal to Indodax Wallet",
            destination_type="VASP_CRYPTO",
            ip_address="103.28.57.12",
            country_code="ID",
            latitude=-6.9175,
            longitude=107.6191,
            timestamp=now - timedelta(minutes=2),
            sentinel_score=0.96,
            sentinel_decision="BLOCK",
            status="BLOCKED"
        ))

        alerts.append(SentinelAlert(
            transaction_id=tx_dump_id,
            risk_score=0.96,
            indicators_json={
                "smurfing_pattern": True,
                "velocity_flag": "45 Inbound Txns in 3 hrs",
                "mule_hub": primary_bjb_mule.account_id,
                "vasp_target": indodax["name"],
                "cra_score": primary_bjb_mule.risk_score
            },
            shap_values_json={"amount_ratio": 0.42, "rapid_drain": 0.38, "gnn_mule_cluster": 0.16},
            cluster_id="CLUSTER-BJB-INDODAX-01",
            resolved=False
        ))

    # --- SCENARIO 2: Bank Kuningan Apex Integration Smurfing ---
    if kuningan_mules and bca_mules:
        kng_mule = kuningan_mules[0]
        bca_bridge = bca_mules[0]

        for i in range(20):
            sender = random.choice([a for a in accounts if a.account_id.startswith("601") and a != kng_mule])
            tx_id = f"TX-KNG-APEX-{2000+i}"
            amt = random.randint(2000000, 5000000)
            t_time = now - timedelta(minutes=random.randint(10, 240))
            
            transactions.append(Transaction(
                transaction_id=tx_id,
                sender_account=sender.account_id,
                receiver_account=kng_mule.account_id,
                amount=amt,
                purpose_code="02",
                description="Kliring Apex BPR Sub-Account",
                destination_type="BANK_APEX",
                ip_address=sender.registered_ip,
                country_code="ID",
                latitude=-6.9765,
                longitude=108.4834,
                timestamp=t_time,
                sentinel_score=0.65,
                sentinel_decision="REVIEW",
                status="COMPLETED"
            ))

        tx_bridge_id = "TX-KNG-TO-BCA-88"
        transactions.append(Transaction(
            transaction_id=tx_bridge_id,
            sender_account=kng_mule.account_id,
            receiver_account=bca_bridge.account_id,
            amount=95000000,
            purpose_code="03",
            description="Interbank Transfer via SNAP BI (Bank Kuningan -> BCA)",
            destination_type="BANK_INTERBANK",
            ip_address=kng_mule.registered_ip,
            country_code="ID",
            latitude=-6.9765,
            longitude=108.4834,
            timestamp=now - timedelta(minutes=15),
            sentinel_score=0.88,
            sentinel_decision="BLOCK",
            status="BLOCKED"
        ))

        alerts.append(SentinelAlert(
            transaction_id=tx_bridge_id,
            risk_score=0.88,
            indicators_json={
                "apex_smurfing": True,
                "rapid_drain": "98% Balance Drained in 15 mins",
                "origin_bpr": "PT BPR Bank Kuningan",
                "cra_score": kng_mule.risk_score
            },
            shap_values_json={"interbank_rapid_drain": 0.51, "apex_mule_score": 0.37},
            cluster_id="CLUSTER-KNG-BCA-APEX-02",
            resolved=False
        ))

    # --- SCENARIO 3: Federated Learning Multi-Bank Background Txns ---
    for i in range(1800):
        s_acc = random.choice(normal_accounts)
        r_acc = random.choice(normal_accounts)
        if s_acc.account_id == r_acc.account_id:
            continue

        amt = random.randint(50000, 15000000)
        t_delta = timedelta(days=random.randint(0, 14), hours=random.randint(0, 23), minutes=random.randint(0, 59))
        tx_time = now - t_delta
        
        transactions.append(Transaction(
            transaction_id=f"TX-GEN-{10000+i}",
            sender_account=s_acc.account_id,
            receiver_account=r_acc.account_id,
            amount=amt,
            purpose_code=random.choice(["01", "02", "03", "05"]),
            description=random.choice(["Pembayaran Merchant QRIS", "Transfer Keluarga", "Pembelian Token Listrik", "Pembayaran Operasional", "Mutasi Saldo Rekening"]),
            destination_type="BANK_INTERBANK" if s_acc.account_id[:3] != r_acc.account_id[:3] else "BANK_INTERNAL",
            ip_address=s_acc.registered_ip,
            country_code="ID",
            latitude=-6.2615 + (random.random() - 0.5) * 0.1,
            longitude=106.8106 + (random.random() - 0.5) * 0.1,
            timestamp=tx_time,
            sentinel_score=round(random.uniform(0.01, 0.25), 2),
            sentinel_decision="ALLOW",
            status="COMPLETED"
        ))

    return transactions, alerts

def main():
    print("Re-creating clean database schema with CRA extensions...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    accounts = generate_accounts()
    transactions, alerts = generate_transactions_and_alerts(accounts)

    print(f"Seeding {len(accounts)} CRA-graded accounts into NeonDB...")
    with Session(engine) as session:
        session.add_all(accounts)
        session.commit()
        print(f"[OK] {len(accounts)} accounts inserted with full CRA attributes.")

        print(f"Seeding {len(transactions)} transactions into database...")
        batch_size = 500
        for i in range(0, len(transactions), batch_size):
            session.add_all(transactions[i:i+batch_size])
            session.commit()
        print(f"[OK] {len(transactions)} transactions inserted.")

        print(f"Seeding {len(alerts)} Sentinel Alerts into database...")
        session.add_all(alerts)
        session.commit()
        print(f"[OK] {len(alerts)} alerts inserted.")

    print("\n=== SUCCESS: NEON DATABASE RE-SEEDED WITH CRA RISK SCORING ===")

if __name__ == "__main__":
    main()
