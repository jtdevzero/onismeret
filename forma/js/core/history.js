/* Naptárnézet és havi összefoglaló a naplóból. Tiszta függvények, DOM nélkül.
   items: a tárolt tételek ({ kind: 'workout'|'cardio'|'assessment', date, … }) */

const dayKey = ts => { const d = new Date(ts); return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`; };

/* Egy hónap rácsa hétfőtől kezdve. → { year, month, weeks: [[{ date, day, inMonth, today, workout, cardio, assessment, light }]] } */
export function monthGrid(items, year, month, now = Date.now()) {
  const by = new Map();
  for (const i of items) {
    const k = dayKey(i.date), e = by.get(k) || { workout: 0, cardio: 0, assessment: 0, light: 0, minutes: 0 };
    if (i.kind === 'workout') { e.workout++; if (i.light) e.light++; e.minutes += i.minutes || 0; }
    else if (i.kind === 'cardio') { e.cardio++; e.minutes += i.minutes || 0; }
    else if (i.kind === 'assessment') e.assessment++;
    by.set(k, e);
  }
  const first = new Date(year, month, 1);
  const start = new Date(first); start.setDate(1 - ((first.getDay() + 6) % 7));
  const todayK = dayKey(now), weeks = [];
  const d = new Date(start);
  do {
    const week = [];
    for (let i = 0; i < 7; i++) {
      const e = by.get(dayKey(d.getTime())) || {};
      week.push({ date: d.getTime(), day: d.getDate(), inMonth: d.getMonth() === month, today: dayKey(d.getTime()) === todayK,
        workout: e.workout || 0, cardio: e.cardio || 0, assessment: e.assessment || 0, light: e.light || 0, minutes: e.minutes || 0 });
      d.setDate(d.getDate() + 1);
    }
    weeks.push(week);
  } while (d.getMonth() === month);
  return { year, month, weeks };
}

/* Havi összefoglaló, az előző hónaphoz mérve.
   → { workouts, activeDays, minutes, cardioMinutes, levelUps, bestStreak, prev: { … } } */
export function monthSummary(items, year, month) {
  const sum = (y, m) => {
    const s = new Date(y, m, 1).getTime(), e = new Date(y, m + 1, 1).getTime();
    const inM = items.filter(i => i.date >= s && i.date < e);
    const ws = inM.filter(i => i.kind === 'workout'), cs = inM.filter(i => i.kind === 'cardio');
    const days = [...new Set(inM.filter(i => i.kind !== 'assessment').map(i => dayKey(i.date)))];
    /* leghosszabb egymást követő aktív napok sora a hónapon belül */
    const dayNums = [...new Set(inM.filter(i => i.kind !== 'assessment').map(i => new Date(i.date).getDate()))].sort((a, b) => a - b);
    let best = 0, run = 0, prev = null;
    for (const n of dayNums) { run = prev != null && n === prev + 1 ? run + 1 : 1; best = Math.max(best, run); prev = n; }
    return {
      workouts: ws.length, activeDays: days.length,
      minutes: ws.reduce((a, w) => a + (w.minutes || 0), 0) + cs.reduce((a, c) => a + (c.minutes || 0), 0),
      cardioMinutes: cs.reduce((a, c) => a + (c.minutes || 0), 0),
      levelUps: ws.reduce((a, w) => a + (w.changes || []).filter(c => c.to > c.from).length, 0),
      assessments: inM.filter(i => i.kind === 'assessment').length, bestStreak: best,
    };
  };
  const py = month === 0 ? year - 1 : year, pm = month === 0 ? 11 : month - 1;
  return { ...sum(year, month), prev: sum(py, pm) };
}

export const MONTHS = ['január', 'február', 'március', 'április', 'május', 'június', 'július', 'augusztus', 'szeptember', 'október', 'november', 'december'];
