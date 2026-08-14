<?php
header('Content-Type: text/plain');
set_time_limit(300);
ignore_user_abort(true);

$backendDir = '/home/lexsankx/bucaresuite/backend';
$node_bin = '/home/lexsankx/nodevenv/bucaresuite/backend/20/bin';

echo "Running npm install --omit=dev with --prefix...\n";
$out = [];
$code = -1;
$cmd = "cd " . escapeshellarg($backendDir) . " && export PATH=\"$node_bin:\$PATH\" && $node_bin/npm install --omit=dev --prefix=" . escapeshellarg($backendDir) . " 2>&1";
exec($cmd, $out, $code);
echo "Exit code: $code\n";
echo implode("\n", $out) . "\n";
unlink(__FILE__);
?>
