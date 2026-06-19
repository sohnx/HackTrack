@echo off
cd /d "%~dp0"
if not exist logs mkdir logs

:loop
call venv\Scripts\activate.bat
uvicorn app.main:app --host 127.0.0.1 --port 8000 >> logs\backend.log 2>&1
echo [%date% %time%] Backend stopped, restarting in 5s... >> logs\backend.log
timeout /t 5 /nobreak >nul
goto loop
