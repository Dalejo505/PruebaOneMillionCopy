# Uso (PowerShell, desde la raíz del repo o cualquier sitio):
#   .\scripts\publish-to-github.ps1 -Token ghp_xxxxxxxx
# O:
#   $env:GH_TOKEN = "ghp_xxxxxxxx"; .\scripts\publish-to-github.ps1
#
# Crea el PAT en: https://github.com/settings/tokens (classic) con scope "repo".

param(
  [string]$RepoName = "PruebaOneMillionCopy",
  [string]$Token = $env:GH_TOKEN
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

if (-not $Token) {
  Write-Host "Falta el token. Ejemplo:" -ForegroundColor Yellow
  Write-Host '  .\scripts\publish-to-github.ps1 -Token ghp_xxxxxxxx' -ForegroundColor Cyan
  Write-Host "Crea un PAT (classic) con permiso 'repo': https://github.com/settings/tokens" -ForegroundColor Gray
  exit 1
}

$env:GH_TOKEN = $Token

$git = "C:\Program Files\Git\bin\git.exe"
if (-not (Test-Path $git)) { $git = "git" }

& $git status 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) {
  Write-Host "No se encontró git." -ForegroundColor Red
  exit 1
}

Write-Host "Autenticando gh con token..." -ForegroundColor Green
$Token | gh auth login --with-token 2>&1 | Out-Host
if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}

gh auth setup-git 2>&1 | Out-Host

$remote = & $git remote 2>$null
if ($remote -match "origin") {
  Write-Host "Remote 'origin' ya existe; haciendo push..." -ForegroundColor Green
  & $git push -u origin main
} else {
  Write-Host "Creando repo $RepoName en GitHub y subiendo..." -ForegroundColor Green
  gh repo create $RepoName --public --source=. --remote=origin --push
}

Write-Host "Listo. Revisa: https://github.com/dalejo505/$RepoName" -ForegroundColor Green
