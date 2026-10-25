// Obsługa formularza kontaktowego po stronie serwera: sprawdzenie danych, ochrona przed spamem, wysyłka przez Resend.
// Wywołuje ją api/kontakt.js (funkcja Vercela), a lokalnie tools/serve.mjs (podgląd: maile zapisują się do plików).
//
// Zmienne środowiskowe (tylko w ustawieniach projektu na Vercelu, nigdy w repozytorium):
//   RESEND_API_KEY     klucz API z Resend (wymagany)
//   FORMULARZ_DO       dokąd trafiają zgłoszenia (domyślnie kontakt@ogarniemystrone.pl)
//   FORMULARZ_OD       nadawca obu maili; domena musi być zweryfikowana w Resend
//   FORMULARZ_PODGLAD  tylko lokalnie: folder, do którego zapisują się maile zamiast wysyłki
//
// Ochrona przed spamem bez ciasteczek i bez reCAPTCHA:
//   - pole-pułapka (niewidoczne dla ludzi): wypełnione = udajemy sukces i nic nie wysyłamy;
//   - czas wypełnienia (z app.js): poniżej 3 s zgłoszenie trafia do nas z dopiskiem, ale klient nie dostaje potwierdzenia;
//   - limit: 5 zgłoszeń na 15 minut z jednego adresu IP (w pamięci instancji funkcji, adresów nie zapisujemy);
//   - żądania z innej strony (nagłówek Origin z obcej domeny) są odrzucane.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { mailDoNas, mailDoKlienta } from './maile.js';

export const TEMATY = ['Nowa strona', 'Odświeżenie strony', 'Rezerwacje online', 'Coś innego'];
export const POLE_PULAPKA = 'strona_www';
const DOMYSLNIE_DO = 'kontakt@ogarniemystrone.pl';
const DOMYSLNIE_OD = 'Ogarniemy Stronę <formularz@wiadomosci.ogarniemystrone.pl>';
const MIN_CZAS_MS = 3000;
const LIMIT = { ile: 5, okno: 15 * 60e3 };

const isEmail = (v) => /^[^\s@<>()[\]",;:]+@[^\s@<>()[\]",;:]+\.[^\s@<>()[\]",;:]{2,}$/.test(v);
const isPhone = (v) => /^[+\d\s().-]+$/.test(v) && v.replace(/\D/g, '').length >= 9 && v.replace(/\D/g, '').length <= 15;
const bezSterujacych = (s) => String(s ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');
const jednaLinia = (s) => bezSterujacych(s).replace(/\s+/g, ' ').trim();
const wygladaNaLink = (s) => /(https?:|www\.|:\/\/|\.[a-z]{2,}\/|[<>@])/i.test(s);

/** Sprawdza dane z formularza. Zwraca { dane } albo { bledy: { pole: komunikat } }. */
export function sprawdz(wejscie) {
  const imie = jednaLinia(wejscie.imie);
  const firma = jednaLinia(wejscie.firma);
  const kontakt = jednaLinia(wejscie.kontakt);
  const wiadomosc = bezSterujacych(wejscie.wiadomosc).replace(/\r\n?/g, '\n').trim();
  const tematy = [].concat(wejscie.temat ?? []).map(jednaLinia).filter((t) => TEMATY.includes(t));
  const bledy = {};
  // Imię trafia do potwierdzenia na podany adres, więc nie może przenosić linków ani adresów
  if (!imie) bledy.imie = 'Błąd: jak mamy się do Ciebie zwracać? Wpisz imię.';
  else if (imie.length > 60 || wygladaNaLink(imie)) bledy.imie = 'Błąd: wpisz samo imię, bez linków i adresów.';
  if (!kontakt) bledy.kontakt = 'Błąd: podaj e-mail albo telefon, żebyśmy mogli odpisać.';
  else if (kontakt.length > 120 || !(isEmail(kontakt) || isPhone(kontakt))) bledy.kontakt = 'Błąd: to nie wygląda na e-mail ani numer telefonu. Sprawdź literówki.';
  if (firma.length > 120) bledy.firma = 'Błąd: nazwa firmy może mieć najwyżej 120 znaków.';
  if (wiadomosc.length > 5000) bledy.wiadomosc = 'Błąd: wiadomość może mieć najwyżej 5000 znaków.';
  if (Object.keys(bledy).length) return { bledy };
  return { dane: { imie, firma, kontakt, email: isEmail(kontakt), temat: [...new Set(tematy)], wiadomosc } };
}

// ── Limit zgłoszeń (pamięć instancji; przy kilku instancjach limit jest luźniejszy, ale nadal hamuje zalew) ──
const proby = new Map();
function zaDuzo(ip, teraz) {
  if (!ip) return false;
  for (const [k, czasy] of proby) if (czasy.at(-1) < teraz - LIMIT.okno) proby.delete(k);
  const czasy = (proby.get(ip) || []).filter((t) => t > teraz - LIMIT.okno);
  czasy.push(teraz);
  proby.set(ip, czasy);
  return czasy.length > LIMIT.ile;
}

async function wyslijResend(klucz, mail) {
  // Ten sam mail w ciągu doby (np. podwójne kliknięcie) Resend wyśle tylko raz
  const idempotencja = crypto.createHash('sha256').update(JSON.stringify([mail.to, mail.subject, mail.text])).digest('hex');
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${klucz}`, 'Content-Type': 'application/json', 'Idempotency-Key': idempotencja },
    body: JSON.stringify(mail),
    signal: AbortSignal.timeout(8000),
  });
  if (!r.ok) throw new Error(`Resend ${r.status}: ${(await r.text()).slice(0, 300)}`);
}

function zapiszPodglad(folder, nazwa, mail) {
  fs.mkdirSync(folder, { recursive: true });
  const plik = path.join(folder, `${new Date().toISOString().replace(/[:.]/g, '-')}-${nazwa}`);
  fs.writeFileSync(`${plik}.html`, mail.html);
  fs.writeFileSync(`${plik}.txt`, `Od: ${mail.from}\nDo: ${mail.to}\nOdpowiedź do: ${mail.reply_to || '-'}\nTemat: ${mail.subject}\n\n${mail.text}`);
  console.log(`[formularz] podgląd zamiast wysyłki: ${plik}.html`);
}

// ── Odpowiedzi ────────────────────────────────────────────────────────
const json = (status, obj) => new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
// Bez JavaScriptu formularz wysyła się zwyczajnie: sukces przekierowuje na /dziekujemy, błąd pokazuje prostą stronę
const strona = (status, tytul, tresc) => new Response(`<!doctype html><html lang="pl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${tytul} – Ogarniemy Stronę</title></head><body style="margin:0;padding:40px 20px;background:#f4f6f2;color:#111714;font:17px/1.6 system-ui,sans-serif"><main style="max-width:560px;margin:0 auto"><h1 style="font-size:28px;line-height:1.15">${tytul}</h1>${tresc}</main></body></html>`, { status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });
const BLAD_TRESC = '<p>Wiadomość nie wyszła. <a href="/kontakt" style="color:#0d6a4f">Wróć do formularza</a> i&nbsp;spróbuj jeszcze raz albo napisz na <a href="mailto:kontakt@ogarniemystrone.pl" style="color:#0d6a4f">kontakt@ogarniemystrone.pl</a>.</p>';

/**
 * @param {Request} request
 * @param {Record<string, string|undefined>} env
 * @returns {Promise<Response>}
 */
export async function obsluzZgloszenie(request, env) {
  if (request.method !== 'POST') return new Response(null, { status: 405, headers: { Allow: 'POST' } });

  const typ = request.headers.get('content-type') || '';
  const jakoJson = typ.includes('application/json');
  const odp = {
    ok: () => (jakoJson ? json(200, { ok: true }) : new Response(null, { status: 303, headers: { Location: '/dziekujemy' } })),
    blad: (status, kod, bledy) => (jakoJson ? json(status, { ok: false, kod, bledy }) : strona(status, 'Ups, coś poszło nie tak.', bledy ? `<p>${Object.values(bledy).map((b) => b.replace(/^Błąd: /, '')).join('<br>')}</p>${BLAD_TRESC}` : BLAD_TRESC)),
  };

  // Tylko z naszej strony: przeglądarka dodaje Origin do każdego POST-a
  const origin = request.headers.get('origin');
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || new URL(request.url).host;
  if (origin && origin !== 'null' && new URL(origin).host !== host) return odp.blad(403, 'obca-strona');

  let wejscie;
  try {
    if (jakoJson) wejscie = await request.json();
    else if (typ.includes('application/x-www-form-urlencoded') || typ.includes('multipart/form-data')) {
      const f = await request.formData();
      wejscie = { ...Object.fromEntries(f), temat: f.getAll('temat') };
    } else return odp.blad(415, 'zly-format');
  } catch {
    return odp.blad(400, 'zly-format');
  }
  if (!wejscie || typeof wejscie !== 'object') return odp.blad(400, 'zly-format');

  // Pole-pułapka: automat dostaje „sukces”, my nie dostajemy nic
  if (String(wejscie[POLE_PULAPKA] ?? '').trim()) return odp.ok();

  const teraz = Date.now();
  const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || request.headers.get('x-real-ip') || '';
  if (zaDuzo(ip, teraz)) return odp.blad(429, 'limit');

  const { dane, bledy } = sprawdz(wejscie);
  if (bledy) return odp.blad(400, 'bledne-dane', bledy);

  // Z app.js przychodzi czas od pokazania formularza; zbyt szybkie wypełnienie wygląda na automat
  const czas = Number(wejscie.t);
  const podejrzane = jakoJson && !(czas >= MIN_CZAS_MS) ? 'formularz wypełniono w mniej niż 3 sekundy' : undefined;

  const od = env.FORMULARZ_OD || DOMYSLNIE_OD;
  const doNas = env.FORMULARZ_DO || DOMYSLNIE_DO;
  const data = new Date(teraz);
  const maile = [{ nazwa: 'do-nas', mail: { from: od, to: [doNas], ...(dane.email ? { reply_to: dane.kontakt } : {}), ...mailDoNas(dane, { teraz: data, podejrzane }) } }];
  if (dane.email && !podejrzane) maile.push({ nazwa: 'do-klienta', mail: { from: od, to: [dane.kontakt], reply_to: doNas, ...mailDoKlienta(dane) } });

  if (!env.RESEND_API_KEY) {
    if (env.FORMULARZ_PODGLAD) {
      for (const { nazwa, mail } of maile) zapiszPodglad(env.FORMULARZ_PODGLAD, nazwa, mail);
      return odp.ok();
    }
    console.error('[formularz] brak RESEND_API_KEY w zmiennych środowiskowych');
    return odp.blad(500, 'brak-konfiguracji');
  }

  // Najpierw zgłoszenie do nas: bez niego klient musi zobaczyć błąd z adresem e-mail
  try {
    await wyslijResend(env.RESEND_API_KEY, maile[0].mail);
  } catch (e) {
    console.error('[formularz] nie wysłano zgłoszenia:', e.message);
    return odp.blad(502, 'wysylka');
  }
  // Potwierdzenie dla klienta: jego błąd nie psuje zgłoszenia, które już do nas dotarło
  if (maile[1]) {
    try { await wyslijResend(env.RESEND_API_KEY, maile[1].mail); } catch (e) { console.error('[formularz] nie wysłano potwierdzenia:', e.message); }
  }
  return odp.ok();
}
