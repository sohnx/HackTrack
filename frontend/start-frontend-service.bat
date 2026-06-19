@echo off
cd /d "%~dp0"
if not exist logs mkdir logs

:loop
npm run start >> logs\frontend.log 2>&1
echo [%date% %time%] Frontend stopped, restarting in 5s... >> logs\frontend.log
timeout /t 5 /nobreak >nul
goto loop
