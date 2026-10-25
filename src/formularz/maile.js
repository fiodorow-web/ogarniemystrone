// Maile z formularza kontaktowego: zgłoszenie do nas i potwierdzenie dla klienta.
// HTML na tabelach i stylach w atrybutach, bo tylko to działa w Gmailu i Outlooku. Kolory z palety marki.
// Potwierdzenie dla klienta nie powtarza treści wiadomości: formularz może wpisać cudzy adres,
// więc do obcej skrzynki nie może trafić nic poza naszym stałym tekstem i imieniem (sprawdzonym w obsluga.js).

const STRONA = 'https://ogarniemystrone.pl';
const EMAIL = 'kontakt@ogarniemystrone.pl';
const LOGO = `${STRONA}/stopka/logo-stopka.png`; // 597 × 129, ten sam plik co w stopkach maili

const K = {
  tlo: '#f4f6f2', karta: '#ffffff', tekst: '#111714', szary: '#56605b', linia: '#dde3df',
  zielony: '#0d6a4f', limonka: '#c8f169', mieta: '#ddf0e6',
};
const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const akapity = (s) => esc(s).replace(/\r?\n/g, '<br>');
// Twarde spacje po jednoliterowych słowach (brandbook, sekcja 8) w tekstach wersji bez HTML
const twarde = (s) => s.replace(/(^|\s)([aiouwzAIOUWZ])\s/g, '$1$2 ');

const dataPL = (d, opcje) => new Intl.DateTimeFormat('pl-PL', { timeZone: 'Europe/Warsaw', ...opcje }).format(d);
const kiedy = (d) => dataPL(d, { weekday: 'long', day: 'numeric', month: 'long', hour: 'numeric', minute: '2-digit' });
const weekend = (t) => ['Sat', 'Sun'].includes(new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Warsaw', weekday: 'short' }).format(t));

const godzinaPL = (t) => {
  const c = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Warsaw', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(t).map((x) => [x.type, Number(x.value)]));
  return { h: c.hour, m: c.minute };
};

/**
 * Termin z obietnicy „odpowiedź do 24 h w dni robocze”: liczymy tylko godziny od poniedziałku do piątku (święta pomijamy).
 * Zgłoszenie z weekendu liczymy od poniedziałku 9:00, więc termin wypada we wtorek o 9:00.
 */
export function terminOdpowiedzi(teraz) {
  let t = teraz.getTime();
  if (weekend(t)) {
    while (weekend(t)) t += 3600e3;
    const { h, m } = godzinaPL(t);
    t += ((9 - h) * 60 - m) * 60e3;
  }
  let godziny = 24;
  while (godziny > 0) {
    if (!weekend(t)) godziny--;
    t += 3600e3;
  }
  return new Date(t);
}

// ── Klocki ────────────────────────────────────────────────────────────
const ukryty = (tekst) => `<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all">${esc(tekst)}&#8204;&nbsp;&#8204;&nbsp;&#8204;&nbsp;&#8204;&nbsp;&#8204;&nbsp;&#8204;&nbsp;&#8204;&nbsp;&#8204;&nbsp;</div>`;

const etykieta = (tekst) => `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td style="width:22px;border-top:2px solid ${K.zielony};font-size:0;line-height:0">&nbsp;</td>
<td style="padding-left:10px;font:600 12px/1 ${FONT};letter-spacing:.16em;text-transform:uppercase;color:${K.szary}">${tekst}</td>
</tr></table>`;

const przycisk = (href, tekst, glowny = true) => `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="display:inline-table;margin:0 8px 8px 0"><tr>
<td style="border-radius:999px;background:${glowny ? K.zielony : K.karta};border:1.5px solid ${K.zielony}">
<a href="${esc(href)}" style="display:inline-block;padding:13px 24px;font:600 15px/1.2 ${FONT};color:${glowny ? '#ffffff' : K.zielony};text-decoration:none;border-radius:999px">${tekst}</a>
</td></tr></table>`;

const pigulka = (tekst, tlo = K.mieta) => `<span style="display:inline-block;margin:0 6px 6px 0;padding:6px 12px;border-radius:999px;background:${tlo};font:600 13px/1.2 ${FONT};color:${K.tekst}">${tekst}</span>`;

const szkielet = ({ jezyk = 'pl', tytul, zajawka, tresc, stopka }) => `<!doctype html>
<html lang="${jezyk}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${esc(tytul)}</title>
</head>
<body style="margin:0;padding:0;background:${K.tlo};-webkit-text-size-adjust:100%">
${ukryty(zajawka)}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${K.tlo}">
<tr><td align="center" style="padding:28px 14px 36px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px">
<tr><td style="background:${K.karta};border-radius:20px;border:1px solid ${K.linia};padding:22px 28px 28px">
<a href="${STRONA}"><img src="${LOGO}" width="150" height="32" alt="Ogarniemy Stronę" style="display:block;border:0;width:150px;height:auto;margin:0 0 22px -6px"></a>
${tresc}
</td></tr>
<tr><td style="padding:18px 8px 0;font:13px/1.6 ${FONT};color:${K.szary}">${stopka}</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

// ── Zgłoszenie do nas ─────────────────────────────────────────────────
// Odpisać można przyciskiem „Odpisz” (nowy mail do klienta z cytatem jego wiadomości) albo zwykłym „Odpowiedz”
// (Reply-To = klient). W obu przypadkach klient może zobaczyć ten mail w cytacie, więc temat i dopiski są neutralne.
const CYTAT_MAX = 500; // dłuższa wiadomość jest ucinana, bo programy pocztowe nie przyjmują bardzo długich linków mailto
function trescOdpowiedzi(d, teraz) {
  const wiad = d.wiadomosc.length > CYTAT_MAX ? `${d.wiadomosc.slice(0, CYTAT_MAX).replace(/\s+\S*$/, '')} […]` : d.wiadomosc;
  const cytat = [d.temat.length > 0 && d.temat.join(', '), ...(wiad ? wiad.split('\n') : [])].filter((l) => l !== false);
  const linie = ['Dzień dobry,', '', '', ''];
  if (cytat.length) linie.push('--', `Twoja wiadomość z formularza na ogarniemystrone.pl (${dataPL(teraz, { day: 'numeric', month: 'long', hour: 'numeric', minute: '2-digit' })}):`, ...cytat.map((l) => `> ${l}`));
  return linie.join('\r\n');
}

/**
 * @param {{imie:string, firma:string, kontakt:string, email:boolean, temat:string[], wiadomosc:string}} d
 * @param {{teraz:Date, podejrzane?:string}} meta  podejrzane: powód, gdy zgłoszenie wygląda na automat (wysyłamy, ale bez potwierdzenia dla klienta)
 */
export function mailDoNas(d, { teraz, podejrzane }) {
  const kto = d.firma ? `${d.imie} · ${d.firma}` : d.imie;
  const termin = kiedy(terminOdpowiedzi(teraz));
  const tel = d.kontakt.replace(/[^\d+]/g, '');
  const odpisz = d.email
    ? przycisk(`mailto:${d.kontakt}?subject=${encodeURIComponent('Twoja wiadomość do Ogarniemy Stronę')}&body=${encodeURIComponent(trescOdpowiedzi(d, teraz))}`, 'Odpisz')
    : przycisk(`tel:${tel}`, 'Zadzwoń');
  const sms = d.email ? '' : przycisk(`sms:${tel}`, 'Napisz SMS', false);

  const tresc = `
${podejrzane ? `<p style="margin:0 0 18px;padding:12px 14px;border-radius:12px;background:#fff4d6;font:14px/1.5 ${FONT};color:${K.tekst}"><b>Uwaga, to może być automat:</b> ${esc(podejrzane)}. Klient nie dostał potwierdzenia.</p>` : ''}
${etykieta('Zapytanie ze strony')}
<h1 style="margin:14px 0 6px;font:800 30px/1.1 ${FONT};letter-spacing:-.02em;color:${K.tekst}">${esc(kto)}</h1>
<p style="margin:0 0 18px;font:16px/1.5 ${FONT}"><a href="${d.email ? `mailto:${esc(d.kontakt)}` : `tel:${esc(tel)}`}" style="color:${K.zielony};font-weight:600;text-decoration:underline">${esc(d.kontakt)}</a></p>
${d.temat.length ? `<div style="margin:0 0 14px">${d.temat.map((t) => pigulka(esc(t))).join('')}</div>` : ''}
<div style="margin:6px 0 22px;padding:16px 18px;border-radius:14px;background:${K.tlo};border-left:4px solid ${K.limonka};font:16px/1.6 ${FONT};color:${K.tekst}">${d.wiadomosc ? akapity(d.wiadomosc) : `<span style="color:${K.szary}">Bez wiadomości, tylko dane kontaktowe.</span>`}</div>
<div>${odpisz}${sms}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:14px;border-top:1px solid ${K.linia}"><tr>
<td style="padding-top:14px;font:14px/1.5 ${FONT};color:${K.szary}">Termin odpowiedzi (24&nbsp;h w&nbsp;dni robocze):<br><b style="color:${K.tekst}">${esc(termin)}</b></td>
</tr></table>`;

  const stopka = `Wysłane ${esc(kiedy(teraz))} z&nbsp;formularza na <a href="${STRONA}/kontakt" style="color:${K.szary}">ogarniemystrone.pl/kontakt</a>.${d.email ? ` Odpowiedź na tego maila trafi do: ${esc(d.kontakt)}.` : ''}`;

  // false = pole niewypełnione, wiersz znika
  const text = [
    podejrzane && `UWAGA, to może być automat: ${podejrzane}. Klient nie dostał potwierdzenia.\n`,
    `Zapytanie ze strony`,
    ``,
    `Imię: ${d.imie}`,
    !!d.firma && `Firma: ${d.firma}`,
    `${d.email ? 'E-mail' : 'Telefon'}: ${d.kontakt}`,
    d.temat.length > 0 && `Czego potrzebuje: ${d.temat.join(', ')}`,
    ``,
    d.wiadomosc || '(bez wiadomości)',
    ``,
    twarde(`Termin odpowiedzi (24 h w dni robocze): ${termin}`),
    `Wysłane ${kiedy(teraz)} z formularza na ogarniemystrone.pl/kontakt.${d.email ? ` Odpowiedź na tego maila trafi do: ${d.kontakt}.` : ''}`,
  ].filter((l) => l !== false && l !== undefined).join('\n');

  return {
    subject: `${podejrzane ? '[możliwy spam] ' : ''}Zapytanie ze strony: ${kto}`,
    html: szkielet({ tytul: `Zapytanie ze strony: ${kto}`, zajawka: `${d.kontakt}${d.temat.length ? ' · ' + d.temat.join(', ') : ''}`, tresc, stopka }),
    text,
  };
}

// ── Potwierdzenie dla klienta ─────────────────────────────────────────
// Kroki i zdania o płatności dosłownie ze strony głównej (zatwierdzone brzmienie, SPRZEDAZ.md).
const KROKI = [
  ['01', 'Rozmowa', 'Krótko o&nbsp;Twojej firmie i&nbsp;o&nbsp;tym, co ma się znaleźć na stronie.', 'Bezpłatnie, z&nbsp;wyceną'],
  ['02', 'Projekt', 'Pokazujemy projekt na telefonie i&nbsp;komputerze. Poprawki wprowadzamy przed startem.', 'Połowa kwoty, gdy projekt Ci się spodoba'],
  ['03', 'Treści', 'Teksty piszemy my. Przed publikacją zatwierdzasz je mailem.', ''],
  ['04', 'Start i&nbsp;opieka', 'Strona startuje pod Twoim adresem, a&nbsp;my zostajemy po starcie.', 'Druga połowa po zrobieniu strony'],
];
const bezTagow = (s) => s.replace(/&nbsp;/g, ' ');

/** @param {{imie:string, temat:string[]}} d */
export function mailDoKlienta(d) {
  const imie = d.imie.split(/\s+/)[0];
  const kroki = KROKI.map(([n, h, p, platnosc], i) => `<tr>
<td valign="top" style="width:44px;padding:${i ? '16px' : '4px'} 0 0;font:800 15px/1.4 ${FONT};color:${K.zielony}">${n}</td>
<td valign="top" style="padding:${i ? '16px' : '4px'} 0 0;font:15px/1.55 ${FONT};color:${K.tekst}"><b style="font-size:16px">${h}</b><br><span style="color:${K.szary}">${p}</span>${platnosc ? `<br><span style="display:inline-block;margin-top:8px;padding:5px 11px;border-radius:999px;background:${K.limonka};font:600 13px/1.2 ${FONT};color:${K.tekst}">${platnosc}</span>` : ''}</td>
</tr>`).join('');

  const tresc = `
${etykieta('Dotarło')}
<h1 style="margin:14px 0 12px;font:800 32px/1.1 ${FONT};letter-spacing:-.02em;color:${K.tekst}">Dziękujemy, ${esc(imie)}.</h1>
<p style="margin:0 0 8px;font:17px/1.6 ${FONT};color:${K.tekst}">Twoja wiadomość jest już u&nbsp;nas. Odpiszemy do 24&nbsp;h w&nbsp;dni robocze, żeby umówić termin rozmowy.</p>
${d.temat.length ? `<div style="margin:14px 0 4px">${d.temat.map((t) => pigulka(esc(t))).join('')}</div>` : ''}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:22px 0 4px;border-top:1px solid ${K.linia}"><tr><td style="padding-top:20px">
${etykieta('Co dalej')}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:12px">${kroki}</table>
</td></tr></table>
<p style="margin:24px 0 0;font:16px/1.6 ${FONT};color:${K.tekst}">Chcesz coś dopisać? Po prostu odpowiedz na tego maila.</p>
<p style="margin:18px 0 0;font:16px/1.5 ${FONT};color:${K.tekst}"><b>Mateusz i&nbsp;Sebastian</b><br><span style="color:${K.szary}">Ogarniemy Stronę</span></p>`;

  const stopka = `<a href="${STRONA}" style="color:${K.zielony};font-weight:600;text-decoration:none">ogarniemystrone.pl</a> · <a href="mailto:${EMAIL}" style="color:${K.szary}">${EMAIL}</a><br>
<span style="font-size:12px">Ten mail wysłaliśmy, bo ten adres wpisano w&nbsp;formularzu na ogarniemystrone.pl. Jeśli to nie Ty, po prostu go zignoruj.</span>`;

  const text = twarde([
    `Dziękujemy, ${imie}.`,
    ``,
    `Twoja wiadomość jest już u nas. Odpiszemy do 24 h w dni robocze, żeby umówić termin rozmowy.`,
    ``,
    `Co dalej:`,
    ...KROKI.map(([n, h, p, platnosc]) => bezTagow(`${n} ${h}: ${p}${platnosc ? ` ${platnosc}.` : ''}`)),
    ``,
    `Chcesz coś dopisać? Po prostu odpowiedz na tego maila.`,
    ``,
    `Mateusz i Sebastian`,
    `Ogarniemy Stronę · ogarniemystrone.pl · ${EMAIL}`,
    ``,
    `Ten mail wysłaliśmy, bo ten adres wpisano w formularzu na ogarniemystrone.pl. Jeśli to nie Ty, po prostu go zignoruj.`,
  ].join('\n'));

  return {
    subject: 'Dziękujemy za wiadomość, odpiszemy do 24 h',
    html: szkielet({ tytul: 'Dziękujemy za wiadomość', zajawka: 'Odpiszemy do 24 h w dni robocze, żeby umówić termin rozmowy.', tresc, stopka }),
    text,
  };
}
