@echo off
title Crypto-Sentinel 2026 - Start All Services
echo.
echo ============================================================
echo   CRYPTO-SENTINEL 2026 - STARTING ALL 5 SERVICES (CLOUD DB)
echo ============================================================
echo.

echo [1/5] Starting Expresso Core Banking API (port 8080)...
start "Expresso API :8080" cmd /k "cd /d d:\Crypto-Sentinel 2026\expresso-api && uvicorn main:app --reload --port 8080 --host 0.0.0.0"

timeout /t 2 /nobreak >nul

echo [2/5] Starting Crypto-Sentinel AI Engine (port 8000)...
start "Sentinel AI :8000" cmd /k "cd /d d:\Crypto-Sentinel 2026\crypto-sentinel-api && uvicorn app.main:app --reload --port 8000 --host 0.0.0.0"

timeout /t 3 /nobreak >nul

echo [3/5] Starting Dashboard Forensik (port 5173)...
start "Dashboard :5173" cmd /k "cd /d d:\Crypto-Sentinel 2026\dashboard-crypto-sentinel && npm run dev"

timeout /t 2 /nobreak >nul

echo [4/5] Starting Flutter 1: Bank bjb DIGI...
start "Flutter bjb DIGI" cmd /k "cd /d d:\Crypto-Sentinel 2026\mobile-banking-bjb && flutter run"

timeout /t 2 /nobreak >nul

echo [5/5] Starting Flutter 2: Bank Kuningan...
start "Flutter Bank Kuningan" cmd /k "cd /d d:\Crypto-Sentinel 2026\crypto-sentinel-bank-kng && flutter run"

echo.
echo ============================================================
echo   ALL 5 SERVICES STARTED!
echo   Cloud DB      : Neon PostgreSQL (Singapore)
echo   Expresso API  : http://192.168.100.8:8080
echo   Sentinel AI   : http://192.168.100.8:8000
echo   Dashboard     : http://localhost:5173
echo   Mobile 1      : Bank bjb DIGI (Flutter)
echo   Mobile 2      : Bank Kuningan (Flutter)
echo ============================================================
echo.
pause
