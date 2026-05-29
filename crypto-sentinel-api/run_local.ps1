<#
run_local.ps1
Menjalankan server lokal FastAPI:
- Aktifkan venv jika ada
- Install requirements jika perlu
- Jalankan uvicorn pada port 8000
#>

$venvActivate = Join-Path -Path $PSScriptRoot -ChildPath "venv\Scripts\Activate.ps1"

if (Test-Path $venvActivate) {
    Write-Host "Mengaktifkan virtual environment..."
    & $venvActivate
} else {
    Write-Host "Virtual environment tidak ditemukan di 'venv/'. Buat dulu dengan: python -m venv venv" -ForegroundColor Yellow
    exit 1
}

Write-Host "Memastikan dependency terpasang (requirements.txt)..."
pip install -r requirements.txt

Write-Host "Menjalankan Uvicorn pada http://0.0.0.0:8000/ (CTRL+C untuk berhenti)" -ForegroundColor Green
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
