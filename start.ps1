# start.ps1
# AI Finance Copilot - Unified Startup Script

$ErrorActionPreference = "Stop"
$Root = $PSScriptRoot

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host " Starting AI Finance Copilot Environment " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Start Docker Containers
Write-Host "[1/5] Starting Docker infrastructure (PostgreSQL & Redis)..." -ForegroundColor Yellow
try {
    docker compose up -d
} catch {
    Write-Host "Warning: Docker might not be running or compose failed." -ForegroundColor Red
}

# Wait for DB to be ready
Start-Sleep -Seconds 5

# 2. Push Database Schema
Write-Host "[2/5] Syncing Prisma Database Schema..." -ForegroundColor Yellow
Set-Location -Path "packages\database"
try {
    npx prisma db push
} catch {
    Write-Host "Warning: Failed to sync Prisma DB. Is PostgreSQL running?" -ForegroundColor Red
}
Set-Location -Path "..\.."

# 3. Clean up Stale Processes
Write-Host "[3/5] Cleaning up stale processes..." -ForegroundColor Yellow
foreach ($port in @(3000, 3001, 8000)) {
    $conns = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    foreach ($c in $conns) {
        try { Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue } catch { }
    }
}
Write-Host "      [OK] Ports 3000, 3001, 8000 cleared" -ForegroundColor Green

# 4. Start ML Service (Python)
Write-Host "[4/5] Starting ML Service (FastAPI) on Port 8000..." -ForegroundColor Yellow
$mlPath = Join-Path $Root "apps\ml-service"
$mlCmd = "cd /d `"$mlPath`" && if exist ai-finance-env\Scripts\activate.bat (call ai-finance-env\Scripts\activate.bat) else if exist .venv\Scripts\activate.bat (call .venv\Scripts\activate.bat) && uvicorn main:app --reload --host 0.0.0.0 --port 8000"
Start-Process -FilePath "cmd.exe" -ArgumentList "/k title ML-Service && $mlCmd"

# 5. Start NestJS API & Next.js Web
Write-Host "[5/5] Starting Web Apps (NestJS API & Next.js Frontend)..." -ForegroundColor Yellow

$apiPath = Join-Path $Root "apps\api"
Start-Process -FilePath "cmd.exe" -ArgumentList "/k title NestJS-API && cd /d `"$apiPath`" && npm run start:dev"

$webPath = Join-Path $Root "apps\web"
Start-Process -FilePath "cmd.exe" -ArgumentList "/k title NextJS-Web && cd /d `"$webPath`" && npm run dev"

Write-Host "=========================================" -ForegroundColor Green
Write-Host " All services have been launched! " -ForegroundColor Green
Write-Host " - ML Service: http://localhost:8000" -ForegroundColor Green
Write-Host " - NestJS API: http://localhost:3001" -ForegroundColor Green
Write-Host " - NextJS Web: http://localhost:3000" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host "You can safely close this terminal window."

