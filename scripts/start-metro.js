/**
 * Start React Native Metro (no Expo CLI).
 * Clears stale Metro listeners on ports 8081–8090 before starting.
 */
const path = require('path');
const { spawn, spawnSync } = require('child_process');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const killStaleMetro = () => {
  if (process.platform === 'win32') {
    const script = path.join(__dirname, 'kill-metro.ps1');
    spawnSync(
      'powershell',
      ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', script],
      { stdio: 'inherit' }
    );
    return;
  }

  const ports = Array.from({ length: 10 }, (_, i) => 8081 + i);
  ports.forEach(port => {
    try {
      spawnSync('fuser', [`${port}/tcp`, '-k'], { stdio: 'ignore' });
    } catch {
      // ignore if fuser is unavailable
    }
  });
};

killStaleMetro();

const ensureAdbReverse = () => {
  if (process.platform !== 'win32') {
    return;
  }
  const script = path.join(__dirname, 'setup-adb-api.ps1');
  spawnSync(
    'powershell',
    ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', script],
    { stdio: 'ignore' }
  );
};

// USB Android: packager must be reachable at device localhost:8081 via adb reverse.
ensureAdbReverse();
const adbInterval = setInterval(ensureAdbReverse, 15000);

const isWindows = process.platform === 'win32';
const extraArgs = process.argv.slice(2);
const metroEnv = {
  ...process.env,
  REACT_NATIVE_PACKAGER_HOSTNAME:
    process.env.REACT_NATIVE_PACKAGER_HOSTNAME || '127.0.0.1',
};
const child = spawn(isWindows ? 'npx.cmd' : 'npx', ['react-native', 'start', ...extraArgs], {
  stdio: 'inherit',
  env: metroEnv,
  shell: isWindows,
});

child.on('error', error => {
  console.error(error);
  process.exit(1);
});

child.on('exit', code => {
  clearInterval(adbInterval);
  process.exit(code ?? 0);
});
