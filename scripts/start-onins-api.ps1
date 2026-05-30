$oninsRoot = Join-Path (Split-Path -Parent $PSScriptRoot) '..\ONINS'
$script = Join-Path $oninsRoot 'scripts\start-api.ps1'
if (-not (Test-Path $script)) {
    Write-Error "ONINS not found at $oninsRoot"
}
& powershell -NoProfile -ExecutionPolicy Bypass -File $script
