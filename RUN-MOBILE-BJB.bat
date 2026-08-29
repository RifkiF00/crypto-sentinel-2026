@echo off
title Mobile Bank bjb DIGI
cd /d "d:\Crypto-Sentinel 2026\mobile-banking-bjb"
echo ============================================================
echo   JALANKAN MOBILE BANK BJB DIGI
echo ============================================================
echo 1. Buka di Chrome Browser (Port 8081)
echo 2. Buka di HP Android / Emulator
echo ============================================================
set /p choice="Pilih target (1/2, default 1): "
if "%choice%"=="2" (
    flutter run
) else (
    flutter run -d chrome --web-port 8081
)
