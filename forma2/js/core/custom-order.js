/* Saját edzés sorrendje: a felhasználó által kiválasztott sorrend, nem a könyvtár szűrési sorrendje. */
export function moveCustomExercise(order, id, direction) {
  if (!Array.isArray(order) || ![-1, 1].includes(direction)) return Array.isArray(order) ? [...order] : [];
  const next = [...order], i = next.indexOf(id), j = i + direction;
  if (i < 0 || j < 0 || j >= next.length) return next;
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

export function selectedCustomBlocks(order, selected) {
  const seen = new Set();
  return order.filter(id => !seen.has(id) && seen.add(id) && selected.has(id)).map(id => {
    const { sets, dose } = selected.get(id);
    const count = Number.isFinite(Number(sets)) ? Math.max(1, Math.min(6, Math.trunc(Number(sets)))) : 1;
    return [id, count, dose];
  });
}
