#-------------------------------------------------------
# AI Finance Copilot - Stop Script
# Run:  .\stop.ps1
#-------------------------------------------------------

Write-Host ""
Write-Host "  Stopping AI Finance Copilot..." -ForegroundColor Yellow
Write-Host ""

# Kill processes on ports 3000, 3001, and 8000
foreach ($port in @(3000, 3001, 8000)) {
    $conns = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    foreach ($c in $conns) {
        try {
            Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue
            Write-Host "  [OK] Stopped process on port $port" -ForegroundColor Green
        } catch { }
    }
}

# Stop Docker containers
Push-Location $PSScriptRoot
docker compose down 2>&1 | Out-Null
Pop-Location
Write-Host "  [OK] Database containers stopped" -ForegroundColor Green

Write-Host ""
Write-Host "  All services stopped." -ForegroundColor Cyan
Write-Host ""
