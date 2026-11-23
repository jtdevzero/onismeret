/* Az új katalógus nem változtatja meg a felülvizsgált progressziós létrákat. */
export function mergeCatalog(base, extra) {
  const result = [...base];
  const ids = new Set(base.map(e => e.id));
  for (const e of Array.isArray(extra) ? extra : []) {
    if (!e || typeof e.id !== 'string' || !/^[a-z0-9_]+$/.test(e.id) || ids.has(e.id)) continue;
    if (typeof e.name !== 'string' || !e.name.trim() || typeof e.how !== 'string' || !Array.isArray(e.points) || e.points.length !== 3) continue;
    if ((!Array.isArray(e.dose?.reps) && !Array.isArray(e.dose?.seconds)) || e.ladder) continue;
    ids.add(e.id);
    result.push(e);
  }
  return result;
}

export function relatedExercises(exercise, all, limit = 5) {
  if (!exercise || !Array.isArray(exercise.muscles) || !exercise.muscles.length) return [];
  const target = new Set(exercise.muscles);
  return all.filter(e => e.id !== exercise.id && e.muscles?.some(m => target.has(m)))
    .map(e => ({ e, overlap: e.muscles.filter(m => target.has(m)).length, sameEquipment: (e.equipment || '') === (exercise.equipment || '') }))
    .sort((a, b) => b.overlap - a.overlap || Number(b.sameEquipment) - Number(a.sameEquipment) || a.e.name.localeCompare(b.e.name, 'hu'))
    .slice(0, Math.max(0, limit)).map(x => x.e);
}

export function catalogMuscles(all) {
  return [...new Set(all.flatMap(e => Array.isArray(e.muscles) ? e.muscles : []))].sort((a, b) => a.localeCompare(b, 'hu'));
}

/* Keresési csoportok, nem anatómiai mérés. Az eredeti felülvizsgált rekordokat nem módosítják. */
const GROUPS = {
  push: 'mell', squat: 'comb', squat_db: 'comb', lunge: 'comb', hinge: 'farizom', hinge_db: 'farizom',
  pull: 'hát', pull_band: 'hát', pull_bar: 'hát', pull_db: 'hát', core: 'has', side: 'has',
  power: 'comb', speed: 'állóképesség', balance: 'egyensúly',
};
export function exerciseAreas(ex) {
  if (!ex) return [];
  if (Array.isArray(ex.muscles) && ex.muscles.length) return ex.muscles;
  if (GROUPS[ex.ladder]) return [GROUPS[ex.ladder]];
  if (['mobility', 'warmup', 'recovery'].includes(ex.type)) return ['mobilitás'];
  if (['cardio', 'speed'].includes(ex.type)) return ['állóképesség'];
  return [];
}

export function anatomyMatches(all, area) {
  const groups = {
    chest: ['mell'], shoulders: ['váll', 'hátsó váll', 'lapocka'], arms: ['kar', 'alkar', 'bicepsz', 'tricepsz'],
    back: ['hát', 'széles hátizom', 'csuklyásizom'], core: ['has', 'törzs', 'ferde hasizom'],
    legs: ['comb', 'combhajlító', 'vádli', 'boka'], glutes: ['farizom', 'csípőhorpasz'],
  };
  const tokens = groups[area] || [];
  return all.filter(e => exerciseAreas(e).some(m => tokens.includes(m)));
}
