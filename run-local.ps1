param([switch]$Verify, [switch]$Production)
$ErrorActionPreference = 'Stop'
$RequiredNodeVersion = '24.19.0'

function Get-NodeVersion([string]$NodeExecutable) {
    if (-not (Test-Path -LiteralPath $NodeExecutable)) { return $null }
    $version = (& $NodeExecutable --version 2>$null)
    if ($LASTEXITCODE -ne 0) { return $null }
    return $version.Trim()
}

Push-Location $PSScriptRoot
try {
    $nvmCommand = Get-Command nvm -ErrorAction SilentlyContinue
    if (-not $nvmCommand) {
        throw "Este proyecto requiere NVM for Windows y Node.js $RequiredNodeVersion."
    }

    Write-Host "Activando Node.js $RequiredNodeVersion con NVM..."
    & $nvmCommand.Source use $RequiredNodeVersion
    if ($LASTEXITCODE -ne 0) {
        throw "No fue posible activar Node.js $RequiredNodeVersion. Ejecuta 'nvm install $RequiredNodeVersion' y vuelve a intentarlo."
    }

    $nvmHome = $env:NVM_HOME
    if (-not $nvmHome) {
        $rootOutput = (& $nvmCommand.Source root | Select-Object -Last 1)
        $nvmHome = ($rootOutput -replace '^Current Root:\s*', '').Trim()
    }

    $versionDirectory = Join-Path $nvmHome "v$RequiredNodeVersion"
    $nodeExecutable = Join-Path $versionDirectory 'node.exe'
    $npmExecutable = Join-Path $versionDirectory 'npm.cmd'
    $nodeVersion = Get-NodeVersion $nodeExecutable

    if ($nodeVersion -ne "v$RequiredNodeVersion") {
        throw "NVM terminó sin error, pero no se encontró Node.js v$RequiredNodeVersion en '$versionDirectory'."
    }
    if (-not (Test-Path -LiteralPath $npmExecutable)) { throw "No se encontró npm para Node.js v$RequiredNodeVersion." }

    Write-Host "Usando Node.js $nodeVersion."
    if (-not (Test-Path -LiteralPath '.env')) {
        Copy-Item -LiteralPath '.env.example' -Destination '.env'
        Write-Host 'Archivo .env creado. Agrega GEMINI_API_KEY para usar el analisis real.'
    }
    if (-not (Test-Path -LiteralPath 'node_modules')) {
        & $npmExecutable ci
        if ($LASTEXITCODE -ne 0) { throw 'Falló la instalación de dependencias.' }
    }
    if ($Verify) {
        & $npmExecutable run verify
        if ($LASTEXITCODE -ne 0) { throw 'Falló la verificación.' }
    } elseif ($Production) {
        & $npmExecutable run build
        if ($LASTEXITCODE -ne 0) { throw 'Falló la compilación.' }
        & $npmExecutable start
        if ($LASTEXITCODE -ne 0) { throw 'Falló el servidor.' }
    } else {
        & $npmExecutable run dev
        if ($LASTEXITCODE -ne 0) { throw 'Falló el entorno de desarrollo.' }
    }
} finally { Pop-Location }
