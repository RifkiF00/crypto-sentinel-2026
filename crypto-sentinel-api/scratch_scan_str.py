import sys
sys.path.insert(0, '.')

# 1. Cek file str_generator.py ada dan bisa diimport
try:
    from app.str_generator import generate_str_draft, generate_str_html
    print('[PASS] str_generator.py: import OK')
except Exception as e:
    print('[FAIL] str_generator.py import ERROR:', e)
    sys.exit(1)

# 2. Test generate_str_draft
draft = generate_str_draft(
    transaction_id='TX-SCAN-001',
    sender_account='10001234',
    destination_account='9012-BINANCE',
    amount=75000000,
    risk_score=95,
    reasons=[
        'VPN/Datacenter IP detected',
        'Sender balance drained to zero',
        'Destination matched threat intelligence: crypto_exchange'
    ],
    sender_name='Ahmad Faisal'
)

required_fields = ['report_id','created_at','regulatory_basis','reporting_institution',
                   'subject_info','transaction_details','suspicion_narrative','action_taken']
missing = [f for f in required_fields if f not in draft]
if missing:
    print('[FAIL] draft missing fields:', missing)
else:
    print('[PASS] generate_str_draft: semua', len(required_fields), 'field hadir')
    print('       report_id  :', draft['report_id'])
    print('       amount     :', draft['transaction_details']['amount_formatted'])
    print('       decision   :', draft['transaction_details']['decision'])

# 3. Test generate_str_html
html = generate_str_html(draft)
checks = {
    'DOCTYPE'   : '<!DOCTYPE html>' in html,
    'Kop Bank'  : 'PT BPR KUNINGAN' in html,
    'Nomor LTKM': draft['report_id'] in html,
    'UU TPPU'   : 'UU No. 8 Tahun 2010' in html,
    'DENI HERYANA': 'DENI HERYANA' in html,
    'Reasons list': 'VPN/Datacenter IP detected' in html,
    'Panjang HTML': len(html) > 3000,
}
all_ok = True
for k, v in checks.items():
    tag = 'PASS' if v else 'FAIL'
    if not v: all_ok = False
    print(f'  [{tag}] HTML check: {k}')
print('       Total HTML length:', len(html), 'chars')

# 4. Cek endpoint di main.py
main_src = open('app/main.py','r',encoding='utf-8').read()
endpoints = {
    'POST /str/generate'     : '@app.post("/str/generate"' in main_src,
    'GET /str/list'          : '@app.get("/str/list"' in main_src,
    'GET /str/{id}'          : '@app.get("/str/{report_or_tx_id}"' in main_src,
    'GET /str/html/{id}'     : '@app.get("/str/html/{report_or_tx_id}"' in main_src,
    'HTMLResponse imported'  : 'from fastapi.responses import HTMLResponse' in main_src,
    'str_generator imported' : 'from app.str_generator import' in main_src,
}
print()
print('Endpoint scan in main.py:')
for ep, found in endpoints.items():
    tag = 'PASS' if found else 'FAIL'
    if not found: all_ok = False
    print(f'  [{tag}] {ep}')

print()
print('='*55)
print('  OVERALL:', 'ALL CHECKS PASSED' if all_ok else 'SOME CHECKS FAILED')
print('='*55)
