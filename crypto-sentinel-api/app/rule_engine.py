from __future__ import annotations

from dataclasses import dataclass
from typing import Any

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


def evaluate_transaction(transaction: Any, threat_df: pd.DataFrame, sender_profile: dict = None) -> RuleEngineResult:
    risk_score = 0
    reasons: list[str] = []
    threat_match: dict[str, Any] | None = None

    # 1. Behavioral: High-risk type & destination check
    is_crypto_or_threat = transaction.destinationAccount.startswith("C") or "exchange" in transaction.destinationAccount.lower()
    is_sesama_bank = not is_crypto_or_threat and len(transaction.destinationAccount) == 10

    if not is_sesama_bank:
        risk_score += 25 if is_crypto_or_threat else 15
        reasons.append("External / High-risk transaction channel")

    # 2. Behavioral: High-risk amount check (> 10M for Sesama Bank, > 5M for External/Crypto)
    threshold = 10_000_000 if is_sesama_bank else 5_000_000
    if transaction.amount > threshold:
        risk_score += 35
        reasons.append(f"High transaction amount (> Rp {threshold:,.0f})")

    # 3. Behavioral: Balance Drained check
    if transaction.oldbalanceOrg > 0 and transaction.newbalanceOrig == 0:
        risk_score += 35
        reasons.append("Sender balance drained after transaction")

    # 4. Technical: Device ID Anomaly check
    if sender_profile and getattr(transaction, "device_id", None) and sender_profile.get("registered_device"):
        if transaction.device_id != sender_profile["registered_device"]:
            risk_score += 20
            reasons.append("Device ID changed suddenly (Device Anomaly)")

    # 5. Technical: IP Geolocation Anomaly check (ignore local Wi-Fi subnets 192.168.x.x / 127.0.0.1)
    ip_addr = str(getattr(transaction, "ip_address", ""))
    is_local_ip = ip_addr.startswith("192.168.") or ip_addr.startswith("127.0.0.1") or ip_addr.startswith("172.")
    if sender_profile and ip_addr and sender_profile.get("registered_ip") and not is_local_ip:
        if ip_addr != sender_profile["registered_ip"]:
            risk_score += 25
            reasons.append("Impossible travel detected (IP Geolocation Anomaly)")

    # 6. Purpose Mismatch: ISO 20022 Purpose vs. Destination check
    if getattr(transaction, "purpose_code", None) in ["DEBT", "SALA"]:
        # If destination account matches threat intel exchange or is a mock exchange
        is_exchange = transaction.destinationAccount.startswith("C") or "exchange" in transaction.destinationAccount.lower()
        if is_exchange:
            risk_score += 15
            reasons.append("Purpose mismatch: Personal transfer code sent to crypto exchange")

    # 7. Relational: Threat Intel Matching
    match = threat_df[threat_df["account_id"] == transaction.destinationAccount]

    if not match.empty:
        threat = match.iloc[0].to_dict()
        threat_match = threat

        if threat["risk_level"] == "HIGH":
            risk_score += 70
        elif threat["risk_level"] == "MEDIUM":
            risk_score += 40
        else:
            risk_score += 20

        reasons.append(f"Destination matched threat intelligence: {threat['risk_category']}")

    # Cap risk score at 100
    risk_score = min(risk_score, 100)

    if risk_score >= 80:
        decision = "BLOCK"
        risk_level = "HIGH"
    elif risk_score >= 50:
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
