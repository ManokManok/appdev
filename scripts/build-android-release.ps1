param(
    [switch]$Bundle
)

$ErrorActionPreference = 'Stop'
$appdevRoot = Split-Path -Parent $PSScriptRoot
$androidDir = Join-Path $appdevRoot 'android'

if (-not (Test-Path (Join-Path $androidDir 'gradlew.bat'))) {
    Write-Error "Android project not found at $androidDir"
}

Set-Location $androidDir
$env:NODE_ENV = 'production'

if ($Bundle) {
    Write-Host 'Building release AAB (Google Play)...' -ForegroundColor Cyan
    & .\gradlew.bat bundleRelease
    $artifact = Join-Path $androidDir 'app\build\outputs\bundle\release\app-release.aab'
} else {
    Write-Host 'Building release APK...' -ForegroundColor Cyan
    & .\gradlew.bat assembleRelease
    $artifact = Join-Path $androidDir 'app\build\outputs\apk\release\app-release.apk'
}

if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}

Write-Host ''
Write-Host "Done: $artifact" -ForegroundColor Green
Write-Host 'Release builds currently use the debug keystore (see android/app/build.gradle).' -ForegroundColor Yellow
Write-Host 'For Play Store, create a release keystore and update signingConfigs.release.' -ForegroundColor Yellow
