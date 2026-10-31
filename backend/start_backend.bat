@echo off
title MindGuard Backend (Port 5000)
color 0A
cd /d "%~dp0"
echo ===================================================
echo   MindGuard AI - Backend REST API Server (Port 5000)
echo ===================================================
echo.
if exist "venv\Scripts\python.exe" (
    echo Using virtualenv Python: venv\Scripts\python.exe
    "venv\Scripts\python.exe" app.py
) else (
    echo Using system Python
    python app.py
)
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Backend crashed or exited with error code %errorlevel%.
    pause
)
