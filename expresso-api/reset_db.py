import os
from sqlalchemy import create_engine
from models.db_models import Base, engine
from seeder import seed_data

print("Mereset dan memperbarui skema database SQLite...")
try:
    # Drop all old tables with legacy schema
    Base.metadata.drop_all(bind=engine)
    print("[OK] Skema tabel lama berhasil dibersihkan.")

    # Recreate all tables with fixed AUTOINCREMENT schema
    Base.metadata.create_all(bind=engine)
    print("[OK] Skema tabel baru dengan AUTOINCREMENT berhasil dibuat.")

    # Re-seed the 111+ realistic accounts
    seed_data()
    print("[SUCCESS] 111+ akun nasabah dan data seeder berhasil dimuat penuh!")
except Exception as e:
    print(f"[ERROR]: {e}")
