@echo off
title Crypto-Sentinel 2026 - Start All Services
echo.
echo ============================================================
echo   CRYPTO-SENTINEL 2026 - STARTING ALL 5 SERVICES (CLOUD DB)
echo ============================================================
echo.

echo [1/5] Starting Expresso Core Banking API (port 8080)...
start "Expresso API :8080" cmd /k "cd /d d:\Crypto-Sentinel 2026\expresso-api && uvicorn main:app --reload --port 8080 --host 0.0.0.0"

ping 127.0.0.1 -n 3 >nul

echo [2/5] Starting Crypto-Sentinel AI Engine (port 8000)...
start "Sentinel AI :8000" cmd /k "cd /d d:\Crypto-Sentinel 2026\crypto-sentinel-api && uvicorn app.main:app --reload --port 8000 --host 0.0.0.0"

ping 127.0.0.1 -n 4 >nul

echo [3/5] Starting Dashboard Forensik (port 5173)...
start "Dashboard :5173" cmd /k "cd /d d:\Crypto-Sentinel 2026\dashboard-crypto-sentinel && npm run dev"

ping 127.0.0.1 -n 3 >nul

echo [4/5] Starting Flutter 1: Bank bjb DIGI (Port 8081)...
start "Flutter bjb DIGI" cmd /k "cd /d d:\Crypto-Sentinel 2026\mobile-banking-bjb && flutter run -d chrome --web-port 8081"

ping 127.0.0.1 -n 3 >nul

echo [5/5] Starting Flutter 2: Bank Kuningan (Port 8082)...
start "Flutter Bank Kuningan" cmd /k "cd /d d:\Crypto-Sentinel 2026\crypto-sentinel-bank-kng && flutter run -d chrome --web-port 8082"

echo.
echo ============================================================
echo   ALL 5 SERVICES STARTED!
echo   Cloud DB      : Neon PostgreSQL (Singapore)
echo   Expresso API  : http://192.168.100.8:8080 / http://localhost:8080
echo   Sentinel AI   : http://192.168.100.8:8000 / http://localhost:8000
echo   Dashboard     : http://localhost:5173
echo   Bank bjb      : http://localhost:8081 (atau jalankan di HP)
echo   Bank Kuningan : http://localhost:8082 (atau jalankan di HP)
echo ============================================================
echo.
echo Tips: Untuk jalankan salah satu di HP, buka RUN-MOBILE-BJB.bat atau RUN-MOBILE-KUNINGAN.bat
echo.
pause
