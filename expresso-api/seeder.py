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

from models.db_models import (
    Base, Account, RegulatoryWatchlist, DeviceTelemetry, MuleGraphCommunity, ApoloRegulatoryFiling
)

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

    for i in range(1, 2501):
        bank_modulo = i % 5
        if bank_modulo == 0:
            # BCA (10 digits)
            acc_id = f"8012{i:06d}"
        elif bank_modulo == 1:
            # Mandiri (13 digits)
            acc_id = f"13700{i:08d}"
        elif bank_modulo == 2:
            # BNI (10 digits)
            acc_id = f"0912{i:06d}"
        elif bank_modulo == 3:
            # BRI (15 digits)
            acc_id = f"888801{i:09d}"
        else:
            # CIMB Niaga (12 digits)
            acc_id = f"7054{i:08d}"
        
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
        print("Memeriksa & membuat 2.500+ akun nasabah realistis...")
        
        # 1. Seed Watchlists (DTTOT / Satgas PASTI / PEP / Crypto Blacklist)
        watchlists = [
            RegulatoryWatchlist(
                watchlist_id="DTTOT-2026-001",
                category="DTTOT",
                entity_name="Jaringan Anomali Transaksi Internasional X",
                alias_names=["JATI-X", "Global Transfer Network"],
                identifier_number="3171099900010009",
                identifier_type="NATIONAL_ID",
                legal_basis="Keputusan PN Jaksel No. 44/DTTOT/2025 & PPATK RI",
                risk_level="CRITICAL",
                is_active=True
            ),
            RegulatoryWatchlist(
                watchlist_id="WATCHLIST-CRYPTO-002",
                category="HIGH_RISK_CRYPTO",
                entity_name="Darknet Mixer Deposit Address",
                alias_names=["TornadoMixerV2", "WasabiPool"],
                identifier_number="0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
                identifier_type="WALLET_ADDRESS",
                legal_basis="OFAC Sanctioned & Crypto-Sentinel Threat Intel",
                risk_level="CRITICAL",
                is_active=True
            ),
            RegulatoryWatchlist(
                watchlist_id="SATGAS-PASTI-003",
                category="SATGAS_PASTI",
                entity_name="Pinjol Ilegal Mantap Dana",
                alias_names=["MantapDana App", "PT Mantap Solusi"],
                identifier_number="901288273645",
                identifier_type="BANK_ACCOUNT",
                legal_basis="Pengumuman Resmi Satgas PASTI OJK RI No. PENG-04/PASTI/2026",
                risk_level="HIGH",
                is_active=True
            )
        ]
        for w in watchlists:
            if not db.get(RegulatoryWatchlist, w.watchlist_id):
                db.add(w)

        # 2. Seed Mule Graph Communities
        communities = [
            MuleGraphCommunity(
                cluster_id="MULE-RING-KNG-01",
                cluster_name="Sindikat Smurfing Kuningan-Indodax Ring",
                core_hub_account="1234567890",
                total_mule_nodes=6,
                aggregate_inflow=485000000,
                aggregate_outflow=472000000,
                target_crypto_exchange="Indodax",
                graph_topology_type="FAN_OUT_SMURFING",
                risk_score=98.4,
                detection_algorithm="GraphSAGE + Leiden Community",
                is_frozen=False
            ),
            MuleGraphCommunity(
                cluster_id="MULE-RING-BJB-02",
                cluster_name="Komunitas Mule Layering Antar BPR",
                core_hub_account="0123456789",
                total_mule_nodes=4,
                aggregate_inflow=210000000,
                aggregate_outflow=205000000,
                target_crypto_exchange="Tokocrypto",
                graph_topology_type="CYCLIC_LOOP",
                risk_score=87.6,
                detection_algorithm="GraphSAGE Embeddings (32-dim)",
                is_frozen=False
            )
        ]
        for c in communities:
            if not db.get(MuleGraphCommunity, c.cluster_id):
                db.add(c)

        # 3. Seed APOLO Regulatory Filing
        filings = [
            ApoloRegulatoryFiling(
                filing_id="APOLO-OJK-2026-M08",
                reporting_period="2026-M08",
                reporting_type="APOLO_OJK_POJK8_2023",
                total_transactions=308250,
                total_blocked_nominal=15200000000,
                total_str_submitted=42,
                xml_checksum="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                submission_status="ACCEPTED_OJK",
                submitted_by="Pejabat Kepatuhan MLRO"
            ),
            ApoloRegulatoryFiling(
                filing_id="APOLO-OJK-2026-M09",
                reporting_period="2026-M09",
                reporting_type="APOLO_OJK_POJK8_2023",
                total_transactions=184200,
                total_blocked_nominal=8400000000,
                total_str_submitted=18,
                xml_checksum="f4c8996fb92427ae41e4649b934ca495991b7852b855e3b0c44298fc1c149afb",
                submission_status="SUBMITTED",
                submitted_by="Pejabat Kepatuhan MLRO"
            )
        ]
        for f in filings:
            if not db.get(ApoloRegulatoryFiling, f.filing_id):
                db.add(f)
        
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
        print(f"Seeding selesai! Total {inserted_count} akun baru berhasil ditambahkan (Target generator: {len(dummy_accounts)} akun; total database dapat mencakup akun historis).")

if __name__ == "__main__":
    seed_data()
