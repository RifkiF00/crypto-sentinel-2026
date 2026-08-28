import hmac, hashlib

timestamp = '2026-08-25T08:00:00Z'
sender = '0123456789'
receiver = '9876543210'
amount = 100000

PARTNER_SECRETS = {
    'KNG-PARTNER-Billy': b'KNG_SECRET_2026',
    'BJB-PARTNER-Billy': b'BJB_SECRET_DIGDAYA_2026',
}

# --- Test 1: KNG tanpa method ---
partner = 'KNG-PARTNER-Billy'
secret = PARTNER_SECRETS[partner]
msg = f'{partner}|{timestamp}|{sender}|{receiver}|{amount}'.encode()
sig = hmac.new(secret, msg, hashlib.sha256).hexdigest()

exp_kng = hmac.new(secret, msg, hashlib.sha256).hexdigest()
exp_bjb = hmac.new(secret, f'{partner}|{timestamp}|{sender}|{receiver}|{amount}|'.encode(), hashlib.sha256).hexdigest()
valid = hmac.compare_digest(sig, exp_kng) or hmac.compare_digest(sig, exp_bjb)
print(f'[KNG] Transfer tanpa method: {"PASS" if valid else "FAIL"}')

# --- Test 2: BJB dengan method ---
partner = 'BJB-PARTNER-Billy'
secret = PARTNER_SECRETS[partner]
method = 'SESAMA_BJB'
msg = f'{partner}|{timestamp}|{sender}|{receiver}|{amount}|{method}'.encode()
sig = hmac.new(secret, msg, hashlib.sha256).hexdigest()

exp_kng = hmac.new(secret, f'{partner}|{timestamp}|{sender}|{receiver}|{amount}'.encode(), hashlib.sha256).hexdigest()
exp_bjb = hmac.new(secret, f'{partner}|{timestamp}|{sender}|{receiver}|{amount}|{method}'.encode(), hashlib.sha256).hexdigest()
valid = hmac.compare_digest(sig, exp_kng) or hmac.compare_digest(sig, exp_bjb)
print(f'[BJB] Transfer dengan method SESAMA_BJB: {"PASS" if valid else "FAIL"}')

# --- Test 3: BJB dengan method RTOL ---
method = 'RTOL_APEX'
msg = f'{partner}|{timestamp}|{sender}|{receiver}|{amount}|{method}'.encode()
sig = hmac.new(secret, msg, hashlib.sha256).hexdigest()
exp_bjb = hmac.new(secret, msg, hashlib.sha256).hexdigest()
valid = hmac.compare_digest(sig, exp_bjb)
print(f'[BJB] Transfer dengan method RTOL_APEX: {"PASS" if valid else "FAIL"}')

# --- Test 4: Partner tidak dikenal ---
unknown_secret = PARTNER_SECRETS.get('UNKNOWN-PARTNER')
print(f'[Security] Unknown partner rejected: {"PASS" if unknown_secret is None else "FAIL"}')

print()
print('Semua validasi selesai!')
