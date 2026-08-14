<?php
header('Content-Type: text/plain');
$backend_restart = '/home/lexsankx/bucaresuite/backend/tmp/restart.txt';
$frontend_restart = '/home/lexsankx/bucaresuite/frontend/tmp/restart.txt';
@mkdir(dirname($backend_restart), 0755, true);
@mkdir(dirname($frontend_restart), 0755, true);
touch($backend_restart);
touch($frontend_restart);
echo "Restart files touched successfully!\n";
?>
