/* Naptárbiztos heti határok: nyári időszámítás végén a hét 169 órás (Europe/Budapest, 2026-10-25). */
process.env.TZ = 'Europe/Budapest';
const { test } = await import('node:test');
const assert = (await import('node:assert/strict')).default;
const { weekStart, weekEnd, weeksBack, weeklyCardio, weeklyWorkouts } = await import('../js/core/cardio.js');
const { weeklyReview } = await import('../js/core/wellness.js');
const { badges } = await import('../js/core/achievements.js');

const local = (y, m, d, hh = 12, mm = 0) => new Date(y, m - 1, d, hh, mm).getTime();

test('a DST-váltás hetének vasárnap késő esti edzése is a hétbe tartozik', () => {
  const mon = local(2026, 10, 19, 0), sunLate = local(2026, 10, 25, 23, 30);
  assert.equal(weekStart(sunLate), mon);
  assert.equal(weekEnd(sunLate), local(2026, 10, 26, 0));
  assert.equal(weekEnd(sunLate) - mon, 7 * 86400000 + 3600000);
  assert.equal(weeklyWorkouts([{ date: sunLate }], sunLate).n, 1);
  assert.equal(weeklyCardio([{ date: sunLate, minutes: 30 }], local(2026, 10, 21)).minutes, 30);
});

test('a következő hét hétfője nem számít az előző hétbe ([start, end) intervallum)', () => {
  const nextMon = local(2026, 10, 26, 0, 0);
  assert.equal(weeklyWorkouts([{ date: nextMon }], local(2026, 10, 22)).n, 0);
});

test('weeksBack: naptári hetek visszafelé a tavaszi váltáson át is hétfő éjfélre esnek', () => {
  const after = local(2026, 4, 1);
  for (let i = 0; i < 6; i++) { const d = new Date(weeksBack(after, i)); assert.equal(d.getDay(), 1); assert.equal(d.getHours(), 0); }
  assert.equal(new Date(weeksBack(local(2026, 10, 28), 1)).getDate(), 19);
});

test('heti áttekintés a DST-hét késő vasárnapi edzésével', () => {
  const r = weeklyReview([{ kind: 'workout', date: local(2026, 10, 25, 23, 30) }], { now: local(2026, 10, 27) });
  assert.equal(r.workouts, 1);
});

test('négyhetes jelvény a DST-váltáson átívelő heteken is összefügg', () => {
  const ws = [];
  for (const mon of [[10, 12], [10, 19], [10, 26], [11, 2]]) for (let d = 0; d < 4; d++) ws.push({ kind: 'workout', date: local(2026, mon[0], mon[1] + d, 18), changes: [] });
  const fw = badges(ws).find(x => x.id === 'fourweeks');
  assert.equal(fw.earned, true);
  assert.equal(fw.date, local(2026, 11, 2, 0));
});
