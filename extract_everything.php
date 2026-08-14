<?php
header('Content-Type: text/plain');

$public_html = __DIR__;
$backend_path = dirname(__DIR__) . '/bucaresuite/backend';

echo "Iniciando extracción masiva en $backend_path...\n";

if (!file_exists($backend_path)) {
    mkdir($backend_path, 0755, true);
}

if (file_exists("$public_html/node_modules_backend.tar.gz")) {
    echo "Extrayendo node_modules_backend.tar.gz...\n";
    rename("$public_html/node_modules_backend.tar.gz", "$backend_path/node_modules_backend.tar.gz");
    exec("tar -xzf $backend_path/node_modules_backend.tar.gz -C $backend_path 2>&1", $out1, $r1);
    echo implode("\n", $out1) . "\n";
    if ($r1 === 0) unlink("$backend_path/node_modules_backend.tar.gz");
}

if (file_exists("$public_html/backend.tar.gz")) {
    echo "Extrayendo backend.tar.gz...\n";
    rename("$public_html/backend.tar.gz", "$backend_path/backend.tar.gz");
    exec("tar -xzf $backend_path/backend.tar.gz -C $backend_path 2>&1", $out2, $r2);
    echo implode("\n", $out2) . "\n";
    if ($r2 === 0) unlink("$backend_path/backend.tar.gz");
}

@mkdir("$backend_path/tmp", 0755, true);
touch("$backend_path/tmp/restart.txt");

echo "✅ Proceso completado exitosamente.\n";
unlink(__FILE__);
?>
