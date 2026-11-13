/* Élő edzéskövetés: a letámasztott telefon kamerája előtt végzett gyakorlat ismétléseit (vagy a kitartott időt)
   valós időben számoljuk, hangosan is. A kép nem kerül rögzítésre; a végén ugyanaz az elemzés fut, mint videóból. */
import { h, clear } from './dom.js';
import { note, openCamera, liveCountdown } from './widgets.js';
import { analyzeExercise } from '../core/exercise.js';
import { BONES } from '../core/geometry.js';

const MAX_SECONDS = 180;      /* ennyi után magától leáll */
const UPDATE_EVERY = 0.5;     /* ennyi időnként számolunk újra (mp) */
const ERR = {
  no_camera: 'Ezen a készüléken vagy ebben a böngészőben nem érhető el a kamera.',
  camera_denied: 'Nem kaptam engedélyt a kamerához. Engedélyezd a böngésző beállításaiban, vagy töltsd fel a gyakorlatot videóként.',
};
const NUM = ['', 'egy', 'kettő', 'három', 'négy', 'öt', 'hat', 'hét', 'nyolc', 'kilenc', 'tíz', 'tizenegy', 'tizenkettő', 'tizenhárom', 'tizennégy', 'tizenöt', 'tizenhat', 'tizenhét', 'tizennyolc', 'tizenkilenc', 'húsz'];

function speak(text, enabled) {
  if (!enabled || !('speechSynthesis' in window)) return;
  try { const u = new SpeechSynthesisUtterance(text); u.lang = 'hu-HU'; u.rate = 1.1; speechSynthesis.cancel(); speechSynthesis.speak(u); } catch { /* a hang nem létfontosságú */ }
}

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
    ctx.strokeStyle = Math.min(p[3], q[3]) >= 0.5 ? '#3ee0a6' : 'rgba(255,200,60,.8)';
    ctx.beginPath(); ctx.moveTo(p[0] * canvas.width, p[1] * canvas.height); ctx.lineTo(q[0] * canvas.width, q[1] * canvas.height); ctx.stroke();
  }
}

/* exerciseId: a gyakorlat · onDone({ frames, aspect }, statusElem): a hívó elemzi és megjeleníti · → { el, stop() } */
export function liveCounter(exerciseId, onDone) {
  const stage = h('div', { class: 'live-stage', hidden: true });
  const canvas = h('canvas', { class: 'live-canvas', 'aria-hidden': 'true' });
  const big = h('div', { class: 'live-count', role: 'status', 'aria-live': 'polite' }, '0');
  const label = h('div', { class: 'live-label' }, '');
  const status = h('div', { 'aria-live': 'polite' });
  const voice = h('input', { type: 'checkbox', checked: true });
  let cam = null, running = false, wake = null, frames = [], aspect = 4 / 3;

  const startBtn = h('button', { type: 'button', class: 'btn', onclick: start }, 'Élő számlálás kamerával');
  const stopBtn = h('button', { type: 'button', class: 'btn primary', hidden: true, onclick: () => end(true) }, 'Kész, értékeld');

  async function start() {
    if (running) return;
    clear(status).append(note('Kamera indítása…', 'small'));
    startBtn.disabled = true;
    try { cam = await openCamera(); }
    catch (e) { console.error(e); clear(status).append(note(ERR[e && e.code] || 'Nem sikerült elindítani a kamerát.', 'warn')); startBtn.disabled = false; return; }
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
      if (!running) return;                /* közben leállították */
      if (!f) break;                       /* a forrás véget ért */
      drawSkeleton(canvas, f.lm);
      /* visszaszámlálás: legyen idő hátralépni; ezek a képkockák nem számítanak bele */
      if (t0 === null) t0 = f.t;
      const left = Math.ceil(wait - (f.t - t0));
      if (left > 0) {
        big.textContent = String(left); label.textContent = 'Állj be, hogy tetőtől talpig látsszál';
        if (left !== lastSecond) { lastSecond = left; if (left <= 3) speak(NUM[left], voice.checked); }
        continue;
      }
      const t = f.t - t0 - wait;
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
      if (t >= MAX_SECONDS) break;
    }
    end(true);
  }

  function end(evaluate) {
    if (!running) return;
    running = false;
    if (cam) { cam.close(); cam = null; }
    if (wake) { wake.release().catch(() => {}); wake = null; }
    try { if ('speechSynthesis' in window) speechSynthesis.cancel(); } catch { /* a hang nem létfontosságú */ }
    stage.hidden = true; clear(stage); stopBtn.hidden = true; startBtn.hidden = false; startBtn.disabled = false;
    const got = frames; frames = [];
    if (evaluate) onDone({ frames: got, aspect }, status);
  }

  const el = h('div', { class: 'live' },
    h('div', { class: 'row' }, startBtn, stopBtn, h('label', { class: 'check' }, voice, h('span', null, 'Hangos számolás'))),
    stage, status,
    note('A kamera képét nem rögzítem és nem küldöm sehova. Öt másodperced lesz beállni; a végén nyomd meg a „Kész” gombot.', 'small'));
  return { el, stop: () => end(false) };
}
