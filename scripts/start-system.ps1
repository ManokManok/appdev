# One command: ONINS API (MySQL + PHP) then Metro; optional USB Android install.
param(
    [switch]$WithAndroid
)

$ErrorActionPreference = 'Stop'
$appdevRoot = Split-Path -Parent $PSScriptRoot

Write-Host ''
Write-Host '=== ONINS full stack ===' -ForegroundColor Cyan
Write-Host ''

Write-Host 'Step 1/2: API + MySQL' -ForegroundColor Cyan
& powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $appdevRoot 'scripts\start-onins-api.ps1')
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

if ($WithAndroid) {
    Write-Host ''
    Write-Host 'Step 2/3: Metro (new window)' -ForegroundColor Cyan
    Start-Process powershell -ArgumentList @(
        '-NoProfile', '-NoExit', '-ExecutionPolicy', 'Bypass',
        '-Command', "Set-Location '$appdevRoot'; Write-Host 'Metro bundler - leave this window open' -ForegroundColor Green; npm start"
    )

    Write-Host 'Waiting for Metro on port 8081...' -ForegroundColor DarkGray
    $metroReady = $false
    $deadline = (Get-Date).AddSeconds(90)
    while ((Get-Date) -lt $deadline -and -not $metroReady) {
        try {
            $tcp = New-Object System.Net.Sockets.TcpClient
            $tcp.Connect('127.0.0.1', 8081)
            $tcp.Close()
            $metroReady = $true
        } catch {
            Start-Sleep -Seconds 2
        }
    }
    if (-not $metroReady) {
        Write-Warning 'Metro did not respond on 8081 yet. Android build may still work if Metro finishes starting.'
    }

    Write-Host ''
    Write-Host 'Step 3/3: Android (USB)' -ForegroundColor Cyan
    Set-Location $appdevRoot
    & (Join-Path $appdevRoot 'scripts\start-android.ps1')
    exit $LASTEXITCODE
}

Write-Host ''
Write-Host 'Step 2/2: Metro bundler (Ctrl+C to stop)' -ForegroundColor Cyan
Write-Host '  API:  http://127.0.0.1:8000/api' -ForegroundColor DarkGray
Write-Host '  Phone: npm run dev:android  (USB + Metro in this stack)' -ForegroundColor DarkGray
Write-Host ''
Set-Location $appdevRoot
npm start
