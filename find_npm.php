<?php
header('Content-Type: text/plain');
$out = [];
exec("which npm 2>&1; which node 2>&1; ls /usr/local/bin/npm* 2>&1; ls /usr/bin/npm* 2>&1; find /usr/local/lib -name 'npm' -maxdepth 4 2>&1 | head -5", $out);
echo "PATH lookups:\n" . implode("\n", $out) . "\n\n";

$out2 = [];
exec("ls /home/lexsankx/nodevenv/bucaresuite/backend/20/bin/ 2>&1", $out2);
echo "nodevenv/bin:\n" . implode("\n", $out2) . "\n\n";

// try reading npm_wrapper source
$out3 = [];
exec("head -20 /usr/share/l.v.e-manager/utils/npm_wrapper 2>&1", $out3);
echo "npm_wrapper head:\n" . implode("\n", $out3) . "\n";
unlink(__FILE__);
?>
