/* Kezdőlapi CTA: az érvényes félbehagyott edzés elsőbbséget kap az új edzéssel szemben.
   A tényleges folytatást a session nézet ismét ellenőrzi, felhasználói jóváhagyással. */
import { backupDraft } from './workout-draft.js';

export function resumableHomeDraft(draft, workouts = []) {
  const d = backupDraft(draft);
  if (!d || !/^(?:strength[A-C]|speed[A-B]|mobility|routine-[a-z0-9_-]+|custom-[a-z0-9_-]+)$/.test(d.key)) return null;
  if (workouts.some(w => w && w.kind === 'workout' && w.id === d.workoutId)) return null;
  return { key: d.key, href: '#/session/' + encodeURIComponent(d.key), at: d.at + 1, total: d.steps.length };
}
