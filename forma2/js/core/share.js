import { tr } from '../ui/i18n.js';
/* Felméréses megosztókártya tartalma (tiszta függvény). Alapból semmilyen személyes adat nem kerül rá:
   név nincs, az életkor, nem, fittségi kor és a pontos nap csak kifejezett bekapcsolásra.
   Fejlődési különbséget nem tartalmaz (azt csak azonos pontozású felmérések között lehetne). */
export const SHARE_DEFAULTS = Object.freeze({ age: false, fitnessAge: false, exactDate: false });
const MONTHS = [tr('január'), tr('február'), tr('március'), tr('április'), tr('május'), tr('június'), tr('július'), tr('augusztus'), tr('szeptember'), tr('október'), tr('november'), tr('december')];

/* item: felmérés · ev: kiértékelés ({ areas, overall, fitnessAge }) · areas: [{ id, short }] · opts: SHARE_DEFAULTS szerint */
export function buildAssessmentShare(item, ev, areas, opts = {}) {
  const o = { ...SHARE_DEFAULTS, ...opts };
  const d = new Date(item.date);
  const axes = areas.filter(a => ev.areas && ev.areas[a.id] && Number.isFinite(ev.areas[a.id].score)).map(a => ({ label: a.short, value: Math.round(ev.areas[a.id].score) }));
  const lines = [];
  if (Number.isFinite(ev.overall)) lines.push(tr('Összesített: {p0} / 100 (saját skála, nem percentilis)', { p0: Math.round(ev.overall) }));
  if (o.fitnessAge && Number.isFinite(ev.fitnessAge)) lines.push(tr('Fittségi kor: {p0} év (kérdőíves VO₂max-becslés)', { p0: Math.round(ev.fitnessAge) }));
  if (o.age && item.profile && Number.isFinite(item.profile.age)) lines.push(tr('{p0} éves {p1}', { p0: item.profile.age, p1: item.profile.sex === 'female' ? 'nő' : item.profile.sex === 'male' ? 'férfi' : '' }).trim());
  const when = o.exactDate ? tr('{y}. {m} {d}.', { y: d.getFullYear(), m: MONTHS[d.getMonth()], d: d.getDate() }) : tr('{y}. {m}', { y: d.getFullYear(), m: MONTHS[d.getMonth()] });
  return { title: tr('Felmérés'), when, axes, lines, footer: tr('Tájékoztató önfelmérés, nem orvosi vizsgálat.') };
}
