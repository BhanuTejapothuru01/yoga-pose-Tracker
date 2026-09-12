@echo off
setlocal enabledelayedexpansion

echo ==========================================
echo  Starting YogaTracker Local Dev Environment
echo ==========================================

rem Repository and app paths
set "REPO_DIR=%~dp0"
set "APP_DIR=%REPO_DIR%yoga-tracker"

rem 1. Check Node.js availability
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed or not in PATH.
    echo Please install Node.js (18+) to run YogaTracker.
    pause
    exit /b 1
)

rem 2. Check Environment Variables / .env files
set "ENV_FILE=%APP_DIR%\.env.local"
set "ENV_EXAMPLE=%APP_DIR%\.env.local.example"

if not exist "%ENV_FILE%" (
    if exist "%ENV_EXAMPLE%" (
        echo Creating .env.local from .env.local.example...
        copy "%ENV_EXAMPLE%" "%ENV_FILE%" >nul
        echo Created .env.local. Remember to fill in your Supabase credentials if needed.
    ) else (
        echo Warning: No .env.local or .env.local.example found in %APP_DIR%.
    )
)

rem 3. Install app dependencies if node_modules is missing
if not exist "%APP_DIR%\node_modules" (
    echo node_modules not found. Installing app dependencies...
    call npm run install:app --prefix "%REPO_DIR%"
    if %errorlevel% neq 0 (
        echo Error: Failed to install npm dependencies.
        pause
        exit /b 1
    )
)

rem 4. Check for optional Python backend / .venv if present
if exist "%REPO_DIR%requirements.txt" (
    echo Python backend configuration detected.
    if not exist "%REPO_DIR%.venv" (
        echo Creating Python virtual environment in .venv...
        python -m venv "%REPO_DIR%.venv" 2>nul
        if errorlevel 1 (
            py -m venv "%REPO_DIR%.venv" 2>nul
        )
    )
    if exist "%REPO_DIR%.venv\Scripts\activate.bat" (
        call "%REPO_DIR%.venv\Scripts\activate.bat"
    )
)

rem 5. Display Connection URLs
echo ==========================================
echo  YogaTracker Dev Server Launching
echo ==========================================
echo  Backend  -^> http://localhost:3000/api
echo  Frontend -^> http://localhost:3000
echo ==========================================
echo Close the command window or press Ctrl+C to stop.
echo.

rem 6. Launch Next.js Dev Server
call npm run dev --prefix "%REPO_DIR%"

pause
