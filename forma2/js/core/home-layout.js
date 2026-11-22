/* Személyre szabható kezdőlap: ismert kártyák, teljes sorrend, idegen/sérült adatok eldobása. */
export const HOME_CARDS = Object.freeze(['weekly', 'last', 'quick', 'goals']);

export function normalizeHomeCards(value) {
  const seen = new Set();
  if (Array.isArray(value)) for (const key of value.slice(0, 24)) {
    if (HOME_CARDS.includes(key)) seen.add(key);
  }
  for (const key of HOME_CARDS) seen.add(key);
  return [...seen];
}

export function moveHomeCard(value, key, direction) {
  const result = normalizeHomeCards(value);
  const pos = result.indexOf(key);
  if (pos < 0 || ![-1, 1].includes(direction)) return result;
  const next = pos + direction;
  if (next < 0 || next >= result.length) return result;
  [result[pos], result[next]] = [result[next], result[pos]];
  return result;
}

export function normalizeHiddenHomeCards(value) {
  return Array.isArray(value) ? HOME_CARDS.filter(key => value.includes(key)) : [];
}
