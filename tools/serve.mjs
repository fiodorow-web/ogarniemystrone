#!/usr/bin/env node
// Podgląd zbudowanego dist/ tak, jak poda go Vercel (vercel.json: cleanUrls, trailingSlash: false):
// /oferta → oferta.html, /oferta.html i /oferta/ → przekierowanie na /oferta, nieznany adres → 404.html ze statusem 404.
// Użycie: npm run build && npm run preview   (port: PORT=5000 npm run preview)

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const PORT = Number(process.env.PORT) || 4000;
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.gif': 'image/gif', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif',
  '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8', '.json': 'application/json',
};

if (!fs.existsSync(path.join(DIST, 'index.html'))) {
  console.error('Brak dist/. Najpierw uruchom: npm run build');
  process.exit(1);
}

http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  let p = decodeURIComponent(url.pathname);
  const redirect = (to) => { res.writeHead(308, { Location: to + url.search }); res.end(); };
  if (p.endsWith('.html') && p !== '/404.html') return redirect(p.replace(/(index)?\.html$/, '').replace(/(.)\/$/, '$1') || '/');
  if (p.length > 1 && p.endsWith('/')) return redirect(p.replace(/\/+$/, '') || '/');
  if (p === '/') p = '/index.html';
  let file = path.join(DIST, path.normalize(p));
  if (!file.startsWith(DIST)) { res.writeHead(400); return res.end(); }
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) file = `${file}.html`;
  let status = 200;
  if (!fs.existsSync(file)) { file = path.join(DIST, '404.html'); status = 404; }
  const cache = p.startsWith('/_astro/') ? 'public, max-age=31536000, immutable' : 'no-store';
  res.writeHead(status, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Cache-Control': cache });
  fs.createReadStream(file).pipe(res);
}).listen(PORT, () => console.log(`Podgląd dist/ jak na Vercelu: http://localhost:${PORT}`));
