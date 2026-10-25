#!/usr/bin/env node
// Podgląd zbudowanego dist/ tak, jak poda go Vercel (vercel.json: cleanUrls, trailingSlash: false):
// /oferta → oferta.html, /oferta.html i /oferta/ → przekierowanie na /oferta, nieznany adres → 404.html ze statusem 404,
// długi cache dla /_astro/ i kompresja plików tekstowych.
// POST /api/kontakt obsługuje ta sama funkcja co na Vercelu (src/formularz/obsluga.js). Bez RESEND_API_KEY
// maile nie wychodzą, tylko zapisują się w .podglad-maili/ (HTML i tekst) do obejrzenia w przeglądarce.
// Użycie: npm run build && npm run preview   (port: PORT=5000 npm run preview)

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { obsluzZgloszenie } from '../src/formularz/obsluga.js';

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

async function formularz(req, res) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const body = ['GET', 'HEAD'].includes(req.method) ? undefined : Buffer.concat(chunks);
  const request = new Request(`http://${req.headers.host}${req.url}`, { method: req.method, headers: req.headers, body });
  const env = { ...process.env, FORMULARZ_PODGLAD: process.env.FORMULARZ_PODGLAD || path.join(ROOT, '.podglad-maili') };
  const r = await obsluzZgloszenie(request, env);
  res.writeHead(r.status, Object.fromEntries(r.headers));
  res.end(Buffer.from(await r.arrayBuffer()));
}

http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  let p = decodeURIComponent(url.pathname);
  if (p === '/api/kontakt') return void formularz(req, res).catch((e) => { console.error(e); res.writeHead(500); res.end(); });
  // Statystyki (Vercel Web Analytics) działają tylko na Vercelu; lokalnie pusty skrypt i ciche przyjęcie danych
  if (p.startsWith('/_vercel/')) { res.writeHead(p.endsWith('.js') ? 200 : 204, { 'Content-Type': 'text/javascript' }); return res.end(); }
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
  const type = TYPES[path.extname(file)] || 'application/octet-stream';
  const headers = { 'Content-Type': type, 'Cache-Control': cache, Vary: 'Accept-Encoding' };
  // Kompresja jak na Vercelu (Brotli albo gzip dla plików tekstowych), żeby waga podstrony była prawdziwa
  const accept = String(req.headers['accept-encoding'] || '');
  const text = /^(text\/|application\/(json|xml)|image\/svg)/.test(type);
  const enc = text && /\bbr\b/.test(accept) ? 'br' : text && /\bgzip\b/.test(accept) ? 'gzip' : null;
  if (enc) headers['Content-Encoding'] = enc;
  res.writeHead(status, headers);
  const stream = fs.createReadStream(file);
  if (enc === 'br') stream.pipe(zlib.createBrotliCompress()).pipe(res);
  else if (enc === 'gzip') stream.pipe(zlib.createGzip()).pipe(res);
  else stream.pipe(res);
}).listen(PORT, () => console.log(`Podgląd dist/ jak na Vercelu: http://localhost:${PORT}`));
