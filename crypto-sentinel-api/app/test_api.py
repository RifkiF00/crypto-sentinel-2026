import unittest
\
from app.main import app

class TestCryptoSentinelAPI(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_root_endpoint(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "OK")
        self.assertEqual(data["message"], "Crypto-Sentinel API is running")

    def test_get_transactions(self):
        response = self.client.get("/transactions?limit=5")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("total", data)
        self.assertIn("data", data)
        self.assertEqual(len(data["data"]), 5)

    def test_get_threat_intel(self):
        response = self.client.get("/threat-intel")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("total", data)
        self.assertIn("data", data)

    def test_analyze_transaction_allow(self):
        # Normal low-risk transaction
        payload = {
            "type": "PAYMENT",
            "amount": 100.0,
            "oldbalanceOrg": 500.0,
            "newbalanceOrig": 400.0,
            "destinationAccount": "C12345678"
        }
        response = self.client.post("/analyze-transaction", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["risk_level"], "LOW")
        self.assertEqual(data["decision"], "ALLOW")
        self.assertIn("transaction_id", data)

    def test_analyze_transaction_block(self):
        # High-risk transaction (drained balance, transfer, and high amount)
        payload = {
            "type": "TRANSFER",
            "amount": 2000000.0,
            "oldbalanceOrg": 2000000.0,
            "newbalanceOrig": 0.0,
            "destinationAccount": "C99999999"  # High risk structure
        }
        response = self.client.post("/analyze-transaction", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["decision"], "BLOCK")
        self.assertEqual(data["risk_level"], "HIGH")
        self.assertGreaterEqual(data["risk_score"], 80)

    def test_logs_and_alerts_endpoints(self):
        # Post a high risk transaction first to ensure an alert is logged
        payload = {
            "type": "TRANSFER",
            "amount": 2000000.0,
            "oldbalanceOrg": 2000000.0,
            "newbalanceOrig": 0.0,
            "destinationAccount": "C99999999"
        }
        self.client.post("/analyze-transaction", json=payload)

        # Test logs endpoint
        logs_response = self.client.get("/logs")
        self.assertEqual(logs_response.status_code, 200)
        logs_data = logs_response.json()
        self.assertGreater(logs_data["total"], 0)

        # Test alerts endpoint
        alerts_response = self.client.get("/alerts")
        self.assertEqual(alerts_response.status_code, 200)
        alerts_data = alerts_response.json()
        self.assertGreater(alerts_data["total"], 0)

    def test_statistics(self):
        response = self.client.get("/statistics")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("total_transactions_analyzed", data)
        self.assertIn("decision_summary", data)
        self.assertIn("risk_level_summary", data)

    def test_gnn_inference(self):
        response = self.client.post("/gnn-inference")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["message"], "GNN Inference completed")
        self.assertIn("total_anomalies_detected", data)
        self.assertIn("graph_stats", data)

if __name__ == "__main__":
    unittest.main()
