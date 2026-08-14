# Script de compilación y subida del Backend (Sin node_modules)

# ==================== CONFIGURACIÓN DE FTP Y DOMINIO ====================
$FTP_HOST="lexsank.xyz"
$FTP_USER="lexsankx"
$FTP_PASS="2887245.Alex."
$FTP_PORT="21"
$FRONTEND_DOMAIN="bucaresuite.com"
$API_DOMAIN="api.bucaresuite.com"

# Directorio FTP de public_html
$REMOTE_PUBLIC_HTML="public_html/"
# =========================================================================

$ErrorActionPreference = "Stop"

Write-Host "=== 1. Compilando Backend y generando Base de Datos SQLite (prod.db) ===" -ForegroundColor Cyan
Set-Location backend

# Asegurar dependencias locales e iniciar compilación
npm install
$env:DATABASE_URL="file:./prod.db"
npx prisma generate
npx prisma db push --skip-generate
npm run build

# Crear archivo .env de producción si no existe
if (-not (Test-Path ".env")) {
    $envProd = @"
PORT=5000
NODE_ENV=production
CORS_ORIGIN=http://$FRONTEND_DOMAIN,https://$FRONTEND_DOMAIN
JWT_SECRET=super_secret_jwt_key_bucare_2026_x_32chars!
DATABASE_URL=file:./prod.db
"@
    $envProd | Out-File -FilePath .env -Encoding utf8
}

Set-Location ..

Write-Host "=== 2. Empaquetando solo código compilado (SIN node_modules) ===" -ForegroundColor Cyan
tar -czf backend.tar.gz -C backend dist prisma package.json package-lock.json .env app.js server.js index.js

Write-Host "=== 3. Subiendo backend.tar.gz a cPanel vía FTP ===" -ForegroundColor Cyan
curl.exe -u "$($FTP_USER):$($FTP_PASS)" -T backend.tar.gz "ftp://$($FTP_HOST):$($FTP_PORT)/$REMOTE_PUBLIC_HTML"

Write-Host "=== 4. Creando Script Helper de Extracción ===" -ForegroundColor Cyan
$phpHelper = @"
<?php
header('Content-Type: text/plain');

`$public_html = __DIR__;
`$backend_path = dirname(__DIR__) . '/bucaresuite/backend';

echo "Iniciando extracción remota del Backend...\n";

if (!file_exists(`$backend_path)) {
    mkdir(`$backend_path, 0755, true);
}

if (file_exists("`$public_html/backend.tar.gz")) {
    echo "Procesando Backend...\n";
    rename("`$public_html/backend.tar.gz", "`$backend_path/backend.tar.gz");
    `$output = [];
    exec("tar -xzf `$backend_path/backend.tar.gz -C `$backend_path 2>&1", `$output, `$return_var);
    echo implode("\n", `$output) . "\n";
    if (`$return_var === 0) {
        unlink("`$backend_path/backend.tar.gz");
        @mkdir("`$backend_path/tmp", 0755, true);
        touch("`$backend_path/tmp/restart.txt");
        echo "✅ Código del Backend extraído con éxito en cPanel.\n";
    } else {
        echo "❌ Error al extraer Backend.\n";
    }
} else {
    echo "No se encontró backend.tar.gz en public_html.\n";
}

unlink(__FILE__);
echo "Script de despliegue finalizado y auto-eliminado.\n";
?>
"@

$phpHelper | Out-File -FilePath deploy_helper.php -Encoding utf8

Write-Host "=== 5. Subiendo deploy_helper.php a public_html ===" -ForegroundColor Cyan
curl.exe -u "$($FTP_USER):$($FTP_PASS)" -T deploy_helper.php "ftp://$($FTP_HOST):$($FTP_PORT)/$REMOTE_PUBLIC_HTML"
Remove-Item deploy_helper.php -ErrorAction SilentlyContinue

Write-Host "=== 6. Ejecutando extracción remota en cPanel ===" -ForegroundColor Cyan
try {
    Invoke-WebRequest -Uri "http://$FRONTEND_DOMAIN/deploy_helper.php" -UseBasicParsing | Select-Object -ExpandProperty Content
} catch {
    Write-Host "Intentando vía FTP_HOST ($FTP_HOST)..." -ForegroundColor Yellow
    Invoke-WebRequest -Uri "http://$FTP_HOST/deploy_helper.php" -UseBasicParsing | Select-Object -ExpandProperty Content
}

Write-Host "=== 7. Limpiando archivos temporales locales ===" -ForegroundColor Cyan
Remove-Item backend.tar.gz -ErrorAction SilentlyContinue

Write-Host "🚀 ¡Compilados del Backend subidos y extraídos con éxito!" -ForegroundColor Green
