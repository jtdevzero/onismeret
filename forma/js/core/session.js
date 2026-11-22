/* Az idő a határidőből származik: egy késő callback sem nyújtja meg a gyakorlatot. */
export const remaining = (deadline, now, tick = 1000) => Math.max(0, Math.ceil((deadline - now) / tick));
export function validSession(d, exercises) {
  if (!d || d.version !== 1 || typeof d.id !== 'string' || typeof d.route !== 'string' || !/^[a-zA-Z0-9_.-]{1,120}$/.test(d.route)) return false;
  if (!d.session || !Array.isArray(d.session.blocks) || !d.session.week || !Array.isArray(d.session.complaints)) return false;
  if (!Array.isArray(d.steps) || !d.steps.length || d.steps.length > 1000 || !Number.isInteger(d.at) || d.at < 0 || d.at >= d.steps.length) return false;
  if (!Number.isFinite(d.left) || d.left < 0 || d.left > 3600 || !Number.isFinite(d.elapsed) || d.elapsed < 0) return false;
  return d.steps.every(s => s && (s.type === 'rest' || exercises[s.exercise]) && (!s.seconds || (Number.isFinite(s.seconds) && s.seconds > 0 && s.seconds <= 3600)));
}
