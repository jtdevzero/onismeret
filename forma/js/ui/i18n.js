/* Nyelv: a magyar az alap; angolul a fordítási szótárból (i18n-en.js). A kulcs maga a magyar szöveg, így a magyar felület
   változatlan, és egy hiányzó fordítás magyarul jelenik meg (a teszt jelzi a hiányzó kulcsokat).
   Paraméter: t('{n}. hét', { n: 3 }). A belső adatok (kg, cm, másodperc, időbélyeg) nyelvtől függetlenek. */
import EN from './i18n-en.js';

let locale = 'hu';
export const LOCALES = [['hu', 'Magyar'], ['en', 'English (béta)']];
export const getLocale = () => locale;
export function setLocale(l) {
  locale = l === 'en' ? 'en' : 'hu';
  if (typeof document !== 'undefined') document.documentElement.lang = locale;
}
export function t(s, params) {
  let out = locale === 'en' && Object.prototype.hasOwnProperty.call(EN, s) ? EN[s] : s;
  if (params) out = out.replace(/\{(\w+)\}/g, (m, k) => (params[k] != null ? String(params[k]) : m));
  return out;
}
/* számok és dátumok a nyelv szerint */
export const fmtNumber = (v, opts) => new Intl.NumberFormat(locale === 'en' ? 'en-GB' : 'hu-HU', opts).format(v);
export const fmtDay = ts => new Date(ts).toLocaleDateString(locale === 'en' ? 'en-GB' : 'hu-HU');
