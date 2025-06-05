@echo off
echo ========================================
echo DFashion Backend Setup
echo ========================================
echo.

echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js found!
node --version

echo.
echo Cleaning previous installation...
if exist node_modules (
    echo Removing old node_modules...
    rmdir /s /q node_modules
)
if exist package-lock.json (
    echo Removing old package-lock.json...
    del package-lock.json
)

echo.
echo Installing dependencies with corrected versions...
npm cache clean --force
npm install

if %errorlevel% neq 0 (
    echo.
    echo ❌ Installation failed. Trying alternative approach...
    echo.
    echo Installing packages individually...
    npm install express@^4.18.2
    npm install mongoose@^7.5.0
    npm install bcryptjs@^2.4.3
    npm install jsonwebtoken@^9.0.2
    npm install cors@^2.8.5
    npm install dotenv@^16.3.1
    npm install multer@^1.4.3
    npm install cloudinary@^1.40.0
    npm install express-validator@^6.15.0
    npm install socket.io@^4.7.2
    npm install helmet@^6.1.5
    npm install express-rate-limit@^6.10.0
    npm install compression@^1.7.4
    npm install --save-dev nodemon@^3.0.1
    npm install --save-dev jest@^29.6.4
    npm install --save-dev supertest@^6.3.3
)

echo.
echo ========================================
echo ✅ Backend Setup Complete!
echo ========================================
echo.
echo To start the backend server:
echo npm run dev
echo.
echo The server will run on: http://localhost:5000
echo.
pause
