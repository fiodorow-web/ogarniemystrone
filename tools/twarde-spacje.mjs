// Twarde spacje (brandbook, sekcja 8) w treściach z Markdowna, żeby nie wpisywać &nbsp; ręcznie:
// po jednoliterowych słowach (a, i, o, u, w, z), przed „zł” i „h” po liczbie, w liczbach typu „1 999”
// i między liczbą a następnym słowem („10 rzeczy”, „2026 roku”).
const NBSP = ' ';

export function twarde(s) {
  return s
    .replace(/(?<=^|[\s(„])([aiouwzAIOUWZ]) /g, `$1${NBSP}`)
    .replace(/(\d) (?=\d{3}(?!\d))/g, `$1${NBSP}`)
    .replace(/(\d) (?=(zł|h)(?=[\s.,;:!?)]|$))/g, `$1${NBSP}`)
    .replace(/(\d) (?=\p{Ll})/gu, `$1${NBSP}`)
    .replace(/ (?=zł(?=[\s.,;:!?)]|$))/g, NBSP);
}

/** To samo w gotowym HTML (wpis z Markdowna): zmienia tylko tekst, pomija znaczniki oraz <code> i <pre>. */
export function twardeHtml(html) {
  let kod = 0;
  return html.split(/(<[^>]+>)/).map((part) => {
    if (part.startsWith('<')) {
      if (/^<(code|pre)/i.test(part)) kod++;
      else if (/^<\/(code|pre)>/i.test(part)) kod--;
      return part;
    }
    return kod > 0 ? part : twarde(part);
  }).join('');
}
