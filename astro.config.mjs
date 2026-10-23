// Konfiguracja Astro. Wynik to statyczne pliki w dist/ (Vercel: vercel.json).
import { defineConfig } from 'astro/config';
import poBuildzie from './tools/po-buildzie.mjs';

export default defineConfig({
  site: 'https://ogarniemystrone.pl',
  // /oferta → dist/oferta.html; adresy bez ukośnika na końcu (Vercel: cleanUrls)
  trailingSlash: 'never',
  build: {
    format: 'file',
    inlineStylesheets: 'never',
  },
  // Białe znaki zostają jak w źródle: spacje między elementami w tekstach są celowe
  compressHTML: false,
  devToolbar: { enabled: false },
  server: { port: 3000 },
  // sitemap.xml, robots.txt i kontrola linków wewnętrznych oraz kotwic
  integrations: [poBuildzie()],
});
