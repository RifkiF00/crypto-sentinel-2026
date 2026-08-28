import requests, hmac, hashlib, json

BASE = 'http://localhost:8080/api/v1'

def test_transfer(label, partner_id, secret, sender, receiver, amount, method):
    timestamp = '2026-08-25T08:56:00Z'

    # KNG formula (tanpa method)
    msg_kng = f'{partner_id}|{timestamp}|{sender}|{receiver}|{amount}'.encode()
    # BJB formula (dengan method)
    msg_bjb = f'{partner_id}|{timestamp}|{sender}|{receiver}|{amount}|{method}'.encode()

    # Pakai formula sesuai partner
    msg = msg_bjb if 'BJB' in partner_id else msg_kng
    sig = hmac.new(secret.encode(), msg, hashlib.sha256).hexdigest()

    try:
        r = requests.post(f'{BASE}/bri/transfer', headers={
            'X-Partner-Id': partner_id,
            'X-Timestamp': timestamp,
            'X-Signature': sig,
        }, data={
            'sender_account': sender,
            'receiver_account': receiver,
            'amount': str(amount),
            'method': method,
            'latitude': '-6.9744',
            'longitude': '108.4832',
        }, timeout=12)

        d = r.json()
        decision = d.get('sentinel_decision', d.get('detail', '?'))
        score = d.get('sentinel_score', '-')
        tx_id = d.get('transaction_id', '-')
        status = 'OK' if r.status_code in [200, 201] else 'GAGAL'
        print(f"[{label}] {status} | HTTP {r.status_code} | Decision: {decision} | Score: {score} | TxID: {tx_id}")
    except Exception as e:
        print(f"[{label}] ERROR: {e}")

# Test 1: Bank Kuningan - transfer normal RTOL
test_transfer("KNG RTOL", "KNG-PARTNER-Billy", "KNG_SECRET_2026",
              "1234567890", "9876543210", 100000, "RTOL")

# Test 2: Bank Kuningan - transfer SKNBI
test_transfer("KNG SKNBI", "KNG-PARTNER-Billy", "KNG_SECRET_2026",
              "1234567890", "9876543210", 200000, "SKNBI")

# Test 3: Bank BJB - transfer Sesama BJB
test_transfer("BJB SESAMA", "BJB-PARTNER-Billy", "BJB_SECRET_DIGDAYA_2026",
              "0123456789", "9876543210", 150000, "SESAMA_BJB")

# Test 4: Bank Kuningan - kirim ke VASP kripto (harusnya BLOCK)
test_transfer("KNG -> KRIPTO [BLOCK?]", "KNG-PARTNER-Billy", "KNG_SECRET_2026",
              "1234567890", "9012666666", 5000000, "RTOL")
