// POST /api/kontakt: formularz kontaktowy jako funkcja Vercela (Node.js). Reszta strony zostaje statyczna.
// Cała logika jest w src/formularz/ (lokalnie używa jej też tools/serve.mjs).
import { obsluzZgloszenie } from '../src/formularz/obsluga.js';

export default {
  fetch: (request) => obsluzZgloszenie(request, process.env),
};
