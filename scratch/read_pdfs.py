import sys
sys.stdout.reconfigure(encoding='utf-8')
from pypdf import PdfReader

files = [
    'Onboarding PIDI Capstone Project.pdf',
    'GUIDELINE CAPSTONE PROJECT.pdf',
]

for fname in files:
    print(f'\n{"="*60}')
    print(f'FILE: {fname}')
    print('='*60)
    try:
        reader = PdfReader(fname)
        print(f'Total halaman: {len(reader.pages)}\n')
        for i, page in enumerate(reader.pages):
            text = page.extract_text()
            if text and text.strip():
                print(f'--- Hal {i+1} ---')
                print(text.strip())
                print()
    except Exception as e:
        print(f'ERROR: {e}')
