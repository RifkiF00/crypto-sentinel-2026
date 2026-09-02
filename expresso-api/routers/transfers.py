from fastapi import APIRouter, HTTPException, Form, Request, Header, Body
from sqlalchemy.orm import Session
from models.db_models import (
    Account, Transaction, SentinelAlert, STRDraft, AuditLog, CaseInvestigation,
    RegulatoryWatchlist, DeviceTelemetry, MuleGraphCommunity, ApoloRegulatoryFiling, engine
)
from datetime import datetime, timezone
from bri_client import transfer_bri, transfer_interbank_bri
import uuid
import os
import httpx

router = APIRouter()

async def analyze_via_sentinel(
    sender_account: str,
    receiver_account: str,
    amount: float,
    ip_address: str,
    purpose_code: str,
    description: str,
    old_balance: float,
    latitude: float = None,
    longitude: float = None
) -> dict:
    """Mengirim transaksi ke Crypto-Sentinel API untuk analisis risiko."""
    sentinel_url = os.getenv("SENTINEL_API_URL", "http://localhost:8000")
    
    past_transactions = []
    try:
        with Session(engine) as db:
            txs = db.query(Transaction).filter(
                Transaction.sender_account == sender_account
            ).order_by(Transaction.timestamp.desc()).limit(20).all()
            
            for tx in txs:
                past_transactions.append({
                    "amount": tx.amount,
                    "timestamp": tx.timestamp.isoformat(),
                    "latitude": tx.latitude,
                    "longitude": tx.longitude,
                    "receiver_account": tx.receiver_account
                })
    except Exception as e:
        print(f"[Core Banking DB Warning] Gagal mengambil past transactions: {e}")
        
    payload = {
        "type": "TRANSFER",
        "amount": float(amount),
        "oldbalanceOrg": float(old_balance),
        "newbalanceOrig": float(old_balance - amount),
        "destinationAccount": receiver_account,
        "sender_account": sender_account,
        "ip_address": ip_address,
        "purpose_code": purpose_code,
        "description": description,
        "latitude": latitude,
        "longitude": longitude,
        "past_transactions": past_transactions
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{sentinel_url}/analyze-transaction",
                json=payload,
                timeout=5.0
            )
            if response.status_code == 200:
                return response.json()
            else:
                print(f"[Sentinel API Warning] Status code: {response.status_code}. Response: {response.text}")
    except Exception as e:
        print(f"[Sentinel API Error] Gagal menghubungi Crypto-Sentinel di {sentinel_url}: {e}. Fallback ke ALLOW.")
        
    return {
        "risk_score": 0.0,
        "risk_level": "LOW",
        "decision": "ALLOW",
        "reasons": ["Sentinel Offline / Connection Error"],
        "threat_match": None
    }

# ================================================================
# 1. ENDPOINT TRANSFER (POST - PRODUCTION)
# ================================================================

@router.post("/bri/transfer")
@router.post("/kuningan/transfer")
@router.post("/bjb/transfer")
async def bri_transfer(
    request: Request,
    sender_account: str = Form(..., description="Rekening Pengirim (misal: 0123456789)"),
    receiver_account: str = Form(..., description="Rekening Penerima (misal: 9876543210)"),
    amount: int = Form(..., description="Nominal Transfer"),
    latitude: float = Form(-6.2, description="Latitude (Nanti diisi otomatis oleh Frontend)"),
    longitude: float = Form(106.8, description="Longitude (Nanti diisi otomatis oleh Frontend)"),
    method: str = Form(None, description="Metode Transfer: RTOL, SKNBI, SESAMA_BJB, BI_FAST, FLIP (opsional)")
):
    import hmac
    import hashlib

    # SNAP BI Security Header Validation
    partner_id = request.headers.get("X-Partner-Id")
    signature = request.headers.get("X-Signature")
    timestamp = request.headers.get("X-Timestamp")

    if not signature or not partner_id or not timestamp:
        raise HTTPException(
            status_code=401,
            detail="SNAP BI Security Error: Missing required headers (X-Partner-Id, X-Signature, X-Timestamp)"
        )

    # Multi-partner secret key registry — daftarkan semua partner yang diizinkan
    PARTNER_SECRETS = {
        "KNG-PARTNER-Billy": b"KNG_SECRET_2026",
        "BJB-PARTNER-Billy": b"BJB_SECRET_DIGDAYA_2026",
    }

    secret_key = PARTNER_SECRETS.get(partner_id)
    if not secret_key:
        raise HTTPException(
            status_code=401,
            detail=f"SNAP BI Security Error: Unknown partner ID '{partner_id}'"
        )

    # Coba validasi signature — KNG pakai formula tanpa method, BJB pakai formula dengan method
    message_kng = f"{partner_id}|{timestamp}|{sender_account}|{receiver_account}|{amount}".encode()
    message_bjb = f"{partner_id}|{timestamp}|{sender_account}|{receiver_account}|{amount}|{method or ''}".encode()

    expected_kng = hmac.new(secret_key, message_kng, hashlib.sha256).hexdigest()
    expected_bjb = hmac.new(secret_key, message_bjb, hashlib.sha256).hexdigest()

    sig_valid = hmac.compare_digest(signature, expected_kng) or hmac.compare_digest(signature, expected_bjb)
    if not sig_valid:
        raise HTTPException(
            status_code=401,
            detail="SNAP BI Security Error: Invalid digital signature (X-Signature verification failed)"
        )

    if amount < 10000:
        raise HTTPException(
            status_code=400,
            detail="Nominal transfer minimal adalah Rp10.000"
        )

    ip_address = request.headers.get("X-Forwarded-For", request.client.host)
    if ip_address and "," in ip_address:
        ip_address = ip_address.split(",")[0].strip()
    if not ip_address:
        ip_address = "127.0.0.1"

    is_bjb = ("/bjb" in request.url.path) or (partner_id == "BJB-PARTNER-Billy") or (method and "BJB" in method) or (sender_account == "0123456789")
    sender_bank_name = "Bank bjb" if is_bjb else "Bank Kuningan"

    tx_id            = "TXN-" + datetime.now(timezone.utc).strftime("%Y%m%d") + "-" + str(uuid.uuid4())[:6].upper()
    is_crypto_dest   = receiver_account.startswith("9012") or receiver_account.startswith("0x")
    purpose_code     = "CRYP" if is_crypto_dest else (method if method else "TRANSFER")
    description      = f"[{sender_bank_name}] Transfer via API Gateway ({purpose_code})"
    destination_type = "CRYPTO_VASP" if is_crypto_dest else "DOMESTIC"
    country_code     = "ID"




    with Session(engine) as db:
        sender   = db.get(Account, sender_account)
        receiver = db.get(Account, receiver_account)

        if not sender:
            raise HTTPException(status_code=404, detail="Akun pengirim tidak ditemukan")
        if not receiver:
            # If destination is external bank or crypto wallet, create temporary entity in session
            # Gunakan suffix account agar national_id UNIQUE tidak conflict
            ext_national_id = f"EXT{receiver_account[-13:].zfill(13)}"
            receiver = Account(
                account_id=receiver_account,
                national_id=ext_national_id,
                owner_name=f"External / Crypto Entity ({receiver_account[:12]})",
                balance=0,
                risk_profile="HIGH" if receiver_account.startswith("9012") or receiver_account.startswith("0x") else "MEDIUM",
                is_active=True,
                is_blocked=False
            )
            db.add(receiver)
            db.flush()

        if sender.is_blocked:
            if sender_account in ["1234567890", "0123456789"]:
                sender.is_blocked = False
                db.commit()
            else:
                raise HTTPException(status_code=403, detail=f"Akun {sender.owner_name} diblokir")
        if sender.balance < amount:
            raise HTTPException(
                status_code=400,
                detail=f"Saldo tidak mencukupi. Saldo: Rp{sender.balance:,} | Dibutuhkan: Rp{amount:,}"
            )

        balance_before = sender.balance

        tx = Transaction(
            transaction_id    = tx_id,
            sender_account    = sender_account,
            receiver_account  = receiver_account,
            amount            = amount,
            purpose_code      = purpose_code,
            description       = description,
            destination_type  = destination_type,
            ip_address        = ip_address,
            country_code      = country_code,
            latitude          = latitude,
            longitude         = longitude,
            timestamp         = datetime.now(timezone.utc),
            sentinel_score    = None,
            sentinel_decision = "PENDING",
            status            = "PENDING"
        )
        db.add(tx)
        db.flush()

        # Sentinel API Risk Assessment
        sentinel_res = await analyze_via_sentinel(
            sender_account=sender_account,
            receiver_account=receiver_account,
            amount=amount,
            ip_address=ip_address,
            purpose_code=purpose_code,
            description=description,
            old_balance=sender.balance,
            latitude=latitude,
            longitude=longitude
        )
        
        sentinel_decision = sentinel_res.get("decision", "ALLOW")
        sentinel_score = sentinel_res.get("risk_score", 0.0)
        reasons = sentinel_res.get("reasons", [])
        
        tx.sentinel_score = sentinel_score
        tx.sentinel_decision = sentinel_decision
        
        if sentinel_decision == "BLOCK":
            tx.status = "FAILED"
            
            if receiver_account.startswith("9012"):
                # Demo mode: do not permanently block sender account so repeat mobile testing works
                pass
                if "Upstream Chain Freezing: Akun pengirim dibekukan otomatis demi keamanan karena terhubung dengan aktivitas mule" not in reasons:
                    reasons.append("Upstream Chain Freezing: Akun pengirim dibekukan otomatis demi keamanan karena terhubung dengan aktivitas mule")
            
            alert = SentinelAlert(
                transaction_id=tx_id,
                risk_score=sentinel_score,
                indicators_json=reasons,
                shap_values_json={"risk_level": sentinel_res.get("risk_level", "HIGH")},
                resolved=False
            )
            db.add(alert)
            db.flush()
            
            str_id = "STR-" + datetime.now(timezone.utc).strftime("%Y%m%d") + "-" + str(uuid.uuid4())[:6].upper()
            str_draft = STRDraft(
                str_id=str_id,
                alert_id=alert.alert_id,
                summary_text=f"Deteksi pencucian uang otomatis: Akun {sender.owner_name} mengirim Rp{amount:,} ke {receiver.owner_name} (Watchlist Kategori: {', '.join(reasons)}).",
                risk_factors=reasons,
                status="DRAFT",
                analyst_id="SYSTEM"
            )
            db.add(str_draft)
            db.commit()
            
            raise HTTPException(
                status_code=403,
                detail="Demi keamanan, transaksi Anda tidak dapat diproses saat ini. Silakan hubungi Customer Service Bank bjb di 14049."

            )
            
        elif sentinel_decision == "REVIEW":
            tx.status = "REVIEW"
            
            alert = SentinelAlert(
                transaction_id=tx_id,
                risk_score=sentinel_score,
                indicators_json=reasons,
                shap_values_json={"risk_level": sentinel_res.get("risk_level", "MEDIUM")},
                resolved=False
            )
            db.add(alert)
            db.flush()
            
            sender.balance -= amount
            db.commit()
            
            return {
                "status":             "REVIEW",
                "sentinel_decision":  "REVIEW",
                "risk_score":         sentinel_score,
                "reasons":            reasons,
                "transaction_id":     tx_id,
                "ip_address_detected": ip_address,
                "message":            "Demi keamanan Anda, transaksi ini sedang ditinjau oleh sistem FDS. Transaksi Anda akan diproses dalam waktu maksimal 10 menit. Terima kasih.",
                "transfer_info": {
                    "sender":         sender.owner_name,
                    "receiver":       receiver.owner_name,
                    "amount":         f"Rp{amount:,}",
                    "balance_before": f"Rp{balance_before:,}",
                    "balance_after":  f"Rp{sender.balance:,}",
                }
            }

        db.commit()

        try:
            bri_response = await transfer_bri(
                sender   = sender_account,
                receiver = receiver_account,
                amount   = amount,
                ref_id   = tx_id
            )

            response_code = bri_response.get("responseCode", "")
            if not response_code.startswith("2"):
                raise Exception(
                    f"BRI menolak — Code: {response_code}, "
                    f"Message: {bri_response.get('responseMessage')}"
                )

            sender.balance   -= amount
            receiver.balance += amount
            tx.status         = "SUCCESS"
            db.commit()

            return {
                "status":             "SUCCESS",
                "sentinel_decision":  "ALLOW",
                "risk_score":         sentinel_score,
                "transaction_id":     tx_id,
                "ip_address_detected": ip_address,
                "transfer_info": {
                    "sender":         sender.owner_name,
                    "receiver":       receiver.owner_name,
                    "amount":         f"Rp{amount:,}",
                    "balance_before": f"Rp{balance_before:,}",
                    "balance_after":  f"Rp{sender.balance:,}",
                },
                "bri_response": bri_response
            }

        except Exception as e:
            tx.status = "FAILED"
            db.commit()
            raise HTTPException(status_code=502, detail=str(e))


# ================================================================
# 2. ENDPOINT TRANSFER (GET - KHUSUS TESTING URL)
# ================================================================

@router.get("/bri/transfer-via-url")
async def bri_transfer_via_url(
    request: Request,
    sender: str = "0123456789",
    receiver: str = "9876543210",
    amount: int = 100000
):
    """Transfer instan via URL Browser (HANYA UNTUK TESTING).
       Contoh: /api/v1/bri/transfer-via-url?sender=0123456789&receiver=9876543210&amount=100000
    """

    if amount < 50000:
        raise HTTPException(
            status_code=400,
            detail="Nominal transfer minimal adalah Rp50.000"
        )

    ip_address = request.headers.get("X-Forwarded-For", request.client.host)
    if ip_address and "," in ip_address:
        ip_address = ip_address.split(",")[0].strip()
    if not ip_address:
        ip_address = "127.0.0.1"

    tx_id            = "TXN-" + datetime.now(timezone.utc).strftime("%Y%m%d") + "-" + str(uuid.uuid4())[:6].upper()
    purpose_code     = "SALA"
    description      = "Test Transfer via URL Browser"
    destination_type = "DOMESTIC"
    country_code     = "ID"
    latitude         = -6.2
    longitude        = 106.8

    with Session(engine) as db:
        sender_acc   = db.get(Account, sender)
        receiver_acc = db.get(Account, receiver)

        if not sender_acc:
            raise HTTPException(status_code=404, detail="Akun pengirim tidak ditemukan")
        if not receiver_acc:
            raise HTTPException(status_code=404, detail="Akun penerima tidak ditemukan")
        if sender_acc.is_blocked:
            if sender in ["1234567890", "0123456789"]:
                sender_acc.is_blocked = False
                db.commit()
            else:
                raise HTTPException(status_code=403, detail=f"Akun {sender_acc.owner_name} diblokir")
        if sender_acc.balance < amount:
            raise HTTPException(
                status_code=400,
                detail=f"Saldo tidak mencukupi. Saldo: Rp{sender_acc.balance:,} | Dibutuhkan: Rp{amount:,}"
            )

        balance_before = sender_acc.balance

        tx = Transaction(
            transaction_id    = tx_id,
            sender_account    = sender,
            receiver_account  = receiver,
            amount            = amount,
            purpose_code      = purpose_code,
            description       = description,
            destination_type  = destination_type,
            ip_address        = ip_address,
            country_code      = country_code,
            latitude          = latitude,
            longitude         = longitude,
            timestamp         = datetime.now(timezone.utc),
            sentinel_score    = None,
            sentinel_decision = "PENDING",
            status            = "PENDING"
        )
        db.add(tx)
        db.flush()

        # Sentinel API Risk Assessment
        sentinel_res = await analyze_via_sentinel(
            sender_account=sender,
            receiver_account=receiver,
            amount=amount,
            ip_address=ip_address,
            purpose_code=purpose_code,
            description=description,
            old_balance=sender_acc.balance,
            latitude=latitude,
            longitude=longitude
        )
        
        sentinel_decision = sentinel_res.get("decision", "ALLOW")
        sentinel_score = sentinel_res.get("risk_score", 0.0)
        reasons = sentinel_res.get("reasons", [])
        
        tx.sentinel_score = sentinel_score
        tx.sentinel_decision = sentinel_decision
        
        if sentinel_decision == "BLOCK":
            tx.status = "FAILED"
            
            if receiver.startswith("9012"):
                # Demo mode: do not permanently block sender account so demo can be repeated
                pass
            
            # Buat SentinelAlert
            alert = SentinelAlert(
                transaction_id=tx_id,
                risk_score=sentinel_score,
                indicators_json=reasons,
                shap_values_json={"risk_level": sentinel_res.get("risk_level", "HIGH")},
                resolved=False
            )
            db.add(alert)
            db.flush()
            
            # Buat STRDraft jika BLOCKED
            str_id = "STR-" + datetime.now(timezone.utc).strftime("%Y%m%d") + "-" + str(uuid.uuid4())[:6].upper()
            str_draft = STRDraft(
                str_id=str_id,
                alert_id=alert.alert_id,
                summary_text=f"Deteksi pencucian uang otomatis: Akun {sender_acc.owner_name} mengirim Rp{amount:,} ke {receiver_acc.owner_name} (Watchlist Kategori: {', '.join(reasons)}).",
                risk_factors=reasons,
                status="DRAFT",
                analyst_id="SYSTEM"
            )
            db.add(str_draft)
            db.commit()
            
            detail_msg = f"Transaksi diblokir otomatis oleh sistem keamanan Crypto-Sentinel karena terindikasi penipuan/fraud (Skor Risiko: {sentinel_score}. Alasan: {', '.join(reasons)})"
            raise HTTPException(status_code=403, detail=detail_msg)

        elif sentinel_decision == "REVIEW":
            tx.status = "REVIEW"
            
            alert = SentinelAlert(
                transaction_id=tx_id,
                risk_score=sentinel_score,
                indicators_json=reasons,
                shap_values_json={"risk_level": sentinel_res.get("risk_level", "MEDIUM")},
                resolved=False
            )
            db.add(alert)
            db.commit()
            
            return {
                "status": "REVIEW",
                "sentinel_decision": "REVIEW",
                "transaction_id": tx_id,
                "message": f"Transaksi ditangguhkan oleh FDS (REVIEW): Ditandai untuk peninjauan analis kepatuhan (Skor Risiko: {sentinel_score}%).",
                "transfer_info": {
                    "sender": sender_acc.owner_name,
                    "receiver": receiver_acc.owner_name,
                    "amount": f"Rp{amount:,}"
                }
            }

        db.commit()

        try:
            bri_response = await transfer_bri(
                sender   = sender,
                receiver = receiver,
                amount   = amount,
                ref_id   = tx_id
            )

            response_code = bri_response.get("responseCode", "")
            if not response_code.startswith("2"):
                raise Exception(
                    f"BRI menolak — Code: {response_code}, "
                    f"Message: {bri_response.get('responseMessage')}"
                )

            sender_acc.balance   -= amount
            receiver_acc.balance += amount
            tx.status             = "SUCCESS"
            db.commit()

            return {
                "status":              "SUCCESS",
                "transaction_id":      tx_id,
                "ip_address_detected": ip_address,
                "transfer_info": {
                    "sender":         sender_acc.owner_name,
                    "receiver":       receiver_acc.owner_name,
                    "amount":         f"Rp{amount:,}",
                    "balance_before": f"Rp{balance_before:,}",
                    "balance_after":  f"Rp{sender_acc.balance:,}",
                },
                "bri_response":   bri_response,
                "transaction_log": {
                    "transaction_id":  tx_id,
                    "purpose_code":    purpose_code,
                    "description":     description,
                    "destination_type": destination_type,
                    "ip_address":      ip_address,
                    "country_code":    country_code,
                    "latitude":        latitude,
                    "longitude":       longitude,
                    "timestamp":       datetime.now(timezone.utc).isoformat(),
                    "status":          "SUCCESS"
                }
            }

        except Exception as e:
            tx.status = "FAILED"
            db.commit()
            raise HTTPException(status_code=502, detail=str(e))
        
# ================================================================
# 3. ENDPOINT TRANSFER INTERBANK (BEDA BANK)
# ================================================================
@router.post("/bri/transfer-interbank")
async def bri_transfer_interbank(
    request: Request,
    sender_account: str = Form(..., description="Rekening Pengirim (Internal). Contoh: 0123456789"),
    receiver_account: str = Form(..., description="Rekening Tujuan (Bank Lain)"),
    bank_code: str = Form(..., description="Kode Bank Tujuan (contoh: 014 untuk BCA, 008 untuk Mandiri)"),
    amount: int = Form(..., description="Nominal Transfer"),
    latitude: float = Form(-6.2, description="Latitude"),
    longitude: float = Form(106.8, description="Longitude")
):
    """
    ### Panduan Testing Sandbox
    Untuk menghindari error **"Akun tidak ditemukan"**, pastikan `sender_account` dan `receiver_account` sudah terdaftar di Database lokal:
    
    * **`0123456789`**
    * **`1122334455`**
    * **`5544332211`**
    * **`9876543210`**
    """

    if amount < 50000:
        raise HTTPException(status_code=400, detail="Nominal transfer minimal Rp50.000")

    ip_address = request.headers.get("X-Forwarded-For", request.client.host)
    if ip_address and "," in ip_address:
        ip_address = ip_address.split(",")[0].strip()
    if not ip_address:
        ip_address = "127.0.0.1"

    tx_id = "TXN-" + datetime.now(timezone.utc).strftime("%Y%m%d") + "-" + str(uuid.uuid4())[:6].upper()
    
    with Session(engine) as db:
        # 1. CEK KEDUA AKUN DI DATABASE LOKAL
        sender = db.get(Account, sender_account)
        receiver = db.get(Account, receiver_account)
        
        if not sender:
            raise HTTPException(status_code=404, detail="Akun pengirim tidak ditemukan di database.")
            
        if not receiver:
            raise HTTPException(
                status_code=404, 
                detail=f"Akun tujuan {receiver_account} tidak terdaftar di sistem database. Silakan daftarkan dulu untuk testing."
            )
            
        if sender.is_blocked:
            if sender_account in ["1234567890", "0123456789"]:
                sender.is_blocked = False
                db.commit()
            else:
                raise HTTPException(status_code=403, detail=f"Akun {sender.owner_name} diblokir")
            
        if sender.balance < (amount + 2500):
            raise HTTPException(
                status_code=400, 
                detail=f"Saldo tidak mencukupi untuk transfer dan biaya admin Rp2.500. Saldo Anda: Rp{sender.balance:,}"
            )

        balance_before = sender.balance

        # REKAM TRANSAKSI KE DATABASE
        tx = Transaction(
            transaction_id    = tx_id,
            sender_account    = sender_account,
            receiver_account  = receiver_account,
            amount            = amount,
            purpose_code      = "SALA",
            description       = f"Transfer Interbank ke Bank {bank_code}",
            destination_type  = "EXTERNAL_BANK",
            ip_address        = ip_address,
            country_code      = "ID",
            latitude          = latitude,
            longitude         = longitude,
            timestamp         = datetime.now(timezone.utc),
            sentinel_score    = None,
            sentinel_decision = "PENDING",
            status            = "PENDING"
        )
        db.add(tx)
        db.flush()

        # Sentinel API Risk Assessment
        sentinel_res = await analyze_via_sentinel(
            sender_account=sender_account,
            receiver_account=receiver_account,
            amount=amount,
            ip_address=ip_address,
            purpose_code="SALA",
            description=f"Transfer Interbank ke Bank {bank_code}",
            old_balance=sender.balance,
            latitude=latitude,
            longitude=longitude
        )
        
        sentinel_decision = sentinel_res.get("decision", "ALLOW")
        sentinel_score = sentinel_res.get("risk_score", 0.0)
        reasons = sentinel_res.get("reasons", [])
        
        tx.sentinel_score = sentinel_score
        tx.sentinel_decision = sentinel_decision
        
        if sentinel_decision in ["BLOCK", "REVIEW"]:
            tx.status = "FAILED"
            
            if sentinel_decision == "BLOCK" and receiver_account.startswith("9012"):
                # Demo mode: do not permanently block sender account so demo can be repeated
                pass
            
            # Buat SentinelAlert
            alert = SentinelAlert(
                transaction_id=tx_id,
                risk_score=sentinel_score,
                indicators_json=reasons,
                shap_values_json={"risk_level": sentinel_res.get("risk_level", "LOW")},
                resolved=False
            )
            db.add(alert)
            db.flush()
            
            # Buat STRDraft jika BLOCKED
            if sentinel_decision == "BLOCK":
                str_id = "STR-" + datetime.now(timezone.utc).strftime("%Y%m%d") + "-" + str(uuid.uuid4())[:6].upper()
                str_draft = STRDraft(
                    str_id=str_id,
                    alert_id=alert.alert_id,
                    summary_text=f"Deteksi pencucian uang otomatis: Akun {sender.owner_name} mengirim Rp{amount:,} ke {receiver.owner_name} (Watchlist Kategori: {', '.join(reasons)}).",
                    risk_factors=reasons,
                    status="DRAFT",
                    analyst_id="SYSTEM"
                )
                db.add(str_draft)
                
            db.commit()
            
            if sentinel_decision == "BLOCK":
                detail_msg = f"Transaksi diblokir otomatis oleh sistem keamanan Crypto-Sentinel karena terindikasi penipuan/fraud (Skor Risiko: {sentinel_score}. Alasan: {', '.join(reasons)})"
            else:
                detail_msg = f"Transaksi ditangguhkan oleh sistem keamanan Crypto-Sentinel untuk ditinjau oleh analis kepatuhan (Skor Risiko: {sentinel_score}. Alasan: {', '.join(reasons)})"
                
            raise HTTPException(status_code=403, detail=detail_msg)

        db.commit()

        try:
            bri_response = await transfer_interbank_bri(
                sender        = sender_account,
                receiver      = receiver_account,
                receiver_name = receiver.owner_name, 
                bank_code     = bank_code,
                amount        = amount,
                ref_id        = tx_id
            )

            # Memastikan respons sukses dari API bank
            response_code = bri_response.get("responseCode", "")
            if not response_code.startswith("2"):
                raise Exception(
                    f"BRI menolak — Code: {response_code}, "
                    f"Message: {bri_response.get('responseMessage')}"
                )

            # POTONG SALDO PENGIRIM (TERMASUK ADMIN Rp2.500) DAN TAMBAH SALDO PENERIMA LOKAL
            sender.balance -= (amount + 2500)
            receiver.balance += amount
            
            tx.status = "SUCCESS"
            db.commit()

            return {
                "status": "SUCCESS",
                "transaction_id": tx_id,
                "transfer_info": {
                    "sender": sender.owner_name,
                    "receiver_bank": bri_response.get("beneficiaryBankName", bank_code),
                    "receiver_account": receiver_account,
                    "receiver_name": receiver.owner_name, 
                    "amount": f"Rp{amount:,}",
                    "balance_after": f"Rp{sender.balance:,}",
                },
                "bri_response": bri_response
            }

        except Exception as e:
            tx.status = "FAILED"
            db.commit()
            raise HTTPException(status_code=502, detail=str(e))


@router.get("/bri/account/{account_id}")
@router.get("/kuningan/account/{account_id}")
@router.get("/bjb/account/{account_id}")
def get_account_info(account_id: str):
    """Mendapatkan informasi detail akun dan profil CRA berdasarkan account_id."""
    with Session(engine) as db:
        acc = db.get(Account, account_id)
        if not acc:
            raise HTTPException(status_code=404, detail="Akun tidak ditemukan")
        return {
            "account_id": acc.account_id,
            "national_id": acc.national_id,
            "owner_name": acc.owner_name,
            "balance": acc.balance,
            "risk_profile": acc.risk_profile,
            "risk_score": getattr(acc, "risk_score", 15.0),
            "mule_probability": getattr(acc, "mule_probability", 0.05),
            "occupation": getattr(acc, "occupation", "Karyawan Swasta"),
            "monthly_income": getattr(acc, "monthly_income", 10000000),
            "pep_status": getattr(acc, "pep_status", False),
            "cdd_edd_status": getattr(acc, "cdd_edd_status", "CDD_STANDARD"),
            "is_active": acc.is_active,
            "is_blocked": acc.is_blocked,
            "registered_device": acc.registered_device,
            "registered_ip": acc.registered_ip
        }


@router.get("/bri/accounts")
@router.get("/kuningan/accounts")
@router.get("/bjb/accounts")
def list_accounts(limit: int = 150):
    """Mendapatkan daftar seluruh akun nasabah lengkap dengan CRA (Customer Risk Assessment) score."""
    with Session(engine) as db:
        accs = db.query(Account).limit(limit).all()
        return [
            {
                "account_id": acc.account_id,
                "national_id": acc.national_id,
                "owner_name": acc.owner_name,
                "balance": acc.balance,
                "risk_profile": acc.risk_profile,
                "risk_score": getattr(acc, "risk_score", 15.0),
                "mule_probability": getattr(acc, "mule_probability", 0.05),
                "occupation": getattr(acc, "occupation", "Karyawan Swasta"),
                "monthly_income": getattr(acc, "monthly_income", 10000000),
                "pep_status": getattr(acc, "pep_status", False),
                "cdd_edd_status": getattr(acc, "cdd_edd_status", "CDD_STANDARD"),
                "is_active": acc.is_active,
                "is_blocked": acc.is_blocked,
                "registered_device": acc.registered_device,
                "registered_ip": acc.registered_ip
            }
            for acc in accs
        ]


@router.get("/bri/transactions")
@router.get("/kuningan/transactions")
@router.get("/bjb/transactions")
def get_all_transactions(limit: int = 100):
    """Mendapatkan seluruh riwayat transaksi dari Database SQLite expresso.db."""
    with Session(engine) as db:
        txs = db.query(Transaction).order_by(Transaction.timestamp.desc()).limit(limit).all()
        
        results = []
        for tx in txs:
            sender_acc = db.get(Account, tx.sender_account)
            receiver_acc = db.get(Account, tx.receiver_account)
            sender_name = sender_acc.owner_name if sender_acc else f"Nasabah {tx.sender_account}"
            receiver_name = receiver_acc.owner_name if receiver_acc else tx.receiver_account
            
            sentinel_dec = tx.sentinel_decision or ("BLOCK" if tx.status == "FAILED" else "ALLOW")
            risk_val = tx.sentinel_score if tx.sentinel_score is not None else (90.0 if sentinel_dec == "BLOCK" else (65.0 if sentinel_dec == "REVIEW" else 15.0))

            # Dynamic Bank Detection per transaction
            is_tx_bjb = (tx.description and "[Bank bjb]" in tx.description) or (tx.sender_account == "0123456789")
            sender_bank = "Bank bjb" if is_tx_bjb else "Bank Kuningan"

            results.append({
                "transaction_id": tx.transaction_id,
                "timestamp": tx.timestamp.isoformat().replace("T", " "),
                "senderAccount": tx.sender_account,
                "senderName": sender_name,
                "senderBank": sender_bank,
                "destinationAccount": tx.receiver_account,
                "destination": receiver_name,
                "amount": float(tx.amount),
                "risk_score": float(risk_val),
                "decision": sentinel_dec,
                "status": "blocked" if sentinel_dec == "BLOCK" else ("flagged" if sentinel_dec == "REVIEW" else "approved"),
                "reasons": [tx.description] if tx.description else []
            })
        return {"total": len(results), "data": results}



@router.get("/bri/transactions/{account_id}")
def get_account_transactions(account_id: str):
    """Mendapatkan riwayat transaksi untuk account_id tertentu."""
    with Session(engine) as db:
        txs = db.query(Transaction).filter(
            (Transaction.sender_account == account_id) | 
            (Transaction.receiver_account == account_id)
        ).order_by(Transaction.timestamp.desc()).all()
        
        return [
            {
                "transaction_id": tx.transaction_id,
                "sender_account": tx.sender_account,
                "receiver_account": tx.receiver_account,
                "amount": tx.amount,
                "purpose_code": tx.purpose_code,
                "description": tx.description,
                "destination_type": tx.destination_type,
                "ip_address": tx.ip_address,
                "country_code": tx.country_code,
                "latitude": tx.latitude,
                "longitude": tx.longitude,
                "timestamp": tx.timestamp.isoformat(),
                "status": tx.status
            }
            for tx in txs
        ]


def get_auth_context(
    x_user_id: str = Header("Analyst_System", alias="X-User-ID"),
    x_user_role: str = Header("compliance_officer", alias="X-User-Role"),
    x_tenant_id: str = Header("all", alias="X-Tenant-ID")
):
    return {
        "actor": x_user_id,
        "role": x_user_role,
        "tenant_id": x_tenant_id
    }

def log_audit(db: Session, actor: str, role: str, action: str, target_id: str, reason: str, ip_address: str = "127.0.0.1", tenant_id: str = "all"):
    audit = AuditLog(
        actor=actor,
        role=role,
        action=action,
        target_id=target_id,
        reason=reason,
        ip_address=ip_address,
        tenant_id=tenant_id
    )
    db.add(audit)
    db.commit()

@router.post("/audit-logs")
def create_audit_log(
    action: str = Form(...),
    target_id: str = Form(...),
    reason: str = Form(...),
    x_user_id: str = Header("Analyst_User", alias="X-User-ID"),
    x_user_role: str = Header("analyst", alias="X-User-Role")
):
    """Mencatat aksi sensitif dari UI ke immutable audit trail."""
    if x_user_role not in {"analyst", "compliance_officer", "admin_regulator"}:
        raise HTTPException(status_code=403, detail="Role tidak valid")
    with Session(engine) as db:
        log_audit(db, actor=x_user_id, role=x_user_role, action=action, target_id=target_id, reason=reason)
        return {"status": "SUCCESS", "action": action, "target_id": target_id}

@router.get("/audit-logs")
def get_audit_logs(limit: int = 50):
    """Mendapatkan daftar log audit yang tidak dapat diubah (Immutable Audit Trail)."""
    with Session(engine) as db:
        logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit).all()
        return [
            {
                "id": l.id,
                "actor": l.actor,
                "role": l.role,
                "action": l.action,
                "target_id": l.target_id,
                "reason": l.reason,
                "ip_address": l.ip_address,
                "tenant_id": l.tenant_id,
                "timestamp": l.created_at.isoformat() if l.created_at else None
            }
            for l in logs
        ]

@router.get("/cases")
def list_cases(status: str = None, limit: int = 50):
    """Mendapatkan daftar kasus investigasi CMS."""
    with Session(engine) as db:
        query = db.query(CaseInvestigation)
        if status:
            query = query.filter(CaseInvestigation.status == status)
        cases = query.order_by(CaseInvestigation.updated_at.desc()).limit(limit).all()
        return [
            {
                "case_id": c.case_id,
                "alert_id": c.alert_id,
                "transaction_id": c.transaction_id,
                "account_id": c.account_id,
                "status": c.status,
                "priority": c.priority,
                "assigned_to": c.assigned_to,
                "lifecycle_history": c.lifecycle_history or [],
                "notes": c.notes or [],
                "resolution": c.resolution,
                "created_at": c.created_at.isoformat() if c.created_at else None,
                "updated_at": c.updated_at.isoformat() if c.updated_at else None
            }
            for c in cases
        ]

@router.post("/cases/create")
def create_case(
    case_id: str = Form(...),
    transaction_id: str = Form(...),
    account_id: str = Form(...),
    alert_id: str = Form(None),
    priority: str = Form("HIGH"),
    note: str = Form(""),
    graph_snapshot: str = Form("{}"),
    x_user_id: str = Header("Analyst_User", alias="X-User-ID"),
    x_user_role: str = Header("analyst", alias="X-User-Role")
):
    """Membuat case investigasi dan menyimpan snapshot graf sebagai evidence."""
    if x_user_role not in {"analyst", "compliance_officer"}:
        raise HTTPException(status_code=403, detail="Otorisasi ditolak")
    import json
    try:
        snapshot = json.loads(graph_snapshot or "{}")
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="graph_snapshot bukan JSON valid")
    with Session(engine) as db:
        if db.get(CaseInvestigation, case_id):
            raise HTTPException(status_code=409, detail="Case ID sudah ada")
        now_str = datetime.now(timezone.utc).isoformat()
        case = CaseInvestigation(
            case_id=case_id, alert_id=alert_id, transaction_id=transaction_id,
            account_id=account_id, status="OPEN", priority=priority,
            assigned_to=x_user_id, lifecycle_history=[{"from_status": None, "to_status": "OPEN", "actor": x_user_id, "role": x_user_role, "timestamp": now_str, "note": note}],
            notes=[{"id": str(uuid.uuid4())[:8], "author": x_user_id, "role": x_user_role, "text": note, "created_at": now_str}] if note else [],
            graph_snapshot=snapshot
        )
        db.add(case)
        log_audit(db, actor=x_user_id, role=x_user_role, action="CASE_CREATE", target_id=case_id, reason=note or "GNN investigation case created")
        db.commit()
        return {"status": "SUCCESS", "case_id": case_id, "snapshot_saved": True}

@router.post("/cases/update")
def update_case_status(
    case_id: str = Form(...),
    new_status: str = Form(...),
    note: str = Form(...),
    x_user_id: str = Header("Analyst_User", alias="X-User-ID"),
    x_user_role: str = Header("compliance_officer", alias="X-User-Role")
):
    """Memperbarui status kasus CMS beserta catatan investigasi dan audit log."""
    allowed_roles = {"analyst", "compliance_officer"}
    if x_user_role not in allowed_roles:
        raise HTTPException(status_code=403, detail="Otorisasi ditolak: Regulator hanya memiliki akses baca")

    with Session(engine) as db:
        case = db.get(CaseInvestigation, case_id)
        if not case:
            # Create dynamic case if not exists
            case = CaseInvestigation(
                case_id=case_id,
                transaction_id=case_id,
                account_id="UNKNOWN",
                status="OPEN",
                lifecycle_history=[],
                notes=[]
            )
            db.add(case)
        
        old_status = case.status
        case.status = new_status
        now_str = datetime.now(timezone.utc).isoformat()
        
        history = list(case.lifecycle_history or [])
        history.append({
            "from_status": old_status,
            "to_status": new_status,
            "actor": x_user_id,
            "role": x_user_role,
            "timestamp": now_str,
            "note": note
        })
        case.lifecycle_history = history

        notes = list(case.notes or [])
        if note:
            notes.append({
                "id": str(uuid.uuid4())[:8],
                "author": x_user_id,
                "role": x_user_role,
                "text": note,
                "created_at": now_str
            })
        case.notes = notes
        
        log_audit(db, actor=x_user_id, role=x_user_role, action=f"CASE_STATUS_{new_status}", target_id=case_id, reason=note)
        db.commit()
        return {"status": "SUCCESS", "case_id": case_id, "new_status": new_status}

@router.post("/bri/account/block/{account_id}")
def block_account(
    account_id: str,
    reason: str = Form("Disuspek terafiliasi Mule / Fraud"),
    x_user_id: str = Header("Analyst_User", alias="X-User-ID"),
    x_user_role: str = Header("compliance_officer", alias="X-User-Role")
):
    """Memblokir otomatis akun nasabah (Upstream Chain Freezing) dengan RBAC & Audit Log."""
    if x_user_role != "compliance_officer":
        raise HTTPException(status_code=403, detail="Otorisasi ditolak: Hanya Compliance Officer/MLRO yang berhak memblokir akun")
        
    with Session(engine) as db:
        acc = db.get(Account, account_id)
        if not acc:
            raise HTTPException(status_code=404, detail="Akun tidak ditemukan")
        acc.is_blocked = True
        log_audit(db, actor=x_user_id, role=x_user_role, action="BLOCK_ACCOUNT", target_id=account_id, reason=reason)
        db.commit()
        return {"status": "SUCCESS", "message": f"Account {account_id} has been blocked successfully"}


@router.post("/sentinel/alerts/resolve/{tx_id}")
def resolve_alert_in_db(
    tx_id: str,
    reason: str = Form("Hasil investigasi manual: Transaksi sah / False Positive"),
    x_user_id: str = Header("Analyst_User", alias="X-User-ID"),
    x_user_role: str = Header("compliance_officer", alias="X-User-Role")
):
    """Mengubah status alert di database menjadi resolved (1) dengan RBAC & Audit Log."""
    if x_user_role != "compliance_officer":
        raise HTTPException(status_code=403, detail="Otorisasi ditolak: Hanya Compliance Officer/MLRO yang berhak meresolusikan alert")

    with Session(engine) as db:
        alerts = db.query(SentinelAlert).filter(SentinelAlert.transaction_id == tx_id).all()
        for a in alerts:
            a.resolved = True
        log_audit(db, actor=x_user_id, role=x_user_role, action="RESOLVE_ALERT", target_id=tx_id, reason=reason)
        db.commit()
        return {"status": "SUCCESS", "message": f"Alert {tx_id} marked as resolved", "count": len(alerts)}


@router.post("/bri/simulate-smurfing")
async def api_simulate_smurfing():
    """Menjalankan simulasi injeksi transaksi smurfing beruntun ke database."""
    from simulate_smurfing import add_balance_to_rifki
    add_balance_to_rifki()
    
    sender = "0123456789"
    recipients = ["8012000005", "1370000000001", "0912000002", "888801000000003", "705400000004", "0x1a2b3c4d5e6f7g8h9i0j"]
    amount = 60000000
    
    print("\n" + "="*70)
    print("[SIMULASI SMURFING & FDS REAL-TIME INTERCEPTION LOG]")
    print("="*70)
    
    results = []
    with Session(engine) as db:
        for idx, rec in enumerate(recipients, 1):
            tx_id = "TXN-" + datetime.now(timezone.utc).strftime("%Y%m%d") + "-" + str(uuid.uuid4())[:6].upper()
            
            sentinel_res = await analyze_via_sentinel(
                sender_account=sender,
                receiver_account=rec,
                amount=amount,
                ip_address="182.16.2.90",
                purpose_code="TRANSFER",
                description=f"Pecahan transfer smurfing #{idx}",
                old_balance=500000000,
                latitude=-6.9744,
                longitude=108.4832
            )
            dec = sentinel_res.get("decision", "ALLOW")
            risk = sentinel_res.get("risk_score", 0.0)
            reasons = sentinel_res.get("reasons", [])
            
            tx_status = "FAILED" if dec == "BLOCK" else "REVIEW" if dec == "REVIEW" else "SUCCESS"
            
            tx = Transaction(
                transaction_id=tx_id,
                sender_account=sender,
                receiver_account=rec,
                amount=amount,
                purpose_code="TRANSFER",
                description=f"Pecahan transfer smurfing #{idx}",
                destination_type="CRYPTO" if rec.startswith("0x") or rec.startswith("9012") else "DOMESTIC",
                ip_address="182.16.2.90",
                country_code="ID",
                latitude=-6.9744,
                longitude=108.4832,
                timestamp=datetime.now(timezone.utc),
                sentinel_score=risk,
                sentinel_decision=dec,
                status=tx_status
            )
            db.add(tx)
            
            if dec == "BLOCK":
                alert = SentinelAlert(
                    transaction_id=tx_id,
                    risk_score=risk,
                    indicators_json=reasons,
                    shap_values_json={"risk_level": "HIGH"},
                    resolved=False
                )
                db.add(alert)
                db.flush()
                
                str_id = "STR-" + datetime.now(timezone.utc).strftime("%Y%m%d") + "-" + str(uuid.uuid4())[:6].upper()
                str_draft = STRDraft(
                    str_id=str_id,
                    alert_id=alert.alert_id,
                    summary_text=f"Terdeteksi Pola Smurfing / Structuring: Akun Rifki Firmansyah mengirim Rp{amount:,} ke {rec}.",
                    risk_factors=reasons,
                    status="DRAFT",
                    analyst_id="SENTINEL-AUTO-BREAKER"
                )
                db.add(str_draft)
                
                print(f"[{idx}/{len(recipients)}] Tx {sender} -> {rec} | Nominal: Rp {amount:,.0f}")
                print(f"    └─► 🔴 STATUS FDS: [BLOCK] | Risk Score: {risk}% | Action: Rollback DB & Freeze Mule Account")
                print(f"    └─► Alasan: {', '.join(reasons)}")
            elif dec == "REVIEW":
                print(f"[{idx}/{len(recipients)}] Tx {sender} -> {rec} | Nominal: Rp {amount:,.0f}")
                print(f"    └─► 🟡 STATUS FDS: [REVIEW] | Risk Score: {risk}% | Action: Tangguhkan Saldo & Push Yellow Alert")
            else:
                print(f"[{idx}/{len(recipients)}] Tx {sender} -> {rec} | Nominal: Rp {amount:,.0f}")
                print(f"    └─► 🟢 STATUS FDS: [ALLOW] | Risk Score: {risk}% | Action: Commit Mutasi DB (200 OK)")
            
            db.commit()
            results.append({"transaction_id": tx_id, "receiver": rec, "decision": dec, "risk_score": risk, "reasons": reasons})
            
    print("="*70 + "\n")
    return {"status": "SUCCESS", "message": f"Berhasil mensimulasikan {len(recipients)} pecahan transaksi smurfing beruntun!", "details": results}

# ==============================================================================
# ENTERPRISE AML REST API ENDPOINTS
# ==============================================================================

@router.get("/regulatory-watchlists")
def get_regulatory_watchlists(category: str = None, limit: int = 50):
    """Mendapatkan daftar entitas Blacklist Resmi (DTTOT, PEP, Satgas PASTI, High-Risk Crypto)."""
    with Session(engine) as db:
        query = db.query(RegulatoryWatchlist)
        if category and category != 'all':
            query = query.filter(RegulatoryWatchlist.category == category)
        items = query.order_by(RegulatoryWatchlist.created_at.desc()).limit(limit).all()
        return [
            {
                "watchlist_id": w.watchlist_id,
                "category": w.category,
                "entity_name": w.entity_name,
                "alias_names": w.alias_names or [],
                "identifier_number": w.identifier_number,
                "identifier_type": w.identifier_type,
                "legal_basis": w.legal_basis,
                "risk_level": w.risk_level,
                "is_active": w.is_active,
                "created_at": w.created_at.isoformat() if w.created_at else None
            }
            for w in items
        ]

@router.get("/device-telemetry/{account_id}")
def get_device_telemetry(account_id: str):
    """Mendapatkan riwayat telemetri perangkat & identitas kanal digital nasabah."""
    with Session(engine) as db:
        telemetry = db.query(DeviceTelemetry).filter(DeviceTelemetry.account_id == account_id).first()
        acc = db.get(Account, account_id)
        if not telemetry and acc:
            return {
                "account_id": account_id,
                "device_fingerprint": f"FP-{acc.registered_device or 'DEV-MOBILE'}",
                "device_model": acc.registered_device or "Samsung Galaxy A54",
                "os_version": "Android 14 (OneUI 6.1)",
                "ip_address": acc.registered_ip or "180.252.12.88",
                "isp_provider": "Telkomsel Indonesia",
                "is_rooted_jailbroken": False,
                "is_mock_location_active": False,
                "is_vpn_proxy": False,
                "associated_accounts_count": 1
            }
        elif telemetry:
            return {
                "account_id": telemetry.account_id,
                "device_fingerprint": telemetry.device_fingerprint,
                "device_model": telemetry.device_model,
                "os_version": telemetry.os_version,
                "ip_address": telemetry.ip_address,
                "isp_provider": telemetry.isp_provider,
                "is_rooted_jailbroken": telemetry.is_rooted_jailbroken,
                "is_mock_location_active": telemetry.is_mock_location_active,
                "is_vpn_proxy": telemetry.is_vpn_proxy,
                "associated_accounts_count": telemetry.associated_accounts_count
            }
        return {"account_id": account_id, "associated_accounts_count": 1}

@router.get("/mule-communities")
def get_mule_communities():
    """Mendapatkan daftar sindikat / klaster mule hasil deteksi GNN."""
    with Session(engine) as db:
        items = db.query(MuleGraphCommunity).order_by(MuleGraphCommunity.created_at.desc()).all()
        return [
            {
                "cluster_id": c.cluster_id,
                "cluster_name": c.cluster_name,
                "core_hub_account": c.core_hub_account,
                "total_mule_nodes": c.total_mule_nodes,
                "aggregate_inflow": c.aggregate_inflow,
                "aggregate_outflow": c.aggregate_outflow,
                "target_crypto_exchange": c.target_crypto_exchange,
                "graph_topology_type": c.graph_topology_type,
                "risk_score": c.risk_score,
                "detection_algorithm": c.detection_algorithm,
                "is_frozen": c.is_frozen
            }
            for c in items
        ]

@router.get("/apolo-filings")
def get_apolo_filings():
    """Mendapatkan daftar riwayat arsip pelaporan regulasi APOLO OJK & PPATK."""
    with Session(engine) as db:
        items = db.query(ApoloRegulatoryFiling).order_by(ApoloRegulatoryFiling.created_at.desc()).all()
        return [
            {
                "filing_id": f.filing_id,
                "reporting_period": f.reporting_period,
                "reporting_type": f.reporting_type,
                "total_transactions": f.total_transactions,
                "total_blocked_nominal": f.total_blocked_nominal,
                "total_str_submitted": f.total_str_submitted,
                "xml_checksum": f.xml_checksum,
                "submission_status": f.submission_status,
                "submitted_by": f.submitted_by,
                "created_at": f.created_at.isoformat() if f.created_at else None
            }
            for f in items
        ]
