# Pre-build sync + adb reverse, then install/run on USB device (Metro must already be running).
$ErrorActionPreference = 'Stop'
$appdevRoot = Split-Path -Parent $PSScriptRoot
Set-Location $appdevRoot

& (Join-Path $PSScriptRoot 'sync-google-services.ps1')
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

& (Join-Path $PSScriptRoot 'setup-adb-api.ps1')

# Avoid INSTALL_FAILED_UPDATE_INCOMPATIBLE when an older build was signed with a different key.
$adb = Get-Command adb -ErrorAction SilentlyContinue
if ($adb) {
    $devices = adb devices 2>&1 | Select-String 'device$' | Where-Object { $_ -notmatch 'List of devices' }
    if ($devices) {
        $uninstall = adb uninstall com.yes 2>&1 | Out-String
        if ($uninstall -match 'Success') {
            Write-Host 'Uninstalled previous com.yes (debug signing changed or stale install).'
        }
    }
}

npx react-native run-android --no-packager
exit $LASTEXITCODE
