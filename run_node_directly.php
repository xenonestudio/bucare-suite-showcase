<?php
$node = "/home/lexsankx/nodevenv/bucaresuite/backend/20/bin/node";
$app = "/home/lexsankx/bucaresuite/backend/app.js";

$out = [];
$code = -1;

putenv("NODE_ENV=production");
putenv("PORT=5000");
putenv("DATABASE_URL=file:/home/lexsankx/bucaresuite/backend/prisma/prod.db");

exec("timeout 5 $node $app 2>&1", $out, $code);

$result = "Exit Code: $code\n\nOutput:\n" . implode("\n", $out);
file_put_contents(__DIR__ . "/node_direct_output.txt", $result);
echo "DONE";
?>
