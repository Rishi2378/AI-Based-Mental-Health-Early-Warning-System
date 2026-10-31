@echo off
title MindGuard Frontend (Port 3000)
color 0E
cd /d "%~dp0"
echo ===================================================
echo   MindGuard AI - Frontend Web Application (Port 3000)
echo ===================================================
echo.
call npm run dev
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Frontend server crashed or exited with error code %errorlevel%.
    pause
)
