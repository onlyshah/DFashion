@echo off
echo ========================================
echo DFashion Backend Server Launcher
echo ========================================
echo.

echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed!
    echo.
    echo To run the DFashion Admin Dashboard Backend:
    echo.
    echo 1. Install Node.js:
    echo    - Go to https://nodejs.org/
    echo    - Download the LTS version
    echo    - Install with default settings
    echo    - Restart this script
    echo.
    echo 2. Alternative - Use the HTML Demo:
    echo    - Open demo-app/demo.html in your browser
    echo    - Full frontend functionality without backend
    echo.
    echo 3. Alternative - Use Angular Frontend:
    echo    - The Angular app works with mock data
    echo    - Access: http://localhost:4200
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js found!
node --version

echo.
echo Starting DFashion Backend Server...
echo.
echo 🚀 Features Available:
echo ✅ Admin Dashboard with Role-Based Access
echo ✅ 10 Different Admin Roles (Super Admin, Sales, Marketing, etc.)
echo ✅ Department-Specific Dashboards
echo ✅ Secure Authentication with JWT
echo ✅ Real-time API for Angular Frontend
echo.
echo 🔐 Demo Admin Accounts:
echo • Super Admin: superadmin@dfashion.com / admin123
echo • Sales Manager: sales.manager@dfashion.com / sales123
echo • Marketing Manager: marketing.manager@dfashion.com / marketing123
echo • Account Manager: accounts.manager@dfashion.com / accounts123
echo • Support Manager: support.manager@dfashion.com / support123
echo.
echo ========================================

if exist simple-server.js (
    echo 📡 Starting Simple Server (No Dependencies)...
    node simple-server.js
) else if exist server.js (
    echo 📡 Starting Full Server...
    if exist node_modules (
        node server.js
    ) else (
        echo Installing dependencies...
        npm install
        if %errorlevel% equ 0 (
            node server.js
        ) else (
            echo ❌ Failed to install dependencies
            echo Using simple server instead...
            node simple-server.js
        )
    )
) else (
    echo ❌ No server file found!
    echo Please make sure you're in the backend directory.
    pause
    exit /b 1
)

echo.
echo ========================================
echo 🛑 Server stopped
echo ========================================
pause
