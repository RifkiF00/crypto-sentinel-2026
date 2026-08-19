from __future__ import annotations

from dataclasses import dataclass
from typing import Any
import math
from datetime import datetime, timedelta, timezone

import pandas as pd


@dataclass(frozen=True)
class RuleEngineResult:
    risk_score: int
    risk_level: str
    decision: str
    reasons: list[str]
    threat_match: dict[str, Any] | None


HIGH_RISK_TYPES = {"TRANSFER", "CASH_OUT"}
HIGH_RISK_AMOUNT = 1_000_000

VPN_DATACENTER_PREFIXES = (
    "45.154.", "104.28.", "172.64.", "198.41.", "185.220.", "194.26.", "193.32.", "103.152."
)

OFFICIAL_PURPOSE_CODES = {"GOVT", "EDUC", "TAXS", "HLTH", "SALA", "LOAN", "PENS"}
WHITELISTED_KEYWORDS = {"PLN", "BPJS", "KEMENSOS", "PDAM", "TELKOM", "SEKOLAH", "KOPERASI", "UNIVERSITAS", "UNIKU"}


def haversine_distance(lat1, lon1, lat2, lon2):
    r_lat1 = math.radians(lat1)
    r_lon1 = math.radians(lon1)
    r_lat2 = math.radians(lat2)
    r_lon2 = math.radians(lon2)
    
    dlat = r_lat2 - r_lat1
    dlon = r_lon2 - r_lon1
    
    a = math.sin(dlat / 2.0)**2 + math.cos(r_lat1) * math.cos(r_lat2) * math.sin(dlon / 2.0)**2
    c = 2.0 * math.asin(math.sqrt(a))
    r = 6371.0
    return c * r


def evaluate_transaction(transaction: Any, threat_df: pd.DataFrame, sender_profile: dict = None, past_transactions: list[dict] = None) -> RuleEngineResult:
    risk_score = 0
    reasons: list[str] = []
    threat_match: dict[str, Any] | None = None

    dest_str = str(getattr(transaction, "destinationAccount", ""))
    dest_lower = dest_str.lower()
    amount = float(getattr(transaction, "amount", 0))
    purpose_code = str(getattr(transaction, "purpose_code", "")).upper()
    ip_addr = str(getattr(transaction, "ip_address", ""))

    # 1. Behavioral: High-risk type & destination check (9012 prefix = high-risk bursa/mule accounts)
    is_crypto_or_threat = dest_str.startswith("9012") or "exchange" in dest_lower or "binance" in dest_lower or "indodax" in dest_lower
    is_sesama_bank = not is_crypto_or_threat and (dest_str in ["9876543210", "987654"] or dest_str.startswith("1000"))

    if not is_sesama_bank:
        risk_score += 25 if is_crypto_or_threat else 15
        reasons.append("External / High-risk transaction channel")

    # 2. Behavioral: High-risk amount check (> 15M for Sesama Bank, > 5M for External/Crypto)
    threshold = 15_000_000 if is_sesama_bank else 5_000_000
    if amount > threshold:
        risk_score += 35
        reasons.append(f"High transaction amount (> Rp {threshold:,.0f})")

    # 3. Behavioral: Balance Drained check (Drain-to-zero)
    old_bal = float(getattr(transaction, "oldbalanceOrg", 0))
    new_bal = float(getattr(transaction, "newbalanceOrig", 0))
    if old_bal > 0 and new_bal == 0:
        risk_score += 35
        reasons.append("Sender balance drained to zero after transaction")

    # 4. Behavioral: Odd-Hour Activity (00:00 - 04:00 WIB)
    now_wib = datetime.now(timezone(timedelta(hours=7)))
    current_hour = now_wib.hour
    if 0 <= current_hour <= 4:
        risk_score += 25
        reasons.append(f"Odd-Hour Activity Alert: Transaction at {current_hour:02d}:00 WIB (00:00-04:00 nocturnal window)")

    # 5. Behavioral: Dormant Account Activation (>30 days idle, sudden large transfer)
    if past_transactions:
        try:
            valid_timestamps = []
            for t in past_transactions:
                ts = t.get("timestamp")
                if ts:
                    dt = datetime.fromisoformat(str(ts).replace("Z", "+00:00"))
                    valid_timestamps.append(dt)
            if valid_timestamps:
                latest_past = max(valid_timestamps)
                now_utc = datetime.now(timezone.utc)
                if latest_past.tzinfo is None:
                    latest_past = latest_past.replace(tzinfo=timezone.utc)
                days_idle = (now_utc - latest_past).days
                if days_idle > 30 and amount > 5_000_000:
                    risk_score += 30
                    reasons.append(f"Dormant Account Activation: Account idle for {days_idle} days, followed by sudden large transfer (> Rp 5M)")
        except Exception as e:
            print(f"[Dormant Check Warning]: {e}")

    # 6. Technical: Device ID Anomaly check
    device_id = getattr(transaction, "device_id", None)
    if sender_profile and device_id and sender_profile.get("registered_device"):
        if str(device_id) != str(sender_profile["registered_device"]):
            risk_score += 20
            reasons.append("Device ID mismatch: unverified device detected")

    # 7. Technical: IP Geolocation Anomaly & VPN Datacenter Check
    is_local_ip = ip_addr.startswith("192.168.") or ip_addr.startswith("127.0.0.1") or ip_addr.startswith("172.")
    if ip_addr and any(ip_addr.startswith(prefix) for prefix in VPN_DATACENTER_PREFIXES):
        risk_score += 20
        reasons.append(f"Technical Anomaly: Origin IP ({ip_addr}) matches known VPN/Datacenter proxy range")
    elif sender_profile and ip_addr and sender_profile.get("registered_ip") and not is_local_ip:
        if ip_addr != sender_profile["registered_ip"]:
            risk_score += 25
            reasons.append("Impossible travel detected (IP Geolocation Anomaly)")

    # 8. Purpose Mismatch: ISO 20022 Purpose vs. Destination
    if purpose_code in ["DEBT", "SALA"]:
        is_exchange = dest_str.startswith("C") or "exchange" in dest_lower or is_crypto_or_threat
        if is_exchange:
            risk_score += 20
            reasons.append("Purpose Mismatch: Personal/Salary transfer code sent to crypto exchange")

    # 9. Relational: Threat Intel Matching (Dynamic Lookup)
    if threat_df is not None and not threat_df.empty:
        match = threat_df[threat_df["account_id"].astype(str) == dest_str]
        if not match.empty:
            threat = match.iloc[0].to_dict()
            threat_match = threat
            r_level = str(threat.get("risk_level", "HIGH")).upper()
            if r_level == "HIGH":
                risk_score += 70
            elif r_level == "MEDIUM":
                risk_score += 40
            else:
                risk_score += 20
            reasons.append(f"Destination matched threat intelligence: {threat.get('risk_category', 'Blacklisted Entity')}")

    # 10. Advanced Behavioral: Dynamic Historical Baseline (5x avg amount)
    if past_transactions:
        amounts = [float(t["amount"]) for t in past_transactions if t.get("amount")]
        if amounts:
            avg_amount = sum(amounts) / len(amounts)
            if amount > 5 * avg_amount and amount > 200_000:
                risk_score += 30
                reasons.append(f"Dynamic Baseline Alert: Amount (Rp {amount:,.0f}) is > 5x customer's past average (Rp {avg_amount:,.0f})")

    # 11. Advanced Technical: Geolocation Impossible Travel
    if past_transactions:
        try:
            valid_past = [t for t in past_transactions if t.get("latitude") is not None and t.get("longitude") is not None and t.get("timestamp")]
            if valid_past:
                sorted_txs = sorted(valid_past, key=lambda x: x.get("timestamp", ""))
                latest_tx = sorted_txs[-1]
                lat1 = float(latest_tx.get("latitude"))
                lon1 = float(latest_tx.get("longitude"))
                lat2 = getattr(transaction, "latitude", None)
                lon2 = getattr(transaction, "longitude", None)
                
                t1_str = latest_tx.get("timestamp")
                t1 = datetime.fromisoformat(str(t1_str).replace("Z", "+00:00"))
                t2 = datetime.now(t1.tzinfo)
                
                if lat1 is not None and lon1 is not None and lat2 is not None and lon2 is not None:
                    lat2 = float(lat2)
                    lon2 = float(lon2)
                    distance = haversine_distance(lat1, lon1, lat2, lon2)
                    time_diff = (t2 - t1).total_seconds() / 3600.0
                    if time_diff > 0.001:
                        speed = distance / time_diff
                        if speed > 1000.0:
                            risk_score += 35
                            reasons.append(f"Impossible Travel Alert: Speed of {speed:,.0f} km/h between transactions exceeds physical limits ({distance:,.1f} km in {time_diff*60:,.1f} mins)")
        except Exception as e:
            print(f"[Impossible Travel Calculation Error]: {e}")

    # 12. Advanced Relational: Smurfing / Structuring Detection
    if past_transactions:
        try:
            one_hour_ago = datetime.now(timezone.utc) - timedelta(hours=1)
            recent_txs = []
            for t in past_transactions:
                t_time_str = t.get("timestamp")
                if t_time_str:
                    t_time = datetime.fromisoformat(str(t_time_str).replace("Z", "+00:00"))
                    if t_time.tzinfo is None:
                        t_time = t_time.replace(tzinfo=timezone.utc)
                    if t_time > one_hour_ago:
                        recent_txs.append(t)
            
            destinations = {str(t["receiver_account"]) for t in recent_txs if t.get("receiver_account")}
            if dest_str:
                destinations.add(dest_str)
            
            if len(destinations) >= 4:
                risk_score += 45
                reasons.append(f"Potential Smurfing/Structuring Pattern: {len(destinations)} distinct destination accounts in the last 1 hour")
        except Exception as e:
            print(f"[Smurfing Detection Calculation Error]: {e}")

    # 13. Contextual Trust Whitelist & Official Purpose Code (Anti-False Positive Mitigation)
    is_whitelisted_dest = any(kw in dest_lower for kw in WHITELISTED_KEYWORDS)
    is_official_purpose = purpose_code in OFFICIAL_PURPOSE_CODES
    if is_whitelisted_dest or is_official_purpose:
        # Give risk reduction offset to prevent false positive on government/education disbursements
        offset = 30
        risk_score = max(0, risk_score - offset)
        reasons.append(f"Contextual Trust Signal: Verified entity / official purpose code ({purpose_code or 'WHITELIST'}) applied (-{offset} risk offset)")

    # Cap risk score at 100
    risk_score = min(risk_score, 100)

    if risk_score >= 85:
        decision = "BLOCK"
        risk_level = "HIGH"
    elif risk_score >= 60:
        decision = "REVIEW"
        risk_level = "MEDIUM"
    else:
        decision = "ALLOW"
        risk_level = "LOW"

    return RuleEngineResult(
        risk_score=risk_score,
        risk_level=risk_level,
        decision=decision,
        reasons=reasons,
        threat_match=threat_match,
    )

