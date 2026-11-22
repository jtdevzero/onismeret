/* A legutóbbi tényleges edzés megjelenítése: sérült, jövőbeli és duplikált rekordok nélkül. */
export function latestWorkoutSummary(items, now = Date.now()) {
  if (!Array.isArray(items) || !Number.isFinite(now)) return null;
  const seen = new Set();
  const valid = [];
  for (const item of items) {
    if (!item || item.kind !== 'workout' || typeof item.id !== 'string' || !item.id || seen.has(item.id)) continue;
    seen.add(item.id);
    if (!Number.isFinite(item.date) || item.date <= 0 || item.date > now) continue;
    valid.push(item);
  }
  valid.sort((a, b) => b.date - a.date);
  const item = valid[0];
  if (!item) return null;
  return {
    title: typeof item.title === 'string' ? item.title.slice(0, 100) : '',
    date: item.date,
    minutes: Number.isFinite(item.minutes) && item.minutes >= 0 && item.minutes <= 1440 ? item.minutes : null,
    partial: item.partial === true,
  };
}
