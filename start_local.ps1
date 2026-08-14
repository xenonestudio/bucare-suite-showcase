# Script para iniciar Bucare Suite de forma local (Frontend y Backend) en Windows

Write-Host "=== Iniciando servicios locales ===" -ForegroundColor Cyan

# 1. Iniciar Backend en una ventana nueva
Write-Host "Iniciando Backend en puerto 5000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host '--- INICIANDO BACKEND ---' -ForegroundColor Yellow; cd backend; npm run dev"

# 2. Iniciar Frontend en una ventana nueva
Write-Host "Iniciando Frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host '--- INICIANDO FRONTEND ---' -ForegroundColor Cyan; npm run dev"

Write-Host "🚀 ¡Ambos servicios se están ejecutando en ventanas separadas!" -ForegroundColor Green
