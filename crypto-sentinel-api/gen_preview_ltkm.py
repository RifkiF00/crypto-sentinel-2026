import sys
sys.path.insert(0, '.')
from app.str_generator import generate_str_draft, generate_str_html

draft = generate_str_draft(
    transaction_id='TX-DEMO-BKG-001',
    sender_account='1000192837',
    destination_account='9012-BINANCE-EXCHANGE',
    amount=85000000.0,
    risk_score=95,
    reasons=[
        'Odd-Hour Activity Alert: Transaction at 02:00 WIB (00:00-04:00 nocturnal window)',
        'Sender balance drained to zero after transaction',
        'Technical Anomaly: Origin IP (45.154.22.10) matches known VPN/Datacenter proxy range',
        'Destination matched threat intelligence: crypto_exchange (HIGH)',
        'Dynamic Baseline Alert: Amount (Rp 85,000,000) is > 5x customer past average (Rp 14,200,000)',
    ],
    sender_name='Ahmad Faisal Nugraha',
    destination_name='Binance International Exchange',
    bank_name='PT BPR KUNINGAN (PERSERODA)',
    compliance_officer='Unit APU-PPT Bank Kuningan'
)

html = generate_str_html(draft)
out_path = 'preview_ltkm.html'
with open(out_path, 'w', encoding='utf-8') as f:
    f.write(html)

print('Report ID  :', draft['report_id'])
print('HTML saved :', out_path)
print('HTML length:', len(html), 'chars')
