@echo off
echo =========================================
echo Starting Intelligence Search Bot Project...
echo =========================================

echo.
echo [1/2] Setting up and starting Backend Server...
cd /d "%~dp0backend"
call pip install fastapi uvicorn pypdf python-multipart >nul 2>&1
start "Backend Server" cmd /c "title Backend Server && python main.py"

echo.
echo [2/2] Setting up and starting Frontend Server...
cd /d "%~dp0frontend"
call npm install >nul 2>&1
start "Frontend Server" cmd /k "title Frontend Server && npm run dev"

echo.
echo =========================================
echo Both servers are starting in new windows!
echo Once the frontend server is ready, check the URL (usually http://localhost:5173/)
echo =========================================
pause
