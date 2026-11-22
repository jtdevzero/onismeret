/* A történeti eredmény és a pontozás verziója együtt marad, frissítés és fájlos költözés után is. */
import { evaluate, levelOf } from './score.js';

export const SCORING_VERSION = 1;
export function createScoring(item, tests, norms) {
  const evaluation = evaluate(item, tests, norms);
  evaluation.overallLevel = levelOf(evaluation.overall, norms.levels);
  return { version: SCORING_VERSION, normsVersion: norms.version, testsVersion: tests.version,
    evaluation };
}
export const assessmentEvaluation = (item, tests, norms) =>
  item.scoring?.evaluation || evaluate(item, tests, norms);

export function sameScoring(a, b) {
  const x = a?.scoring, y = b?.scoring;
  return !!(x && y && x.version === y.version && x.normsVersion === y.normsVersion && x.testsVersion === y.testsVersion);
}

/* Importnál csak ismert azonosítók és ellenőrzött, számos eredmények kerülhetnek a mentett kiértékelésbe.
   Sérült pillanatképet nem alakítunk át csendben egy másik pontozássá. */
export function cleanScoring(raw, testIds, areaIds) {
  if (!raw || !Number.isInteger(raw.version) || raw.version < 1 || raw.version > SCORING_VERSION || ![raw.normsVersion, raw.testsVersion].every(v => typeof v === 'string' && /^[a-zA-Z0-9._-]{1,40}$/.test(v))) return null;
  const ev = raw.evaluation;
  const obj = v => v && typeof v === 'object' && !Array.isArray(v);
  const num = (v, lo, hi) => typeof v === 'number' && Number.isFinite(v) && v >= lo && v <= hi;
  if (!obj(ev) || !obj(ev.tests) || !obj(ev.areas) || !Array.isArray(ev.weakest) || !Array.isArray(ev.pain)) return null;
  if (!(ev.overall === null || num(ev.overall, 1, 99)) || !(ev.vo2 === null || num(ev.vo2, 10, 90)) || !(ev.fitnessAge === null || num(ev.fitnessAge, 20, 90))) return null;
  if (ev.overall === null ? ev.overallLevel !== null : !['low', 'mid', 'top'].includes(ev.overallLevel)) return null;
  const tests = {}, areas = {};
  for (const [id, s] of Object.entries(ev.tests)) {
    if (!testIds.includes(id) || !obj(s) || !['norm', 'criterion', 'baseline'].includes(s.kind) || !num(s.value, -100, 2000)) return null;
    if (s.kind === 'baseline') { if (s.score !== null) return null; tests[id] = { kind: s.kind, value: s.value, score: null }; }
    else {
      if (!num(s.score, 1, 99)) return null;
      tests[id] = { kind: s.kind, value: s.value, score: s.score };
      if (s.kind === 'norm') {
        if (!num(s.percentile, 1, 99) || !['A', 'B'].includes(s.quality) || typeof s.outside !== 'boolean') return null;
        Object.assign(tests[id], { percentile: s.percentile, quality: s.quality, outside: s.outside });
      } else tests[id].pain = s.pain === true;
    }
  }
  for (const [id, a] of Object.entries(ev.areas)) {
    if (!areaIds.includes(id) || !obj(a) || !num(a.score, 1, 99) || !['low', 'mid', 'top'].includes(a.level) || !Number.isInteger(a.n) || !num(a.n, 1, testIds.length + 1)) return null;
    areas[id] = { score: a.score, level: a.level, n: a.n };
  }
  if (ev.weakest.length > 2 || ev.weakest.some(id => !Object.hasOwn(areas, id)) || ev.pain.some(id => !tests[id]?.pain)) return null;
  return { version: raw.version, normsVersion: raw.normsVersion, testsVersion: raw.testsVersion,
    evaluation: { tests, areas, vo2: ev.vo2, fitnessAge: ev.fitnessAge, overall: ev.overall, overallLevel: ev.overallLevel, weakest: [...ev.weakest], pain: [...ev.pain] } };
}
