/* Súlyprogresszió-javaslat súlyzós gyakorlatokhoz (tiszta függvények).
   A javaslat NEM mutáció: a program csak a felhasználó jóváhagyása után változik (applyLoadChange).
   Konzervatív szabályok, szakember még nem lektorálta:
   - nincs elég naplózott, súllyal rögzített adat → insufficient_data;
   - a gyakorlatot érintő panasz (térd, derék, váll) → needs_review, emelést nem javasol;
   - a legutóbbi edzésen legalább 2 sorozat nem teljesült → decrease (egy lépcsővel könnyebb);
   - az utolsó két edzésen minden sorozat teljesült, és mindkettőn RIR ≥ 3 volt → increase (egy lépcső);
   - RIR nélkül nem becslünk tartalékot, emelést nem javaslunk → maintain;
   - különben maintain.
   Az összehasonlítás csak azonos gyakorlaton (azonos változaton) történik. */
import { normalizeWorkout } from './workout-schema.js';
import { complaintRules } from './program.js';

export const ACTIONS = ['increase', 'maintain', 'decrease', 'insufficient_data', 'needs_review'];
/* súlylépcső: könnyű súlyzónál 1 kg, egyébként 2 kg; 0,5 kg-ra kerekítve */
export const stepFor = kg => (kg < 10 ? 1 : 2);
const round05 = v => Math.round(v * 2) / 2;

/* az adott gyakorlat súllyal rögzített naplói, időrendben (a legutóbbi utoljára) */
export function exerciseEvidence(workouts, exId) {
  return workouts.map(normalizeWorkout).filter(Boolean)
    .map(w => ({ date: w.date, id: w.id, entry: w.log.find(e => e.ex === exId) }))
    .filter(x => x.entry && x.entry.sets.some(s => Number.isFinite(s.weightKg) && s.weightKg > 0))
    .sort((a, b) => a.date - b.date);
}

/* exercise: { id, ladder, equipment } · workouts: nyers rekordok · currentKg: az elfogadott súly (vagy null) · complaints: ['knee', …] */
export function suggestProgression({ exercise, workouts = [], currentKg = null, complaints = [] }) {
  const base = { exerciseId: exercise && exercise.id, requiresApproval: true, proposedChange: null, evidence: [], reasons: [], confidence: 'low' };
  if (!exercise || exercise.equipment !== 'dumbbell') return { ...base, action: 'insufficient_data', reasons: ['Csak súlyzós gyakorlathoz adok súlyjavaslatot.'] };
  const ev = exerciseEvidence(workouts, exercise.id);
  const evidence = ev.slice(-2).map(x => ({ date: x.date, workoutId: x.id, sets: x.entry.sets }));
  const lastKg = ev.length ? Math.max(...ev[ev.length - 1].entry.sets.filter(s => Number.isFinite(s.weightKg)).map(s => s.weightKg)) : null;
  const from = Number.isFinite(currentKg) && currentKg > 0 ? currentKg : lastKg;
  if (complaintRules(complaints).caps[exercise.ladder] !== undefined) {
    return { ...base, action: 'needs_review', evidence, reasons: ['Jelzett panaszod érinti ezt a gyakorlatot: emelést nem javaslok. Csak fájdalommentesen dolgozz, és ha kell, kérj szakembertől tanácsot.'] };
  }
  if (!ev.length || from == null) return { ...base, action: 'insufficient_data', evidence, reasons: ['Még nincs súllyal rögzített sorozatod ebből a gyakorlatból. A sorozatnaplóban add meg a súlyt.'] };
  const last = ev[ev.length - 1].entry.sets;
  const failed = last.filter(s => s.done === false).length;
  if (failed >= 2) {
    const to = round05(Math.max(0, from - stepFor(from)));
    return { ...base, action: 'decrease', evidence, confidence: 'medium', proposedChange: to < from ? { ex: exercise.id, from, to } : null, reasons: [`A legutóbbi edzésen ${failed} sorozat nem sikerült ${from} kg-mal. Egy lépcsővel könnyebb súllyal biztosabb a technika.`] };
  }
  if (ev.length < 2) return { ...base, action: 'insufficient_data', evidence, reasons: ['Egy edzés még kevés: két, súllyal rögzített edzés után javaslok.'] };
  const lastTwo = ev.slice(-2).map(x => x.entry.sets);
  const allDone = lastTwo.every(sets => sets.every(s => s.done !== false));
  const rirs = lastTwo.map(sets => { const r = sets.filter(s => Number.isInteger(s.rir)).map(s => s.rir); return r.length ? Math.min(...r) : null; });
  if (allDone && rirs.some(r => r == null)) return { ...base, action: 'maintain', evidence, reasons: ['Minden sorozat sikerült, de RIR nélkül nem tudom, mennyi tartalékod volt. Ha az utolsó sorozatnál megadod a RIR-t, javasolhatok emelést.'] };
  if (allDone && rirs.every(r => r >= 3)) {
    const to = round05(from + stepFor(from));
    return { ...base, action: 'increase', evidence, confidence: 'medium', proposedChange: { ex: exercise.id, from, to }, reasons: [`Az utolsó két edzésen minden sorozat sikerült, és mindkétszer legalább 3 ismétlés tartalékod maradt (RIR ${rirs.join(', ')}).`] };
  }
  return { ...base, action: 'maintain', evidence, reasons: ['Maradj ennél a súlynál: még nem volt két egymás utáni, bőven tartalékos edzés.'] };
}

/* Jóváhagyott súlyváltozás a programba. Nem módosítja a bemenetet; ha már ez az érték, változatlanul adja vissza (idempotens). */
export function applyLoadChange(program, change, { now = Date.now(), source = 'suggestion' } = {}) {
  if (!program || !change || !/^[a-z0-9_]{2,30}$/.test(change.ex || '') || !(Number.isFinite(change.to) && change.to >= 0 && change.to <= 300)) return program;
  const loads = { ...(program.loads || {}) };
  if (loads[change.ex] === change.to) return program;
  const from = loads[change.ex] ?? (Number.isFinite(change.from) ? change.from : undefined);
  loads[change.ex] = change.to;
  const entry = { ex: change.ex, to: change.to, date: now, source: source === 'manual' ? 'manual' : 'suggestion' };
  if (from !== undefined) entry.from = from;
  return { ...program, loads, loadLog: [...(program.loadLog || []), entry].slice(-100) };
}
