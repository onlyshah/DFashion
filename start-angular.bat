@echo off
echo ========================================
echo DFashion Angular App Launcher
echo ========================================
echo.

echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERROR: Node.js is not installed!
    echo.
    echo Please install Node.js first:
    echo 1. Go to https://nodejs.org/
    echo 2. Download the LTS version
    echo 3. Install with default settings
    echo 4. Restart this script
    echo.
    echo After installing Node.js, you'll also need Angular CLI:
    echo npm install -g @angular/cli
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js found!
node --version

echo.
echo Checking Angular CLI...
ng version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Angular CLI not found. Installing...
    npm install -g @angular/cli
    if %errorlevel% neq 0 (
        echo ❌ Failed to install Angular CLI
        pause
        exit /b 1
    )
)

echo ✅ Angular CLI ready!

echo.
echo Navigating to frontend directory...
cd frontend

echo.
echo Installing dependencies...
if not exist node_modules (
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
)

echo.
echo ========================================
echo 🚀 Starting Angular Development Server
echo ========================================
echo.
echo The app will open at: http://localhost:4200
echo.
echo Features you'll see:
echo ✅ Instagram-like stories and feed
echo ✅ Product tagging on posts
echo ✅ Trending products sidebar
echo ✅ Real-time interactions
echo ✅ Responsive design
echo.
echo Press Ctrl+C to stop the server
echo.

ng serve --open

echo.
echo Server stopped.
pause
