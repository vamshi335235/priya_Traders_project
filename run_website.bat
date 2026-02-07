@echo off
echo Starting Priya Traders Full Ecosystem...
echo.

:: Kill any existing node processes
taskkill /F /IM node.exe /T >nul 2>&1

:: 1. Start Backend Server
echo [1/3] Starting Backend Server (Port 5000)...
cd server
start "Priya Traders - Backend" cmd /k "node server.js"

:: 2. Start Customer Website
echo [2/3] Starting Customer Website (Port 5173)...
cd ../client
start "Priya Traders - Customer Site" cmd /k "npm run dev"

:: 3. Start Admin Dashboard
echo [3/3] Starting Admin Dashboard (Port 5174)...
cd ../admin
start "Priya Traders - Admin" cmd /k "npm run dev"

echo.
echo All modules are starting up!
echo ------------------------------------------
echo 🍱 Customer Site : http://127.0.0.1:5173
echo 🛠️  Admin Panel    : http://127.0.0.1:5174
echo 🚀 Backend API   : http://127.0.0.1:5000
echo ------------------------------------------
echo.
echo If any window shows "npm not found", please ensure Node.js is installed.
pause
