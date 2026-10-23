# Brandbook Ogarniemy Stronę

Wersja 1.0 · październik 2026 · spisany z działającej strony ogarniemystrone.pl.
Wartości liczbowe pochodzą z `src/assets/styles.css`. Jeśli brandbook i kod się rozjadą, rozstrzyga ten dokument, a kod należy poprawić.

---

## 1. Marka w skrócie

| | |
| --- | --- |
| Nazwa | **Ogarniemy Stronę**: dwa słowa, obie wielkie litery, zawsze z „ę”. Domena: `ogarniemystrone.pl` |
| Hasło | **Ty robisz swoje, my ogarniemy stronę.** |
| Co robimy | Nowoczesne strony internetowe dla małych firm i specjalistów z całej Polski. Projekt, treści, start i opieka po starcie. Strony od 999 zł. |
| Dla kogo | Małe firmy i specjaliści z różnych branż. Nie zawężamy przekazu do jednej grupy (np. gabinetów i pacjentów). |
| Kto | Mateusz Fiodorow i Sebastian Herman. Białystok, praca zdalnie dla całej Polski. |
| Czym nie jesteśmy | Nie „studio” i nie agencja. Marka nie ma żadnych nawiązań do fotografii. |

**Koncepcja wizualna: „ogarnięte pudełko”.** Japoński porządek bento (siatka, oddech, spokojne marginesy) wypełniony brazylijską energią (nasycone bloki limonki i zieleni, wielka typografia, naklejki z taśmą). Każda strona opowiada tę samą historię: **bałagan → ogarnięte**. Bałagan to krzywe naklejki ze starymi problemami klienta. Ogarnięte to równa siatka, pętla i spokój.

**Celowe niedoskonałości.** Lekko obrócone naklejki i plakietki, nierówne zaokrąglenia kart, odręczna pętla i nierówne marginesy boczne mają być widoczne. Strona ma wyglądać na zrobioną przez ludzi, nie przez szablon.

---

## 2. Logo

### Budowa
- **Logotyp:** „Ogarniemy Stronę”, krój Bricolage Grotesque, grubość 760, szerokość 90%, odstęp między literami −0,025 em.
- **Pętla:** odręczna, zielona, otacza słowo „Stronę”. To główny znak marki. Pętla zawsze jest otwarta: koniec zachodzi na początek i nie łączy się w gładki owal.
- **Sygnet:** litera „S” z tą samą pętlą. Służy jako ikona, favicon i awatar.

Ścieżka pętli (viewBox `0 0 200 80`, skalowana bez zachowania proporcji):
```
M152 7C108 2 44 4 18 20C2 31 8 60 54 72C100 80 170 74 192 54C202 40 190 16 142 9C124 7 110 9 100 13
```
Położenie względem słowa: od lewej −0,24 em, od góry −0,14 em, szerokość słowa +0,46 em, wysokość linii +0,36 em, grubość kreski 5 (w jednostkach viewBoxa), zakończenia zaokrąglone.

### Wersje i pliki (`brand/`)
| Plik | Kiedy |
| --- | --- |
| `logo.svg`, `logo.png` | Domyślnie, na jasnym tle. Tekst `#111714`, pętla `#0d6a4f` |
| `logo-na-ciemnym.svg`, `.png` | Na ciemnym tle i na zdjęciach. Tekst `#ffffff`, pętla `#c8f169` |
| `logo-jednokolorowe.svg`, `.png` | Druk w jednym kolorze, pieczątki, grawer |
| `sygnet.svg`, `sygnet-512.png` | Ikony i awatary na jasnym tle |
| `sygnet-na-ciemnym.svg`, `sygnet-na-ciemnym-512.png` | Ikony i awatary na ciemnym tle |

Tekst w plikach SVG jest zamieniony na krzywe, więc do ich użycia nie trzeba instalować fontu.

### Zasady
- **Pole ochronne:** wokół logo zostaw co najmniej połowę wysokości liter wolnego miejsca. Pętla wlicza się do logo.
- **Minimalna wielkość:** logotyp 120 px szerokości na ekranie lub 30 mm w druku. Sygnet 16 px. W tym rozmiarze favicon ma grubszą pętlę.
- **Na stronie** logo jest tekstem HTML z pętlą w SVG, a nie obrazkiem. Dzięki temu pętla może się rysować.
- **Animacja:** przy wejściu na stronę pętla rysuje się w 1300 ms z opóźnieniem 250 ms (`cubic-bezier(.65,0,.35,1)`). Kliknięcie logo rysuje ją jeszcze raz (900 ms).
- **Nie wolno:**
  - zmieniać kroju ani grubości;
  - rozciągać logo;
  - obracać pętli w logo;
  - przenosić pętli na inne słowo;
  - dodawać cieni, gradientów i obrysów;
  - stawiać zielonej pętli na zielonym tle;
  - pisać „Strone” bez „ę”.

---

## 3. Kolory

### Paleta
| Token | Jasny | Ciemny | Rola |
| --- | --- | --- | --- |
| `--bg` | `#f4f6f2` | `#0d120f` | Tło strony, lekko zielonkawa biel lub czerń |
| `--surface` | `#ffffff` | `#151c18` | Karty, pola, panele |
| `--surface-2` | `#e9eee7` | `#121915` | Tło sekcji przeplatanych |
| `--ink` | `#111714` | `#edf2ee` | Tekst, ikony |
| `--muted` | `#56605b` | `#a3afa8` | Tekst pomocniczy, leady |
| `--line` | `#dde3df` | `#27312c` | Linie podziału |
| `--line-strong` | `#7f8984` | `#6d7a73` | Obrysy przycisków i pól |
| `--green` / `--accent` | `#0d6a4f` | `#c8f169` (akcent) | Główny akcent: przyciski, linki, pętla |
| `--green-strong` | `#09503b` | `#d9f79a` (hover) | Najechanie na przycisk główny |
| `--lime` | `#c8f169` | `#c8f169` | Energia: bloki, naklejki, akcent na ciemnym |
| `--mint` | `#ddf0e6` | `#1d3a2f` | Delikatne tło plakietek i kart |
| `--danger` | `#b3261e` | `#ff8a80` | Wyłącznie błędy |

W trybie ciemnym akcent zmienia się z zieleni na limonkę: przyciski główne są limonkowe z ciemnym tekstem, a pętla jest limonkowa.

### Proporcje
Tło i biel to około 70% powierzchni, atrament około 20%, a zieleń i limonka razem około 10%. Mięta wypełnia przestrzeń między nimi. Limonka to „krzyk” marki: najwyżej jeden duży blok na ekran.

### Kontrast (WCAG 2.1)
| Para | Kontrast | |
| --- | --- | --- |
| `--ink` na `--bg` | 16,7 : 1 | AAA |
| `--muted` na `--bg` | 6,0 : 1 | AA |
| `--green` na `--bg` | 6,1 : 1 | AA (linki, tekst) |
| biały na `--green` | 6,6 : 1 | AA (przycisk główny) |
| `--ink` na `--lime` | 14,0 : 1 | AAA |
| `--line-strong` na `--bg` | 3,3 : 1 | AA dla elementów interfejsu |
| ciemny: `--ink` na `--bg` | 16,7 : 1 | AAA |
| ciemny: `--muted` na `--bg` | 8,3 : 1 | AAA |
| ciemny: limonka na `--bg` | 14,6 : 1 | AAA |

**Limonka nigdy nie jest kolorem tekstu na jasnym tle** (kontrast poniżej 1,5 : 1). Na jasnym tle limonka służy tylko jako tło dla tekstu `#111714`. Na ciemnym tle może być kolorem tekstu i kreski.

---

## 4. Typografia

| Krój | Rola | Ustawienia |
| --- | --- | --- |
| **Bricolage Grotesque** (zmienny) | Nagłówki, logo, duże liczby | Grubość 300–800, szerokość 75–100%, optyczny rozmiar zablokowany na 60. Nagłówki: grubość 700–760, szerokość 84–90%, ciasny odstęp liter |
| **Fraunces Italic** (zmienny) | Akcent: jedno lub dwa słowa w nagłówku | Grubość 300–700, oś SOFT 100 (miękkie kształty), WONK 1. Zawsze kursywa, w kolorze akcentu |
| **Onest** | Tekst, interfejs, formularze | Grubość 400–700 |

Wszystkie trzy kroje są na licencji SIL Open Font License. Na stronie są osadzone lokalnie jako przycięte pliki WOFF2 z polskimi znakami. Nie ładujemy ich z Google Fonts.

### Skala
| Styl | Rozmiar | Interlinia | Inne |
| --- | --- | --- | --- |
| Hero (`.mega`) | `clamp(3.05rem, 1.15rem + 6.4vw, 7.6rem)` | 0,9 | 760 / 86%, −0,035 em |
| Tytuł podstrony | `clamp(2.7rem, 1.3rem + 4.8vw, 6rem)` | 0,94 | 760 / 84%, maks. 16 znaków szerokości |
| H2 | `clamp(2.2rem, 1.25rem + 3.3vw, 4.4rem)` | 0,98 | 720 / 84%, −0,03 em |
| H2 mały | `clamp(1.9rem, 1.2rem + 2.2vw, 3.1rem)` | | |
| Nagłówek karty | `clamp(1.65rem, 1.2rem + 1.2vw, 2.35rem)` | 1 | 700 / 80% |
| Lead | `clamp(1.1rem, 1rem + .35vw, 1.3rem)` | 1,55 | kolor `--muted`, maks. 56 znaków |
| Tekst | 17 px (1.0625rem) | 1,65 | Onest 400 |
| Etykieta (kicker) | 13 px | 1,2 | wersaliki, odstęp liter 0,16 em, 600, przed nią kreska 22 × 2 px w kolorze pętli |
| Przypis | 14 px | | `--muted` |

### Zasady
- Fraunces to przyprawa. Służy do jednego lub dwóch słów w nagłówku („my *ogarniemy* stronę”, „Co jeszcze możemy *dołożyć*”). Nigdy nie składamy nim całego zdania ani tekstu. Wyjątkiem są krótkie dopiski w stylu odręcznej notatki (`.casual`).
- Nagłówki mają `text-wrap: balance`, a dłuższy tekst `text-wrap: pretty`.
- **Typografia ruchoma:**
  - nagłówki przy wejściu w ekran rozszerzają się z szerokości 74% do 84%;
  - litery w nagłówku strony głównej reagują grubością na kursor.
- **Polska typografia:**
  - półpauza ze spacjami („Projekt – treści”), a nie dywiz;
  - cudzysłów „polski”;
  - wielokropek jako jeden znak (…);
  - twarda spacja po jednoliterowych słowach (i, a, o, u, w, z) i przed „zł”;
  - zaimki w zwrotach do czytelnika wielką literą: Ty, Cię, Twoja.

---

## 5. Układ i kształty

- **Siatka:**
  - kontener ma maksymalnie 1320 px;
  - marginesy boczne są celowo nierówne: lewy 20 px i prawy 18 px na telefonie, 3,4 vw i 2,8 vw na komputerze;
  - marginesy zawsze uwzględniają wcięcia ekranu (`env(safe-area-inset-*)`).
- **Bento:**
  - treść układa się w kafle różnej wielkości;
  - kafle mają kolory z palety: biały, zieleń, limonka, mięta, atrament;
  - kafle mogą na siebie lekko zachodzić.
- **Zaokrąglenia:**
  - 8 px: pola formularza;
  - 16 px: małe karty;
  - 22 px: karty i kafle;
  - pełne zaokrąglenie: przyciski, chipy, plakietki.
  - Wybrane karty mają celowo nierówne rogi, np. `28px 18px 22px 16px`.
- **Naklejki:**
  - karteczki obrócone od −6° do +5° z paskiem „taśmy”;
  - używamy ich tylko w motywie „bałagan → ogarnięte”;
  - w tym motywie naklejki ustawiają się w równą siatkę.
- **Plakietki** są obrócone o −1,6°.
- **Cienie** są miękkie, lekko przesunięte w prawo i w dół (`--shadow-1`, `--shadow-2`). Pojawiają się dopiero po najechaniu, nie w spoczynku.
- **Wzór:** powtórzona pętla o krycie 7% na tle sekcji.
- **Rytm sekcji:** przeplatamy tło `--bg`, `--surface-2` i ciemną stopkę. Każdą podstronę poza Kontaktem zamyka ciemna sekcja „Napisz. Resztę *ogarniemy* my.”.

### Telefon ma własne rozwiązania
- Na dole ekranu jest pływający przycisk „Menu”. Gdy przycisk w pierwszym ekranie znika z widoku, obok pojawia się „Umów rozmowę”.
- Menu otwiera się na cały ekran jako koło rozchodzące się od przycisku.
- Kafle zamieniają się w poziomą karuzelę.
- Każdy element dotykowy ma co najmniej 48 × 48 px.

---

## 6. Ruch

| Token | Wartość | Do czego |
| --- | --- | --- |
| `--t1` | 200 ms | Kolory, drobne zmiany |
| `--t2` | 320 ms | Obrysy, przesunięcia |
| `--t3` | 420 ms | Karty, przyciski |
| `--t4` | 500 ms | Większe elementy, pętle w menu |
| `--e-out` | `cubic-bezier(.16,1,.3,1)` | Wejścia: szybki start, miękkie lądowanie |
| `--e-soft` | `cubic-bezier(.65,0,.35,1)` | Rysowanie pętli, przejścia |
| `--e-pop` | `cubic-bezier(.34,1.56,.64,1)` | Sprężyste reakcje na najechanie |
| `--e-sway` | `cubic-bezier(.45,1.45,.55,1)` | Naklejki wskakujące z bałaganu w siatkę (kolejno co 55 ms) |

**Momenty firmowe:**
1. Pętla rysuje się wokół logo i słowa „stronę” w nagłówku.
2. Bałagan zmienia się w ogarnięte: naklejki układają się w siatkę.
3. Litery nagłówków zmieniają grubość i szerokość.
4. Między podstronami jest płynne przejście: stara strona znika w 220 ms, nowa wjeżdża w 420 ms, a nagłówek zostaje na miejscu.

**Mikrointerakcje:**
- strzałka w przycisku przesuwa się o 5 px i obraca o −10°;
- karta unosi się o 4 px z lekkim obrotem;
- pętla pod pozycją menu rysuje się po najechaniu;
- przyciski delikatnie przyciągają się do kursora;
- pole z błędem krótko się trzęsie.

**Zasady:**
- mikrointerakcje trwają 200–500 ms;
- nic nie jest liniowe;
- nie ma przewijanych pasków ani tickerów;
- nie ma animacji w nieskończonej pętli poza pulsującą kropką „Przyjmujemy nowe projekty”;
- przy `prefers-reduced-motion` ruch jest wyłączony, a treść od razu widoczna.

---

## 7. Komponenty

- **Przyciski:** zawsze pigułka, wysokość 52 px (mały: 48 px), Onest 600.
  - Główny: `--accent`.
  - Drugorzędny: przezroczysty z obrysem `--line-strong`.
  - Limonkowy: na ciemnych sekcjach.
  - Atramentowy: na limonce.
  - Tekst przycisku mówi, co się stanie: „Umów rozmowę”, „Wyślij wiadomość”, „Zapytaj o ten pakiet”.
- **Link „więcej”:** zielony tekst 600 ze strzałką.
- **Etykieta nad nagłówkiem:** wersaliki z kreską w kolorze pętli („DODATKI”).
- **Plakietka:** miętowa pigułka, lekko obrócona, opcjonalnie z pulsującą kropką.
- **Karty:** białe z obrysem 1 px albo pełne kolory z palety. Po najechaniu karta się unosi i dostaje cień.
- **Chipy filtrów** pokazują liczbę wyników.
- **Formularz:**
  - pola mają 52 px wysokości;
  - po zaznaczeniu obrys przyjmuje kolor pętli z poświatą 22%;
  - błąd ma czerwony obrys i komunikat pod polem;
  - wersja robocza zapisuje się sama.
- **Zapewnienia** (`.assure`): krótka lista z zielonymi ptaszkami tuż pod przyciskiem: „Bezpłatna rozmowa i wycena”, „Najpierw projekt, potem płatność”, „Odpowiedź do 24 h w dni robocze”. Stoją przy każdym głównym CTA.
- **Pigułka płatności** (`.st-pay`): miętowa etykieta przy kroku współpracy, lekko obrócona.
- **Pasek płatności** (`.pay-steps`): trzy kafle „0 zł → 50% → 50%”. Środkowy jest miętowy.
- **Ikony:** liniowe, siatka 24 × 24, kreska 2 px, zaokrąglone końce i łączenia, kolor `currentColor`.
- **Fokus z klawiatury:** obrys 2 px w kolorze tekstu z odstępem 3 px. Zawsze widoczny.

---

## 8. Głos i ton

**Mówimy jak dwóch konkretnych ludzi, którzy ogarną temat za klienta.** Prosto, ciepło, bez żargonu i bez marketingowego nadęcia.

- **Mówimy do czytelnika na „Ty”.** Nigdy nie używamy formy „Państwo”.
- **Piszemy o efekcie, nie o technologii:**
  - „Zmiany bez dzwonienia do nas”, a nie „panel CMS”;
  - „Szybka także w terenie”, a nie „optymalizacja Core Web Vitals”.
- **Konkret zamiast przymiotników:** „Cztery kroki, zero żargonu”, „Dobierz pakiet w 20 sekund”, „Strony od 999 zł”.
- **Fakty o współpracy zawsze w tym samym brzmieniu:** „Bezpłatna rozmowa i wycena”, „Najpierw projekt, potem płatność”, „Połowa kwoty, gdy projekt Ci się spodoba”, „Druga połowa po zrobieniu strony”, „Odpowiedź do 24 h w dni robocze”.
- **Bez obietnic, których nie kontrolujemy:** nie piszemy o pozycji w Google ani o liczbie klientów.
- **„Ogarnąć” to czasownik marki.** Używamy go z umiarem, najwyżej raz lub dwa razy na ekran:
  - „ogarniemy”, „Ogarnij ten bałagan”;
  - „Ogarniamy…” w stanie ładowania;
  - „Ups, tej strony nie ogarnęliśmy.” na stronie błędu.
- **Komunikaty z charakterem, ale użyteczne:**
  - Błąd: „Błąd: podaj e-mail albo telefon, żebyśmy mogli odpisać.” Mówi, co jest źle i jak to naprawić.
  - Sukces: „Dziękujemy, {imię}.”
  - Pusto: „Tu jeszcze pusto.” plus podpowiedź, co zrobić.
  - Ładowanie: „Ogarniamy…”
- **Nie używamy:**
  - formy „Państwo”;
  - słowa „studio”;
  - nawiązań do fotografii;
  - zwrotów typu „w dzisiejszym cyfrowym świecie”, „kompleksowe rozwiązania”, „innowacyjny”, „dedykowany”;
  - wtrąceń między myślnikami;
  - emoji jako punktorów;
  - zdjęć stockowych.

---

## 9. Zdjęcia i grafika

- Grafika marki to typografia, bloki koloru, naklejki i pętla. Ilustracji nie potrzebujemy.
- Zdjęcia pokazują tylko prawdziwych ludzi i prawdziwe realizacje: Mateusza i Sebastiana przy pracy oraz zrzuty stron klientów. Nie używamy stocków.
- Zrzuty realizacji pokazujemy w ramce urządzenia albo jako czysty zrzut z zaokrągleniem 16–22 px.

---

## 10. Jakość jako część marki

To są obietnice marki, a nie tylko wymagania techniczne:
- **Dostępność:** WCAG 2.1 AA, pełna obsługa klawiaturą i czytnikiem ekranu, ograniczony ruch na życzenie, treść czytelna bez JavaScriptu.
- **Lekkość:** podstrona waży około 150–250 KB, fonty są lokalne, nie ma zewnętrznych skryptów. Stopka pokazuje rzeczywistą wagę podstrony.
- **Prywatność:** w stopce piszemy „Bez ciasteczek śledzących”. Nie dodajemy analityki ani widżetów, które ustawiają ciasteczka śledzące.
- **Dwa motywy:** jasny i ciemny, z przełącznikiem i zapamiętaniem wyboru.

---

## 11. Inne nośniki

- **Stopka maila:** logo z `https://ogarniemystrone.pl/stopka/logo-stopka.png` (oraz `.gif`). Ten adres musi zawsze działać, bo korzystają z niego wysłane już wiadomości.
- **Obrazek do udostępniania (`og.png`, 1200 × 630):**
  - limonkowe tło z wzorem pętli;
  - logo;
  - hasło z „ogarniemy” we Fraunces i pętlą na „stronę.”;
  - na dole „od 999 zł” i domena.
- **Favicon i ikona iPhone’a:** sygnet. Favicon zmienia kolory razem z motywem systemu.
