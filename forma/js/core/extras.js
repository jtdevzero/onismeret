/* Regenerációs pontszám, 30 napos kihívások, fittségi kor előrejelzés, ülőmunka-szünetek, import (GPX, CSV),
   kihíváskód és 60 év fölötti „felállás és séta” teszt. Tiszta függvények, DOM nélkül. */
import { icsText, fold } from './calendar.js';
import { tr } from '../ui/i18n.js';

const DAY = 86400000;
const dayStart = ts => { const d = new Date(ts); d.setHours(0, 0, 0, 0); return d.getTime(); };

/* Regenerációs pontszám (0–100): a mai ellenőrzés (alvás, izomláz, energia), a reggeli pulzus a 14 napos átlaghoz
   képest, és az elmúlt 3 nap terhelése. → { score, level: 'go'|'light'|'rest', parts: [...] } vagy null */
export function recoveryScore({ readiness, pulses = [], workouts = [], now = Date.now() } = {}) {
  const parts = [];
  let score = 70, n = 0;
  if (readiness && dayStart(readiness.date) === dayStart(now) && [readiness.sleep, readiness.soreness, readiness.energy].every(v => [1, 2, 3].includes(v))) {
    const r = ((readiness.sleep + readiness.soreness + readiness.energy) - 3) / 6; /* 0…1 */
    score = 40 + 60 * r; n++; parts.push([tr('Közérzet'), Math.round(100 * r)]);
    if (readiness.pain) { score = Math.min(score, 30); parts.push([tr('Fájdalom'), 0]); }
  }
  const ps = pulses.filter(p => p.date >= now - 14 * DAY && Number.isFinite(p.bpm)).sort((a, b) => a.date - b.date);
  const today = ps.filter(p => dayStart(p.date) === dayStart(now)).pop();
  const base = ps.filter(p => dayStart(p.date) < dayStart(now));
  if (today && base.length >= 3) {
    const avg = base.reduce((s, p) => s + p.bpm, 0) / base.length, diff = today.bpm - avg;
    const adj = diff >= 10 ? -25 : diff >= 6 ? -12 : diff <= -3 ? 5 : 0;
    score += adj; n++; parts.push([tr('Reggeli pulzus'), Math.round(diff)]);
  }
  const load = workouts.filter(w => w.date >= dayStart(now) - 3 * DAY && w.date < dayStart(now)).reduce((s, w) => s + (w.minutes || 0), 0);
  if (load > 120) { score -= 10; parts.push([tr('Terhelés (3 nap)'), load]); } else if (load) parts.push([tr('Terhelés (3 nap)'), load]);
  if (!n && !load) return null;
  score = Math.round(Math.max(0, Math.min(100, score)));
  return { score, level: score >= 65 ? 'go' : score >= 40 ? 'light' : 'rest', parts };
}

/* 30 napos kihívások: napi adag fokozatos emeléssel, minden 4. nap könnyebb. */
export const CHALLENGES = [
  { id: 'plank30', name: '30 napos plank', exercise: 'plank', unit: 'mp', start: 20, step: 5, max: 180 },
  { id: 'squat30', name: tr('30 napos guggolás'), exercise: 'squat', unit: tr('ismétlés'), start: 15, step: 3, max: 100 },
  { id: 'push30', name: tr('30 napos fekvőtámasz'), exercise: 'push_knee', unit: tr('ismétlés'), start: 5, step: 1, max: 40 },
  { id: 'mob30', name: tr('30 napos mobilitás'), exercise: 'squat_hold', unit: 'mp', start: 30, step: 5, max: 180 },
];
export function challengeDose(ch, day) {
  if (!ch || day < 1 || day > 30) return null;
  const easy = day % 4 === 0;
  const v = Math.min(ch.max, ch.start + ch.step * (day - 1 - Math.floor(day / 4)));
  return { day, amount: easy ? Math.round(v * 0.7) : v, easy };
}
/* hányadik napnál tart (1-től), a kezdőnaptól számolva */
export const challengeDay = (start, now = Date.now()) => Math.floor((dayStart(now) - dayStart(start)) / DAY) + 1;

/* Fittségi kor előrejelzés: lineáris trend a felmérésekből (legalább 2 pont, legalább 3 hét különbség).
   points: [{ date, age }] → { in90, perMonth } vagy null; a változás havi 2 évre korlátozva. */
export function forecastFitnessAge(points, now = Date.now()) {
  const p = (points || []).filter(x => Number.isFinite(x.age)).sort((a, b) => a.date - b.date);
  if (p.length < 2 || p[p.length - 1].date - p[0].date < 21 * DAY) return null;
  const xs = p.map(x => (x.date - p[0].date) / (30 * DAY)), ys = p.map(x => x.age);
  const mx = xs.reduce((a, b) => a + b) / xs.length, my = ys.reduce((a, b) => a + b) / ys.length;
  const k = xs.reduce((s, x, i) => s + (x - mx) * (ys[i] - my), 0) / (xs.reduce((s, x) => s + (x - mx) ** 2, 0) || 1);
  const slope = Math.max(-2, Math.min(2, k));
  const last = p[p.length - 1], months = (now - last.date) / (30 * DAY) + 3;
  return { in90: Math.round(Math.max(20, Math.min(90, last.age + slope * months))), perMonth: Math.round(slope * 10) / 10 };
}

/* Ülőmunka-szünetek naptárfájlként: hétköznap, a munkaidőben óránként 2 perces mozgásszünet. */
export function breaksIcs({ from = 9, to = 17, start = new Date(), weeks = 4, now = new Date() } = {}) {
  if (!(from >= 0 && to <= 24 && to > from)) throw new Error(tr('Érvénytelen munkaidő.'));
  const pad = n => String(n).padStart(2, '0');
  const st = d => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Forma//Szunetek//HU', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'X-WR-CALNAME:Forma mozgásszünet'];
  const d0 = new Date(start); d0.setHours(0, 0, 0, 0);
  for (let h = from + 1; h < to; h++) {
    const s = new Date(d0); s.setHours(h, 0, 0, 0); const e = new Date(s.getTime() + 2 * 60000);
    lines.push('BEGIN:VEVENT', `UID:forma-break-${h}-${st(s)}@forma.app`, `DTSTAMP:${now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`,
      `DTSTART:${st(s)}`, `DTEND:${st(e)}`, `RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR;COUNT=${weeks * 5}`,
      `SUMMARY:${icsText('Mozgásszünet: állj fel 2 percre')}`, `DESCRIPTION:${icsText('Nyújtózz, sétálj egy kört, vagy indítsd a Forma irodai rutinját.')}`,
      'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${icsText('Mozgásszünet')}`, 'TRIGGER:PT0M', 'END:VALARM', 'END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  return lines.map(fold).join('\r\n') + '\r\n';
}

/* GPX (okosóra, futóapp) → { minutes, km, type, date } vagy null. Csak a trkpt időket és koordinátákat olvassuk. */
export function parseGpx(text, parse) {
  if (typeof text !== 'string' || text.length > 20e6) return null;
  const doc = parse(text);
  const pts = [...doc.getElementsByTagName('trkpt')].map(p => ({ lat: Number(p.getAttribute('lat')), lon: Number(p.getAttribute('lon')), t: Date.parse((p.getElementsByTagName('time')[0] || {}).textContent || '') }))
    .filter(p => Number.isFinite(p.lat) && Number.isFinite(p.lon) && Number.isFinite(p.t));
  if (pts.length < 2) return null;
  const R = 6371, rad = x => x * Math.PI / 180;
  let km = 0;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i], dl = rad(b.lat - a.lat), dn = rad(b.lon - a.lon);
    const h = Math.sin(dl / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dn / 2) ** 2;
    km += 2 * R * Math.asin(Math.sqrt(h));
  }
  const minutes = Math.round((pts[pts.length - 1].t - pts[0].t) / 60000);
  if (minutes < 1 || minutes > 600) return null;
  const kmh = km / (minutes / 60), type = kmh > 15 ? 'bike' : kmh > 7.5 ? 'run' : kmh > 5.5 ? 'jog' : 'walk';
  return { minutes, km: Math.round(km * 100) / 100, type, date: pts[0].t };
}

/* CSV: dátum;perc;típus (vessző vagy pontosvessző). → [{ date, minutes, type }] (érvénytelen sorok kihagyva) */
export function parseCsv(text, types) {
  if (typeof text !== 'string' || text.length > 2e6) return [];
  const map = { walk: 'walk', séta: 'walk', jog: 'jog', kocogás: 'jog', run: 'run', futás: 'run', bike: 'bike', kerékpár: 'bike', bicikli: 'bike', swim: 'swim', úszás: 'swim' };
  return text.split(/\r?\n/).slice(0, 2000).map(l => l.split(/[;,\t]/).map(x => x.trim())).map(([d, m, t]) => {
    const date = Date.parse(d), minutes = Number(m), type = map[(t || '').toLowerCase()] || 'other';
    return Number.isFinite(date) && minutes >= 1 && minutes <= 600 && types.includes(type) ? { date, minutes: Math.round(minutes), type } : null;
  }).filter(Boolean);
}

/* Kihíváskód: rövid, másolható szöveg a saját eredményeidről (szerver és fiók nélkül). Csak ismert, számos mezők. */
export function encodeChallenge(data) {
  const pick = { n: String(data.name || '').slice(0, 20), d: Math.round((data.date || Date.now()) / DAY), r: {} };
  for (const [k, v] of Object.entries(data.results || {})) if (/^[a-z_]{2,20}$/.test(k) && Number.isFinite(v)) pick.r[k] = Math.round(v * 10) / 10;
  const json = JSON.stringify(pick);
  const b64 = btoaUtf8(json);
  return 'FORMA1.' + b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
export function decodeChallenge(code, testIds) {
  try {
    const m = /^FORMA1\.([A-Za-z0-9_-]{4,2000})$/.exec(String(code || '').trim());
    if (!m) return null;
    const o = JSON.parse(atobUtf8(m[1].replace(/-/g, '+').replace(/_/g, '/')));
    const results = {};
    for (const [k, v] of Object.entries(o.r || {})) if (testIds.includes(k) && Number.isFinite(v) && v > -100 && v < 2000) results[k] = v;
    return { name: String(o.n || tr('Barát')).slice(0, 20), date: Number.isFinite(o.d) ? o.d * DAY : null, results };
  } catch { return null; }
}
const btoaUtf8 = s => btoa(Array.from(new TextEncoder().encode(s), b => String.fromCharCode(b)).join(''));
const atobUtf8 = s => new TextDecoder().decode(Uint8Array.from(atob(s), c => c.charCodeAt(0)));
