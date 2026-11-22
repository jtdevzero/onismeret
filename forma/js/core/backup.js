/* Mentésfájl ellenőrzése visszatöltés előtt. Tiszta függvény: csak az ismert mezőket veszi át, típusellenőrzéssel,
   így egy hibás vagy idegen fájl nem tud ismeretlen adatot vagy rossz típust bejuttatni az appba. */

import { cleanScoring } from './assessment.js';

const MAX_BYTES = 5 * 1024 * 1024, MAX_ITEMS = 5000;
const num = (v, lo, hi) => (typeof v === 'number' && Number.isFinite(v) && v >= lo && v <= hi ? v : undefined);
const str = (v, max = 80) => (typeof v === 'string' && v.length > 0 && v.length <= max ? v : undefined);
const clean = o => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined));

const cleanDone = d => (Array.isArray(d) ? d.slice(0, 40).filter(x => x && /^[a-z0-9_]{2,30}$/.test(x.ex || '')).map(x => clean({ ex: x.ex, sets: num(x.sets, 0, 50), reps: num(x.reps, 0, 5000), seconds: num(x.seconds, 0, 20000) })) : undefined);
function numbers(obj, keys, lo, hi) {
  const out = {};
  if (!obj || typeof obj !== 'object') return out;
  for (const k of keys) { const v = num(obj[k], lo, hi); if (v !== undefined) out[k] = v; }
  return out;
}
function profile(p) {
  if (!p || typeof p !== 'object') return null;
  const age = num(p.age, 18, 99), sex = p.sex === 'male' || p.sex === 'female' ? p.sex : undefined;
  return age !== undefined && sex ? { age, sex } : null;
}

/* text: a fájl tartalma · ctx: { testIds, ladders, sessionKeys, ratingKeys, cardioTypes, goalMetrics, exerciseIds }
   → { ok: true, data: { settings, program, items } } vagy { ok: false, error } */
export function parseBackup(text, ctx) {
  if (typeof text !== 'string' || !text.length) return { ok: false, error: 'Üres fájl.' };
  if (text.length > MAX_BYTES) return { ok: false, error: 'A fájl túl nagy.' };
  let raw;
  try { raw = JSON.parse(text); } catch { return { ok: false, error: 'Ez nem érvényes mentésfájl (nem JSON).' }; }
  if (!raw || raw.app !== 'forma' || raw.version !== 1) return { ok: false, error: 'Ez nem a Forma mentésfájlja.' };
  if (!Array.isArray(raw.items) || raw.items.length > MAX_ITEMS) return { ok: false, error: 'A mentésfájl sérült.' };

  const s = raw.settings || {};
  const settings = clean({
    nickname: str(s.nickname, 24),
    pinnedRoutine: typeof s.pinnedRoutine === 'string' && /^(routine|custom)-[a-zA-Z0-9_-]{1,80}$/.test(s.pinnedRoutine) ? s.pinnedRoutine : undefined,
    accepted: s.accepted === true ? true : undefined,
    profile: profile(s.profile) || undefined,
    lowImpact: typeof s.lowImpact === 'boolean' ? s.lowImpact : undefined,
    parq: s.parq && typeof s.parq === 'object' ? Object.fromEntries(Object.entries(s.parq).filter(([k, v]) => /^[a-z]{2,16}$/.test(k) && typeof v === 'boolean')) : undefined,
    reminder: s.reminder && /^\d{2}:\d{2}$/.test(s.reminder.time || '') ? { time: s.reminder.time } : undefined,
    duration: [0, 15, 25, 35].includes(s.duration) ? s.duration : undefined,
    voiceMode: typeof s.voiceMode === 'boolean' ? s.voiceMode : undefined,
    showAll: typeof s.showAll === 'boolean' ? s.showAll : undefined,
    theme: ['auto', 'light', 'dark', 'sun'].includes(s.theme) ? s.theme : undefined,
    size: ['normal', 'large'].includes(s.size) ? s.size : undefined,
    complaints: Array.isArray(s.complaints) ? s.complaints.filter(c => ['knee', 'back', 'shoulder'].includes(c)) : undefined,
    equipment: Array.isArray(s.equipment) ? s.equipment.filter(e => ['bar', 'band', 'dumbbell'].includes(e)) : undefined,
  });

  let program = null;
  const p = raw.program;
  if (p && typeof p === 'object' && num(p.start, 0, 1e14) !== undefined) {
    const ratings = {};
    for (const l of ctx.ladders) if (Array.isArray(p.ratings && p.ratings[l])) ratings[l] = p.ratings[l].filter(r => ctx.ratingKeys.includes(r)).slice(-3);
    program = clean({
      start: p.start, levels: numbers(p.levels, ctx.ladders, 0, 10), ratings,
      targets: Array.isArray(p.targets) ? p.targets.filter(t => typeof t === 'string' && /^[a-z]{3,16}$/.test(t)).slice(0, 10) : [],
      equipment: Array.isArray(p.equipment) ? p.equipment.filter(e => ['bar', 'band', 'dumbbell'].includes(e)) : [],
      complaints: Array.isArray(p.complaints) ? p.complaints.filter(c => ['knee', 'back', 'shoulder'].includes(c)) : [],
      lowImpact: !!p.lowImpact, done: num(p.done, 0, 1e6) ?? 0, lastDone: num(p.lastDone, 0, 1e14),
      levelLog: Array.isArray(p.levelLog) ? p.levelLog.filter(c => c && ctx.ladders.includes(c.ladder)).map(c => clean({ ladder: c.ladder, from: num(c.from, 0, 10), to: num(c.to, 0, 10), date: num(c.date, 0, 1e14) })).slice(-100) : [],
      fromAssessment: str(p.fromAssessment),
      cycleBase: num(p.cycleBase, 0, 1000),
      goalFocus: ['push', 'pull', 'squat', 'core', 'power', 'balance'].includes(p.goalFocus) ? p.goalFocus : undefined,
    });
  }

  const items = [], seen = new Set();
  for (const it of raw.items) {
    if (!it || typeof it !== 'object') continue;
    const id = str(it.id), date = num(it.date, 0, 1e14);
    if (!id || date === undefined || seen.has(id)) continue;
    if (it.kind === 'assessment') {
      const pr = profile(it.profile);
      if (!pr) continue;
      const scoring = it.scoring == null ? undefined : cleanScoring(it.scoring, ctx.testIds, ctx.areaIds || []);
      if (scoring === null) return { ok: false, error: 'A mentés pontozási előzménye sérült vagy újabb alkalmazásverziót igényel. A jelenlegi adatok megmaradnak.' };
      items.push(clean({ id, kind: 'assessment', date, profile: pr, results: numbers(it.results, ctx.testIds, -100, 2000), vitals: numbers(it.vitals, ['rhr', 'waist', 'frequency', 'intensity', 'duration'], 0, 300), scoring }));
    } else if (it.kind === 'pulse') {
      const bpm = num(it.bpm, 30, 220);
      if (bpm === undefined) continue;
      items.push(clean({ id, kind: 'pulse', date, bpm, quality: num(it.quality, 0, 1) }));
    } else if (it.kind === 'challenge' && /^[a-z0-9]{3,12}$/.test(it.challenge || '')) {
      const day = num(it.day, 1, 30);
      if (day === undefined) continue;
      items.push(clean({ id, kind: 'challenge', date, challenge: it.challenge, day, amount: num(it.amount, 0, 1000) }));
    } else if (it.kind === 'posture' && it.metrics && typeof it.metrics === 'object') {
      const metrics = {};
      for (const k of ['shoulder_tilt', 'hip_tilt', 'head_forward']) { const m = it.metrics[k]; if (m && num(m.value, -100, 100) !== undefined && (m.band === 'ok' || m.band === 'fix')) metrics[k] = { value: m.value, band: m.band }; }
      if (!Object.keys(metrics).length) continue;
      items.push({ id, kind: 'posture', date, metrics });
    } else if (it.kind === 'workout' && ['routine', 'custom'].includes(it.key)) {
      items.push(clean({ id, kind: 'workout', date, key: it.key, title: str(it.title, 60), minutes: num(it.minutes, 0, 600) ?? 0, steps: num(it.steps, 0, 1000), partial: !!it.partial, ratings: {}, changes: [], feedback: cleanFeedback(it.feedback), note: str(it.note, 280), done: cleanDone(it.done), partner: it.partner === true ? true : undefined }));
    } else if (it.kind === 'workout' && ctx.sessionKeys.includes(it.key)) {
      const ratings = {};
      for (const l of ctx.ladders) if (it.ratings && ctx.ratingKeys.includes(it.ratings[l])) ratings[l] = it.ratings[l];
      items.push(clean({ id, kind: 'workout', date, key: it.key, minutes: num(it.minutes, 0, 600) ?? 0, steps: num(it.steps, 0, 1000), partial: !!it.partial, ratings,
        changes: Array.isArray(it.changes) ? it.changes.filter(c => c && ctx.ladders.includes(c.ladder)).map(c => clean({ ladder: c.ladder, from: num(c.from, 0, 10), to: num(c.to, 0, 10), date: num(c.date, 0, 1e14) })) : [],
        feedback: cleanFeedback(it.feedback), note: str(it.note, 280), done: cleanDone(it.done), light: it.light === true ? true : undefined, partner: it.partner === true ? true : undefined }));
    } else if (it.kind === 'mini') {
      const pr = profile(it.profile);
      const results = numbers(it.results, ['pushup', 'plank', 'sl_stance'], 0, 1000);
      if (!pr || !Object.keys(results).length) continue;
      items.push({ id, kind: 'mini', date, profile: pr, results });
    } else if (it.kind === 'body') {
      const waist = num(it.waist, 50, 180), weight = num(it.weight, 30, 250);
      if (waist === undefined && weight === undefined) continue;
      items.push(clean({ id, kind: 'body', date, waist, weight }));
    } else if (it.kind === 'goal' && (ctx.goalMetrics || []).includes(it.metric)) {
      const start = num(it.start, -100, 1000), target = num(it.target, -100, 1000);
      if (start === undefined || target === undefined) continue;
      items.push(clean({ id, kind: 'goal', date, metric: it.metric, start, target, deadline: num(it.deadline, 0, 1e14) }));
    } else if (it.kind === 'cardio' && (ctx.cardioTypes || []).includes(it.type)) {
      const minutes = num(it.minutes, 1, 600);
      if (minutes === undefined) continue;
      const plan = it.plan && num(it.plan.week, 1, 9) !== undefined && num(it.plan.day, 1, 3) !== undefined ? { week: it.plan.week, day: it.plan.day } : undefined;
      items.push(clean({ id, kind: 'cardio', date, type: it.type, minutes, intensity: it.intensity === 'vigorous' ? 'vigorous' : 'moderate', plan, partial: it.partial === true ? true : undefined, km: num(it.km, 0, 500) }));
    } else continue;
    seen.add(id);
  }
  const r = raw.run;
  const run = r && typeof r === 'object' && num(r.week, 1, 9) !== undefined && num(r.day, 1, 3) !== undefined ? { week: r.week, day: r.day, done: r.done === true } : null;
  const nutrition = {};
  if (raw.nutrition && typeof raw.nutrition === 'object') for (const [k, v] of Object.entries(raw.nutrition).slice(-60)) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(k) && v && typeof v === 'object') nutrition[k] = { p: num(v.p, 0, 50) ?? 0, w: num(v.w, 0, 50) ?? 0 };
  }
  const exIds = new Set(ctx.exerciseIds || []);
  const favs = Array.isArray(raw.favs) ? raw.favs.filter(f => exIds.has(f)).slice(0, 200) : null;
  const custom = Array.isArray(raw.custom) ? raw.custom.slice(0, 50).map(c => {
    const name = str(c && c.name, 40), cid = str(c && c.id);
    const blocks = Array.isArray(c && c.blocks) ? c.blocks.filter(b => Array.isArray(b) && exIds.has(b[0])).slice(0, 30).map(([id, sets, dose]) => [id, num(sets, 1, 6) ?? 1, dose && num(dose.reps, 1, 600) !== undefined ? { reps: dose.reps } : { seconds: num(dose && dose.seconds, 1, 600) ?? 30 }]) : [];
    return name && cid && blocks.length ? { id: cid, name, blocks } : null;
  }).filter(Boolean) : null;
  return { ok: true, data: { settings, program, run, nutrition: Object.keys(nutrition).length ? nutrition : null, favs, custom, items } };
}

function cleanFeedback(f) {
  if (!f || typeof f !== 'object') return undefined;
  return clean({ effort: ['easy', 'ok', 'hard'].includes(f.effort) ? f.effort : undefined, pain: ['none', 'yes'].includes(f.pain) ? f.pain : undefined, mood: ['better', 'same', 'worse'].includes(f.mood) ? f.mood : undefined });
}
