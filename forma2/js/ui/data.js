/* A tartalom (tesztek, normák, gyakorlatok, ábrák) betöltése és a közös állapot. */
import { setLocale, getLocale, tr } from './i18n.js';
import { kvGet, kvSet } from './store.js';
import { applyContent } from '../core/content-i18n.js';

export const D = { tests: null, norms: null, exercises: null, routines: [], figures: {}, ex: {}, test: {}, area: {} };
/* beállítások: { accepted, profile: { age, sex }, parq: { kérdés: igen/nem }, lowImpact, reminder: { time } } */
export const S = { settings: null };

const DATA = new URL('../../data/', import.meta.url);
async function load(name) {
  const r = await fetch(new URL(name, DATA));
  if (!r.ok) throw new Error('Nem tölthető be: ' + name);
  return r.json();
}
export async function loadData() {
  let figures, routines;
  [D.tests, D.norms, D.exercises, figures, routines] = await Promise.all([load('tests.json'), load('norms.json'), load('exercises.json'), load('figures.json'), load('routines.json')]);
  D.routines = routines.routines;
  D.figures = figures.figures;
  D.ex = Object.fromEntries(D.exercises.exercises.map(e => [e.id, e]));
  D.test = Object.fromEntries(D.tests.tests.map(t => [t.id, t]));
  /* angolul a tartalmi szövegek az angol rétegből (azonosító szerint); hiba esetén a magyar marad */
  if (getLocale() === 'en') { try { D.content = await load('content-en.json'); applyContent({ exercises: D.exercises, tests: D.tests, routines: D.routines, figures: D.figures }, D.content); } catch { D.content = null; } }
  D.area = Object.fromEntries(D.tests.areas.map(a => [a.id, a]));
  S.settings = await kvGet('settings', null);
}
export async function saveSettings(patch) {
  S.settings = { ...(S.settings || {}), ...patch };
  await kvSet('settings', S.settings);
  return S.settings;
}
export const profile = () => (S.settings && S.settings.profile) || {};
export const lowImpact = () => !!(S.settings && S.settings.lowImpact);

/* Megjelenés: téma (auto / világos / sötét) és betűméret, a gyökérelem adatattribútumaival. */
export function applyLook(st = S.settings || {}) {
  const r = document.documentElement;
  /* ha a mentett nyelv eltér az induláskor (localStorage-ből) beállítottól, egyszer újratöltünk, hogy a modulok szövegei is a jó nyelven készüljenek */
  const before = getLocale();
  setLocale(st.lang);
  if (st.lang && before !== getLocale()) { try { if (!sessionStorage.getItem('forma-lang-reload')) { sessionStorage.setItem('forma-lang-reload', '1'); location.reload(); return; } } catch { /* nem létfontosságú */ } }
  /* a fő menü feliratai a nyelv szerint (a váz statikus HTML) */
  for (const sp of document.querySelectorAll('#nav a > span:last-child')) { if (!sp.dataset.hu) sp.dataset.hu = sp.textContent; sp.textContent = tr(sp.dataset.hu); }
  if (['light', 'dark', 'sun'].includes(st.theme)) r.dataset.theme = st.theme; else delete r.dataset.theme;
  if (st.size === 'large') r.dataset.size = 'large'; else delete r.dataset.size;
}

/* heti edzéscél (szokáscél): a beállításból, alapból 5 */
export const weeklyGoal = () => (S.settings && Number.isInteger(S.settings.weeklyGoal) ? S.settings.weeklyGoal : 5);

/* szakmai átnézés: csak akkor igaz, ha a normák, a tesztek és a gyakorlatok is átnézettként vannak jelölve */
export const reviewed = () => !!(D.norms && D.norms.reviewed && D.tests && D.tests.reviewed && D.exercises && D.exercises.reviewed);
export const reviewText = () => (reviewed() ? `Szakember átnézte (${String(D.norms.reviewDate || '').slice(0, 7).replace('-', '. ')}.).` : 'Szakember még nem lektorálta.');
