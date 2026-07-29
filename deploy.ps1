# Script de despliegue para Bucare Suite (Windows PowerShell)

# Configuración
$VM_USER="deploy"
$VM_IP="35.254.151.234"
$SSH_KEY="$Home\.ssh\bucare_gcp"
$VM_DIR="/home/deploy/app"

Write-Host "=== 1. Compilando Backend ===" -ForegroundColor Cyan
Set-Location backend
npm run build
Set-Location ..

Write-Host "=== 2. Compilando Frontend ===" -ForegroundColor Cyan
npm run build

Write-Host "=== 3. Creando archivos de despliegue ===" -ForegroundColor Cyan
tar -czf frontend.tar.gz .output
tar -czf deploy.tar.gz -C backend dist prisma package.json package-lock.json

Write-Host "=== 4. Subiendo archivos a la VM ===" -ForegroundColor Cyan
C:\Windows\System32\OpenSSH\scp.exe -i "$SSH_KEY" -o StrictHostKeyChecking=no frontend.tar.gz "$($VM_USER)@$($VM_IP):/home/deploy/"
C:\Windows\System32\OpenSSH\scp.exe -i "$SSH_KEY" -o StrictHostKeyChecking=no deploy.tar.gz "$($VM_USER)@$($VM_IP):/home/deploy/"

Write-Host "=== 5. Extrayendo y reiniciando servicios en la VM ===" -ForegroundColor Cyan
C:\Windows\System32\OpenSSH\ssh.exe -i "$SSH_KEY" -o StrictHostKeyChecking=no "$($VM_USER)@$($VM_IP)" "tar -xzf /home/deploy/frontend.tar.gz -C $VM_DIR/ && tar -xzf /home/deploy/deploy.tar.gz -C $VM_DIR/backend/ && cd $VM_DIR/backend && npx prisma db push && pm2 restart all"

Write-Host "=== 6. Limpiando archivos locales ===" -ForegroundColor Cyan
Remove-Item frontend.tar.gz, deploy.tar.gz -ErrorAction SilentlyContinue

Write-Host "🚀 ¡Despliegue completado con éxito!" -ForegroundColor Green
