#!/usr/bin/env node
// Podgląd lokalny jak na Vercelu: /oferta → oferta.html, nieznany adres → 404.html.
// Buduje stronę na starcie i przebudowuje po każdej zmianie w src/ lub public/.
// Użycie: npm run dev   (port: PORT=4000 npm run dev)

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const PORT = Number(process.env.PORT) || 3000;
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.gif': 'image/gif', '.jpg': 'image/jpeg', '.webp': 'image/webp',
  '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8', '.json': 'application/json',
};

const build = () => spawnSync(process.execPath, [path.join(ROOT, 'tools/build.mjs')], { stdio: 'inherit' }).status === 0;
build();

let timer;
for (const dir of ['src', 'public']) {
  try {
    fs.watch(path.join(ROOT, dir), { recursive: true }, () => {
      clearTimeout(timer);
      timer = setTimeout(() => build(), 150);
    });
  } catch {
    console.log(`(Automatyczna przebudowa niedostępna w tej wersji Node – po zmianach uruchom npm run build.)`);
  }
}

http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p.endsWith('.html') && p !== '/404.html') {
    res.writeHead(308, { Location: p.replace(/(index)?\.html$/, '') || '/' });
    return res.end();
  }
  if (p.endsWith('/')) p += 'index.html';
  let file = path.join(DIST, path.normalize(p));
  if (!file.startsWith(DIST)) { res.writeHead(400); return res.end(); }
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) file = `${file}.html`;
  let status = 200;
  if (!fs.existsSync(file)) { file = path.join(DIST, '404.html'); status = 404; }
  res.writeHead(status, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  fs.createReadStream(file).pipe(res);
}).listen(PORT, () => console.log(`Podgląd: http://localhost:${PORT}`));
