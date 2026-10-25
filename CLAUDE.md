# ogarniemystrone.pl

Strona firmowa marki **Ogarniemy Stronę**: strony internetowe dla małych firm i specjalistów z całej Polski. Właściciele to Mateusz Fiodorow i Sebastian Herman. Wszystkie treści na stronie są po polsku.

Zanim cokolwiek zmienisz, przeczytaj:
- `BRANDBOOK.md`: kolory, kroje, ruch, komponenty i głos marki. Wygląd i teksty muszą się z nim zgadzać.
- `SPRZEDAZ.md`: dlaczego sekcje, kafelki, pakiety i menu są ułożone właśnie tak (każda zasada ma źródło). Zawiera też zatwierdzone fakty o współpracy: bezpłatna rozmowa i wycena, odpowiedź do 24 h, płatność 50% po akceptacji projektu i 50% po zrobieniu strony.

## Technologia: Twój wybór

Wybrana technologia: **Astro 7** (szczegóły i powody w sekcji „Decyzje”). Poniższe zasady obowiązują przy każdej kolejnej zmianie stacku.

Stack wybierasz sam. Możesz zostać przy obecnym czystym HTML/CSS/JS albo przenieść stronę na framework, np. Astro, Next.js albo SvelteKit. Kryteria wyboru:
- spełnia wszystkie wymagania z sekcji „Wymagania stałe”;
- da się go łatwo utrzymać i rozwijać o kolejne podstrony, blog i realizacje;
- dobrze działa na Vercelu.

Po wyborze zapisz w sekcji „Decyzje” na dole tego pliku, co wybrałeś i dlaczego.

Jeśli zmieniasz technologię:
- Obecna wersja jest **wzorcem 1:1** dla wyglądu, treści i zachowania. Nie upraszczaj animacji ani interakcji przy przenosinach.
- Zostaw działającą obecną wersję do porównania, np. w historii git albo w folderze `reference/`. Usuń ją dopiero, gdy nowa przejdzie całą „Listę kontrolną zgodności”.
- Przenoś treści dosłownie. Teksty są dopracowane i zatwierdzone.

## Obecna implementacja

Astro 7: statyczne strony HTML, w przeglądarce nie ma JavaScriptu frameworka, tylko `app.js`. Wymaga Node 22.23+. Wersja sprzed przenosin (czysty HTML/CSS/JS) jest w gicie pod tagiem `wzorzec-html`.

```
src/pages/*.astro          podstrony; nazwa pliku = adres (oferta.astro → /oferta), treść w <Base …>
src/layouts/Base.astro     <head> (meta, canonical, OG, Twitter, JSON-LD, preload fontów, motyw bez mignięcia), nagłówek, <main>, stopka
src/components/            Header, Footer (z sekcją „Napisz. Resztę ogarniemy my.”), Loop (pętla), Arrow, Assure (zapewnienia),
                           Crumbs (ścieżka), Faq, CopyEmail, PriceFrom (sekcja „od 999 zł”)
src/content/realizacje/    realizacje: jeden plik .md na realizację; pola opisane w src/content.config.ts
src/site.js                dane firmy w jednym miejscu (e-mail, telefon, domena) i JSON-LD strony głównej
src/formularz/             formularz po stronie serwera: obsluga.js (sprawdzanie, ochrona przed spamem, wysyłka przez Resend),
                           maile.js (zgłoszenie do nas i potwierdzenie dla klienta)
api/kontakt.js             POST /api/kontakt: funkcja Vercela wołająca src/formularz/obsluga.js (reszta strony jest statyczna)
src/styles/styles.css      wszystkie style; tokeny na górze pliku
src/scripts/app.js         wszystkie interakcje; moduły uruchamiają się, tylko gdy ich element jest na stronie (trafia do dist bez zmian)
src/assets/fonts/          Bricolage Grotesque, Fraunces Italic, Onest (przycięte WOFF2 z polskimi znakami)
public/                    kopiowane bez zmian: favicon.svg, og.png, apple-touch-icon.png, stopka/
brand/                     logo i sygnet (SVG z krzywymi + PNG)
astro.config.mjs           konfiguracja (czyste adresy, compressHTML: false, integracja po buildzie)
tools/po-buildzie.mjs      po buildzie: sitemap.xml, robots.txt, kontrola linków wewnętrznych i kotwic
tools/serve.mjs            podgląd dist/ jak na Vercelu: czyste adresy, przekierowania .html i ukośnika, 404, kompresja
```

Polecenia:
- `npm run dev`: podgląd na http://localhost:3000, odświeża się po każdej zmianie;
- `npm run build`: buduje `dist/`. Build zatrzymuje się na zepsutym linku wewnętrznym albo na brakującej kotwicy;
- `npm run preview`: po buildzie podgląd `dist/` na http://localhost:4000 tak, jak poda go Vercel. Formularz działa tu naprawdę, tylko maile zamiast wysyłki zapisują się w `.podglad-maili/` (HTML i tekst). Po zmianie szablonów zrestartuj podgląd.

Właściwości `<Base>` (każda podstrona):
- obowiązkowe: `title`, `description`;
- opcjonalne:
  - `breadcrumb` (JSON-LD okruszków);
  - `ogTitle`;
  - `schema="home"`;
  - `footCta={false}` (bez sekcji „Napisz. Resztę ogarniemy my.”);
  - `preloadSerif={false}` (strona bez Fraunces);
  - `index={false}` (noindex, bez canonical i poza sitemap).

Jak dodać:
- **podstronę:** plik w `src/pages/` z `<Base>`; do menu tylko zgodnie z `SPRZEDAZ.md` (zasada 11, najwyżej 5 pozycji). Sitemap uzupełnia się sam;
- **realizację:** plik `.md` w `src/content/realizacje/`. Pola:
  - `nazwa`, `branza`, `rodzaj` (`wizytowka` | `podstrony` | `rezerwacje`), `kolejnosc`;
  - opcjonalnie `miasto`, `link`, `zdjecie`, `zdjecieTelefon`.

  `rodzaj` trafia do opisu pod nazwą („kilka podstron”). Link `https://…` otwiera się w nowej karcie ze strzałką „↗”.

  Zrzuty kładzie się obok pliku `.md` jako WebP:
  - `zdjecie`: komputer 1536 × 960 (przy 1440 px menu niektórych stron łamie się w dwóch wierszach);
  - `zdjecieTelefon`: telefon 390 × 844 @2x;
  - oba z górnej części strony głównej, z odrzuconym banerem cookies.

  Astro robi z nich AVIF w kilku rozmiarach. Kafel pokazuje stronę na komputerze, a na pierwszym planie tę samą stronę w ramce telefonu;
- **blog:** kolekcja `blog` w `src/content.config.ts` i strony w `src/pages/blog/`, przy pierwszym wpisie.

Przydatne szczegóły:
- `compressHTML: false` w `astro.config.mjs` musi zostać. Astro 7 domyślnie zwija białe znaki i usunąłby celowe spacje między elementami w tekstach.
- Tekst z twardymi spacjami przekazywany do komponentu w atrybucie (np. `<Faq q="Czy działacie w&nbsp;całej Polsce?">`) jest wstawiany jako HTML.
- Listy z `.map()` w `.astro` nie mają białych znaków między elementami. To nie ma znaczenia w kontenerach flex/grid i blokowych, ale w tekście ciągłym trzeba je dodać.
- `<body data-page="…">` ma nazwę pliku. Skrypt sprawdza tylko `kontakt` (dok na telefonie ukrywa tam przycisk CTA).
- `app.js` korzysta z kluczy przeglądarki:
  - `localStorage`: `os-motyw` (motyw), `os-szkic` (wersja robocza formularza), `os-lista` (lista „Co warto mieć pod ręką”);
  - `sessionStorage`: `os-zakres` (zakres z konfiguratora lub pakietu, który trafia do formularza na /kontakt).
- Klasa `no-js` na `<html>` zamienia się na `js` w pierwszym skrypcie w `<head>`. Bez JS wszystkie treści są widoczne.

## Wymagania stałe (niezależne od technologii)

1. **Hosting:** Vercel.
2. **Adresy URL bez zmian** (SEO):
   - `/`
   - `/oferta`
   - `/jak-pracujemy`
   - `/realizacje`
   - `/cennik` (z kotwicą `/cennik#konfigurator`)
   - `/o-nas`
   - `/kontakt`
   - `/polityka-prywatnosci`
   - bez `.html` i bez ukośnika na końcu
   - nieznany adres zwraca stronę 404 ze statusem 404 i `noindex`
3. **`/stopka/logo-stopka.png` i `/stopka/logo-stopka.gif`** muszą zawsze działać pod tymi adresami, bo korzystają z nich stopki wysłanych maili.
4. **SEO:** każda podstrona ma:
   - własne `title`, `description`, `canonical`;
   - Open Graph z `og.png` 1200 × 630;
   - Twitter `summary_large_image`;
   - JSON-LD: `ProfessionalService` na stronie głównej, `BreadcrumbList` na podstronach;
   - poza tym w serwisie są `sitemap.xml`, `robots.txt` i semantyczny HTML (jeden `h1` na stronę, landmarki, poprawna hierarchia nagłówków).
5. **Wydajność:**
   - podstrona waży około 150–250 KB;
   - fonty są lokalne, przycięte, z `preload` i `font-display: swap`;
   - nie ma zewnętrznych żądań (żadnego Google Fonts z CDN, zewnętrznych skryptów i widżetów);
   - zasoby mają długi cache z hashem w nazwie;
   - cel Lighthouse: 95+ we wszystkich kategoriach, bez przesunięć układu (CLS ≈ 0).
6. **Prywatność:** bez ciasteczek śledzących i bez analityki, która je ustawia. Polityka prywatności mówi to wprost. Statystyka to tylko Vercel Web Analytics (bez ciasteczek, skrypt z tej samej domeny), włączona za zgodą właścicieli, zob. „Decyzje”. Innej analityki nie dodajemy bez ich zgody.
7. **Dostępność:**
   - WCAG 2.1 AA;
   - pełna obsługa klawiaturą: link „Przejdź do treści”, widoczny fokus, pułapka fokusu w menu, Escape zamyka menu;
   - poprawne etykiety i komunikaty `aria-live`;
   - `prefers-reduced-motion` wyłącza ruch;
   - treść działa bez JavaScriptu;
   - elementy dotykowe mają co najmniej 48 × 48 px.
8. **Motywy:** jasny i ciemny według systemu, przełącznik w nagłówku, zapamiętany wybór bez mignięcia przy ładowaniu.
9. **Układ sprzedażowy z `SPRZEDAZ.md` zostaje zachowany** (kolejność sekcji i menu, pakiety malejąco z polecanym w środku, zapewnienia przy każdym CTA). Fakty o współpracy pojawiają się tylko w zatwierdzonym brzmieniu. Nie dodawaj fałszywej pilności, wymyślonych opinii ani statystyk.
10. **Telefon ma własne rozwiązania**, nie tylko ściśnięty układ komputerowy (szczegóły w brandbooku, sekcja 5). Na szerokości 360–430 px nic nie może przewijać się w bok.

## Lista kontrolna zgodności

Sprawdź po każdej większej zmianie, a przy zmianie technologii przed usunięciem starej wersji. Testuj na komputerze (1440 px) i telefonie (390 px), w jasnym i ciemnym motywie. W konsoli nie może być błędów.

- [ ] Wszystkie adresy z wymagań działają.
- [ ] Nieznany adres daje 404 z „Ups, tej strony nie ogarnęliśmy.”.
- [ ] Stare adresy z `.html` przekierowują na czyste.
- [ ] Menu w kolejności: Oferta, Realizacje, Jak pracujemy, O nas, Cennik, potem wypełniony przycisk „Umów rozmowę”. W menu mobilnym i w stopce kolejność jest ta sama.
- [ ] Nawigacja: aktywna pozycja menu ma `aria-current="page"` i szarą pętlę.
- [ ] Pętla rysuje się pod pozycją menu po najechaniu.
- [ ] Logo: pętla rysuje się przy wejściu, a kliknięcie logo rysuje ją ponownie.
- [ ] Strona główna:
  - pętla wokół „stronę.” w nagłówku;
  - litery nagłówka reagują na kursor;
  - naklejki „bałagan” układają się po przewinięciu i po kliknięciu „Ogarnij ten bałagan”;
  - działają liczniki, „Zmień godziny”, „Sprawdź jeszcze raz” i animowane słowa;
  - telefon w pierwszym kafelku: po wjechaniu w ekran rysuje się trasa i spada pinezka, „Otwarte teraz” zgadza się z zegarem, „Zadzwoń na próbę” (i „Zadzwoń” na ekranie telefonu) pokazuje ekran połączenia;
  - pod przyciskami w hero są trzy zapewnienia (bezpłatna rozmowa i wycena, najpierw projekt, odpowiedź do 24 h);
  - kolejność sekcji: hero → kafelki → zdanie „Ty skupiasz się…” → cztery kroki (bez dopisków o płatności, zob. „Decyzje”) → „Strona już od 999 zł” (bez ramki o płatności, zob. „Decyzje”) → „Częste pytania” → końcowe CTA z zapewnieniami (sekcja „Kto ogarnie Twoją stronę” jest tylko w O nas, zob. „Decyzje”).
- [ ] Między podstronami jest płynne przejście, a nagłówek się nie przeładowuje wizualnie.
- [ ] Konfigurator na `/cennik#konfigurator`:
  - przewija się pod nagłówek;
  - po trzech odpowiedziach pokazuje pakiet;
  - „Wyślij zapytanie z tym zakresem” przenosi na /kontakt z wypełnioną wiadomością.
- [ ] Cennik:
  - pakiety od lewej: Firma z rezerwacjami, Firma (wyróżniona, „Polecamy na start”, jedyny wypełniony przycisk), Wizytówka;
  - pod pakietami jest pasek „Najpierw projekt, potem płatność” (0 zł → 50% → 50%);
  - FAQ zaczyna się od ceny i kończy pytaniem „Co, jeśli projekt mi się nie spodoba?”.
- [ ] „Zapytaj o ten pakiet” przy każdym pakiecie wypełnia wiadomość na /kontakt.
- [ ] Realizacje: wszystkie kafle od razu pod nagłówkiem, bez filtrów (zob. „Decyzje”); kafel z linkiem `https://…` otwiera się w nowej karcie.
- [ ] Formularz:
  - wymagane są tylko imię i e-mail albo telefon, reszta pól ma dopisek „(opcjonalnie)”;
  - pod przyciskiem są zapewnienia (odpowiedź do 24 h, bezpłatna rozmowa i wycena);
  - przywraca wersję roboczą;
  - pokazuje błędy „Błąd: …” przy polach i trzęsie polem;
  - podczas wysyłki przycisk pokazuje „Ogarniamy…”;
  - po wysłaniu pokazuje „Dziękujemy, {imię}.”;
  - przy błędzie wysyłki pokazuje komunikat z adresem e-mail;
  - „Wyczyść formularz” działa;
  - po wysłaniu do `kontakt@` przychodzi zgłoszenie, a klient, który podał e-mail, dostaje potwierdzenie (sprawdź w `.podglad-maili/`);
  - bez JavaScriptu formularz też się wysyła i pokazuje `/dziekujemy`.
- [ ] Przyciski „kopiuj” przy e-mailu kopiują adres i pokazują potwierdzenie.
- [ ] FAQ się rozwija, lista „Co warto mieć pod ręką” zapamiętuje zaznaczenia.
- [ ] Przycisk „do góry” pokazuje postęp przewijania.
- [ ] Telefon:
  - dok „Menu” jest na dole, a CTA pojawia się w doku, gdy przycisk w pierwszym ekranie zniknie z widoku (na /kontakt CTA w doku się nie pojawia);
  - menu na cały ekran otwiera się kołem od przycisku;
  - powrót wstecz zostawia menu zamknięte;
  - działa karuzela kafli.
- [ ] Motyw: przełącznik działa i wybór przechodzi między podstronami.
- [ ] `prefers-reduced-motion: reduce`: brak ruchu, cała treść widoczna.
- [ ] Bez JavaScriptu: cała treść jest widoczna i linki działają.

## Do zrobienia

1. **Formularz: podłączyć Resend** (kod jest gotowy, zob. „Decyzje”). Kroki właścicieli:
   - konto w Resend, domena `wiadomosci.ogarniemystrone.pl` w regionie Ireland (`eu-west-1`);
   - rekordy DNS z zakładki Records w Resend dodać w panelu SEOHOST. To są nowe rekordy pod `wiadomosci`: TXT `resend._domainkey.wiadomosci` (DKIM) oraz CNAME `rsend.wiadomosci` i `send.wiadomosci` (wysyłka). Istniejących rekordów poczty nie zmieniamy, a „Enable Receiving” w Resend zostaje wyłączone;
   - klucz API z uprawnieniem tylko do wysyłki i tylko dla tej domeny;
   - w Vercelu (Settings → Environment Variables, Production i Preview) zmienna `RESEND_API_KEY`. Opcjonalnie `FORMULARZ_DO` i `FORMULARZ_OD`, opis w `src/formularz/obsluga.js`;
   - test na podglądzie Vercela przed produkcją: zgłoszenie z e-mailem, z telefonem i bez JavaScriptu.
2. **Treści do uzupełnienia** (zapytaj właścicieli, nie wymyślaj):
   - `[Zakres do ustalenia]`;
   - `[Czas realizacji – do uzupełnienia]` (`jak-pracujemy`, FAQ w `cennik`);
   - realizacje ACS i W Dobrej Formie są jeszcze na adresach `*.vercel.app`: po starcie ich stron podmienić `link` w `src/content/realizacje/acs.md` i `w-dobrej-formie.md` (zrzuty też warto zrobić od nowa);
   - zdjęcia zespołu w `o-nas` już są (`src/assets/zespol/`), opisy obu też; większy plik Sebastiana (ma 768 px szerokości, ramka na retinie potrzebuje ok. 920 px) poprawiłby ostrość;
   - `[Dane administratora – do uzupełnienia]` w polityce prywatności.
3. **Opinie klientów:** gdy pojawią się pierwsze, dodaj je według `SPRZEDAZ.md` („Czego jeszcze brakuje”). Tylko prawdziwe, z linkiem do Google.
4. **Wdrożenie:**
   - domena jest zarejestrowana w Zenboxie, DNS i poczta są na SEOHOST;
   - rekordy zmienia się tylko w panelu SEOHOST, bo w rejestrze .pl domena ma serwery nazw `ns1.seohost.pl` i `ns2.seohost.pl` (stan z 2026-10-25). Strefa DNS w panelu Zenboxu jest nieaktywna i jej zmiany nic nie dają;
   - poczta nie zależy od rekordu A domeny: MX wskazuje `mail.ogarniemystrone.pl` (osobny rekord A), a SPF to `redirect=_spf-h22.microhost.pl`;
   - przy podpinaniu domeny do Vercela dodaj tylko rekordy, które poda Vercel (apex i `www`);
   - **nigdy nie zmieniaj rekordów MX, SPF, DKIM ani DMARC**, bo od nich zależy firmowa poczta. Wyjątek na prośbę właścicieli (podłączenie Resend, 2026-10-25): nowe rekordy pod subdomeną `wiadomosci`, które nie zmieniają istniejących;
   - przed wdrożeniem na produkcję zawsze zapytaj (zob. „Gałęzie” w „Zasadach pracy”).

## Zasady pracy

- Teksty piszesz po polsku według brandbooka, sekcja 8:
  - zwracasz się do czytelnika na „Ty”, nigdy „Państwo”;
  - nie zawężasz przekazu do jednej branży;
  - nie używasz słowa „studio” ani nawiązań do fotografii;
  - stosujesz twarde spacje po jednoliterowych słowach.
- Nie zmieniaj palety, krojów, logo ani pętli bez zgody. Jeśli coś w brandbooku przeszkadza, zaproponuj zmianę.
- Nie dodawaj przewijanych pasków (marquee), emoji jako punktorów ani zdjęć stockowych.
- Po każdej zmianie: zbuduj, uruchom podgląd i sprawdź zmienione miejsca na komputerze i telefonie w obu motywach.
- Commituj małymi krokami z opisem po polsku.
- **Gałęzie:**
  - `preview` to wersja testowa: każdy push buduje na Vercelu podgląd pod stałym adresem gałęzi (Vercel → Deployments, gałąź `preview`). Tu trafiają wszystkie commity;
  - `main` to produkcja (ogarniemystrone.pl): każdy push od razu wdraża stronę. Zmiany z `preview` przenosisz na `main` tylko wtedy, gdy właściciele napiszą wprost, że mają trafić na produkcję. Wysyłasz wtedy dokładnie to, co zaakceptowali, a potem `preview` dalej idzie od `main`;
  - nie commituj bezpośrednio na `main`.

## Decyzje

### 2026-10-25: Opis Mateusza w O nas wspomina fotografię
- **Co:** w opisie Mateusza jest „W weekendy zamieniam klawiaturę na aparat i fotografuję różne eventy.”.
- **Odejście od brandbooka** (sekcja 8: bez nawiązań do fotografii): świadoma decyzja Mateusza. To jego osobisty opis, a nie przekaz marki. Poza tym zdaniem zasada nadal obowiązuje.

### 2026-10-25: Ceny, opieka i strona główna
- **Ceny pakietów:** Wizytówka od 999 zł, Firma od 1 999 zł, Firma z rezerwacjami od 2 999 zł (cennik i konfigurator w `src/scripts/app.js`).
- **Opieka po starcie:** 59 zł miesięcznie. W cenniku pod pakietami jest pasek „Opieka po starcie” i dopisek w FAQ „Kto dba o to, żeby strona działała?”. Opis opieki składa się tylko z tego, co strona już obiecywała (działa, jest bezpieczna, kopie zapasowe robimy my).
- **„Odpowiedź do 24 h”** bez „w dni robocze”: w zapewnieniach, na kontakcie, na `/dziekujemy`, w mailach, w BRANDBOOK.md i SPRZEDAZ.md. Termin w zgłoszeniu do nas to teraz 24 h od wysłania, także w weekend (`terminOdpowiedzi` w `src/formularz/maile.js`).
- **Sekcja „od 999 zł”** (strona główna i oferta, komponent `PriceFrom`): bez ramki „Najpierw projekt, potem płatność”. Na stronie głównej dopisek „Strona już od” i akapit o nowoczesnych stronach zgodnych ze standardami 2026 roku, z przemyślanym układem (UX) i treściami pod Google (SEO). Bez obietnic pozycji w Google (BRANDBOOK.md, sekcja 8).
- **Kafel „Szybka nawet w terenie”:** „Dbamy o optymalizację strony i każdego zdjęcia, więc otwiera się szybko nawet przy słabym zasięgu.”
- **Kafel „Wygodna na telefonie”:** zamiast szarych pasków telefon pokazuje mini stronę firmy: baner, przyciski Zadzwoń / Dojazd / Napisz, „Otwarte teraz” według zegara odwiedzającego, trasę na mapie i ekran próbnego połączenia.
- **Dlaczego:** decyzja właścicieli.

### 2026-10-25: Realizacje bez filtrów
- **Co:** na `/realizacje` nie ma już chipów „Wszystkie / Wizytówki / Kilka podstron / Z rezerwacjami” z licznikami ani pustego stanu „Tu jeszcze pusto.”. Kafle stoją od razu pod nagłówkiem. Przechylanie kafla za kursorem zostało.
- **Dlaczego:** decyzja właścicieli. Na razie są tylko 4 realizacje do pokazania.
- **Co zostaje:** pole `rodzaj` w realizacjach (opis pod nazwą), więc filtry da się przywrócić bez uzupełniania danych.
- **Powrót:** gdy realizacji będzie więcej i w różnych rodzajach. Chipy, pusty stan, style i skrypt są w commicie, który je usunął.

### 2026-10-25: Statystyki odwiedzin: Vercel Web Analytics
- **Co:**
  - na końcu `<body>` w `src/layouts/Base.astro` jest `inject()` z paczki `@vercel/analytics`;
  - skrypt ładuje się z tej samej domeny (`/_vercel/insights/script.js` albo ścieżka, którą Vercel poda w `PUBLIC_VERCEL_OBSERVABILITY_BASEPATH`), więc nie ma zewnętrznych żądań;
  - lokalny podgląd (`tools/serve.mjs`) zwraca pod `/_vercel/` pusty skrypt.
- **Dlaczego nie komponent `@vercel/analytics/astro`:** przy `build.format: 'file'` zapisywałby adresy plików (`/oferta.html`) zamiast adresów z paska (`/oferta`). Wstawiałby też własny znacznik HTML, który w `<head>` psuje dokument.
- **Prywatność:** bez ciasteczek; odwiedzającego rozpoznaje skrót z zapytania usuwany po 24 h. Polityka prywatności (sekcja „Ciasteczka i statystyki”) opisuje, co się zapisuje.
- **Dlaczego:** decyzja właścicieli (włączyli Web Analytics w Vercelu).

### 2026-10-25: Formularz przez Resend, jako funkcja w `api/`
- **Co:**
  - `POST /api/kontakt` to funkcja Vercela w `api/kontakt.js`, a logika jest w `src/formularz/`. Strona zostaje statyczna, bez adaptera Astro, więc `vercel.json`, czyste adresy i 404 działają jak dotąd;
  - zgłoszenie idzie na `kontakt@ogarniemystrone.pl` z „Odpowiedz do” ustawionym na klienta. Dalsza rozmowa idzie zwykłą pocztą z `kontakt@` (SEOHOST), bez Resend;
  - odpisywać można przyciskiem „Odpisz” (nowy mail z cytatem wiadomości klienta, ucinanym do 500 znaków) albo zwykłym „Odpowiedz”. Klient może zobaczyć zgłoszenie w cytacie, dlatego temat („Zapytanie ze strony: …”) i dopiski są neutralne, bez wewnętrznych uwag;
  - klient, który podał e-mail, dostaje potwierdzenie z czterema krokami i zatwierdzonymi zdaniami o płatności;
  - nadawca to `formularz@wiadomosci.ogarniemystrone.pl`.
- **Dlaczego Resend, a nie SMTP SEOHOST:**
  - lepsza dostarczalność potwierdzeń do obcych skrzynek;
  - podgląd wysłanych maili w panelu Resend;
  - wysyłka przez zwykłe zapytanie HTTPS, bez hasła do skrzynki w Vercelu.

  Osobna subdomena chroni reputację głównej domeny, z której idzie firmowa poczta.
- **Ochrona przed spamem** (bez ciasteczek i reCAPTCHA):
  - pole-pułapka;
  - czas wypełnienia: przy mniej niż 3 s zgłoszenie dostajemy z dopiskiem „[możliwy spam]”, a klient nie dostaje potwierdzenia;
  - limit 5 zgłoszeń na 15 minut z jednego IP;
  - odrzucanie zapytań z obcych stron.

  Potwierdzenie nie powtarza treści wiadomości, a imię nie może zawierać linków, więc formularza nie da się użyć do wysyłania spamu na cudze adresy.
- **Bez JavaScriptu:** formularz wysyła się zwykłym POST-em i przekierowuje na `/dziekujemy` (noindex, poza sitemap).
- **Polityka prywatności:** dopisany Resend (Plus Five Five, Inc., USA), standardowe klauzule umowne, EU-U.S. DPF i 15 minut pamiętania IP. Umowa powierzenia (DPA) obowiązuje od akceptacji regulaminu Resend.

### 2026-10-25: Bez Białegostoku na stronie
- **Co:** strona nie mówi, skąd jesteśmy:
  - zdanie na górze O nas i opis O nas dla Google;
  - stopka: „Strony internetowe dla małych firm i specjalistów z całej Polski.”;
  - FAQ na stronie głównej i w cenniku: „Czy działacie w całej Polsce?” zamiast „Czy działacie tylko w Białymstoku?”;
  - JSON-LD strony głównej bez adresu i współrzędnych (zostaje `areaServed`: Polska).

  Wcześniej zniknęła też sekcja „Białystok. Stąd robimy strony…” z O nas.
- **Dlaczego:** decyzja właścicieli. To nie jest firma lokalna, tylko praca zdalna dla całej Polski.

### 2026-10-25: Stopka bez „Bez ciasteczek śledzących · Ta podstrona waży ok. X KB”
- **Co:** w dolnym pasku stopki zostały tylko „© 2026 Ogarniemy Stronę” i link do polityki prywatności. Skrypt liczący wagę podstrony usunięty.
- **Dlaczego:** decyzja właścicieli.
- **Co zostaje:** strona nadal nie używa ciasteczek śledzących, mówi o tym polityka prywatności. Wagę podstrony sprawdzamy narzędziami (DevTools, Lighthouse), cel 150–250 KB się nie zmienia.

### 2026-10-25: „Po akceptacji projektu” zamiast „gdy projekt Ci się spodoba”
- **Co:** zatwierdzone brzmienie faktu o płatności to teraz „Połowa kwoty po akceptacji projektu”. Zmienione:
  - ramka w sekcji „od 999 zł”;
  - pasek i FAQ w cenniku;
  - FAQ na stronie głównej;
  - „Co będzie dalej” na kontakcie;
  - Jak pracujemy;
  - BRANDBOOK.md i SPRZEDAZ.md.

  Pytanie „Co, jeśli projekt mi się nie spodoba?” zostaje, bo to słowa klienta.
- **Dlaczego:** decyzja właścicieli, brzmi konkretniej.

### 2026-10-25: Strona główna bez dopisków o płatności przy krokach
- **Co:** przy „Cztery kroki, zero niespodzianek” nie ma już pigułek „Bezpłatnie, z wyceną”, „Połowa kwoty po akceptacji projektu” i „Druga połowa po zrobieniu strony”.
- **Dlaczego:** decyzja właścicieli.
- **Odejście od `SPRZEDAZ.md`, zasada 8:** na stronie głównej płatność jest tylko w zapewnieniu „Najpierw projekt, potem płatność” i w FAQ (ramka w sekcji „od 999 zł” też zniknęła, zob. „Ceny, opieka i strona główna”). Pigułki zostały w „Jak pracujemy” i w mailu z potwierdzeniem dla klienta.

### 2026-10-25: Zdjęcia zespołu
- **Co:** w O nas są portrety Mateusza i Sebastiana od właścicieli (pliki w `src/assets/zespol/`, Astro robi z nich AVIF).
- **Kadr:** ramka 4:5. Część zdjęcia, która jest widoczna, ustawia `--kadr` (object-position) w `src/pages/o-nas.astro`.

### 2026-10-25: Na razie bez kafla „Rezerwacje online”
- **Co:** ze strony głównej zniknął kafel „04 · rezerwacje” z przykładowymi terminami. Zostało 5 kafli: dolny rząd to „Szybka nawet w terenie” i „Kopie zapasowe robimy my” (5 + 7 kolumn).
- **Dlaczego:** decyzja właścicieli, na razie nie pokazujemy rezerwacji online.
- **Gdzie rezerwacje jeszcze są** (bez zmian, czekają na decyzję):
  - pakiet „Firma z rezerwacjami” w cenniku;
  - pytanie o rezerwacje w konfiguratorze;
  - dodatek w ofercie;
  - temat „Rezerwacje online” w formularzu;
  - `rodzaj: rezerwacje` w realizacjach (filtrów na razie nie ma).
- **Powrót:** kafel, jego style i skrypt są w commicie, który go usunął.

### 2026-10-25: Bez słowa „żargon”
- **Co:**
  - na stronie głównej „Cztery kroki, zero niespodzianek”;
  - w O nas „Konkretnie i po ludzku”;
  - w Jak pracujemy „Teksty piszemy prostym językiem, zrozumiałym dla Twoich klientów.”.
- **Dlaczego:** właścicielom nie pasowało słowo „żargon”.

<!-- Tu zapisuj ważne decyzje: wybór technologii, sposób wysyłki formularza, zmiany w brandbooku. Data, co, dlaczego. -->

### 2026-10-23: „Kto ogarnie Twoją stronę” tylko w O nas
- **Co:** sekcja z Mateuszem i Sebastianem zniknęła ze strony głównej. Zespół jest na `/o-nas`, do której prowadzi menu.
- **Dlaczego:** decyzja właścicieli.
- **Odejście od `SPRZEDAZ.md`:**
  - zasada 9 („Prawdziwi ludzie na stronie głównej”) nie dotyczy już strony głównej;
  - w zasadzie 3 krok „kto” jest teraz w O nas.
  - Opinie klientów (gdy będą) trafią na stronie głównej między „Cztery kroki” a „od 999 zł”, a nie przed nieistniejącą już sekcją zespołu.

### 2026-10-23: Astro 7 zamiast czystego HTML/CSS/JS
- **Co:** Astro 7.4, wynik statyczny (`build.format: 'file'`, `trailingSlash: 'never'`, `compressHTML: false`). Na Vercelu `vercel.json`: `cleanUrls`, `trailingSlash: false`, rok cache dla `/_astro/`.
- **Dlaczego:**
  - każda podstrona to osobny plik HTML bez JavaScriptu frameworka, więc natywne przejścia między podstronami (`@view-transition`), `app.js` i działanie bez JS zostają bez zmian;
  - powtarzalne kawałki są komponentami zamiast kopiowanego HTML-a;
  - realizacje (a później blog) to kolekcje treści ze sprawdzanym schematem;
  - Astro ma wbudowaną optymalizację zdjęć na czas, gdy dojdą zdjęcia i zrzuty;
  - Vercel obsługuje Astro bez konfiguracji, a formularz może być funkcją w tym samym projekcie.
- **Odrzucone:**
  - Next.js: React na każdej stronie (ok. 90 KB JS) i nawigacja po stronie klienta, która gryzie się z przejściami i `app.js`;
  - SvelteKit: trzeba by go przestawiać, żeby działał jak zwykła strona;
  - czysty HTML: blog i realizacje wymagałyby własnego systemu treści.
- **Minusy:**
  - zależność do aktualizowania (`astro`);
  - Astro 7 domyślnie zwija białe znaki, dlatego jest `compressHTML: false`;
  - kontrola linków i podgląd jak na Vercelu to własne skrypty w `tools/`.
- **Zgodność ze wzorcem** (`wzorzec-html`), sprawdzona przed scaleniem:
  - HTML wszystkich 9 stron po normalizacji jest identyczny;
  - 36 zrzutów (1440 i 390 px, jasny i ciemny motyw) jest identycznych co do piksela;
  - test „Listy kontrolnej zgodności” w przeglądarce przechodzi 52/52;
  - Lighthouse daje 96–100 we wszystkich kategoriach, CLS ≤ 0,008;
  - podstrona waży 157–160 KB po kompresji.
