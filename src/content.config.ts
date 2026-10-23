// Kolekcje treści. Nowa realizacja = nowy plik .md w src/content/realizacje/.
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const realizacje = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/realizacje' }),
  schema: z.object({
    nazwa: z.string(),
    miasto: z.string(),
    branza: z.string(),
    rodzaj: z.enum(['wizytowka', 'podstrony', 'rezerwacje']),
    /** Kolejność na liście (rosnąco). Najmocniejsza realizacja pierwsza. */
    kolejnosc: z.number(),
    /** Dokąd prowadzi kafel. Domyślnie do kontaktu. */
    link: z.string().default('/kontakt'),
  }),
});

export const collections = { realizacje };
