@echo off
title HackTrack Launcher
cd /d "%~dp0"

echo ============================
echo    Starting HackTrack
echo ============================
echo.

if not exist "backend\venv\Scripts\activate.bat" (
    echo [ERROR] Could not find backend\venv\Scripts\activate.bat
    echo Make sure this .bat file sits in your HackTrack root folder,
    echo right next to the "backend" and "frontend" folders.
    pause
    exit /b 1
)

echo Starting backend (FastAPI)...
start "HackTrack Backend" cmd /k "cd backend && call venv\Scripts\activate.bat && uvicorn app.main:app --reload"

timeout /t 3 /nobreak >nul

echo Starting frontend (Next.js)...
start "HackTrack Frontend" cmd /k "cd frontend && npm run dev"

timeout /t 5 /nobreak >nul

echo Opening browser...
start http://localhost:3000

echo.
echo Both servers are running in their own windows.
echo Close those windows to stop HackTrack.
timeout /t 4 /nobreak >nul
exit