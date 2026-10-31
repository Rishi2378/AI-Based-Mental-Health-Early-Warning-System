@echo off
setlocal EnableDelayedExpansion
title MindGuard AI - Model Trainer and Full-Stack Launcher

:: Set root directory
set "ROOT_DIR=%~dp0"
cd /d "%ROOT_DIR%"

color 0B
echo ===============================================================================
echo        __  __ _           _  _____                     _      _    ___ 
echo       ^|  \/  (_)_ __   __^| ^|/ ____^|                   ^| ^|    / \  ^|_ _^|
echo       ^| ^|\/^| ^| ^| '_ \ / _` ^| ^|  __ _   _  __ _ _ __ __^| ^|   / _ \  ^| ^| 
echo       ^| ^|  ^| ^| ^| ^| ^| ^| (_^| ^| ^|__^| ^| ^|_^| ^|/ _` ^| '__/ _` ^|  / ___ \ ^| ^| 
echo       ^|_^|  ^|_^|_^|_^| ^|_^|\__,_^|\_____^|\__,_^|\__,_^|_^|  \__,_^| /_/   \_\___^|
echo.
echo           Multimodal Mental Health Early Warning and Wellness System
echo            Automated Model Training and Full-Stack Deployment Runner
echo ===============================================================================
echo.

:: -------------------------------------------------------------------------------
:: 1. PREREQUISITE AND ENVIRONMENT CHECKS
:: -------------------------------------------------------------------------------
echo [1/4] Checking Python environment...
set "PYTHON_CMD="

if exist "%ROOT_DIR%backend\venv\Scripts\python.exe" (
    set "PYTHON_CMD=%ROOT_DIR%backend\venv\Scripts\python.exe"
    echo   [OK] Found local virtual environment at backend\venv
) else (
    where python >nul 2>nul
    if %errorlevel% equ 0 (
        set "PYTHON_CMD=python"
        echo   [OK] Found system Python
    ) else (
        echo   [ERROR] Python is not installed or not in PATH!
        echo   Please install Python 3.10 or higher from https://www.python.org/
        pause
        exit /b 1
    )
)

echo   Using: %PYTHON_CMD%
"%PYTHON_CMD%" --version
echo.

echo [2/4] Checking Node.js and Frontend dependencies...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo   [ERROR] Node.js is not found in PATH!
    echo   Please install Node.js v18 or higher from https://nodejs.org/
    pause
    exit /b 1
)

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo   [ERROR] npm is not found in PATH!
    pause
    exit /b 1
)

if not exist "%ROOT_DIR%frontend\node_modules" (
    echo   [INSTALL] frontend\node_modules missing. Installing npm packages...
    cd /d "%ROOT_DIR%frontend"
    call npm install
    cd /d "%ROOT_DIR%"
) else (
    echo   [OK] Frontend node_modules present.
)
echo.

:: -------------------------------------------------------------------------------
:: 2. AUTOMATED MACHINE LEARNING MODEL TRAINING
:: -------------------------------------------------------------------------------
echo ===============================================================================
echo [3/4] AUTOMATIC MACHINE LEARNING MODEL TRAINING IN PROGRESS...
echo ===============================================================================
echo.

:: Ensure models and data directories exist
if not exist "%ROOT_DIR%backend\models" mkdir "%ROOT_DIR%backend\models"
if not exist "%ROOT_DIR%data\raw" mkdir "%ROOT_DIR%data\raw"

:: Step A: Verify/generate datasets
echo --^> Step A: Verifying and generating training datasets...
"%PYTHON_CMD%" "%ROOT_DIR%backend\ml\generate_datasets.py"
if %errorlevel% neq 0 (
    echo   [WARNING] Dataset check produced a warning. Continuing with existing data...
)

:: Step B: Train NLP Text Model
echo.
echo --^> Step B: Training NLP Text Ensemble Model TF-IDF plus Soft Voting...
"%PYTHON_CMD%" "%ROOT_DIR%backend\ml\train_text_model.py"
if %errorlevel% neq 0 (
    echo   [ERROR] Failed to train NLP Text Model.
    pause
    exit /b 1
)

:: Step C: Train Voice Acoustic Emotion Model
echo.
echo --^> Step C: Training Voice Acoustic Emotion Model 38 Features plus ExtraTrees and RF...
"%PYTHON_CMD%" "%ROOT_DIR%backend\ml\train_voice_model.py"
if %errorlevel% neq 0 (
    echo   [ERROR] Failed to train Voice Acoustic Model.
    pause
    exit /b 1
)

echo.
echo ===============================================================================
echo   [SUCCESS] Both NLP and Voice Models Trained and Saved Successfully!
echo   - Text Model Artifact : backend\models\text_nlp_model.joblib
echo   - Voice Model Artifact: backend\models\voice_emotion_model.joblib
echo ===============================================================================
echo.

:: -------------------------------------------------------------------------------
:: 3. LAUNCH BACKEND AND FRONTEND SERVERS
:: -------------------------------------------------------------------------------
echo [4/4] Launching MindGuard AI Full-Stack Application...
echo.

:: Kill any existing processes hanging on ports 5000 and 3000 if needed
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5000" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>nul
)

:: Start Backend in dedicated terminal
echo   Starting Backend API Server on http://127.0.0.1:5000...
start "MindGuard Backend (Port 5000)" cmd /k ""%ROOT_DIR%backend\start_backend.bat""

:: Wait 3 seconds for Backend to initialize
timeout /t 3 /nobreak >nul

:: Start Frontend in dedicated terminal
echo   Starting Frontend UI Server on http://localhost:3000...
start "MindGuard Frontend (Port 3000)" cmd /k ""%ROOT_DIR%frontend\start_frontend.bat""

:: Wait 3 seconds for Vite server to initialize
timeout /t 3 /nobreak >nul

:: Open browser automatically
echo   Opening MindGuard AI in your default web browser...
start http://localhost:3000

echo.
echo ===============================================================================
echo                 ALL SERVICES ARE NOW RUNNING SUCCESSFULLY!
echo ===============================================================================
echo.
echo   * Web Application UI   : http://localhost:3000
echo   * Backend REST API     : http://127.0.0.1:5000
echo   * API Health Check     : http://127.0.0.1:5000/api/health
echo.
echo   [NOTE] Two separate terminal windows have opened for the Backend and Frontend.
echo          To stop the application, simply close those terminal windows or
echo          press [4] in the menu below.
echo ===============================================================================
echo.

:menu
echo Choose an option:
echo   [1] Retrain Machine Learning Models
echo   [2] Re-open Web Application in Browser
echo   [3] Test API Health Status
echo   [4] Stop All Services and Exit
echo.
set /p "CHOICE=Enter choice 1-4: "

if "%CHOICE%"=="1" (
    echo.
    echo [*] Retraining NLP and Voice models...
    "%PYTHON_CMD%" "%ROOT_DIR%backend\ml\train_text_model.py"
    "%PYTHON_CMD%" "%ROOT_DIR%backend\ml\train_voice_model.py"
    echo [*] Models updated successfully!
    echo.
    goto menu
)

if "%CHOICE%"=="2" (
    start http://localhost:3000
    goto menu
)

if "%CHOICE%"=="3" (
    echo.
    echo [*] Checking http://127.0.0.1:5000/api/health ...
    curl -s http://127.0.0.1:5000/api/health
    echo.
    echo.
    goto menu
)

if "%CHOICE%"=="4" (
    echo.
    echo [*] Stopping services on ports 5000 and 3000...
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5000" ^| findstr "LISTENING"') do (
        taskkill /F /PID %%a >nul 2>nul
    )
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000" ^| findstr "LISTENING"') do (
        taskkill /F /PID %%a >nul 2>nul
    )
    echo [*] All MindGuard AI services stopped. Goodbye!
    timeout /t 2 /nobreak >nul
    exit /b 0
)

echo Invalid choice. Please enter 1, 2, 3, or 4.
goto menu
