// Kolekcje treści. Nowa realizacja = nowy plik .md w src/content/realizacje/.
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const realizacje = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/realizacje' }),
  schema: ({ image }) => z.object({
    nazwa: z.string(),
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

// Wpisy na blogu: src/content/blog/*.md, adres /blog/{nazwa pliku}.
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    /** Tytuł wpisu: <h1> i <title>. */
    tytul: z.string(),
    /** Opis dla Google i do udostępniania (meta description), do ok. 155 znaków. */
    opis: z.string(),
    /** Jedno lub dwa zdania pod tytułem i na liście wpisów. */
    zajawka: z.string(),
    data: z.coerce.date(),
    /** Tylko przy istotnej zmianie treści, nie dla odświeżenia daty. */
    aktualizacja: z.coerce.date().optional(),
  }),
});

export const collections = { realizacje, blog };
