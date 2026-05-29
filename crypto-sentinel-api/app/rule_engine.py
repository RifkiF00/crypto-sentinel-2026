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


def evaluate_transaction(transaction: Any, threat_df: pd.DataFrame) -> RuleEngineResult:
    risk_score = 0
    reasons: list[str] = []
    threat_match: dict[str, Any] | None = None

    if transaction.type in HIGH_RISK_TYPES:
        risk_score += 30
        reasons.append("High-risk transaction type")

    if transaction.amount > HIGH_RISK_AMOUNT:
        risk_score += 25
        reasons.append("High transaction amount")

    if transaction.oldbalanceOrg > 0 and transaction.newbalanceOrig == 0:
        risk_score += 35
        reasons.append("Sender balance drained after transaction")

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
