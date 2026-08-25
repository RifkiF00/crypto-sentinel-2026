import unittest
import pandas as pd
from app.rule_engine import evaluate_transaction, RuleEngineResult

class MockTransaction:
    def __init__(self, type: str, amount: float, oldbalanceOrg: float, newbalanceOrig: float, destinationAccount: str,
                 device_id: str = None, ip_address: str = None, purpose_code: str = None, description: str = None):
        self.type = type
        self.amount = amount
        self.oldbalanceOrg = oldbalanceOrg
        self.newbalanceOrig = newbalanceOrig
        self.destinationAccount = destinationAccount
        self.device_id = device_id
        self.ip_address = ip_address
        self.purpose_code = purpose_code
        self.description = description

class TestRuleEngine(unittest.TestCase):
    def setUp(self):
        # Create a dummy threat intelligence DataFrame
        self.threat_df = pd.DataFrame([
            {"account_id": "BLACK_001", "risk_level": "HIGH", "risk_category": "Blacklisted Exchange Address"},
            {"account_id": "WARN_002", "risk_level": "MEDIUM", "risk_category": "Suspicious Activity Pattern"}
        ])
        # Create a dummy sender profile
        self.sender_profile = {
            "national_id": "3171092828020921",
            "registered_device": "DEV-IPHONE15-88A",
            "registered_ip": "182.16.2.89"
        }

    def test_low_risk_transaction(self):
        # A normal transfer of small amount, no threat match, no balance drained
        tx = MockTransaction(
            type="PAYMENT",
            amount=500,
            oldbalanceOrg=1000,
            newbalanceOrig=500,
            destinationAccount="LEGIT_ACC",
            device_id="DEV-IPHONE15-88A",
            ip_address="182.16.2.89"
        )
        result = evaluate_transaction(tx, self.threat_df, self.sender_profile)
        self.assertEqual(result.decision, "ALLOW")
        self.assertEqual(result.risk_level, "LOW")
        self.assertLessEqual(result.risk_score, 49)  # base score only, should be LOW

    def test_device_anomaly(self):
        # Transaction with dynamic device anomaly
        tx = MockTransaction(
            type="PAYMENT",
            amount=500,
            oldbalanceOrg=1000,
            newbalanceOrig=500,
            destinationAccount="LEGIT_ACC",
            device_id="DEV-EMULATOR-XYZ",  # Device anomaly!
            ip_address="182.16.2.89"
        )
        result = evaluate_transaction(tx, self.threat_df, self.sender_profile)
        self.assertEqual(result.risk_score, 35)  # 15 (base) + 20 (device anomaly)
        self.assertIn("Device ID mismatch: unverified device detected", result.reasons)

    def test_impossible_travel(self):
        # Transaction with geolocation IP anomaly
        tx = MockTransaction(
            type="PAYMENT",
            amount=500,
            oldbalanceOrg=1000,
            newbalanceOrig=500,
            destinationAccount="LEGIT_ACC",
            device_id="DEV-IPHONE15-88A",
            ip_address="195.220.10.1"  # IP anomaly!
        )
        result = evaluate_transaction(tx, self.threat_df, self.sender_profile)
        self.assertEqual(result.risk_score, 40)  # 15 (base) + 25 (ip/impossible travel)
        self.assertIn("Impossible travel detected (IP Geolocation Anomaly)", result.reasons)

    def test_purpose_mismatch(self):
        # Personal purpose transfer code to a crypto-bound destination
        tx = MockTransaction(
            type="PAYMENT",
            amount=500,
            oldbalanceOrg=1000,
            newbalanceOrig=500,
            destinationAccount="C_MOCK_EXCHANGE",  # Exchange address!
            device_id="DEV-IPHONE15-88A",
            ip_address="182.16.2.89",
            purpose_code="DEBT"
        )
        result = evaluate_transaction(tx, self.threat_df, self.sender_profile)
        self.assertEqual(result.risk_score, 45)  # 15 (base) + 30 (purpose mismatch)
        self.assertIn("Purpose Mismatch: Personal/Salary transfer code sent to crypto exchange", result.reasons)

    def test_extreme_risk_block(self):
        # TRANSFER + High Amount + Balance Drained + Threat Intel Match + Device Anomaly
        tx = MockTransaction(
            type="TRANSFER",
            amount=1500000,
            oldbalanceOrg=1500000,
            newbalanceOrig=0,
            destinationAccount="BLACK_001",
            device_id="DEV-HACKED-PHONE"
        )
        result = evaluate_transaction(tx, self.threat_df, self.sender_profile)
        # 30 (type) + 25 (amount) + 35 (drained) + 20 (device) + 70 (threat high) = 180 -> capped at 100 -> BLOCK
        self.assertEqual(result.decision, "BLOCK")
        self.assertEqual(result.risk_level, "HIGH")
        self.assertEqual(result.risk_score, 100)

if __name__ == "__main__":
    unittest.main()
