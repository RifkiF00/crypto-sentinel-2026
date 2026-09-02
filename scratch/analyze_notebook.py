import json

with open(r'd:\Crypto-Sentinel 2026\crypto-sentinel-api\notebooks\01_explore_paysim.ipynb', encoding='utf-8') as f:
    nb = json.load(f)

cells = nb['cells']
kernel = nb['metadata'].get('kernelspec', {}).get('display_name', 'N/A')

print('=== NOTEBOOK METADATA ===')
print('Kernel:', kernel)
print('Total cells:', len(cells))
print()

for i, cell in enumerate(cells):
    ct = cell['cell_type']
    src = ''.join(cell['source'])
    outputs = cell.get('outputs', [])
    has_output = len(outputs) > 0
    
    print(f'--- Cell {i+1} [{ct}] (has_output={has_output}) ---')
    print(src[:800])
    
    # Print outputs
    for o in outputs:
        otype = o.get('output_type', '')
        if otype == 'stream':
            text = ''.join(o.get('text', []))
            print('  [STREAM OUT]:', text[:500])
        elif otype in ('execute_result', 'display_data'):
            data = o.get('data', {})
            if 'text/plain' in data:
                txt = ''.join(data['text/plain'])
                print('  [RESULT]:', txt[:500])
            if 'text/html' in data:
                html = ''.join(data['text/html'])
                print('  [HTML SNIPPET]:', html[:300])
        elif otype == 'error':
            print('  [ERROR]:', o.get('ename'), '-', o.get('evalue'))
    print()
