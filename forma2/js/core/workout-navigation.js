/* Edzéslapozás: csak egyértelmű vízszintes gesztust értelmezünk.
   Gombon/űrlapmezőn kezdett mozdulat nem válthat gyakorlatot. */
export function swipeStep(dx, dy, { interactive = false, rating = false } = {}) {
  if (interactive || rating || !Number.isFinite(dx) || !Number.isFinite(dy)) return null;
  if (Math.abs(dx) < 70 || Math.abs(dy) > Math.abs(dx) * 0.6) return null;
  return dx < 0 ? 'next' : 'back';
}
