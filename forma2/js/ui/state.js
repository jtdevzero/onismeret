/* Az app állapota: felmérések, program, edzések. Az üzleti logika a core/ modulokban van, itt csak a tárolás. */
import { kvGet, kvSet, itemsAll, itemPut } from './store.js';
import { D, S, profile, lowImpact } from './data.js';
import { evaluate, mobilityTargets } from '../core/score.js';
import { createScoring, assessmentEvaluation } from '../core/assessment.js';
import { reassessedLevels } from '../core/program.js';
import { uid } from './dom.js';

export const getDraft = async () => (await kvGet('draft', null)) || { results: {}, vitals: {}, skipped: {} };
export const setDraft = d => kvSet('draft', d);
export const getProgram = () => kvGet('program', null);
export const setProgram = p => kvSet('program', p);
export const assessments = () => itemsAll('assessment');
export const workouts = () => itemsAll('workout');
export async function latestAssessment() { return (await assessments())[0] || null; }

/* Az eredeti pontszám megmarad; csak a régi, verzió nélküli adatok számolódnak újra. */
export const evaluateItem = item => assessmentEvaluation(item, D.tests, D.norms);

export async function saveAssessment(draft) {
  const item = { id: uid(), kind: 'assessment', date: Date.now(), profile: { ...profile() }, results: { ...draft.results }, vitals: { ...draft.vitals } };
  item.scoring = createScoring(item, D.tests, D.norms);
  await itemPut(item);
  await kvSet('draft', null);
  return item;
}

/* Az új program az aktuális normákkal és az újramért szintekkel indul; az előzmény nem változik. */
export async function programFromAssessment(item) {
  const ev = evaluate(item, D.tests, D.norms);
  const old = await getProgram();
  const levels = reassessedLevels(item.results, ev, item.profile, old?.levels);
  /* az eltelt ciklusok száma megmarad (különben minden újramérés után újra „Alapozás” jönne), és a célprogram is */
  const DAY = 86400000;
  const cycleBase = old ? (old.cycleBase || 0) + (old.start && Date.now() - old.start >= 28 * DAY ? Math.max(1, Math.round((Date.now() - old.start) / (42 * DAY))) : 0) : 0;
  const prog = {
    start: Date.now(), cycleBase, goalFocus: old ? old.goalFocus || null : null, lastDone: old ? old.lastDone : undefined, levels, targets: mobilityTargets(ev, D.tests).map(t => t.target), lowImpact: lowImpact(), equipment: (S.settings && S.settings.equipment) || [], complaints: (S.settings && S.settings.complaints) || [],
    done: old ? old.done || 0 : 0, ratings: {}, levelLog: old ? old.levelLog || [] : [], fromAssessment: item.id,
  };
  await setProgram(prog);
  return prog;
}

export const settingsReady = () => !!(S.settings && S.settings.accepted && S.settings.profile);
