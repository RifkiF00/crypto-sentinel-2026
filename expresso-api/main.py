from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import transfers 
from models.db_models import Base, engine
from seeder import seed_data

# Auto-create tables & seed 111+ nasabah accounts on startup if database is fresh
Base.metadata.create_all(bind=engine)
try:
    seed_data()
except Exception as e:
    print(f"[Seeder Auto-Init Warning]: {e}")

app = FastAPI(
    title="Crypto-Sentinel Core Banking API",
    version="1.0.0",
    description="API — Tim EXPRESSO, Universitas Kuningan"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(transfers.router, prefix="/api/v1")

@app.get("/health")
def health():
    return {"status": "OK", "service": "core-banking", "version": "1.0.0"}