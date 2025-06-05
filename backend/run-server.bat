@echo off
echo ========================================
echo DFashion Backend Server
echo ========================================
echo.

echo Testing Node.js...
node --version
if %errorlevel% neq 0 (
    echo ❌ Node.js not working properly
    echo Please restart your command prompt after Node.js installation
    pause
    exit /b 1
)

echo ✅ Node.js is working!
echo.

echo Starting DFashion Backend Server...
echo.
echo 🚀 Server will start on: http://localhost:5000
echo 🛡️ Admin Login: http://localhost:5000/admin-login.html
echo.
echo Demo Admin Accounts:
echo • Super Admin: superadmin@dfashion.com / admin123
echo • Sales Manager: sales.manager@dfashion.com / sales123
echo • Marketing Manager: marketing.manager@dfashion.com / marketing123
echo • Account Manager: accounts.manager@dfashion.com / accounts123
echo • Support Manager: support.manager@dfashion.com / support123
echo.
echo ========================================
echo.

if exist minimal-server.js (
    echo Starting minimal server (no dependencies required)...
    node minimal-server.js
) else if exist simple-server.js (
    echo Starting simple server...
    node simple-server.js
) else (
    echo Starting main server...
    node server.js
)

echo.
echo Server stopped.
pause
