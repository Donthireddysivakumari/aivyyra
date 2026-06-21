@echo off
title Aivyra-Tutor Launcher
echo =========================================================
echo               STARTING AIVYRA-TUTOR APPLICATION
echo =========================================================
echo.

:: Get the directory where this script is located
set "PROJECT_DIR=%~dp0"

:: Start the backend server in a separate window
echo [1/3] Starting backend server (FastAPI)...
start "Aivyra Backend (FastAPI)" cmd /c "cd /d "%PROJECT_DIR%aivyra-backend" && echo Starting FastAPI Backend... && python run.py"

:: Start the frontend server in a separate window
echo [2/3] Starting frontend server (Next.js)...
start "Aivyra Frontend (Next.js)" cmd /c "cd /d "%PROJECT_DIR%aivyra-frontend" && echo Starting Next.js Frontend... && npm.cmd run dev"

:: Wait for a few seconds to let servers start
echo [3/3] Waiting for servers to initialize...
timeout /t 5 /nobreak > NUL

:: Open the website in the default browser
echo.
echo Launching http://localhost:3000 in your browser...
start http://localhost:3000

echo.
echo =========================================================
echo Launch complete! Keep the backend and frontend terminal
echo windows open while using the application.
echo =========================================================
echo.
timeout /t 3 > NUL
exit
