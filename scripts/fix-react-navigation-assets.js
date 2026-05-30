const fs = require('fs');
const path = require('path');

const assetsDir = path.join(
  __dirname,
  '..',
  'node_modules',
  '@react-navigation',
  'elements',
  'lib',
  'module',
  'assets',
);

for (const scale of ['1x', '2x', '3x', '4x']) {
  const source = path.join(assetsDir, `back-icon@${scale}.android.png`);
  const target = path.join(assetsDir, `back-icon@${scale}.png`);

  if (fs.existsSync(source) && !fs.existsSync(target)) {
    fs.copyFileSync(source, target);
  }
}
