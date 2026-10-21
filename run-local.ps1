param([switch]$Verify, [switch]$Production)
$ErrorActionPreference = 'Stop'
Push-Location $PSScriptRoot
try {
    if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw 'Instala Node.js 24 antes de continuar.' }
    if ((node --version) -notmatch '^v24\.') { throw 'Este proyecto requiere Node.js 24.' }
    if (-not (Test-Path -LiteralPath '.env')) {
        Copy-Item -LiteralPath '.env.example' -Destination '.env'
        Write-Host 'Archivo .env creado. Agrega GEMINI_API_KEY para usar el analisis real.'
    }
    if (-not (Test-Path -LiteralPath 'node_modules')) {
        npm.cmd ci
        if ($LASTEXITCODE -ne 0) { throw 'Falló la instalación de dependencias.' }
    }
    if ($Verify) {
        npm.cmd run verify
        if ($LASTEXITCODE -ne 0) { throw 'Falló la verificación.' }
    } elseif ($Production) {
        npm.cmd run build
        if ($LASTEXITCODE -ne 0) { throw 'Falló la compilación.' }
        npm.cmd start
        if ($LASTEXITCODE -ne 0) { throw 'Falló el servidor.' }
    } else {
        npm.cmd run dev
        if ($LASTEXITCODE -ne 0) { throw 'Falló el entorno de desarrollo.' }
    }
} finally { Pop-Location }
