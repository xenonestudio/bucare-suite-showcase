<?php
header('Content-Type: text/plain');
$dir = '/home/lexsankx/bucaresuite/backend';
if (file_exists($dir)) {
    chdir($dir);
    echo "Running prisma db push via direct node:\n";
    $out = [];
    $code = -1;
    $cmd = 'DATABASE_URL="file:/home/lexsankx/bucaresuite/backend/prisma/prod.db" /home/lexsankx/nodevenv/bucaresuite/backend/20/bin/node ./node_modules/prisma/build/index.js db push --accept-data-loss 2>&1';
    exec($cmd, $out, $code);
    echo "Exit code: $code\n";
    echo implode("\n", $out) . "\n\n";

    echo "Running prisma generate via direct node:\n";
    $out2 = [];
    $code2 = -1;
    $cmd2 = 'DATABASE_URL="file:/home/lexsankx/bucaresuite/backend/prisma/prod.db" /home/lexsankx/nodevenv/bucaresuite/backend/20/bin/node ./node_modules/prisma/build/index.js generate 2>&1';
    exec($cmd2, $out2, $code2);
    echo "Exit code: $code2\n";
    echo implode("\n", $out2) . "\n";
} else {
    echo "Directory not found: $dir\n";
}
?>
