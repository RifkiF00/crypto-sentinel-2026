"""
Attack Simulation Engine (150 Transaksi: 135 Normal + 15 Anomali Fraud)
Crypto-Sentinel FDS Engine | Bank Kuningan & Bank bjb 2026

Memetakan tepat 1 Fraud Anomaly untuk masing-masing dari 15 Indikator Blueprint AML & GNN:
- Group 1 (Behavioral): IND-01 Fan-out, IND-02 Dormant, IND-03 Drain, IND-04 Nocturnal
- Group 2 (Relational GNN): IND-05 Layering, IND-06 Cyclic, IND-07 PageRank, IND-08 Betweenness, IND-09 Blacklist, IND-10 Cosine
- Group 3 (Purpose & Nominal): IND-11 Structuring, IND-12 Purpose Mismatch, IND-13 Rapid Pass-through
- Group 4 (Technical & Telemetry): IND-14 Impossible Travel, IND-15 Rooted / VPN
Beserta 135 Transaksi Normal Perbankan (Payroll, QRIS, E-Commerce, Transfer Keluarga, UMKM).
"""

import random
from datetime import datetime, timedelta

FRAUD_METRICS_DEFINITIONS = [
    {
        "indicator_id": "IND-01",
        "code": "IND-01-FANOUT",
        "metric_name": "Fan-Out Rapid Dispersal",
        "category": "Behavioral Signals",
        "engine": "KONVENSIONAL + RULE",
        "risk_score": 94,
        "decision": "BLOCK",
        "sender": "0123456789",
        "sender_name": "Ahmad Faisal (Mule Master)",
        "sender_bank": "Bank bjb",
        "receiver": "8012000005",
        "receiver_name": "Rekening Penampung Mule 1",
        "receiver_bank": "BCA",
        "amount": 75000000,
        "channel": "BI-FAST",
        "purpose": "Transfer Cepat Sindikat",
        "reason": "Deteksi Fan-Out 1-to-10 rekening dalam < 90 detik. Total dispersi Rp 750.000.000."
    },
    {
        "indicator_id": "IND-02",
        "code": "IND-02-DORMANT",
        "metric_name": "Dormant Account Sudden Spike",
        "category": "Behavioral Signals",
        "engine": "KONVENSIONAL + RULE",
        "risk_score": 88,
        "decision": "BLOCK",
        "sender": "1122334455",
        "sender_name": "Rekening Hibernasi (Dormant 180 Hari)",
        "sender_bank": "Bank Kuningan",
        "receiver": "9012888812",
        "receiver_name": "Bursa Kripto Escrow",
        "receiver_bank": "Bank Mandiri",
        "amount": 250000000,
        "channel": "SKNBI / APEX",
        "purpose": "Pencairan Dana Mendadak",
        "reason": "Rekening pasif selama 6 bulan tiba-tiba aktif mentransfer 500x di atas baseline historis."
    },
    {
        "indicator_id": "IND-03",
        "code": "IND-03-DRAIN",
        "metric_name": "Drain-to-Zero Balance Outflow",
        "category": "Behavioral Signals",
        "engine": "KONVENSIONAL + RULE",
        "risk_score": 91,
        "decision": "BLOCK",
        "sender": "3344556677",
        "sender_name": "Hendra Wijaya (Mule Aggregator)",
        "sender_bank": "Bank Kuningan",
        "receiver": "9012999901",
        "receiver_name": "Indodax Hot Wallet Gate",
        "receiver_bank": "Bank BCA Escrow",
        "amount": 124950000,
        "channel": "BI-FAST",
        "purpose": "Likuidasi Saldo Total",
        "reason": "Saldo rekening Rp 125.000.000 dikuras habis 99.96% menyisakan Rp 50.000 dalam 1 transaksi."
    },
    {
        "indicator_id": "IND-04",
        "code": "IND-04-NOCTURNAL",
        "metric_name": "Off-Hours Nocturnal Velocity",
        "category": "Behavioral Signals",
        "engine": "KONVENSIONAL + RULE",
        "risk_score": 85,
        "decision": "REVIEW",
        "sender": "4455667788",
        "sender_name": "CV Berkah Mandiri (Pribadi)",
        "sender_bank": "Bank bjb",
        "receiver": "7788990011",
        "receiver_name": "Rekening Perantara Malam",
        "receiver_bank": "Bank CIMB Niaga",
        "amount": 85000000,
        "channel": "MOBILE BANKING",
        "purpose": "Transfer Dini Hari",
        "reason": "5x transaksi beruntun nominal tinggi dieksekusi pada jam 03:17 WIB (di luar jam wajar nasabah)."
    },
    {
        "indicator_id": "IND-05",
        "code": "IND-05-LAYERING",
        "metric_name": "Multi-Hop Layering Chain",
        "category": "Relational Graph Intelligence",
        "engine": "GRAPH AI (GNN)",
        "risk_score": 96,
        "decision": "BLOCK",
        "sender": "1122334455",
        "sender_name": "Layer-1 Mule Rekrutan",
        "sender_bank": "Bank Kuningan",
        "receiver": "4521880292",
        "receiver_name": "Layer-4 Crypto Liquidation",
        "receiver_bank": "BCA Escrow Indodax",
        "amount": 48000000,
        "channel": "BI-FAST",
        "purpose": "Penyelubungan Aliran Dana",
        "reason": "GraphSAGE mendeteksi rantai pencucian berantai 4-Hop tanpa jeda penyimpanan dana (Pass-Through Layering)."
    },
    {
        "indicator_id": "IND-06",
        "code": "IND-06-CYCLIC",
        "metric_name": "Cyclic Round-Tripping Loop",
        "category": "Relational Graph Intelligence",
        "engine": "GRAPH AI (GNN)",
        "risk_score": 95,
        "decision": "BLOCK",
        "sender": "5566778899",
        "sender_name": "Sindikat Node Alpha",
        "sender_bank": "Bank Kuningan",
        "receiver": "6677889900",
        "receiver_name": "Sindikat Node Beta",
        "receiver_bank": "Bank Mandiri",
        "amount": 60000000,
        "channel": "BI-FAST",
        "purpose": "Wash Trading / Round Trip",
        "reason": "Topologi Graph AI mendeteksi sirkular tertutup A -> B -> C -> D -> A untuk memanipulasi riwayat mutasi rekening."
    },
    {
        "indicator_id": "IND-07",
        "code": "IND-07-PAGERANK",
        "metric_name": "High PageRank Mule Hub",
        "category": "Relational Graph Intelligence",
        "engine": "GRAPH AI (GNN)",
        "risk_score": 93,
        "decision": "BLOCK",
        "sender": "9901238472",
        "sender_name": "Sentral Hub Rekening Penampung",
        "sender_bank": "Bank BNI",
        "receiver": "9012666666",
        "receiver_name": "Bursa Kripto Aggregator",
        "receiver_bank": "BCA Escrow",
        "amount": 180000000,
        "channel": "RTGS / BI-FAST",
        "purpose": "Konsolidasi Dana Mule",
        "reason": "Skor PageRank 0.0482 (Top 1% perbankan) menunjukkan akun berperan sebagai hub kolektor utama 28 mule lain."
    },
    {
        "indicator_id": "IND-08",
        "code": "IND-08-BETWEENNESS",
        "metric_name": "High Betweenness Centrality",
        "category": "Relational Graph Intelligence",
        "engine": "GRAPH AI (GNN)",
        "risk_score": 92,
        "decision": "BLOCK",
        "sender": "7711223344",
        "sender_name": "Rekening Jembatan Lintas Jaringan",
        "sender_bank": "Bank Kuningan",
        "receiver": "8822334455",
        "receiver_name": "Sindikat Kripto Luar Jawa",
        "receiver_bank": "Bank Danamon",
        "amount": 95000000,
        "channel": "BI-FAST",
        "purpose": "Inter-Cluster Routing",
        "reason": "Betweenness centrality 0.742: akun bertindak sebagai gerbang tunggal (bottleneck) yang menghubungkan 2 klaster terpisah."
    },
    {
        "indicator_id": "IND-09",
        "code": "IND-09-COLDWALLET",
        "metric_name": "Cold Wallet & Blacklist Proximity",
        "category": "Relational Graph Intelligence",
        "engine": "GRAPH AI (GNN)",
        "risk_score": 98,
        "decision": "BLOCK",
        "sender": "0123456789",
        "sender_name": "Ahmad Faisal",
        "sender_bank": "Bank bjb",
        "receiver": "9012777777",
        "receiver_name": "Tornado Cash / Blacklisted Cold Vault",
        "receiver_bank": "Crypto Gateway (OFAC Blacklist)",
        "amount": 150000000,
        "channel": "API GATEWAY",
        "purpose": "Transfer Alamat Blacklist",
        "reason": "1-Hop koneksi langsung ke alamat deposit cold wallet yang terdaftar dalam daftar hitam PPATK / OFAC."
    },
    {
        "indicator_id": "IND-10",
        "code": "IND-10-COSINE",
        "metric_name": "Graph Vector Cosine Clustering",
        "category": "Relational Graph Intelligence",
        "engine": "GRAPH AI (GNN)",
        "risk_score": 89,
        "decision": "REVIEW",
        "sender": "2233445566",
        "sender_name": "Rudi Hartono (Calon Mule)",
        "sender_bank": "Bank Kuningan",
        "receiver": "3344556677",
        "receiver_name": "Merchant Penyamaran",
        "receiver_bank": "Bank Permata",
        "amount": 35000000,
        "channel": "BI-FAST",
        "purpose": "Transfer Karakteristik Klaster",
        "reason": "Cosine similarity 0.941 dengan embedding klaster sindikat judi online KNG-JUDI-04 pada ruang laten GraphSAGE 32-dimensi."
    },
    {
        "indicator_id": "IND-11",
        "code": "IND-11-STRUCTURING",
        "metric_name": "Structuring Below Threshold",
        "category": "Purpose & Nominal Signals",
        "engine": "KONVENSIONAL + RULE",
        "risk_score": 94,
        "decision": "BLOCK",
        "sender": "6677881122",
        "sender_name": "Siti Nurhaliza (Smurfer)",
        "sender_bank": "Bank Kuningan",
        "receiver": "9988776655",
        "receiver_name": "Rekening Agregator",
        "receiver_bank": "Bank BCA",
        "amount": 9900000,
        "channel": "BI-FAST",
        "purpose": "Pecahan Rp 9.9 Juta Berulang",
        "reason": "Pola Smurfing: 5x transfer beruntun Rp 9.900.000 tepat di bawah batas lapor CTR PPATK (Rp 10.000.000 / Rp 100.000.000)."
    },
    {
        "indicator_id": "IND-12",
        "code": "IND-12-PURPOSE",
        "metric_name": "Purpose Mismatch / Non-KYC Activity",
        "category": "Purpose & Nominal Signals",
        "engine": "KONVENSIONAL + RULE",
        "risk_score": 87,
        "decision": "REVIEW",
        "sender": "7788992233",
        "sender_name": "Joko Widodo (Buruh Harian Lepas)",
        "sender_bank": "Bank Kuningan",
        "receiver": "9012555555",
        "receiver_name": "PT Binance Global Indonesia",
        "receiver_bank": "Bank Permata Escrow",
        "amount": 175000000,
        "channel": "BI-FAST",
        "purpose": "Beli Aset Kripto Derivatif Luar Negeri",
        "reason": "Berita ISO 20022 'Beli Kripto' dan nominal Rp 175jt tidak sesuai dengan profil penghasilan KYC (Buruh Harian gaji Rp 2.5jt/bln)."
    },
    {
        "indicator_id": "IND-13",
        "code": "IND-13-PASSTHROUGH",
        "metric_name": "Rapid Pass-Through Zero Holding",
        "category": "Purpose & Nominal Signals",
        "engine": "KONVENSIONAL + RULE",
        "risk_score": 90,
        "decision": "BLOCK",
        "sender": "8899003344",
        "sender_name": "Agus Salim (Transit Account)",
        "sender_bank": "Bank bjb",
        "receiver": "9012444444",
        "receiver_name": "Tokocrypto Hot Liquidity Pool",
        "receiver_bank": "Bank BCA Escrow",
        "amount": 89000000,
        "channel": "BI-FAST",
        "purpose": "Langsung Diteruskan Tanpa Inap",
        "reason": "Dana masuk Rp 89.000.000 langsung dipindahbukukan keluar dalam 42 detik tanpa ada pengendapan dana."
    },
    {
        "indicator_id": "IND-14",
        "code": "IND-14-HAVERSINE",
        "metric_name": "Impossible Travel Geolocation",
        "category": "Technical & Telemetry Signals",
        "engine": "KONVENSIONAL + RULE",
        "risk_score": 93,
        "decision": "BLOCK",
        "sender": "9900114455",
        "sender_name": "Budi Santoso",
        "sender_bank": "Bank Kuningan",
        "receiver": "1100225566",
        "receiver_name": "Rekening Tujuan Asing",
        "receiver_bank": "Bank Mandiri",
        "amount": 65000000,
        "channel": "MOBILE BANKING",
        "purpose": "Transfer Geofencing Anomaly",
        "reason": "Impossible Travel: Transaksi pertama di Jakarta (-6.2088, 106.8456) jam 14:00, transaksi kedua di Tokyo (35.6762, 139.6503) jam 14:07. Kecepatan 4.980 km/jam."
    },
    {
        "indicator_id": "IND-15",
        "code": "IND-15-DEVICE",
        "metric_name": "VPN / Proxy / Rooted Device Telemetry",
        "category": "Technical & Telemetry Signals",
        "engine": "KONVENSIONAL + RULE",
        "risk_score": 92,
        "decision": "BLOCK",
        "sender": "0011226677",
        "sender_name": "Eko Prasetyo",
        "sender_bank": "Bank bjb",
        "receiver": "9012333333",
        "receiver_name": "Indodax Vault Escrow",
        "receiver_bank": "Bank BCA",
        "amount": 54000000,
        "channel": "MOBILE BANKING",
        "purpose": "Transfer via Rooted Emulator",
        "reason": "Telemetri Sentinel SDK mendeteksi OS Android Rooted + Frida hooking framework aktif + IP VPN Datacenter (AS13335 Cloudflare)."
    }
]

NORMAL_PURPOSES = [
    ("Gaji Karyawan Bulanan", "PAYROLL"),
    ("Pembayaran Tagihan Listrik PLN", "UTILITY"),
    ("Belanja Bulanan Supermarket", "MERCHANT_QRIS"),
    ("Transfer Uang Saku Kuliah Anak", "FAMILY_SUPPORT"),
    ("Pembelian Bahan Baku Warung UMKM", "SUPPLY_CHAIN"),
    ("Pembayaran BPJS Kesehatan", "GOVERNMENT_BILL"),
    ("Top Up Saldo E-Wallet ShopeePay", "TOPUP"),
    ("Cicilan Kredit Pemilikan Rumah (KPR)", "LOAN_REPAYMENT"),
    ("Honor Mengajar Guru Honorer", "HONORARIUM"),
    ("Pembelian Tiket Kereta Api KAI", "TRANSPORTATION")
]

NORMAL_NAMES = [
    "Drs. H. Maman Suherman", "Hj. Neneng Rohaeti, M.Pd", "Asep Saepudin, S.Kom",
    "Dewi Lestari", "Rian Hidayat", "Ratna Sari Dewi", "Bambang Pamungkas",
    "Sri Wahyuni", "Agus Setiawan", "Nurul Hidayati", "Dedi Kusnandar",
    "Yayan Supriatna", "Indah Permatasari", "Taufik Hidayat", "Endang Sutisna",
    "Siti Maryam", "Wahyu Ramadhan", "Fitri Handayani", "Cecep Suryana", "Lia Amalia"
]

NORMAL_BANKS = ["Bank Kuningan", "Bank bjb", "Bank BCA", "Bank Mandiri", "Bank BNI", "Bank BRI", "Bank CIMB Niaga"]

def generate_150_attack_dataset():
    """
    Menghasilkan tepat 150 transaksi realistis:
    - 15 Anomali Fraud (1 fraud per 1 indikator metrik FDS/AML)
    - 135 Transaksi Normal Perbankan
    Diurutkan secara acak dengan timestamp berurutan dalam 24 jam terakhir.
    """
    now = datetime.now()
    transactions = []

    # 1. Buat 15 Fraud Anomaly
    for idx, fraud_def in enumerate(FRAUD_METRICS_DEFINITIONS):
        tx_time = now - timedelta(minutes=random.randint(5, 720))
        tx = {
            "id": f"TXN-ATTACK-2026-{idx+1:03d}",
            "transaction_id": f"TXN-ATTACK-2026-{idx+1:03d}",
            "is_fraud": True,
            "anomaly": True,
            "decision": fraud_def["decision"],
            "risk_score": fraud_def["risk_score"],
            "risk_level": "CRITICAL" if fraud_def["risk_score"] >= 92 else "HIGH",
            "indicator_id": fraud_def["indicator_id"],
            "metric_code": fraud_def["code"],
            "metric_name": fraud_def["metric_name"],
            "category": fraud_def["category"],
            "engine": fraud_def["engine"],
            "sender_account": fraud_def["sender"],
            "senderAccount": fraud_def["sender"],
            "sender_name": fraud_def["sender_name"],
            "sender_bank": fraud_def["sender_bank"],
            "receiver_account": fraud_def["receiver"],
            "destinationAccount": fraud_def["receiver"],
            "receiver_name": fraud_def["receiver_name"],
            "receiver_bank": fraud_def["receiver_bank"],
            "amount": fraud_def["amount"],
            "channel": fraud_def["channel"],
            "purpose_code": fraud_def["purpose"],
            "description": fraud_def["reason"],
            "timestamp": tx_time.strftime("%Y-%m-%d %H:%M:%S"),
            "status": "blocked" if fraud_def["decision"] == "BLOCK" else "flagged",
            "xai_explanation": f"Sinyal {fraud_def['code']} teraktivasi dengan skor anomali {fraud_def['risk_score']}%. {fraud_def['reason']}"
        }
        transactions.append(tx)

    # 2. Buat 135 Transaksi Normal
    for idx in range(135):
        tx_time = now - timedelta(minutes=random.randint(1, 1440))
        sender_name = random.choice(NORMAL_NAMES)
        receiver_name = random.choice(NORMAL_NAMES)
        while receiver_name == sender_name:
            receiver_name = random.choice(NORMAL_NAMES)
        
        purpose, channel_type = random.choice(NORMAL_PURPOSES)
        amount = random.choice([
            150000, 250000, 500000, 750000, 1200000, 2500000, 3500000, 4800000, 5500000, 8500000, 12000000
        ])
        risk_score = random.randint(3, 24)

        tx = {
            "id": f"TXN-NORM-2026-{idx+1:03d}",
            "transaction_id": f"TXN-NORM-2026-{idx+1:03d}",
            "is_fraud": False,
            "anomaly": False,
            "decision": "ALLOW",
            "risk_score": risk_score,
            "risk_level": "LOW",
            "indicator_id": "NORMAL",
            "metric_code": "NORM-TXN",
            "metric_name": "Transaksi Normal Terverifikasi",
            "category": "Operasional Normal",
            "engine": "RULES (ALLOW)",
            "sender_account": f"320800{random.randint(100000, 999999)}",
            "senderAccount": f"320800{random.randint(100000, 999999)}",
            "sender_name": sender_name,
            "sender_bank": random.choice(NORMAL_BANKS),
            "receiver_account": f"110022{random.randint(100000, 999999)}",
            "destinationAccount": f"110022{random.randint(100000, 999999)}",
            "receiver_name": receiver_name,
            "receiver_bank": random.choice(NORMAL_BANKS),
            "amount": amount,
            "channel": random.choice(["BI-FAST", "QRIS", "MOBILE BANKING", "ATM"]),
            "purpose_code": purpose,
            "description": f"Transaksi {purpose} wajar sesuai profil historis.",
            "timestamp": tx_time.strftime("%Y-%m-%d %H:%M:%S"),
            "status": "approved",
            "xai_explanation": f"Tidak ada anomali terdeteksi (Skor Risiko: {risk_score}%). Transaksi diizinkan otomatis."
        }
        transactions.append(tx)

    # Urutkan berdasarkan timestamp terbaru
    transactions.sort(key=lambda x: x["timestamp"], reverse=True)

    return {
        "summary": {
            "total_transactions": len(transactions),
            "fraud_anomalies_count": 15,
            "normal_transactions_count": 135,
            "fraud_ratio_pct": 10.0,
            "covered_metrics_count": 15,
            "blocked_count": sum(1 for t in transactions if t["decision"] == "BLOCK"),
            "review_count": sum(1 for t in transactions if t["decision"] == "REVIEW"),
            "allow_count": sum(1 for t in transactions if t["decision"] == "ALLOW"),
            "gnn_ai_anomalies": 6,
            "conventional_rule_anomalies": 9
        },
        "metrics_mapping": FRAUD_METRICS_DEFINITIONS,
        "transactions": transactions
    }
