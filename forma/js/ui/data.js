/* A tartalom (tesztek, normák, gyakorlatok, ábrák) betöltése és a közös állapot. */
import { kvGet, kvSet } from './store.js';

export const D = { tests: null, norms: null, exercises: null, figures: {}, ex: {}, test: {}, area: {} };
/* beállítások: { accepted, profile: { age, sex }, parq: { kérdés: igen/nem }, lowImpact, reminder: { time } } */
export const S = { settings: null };

const DATA = new URL('../../data/', import.meta.url);
async function load(name) {
  const r = await fetch(new URL(name, DATA));
  if (!r.ok) throw new Error('Nem tölthető be: ' + name);
  return r.json();
}
export async function loadData() {
  let figures;
  [D.tests, D.norms, D.exercises, figures] = await Promise.all([load('tests.json'), load('norms.json'), load('exercises.json'), load('figures.json')]);
  D.figures = figures.figures;
  D.ex = Object.fromEntries(D.exercises.exercises.map(e => [e.id, e]));
  D.test = Object.fromEntries(D.tests.tests.map(t => [t.id, t]));
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
