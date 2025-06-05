@echo off
echo ========================================
echo DFashion Backend Requirements Check
echo ========================================
echo.

echo Checking Node.js...
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Node.js found:
    node --version
    echo.
    echo You can run the Node.js backend with:
    echo node simple-server.js
    echo.
) else (
    echo ❌ Node.js not found
)

echo Checking Python...
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Python found:
    python --version
    echo.
    echo You can run the Python backend with:
    echo python python-server.py
    echo.
) else (
    echo ❌ Python not found
)

echo Checking Python3...
python3 --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Python3 found:
    python3 --version
    echo.
    echo You can run the Python backend with:
    echo python3 python-server.py
    echo.
) else (
    echo ❌ Python3 not found
)

echo.
echo ========================================
echo Installation Options:
echo ========================================
echo.
echo Option 1: Install Node.js (Recommended)
echo 1. Go to https://nodejs.org/
echo 2. Download LTS version
echo 3. Install with default settings
echo 4. Run: node simple-server.js
echo.
echo Option 2: Install Python
echo 1. Go to https://python.org/
echo 2. Download latest version
echo 3. Install with "Add to PATH" checked
echo 4. Run: python python-server.py
echo.
echo Option 3: Continue with Angular only
echo The Angular app works with mock data
echo No backend required for basic demo
echo.
echo ========================================
echo Current Status:
echo ========================================
echo ✅ Angular Frontend: Running on http://localhost:4200
echo ❌ Backend API: Not running (install Node.js or Python)
echo ✅ HTML Demo: Available in demo-app/demo.html
echo.
pause
