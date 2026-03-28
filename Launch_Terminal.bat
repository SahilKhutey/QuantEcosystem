@echo off
title Quantum Terminal — Launcher
color 0A
mode con: cols=65 lines=20

echo.
echo  ===============================================
echo   Q U A N T U M   T R A D I N G   T E R M I N A L
echo   Institutional Intelligence Platform v2.0
echo  ===============================================
echo.

REM ── Check Python ─────────────────────────────────
where python >nul 2>&1
if %ERRORLEVEL% neq 0 (
  echo  [ERROR] Python not found. Please install Python 3.9+.
  pause
  exit /b 1
)

REM ── Check Node.js ────────────────────────────────
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
  echo  [ERROR] Node.js not found. Please install Node.js 18+.
  pause
  exit /b 1
)

echo  [1/3] Starting Flask API Backend (Port 5000)...
start "Quantum API Backend" cmd /k "cd /d %~dp0trading-terminal && python main.py"

echo  [2/3] Starting React Frontend (Port 5173)...
timeout /t 2 /nobreak >nul
start "Quantum Frontend" cmd /k "cd /d %~dp0trading-terminal && npm run dev"

echo  [3/3] Waiting for services to initialize...
timeout /t 6 /nobreak >nul

echo.
echo  Opening Quantum Terminal in your browser...
start http://localhost:5173

echo.
echo  ===============================================
echo   SYSTEM ONLINE — All services running
echo   Backend:  http://localhost:5000
echo   Frontend: http://localhost:5173
echo   Health:   http://localhost:5000/health
echo  ===============================================
echo.
echo  Keep both terminal windows open.
echo  Press any key here to exit this launcher.
echo.
pause >nul
