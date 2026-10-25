// Dane firmy w jednym miejscu: nagłówek, stopka, kontakt, dane strukturalne.
export const SITE = {
  domain: 'https://ogarniemystrone.pl',
  name: 'Ogarniemy Stronę',
  author: 'Mateusz Fiodorow, Sebastian Herman',
  ogImageAlt: 'Ogarniemy Stronę – Ty robisz swoje, my ogarniemy stronę.',
  themeLight: '#f4f6f2',
  themeDark: '#0d120f',
  email: 'kontakt@ogarniemystrone.pl',
  telefony: ['+48 660 872 121', '+48 789 290 621'],
};

// Link do dzwonienia: tel:+48660872121
export const telHref = (t) => `tel:${t.replace(/\s/g, '')}`;

// Identyfikatory węzłów JSON-LD: te same na każdej stronie, żeby Google łączył je w jedną firmę i dwie osoby
export const LD_ID = {
  firma: `${SITE.domain}/#firma`,
  witryna: `${SITE.domain}/#witryna`,
  mateusz: `${SITE.domain}/o-nas#mateusz`,
  sebastian: `${SITE.domain}/o-nas#sebastian`,
};

// Firma w skrócie: na podstronach, które odwołują się do niej przez @id
export const LD_FIRMA = { '@type': 'ProfessionalService', '@id': LD_ID.firma, name: SITE.name, url: `${SITE.domain}/` };

// Dane strukturalne strony głównej (JSON-LD). Bez priceRange: „od 999 zł” to dolna granica, a nie przedział cen.
export const SCHEMA_HOME = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      ...LD_FIRMA,
      // Logo dla Google: kwadratowy sygnet z brand/sygnet-512.png
      logo: { '@type': 'ImageObject', url: `${SITE.domain}/logo.png`, width: 512, height: 512 },
      image: `${SITE.domain}/og.png`,
      email: SITE.email,
      telephone: SITE.telefony.map((t) => t.replace(/\s/g, '')),
      description: 'Nowoczesne strony internetowe dla małych firm i specjalistów z całej Polski.',
      // Bez adresu i współrzędnych: działamy zdalnie dla całej Polski, nie jako firma lokalna
      areaServed: { '@type': 'Country', name: 'Polska' },
      founder: [{ '@id': LD_ID.mateusz }, { '@id': LD_ID.sebastian }],
    },
    // Nazwa witryny w wynikach Google
    { '@type': 'WebSite', '@id': LD_ID.witryna, url: `${SITE.domain}/`, name: SITE.name, inLanguage: 'pl-PL', publisher: { '@id': LD_ID.firma } },
    { '@type': 'Person', '@id': LD_ID.mateusz, name: 'Mateusz Fiodorow', url: `${SITE.domain}/o-nas` },
    { '@type': 'Person', '@id': LD_ID.sebastian, name: 'Sebastian Herman', url: `${SITE.domain}/o-nas` },
  ],
};
