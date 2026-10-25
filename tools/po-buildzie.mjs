// Integracja Astro uruchamiana po zbudowaniu dist/:
// - sitemap.xml ze wszystkich stron, które nie mają noindex,
// - robots.txt,
// - kontrola linków wewnętrznych i kotwic: zepsuty link zatrzymuje build.

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// Pliki źródłowe strony: z nich bierze się data zmiany do <lastmod>
const zrodla = (urlPath) => {
  const nazwa = urlPath === '/' ? 'index' : urlPath.slice(1);
  return [`src/pages/${nazwa}.astro`, ...(nazwa === 'realizacje' ? ['src/content/realizacje'] : [])];
};

// Data ostatniego commita, który zmienił pliki strony (RRRR-MM-DD), albo null, gdy jej nie znamy.
// Vercel klonuje repozytorium płytko: commit na granicy klonu „dodaje” wszystkie pliki, więc jego data nic nie mówi.
const dataZmiany = (root) => {
  const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  let granica = new Set();
  try {
    if (git('rev-parse', '--is-shallow-repository') === 'true') {
      granica = new Set(fs.readFileSync(path.resolve(root, git('rev-parse', '--git-path', 'shallow')), 'utf8').split('\n').filter(Boolean));
    }
  } catch {
    return () => null;
  }
  return (pliki) => {
    try {
      const [sha, data] = git('log', '-1', '--format=%H %cs', '--', ...pliki).split(' ');
      return sha && !granica.has(sha) ? data : null;
    } catch {
      return null;
    }
  };
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
      'astro:build:done': ({ dir, logger }) => {
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

        let total = 0;
        const size = (d) => fs.readdirSync(d, { withFileTypes: true }).forEach((e) => (e.isDirectory() ? size(path.join(d, e.name)) : (total += fs.statSync(path.join(d, e.name)).size)));
        size(DIST);
        logger.info(`dist/ gotowe: ${pages.length} stron, ${indexed.length} w sitemap.xml, ${Math.round(total / 1024)} KB, linki i kotwice w porządku`);
      },
    },
  };
}
