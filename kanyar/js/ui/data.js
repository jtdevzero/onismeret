/* A tartalom (gyakorlatok, leckék, hibakatalógus) betöltése és a közös állapot. */
import { kvGet, kvSet } from './store.js';

export const D = { exercises: null, lessons: null, faults: null, ex: {}, lesson: {} };
export const S = { settings: null }; /* beállítások: { sport, level, stance, health: { pain }, accepted, ai: { url, code } } */

const DATA = new URL('../../data/', import.meta.url);
async function load(name) {
  const r = await fetch(new URL(name, DATA));
  if (!r.ok) throw new Error('Nem tölthető be: ' + name);
  return r.json();
}
export async function loadData() {
  [D.exercises, D.lessons, D.faults] = await Promise.all([load('exercises.json'), load('lessons.json'), load('faults.json')]);
  D.ex = Object.fromEntries(D.exercises.exercises.map(e => [e.id, e]));
  D.lesson = Object.fromEntries(D.lessons.lessons.map(l => [l.id, l]));
  S.settings = await kvGet('settings', null);
}
export async function saveSettings(patch) {
  S.settings = { ...(S.settings || {}), ...patch };
  await kvSet('settings', S.settings);
  return S.settings;
}
export const sportName = s => (s === 'snowboard' ? 'Snowboard' : 'Sí');
export const levelName = (sport, level) => (D.lessons.levels[sport] || [])[level - 1] || '';
export const lessonsFor = (sport, kind, level) => D.lessons.lessons.filter(l => l.kind === kind && (l.sport === sport || l.sport === 'both') && (level == null || l.level === level));
