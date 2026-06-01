import unittest
import pandas as pd
from app.rule_engine import evaluate_transaction, RuleEngineResult

class MockTransaction:
    def __init__(self, type: str, amount: float, oldbalanceOrg: float, newbalanceOrig: float, destinationAccount: str):
        self.type = type
        self.amount = amount
        self.oldbalanceOrg = oldbalanceOrg
        self.newbalanceOrig = newbalanceOrig
        self.destinationAccount = destinationAccount

class TestRuleEngine(unittest.TestCase):
    def setUp(self):
        # Create a dummy threat intelligence DataFrame
        self.threat_df = pd.DataFrame([
            {"account_id": "BLACK_001", "risk_level": "HIGH", "risk_category": "Blacklisted Exchange Address"},
            {"account_id": "WARN_002", "risk_level": "MEDIUM", "risk_category": "Suspicious Activity Pattern"}
        ])

    def test_low_risk_transaction(self):
        # A normal transfer of small amount, no threat match, no balance drained
        tx = MockTransaction(
            type="PAYMENT",
            amount=500,
            oldbalanceOrg=1000,
            newbalanceOrig=500,
            destinationAccount="LEGIT_ACC"
        )
        result = evaluate_transaction(tx, self.threat_df)
        self.assertEqual(result.decision, "ALLOW")
        self.assertEqual(result.risk_level, "LOW")
        self.assertEqual(result.risk_score, 0)
        self.assertEqual(len(result.reasons), 0)

    def test_high_risk_type_and_amount(self):
        # High risk type (TRANSFER) + High amount (> 1M)
        tx = MockTransaction(
            type="TRANSFER",
            amount=1500000,
            oldbalanceOrg=2000000,
            newbalanceOrig=500000,
            destinationAccount="LEGIT_ACC"
        )
        result = evaluate_transaction(tx, self.threat_df)
        # 30 (type) + 25 (amount) = 55 -> REVIEW
        self.assertEqual(result.decision, "REVIEW")
        self.assertEqual(result.risk_level, "MEDIUM")
        self.assertEqual(result.risk_score, 55)
        self.assertIn("High-risk transaction type", result.reasons)
        self.assertIn("High transaction amount", result.reasons)

    def test_balance_drained(self):
        # Balance drained (old > 0, new == 0)
        tx = MockTransaction(
            type="PAYMENT",
            amount=1000,
            oldbalanceOrg=1000,
            newbalanceOrig=0,
            destinationAccount="LEGIT_ACC"
        )
        result = evaluate_transaction(tx, self.threat_df)
        # 35 (drained) = 35 -> ALLOW
        self.assertEqual(result.decision, "ALLOW")
        self.assertEqual(result.risk_level, "LOW")
        self.assertEqual(result.risk_score, 35)
        self.assertIn("Sender balance drained after transaction", result.reasons)

    def test_threat_intel_match_high(self):
        # Match threat intel with high risk level
        tx = MockTransaction(
            type="PAYMENT",
            amount=500,
            oldbalanceOrg=1000,
            newbalanceOrig=500,
            destinationAccount="BLACK_001"
        )
        result = evaluate_transaction(tx, self.threat_df)
        # 70 (threat high) = 70 -> REVIEW
        self.assertEqual(result.decision, "REVIEW")
        self.assertEqual(result.risk_level, "MEDIUM")
        self.assertEqual(result.risk_score, 70)
        self.assertIsNotNone(result.threat_match)
        self.assertEqual(result.threat_match["risk_category"], "Blacklisted Exchange Address")

    def test_extreme_risk_block(self):
        # TRANSFER + High Amount + Balance Drained + Threat Intel Match
        tx = MockTransaction(
            type="TRANSFER",
            amount=1500000,
            oldbalanceOrg=1500000,
            newbalanceOrig=0,
            destinationAccount="BLACK_001"
        )
        result = evaluate_transaction(tx, self.threat_df)
        # 30 (type) + 25 (amount) + 35 (drained) + 70 (threat high) = 160 -> capped at 100 -> BLOCK
        self.assertEqual(result.decision, "BLOCK")
        self.assertEqual(result.risk_level, "HIGH")
        self.assertEqual(result.risk_score, 100)
        self.assertEqual(len(result.reasons), 4)

if __name__ == "__main__":
    unittest.main()
