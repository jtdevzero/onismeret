/* Az app állapota: felmérések, program, edzések. Az üzleti logika a core/ modulokban van, itt csak a tárolás. */
import { kvGet, kvSet, itemsAll, itemPut } from './store.js';
import { D, S, profile, lowImpact } from './data.js';
import { evaluate, mobilityTargets } from '../core/score.js';
import { initialLevels, LADDERS } from '../core/program.js';
import { uid } from './dom.js';

export const getDraft = async () => (await kvGet('draft', null)) || { results: {}, vitals: {}, skipped: {} };
export const setDraft = d => kvSet('draft', d);
export const getProgram = () => kvGet('program', null);
export const setProgram = p => kvSet('program', p);
export const assessments = () => itemsAll('assessment');
export const workouts = () => itemsAll('workout');
export async function latestAssessment() { return (await assessments())[0] || null; }

/* A tárolt felmérést mindig újraszámoljuk az aktuális normákkal: így egy normajavítás a régi eredményekre is érvényes. */
export const evaluateItem = item => evaluate({ results: item.results, vitals: item.vitals, profile: item.profile }, D.tests, D.norms);

export async function saveAssessment(draft) {
  const item = { id: uid(), kind: 'assessment', date: Date.now(), profile: { ...profile() }, results: { ...draft.results }, vitals: { ...draft.vitals } };
  await itemPut(item);
  await kvSet('draft', null);
  return item;
}

/* Program a felmérésből. Ha már van program, a szintek nem csökkennek (a gyakorlásból jövő haladás megmarad), és új ciklus indul. */
export async function programFromAssessment(item) {
  const ev = evaluateItem(item);
  const init = initialLevels(item.results, ev, item.profile);
  const old = await getProgram();
  const levels = {};
  for (const k of LADDERS) levels[k] = old && old.levels ? Math.max(old.levels[k] ?? 0, init[k] ?? 0) : init[k] ?? 0;
  const prog = {
    start: Date.now(), levels, targets: mobilityTargets(ev, D.tests).map(t => t.target), lowImpact: lowImpact(),
    done: old ? old.done || 0 : 0, ratings: {}, levelLog: old ? old.levelLog || [] : [], fromAssessment: item.id,
  };
  await setProgram(prog);
  return prog;
}

export const settingsReady = () => !!(S.settings && S.settings.accepted && S.settings.profile);
