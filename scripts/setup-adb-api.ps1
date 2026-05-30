# USB Android: forward API (8000) and Metro (8081) from device to PC
$adb = Get-Command adb -ErrorAction SilentlyContinue
if (-not $adb) {
    Write-Warning 'adb not found. Install Android platform-tools.'
    exit 0
}

$devices = adb devices 2>&1 | Select-String 'device$' | Where-Object { $_ -notmatch 'List of devices' }
if (-not $devices) {
    Write-Warning 'No Android device attached. Connect USB and enable USB debugging.'
    exit 0
}

adb reverse tcp:8000 tcp:8000
adb reverse tcp:8081 tcp:8081
adb reverse tcp:3000 tcp:3000
Write-Host 'adb reverse: device :8000 -> PC :8000 (ONINS API)'
Write-Host 'adb reverse: device :8081 -> PC :8081 (Metro)'
Write-Host 'adb reverse: device :3000 -> PC :3000 (Mercure realtime)'
Write-Host 'API base on phone: http://127.0.0.1:8000/api (see src/utils/apiConfig.js)'
Write-Host 'Ensure Metro is running: npm start (terminal 2). This script uses --no-packager.'
