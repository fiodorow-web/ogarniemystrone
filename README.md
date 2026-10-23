# ogarniemystrone.pl

Strona marki Ogarniemy Stronę.

| Plik / folder | Co to jest |
| --- | --- |
| `CLAUDE.md` | Zasady projektu dla Claude Code: wymagania, lista kontrolna, rzeczy do zrobienia |
| `BRANDBOOK.md` | Brandbook: logo, kolory, kroje, ruch, komponenty, głos marki |
| `SPRZEDAZ.md` | Układ sprzedażowy: zasady psychologiczne ze źródłami, fakty o współpracy, czego brakuje |
| `PROMPT.md` | Pierwsza wiadomość do Claude Code |
| `brand/` | Logo i sygnet w SVG i PNG |
| `src/` | Źródła strony (podstrony, style, skrypt, fonty) |
| `public/` | Pliki kopiowane bez zmian (favicon, obrazek do udostępniania, logo do stopki maila) |
| `tools/` | Build i podgląd lokalny |

## Podgląd

Wymaga Node.js 20 lub nowszego.

```
npm run dev
```

Strona będzie pod http://localhost:3000 i przebudowuje się po każdej zmianie w `src/` lub `public/`.

## Wdrożenie na Vercel

Ustawienia są w `vercel.json` (build `npm run build`, katalog `dist`, czyste adresy, nagłówki). Wystarczy zaimportować repozytorium w Vercelu. Domena: rekordy DNS ustawia się na SEOHOST. Rekordów poczty (MX, SPF, DKIM, DMARC) nie ruszamy.

Jeśli Claude Code przeniesie stronę na inną technologię, zaktualizuje ten plik.
