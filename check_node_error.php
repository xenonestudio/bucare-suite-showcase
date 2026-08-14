<?php
header('Content-Type: text/plain');
set_time_limit(30);

$node = '/home/lexsankx/nodevenv/bucaresuite/backend/20/bin/node';
$serverJs = '/home/lexsankx/bucaresuite/backend/dist/server.js';
$backendDir = '/home/lexsankx/bucaresuite/backend';

chdir($backendDir);

putenv('NODE_ENV=production');
putenv('DATABASE_URL=file:/home/lexsankx/bucaresuite/backend/prisma/prod.db');
putenv('PORT=5001');

$cmd = "timeout 8 $node $serverJs 2>&1";
$out = [];
$code = -1;
exec($cmd, $out, $code);

echo "Exit code: $code\n\n";
echo "Output:\n" . implode("\n", $out) . "\n";
unlink(__FILE__);
?>
