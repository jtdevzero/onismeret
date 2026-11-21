/* Élő számlálás kamerával (a Kanyar live.js-éből): a letámasztott telefon előtt végzett gyakorlat ismétléseit vagy a
   kitartott időt valós időben számolja, hangosan is. A kép nem kerül rögzítésre és nem megy sehova; csak a testpontokat
   méri a készüléken. A végén a teljes felvételre lefut az elemzés, és a formáról is visszajelzést ad. */
import { h, clear } from './dom.js';
import { note, openCamera, liveCountdown, speak } from './widgets.js';
import { analyzeExercise, isAnalyzable } from '../core/exercise.js';
import { BONES } from '../core/geometry.js';

const UPDATE_EVERY = 0.5; /* ennyi időnként számolunk újra (mp) */
const ERR = {
  no_camera: 'Ezen a készüléken vagy ebben a böngészőben nem érhető el a kamera.',
  camera_denied: 'Nem kaptam engedélyt a kamerához. Engedélyezd a böngésző beállításaiban, vagy számolj kézzel.',
};
const NUM = ['', 'egy', 'kettő', 'három', 'négy', 'öt', 'hat', 'hét', 'nyolc', 'kilenc', 'tíz', 'tizenegy', 'tizenkettő', 'tizenhárom', 'tizennégy', 'tizenöt', 'tizenhat', 'tizenhét', 'tizennyolc', 'tizenkilenc', 'húsz'];

export const CHECK_NAMES = {
  depth: 'Mélység', knees_out: 'Térdek kifelé', chest_up: 'Törzstartás', tempo: 'Tempó', knee_line: 'Térd vonala', pelvis_level: 'Medence',
  other_leg_straight: 'Nyújtott láb', hips_high: 'Csípő magassága', rhythm: 'Ritmus', soft_landing: 'Puha érkezés',
  straight_line: 'Egyenes testvonal', steady: 'Stabilitás', still: 'Kilengés', hold_time: 'Kitartás', ankle_range: 'Bokahajlás',
  lockout: 'Teljes kinyújtás fent', full_stand: 'Teljes felállás', hips_open: 'Csípő kinyitva',
};
const FIX = {
  depth: 'Menj mélyebbre, a teljes mozgástartományban.', knees_out: 'Told a térded kifelé, a lábujjak irányába.', chest_up: 'Tartsd fent a mellkasod.',
  tempo: 'Lassíts: lefelé 2 másodperc.', knee_line: 'A térd ne dőljön befelé.', pelvis_level: 'Tartsd vízszintesen a medencéd.',
  other_leg_straight: 'A másik lábad maradjon nyújtva.', hips_high: 'Emeld magasabbra a csípőd.', rhythm: 'Egyenletesebb ritmus.',
  soft_landing: 'Puhábban érkezz, hajlított térddel.', straight_line: 'Fejtől sarokig egy vonal: a csípő ne lógjon be és ne emelkedjen.',
  steady: 'Próbálj mozdulatlanabbul tartani.', still: 'Kevesebb kilengés: nézz egy pontra.', hold_time: 'Próbáld tovább tartani.',
  ankle_range: 'A térdet told jobban előre, a sarok maradjon lent.', lockout: 'Fent nyújtsd ki teljesen a karod.',
  full_stand: 'Minden ismétlésnél állj fel teljesen.', hips_open: 'Fent told előre a csípőd, egyenesedj ki.',
};

function drawSkeleton(canvas, lm) {
  const w = canvas.clientWidth, hgt = canvas.clientHeight, dpr = window.devicePixelRatio || 1;
  if (canvas.width !== Math.round(w * dpr)) { canvas.width = Math.round(w * dpr); canvas.height = Math.round(hgt * dpr); }
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!lm) return;
  ctx.lineWidth = 3 * dpr; ctx.lineCap = 'round';
  for (const [a, b] of BONES) {
    const p = lm[a], q = lm[b];
    if (Math.min(p[3], q[3]) < 0.3) continue;
    ctx.strokeStyle = Math.min(p[3], q[3]) >= 0.5 ? '#3ee6e0' : 'rgba(255,95,162,.85)';
    ctx.beginPath(); ctx.moveTo(p[0] * canvas.width, p[1] * canvas.height); ctx.lineTo(q[0] * canvas.width, q[1] * canvas.height); ctx.stroke();
  }
}

/* Az elemzés eredménye szövegesen: mit mértem, és min javíts. */
export function feedback(r) {
  if (!r.ok) return note(r.reason === 'not_tracked' ? 'Nem láttalak elég jól. Támaszd le a telefont úgy, hogy tetőtől talpig beleférj, oldalról, jó fényben.' : 'Nem találtam a gyakorlat mozgását. Ellenőrizd a kameraállást.', 'warn');
  const fixes = r.checks.filter(c => c.band === 'fix');
  return h('div', { class: 'live-result' },
    h('p', { class: 'lead' }, r.holdSeconds != null && !r.reps ? `${Math.floor(r.holdSeconds)} másodperc` : `${r.reps} ismétlés`),
    r.checks.length ? h('ul', { class: 'rows' }, r.checks.map(c => h('li', null, h('span', null, CHECK_NAMES[c.id] || c.id), h('span', { class: 'badge ' + (c.band === 'ok' ? 'good' : 'warn') }, c.band === 'ok' ? 'Rendben' : 'Javítandó')))) : null,
    fixes.length ? h('ul', { class: 'plain' }, fixes.map(c => h('li', null, FIX[c.id] || ''))) : null,
    r.confidence != null && r.confidence < 0.6 ? note('A mérés bizonytalan (rossz látási viszonyok); kezeld fenntartással.', 'small') : null,
    note('A formaküszöbök szakmai becslések, szakember még nem kalibrálta őket.', 'small'));
}

/* exerciseId: a gyakorlat vagy teszt · opts: { maxSeconds, startLabel, onDone(result) } · → { el, stop() } vagy null */
export function liveCounter(exerciseId, opts = {}) {
  if (!isAnalyzable(exerciseId)) return null;
  const maxSeconds = opts.maxSeconds || 180;
  const stage = h('div', { class: 'live-stage', hidden: true });
  const canvas = h('canvas', { class: 'live-canvas', 'aria-hidden': 'true' });
  const big = h('div', { class: 'live-count', role: 'status', 'aria-live': 'polite' }, '0');
  const label = h('div', { class: 'live-label' }, '');
  const status = h('div', { 'aria-live': 'polite' });
  const voice = h('input', { type: 'checkbox', checked: true });
  let cam = null, running = false, wake = null, frames = [], aspect = 4 / 3;

  const startBtn = h('button', { type: 'button', class: 'btn', onclick: start }, opts.startLabel || 'Számolás kamerával');
  const stopBtn = h('button', { type: 'button', class: 'btn primary', hidden: true, onclick: () => end(true) }, 'Kész');

  async function start() {
    if (running) return;
    clear(status).append(note('A kamera és a pózbecslő indítása… (első alkalommal kb. 15 MB töltődik le, utána offline is megy)', 'small'));
    startBtn.disabled = true;
    try { cam = await openCamera(); }
    catch (e) { console.warn(e); clear(status).append(note(ERR[e && e.code] || 'Nem sikerült elindítani a kamerát.', 'warn')); startBtn.disabled = false; return; }
    running = true; frames = []; aspect = cam.aspect;
    clear(status);
    clear(stage).append(...(cam.el ? [cam.el] : []), canvas, h('div', { class: 'live-hud' }, big, label));
    stage.hidden = false; startBtn.hidden = true; stopBtn.hidden = false;
    try { wake = await navigator.wakeLock.request('screen'); } catch { wake = null; }
    loop(cam).catch(e => { console.error(e); end(false); });
  }

  async function loop(source) {
    const wait = liveCountdown();
    let t0 = null, lastCalc = -1, said = 0, lastSecond = -1;
    while (running) {
      const f = await source.read();
      if (!running) return;
      if (!f) break;
      drawSkeleton(canvas, f.lm);
      /* visszaszámlálás: legyen idő beállni; ezek a képkockák nem számítanak bele */
      if (t0 === null) t0 = f.t;
      const left = Math.ceil(wait - (f.t - t0));
      if (left > 0) {
        big.textContent = String(left); label.textContent = 'Állj be oldalt, tetőtől talpig';
        if (left !== lastSecond) { lastSecond = left; if (left <= 3) speak(NUM[left], voice.checked); }
        continue;
      }
      const t = f.t - t0 - wait;
      if (lastSecond !== 0) { lastSecond = 0; speak('Rajt!', voice.checked); }
      frames.push({ t, lm: f.lm });
      if (t - lastCalc >= UPDATE_EVERY) {
        lastCalc = t;
        const r = analyzeExercise(frames, { aspect, exercise: exerciseId });
        const hold = r.holdSeconds != null && !r.reps;
        const n = hold ? Math.floor(r.holdSeconds || 0) : (r.reps || 0);
        big.textContent = String(n);
        label.textContent = r.reason === 'not_tracked' ? 'Nem látlak elég jól' : hold ? 'másodperc' : 'ismétlés';
        if (hold) { if (n >= said + 10) { said = n - (n % 10); speak(said + ' másodperc', voice.checked); } }
        else if (n > said) { said = n; speak(NUM[n] || String(n), voice.checked); }
      }
      if (t >= maxSeconds) { speak('Vége', voice.checked); break; }
    }
    end(true);
  }

  function end(evaluate) {
    if (!running) return;
    running = false;
    if (cam) { cam.close(); cam = null; }
    if (wake) { wake.release().catch(() => {}); wake = null; }
    stage.hidden = true; clear(stage); stopBtn.hidden = true; startBtn.hidden = false; startBtn.disabled = false;
    const got = frames; frames = [];
    if (!evaluate) return;
    const r = analyzeExercise(got, { aspect, exercise: exerciseId });
    clear(status).append(feedback(r));
    if (opts.onDone) opts.onDone(r);
  }

  const el = h('div', { class: 'live' },
    h('div', { class: 'row' }, startBtn, stopBtn, h('label', { class: 'check' }, voice, h('span', null, 'Hangos számolás'))),
    stage, status,
    note('Támaszd le a telefont oldalt, kb. 2–3 méterre, hogy tetőtől talpig látsszál. A kamera képét nem rögzítem és nem küldöm sehova.', 'small'));
  return { el, stop: () => end(false) };
}
