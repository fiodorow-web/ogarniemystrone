// Integracja Astro uruchamiana po zbudowaniu dist/:
// - sitemap.xml ze wszystkich stron, które nie mają noindex,
// - robots.txt,
// - kontrola linków wewnętrznych i kotwic: zepsuty link zatrzymuje build,
// - Content-Security-Policy w <meta> każdej strony,
// - przy wdrożeniu produkcji: zgłoszenie zmienionych podstron przez IndexNow.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { zglosIndexNow } from './indexnow.mjs';

// Pliki źródłowe strony: z nich bierze się data zmiany do <lastmod>
const zrodla = (urlPath) => {
  const nazwa = urlPath === '/' ? 'index' : urlPath.slice(1);
  return [`src/pages/${nazwa}.astro`, ...(nazwa === 'realizacje' ? ['src/content/realizacje'] : [])];
};

// Zmiany w tych plikach dotyczą treści każdej strony
const WSPOLNE = ['src/layouts/', 'src/components/', 'src/site.js'];

const git = (root, ...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();

// Data ostatniego commita, który zmienił pliki strony (RRRR-MM-DD), albo null, gdy jej nie znamy.
// Vercel klonuje repozytorium płytko: commit na granicy klonu „dodaje” wszystkie pliki, więc jego data nic nie mówi.
const dataZmiany = (root) => {
  let granica = new Set();
  try {
    if (git(root, 'rev-parse', '--is-shallow-repository') === 'true') {
      granica = new Set(fs.readFileSync(path.resolve(root, git(root, 'rev-parse', '--git-path', 'shallow')), 'utf8').split('\n').filter(Boolean));
    }
  } catch {
    return () => null;
  }
  return (pliki) => {
    try {
      const [sha, data] = git(root, 'log', '-1', '--format=%H %cs', '--', ...pliki).split(' ');
      return sha && !granica.has(sha) ? data : null;
    } catch {
      return null;
    }
  };
};

// Pliki zmienione w ostatnim commicie (przy scaleniu preview na main: wszystko, co weszło ze scalenia), albo null
const zmienionePliki = (root) => {
  try {
    return git(root, 'diff', '--name-only', 'HEAD^1', 'HEAD').split('\n').filter(Boolean);
  } catch {
    return null;
  }
};

export default function poBuildzie() {
  let site = '';
  let root = '';
  return {
    name: 'po-buildzie',
    hooks: {
      'astro:config:done': ({ config }) => {
        site = String(config.site).replace(/\/$/, '');
        root = fileURLToPath(config.root);
      },
      'astro:build:done': async ({ dir, logger }) => {
        const DIST = fileURLToPath(dir);
        const errors = [];

        // ── Strony: plik HTML → czysty adres ──
        const files = [];
        const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).forEach((e) => {
          const p = path.join(d, e.name);
          if (e.isDirectory()) walk(p);
          else if (e.name.endsWith('.html')) files.push(p);
        });
        walk(DIST);
        const pages = files.map((file) => {
          const rel = path.relative(DIST, file).split(path.sep).join('/');
          const urlPath = rel === 'index.html' ? '/' : `/${rel.replace(/(\/index)?\.html$/, '')}`;
          const html = fs.readFileSync(file, 'utf8');
          return { rel, urlPath, html, isPage: urlPath !== '/404' && !/<meta\s+name="robots"\s+content="[^"]*\bnoindex\b/i.test(html) };
        });

        // ── Kontrola linków wewnętrznych i kotwic ──
        const ids = (html) => new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
        const byPath = Object.fromEntries(pages.map((p) => [p.urlPath, p]));
        for (const p of pages) {
          for (const m of p.html.matchAll(/\s(?:href|src)="(\/(?!\/)[^"]*)"/g)) {
            const [pathPart, anchor] = m[1].split('#');
            const clean = pathPart.split('?')[0];
            const target = byPath[clean];
            const exists = target || fs.existsSync(path.join(DIST, clean));
            if (!exists) errors.push(`${p.rel}: link do nieistniejącego adresu ${m[1]}`);
            if (anchor && target && !ids(target.html).has(anchor)) errors.push(`${p.rel}: brak kotwicy #${anchor} na ${clean}`);
          }
          for (const m of p.html.matchAll(/\shref="#([^"]+)"/g)) {
            if (!ids(p.html).has(m[1])) errors.push(`${p.rel}: brak kotwicy #${m[1]}`);
          }
        }
        if (errors.length) throw new Error('Build przerwany:\n- ' + errors.join('\n- '));

        // ── Content-Security-Policy w <meta> ──
        // Skrypty wpisane w HTML (bezpiecznik motywu w <head>, statystyki) przechodzą po skrócie SHA-256, liczonym tu przy każdym buildzie.
        // Zakaz osadzania w ramce (frame-ancestors) działa tylko w nagłówku, dlatego jest w vercel.json.
        for (const p of pages) {
          const skroty = [...p.html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)]
            .filter(([, attrs]) => !/\ssrc=|application\/ld\+json/.test(attrs))
            .map(([, , kod]) => `'sha256-${crypto.createHash('sha256').update(kod).digest('base64')}'`);
          const csp = [
            "default-src 'self'",
            `script-src 'self' ${[...new Set(skroty)].join(' ')}`.trim(),
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data:",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
          ].join('; ');
          p.html = p.html.replace('<meta charset="utf-8">', `<meta charset="utf-8">\n<meta http-equiv="Content-Security-Policy" content="${csp}">`);
          fs.writeFileSync(path.join(DIST, p.rel), p.html);
        }

        // ── SEO ──
        // <lastmod> tylko z prawdziwą datą zmiany strony; data builda zmieniałaby się przy każdym wdrożeniu
        const zmiana = dataZmiany(root);
        const indexed = pages.filter((p) => p.isPage).sort((a, b) => (a.urlPath === '/' ? -1 : b.urlPath === '/' ? 1 : a.urlPath.localeCompare(b.urlPath)));
        fs.writeFileSync(path.join(DIST, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexed
          .map((p) => {
            const data = zmiana(zrodla(p.urlPath));
            return `  <url><loc>${site}${p.urlPath}</loc>${data ? `<lastmod>${data}</lastmod>` : ''}</url>`;
          }).join('\n')}\n</urlset>\n`);
        fs.writeFileSync(path.join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${site}/sitemap.xml\n`);

        // ── IndexNow: tylko przy wdrożeniu produkcji na Vercelu, tylko podstrony, których pliki się zmieniły ──
        if (process.env.VERCEL_ENV === 'production') {
          const pliki = zmienionePliki(root) || [];
          const urls = indexed
            .filter((p) => pliki.some((f) => WSPOLNE.some((w) => f.startsWith(w)) || zrodla(p.urlPath).some((z) => f.startsWith(z))))
            .map((p) => site + p.urlPath);
          if (urls.length) await zglosIndexNow(site, urls, logger);
        }

        let total = 0;
        const size = (d) => fs.readdirSync(d, { withFileTypes: true }).forEach((e) => (e.isDirectory() ? size(path.join(d, e.name)) : (total += fs.statSync(path.join(d, e.name)).size)));
        size(DIST);
        logger.info(`dist/ gotowe: ${pages.length} stron, ${indexed.length} w sitemap.xml, ${Math.round(total / 1024)} KB, linki i kotwice w porządku`);
      },
    },
  };
}
