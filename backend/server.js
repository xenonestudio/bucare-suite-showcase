const fs = require('fs');
const path = require('path');

try {
  const logInfo = `=== PASSENGER LAUNCHED SERVER.JS ===\nDate: ${new Date().toISOString()}\nCWD: ${process.cwd()}\nPORT: ${process.env.PORT}\nNODE_ENV: ${process.env.NODE_ENV}\n\n`;
  fs.appendFileSync(path.join(__dirname, 'passenger_debug.log'), logInfo);
} catch (e) {
  // Ignore write errors
}

module.exports = require('./dist/server.js');
