@echo off
title Antigravity Quant Terminal Launcher
color 0A

echo ==================================================
echo      ANTIGRAVITY QUANT TRADING TERMINAL
echo ==================================================
echo.
echo [1/3] Booting Python AI Orchestrator (Port 5000)...
start "Quant Backend API" cmd /c "cd /d %~dp0\trading-terminal && venv\Scripts\activate.bat && python main.py"

echo [2/3] Spinning up React Dashboard UI (Port 5173)...
start "Quant Frontend UI" cmd /c "cd /d %~dp0\trading-terminal && npm run dev"

echo.
echo [3/3] Standby - Allowing Servers to sequence Handshakes...
timeout /t 5 /nobreak > NUL

echo Opening Production Terminal in your Default Browser...
start http://localhost:5173

echo.
echo SYSTEM ONLINE.
echo Keep the two black command terminal windows open in the background to maintain live data streams.
pause
