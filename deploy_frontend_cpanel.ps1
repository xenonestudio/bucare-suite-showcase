# Script de despliegue exclusivo del Frontend para cPanel (Windows PowerShell)

# ==================== CONFIGURACIÓN DE FTP Y DOMINIO ====================
$FTP_HOST="lexsank.xyz"
$FTP_USER="lexsankx"
$FTP_PASS="2887245.Alex."
$FTP_PORT="21"
$DOMAIN="bucaresuite.com"

# Directorio FTP de public_html
$REMOTE_PUBLIC_HTML="public_html/"
# =========================================================================

$ErrorActionPreference = "Stop"

Write-Host "=== 1. Compilando Frontend (TanStack Start / Vite) ===" -ForegroundColor Cyan
npm install
npm run build

Write-Host "=== 1.5. Aplicando parche de Sockets de Phusion Passenger a Nitro ===" -ForegroundColor Cyan
$nitroFile = ".output/server/index.mjs"
$nitroContent = Get-Content $nitroFile -Raw
$nitroContent = $nitroContent -replace 'var _parsedPort = Number\.parseInt\(process\.env\.NITRO_PORT \?\? process\.env\.PORT \?\? ""\);', 'var _rawPort = process.env.NITRO_PORT ?? process.env.PORT;'
$nitroContent = $nitroContent -replace 'var port = Number\.isNaN\(_parsedPort\) \? 3e3 : _parsedPort;', 'var port = _rawPort ? (/^\d+$/.test(_rawPort) ? Number.parseInt(_rawPort) : _rawPort) : 3e3;'
Set-Content -Path $nitroFile -Value $nitroContent -Encoding utf8

Write-Host "=== 2. Creando paquete comprimido del Frontend ===" -ForegroundColor Cyan
tar -czf frontend.tar.gz .output app.js package.json package-lock.json

Write-Host "=== 3. Subiendo paquete por FTP a cPanel ===" -ForegroundColor Cyan
curl.exe -u "$($FTP_USER):$($FTP_PASS)" -T frontend.tar.gz "ftp://$($FTP_HOST):$($FTP_PORT)/$REMOTE_PUBLIC_HTML"

Write-Host "=== 4. Creando Script Helper de Extracción ===" -ForegroundColor Cyan
$phpHelper = @"
<?php
header('Content-Type: text/plain');

`$public_html = __DIR__;
`$frontend_path = dirname(__DIR__) . '/bucaresuite/frontend';

echo "Iniciando extracción remota del Frontend...\n";

if (!file_exists(`$frontend_path)) {
    mkdir(`$frontend_path, 0755, true);
}

if (file_exists("`$public_html/frontend.tar.gz")) {
    echo "Procesando Frontend...\n";
    rename("`$public_html/frontend.tar.gz", "`$frontend_path/frontend.tar.gz");
    `$output = [];
    exec("tar -xzf `$frontend_path/frontend.tar.gz -C `$frontend_path 2>&1", `$output, `$return_var);
    echo implode("\n", `$output) . "\n";
    if (`$return_var === 0) {
        unlink("`$frontend_path/frontend.tar.gz");
        @mkdir("`$frontend_path/tmp", 0755, true);
        touch("`$frontend_path/tmp/restart.txt");
        echo "✅ Frontend extraído con éxito y programado para reinicio.\n";
    } else {
        echo "❌ Error al extraer Frontend.\n";
    }
} else {
    echo "No se encontró frontend.tar.gz en public_html.\n";
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
    Invoke-WebRequest -Uri "http://$DOMAIN/deploy_helper.php" -UseBasicParsing | Select-Object -ExpandProperty Content
} catch {
    Write-Host "Intentando vía FTP_HOST ($FTP_HOST)..." -ForegroundColor Yellow
    Invoke-WebRequest -Uri "http://$FTP_HOST/deploy_helper.php" -UseBasicParsing | Select-Object -ExpandProperty Content
}

Write-Host "=== 7. Limpiando archivos temporales locales ===" -ForegroundColor Cyan
Remove-Item frontend.tar.gz -ErrorAction SilentlyContinue

Write-Host "🚀 ¡Despliegue del Frontend completado con éxito!" -ForegroundColor Green
