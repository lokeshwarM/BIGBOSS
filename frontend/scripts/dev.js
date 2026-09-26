const os = require('os');
const { spawn } = require('child_process');

function getNetworkIp() {
  const interfaces = os.networkInterfaces();
  for (const devName of Object.keys(interfaces)) {
    const iface = interfaces[devName];
    for (const alias of iface) {
      if (alias.family === 'IPv4' && !alias.internal && alias.address !== '127.0.0.1') {
        return alias.address;
      }
    }
  }
  return '127.0.0.1';
}

const networkIp = getNetworkIp();
const port = process.env.PORT || 3000;

console.log('\n\x1b[36m%s\x1b[0m', '═══════════════════════════════════════════════════════════════');
console.log('\x1b[1m\x1b[33m%s\x1b[0m', '  👁️  BIGBOSS COMMUNITY — LIVE DEV SERVER');
console.log('  - Local:        \x1b[32mhttp://localhost:' + port + '\x1b[0m');
console.log('  - Network (IP): \x1b[1m\x1b[36mhttp://' + networkIp + ':' + port + '\x1b[0m  📱 \x1b[33m[USE THIS ON MOBILE]\x1b[0m');
console.log('\x1b[90m%s\x1b[0m', '  (Make sure your phone is connected to the same Wi-Fi network)');
console.log('\x1b[36m%s\x1b[0m\n', '═══════════════════════════════════════════════════════════════');

const child = spawn(`npx next dev -H 0.0.0.0 -p ${port}`, {
  stdio: 'inherit',
  shell: true,
});

child.on('exit', (code, signal) => {
  if (code !== null) process.exit(code);
  if (signal) process.kill(process.pid, signal);
});
