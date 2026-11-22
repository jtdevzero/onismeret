/* Kis, több képernyő által használt segédek. Külön modulban, hogy a kezdőlapnak ne kelljen betöltenie a nagy képernyőket. */
import { D } from './data.js';
import { LADDERS, effLadder, baseLadder, exerciseFor, laddersOf } from '../core/program.js';
import { tr } from './i18n.js';

const numericTests = () => D.tests.tests.filter(t => t.kind === 'norm' && t.input.type === 'number');
/* célként választható mérőszámok: [azonosító, név, egység] */
export const GOAL_METRICS = () => [
  ...numericTests().map(t => [t.id, t.name, t.input.unit]),
  ['fitness_age', tr('Fittségi kor'), tr('év')], ['waist', tr('Derékbőség'), 'cm'], ['weight', tr('Testsúly'), 'kg'],
];

/* a program jelenlegi súlyzós gyakorlatai (a súlyjavaslathoz és a helyi edzőhöz) */
export function dumbbellExercises(prog, lad = laddersOf(D.exercises.exercises)) {
  if (!prog || !(prog.equipment || []).includes('dumbbell')) return [];
  return LADDERS.filter(l => effLadder(baseLadder(l), prog.equipment) === l).map(l => exerciseFor(lad, l, (prog.levels || {})[l], prog.lowImpact)).filter(e => e && e.equipment === 'dumbbell');
}
