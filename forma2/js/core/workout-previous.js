/* Edzés közbeni előzmény: csak valóban mentett napló, legfrissebb edzésazonosító egyszer. */
export function previousExercisePerformance(items = [], now = Date.now()) {
  const latest = new Map(), used = new Set();
  for (const w of items) {
    if (!w || w.kind !== 'workout' || !Number.isFinite(w.date) || w.date > now ||
        typeof w.id !== 'string' || used.has(w.id)) continue;
    used.add(w.id);
    for (const d of Array.isArray(w.done) ? w.done : []) {
      if (!d || typeof d.ex !== 'string' || !d.ex || !Number.isFinite(d.sets) || d.sets <= 0) continue;
      const prev = latest.get(d.ex);
      if (!prev || w.date > prev.date) latest.set(d.ex, {
        date: w.date, sets: d.sets,
        reps: Number.isFinite(d.reps) ? d.reps : null,
        seconds: Number.isFinite(d.seconds) ? d.seconds : null,
      });
    }
  }
  return latest;
}
