# Stop Expo CLI / Metro dev servers on Windows
$ErrorActionPreference = 'SilentlyContinue'

Write-Host 'Stopping Metro / Expo on ports 8081-8090...' -ForegroundColor Cyan
& "$PSScriptRoot\kill-metro.ps1"

Get-CimInstance Win32_Process -Filter "Name = 'node.exe'" |
    Where-Object {
        $_.CommandLine -match 'expo(\.cmd)?\s+start' -or
        $_.CommandLine -match '@expo/cli' -or
        $_.CommandLine -match 'start-expo\.js'
    } |
    ForEach-Object {
        Stop-Process -Id $_.ProcessId -Force
        Write-Host "Stopped node PID $($_.ProcessId) (Expo CLI)"
    }

Write-Host 'Done.' -ForegroundColor Green
