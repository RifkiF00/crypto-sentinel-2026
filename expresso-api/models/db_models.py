from sqlalchemy import create_engine, Column, String, JSON, Integer
from sqlalchemy import BigInteger, Boolean, Float, Text, TIMESTAMP, func
from sqlalchemy.orm import declarative_base
import os
try:
    from dotenv import load_dotenv
    load_dotenv("expresso-api/.env")
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
    risk_profile      = Column(String(50), default='LOW')  # LOW | MEDIUM | HIGH
    risk_score        = Column(Float, default=15.0)        # CRA Score (0 - 100)
    mule_probability  = Column(Float, default=0.05)        # GNN Mule Probability (0.00 - 1.00)
    occupation        = Column(String(100), default='Karyawan Swasta') # Profil Pekerjaan
    monthly_income    = Column(BigInteger, default=10000000) # Penghasilan Bulanan
    pep_status        = Column(Boolean, default=False)     # Politically Exposed Person
    cdd_edd_status    = Column(String(50), default='CDD_STANDARD') # CDD_STANDARD | EDD_REQUIRED | EDD_COMPLETED
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

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id          = Column(Integer, primary_key=True, autoincrement=True)
    actor       = Column(String(100), nullable=False) # e.g. Analyst, MLRO, Regulator
    role        = Column(String(50), nullable=False)  # analyst | compliance_officer | admin_regulator
    action      = Column(String(100), nullable=False) # RESOLVE_ALERT, OVERRIDE_BREAKER, UNMASK_PII, etc.
    target_id   = Column(String(100))                 # Account or Transaction ID
    reason      = Column(Text, nullable=False)
    ip_address  = Column(String(50))
    tenant_id   = Column(String(50), default='all')
    created_at  = Column(TIMESTAMP, server_default=func.now())

class CaseInvestigation(Base):
    __tablename__ = "case_investigations"
    case_id           = Column(String(100), primary_key=True)
    alert_id          = Column(String(100), nullable=True)
    transaction_id    = Column(String(100), nullable=False)
    account_id        = Column(String(100), nullable=False)
    status            = Column(String(50), default='OPEN') # OPEN | IN_REVIEW | ESCALATED | RESOLVED | CLOSED
    priority          = Column(String(50), default='HIGH') # LOW | MEDIUM | HIGH | CRITICAL
    assigned_to       = Column(String(100), default='Unassigned')
    lifecycle_history = Column(JSON, default=list) # [{status, actor, timestamp, note}]
    notes             = Column(JSON, default=list) # [{id, author, role, text, created_at}]
    resolution        = Column(Text, nullable=True)
    created_at        = Column(TIMESTAMP, server_default=func.now())
    updated_at        = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
    graph_snapshot    = Column(JSON, default=dict)

class RegulatoryWatchlist(Base):
    __tablename__ = "regulatory_watchlists"
    watchlist_id      = Column(String(100), primary_key=True)
    category          = Column(String(50), nullable=False) # DTTOT | DPPSPM | SATGAS_PASTI | PEP | HIGH_RISK_CRYPTO
    entity_name       = Column(String(255), nullable=False)
    alias_names       = Column(JSON, default=list)
    identifier_number = Column(String(100), nullable=True) # NIK / NPWP / Passport / Wallet / Bank Acc
    identifier_type   = Column(String(50), default='NATIONAL_ID') # NATIONAL_ID | WALLET_ADDRESS | BANK_ACCOUNT | PASSPORT
    country_origin    = Column(String(10), default='ID')
    legal_basis       = Column(String(255), default='Surat Edaran PPATK / OJK RI')
    risk_level        = Column(String(50), default='CRITICAL')
    is_active         = Column(Boolean, default=True)
    created_at        = Column(TIMESTAMP, server_default=func.now())

class DeviceTelemetry(Base):
    __tablename__ = "device_telemetry_history"
    telemetry_id              = Column(String(100), primary_key=True)
    account_id                = Column(String(100), nullable=False)
    device_fingerprint        = Column(String(128), nullable=False)
    device_model              = Column(String(100))
    os_version                = Column(String(50))
    ip_address                = Column(String(50))
    isp_provider              = Column(String(100))
    is_rooted_jailbroken      = Column(Boolean, default=False)
    is_mock_location_active   = Column(Boolean, default=False)
    is_vpn_proxy              = Column(Boolean, default=False)
    associated_accounts_count = Column(Integer, default=1)
    last_seen                 = Column(TIMESTAMP, server_default=func.now())

class MuleGraphCommunity(Base):
    __tablename__ = "mule_graph_communities"
    cluster_id             = Column(String(100), primary_key=True) # e.g. MULE-CLUSTER-001
    cluster_name           = Column(String(255), nullable=False)
    core_hub_account       = Column(String(100), nullable=False)
    total_mule_nodes       = Column(Integer, default=1)
    aggregate_inflow       = Column(BigInteger, default=0)
    aggregate_outflow      = Column(BigInteger, default=0)
    target_crypto_exchange = Column(String(100), default='Indodax')
    graph_topology_type    = Column(String(100), default='FAN_OUT_SMURFING') # FAN_OUT_SMURFING | CYCLIC_LOOP | BIPARTITE_HUB
    risk_score             = Column(Float, default=95.0)
    detection_algorithm    = Column(String(100), default='GraphSAGE + Leiden Community')
    is_frozen              = Column(Boolean, default=False)
    created_at             = Column(TIMESTAMP, server_default=func.now())

class ApoloRegulatoryFiling(Base):
    __tablename__ = "apolo_regulatory_filings"
    filing_id              = Column(String(100), primary_key=True)
    reporting_period       = Column(String(50), nullable=False) # e.g. 2026-M09
    reporting_type         = Column(String(100), default='APOLO_OJK_POJK8_2023') # APOLO_OJK_POJK8_2023 | PPATK_GRIPS_XML
    total_transactions     = Column(Integer, default=0)
    total_blocked_nominal  = Column(BigInteger, default=0)
    total_str_submitted    = Column(Integer, default=0)
    xml_checksum           = Column(String(128))
    submission_status      = Column(String(50), default='SUBMITTED') # DRAFT | VALIDATED | SUBMITTED | ACCEPTED_OJK
    submitted_by           = Column(String(100), default='Compliance MLRO')
    created_at             = Column(TIMESTAMP, server_default=func.now())

if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    print("Database schema successfully upgraded with Watchlists, DeviceTelemetry, MuleCommunities, and ApoloFilings!")
