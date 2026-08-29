import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

db_url = "postgresql://neondb_owner:npg_1BiYFOClj2Xf@ep-soft-hat-azxilcxp-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

try:
    engine = create_engine(db_url)
    with engine.connect() as conn:
        result = conn.execute(text("SELECT version();"))
        print("Koneksi Berhasil! Version:", result.fetchone()[0])
except Exception as e:
    print("Error connecting:", e)
