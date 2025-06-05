# DFashion Backend Server Starter
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DFashion Backend Server" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test Node.js
Write-Host "Testing Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
    } else {
        throw "Node.js not found"
    }
} catch {
    Write-Host "❌ Node.js is not properly installed or not in PATH" -ForegroundColor Red
    Write-Host ""
    Write-Host "Solutions:" -ForegroundColor Yellow
    Write-Host "1. Download Node.js from https://nodejs.org/" -ForegroundColor White
    Write-Host "2. Install with default settings" -ForegroundColor White
    Write-Host "3. Restart PowerShell/Command Prompt" -ForegroundColor White
    Write-Host "4. Try running this script again" -ForegroundColor White
    Write-Host ""
    Write-Host "Alternative: Use the Angular app (already working)" -ForegroundColor Cyan
    Write-Host "URL: http://localhost:4200" -ForegroundColor Cyan
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "Starting DFashion Backend Server..." -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Server will start on: http://localhost:5000" -ForegroundColor Cyan
Write-Host "🛡️ Admin Login: http://localhost:5000/admin-login.html" -ForegroundColor Cyan
Write-Host ""
Write-Host "Demo Admin Accounts:" -ForegroundColor Yellow
Write-Host "• Super Admin: superadmin@dfashion.com / admin123" -ForegroundColor White
Write-Host "• Sales Manager: sales.manager@dfashion.com / sales123" -ForegroundColor White
Write-Host "• Marketing Manager: marketing.manager@dfashion.com / marketing123" -ForegroundColor White
Write-Host "• Account Manager: accounts.manager@dfashion.com / accounts123" -ForegroundColor White
Write-Host "• Support Manager: support.manager@dfashion.com / support123" -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Try to start the server
if (Test-Path "test-server.js") {
    Write-Host "Starting test server..." -ForegroundColor Green
    node test-server.js
} elseif (Test-Path "minimal-server.js") {
    Write-Host "Starting minimal server..." -ForegroundColor Green
    node minimal-server.js
} elseif (Test-Path "simple-server.js") {
    Write-Host "Starting simple server..." -ForegroundColor Green
    node simple-server.js
} else {
    Write-Host "❌ No server file found!" -ForegroundColor Red
    Write-Host "Please make sure you're in the backend directory." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Server stopped." -ForegroundColor Yellow
Read-Host "Press Enter to exit"
