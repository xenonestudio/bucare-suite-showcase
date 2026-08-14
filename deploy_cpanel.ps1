# Script de despliegue por FTP para cPanel (Windows PowerShell)

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

Write-Host "=== 1. Compilando Backend ===" -ForegroundColor Cyan
Set-Location backend
if (Test-Path "dist") { Remove-Item -Path "dist" -Recurse -Force }
npm install
npm run build
Write-Host "    -> Generando cliente Prisma con binarios Linux..." -ForegroundColor DarkCyan
npx prisma generate
if (Test-Path "src\generated\client") {
    New-Item -ItemType Directory -Force -Path "dist\generated\client"
    Copy-Item -Path "src\generated\client\*" -Destination "dist\generated\client" -Recurse -Force
    Write-Host "    -> Cliente Prisma copiado a dist\generated\client" -ForegroundColor DarkCyan
}
Set-Location ..

Write-Host "=== 2. Compilando Frontend ===" -ForegroundColor Cyan
npm install
npm run build

Write-Host "=== 3. Creando archivos de despliegue ===" -ForegroundColor Cyan
tar -czf frontend.tar.gz .output app.js package.json package-lock.json
tar --exclude="*.db" --exclude="*.db-journal" -czf backend.tar.gz -C backend dist prisma package.json package-lock.json

Write-Host "=== 4. Subiendo compilados a cPanel vía FTP ===" -ForegroundColor Cyan
curl.exe -u "$($FTP_USER):$($FTP_PASS)" -T frontend.tar.gz "ftp://$($FTP_HOST):$($FTP_PORT)/$REMOTE_PUBLIC_HTML"
curl.exe -u "$($FTP_USER):$($FTP_PASS)" -T backend.tar.gz "ftp://$($FTP_HOST):$($FTP_PORT)/$REMOTE_PUBLIC_HTML"

Write-Host "=== 5. Creando Script Helper de Extracción en cPanel ===" -ForegroundColor Cyan
$phpHelper = @"
<?php
set_time_limit(600);
ini_set('memory_limit', '1024M');
header('Content-Type: text/plain');

`$public_html = __DIR__;
`$frontend_path = dirname(__DIR__) . '/bucaresuite/frontend';
`$backend_path = dirname(__DIR__) . '/bucaresuite/backend';

echo "Iniciando extracción remota...\n";

if (!file_exists(`$frontend_path)) {
    mkdir(`$frontend_path, 0755, true);
}
if (!file_exists(`$backend_path)) {
    mkdir(`$backend_path, 0755, true);
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
        echo "Frontend extraído y programado para reinicio.\n";
    }
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
        echo "Backend extraído y programado para reinicio.\n";
    }
}

// Limpieza proactiva de procesos colgados/zombies de Node
`$procDir = '/proc';
if (file_exists(`$procDir)) {
    `$pids = scandir(`$procDir);
    foreach (`$pids as `$pid) {
        if (!is_numeric(`$pid)) continue;
        if (`$pid == getmypid()) continue;
        `$cmdlineFile = "`$procDir/`$pid/cmdline";
        if (file_exists(`$cmdlineFile)) {
            `$cmd = @file_get_contents(`$cmdlineFile);
            if (strpos(`$cmd, 'node') !== false || strpos(`$cmd, 'lsnode') !== false) {
                if (function_exists('posix_kill')) { @posix_kill((int)`$pid, 9); }
                @exec("kill -9 `$pid 2>&1");
            }
        }
    }
}


unlink(__FILE__);
echo "Script de despliegue finalizado y auto-eliminado.\n";
?>
"@

$phpHelper | Out-File -FilePath deploy_helper.php -Encoding utf8

Write-Host "=== 6. Subiendo deploy_helper.php a public_html ===" -ForegroundColor Cyan
curl.exe -u "$($FTP_USER):$($FTP_PASS)" -T deploy_helper.php "ftp://$($FTP_HOST):$($FTP_PORT)/$REMOTE_PUBLIC_HTML"
Remove-Item deploy_helper.php -ErrorAction SilentlyContinue

Write-Host "=== 7. Ejecutando la extracción remota ===" -ForegroundColor Cyan
try {
    Invoke-WebRequest -Uri "http://$DOMAIN/deploy_helper.php" -UseBasicParsing | Select-Object -ExpandProperty Content
} catch {
    Write-Host "Intentando vía FTP_HOST..." -ForegroundColor Yellow
    Invoke-WebRequest -Uri "http://$FTP_HOST/deploy_helper.php" -UseBasicParsing | Select-Object -ExpandProperty Content
}

Write-Host "=== 8. Limpiando archivos locales ===" -ForegroundColor Cyan
Remove-Item frontend.tar.gz, backend.tar.gz -ErrorAction SilentlyContinue

Write-Host "🚀 ¡Despliegue manual completado con éxito!" -ForegroundColor Green
