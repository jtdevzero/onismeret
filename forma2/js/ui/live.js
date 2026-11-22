/* Élő számlálás kamerával (a Kanyar live.js-éből): a letámasztott telefon előtt végzett gyakorlat ismétléseit vagy a
   kitartott időt valós időben számolja, hangosan is. A kép nem kerül rögzítésre és nem megy sehova; csak a testpontokat
   méri a készüléken. A végén a teljes felvételre lefut az elemzés, és a formáról is visszajelzést ad. */
import { h, clear } from './dom.js';
import { note, openCamera, liveCountdown, speak } from './widgets.js';
import { analyzeExercise, isAnalyzable } from '../core/exercise.js';
import { BONES } from '../core/geometry.js';
import { measurementReliability } from '../core/motion-quality.js';
import { tr } from './i18n.js';

const UPDATE_EVERY = 0.5; /* ennyi időnként számolunk újra (mp) */
const ERR = {
  no_camera: tr('Ezen a készüléken vagy ebben a böngészőben nem érhető el a kamera.'),
  camera_denied: tr('Nem kaptam engedélyt a kamerához. Engedélyezd a böngésző beállításaiban, vagy számolj kézzel.'),
};
const NUM = ['', 'egy', tr('kettő'), tr('három'), tr('négy'), tr('öt'), 'hat', tr('hét'), 'nyolc', 'kilenc', tr('tíz'), 'tizenegy', tr('tizenkettő'), tr('tizenhárom'), tr('tizennégy'), tr('tizenöt'), 'tizenhat', tr('tizenhét'), 'tizennyolc', 'tizenkilenc', tr('húsz')];

export const CHECK_NAMES = {
  depth: tr('Mélység'), knees_out: tr('Térdek kifelé'), chest_up: tr('Törzstartás'), tempo: tr('Tempó'), knee_line: tr('Térd vonala'), pelvis_level: tr('Medence'),
  other_leg_straight: tr('Nyújtott láb'), hips_high: tr('Csípő magassága'), rhythm: tr('Ritmus'), soft_landing: tr('Puha érkezés'),
  straight_line: tr('Egyenes testvonal'), steady: tr('Stabilitás'), still: tr('Kilengés'), hold_time: tr('Kitartás'), ankle_range: tr('Bokahajlás'),
  lockout: tr('Teljes kinyújtás fent'), full_stand: tr('Teljes felállás'), hips_open: tr('Csípő kinyitva'),
};
const FIX = {
  depth: tr('Menj mélyebbre, a teljes mozgástartományban.'), knees_out: tr('Told a térded kifelé, a lábujjak irányába.'), chest_up: tr('Tartsd fent a mellkasod.'),
  tempo: tr('Lassíts: lefelé 2 másodperc.'), knee_line: tr('A térd ne dőljön befelé.'), pelvis_level: tr('Tartsd vízszintesen a medencéd.'),
  other_leg_straight: tr('A másik lábad maradjon nyújtva.'), hips_high: tr('Emeld magasabbra a csípőd.'), rhythm: tr('Egyenletesebb ritmus.'),
  soft_landing: tr('Puhábban érkezz, hajlított térddel.'), straight_line: tr('Fejtől sarokig egy vonal: a csípő ne lógjon be és ne emelkedjen.'),
  steady: tr('Próbálj mozdulatlanabbul tartani.'), still: tr('Kevesebb kilengés: nézz egy pontra.'), hold_time: tr('Próbáld tovább tartani.'),
  ankle_range: tr('A térdet told jobban előre, a sarok maradjon lent.'), lockout: tr('Fent nyújtsd ki teljesen a karod.'),
  full_stand: tr('Minden ismétlésnél állj fel teljesen.'), hips_open: tr('Fent told előre a csípőd, egyenesedj ki.'),
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

/* A követés megbízhatósága (nem a mozgás minősítése): szöveggel, nem csak színnel. */
function reliabilityNote(r) {
  const m = measurementReliability(r);
  return h('div', { class: 'live-reliability' }, h('p', { class: 'small' }, tr('Mérés megbízhatósága: '), h('strong', null, m.label), tr(' · használható képkockák: {p0}%', { p0: m.trackedPct })),
    m.reasons.length ? h('ul', { class: 'plain small muted' }, m.reasons.map(x => h('li', null, x))) : null,
    m.level === 'unreliable' ? note(tr('Ezt a mérést nem írom be magától. Mérj újra jobb fényben és kameraállással, vagy írd be kézzel.'), 'warn') : null);
}

/* Az elemzés eredménye szövegesen: mit mértem, és min javíts. */
export function feedback(r) {
  if (!r.ok) return h('div', null, note(r.reason === 'not_tracked' ? tr('Nem láttalak elég jól. Támaszd le a telefont úgy, hogy tetőtől talpig beleférj, oldalról, jó fényben.') : tr('Nem találtam a gyakorlat mozgását. Ellenőrizd a kameraállást.'), 'warn'), reliabilityNote(r));
  const fixes = r.checks.filter(c => c.band === 'fix');
  return h('div', { class: 'live-result' },
    h('p', { class: 'lead' }, r.jumpCm != null ? tr('Legjobb ugrás: {p0} cm ({p1} ugrás)', { p0: Math.round(r.jumpCm), p1: r.reps }) : r.holdSeconds != null && !r.reps ? tr('{p0} másodperc', { p0: Math.floor(r.holdSeconds) }) : tr('{p0} ismétlés', { p0: r.reps })),
    r.checks.length ? h('ul', { class: 'rows' }, r.checks.map(c => h('li', null, h('span', null, CHECK_NAMES[c.id] || c.id), h('span', { class: 'badge ' + (c.band === 'ok' ? 'good' : 'warn') }, c.band === 'ok' ? tr('Rendben') : tr('Javítandó'))))) : null,
    fixes.length ? h('ul', { class: 'plain' }, fixes.map(c => h('li', null, FIX[c.id] || ''))) : null,
    reliabilityNote(r),
    note(tr('Béta mérés: a pontosságot valódi felvételeken még nem validáltuk. A formaküszöbök szakmai becslések, szakember még nem kalibrálta őket. Az eredményt ellenőrizd és szükség esetén javítsd.'), 'small'));
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

  const startBtn = h('button', { type: 'button', class: 'btn', onclick: start }, opts.startLabel || tr('Számolás kamerával'));
  const stopBtn = h('button', { type: 'button', class: 'btn primary', hidden: true, onclick: () => end(true) }, tr('Kész'));

  async function start() {
    if (running) return;
    clear(status).append(note(tr('A kamera és a pózbecslő indítása… (első alkalommal kb. 15 MB töltődik le, utána offline is megy)'), 'small'));
    startBtn.disabled = true;
    try { cam = await openCamera(); }
    catch (e) { console.warn(e); clear(status).append(note(ERR[e && e.code] || tr('Nem sikerült elindítani a kamerát.'), 'warn')); startBtn.disabled = false; return; }
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
        big.textContent = String(left); label.textContent = tr('Állj be oldalt, tetőtől talpig');
        if (left !== lastSecond) { lastSecond = left; if (left <= 3) speak(NUM[left], voice.checked); }
        continue;
      }
      const t = f.t - t0 - wait;
      if (lastSecond !== 0) { lastSecond = 0; speak(tr('Rajt!'), voice.checked); }
      frames.push({ t, lm: f.lm });
      if (t - lastCalc >= UPDATE_EVERY) {
        lastCalc = t;
        const r = analyzeExercise(frames, { aspect, exercise: exerciseId });
        const hold = r.holdSeconds != null && !r.reps;
        const n = hold ? Math.floor(r.holdSeconds || 0) : (r.reps || 0);
        big.textContent = String(n);
        label.textContent = r.reason === 'not_tracked' ? tr('Nem látlak elég jól') : hold ? tr('másodperc') : tr('ismétlés');
        if (hold) { if (n >= said + 10) { said = n - (n % 10); speak(said + tr(' másodperc'), voice.checked); } }
        else if (n > said) { said = n; speak(NUM[n] || String(n), voice.checked); }
      }
      if (t >= maxSeconds) { speak(tr('Vége'), voice.checked); break; }
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
    /* mérési adat a küszöbök hangolásához: csak testpontok, kép nélkül; a telefonon marad, amíg te el nem küldöd */
    const data = () => JSON.stringify({ app: 'forma', kind: 'pose-data', version: 1, exercise: exerciseId, aspect, recorded: new Date().toISOString(),
      result: { reps: r.reps ?? null, holdSeconds: r.holdSeconds ?? null, checks: r.checks || [] },
      frames: got.map(f => ({ t: Math.round(f.t * 1000) / 1000, lm: f.lm ? f.lm.map(p => p.map(v => Math.round(v * 1000) / 1000)) : null })) });
    const dl = h('button', { type: 'button', class: 'btn small', onclick: () => {
      const url = URL.createObjectURL(new Blob([data()], { type: 'application/json' }));
      const a = h('a', { href: url, download: `forma-meres-${exerciseId}.json` });
      document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 2000);
    } }, tr('Mérési adat letöltése'));
    clear(status).append(feedback(r), got.length ? h('div', { class: 'row' }, dl, h('span', { class: 'small muted' }, tr('Testpontok kép nélkül, a hangoláshoz. Csak akkor kerül bárhová, ha te elküldöd.'))) : null);
    if (opts.onDone) opts.onDone(r);
  }

  const el = h('div', { class: 'live' },
    h('div', { class: 'row' }, startBtn, stopBtn, h('label', { class: 'check' }, voice, h('span', null, tr('Hangos számolás')))),
    stage, status,
    note(tr('Támaszd le a telefont oldalt, kb. 2–3 méterre, hogy tetőtől talpig látsszál. A kamera képét nem rögzítem és nem küldöm sehova.'), 'small'));
  return { el, stop: () => end(false) };
}
