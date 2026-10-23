// Dane firmy w jednym miejscu: nagłówek, stopka, kontakt, dane strukturalne.
export const SITE = {
  domain: 'https://ogarniemystrone.pl',
  name: 'Ogarniemy Stronę',
  author: 'Mateusz Fiodorow, Sebastian Herman',
  ogImageAlt: 'Ogarniemy Stronę – Ty robisz swoje, my ogarniemy stronę.',
  themeLight: '#f4f6f2',
  themeDark: '#0d120f',
  email: 'kontakt@ogarniemystrone.pl',
  telefon: '+48 [NUMER TELEFONU]',
};

// Dane strukturalne strony głównej (JSON-LD)
export const SCHEMA_HOME = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: SITE.name,
  url: `${SITE.domain}/`,
  email: SITE.email,
  description: 'Nowoczesne strony internetowe dla małych firm i specjalistów z całej Polski.',
  priceRange: 'od 999 zł',
  areaServed: { '@type': 'Country', name: 'Polska' },
  address: { '@type': 'PostalAddress', addressLocality: 'Białystok', addressCountry: 'PL' },
  geo: { '@type': 'GeoCoordinates', latitude: 53.1325, longitude: 23.1688 },
  founder: [
    { '@type': 'Person', name: 'Mateusz Fiodorow' },
    { '@type': 'Person', name: 'Sebastian Herman' },
  ],
};
