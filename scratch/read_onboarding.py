import sys
sys.stdout.reconfigure(encoding='utf-8')

fname = 'Onboarding PIDI Capstone Project.pdf'

# Try pdfplumber first
try:
    import pdfplumber
    print(f'=== {fname} (pdfplumber) ===')
    with pdfplumber.open(fname) as pdf:
        print(f'Total halaman: {len(pdf.pages)}')
        for i, page in enumerate(pdf.pages):
            text = page.extract_text()
            if text and text.strip():
                print(f'\n--- Hal {i+1} ---')
                print(text.strip())
            else:
                print(f'\n--- Hal {i+1}: [gambar/tidak ada teks] ---')
except Exception as e:
    print(f'pdfplumber error: {e}')
    # Fallback ke pypdf
    try:
        from pypdf import PdfReader
        reader = PdfReader(fname)
        print(f'\n=== Fallback pypdf: {len(reader.pages)} halaman ===')
        for i, page in enumerate(reader.pages):
            text = page.extract_text()
            if text and text.strip():
                print(f'\n--- Hal {i+1} ---')
                print(text[:500])
    except Exception as e2:
        print(f'pypdf error: {e2}')
