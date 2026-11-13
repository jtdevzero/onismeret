/* Helyi (szabályalapú) edző és a közös válaszséma.
   Az app AI-szerver nélkül is ad visszajelzést: a hibakatalógus (data/faults.json) szabályai alapján választ fő hibát.
   Ha van AI-szerver, annak a válasza ugyanebben a formában érkezik, és ugyanez az ellenőrző engedi át. */
import { RELIABLE } from './snow.js';

const str = (v, max = 400) => typeof v === 'string' && v.length > 0 && v.length <= max;
const strOrNull = (v, max = 400) => v === null || str(v, max);
const CONF = ['high', 'medium', 'low'];

/* A havas elemzés edzőválaszának ellenőrzése. ids: { faults, drills, homeDrills } megengedett azonosítók. */
export function validSnowCoach(o, ids) {
  if (!o || typeof o !== 'object' || Array.isArray(o)) return false;
  const m = o.main_issue;
  return !!(str(o.summary) && str(o.strength) && m && typeof m === 'object'
    && (m.id === null || ids.faults.includes(m.id)) && str(m.what) && str(m.why)
    && Array.isArray(m.evidence) && m.evidence.length <= 8 && m.evidence.every(e => str(e, 40))
    && (o.drill_id === null || ids.drills.includes(o.drill_id))
    && (o.home_drill_id === null || ids.homeDrills.includes(o.home_drill_id))
    && strOrNull(o.cue) && strOrNull(o.progress) && CONF.includes(o.confidence) && strOrNull(o.reshoot_tip));
}
/* A felkészülési edző válaszának ellenőrzése. options: megengedett gyakorlatazonosítók. */
export function validPrepCoach(o, options) {
  if (!o || typeof o !== 'object' || Array.isArray(o)) return false;
  const f = o.fix;
  return !!(str(o.summary) && str(o.good) && f && typeof f === 'object' && str(f.what) && str(f.cue)
    && Array.isArray(f.evidence) && f.evidence.length <= 8 && f.evidence.every(e => str(e, 40))
    && str(o.on_snow) && ['keep', 'easier', 'harder'].includes(o.next)
    && (o.option_id === null || options.includes(o.option_id))
    && strOrNull(o.asymmetry) && CONF.includes(o.confidence) && strOrNull(o.reshoot_tip));
}

const levelOk = (f, level) => level >= (f.minLevel || 1) && level <= (f.maxLevel || 5);
const matches = (cond, metrics) => {
  const m = metrics[cond.metric];
  return !!m && m.usable && m.confidence >= RELIABLE && m.band === cond.band;
};

/* A kiváltott hibák fontossági sorrendben (a kisebb „priority” az alapvetőbb ok). */
export function triggeredFaults(analysis, catalog, level) {
  return catalog.faults
    .filter(f => f.sports.includes(analysis.sport) && levelOk(f, level) && f.when.every(c => matches(c, analysis.metrics)))
    .sort((a, b) => a.priority - b.priority);
}

/* ctx: { level, catalog, profile: { weak: [...] } | null, history: { faultId, drillId } | null, texts } */
export function localSnowCoach(analysis, ctx) {
  const T = ctx.catalog.texts;
  const reliable = Object.keys(analysis.metrics).filter(id => analysis.metrics[id].usable && analysis.metrics[id].confidence >= RELIABLE);
  const reshoot = analysis.view === 'side' ? T.reshoot_frontal : T.reshoot_side;
  if (!reliable.length) {
    return {
      summary: T.unclear_summary, strength: T.unclear_strength,
      main_issue: { id: null, what: T.unclear_what, why: T.unclear_why, evidence: [] },
      drill_id: null, home_drill_id: null, cue: null, progress: null, confidence: 'low',
      reshoot_tip: analysis.quality.bodyHeight < 0.2 ? T.reshoot_closer : T.reshoot_general, source: 'local',
    };
  }
  const faults = triggeredFaults(analysis, ctx.catalog, ctx.level);
  const okOnes = ctx.catalog.strengths.filter(s => s.sports.includes(analysis.sport) && reliable.includes(s.metric) && analysis.metrics[s.metric].band === 'ok');
  const strength = okOnes.length ? okOnes[0].text : T.strength_fallback;
  const fault = faults[0];
  if (!fault) {
    return {
      summary: T.clean_summary, strength,
      main_issue: { id: null, what: T.clean_what, why: T.clean_why, evidence: reliable.slice(0, 4) },
      drill_id: null, home_drill_id: null, cue: T.clean_cue, progress: null,
      confidence: reliable.length >= 4 ? 'medium' : 'low', reshoot_tip: reliable.length >= 4 ? null : reshoot, source: 'local',
    };
  }
  const evidence = fault.when.map(c => c.metric);
  const conf = Math.min(...evidence.map(id => analysis.metrics[id].confidence));
  /* ugyanaz a hiba, mint legutóbb: másik gyakorlatot adunk ugyanarra */
  const repeat = ctx.history && ctx.history.faultId === fault.id;
  const drills = fault.drills || [];
  const drill = repeat ? (drills.find(d => d !== ctx.history.drillId) || drills[0]) : drills[0];
  /* otthoni gyakorlat csak akkor, ha a felmérés a hibához kapcsolódó testi gyengeséget mutatott */
  const weak = (ctx.profile && ctx.profile.weak) || [];
  const home = (fault.home || []).find(h => weak.includes(h.weak));
  return {
    summary: fault.summary, strength,
    main_issue: { id: fault.id, what: fault.what, why: fault.why, evidence },
    drill_id: drill || null, home_drill_id: home ? home.exercise : null, cue: fault.cue,
    progress: repeat ? T.progress_repeat : null,
    confidence: conf >= 0.75 && analysis.quality.tracked >= 0.8 ? 'high' : 'medium',
    reshoot_tip: null, source: 'local',
  };
}

/* Helyi visszajelzés egy otthoni gyakorlatra. ex: a gyakorlat leírása (data/exercises.json), health: { pain: bool } */
export function localPrepCoach(result, ex, ctx = {}) {
  const T = ctx.texts;
  const cp = ex.checkpoints || {};
  const fixes = result.checks.filter(c => c.band === 'fix'), oks = result.checks.filter(c => c.band === 'ok');
  const firstFix = fixes[0];
  const pain = !!(ctx.health && ctx.health.pain);
  let next = 'keep', option = null;
  if (pain || fixes.length >= 2) { next = 'easier'; option = ex.easier || null; }
  else if (!fixes.length && result.checks.length >= 2 && result.confidence >= RELIABLE) { next = 'harder'; option = ex.harder || null; }
  if (next !== 'keep' && !option) next = 'keep';
  const count = result.holdSeconds ? T.count_hold.replace('{n}', result.holdSeconds) : T.count_reps.replace('{n}', result.reps);
  return {
    summary: pain ? T.pain_summary : count + ' ' + (fixes.length ? T.sum_fix : T.sum_ok),
    good: oks.length && cp[oks[0].id] ? cp[oks[0].id].good : T.good_fallback,
    fix: firstFix && cp[firstFix.id]
      ? { what: cp[firstFix.id].fix, cue: cp[firstFix.id].cue, evidence: [firstFix.id] }
      : { what: T.nofix_what, cue: T.nofix_cue, evidence: [] },
    on_snow: ex.onSnow,
    next, option_id: option,
    asymmetry: result.asymmetry != null && result.asymmetry >= 15 && result.weaker
      ? T.asym.replace('{side}', T[result.weaker]).replace('{pct}', result.asymmetry) : null,
    confidence: result.confidence >= 0.75 ? 'high' : result.confidence >= RELIABLE ? 'medium' : 'low',
    reshoot_tip: result.confidence >= RELIABLE ? null : T.reshoot, source: 'local',
  };
}
