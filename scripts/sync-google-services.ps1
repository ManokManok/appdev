# Copy Firebase Android config for native push (FCM)
$root = Split-Path -Parent $PSScriptRoot
$src = Join-Path $root 'google-services.json'
$dst = Join-Path $root 'android\app\google-services.json'

if (-not (Test-Path $src)) {
    Write-Host 'google-services.json not found at project root — Mercure local notifications still work.'
    Write-Host 'For background/killed-app push: copy google-services.json.example and download from Firebase Console.'
    exit 0
}

Copy-Item $src $dst -Force
Write-Host "Synced google-services.json -> android/app/google-services.json"
