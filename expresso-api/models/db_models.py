from sqlalchemy import create_engine, Column, String, JSON, Integer
from sqlalchemy import BigInteger, Boolean, Float, Text, TIMESTAMP, func
from sqlalchemy.orm import declarative_base
import os
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

Base = declarative_base()
database_url = os.getenv("DATABASE_URL", "sqlite:///./expresso.db")
engine = create_engine(database_url, connect_args={"check_same_thread": False} if "sqlite" in database_url else {})

class Account(Base):
    __tablename__ = "accounts"
    account_id        = Column(String(100), primary_key=True)
    national_id       = Column(String(100), nullable=True) # NIK KTP Nasabah / External ID
    owner_name        = Column(String(255), nullable=False)
    balance           = Column(BigInteger, default=0)
    risk_profile      = Column(String(50), default='LOW')
    is_active         = Column(Boolean, default=True)
    is_blocked        = Column(Boolean, default=False)
    registered_device = Column(String(100))
    registered_ip     = Column(String(50))
    last_activity     = Column(TIMESTAMP)
    created_at        = Column(TIMESTAMP, server_default=func.now())

class Transaction(Base):
    __tablename__ = "transactions"
    transaction_id    = Column(String(100), primary_key=True)
    sender_account    = Column(String(100), nullable=False)
    receiver_account  = Column(String(100), nullable=False)
    amount            = Column(BigInteger, nullable=False)
    purpose_code      = Column(String(50))
    description       = Column(Text)
    destination_type  = Column(String(50))
    ip_address        = Column(String(50))
    country_code      = Column(String(10))
    latitude          = Column(Float)
    longitude         = Column(Float)
    timestamp         = Column(TIMESTAMP, nullable=False)
    sentinel_score    = Column(Float)
    sentinel_decision = Column(String(50))
    status            = Column(String(50), default='PENDING')

class SentinelAlert(Base):
    __tablename__ = "sentinel_alerts"
    alert_id        = Column(Integer, primary_key=True, autoincrement=True)
    transaction_id  = Column(String(100))
    risk_score      = Column(Float)
    indicators_json = Column(JSON)
    shap_values_json= Column(JSON)
    cluster_id      = Column(String(100))
    resolved        = Column(Boolean, default=False)
    created_at      = Column(TIMESTAMP, server_default=func.now())
    
class STRDraft(Base):
    __tablename__ = "str_drafts"
    str_id        = Column(String(100), primary_key=True)
    alert_id      = Column(Integer)
    summary_text  = Column(Text)
    risk_factors  = Column(JSON)
    status        = Column(String(50), default='DRAFT')  # DRAFT | REVIEWED | SENT
    analyst_id    = Column(String(100))
    created_at    = Column(TIMESTAMP, server_default=func.now())

if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    print("Tabel berhasil dibuat!")