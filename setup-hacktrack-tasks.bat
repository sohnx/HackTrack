@echo off
:: Run this as Administrator (right-click -> Run as administrator)
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0setup-hacktrack-tasks.ps1"
pause
