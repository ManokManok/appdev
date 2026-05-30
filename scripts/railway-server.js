/**
 * Lightweight status server for Railway (React Native repo has no web app to serve).
 * Keeps the appdev service online and exposes health + project metadata.
 */
const http = require('http');

const PORT = Number(process.env.PORT || 8080);
const WEBDEV_HOST =
  process.env.RAILWAY_SERVICE_WEBDEV_URL ||
  'webdev-production-c694.up.railway.app';

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (WEBDEV_HOST ? `https://${WEBDEV_HOST.replace(/^https?:\/\//, '')}/api` : null);

const startedAt = new Date().toISOString();

const server = http.createServer((req, res) => {
  const path = (req.url || '/').split('?')[0];

  if (path === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('ok');
    return;
  }

  if (path === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'appdev', startedAt }));
    return;
  }

  const body = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>ONINS Mobile (APPDEV)</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 40rem; margin: 3rem auto; padding: 0 1rem; color: #1a1a1a; }
    h1 { font-size: 1.5rem; }
    code { background: #f4f4f4; padding: 0.15rem 0.4rem; border-radius: 4px; }
    .ok { color: #0a7; font-weight: 600; }
  </style>
</head>
<body>
  <h1>ONINS Mobile App (APPDEV)</h1>
  <p class="ok">Service online</p>
  <p>This Railway service hosts the React Native customer app repository.
     Install the Android/iOS build on a device; Metro runs locally during development.</p>
  ${API_URL ? `<p>Backend API: <code>${API_URL.replace('/api', '')}</code></p>` : ''}
  <p>Health: <code>/health</code></p>
</body>
</html>`;

  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(body);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`APPDEV status server listening on 0.0.0.0:${PORT}`);
});
