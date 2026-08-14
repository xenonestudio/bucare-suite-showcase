#!/bin/bash
# Script de despliegue por FTP para cPanel (Linux / macOS / Git Bash)

# ==================== CONFIGURACIÓN DE FTP ====================
FTP_HOST="lexsank.xyz"
FTP_USER="lexsankx"
FTP_PASS="2887245.Alex."
FTP_PORT="21"

# Directorio FTP de public_html
REMOTE_PUBLIC_HTML="public_html/"
# ==============================================================

set -e

echo "=== 1. Compilando Backend ==="
cd backend
npm install
npm run build
cd ..

echo "=== 2. Compilando Frontend ==="
npm install
npm run build

echo "=== 3. Creando archivos de despliegue ==="
tar -czf frontend.tar.gz .output app.js package.json package-lock.json
tar -czf backend.tar.gz -C backend dist prisma package.json package-lock.json

echo "=== 4. Subiendo compilados a cPanel vía FTP ==="
# Subimos los archivos comprimidos directamente a public_html/ para evitar problemas de rutas FTP
curl -u "$FTP_USER:$FTP_PASS" -T frontend.tar.gz "ftp://$FTP_HOST:$FTP_PORT/$REMOTE_PUBLIC_HTML"
curl -u "$FTP_USER:$FTP_PASS" -T backend.tar.gz "ftp://$FTP_HOST:$FTP_PORT/$REMOTE_PUBLIC_HTML"

echo "=== 5. Creando Script Helper de Extracción en cPanel ==="
cat << 'EOF' > deploy_helper.php
<?php
// Script de extracción remota robusto para cPanel
header('Content-Type: text/plain');

$public_html = __DIR__;
$frontend_path = dirname(__DIR__) . '/bucaresuite/frontend';
$backend_path = dirname(__DIR__) . '/bucaresuite/backend';

echo "Iniciando extracción remota...\n";

// Asegurar directorios de destino
if (!file_exists($frontend_path)) {
    mkdir($frontend_path, 0755, true);
    echo "Creado directorio de destino del frontend.\n";
}
if (!file_exists($backend_path)) {
    mkdir($backend_path, 0755, true);
    echo "Creado directorio de destino del backend.\n";
}

// 1. Extraer Frontend
if (file_exists("$public_html/frontend.tar.gz")) {
    echo "Procesando Frontend...\n";
    rename("$public_html/frontend.tar.gz", "$frontend_path/frontend.tar.gz");
    $output = [];
    exec("tar -xzf $frontend_path/frontend.tar.gz -C $frontend_path 2>&1", $output, $return_var);
    echo implode("\n", $output) . "\n";
    if ($return_var === 0) {
        unlink("$frontend_path/frontend.tar.gz");
        @mkdir("$frontend_path/tmp", 0755, true);
        touch("$frontend_path/tmp/restart.txt");
        echo "Frontend extraído y programado para reinicio.\n";
    } else {
        echo "Error al extraer Frontend.\n";
    }
} else {
    echo "No se encontró frontend.tar.gz en public_html.\n";
}

// 2. Extraer Backend
if (file_exists("$public_html/backend.tar.gz")) {
    echo "Procesando Backend...\n";
    rename("$public_html/backend.tar.gz", "$backend_path/backend.tar.gz");
    $output = [];
    exec("tar -xzf $backend_path/backend.tar.gz -C $backend_path 2>&1", $output, $return_var);
    echo implode("\n", $output) . "\n";
    if ($return_var === 0) {
        unlink("$backend_path/backend.tar.gz");
        @mkdir("$backend_path/tmp", 0755, true);
        touch("$backend_path/tmp/restart.txt");
        echo "Backend extraído y programado para reinicio.\n";
    } else {
        echo "Error al extraer Backend.\n";
    }
} else {
    echo "No se encontró backend.tar.gz en public_html.\n";
}

// Limpieza proactiva de procesos colgados/zombies de Node
$procDir = '/proc';
if (file_exists($procDir)) {
    $pids = scandir($procDir);
    foreach ($pids as $pid) {
        if (!is_numeric($pid)) continue;
        if ($pid == getmypid()) continue;
        $cmdlineFile = "$procDir/$pid/cmdline";
        if (file_exists($cmdlineFile)) {
            $cmd = @file_get_contents($cmdlineFile);
            if (strpos($cmd, 'node') !== false || strpos($cmd, 'lsnode') !== false) {
                if (function_exists('posix_kill')) { @posix_kill((int)$pid, 9); }
                @exec("kill -9 $pid 2>&1");
            }
        }
    }
}

// Auto-eliminación del script por seguridad
unlink(__FILE__);
echo "Script de despliegue finalizado y auto-eliminado.\n";
EOF


echo "=== 6. Subiendo deploy_helper.php a public_html ==="
curl -u "$FTP_USER:$FTP_PASS" -T deploy_helper.php "ftp://$FTP_HOST:$FTP_PORT/$REMOTE_PUBLIC_HTML"
rm -f deploy_helper.php

echo "=== 7. Ejecutando la extracción remota ==="
# Llamar al script PHP vía HTTP para que se ejecute en el servidor
curl -s "http://$FTP_HOST/deploy_helper.php"

echo "=== 8. Limpiando archivos locales ==="
rm -f frontend.tar.gz backend.tar.gz

echo "🚀 ¡Despliegue manual completado con éxito!"
