import json, sys
sys.stdout.reconfigure(encoding='utf-8')

nb = json.load(open('crypto-sentinel-api/notebooks/01_explore_paysim.ipynb', encoding='utf-8'))

print("=== CEK SEMUA CELL: Ada sample/head/nrows? ===")
for i, c in enumerate(nb['cells']):
    src = ''.join(c['source'])
    suspects = ['sample(', 'head(', 'nrows', '.iloc[', '[:10', '[:100', '10000', '10_000']
    found = [s for s in suspects if s in src]
    if found:
        print(f"\n⚠️  Cell {i} ({c['cell_type']}) — ditemukan: {found}")
        print(src[:400])

print("\n=== CEK OUTPUT CELL YANG ADA ANGKA ROWS ===")
for i, c in enumerate(nb['cells']):
    for o in c.get('outputs', []):
        txt = ''.join(o.get('text', o.get('data', {}).get('text/plain', [''])))
        if any(x in txt for x in ['rows', 'shape', 'loaded', 'Shape', '10,000', '50,000', 'transaction']):
            print(f"\nCell {i} output: {txt[:300]}")
