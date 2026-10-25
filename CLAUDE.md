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
- `npm run preview`: po buildzie podgląd `dist/` na http://localhost:4000 tak, jak poda go Vercel.

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
- **realizację:** plik `.md` w `src/content/realizacje/` (`nazwa`, `miasto`, `branza`, `rodzaj`: `wizytowka` | `podstrony` | `rezerwacje`, `kolejnosc`, opcjonalnie `link`). Liczniki filtrów liczą się same. Zdjęcia: dodać pole `zdjecie` i `<Image>` z `astro:assets` przy pierwszym prawdziwym zrzucie;
- **blog:** kolekcja `blog` w `src/content.config.ts` i strony w `src/pages/blog/`, przy pierwszym wpisie.

Przydatne szczegóły:
- `compressHTML: false` w `astro.config.mjs` musi zostać. Astro 7 domyślnie zwija białe znaki i usunąłby celowe spacje między elementami w tekstach.
- Tekst z twardymi spacjami przekazywany do komponentu w atrybucie (np. `<Faq q="Czy działacie tylko w&nbsp;Białymstoku?">`) jest wstawiany jako HTML.
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
6. **Prywatność:** bez ciasteczek śledzących i bez analityki, która je ustawia. Stopka obiecuje to wprost. Jeśli kiedyś będzie potrzebna statystyka, tylko bez ciasteczek (np. Vercel Web Analytics) i po zgodzie właścicieli.
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
  - pod przyciskami w hero są trzy zapewnienia (bezpłatna rozmowa i wycena, najpierw projekt, odpowiedź do 24 h);
  - kolejność sekcji: hero → kafelki → zdanie „Ty skupiasz się…” → cztery kroki z pigułkami płatności → „od 999 zł” z ramką „Najpierw projekt, potem płatność” → „Częste pytania” → końcowe CTA z zapewnieniami (sekcja „Kto ogarnie Twoją stronę” jest tylko w O nas, zob. „Decyzje”).
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
- [ ] Realizacje: filtry z licznikami i pusty stan „Tu jeszcze pusto.” dla filtra bez wyników.
- [ ] Formularz:
  - wymagane są tylko imię i e-mail albo telefon, reszta pól ma dopisek „(opcjonalnie)”;
  - pod przyciskiem są zapewnienia (odpowiedź do 24 h, bezpłatna rozmowa i wycena);
  - przywraca wersję roboczą;
  - pokazuje błędy „Błąd: …” przy polach i trzęsie polem;
  - podczas wysyłki przycisk pokazuje „Ogarniamy…”;
  - po wysłaniu pokazuje „Dziękujemy, {imię}.”;
  - przy błędzie wysyłki pokazuje komunikat z adresem e-mail;
  - „Wyczyść formularz” działa.
- [ ] Przyciski „kopiuj” przy e-mailu kopiują adres i pokazują potwierdzenie.
- [ ] FAQ się rozwija, lista „Co warto mieć pod ręką” zapamiętuje zaznaczenia.
- [ ] Przycisk „do góry” pokazuje postęp przewijania.
- [ ] Stopka pokazuje „Ta podstrona waży ok. X KB”.
- [ ] Telefon:
  - dok „Menu” jest na dole, a CTA pojawia się w doku, gdy przycisk w pierwszym ekranie zniknie z widoku (na /kontakt CTA w doku się nie pojawia);
  - menu na cały ekran otwiera się kołem od przycisku;
  - powrót wstecz zostawia menu zamknięte;
  - działa karuzela kafli.
- [ ] Motyw: przełącznik działa i wybór przechodzi między podstronami.
- [ ] `prefers-reduced-motion: reduce`: brak ruchu, cała treść widoczna.
- [ ] Bez JavaScriptu: cała treść jest widoczna i linki działają.

## Do zrobienia

1. **Formularz kontaktowy jest w trybie pokazowym** (`FORM_ENDPOINT = ''` w `src/scripts/app.js`). Potrzebny jest prawdziwy endpoint, np. funkcja na Vercelu (w Astro: adapter `@astrojs/vercel` i endpoint z `prerender = false`; reszta stron zostaje statyczna). Wymagania:
   - wiadomość trafia na `kontakt@ogarniemystrone.pl`;
   - walidacja po stronie serwera;
   - ochrona przed spamem bez ciasteczek: pole-pułapka i limit zgłoszeń, bez reCAPTCHA;
   - poczta stoi na SEOHOST, więc wysyłka może iść przez ich SMTP;
   - dane logowania tylko w zmiennych środowiskowych Vercela, nigdy w repozytorium;
   - po podłączeniu trzeba zaktualizować politykę prywatności.
2. **Treści do uzupełnienia** (zapytaj właścicieli, nie wymyślaj):
   - `[CENA]` pakietów Firma i Firma z rezerwacjami (`cennik`, także w `src/scripts/app.js` w konfiguratorze);
   - `[Zakres do ustalenia]`;
   - `[NUMER TELEFONU]` (`src/site.js`; trafia do stopki i na stronę kontaktu);
   - `[Czas realizacji – do uzupełnienia]` (`jak-pracujemy`, FAQ w `cennik`);
   - realizacje: `[Nazwa firmy]`, `[Miasto]`, `[branża]`, `[Zdjęcie realizacji]` (`src/content/realizacje/`);
   - zdjęcia i 1–2 zdania o każdym w `o-nas` (`[Zdjęcie: Mateusz przy pracy]`, `[Zdjęcie: Sebastian przy pracy]`, `[Dopisz 1–2 zdania o sobie…]`);
   - `[Dane administratora – do uzupełnienia]` w polityce prywatności.
3. **Opinie klientów:** gdy pojawią się pierwsze, dodaj je według `SPRZEDAZ.md` („Czego jeszcze brakuje”). Tylko prawdziwe, z linkiem do Google.
4. **Wdrożenie:**
   - domena jest zarejestrowana w Zenboxie, DNS i poczta są na SEOHOST;
   - rekordy zmienia się tylko w panelu SEOHOST, bo w rejestrze .pl domena ma serwery nazw `ns1.seohost.pl` i `ns2.seohost.pl` (stan z 2026-10-25). Strefa DNS w panelu Zenboxu jest nieaktywna i jej zmiany nic nie dają;
   - poczta nie zależy od rekordu A domeny: MX wskazuje `mail.ogarniemystrone.pl` (osobny rekord A), a SPF to `redirect=_spf-h22.microhost.pl`;
   - przy podpinaniu domeny do Vercela dodaj tylko rekordy, które poda Vercel (apex i `www`);
   - **nigdy nie zmieniaj rekordów MX, SPF, DKIM ani DMARC**, bo od nich zależy firmowa poczta;
   - przed wdrożeniem na produkcję zawsze zapytaj.

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

## Decyzje

### 2026-10-25: Na razie bez kafla „Rezerwacje online”
- **Co:** ze strony głównej zniknął kafel „04 · rezerwacje” z przykładowymi terminami. Zostało 5 kafli: dolny rząd to „Szybka nawet w terenie” i „Kopie zapasowe robimy my” (5 + 7 kolumn).
- **Dlaczego:** decyzja właścicieli, na razie nie pokazujemy rezerwacji online.
- **Gdzie rezerwacje jeszcze są** (bez zmian, czekają na decyzję):
  - pakiet „Firma z rezerwacjami” w cenniku;
  - pytanie o rezerwacje w konfiguratorze;
  - dodatek w ofercie;
  - temat „Rezerwacje online” w formularzu;
  - filtr „Z rezerwacjami” w realizacjach.
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
