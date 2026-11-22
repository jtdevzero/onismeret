/* Felméréses megosztókártya tartalma (tiszta függvény). Alapból semmilyen személyes adat nem kerül rá:
   név nincs, az életkor, nem, fittségi kor és a pontos nap csak kifejezett bekapcsolásra.
   Fejlődési különbséget nem tartalmaz (azt csak azonos pontozású felmérések között lehetne). */
export const SHARE_DEFAULTS = Object.freeze({ age: false, fitnessAge: false, exactDate: false });
const MONTHS = ['január', 'február', 'március', 'április', 'május', 'június', 'július', 'augusztus', 'szeptember', 'október', 'november', 'december'];

/* item: felmérés · ev: kiértékelés ({ areas, overall, fitnessAge }) · areas: [{ id, short }] · opts: SHARE_DEFAULTS szerint */
export function buildAssessmentShare(item, ev, areas, opts = {}) {
  const o = { ...SHARE_DEFAULTS, ...opts };
  const d = new Date(item.date);
  const axes = areas.filter(a => ev.areas && ev.areas[a.id] && Number.isFinite(ev.areas[a.id].score)).map(a => ({ label: a.short, value: Math.round(ev.areas[a.id].score) }));
  const lines = [];
  if (Number.isFinite(ev.overall)) lines.push(`Összesített: ${Math.round(ev.overall)} / 100 (saját skála, nem percentilis)`);
  if (o.fitnessAge && Number.isFinite(ev.fitnessAge)) lines.push(`Fittségi kor: ${Math.round(ev.fitnessAge)} év (kérdőíves VO₂max-becslés)`);
  if (o.age && item.profile && Number.isFinite(item.profile.age)) lines.push(`${item.profile.age} éves ${item.profile.sex === 'female' ? 'nő' : item.profile.sex === 'male' ? 'férfi' : ''}`.trim());
  const when = o.exactDate ? `${d.getFullYear()}. ${MONTHS[d.getMonth()]} ${d.getDate()}.` : `${d.getFullYear()}. ${MONTHS[d.getMonth()]}`;
  return { title: 'Felmérés', when, axes, lines, footer: 'Tájékoztató önfelmérés, nem orvosi vizsgálat.' };
}
