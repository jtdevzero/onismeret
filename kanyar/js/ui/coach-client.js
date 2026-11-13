/* Edzői visszajelzés: ha be van állítva AI-szerver, azt kérdezzük; különben (vagy hiba esetén) a helyi edző válaszol.
   A szervernek csak a mutatók és néhány lekicsinyített képkocka megy el, a videó soha. A szerver válasza adat:
   ellenőrizzük a formáját, és csak a felkínált azonosítókat fogadjuk el belőle. */
import { localSnowCoach, localPrepCoach, validSnowCoach, validPrepCoach } from '../core/coach.js';
import { D, S, lessonsFor } from './data.js';

const TIMEOUT = 45000;
export const aiConfigured = () => !!(S.settings && S.settings.ai && S.settings.ai.url && S.settings.ai.code);

async function ask(kind, input, images) {
  const { url, code } = S.settings.ai;
  const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), TIMEOUT);
  try {
    const r = await fetch(url.replace(/\/+$/, '') + '/coach', {
      method: 'POST', signal: ctl.signal, referrerPolicy: 'no-referrer',
      headers: { 'content-type': 'application/json', 'x-app-key': code },
      body: JSON.stringify({ kind, input, images }),
    });
    const body = await r.json().catch(() => null);
    if (!r.ok || !body || !body.coach) throw new Error((body && body.error) || 'http_' + r.status);
    return body.coach;
  } finally { clearTimeout(timer); }
}
/* A szerver válaszából csak az ismert mezőket vesszük át. */
const pick = (o, keys) => Object.fromEntries(keys.map(k => [k, o[k]]));

/* analysis: analyzeRun eredménye · ctx: { level, profile, history } · images: JPEG data URL-ek */
export async function snowCoach(analysis, ctx, images = []) {
  const catalog = D.faults;
  const local = () => localSnowCoach(analysis, { ...ctx, catalog });
  if (!aiConfigured()) return local();
  const faults = catalog.faults.filter(f => f.sports.includes(analysis.sport));
  const drills = lessonsFor(analysis.sport, 'drill').map(l => ({ id: l.id, title: l.title, for: faults.filter(f => (f.drills || []).includes(l.id)).map(f => f.id) }));
  const homeDrills = D.exercises.exercises.filter(e => e.type !== 'test' && e.type !== 'warmup').map(e => ({ id: e.id, name: e.name }));
  const input = {
    lang: 'hu', sport: analysis.sport, stance: S.settings.stance || null, level: ctx.level, camera: analysis.view,
    quality: analysis.quality, turns: analysis.turns.slice(0, 30), metrics: analysis.metrics,
    history: ctx.history || null, profile: ctx.profile ? { weak: ctx.profile.weak, asym: ctx.profile.asym } : null,
    faults: faults.map(f => ({ id: f.id, what: f.what })), drills, home_drills: homeDrills,
  };
  try {
    const c = await ask('snow', input, images);
    const ids = { faults: faults.map(f => f.id), drills: drills.map(d => d.id), homeDrills: homeDrills.map(d => d.id) };
    if (!validSnowCoach(c, ids)) throw new Error('bad_shape');
    return {
      ...pick(c, ['summary', 'strength', 'drill_id', 'home_drill_id', 'cue', 'progress', 'confidence', 'reshoot_tip']),
      main_issue: pick(c.main_issue, ['id', 'what', 'why', 'evidence']), source: 'ai',
    };
  } catch (e) {
    return { ...local(), aiError: String(e && e.message || e).slice(0, 60) };
  }
}

const PREP_TEXTS = {
  count_hold: '{n} másodpercig tartottad.', count_reps: '{n} ismétlést számoltam.',
  sum_fix: 'A legfontosabb javítanivalót emeltem ki.', sum_ok: 'A mért pontok rendben vannak.',
  pain_summary: 'Fájdalmat jeleztél, ezért most nem javaslok nehezítést. Ha a fájdalom nem múlik, fordulj orvoshoz vagy gyógytornászhoz.',
  good_fallback: 'Végigcsináltad, és a mozgásod jól követhető volt.',
  nofix_what: 'A mért pontokon nem találtam javítanivalót.', nofix_cue: 'Tartsd meg ezt a formát, amikor már fáradsz is.',
  asym: 'A {side} oldalad gyengébb, a különbség {pct}%.', left: 'bal', right: 'jobb',
  reshoot: 'A felvételen nem látszottál elég jól. Támaszd le a telefont úgy, hogy tetőtől talpig beleférj, és legyen elég fény.',
};

/* result: analyzeExercise eredménye · ex: a gyakorlat leírása · mode: 'assessment' | 'exercise' */
export async function prepCoach(result, ex, ctx = {}, images = []) {
  const health = (S.settings && S.settings.health) || {};
  const local = () => localPrepCoach(result, ex, { texts: PREP_TEXTS, health });
  if (!aiConfigured()) return local();
  const options = [ex.easier, ex.harder].filter(Boolean).map(id => ({ id, name: D.ex[id].name, kind: id === ex.easier ? 'easier' : 'harder' }));
  const input = {
    lang: 'hu', mode: ctx.mode || 'exercise', sport: S.settings.sport, level: S.settings.level,
    exercise: { id: ex.id, name: ex.name, points: ex.points, on_snow: ex.onSnow },
    result: { reps: result.reps, hold_seconds: result.holdSeconds, rate: result.rate, checks: result.checks, sides: result.sides, asymmetry: result.asymmetry, weaker: result.weaker, per_rep: result.perRep.slice(0, 20), confidence: result.confidence },
    profile: ctx.profile ? { weak: ctx.profile.weak, asym: ctx.profile.asym } : null, health: { pain: !!health.pain }, options,
  };
  try {
    const c = await ask('prep', input, images);
    if (!validPrepCoach(c, options.map(o => o.id))) throw new Error('bad_shape');
    /* fájdalom jelzésekor a szerver válaszától függetlenül sem engedünk nehezítést */
    const next = health.pain && c.next === 'harder' ? 'keep' : c.next;
    return { ...pick(c, ['summary', 'good', 'on_snow', 'asymmetry', 'confidence', 'reshoot_tip']), fix: pick(c.fix, ['what', 'cue', 'evidence']), next, option_id: next === 'keep' ? null : c.option_id, source: 'ai' };
  } catch (e) {
    return { ...local(), aiError: String(e && e.message || e).slice(0, 60) };
  }
}
