import os
import random
import hashlib
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

from models.db_models import Base, Account

database_url = os.getenv("DATABASE_URL", "sqlite:///./expresso.db")
engine = create_engine(database_url, connect_args={"check_same_thread": False} if "sqlite" in database_url else {})

def generate_100_accounts():
    accounts = []

    # 1. Main Core & Team Accounts
    team_accounts = [
        Account(
            account_id="1234567890",
            national_id="3171092802092101",
            owner_name="Billy Jonathan",
            balance=125750000,
            risk_profile="LOW",
            is_active=True,
            is_blocked=False,
            registered_device="DEV-IPHONE15-PRO-MAX",
            registered_ip="182.16.2.89"
        ),
        Account(
            account_id="0123456789",
            national_id="3171092802092102",
            owner_name="Rifki Firmansyah",
            balance=85000000,
            risk_profile="LOW",
            is_active=True,
            is_blocked=False,
            registered_device="DEV-ANDROID-S24-ULTRA",
            registered_ip="182.16.2.90"
        ),
        Account(
            account_id="1122334455",
            national_id="3171092802092103",
            owner_name="Desta Erlangga",
            balance=62000000,
            risk_profile="LOW",
            is_active=True,
            is_blocked=False,
            registered_device="DEV-IPHONE14-PRO",
            registered_ip="182.16.2.91"
        ),
        Account(
            account_id="5544332211",
            national_id="3171092802092104",
            owner_name="Aam Setiana",
            balance=74000000,
            risk_profile="LOW",
            is_active=True,
            is_blocked=False,
            registered_device="DEV-MACBOOK-AIR-M3",
            registered_ip="182.16.2.92"
        ),
        Account(
            account_id="9876543210",
            national_id="3171092802092105",
            owner_name="Siti Rahma",
            balance=45000000,
            risk_profile="LOW",
            is_active=True,
            is_blocked=False,
            registered_device="DEV-XIAOMI13-PRO",
            registered_ip="180.252.120.45"
        ),
    ]
    accounts.extend(team_accounts)

    # 2. Mule & Threat Intelligence Accounts (High/Medium Risk)
    threat_accounts = [
        Account(
            account_id="987654",
            national_id="3171092802099901",
            owner_name="Budi Santoso (Mule)",
            balance=15000000,
            risk_profile="MEDIUM",
            is_active=True,
            is_blocked=False,
            registered_device="DEV-UNKNOWN-ANDROID-99",
            registered_ip="36.85.15.102"
        ),
        Account(
            account_id="9012666666",
            national_id="3171092802099902",
            owner_name="PT Indodax Nasional Indonesia",
            balance=15000000,
            risk_profile="HIGH",
            is_active=True,
            is_blocked=False,
            registered_device="DEV-VPN-PROXY-01",
            registered_ip="103.28.57.12"
        ),
        Account(
            account_id="9012999999",
            national_id="3171092802099903",
            owner_name="PT Tokocrypto Indonesia",
            balance=25000000,
            risk_profile="HIGH",
            is_active=True,
            is_blocked=False,
            registered_device="DEV-MIXER-BOT-02",
            registered_ip="45.12.89.201"
        ),
        Account(
            account_id="9012123456",
            national_id="3171092802099904",
            owner_name="PT Binance Exchange Indonesia",
            balance=50000000,
            risk_profile="MEDIUM",
            is_active=True,
            is_blocked=False,
            registered_device="DEV-API-GATEWAY-BINANCE",
            registered_ip="52.198.112.4"
        ),
        Account(
            account_id="9012777777",
            national_id="3171092802099905",
            owner_name="Indodax Fraud Receiver",
            balance=10000000,
            risk_profile="HIGH",
            is_active=True,
            is_blocked=False,
            registered_device="DEV-SUSPICIOUS-DEVICE-77",
            registered_ip="185.220.101.5"
        ),
        Account(
            account_id="9012888888",
            national_id="3171092802099906",
            owner_name="PT Pintu Kemakmuran Bersama",
            balance=12000000,
            risk_profile="MEDIUM",
            is_active=True,
            is_blocked=False,
            registered_device="DEV-LAYERING-NODE-88",
            registered_ip="194.26.29.90"
        ),
    ]
    accounts.extend(threat_accounts)

    # 3. 100+ Realistic Indonesian Nasabah Accounts
    first_names = [
        "Andi", "Budi", "Citra", "Dewi", "Eko", "Fajar", "Gita", "Hendra", "Indah", "Joko",
        "Kurnia", "Lestari", "Mega", "Nugroho", "Oktavia", "Pratama", "Qori", "Rahmat", "Sari", "Taufik",
        "Utami", "Vina", "Wahyu", "Xaverius", "Yulia", "Zainal", "Aditya", "Bagas", "Cahyani", "Dian",
        "Erwin", "Fitri", "Gilang", "Habsyi", "Irfan", "Jasmine", "Kartika", "Lukman", "Mahendra", "Nabila"
    ]
    
    last_names = [
        "Wijaya", "Santoso", "Cahyani", "Hidayat", "Nurhaliza", "Kusuma", "Prasetyo", "Saputra", "Wulandari", "Setiawan",
        "Siregar", "Nasution", "Suryadi", "Utomo", "Permana", "Kurniawan", "Suharto", "Wibowo", "Subagyo", "Gunawan",
        "Firmansyah", "Ramadhan", "Laksana", "Syahputra", "Baskoro", "Manggala", "Pradana", "Maulana", "Tanjung", "Pujastuti"
    ]

    devices = [
        "DEV-SAMSUNG-S24", "DEV-IPHONE15", "DEV-XIAOMI14", "DEV-OPPO-RENO11", "DEV-VIVO-V30",
        "DEV-REALME-GT5", "DEV-POCO-F6", "DEV-ASUS-ROG8", "DEV-IPHONE13", "DEV-SAMSUNG-A55"
    ]

    city_codes = ["3171", "3273", "3578", "3374", "3175", "3275", "3573", "3671", "5171", "6171"]

    for i in range(1, 101):
        acc_id = f"1000{i:06d}"
        
        # Deterministic generation for NIK, Name, Device, IP, Balance
        city = city_codes[i % len(city_codes)]
        birth_date = f"{10 + (i % 20):02d}{1 + (i % 12):02d}{85 + (i % 20):02d}"
        seq = f"{i:04d}"
        nik = f"{city}{birth_date}{seq}"

        fn = first_names[(i * 3) % len(first_names)]
        ln = last_names[(i * 7) % len(last_names)]
        name = f"{fn} {ln}"

        device = devices[i % len(devices)]
        ip_addr = f"180.252.{(i * 11) % 250}.{(i * 17) % 250}"
        balance = 2500000 + (i * 1350000) % 150000000
        
        # 10% risk, rest LOW
        risk = "HIGH" if (i % 15 == 0) else "MEDIUM" if (i % 8 == 0) else "LOW"
        is_blocked = True if (i % 25 == 0) else False

        accounts.append(Account(
            account_id=acc_id,
            national_id=nik,
            owner_name=name,
            balance=balance,
            risk_profile=risk,
            is_active=True,
            is_blocked=is_blocked,
            registered_device=device,
            registered_ip=ip_addr
        ))

    return accounts

def seed_data():
    Base.metadata.create_all(bind=engine)
    
    with Session(engine) as db:
        print("Memeriksa & membuat 100+ akun nasabah realistis...")
        
        dummy_accounts = generate_100_accounts()
        inserted_count = 0
        
        for acc in dummy_accounts:
            existing = db.get(Account, acc.account_id)
            if not existing:
                db.add(acc)
                inserted_count += 1
            else:
                # Update existing NIK, device, IP if missing
                existing.national_id = acc.national_id
                existing.registered_device = acc.registered_device
                existing.registered_ip = acc.registered_ip
                db.add(existing)

        db.commit()
        print(f"Seeding selesai! Total {inserted_count} akun baru berhasil ditambahkan (Total {len(dummy_accounts)} akun aktif di database).")

if __name__ == "__main__":
    seed_data()
