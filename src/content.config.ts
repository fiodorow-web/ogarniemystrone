// Kolekcje treści. Nowa realizacja = nowy plik .md w src/content/realizacje/.
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const realizacje = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/realizacje' }),
  schema: ({ image }) => z.object({
    nazwa: z.string(),
    /** Pomijane, gdy firma nie ma jednego miasta. */
    miasto: z.string().optional(),
    branza: z.string(),
    rodzaj: z.enum(['wizytowka', 'podstrony', 'rezerwacje']),
    /** Kolejność na liście (rosnąco). Najmocniejsza realizacja pierwsza. */
    kolejnosc: z.number(),
    /** Dokąd prowadzi kafel. Adres zewnętrzny (https://…) otwiera się w nowej karcie. Domyślnie do kontaktu. */
    link: z.string().default('/kontakt'),
    /** Zrzut górnej części strony na komputerze (1536 × 960), plik obok .md. Bez zrzutu kafel ma zastępczą miniaturę. */
    zdjecie: image().optional(),
    /** Zrzut na telefonie (390 × 844 @2x), pokazywany w ramce telefonu na zrzucie z komputera. */
    zdjecieTelefon: image().optional(),
  }),
});

export const collections = { realizacje };
