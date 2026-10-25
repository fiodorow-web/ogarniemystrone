// IndexNow: zgłasza zmienione podstrony Bingowi i innym wyszukiwarkom, które go obsługują (Google go nie używa).
// Klucz jest jawny z założenia: plik public/<klucz>.txt potwierdza, że zgłoszenie pochodzi od właściciela domeny.
// Wywołuje go tools/po-buildzie.mjs, tylko przy wdrożeniu produkcji na Vercelu.

export const INDEXNOW_KLUCZ = 'dd24ff5e8f3017cee739aa3610951670';

/** Wysyła listę adresów. Błąd tylko ostrzega, nigdy nie przerywa builda. */
export async function zglosIndexNow(site, urls, logger) {
  try {
    const r = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host: new URL(site).host, key: INDEXNOW_KLUCZ, keyLocation: `${site}/${INDEXNOW_KLUCZ}.txt`, urlList: urls }),
      signal: AbortSignal.timeout(8000),
    });
    logger.info(`IndexNow: zgłoszono ${urls.length} adres(y), odpowiedź ${r.status}`);
  } catch (e) {
    logger.warn(`IndexNow: nie wysłano zgłoszenia (${e.message})`);
  }
}
