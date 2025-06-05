@echo off
echo ========================================
echo DFashion Backend - Quick Fix
echo ========================================
echo.

echo Step 1: Cleaning up...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json

echo.
echo Step 2: Using simplified package.json...
copy package-simple.json package.json

echo.
echo Step 3: Installing dependencies...
npm cache clean --force
npm install

if %errorlevel% neq 0 (
    echo.
    echo ❌ Still having issues. Let's try minimal installation...
    echo.
    npm init -y
    npm install express cors dotenv socket.io
    echo.
    echo ✅ Minimal backend ready!
    echo You can start with: node server.js
) else (
    echo.
    echo ✅ All dependencies installed successfully!
    echo You can start with: npm run dev
)

echo.
pause
