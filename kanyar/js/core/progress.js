/* Haladás és napi terv: tiszta függvények a naplóbejegyzésekből.
   A bejegyzések: { kind: 'snow' | 'exercise' | 'workout' | 'day', date, ... } */
import { RELIABLE } from './snow.js';

const WEEK = 7 * 24 * 3600 * 1000;
/* A hét hétfő 00:00-kor kezdődik (helyi idő szerint). */
export function weekStart(ts) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d.getTime();
}

/* Az utolsó `weeks` hét aktivitása, a legrégebbitől. → [{ start, workouts, exercises, snow, total }] */
export function weeklyActivity(items, now = Date.now(), weeks = 8) {
  const last = weekStart(now), out = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const d = new Date(last); d.setDate(d.getDate() - 7 * i);
    out.push({ start: d.getTime(), workouts: 0, exercises: 0, snow: 0, days: 0, total: 0 });
  }
  for (const it of items) {
    const w = out.find(x => x.start === weekStart(it.date));
    if (!w) continue;
    if (it.kind === 'workout') w.workouts++; else if (it.kind === 'exercise') w.exercises++; else if (it.kind === 'snow') w.snow++; else if (it.kind === 'day') w.days++; else continue;
    w.total++;
  }
  return out;
}
/* Hány egymást követő héten volt legalább egy bejegyzés (az aktuális hét még nyitott: ha üres, nem töri meg). */
export function weekStreak(items, now = Date.now()) {
  const a = weeklyActivity(items, now, 26).reverse();
  let n = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i].total) n++; else if (i === 0) continue; else break;
  }
  return n;
}

/* Havas mutatók időrendben: mutatónként a megbízható mérések sávja a legrégebbitől.
   Csak az adott sportág elemzései; a nézet nem számít, mert a nem használható mutató kimarad.
   → [{ id, points: [{ date, band }], okNow, trend: 'better' | 'worse' | 'same' }] legalább két méréssel */
export function metricTrails(items, sport) {
  const runs = items.filter(i => i.kind === 'snow' && i.sport === sport && i.analysis && i.analysis.ok).sort((a, b) => a.date - b.date);
  const map = new Map();
  for (const r of runs) for (const [id, m] of Object.entries(r.analysis.metrics)) {
    if (!m.usable || m.confidence < RELIABLE || !m.band) continue;
    if (!map.has(id)) map.set(id, []);
    map.get(id).push({ date: r.date, band: m.band });
  }
  const out = [];
  for (const [id, points] of map) {
    if (points.length < 2) continue;
    const first = points[0].band === 'ok', lastOk = points[points.length - 1].band === 'ok';
    out.push({ id, points, okNow: lastOk, trend: lastOk === first ? 'same' : lastOk ? 'better' : 'worse' });
  }
  return out;
}

/* Napi terv a hegyre az utolsó elemzés fő hibájára: bemelegítés, legfeljebb három gyakorlat, újrafilmezés.
   coach: az elemzés edzői válasza · catalog: hibakatalógus · lessons: a leckék listája · → { faultId, drills: [leckeazonosítók] } */
export function dayPlan(coach, catalog, lessons, sport, level) {
  const fault = coach && coach.main_issue && coach.main_issue.id ? catalog.faults.find(f => f.id === coach.main_issue.id) : null;
  const ok = id => lessons.some(l => l.id === id);
  const picks = [];
  const add = id => { if (id && ok(id) && !picks.includes(id) && picks.length < 3) picks.push(id); };
  /* előbb az edző által kiadott gyakorlat, aztán a hibához tartozó többi */
  if (coach) add(coach.drill_id);
  if (fault) fault.drills.forEach(add);
  /* ha kevés, a szint leckéi töltik fel (a legutolsótól visszafelé: azok a legfrissebb anyagok) */
  const own = lessons.filter(l => l.kind === 'lesson' && l.sport === sport && l.level === level).map(l => l.id).reverse();
  own.forEach(add);
  return { faultId: fault ? fault.id : null, drills: picks };
}

/* Ugyanarra a naptári napra esik-e két időpont (helyi idő szerint). */
export const sameDay = (a, b) => new Date(a).toDateString() === new Date(b).toDateString();
/* Egy pályanap-bejegyzéshez tartozó havas elemzések: amelyek ugyanazon a napon készültek. */
export const runsOfDay = (items, day) => items.filter(i => i.kind === 'snow' && sameDay(i.date, day.date));
/* A pályanap rögzített mezőinek ellenőrzése (az importált adatnál is). → tisztított bejegyzés vagy null */
export function cleanDay(o, lists) {
  if (!o || typeof o !== 'object') return null;
  const pick = (v, arr) => (Number.isInteger(v) && v >= 0 && v < arr.length ? v : null);
  const runs = Number.isInteger(o.runs) && o.runs >= 0 && o.runs <= 200 ? o.runs : null;
  return {
    snow: pick(o.snow, lists.snow), vis: pick(o.vis, lists.visibility), tired: pick(o.tired, lists.tired), runs,
    note: typeof o.note === 'string' ? o.note.trim().slice(0, 300) : '',
  };
}
