# ogarniemystrone.pl

Strona marki Ogarniemy Stronę. Zbudowana w [Astro](https://astro.build) jako statyczne strony HTML.

| Plik / folder | Co to jest |
| --- | --- |
| `CLAUDE.md` | Zasady projektu dla Claude Code: wymagania, lista kontrolna, rzeczy do zrobienia, decyzje |
| `BRANDBOOK.md` | Brandbook: logo, kolory, kroje, ruch, komponenty, głos marki |
| `SPRZEDAZ.md` | Układ sprzedażowy: zasady psychologiczne ze źródłami, fakty o współpracy, czego brakuje |
| `PROMPT.md` | Pierwsza wiadomość do Claude Code |
| `brand/` | Logo i sygnet w SVG i PNG |
| `src/pages/` | Podstrony: nazwa pliku = adres (`oferta.astro` → `/oferta`) |
| `src/components/`, `src/layouts/` | Nagłówek, stopka, wspólne kawałki stron i układ z `<head>` |
| `src/content/realizacje/` | Realizacje: jeden plik `.md` na realizację |
| `src/site.js` | Dane firmy: e-mail, telefon, domena |
| `src/styles/`, `src/scripts/`, `src/assets/fonts/` | Style, skrypt z interakcjami, fonty |
| `public/` | Pliki kopiowane bez zmian (favicon, obrazek do udostępniania, logo do stopki maila) |
| `tools/` | Sitemap, robots i kontrola linków po buildzie; podgląd jak na Vercelu |

## Podgląd

Wymaga Node.js 22.23 lub nowszego. Za pierwszym razem: `npm install`.

```
npm run dev       # http://localhost:3000, odświeża się po każdej zmianie
npm run build     # buduje dist/; zatrzymuje się na zepsutym linku albo brakującej kotwicy
npm run preview   # http://localhost:4000, dist/ tak, jak poda go Vercel
```

## Wdrożenie na Vercel

Ustawienia są w `vercel.json`: framework Astro, build `npm run build`, katalog `dist`, czyste adresy bez ukośnika, nagłówki i długi cache dla `/_astro/`. Wystarczy zaimportować repozytorium w Vercelu. Domena: rekordy DNS ustawia się na SEOHOST. Rekordów poczty (MX, SPF, DKIM, DMARC) nie ruszamy.

Wersja sprzed przenosin na Astro (czysty HTML/CSS/JS) jest w gicie pod tagiem `wzorzec-html`.
