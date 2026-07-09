const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 6000;
const INDEX = fs.readFileSync(path.join(__dirname, 'index.html'));

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('ok');
    return;
  }
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(INDEX);
});

server.listen(PORT, () => {
  console.log(`Start CRM (web) rodando em http://localhost:${PORT}`);
});
