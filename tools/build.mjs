#!/usr/bin/env node
// Buduje stronę do dist/. Bez zależności – wystarczy Node 18+.
//
// src/pages/*.html     treść podstron (front matter + HTML wewnątrz <main>)
// src/partials/*.html  nagłówek, stopka i dane strukturalne strony głównej
// src/assets/          style, skrypt i fonty – w dist dostają skrót zawartości w nazwie
// public/              kopiowane bez zmian (favicon, og.png, logo do stopki maila)

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');

const SITE = {
  domain: 'https://ogarniemystrone.pl',
  name: 'Ogarniemy Stronę',
  author: 'Mateusz Fiodorow, Sebastian Herman',
  ogImageAlt: 'Ogarniemy Stronę – Ty robisz swoje, my ogarniemy stronę.',
  themeLight: '#f4f6f2',
  themeDark: '#0d120f',
};

const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const hash = (data) => crypto.createHash('sha256').update(data).digest('hex').slice(0, 8);
const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const out = (rel, data) => {
  const p = path.join(DIST, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, data);
};
const errors = [];

fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });
fs.cpSync(path.join(ROOT, 'public'), DIST, { recursive: true });

// ── Zasoby z hashem w nazwie (cache na rok, patrz vercel.json) ──
const assetMap = {};
for (const f of fs.readdirSync(path.join(SRC, 'assets/fonts'))) {
  const data = fs.readFileSync(path.join(SRC, 'assets/fonts', f));
  const name = f.replace(/\.woff2$/, `.${hash(data)}.woff2`);
  out(`assets/fonts/${name}`, data);
  assetMap[`/assets/fonts/${f}`] = `/assets/fonts/${name}`;
}
let css = read('src/assets/styles.css');
for (const [from, to] of Object.entries(assetMap)) css = css.split(`"${from}"`).join(`"${to}"`);
for (const m of css.matchAll(/url\("?(\/[^")]+)/g)) {
  if (!Object.values(assetMap).includes(m[1])) errors.push(`styles.css: brak pliku ${m[1]}`);
}
const cssUrl = `/assets/style.${hash(css)}.css`;
out(cssUrl, css);
const js = read('src/assets/app.js');
const jsUrl = `/assets/app.${hash(js)}.js`;
out(jsUrl, js);
const fontUrl = (name) => assetMap[`/assets/fonts/${name}.woff2`];

// ── Podstrony ──
const header = read('src/partials/header.html');
const footer = read('src/partials/footer.html');
const schemaHome = read('src/partials/schema-home.html').trim();

function parse(file) {
  const raw = read(`src/pages/${file}`);
  const m = raw.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) throw new Error(`${file}: brak front matter (---)`);
  const meta = {};
  for (const line of m[1].split('\n')) {
    const i = line.indexOf(':');
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  for (const k of ['title', 'description']) if (!meta[k]) errors.push(`${file}: brak pola ${k}`);
  return { meta, body: raw.slice(m[0].length) };
}

function head({ meta, url, file }) {
  const flag = (k) => meta[k] !== 'false';
  const L = [
    '<!doctype html>',
    '<html lang="pl" class="no-js">',
    '<head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">',
    `<title>${meta.title}</title>`,
    `<meta name="description" content="${esc(meta.description)}">`,
    ...(url ? [`<link rel="canonical" href="${url}">`, '<meta name="robots" content="index, follow">'] : ['<meta name="robots" content="noindex">']),
    `<meta name="author" content="${SITE.author}">`,
    '<meta name="color-scheme" content="light dark">',
    `<meta name="theme-color" content="${SITE.themeLight}" media="(prefers-color-scheme: light)">`,
    `<meta name="theme-color" content="${SITE.themeDark}" media="(prefers-color-scheme: dark)">`,
    '<meta property="og:type" content="website">',
    '<meta property="og:locale" content="pl_PL">',
    `<meta property="og:site_name" content="${SITE.name}">`,
    `<meta property="og:title" content="${esc(meta.og_title || meta.title)}">`,
    `<meta property="og:description" content="${esc(meta.description)}">`,
    ...(url ? [`<meta property="og:url" content="${url}">`] : []),
    `<meta property="og:image" content="${SITE.domain}/og.png">`,
    '<meta property="og:image:width" content="1200">',
    '<meta property="og:image:height" content="630">',
    `<meta property="og:image:alt" content="${esc(SITE.ogImageAlt)}">`,
    '<meta name="twitter:card" content="summary_large_image">',
    '<link rel="icon" type="image/svg+xml" href="/favicon.svg">',
    '<link rel="apple-touch-icon" href="/apple-touch-icon.png">',
    `<link rel="preload" href="${fontUrl('bricolage-grotesque')}" as="font" type="font/woff2" crossorigin>`,
    ...(flag('preload_serif') ? [`<link rel="preload" href="${fontUrl('fraunces-italic')}" as="font" type="font/woff2" crossorigin>`] : []),
    `<link rel="preload" href="${fontUrl('onest')}" as="font" type="font/woff2" crossorigin>`,
    `<link rel="stylesheet" href="${cssUrl}">`,
    "<script>(function(){var d=document.documentElement;d.className=d.className.replace('no-js','js');try{var t=localStorage.getItem('os-motyw');if(t==='dark'||t==='light')d.setAttribute('data-theme',t);}catch(e){}})();</script>",
    `<script src="${jsUrl}" defer></script>`,
  ];
  if (meta.schema === 'home') L.push(schemaHome);
  else if (meta.breadcrumb && url) {
    L.push(`<script type="application/ld+json">${JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Start', item: `${SITE.domain}/` },
        { '@type': 'ListItem', position: 2, name: meta.breadcrumb, item: url },
      ],
    })}</script>`);
  }
  L.push('</head>');
  return L.join('\n');
}

const markCurrent = (html, p) => (p ? html.split(`href="${p}"`).join(`href="${p}" aria-current="page"`) : html);

const files = fs.readdirSync(path.join(SRC, 'pages')).filter((f) => f.endsWith('.html')).sort();
const pages = [];
for (const file of files) {
  const { meta, body } = parse(file);
  const slug = file.replace(/\.html$/, '');
  const isPage = slug !== '404' && meta.index !== 'false';
  const urlPath = slug === 'index' ? '/' : `/${slug}`;
  const url = isPage ? SITE.domain + urlPath : null;
  let foot = markCurrent(footer, isPage ? urlPath : null);
  if (meta.foot_cta === 'false') foot = foot.replace(/ *<!-- foot-cta -->[\s\S]*?<!-- \/foot-cta -->\n/, '');
  const html = [
    head({ meta, url, file }),
    `<body data-page="${slug}">`,
    '',
    markCurrent(header, isPage ? urlPath : null).trimEnd(),
    '<main id="tresc" tabindex="-1">',
    body.trimEnd(),
    '</main>',
    '',
    foot.trimEnd(),
    '</body>',
    '</html>',
    '',
  ].join('\n');
  out(file, html);
  pages.push({ file, html, urlPath, isPage });
}

// ── Kontrola linków wewnętrznych i kotwic ──
const ids = (html) => new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
const byPath = Object.fromEntries(pages.map((p) => [p.urlPath, p]));
for (const p of pages) {
  for (const m of p.html.matchAll(/\s(?:href|src)="(\/(?!\/)[^"]*)"/g)) {
    const [pathPart, anchor] = m[1].split('#');
    const clean = pathPart.split('?')[0];
    const target = byPath[clean];
    const exists = target || fs.existsSync(path.join(DIST, clean));
    if (!exists) errors.push(`${p.file}: link do nieistniejącego adresu ${m[1]}`);
    if (anchor && target && !ids(target.html).has(anchor)) errors.push(`${p.file}: brak kotwicy #${anchor} na ${clean}`);
  }
  for (const m of p.html.matchAll(/\shref="#([^"]+)"/g)) {
    if (!ids(p.html).has(m[1])) errors.push(`${p.file}: brak kotwicy #${m[1]}`);
  }
}

// ── SEO ──
const today = new Date().toISOString().slice(0, 10);
const indexed = pages.filter((p) => p.isPage).sort((a, b) => (a.urlPath === '/' ? -1 : b.urlPath === '/' ? 1 : a.urlPath.localeCompare(b.urlPath)));
out('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexed
  .map((p) => `  <url><loc>${SITE.domain}${p.urlPath}</loc><lastmod>${today}</lastmod></url>`).join('\n')}\n</urlset>\n`);
out('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${SITE.domain}/sitemap.xml\n`);

if (errors.length) {
  console.error('Build przerwany:\n- ' + errors.join('\n- '));
  process.exit(1);
}
let total = 0;
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).forEach((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : (total += fs.statSync(path.join(d, e.name)).size)));
walk(DIST);
console.log(`dist/ gotowe: ${pages.length} stron, ${Math.round(total / 1024)} KB`);
