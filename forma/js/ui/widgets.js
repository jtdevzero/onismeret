/* Közös felületi elemek, hang és időzítő. */
import { h, extLink } from './dom.js';

export const page = (title, ...kids) => h('div', { class: 'page' }, h('h1', null, title), kids);
export const card = (...kids) => h('section', { class: 'card' }, kids);
export const btn = (text, onclick, cls = '') => h('button', { type: 'button', class: 'btn ' + cls, onclick }, text);
export const link = (href, text, cls = '') => h('a', { href, class: cls }, text);
export const note = (text, cls = '') => h('p', { class: 'note ' + cls }, text);
export const list = items => h('ul', { class: 'plain' }, items.map(i => h('li', null, i)));

/* Választógombok (rádiócsoport). options: [[érték, felirat]] */
/* Életkor pörgethető listából (1–99): telefonon a rendszer forgókerekes választója jelenik meg.
   A felnőtt korhatárt (18+) a hívó ellenőrzi és jelzi; a lista csak a beírást könnyíti. */
export function ageSelect(value, onchange, attrs = {}) {
  const sel = h('select', { class: 'age-select', ...attrs, onchange: () => onchange(sel.value === '' ? null : Number(sel.value)) },
    h('option', { value: '' }, '–'), Array.from({ length: 99 }, (_, i) => h('option', { value: String(i + 1) }, String(i + 1))));
  sel.value = Number.isInteger(value) ? String(value) : '';
  return sel;
}
export function choice(name, options, value, onchange, label) {
  return h('div', { class: 'choice', role: 'radiogroup', 'aria-label': label }, options.map(([v, text]) =>
    h('label', { class: 'choice-item' },
      h('input', { type: 'radio', name, value: String(v), checked: v === value, onchange: () => onchange(v) }),
      h('span', null, text))));
}

/* A kamera és a pózbecslés a tesztekben lecserélhető (valódi kamera nélkül nem lehet determinisztikusan tesztelni). */
let runner = { openCamera: async () => (await import('./pose.js')).openCamera(), openMotion: () => openMotionReal(), openPpg: () => openPpgReal(), countdown: 5 };
export const openMotion = () => runner.openMotion();
export const openPpg = () => runner.openPpg();

/* Mozgásérzékelő (gyorsulásmérő). iOS-en engedélyt kér. → { samples: [{ t, x, y, z }], stop() } */
async function openMotionReal() {
  if (typeof DeviceMotionEvent === 'undefined') throw Object.assign(new Error('no_motion'), { code: 'no_motion' });
  if (typeof DeviceMotionEvent.requestPermission === 'function') {
    const p = await DeviceMotionEvent.requestPermission().catch(() => 'denied');
    if (p !== 'granted') throw Object.assign(new Error('motion_denied'), { code: 'motion_denied' });
  }
  const samples = [], t0 = performance.now();
  const on = e => { const a = e.accelerationIncludingGravity || e.acceleration; if (a && a.x != null) samples.push({ t: (performance.now() - t0) / 1000, x: a.x, y: a.y, z: a.z }); };
  addEventListener('devicemotion', on);
  return { samples, stop: () => removeEventListener('devicemotion', on) };
}

/* Fényjel a hátsó kamerából (ujj a lencsén, vaku bekapcsolva, ha a készülék engedi).
   → { read(): { t, v } a vörös csatorna átlaga, close() } */
async function openPpgReal() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw Object.assign(new Error('no_camera'), { code: 'no_camera' });
  let stream;
  try { stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: { ideal: 'environment' }, width: { ideal: 160 }, height: { ideal: 120 }, frameRate: { ideal: 30 } } }); }
  catch { throw Object.assign(new Error('camera_denied'), { code: 'camera_denied' }); }
  const track = stream.getVideoTracks()[0];
  let torch = false;
  try { await track.applyConstraints({ advanced: [{ torch: true }] }); torch = true; } catch { torch = false; }
  const video = document.createElement('video'); video.muted = true; video.playsInline = true; video.srcObject = stream;
  await video.play().catch(() => {});
  const c = document.createElement('canvas'); c.width = 40; c.height = 30; const g = c.getContext('2d', { willReadFrequently: true });
  const t0 = performance.now();
  const next = () => new Promise(r => ('requestVideoFrameCallback' in video ? video.requestVideoFrameCallback(() => r()) : requestAnimationFrame(() => r())));
  return {
    torch,
    async read() { await next(); g.drawImage(video, 0, 0, 40, 30); const d = g.getImageData(10, 7, 20, 16).data; let s = 0; for (let i = 0; i < d.length; i += 4) s += d[i]; return { t: (performance.now() - t0) / 1000, v: s / (d.length / 4) }; },
    close() { stream.getTracks().forEach(t => t.stop()); },
  };
}
export const setRunner = r => { runner = { ...runner, ...r }; };
export const openCamera = () => runner.openCamera();
export const liveCountdown = () => runner.countdown;

/* Az időzítő üteme a tesztekben felgyorsítható. */
let tick = 1000;
export const setTick = ms => { tick = ms; };
export const tickMs = () => tick;

export function speak(text, enabled = true) {
  if (!enabled || !('speechSynthesis' in window)) return;
  try { const u = new SpeechSynthesisUtterance(text); u.lang = 'hu-HU'; u.rate = 1.1; speechSynthesis.cancel(); speechSynthesis.speak(u); } catch { /* a hang nem létfontosságú */ }
}

/* Rövid hangjelzés (metronóm, időzítő vége). A hangkimenetet csak felhasználói mozdulat után indítjuk. */
let audio = null;
export function beep(freq = 880, ms = 90) {
  try {
    audio ||= new (window.AudioContext || window.webkitAudioContext)();
    const o = audio.createOscillator(), g = audio.createGain();
    o.frequency.value = freq; g.gain.value = 0.15;
    o.connect(g).connect(audio.destination);
    o.start(); o.stop(audio.currentTime + ms / 1000);
  } catch { /* hang nélkül is működik */ }
}

export function videoSearch(ex) {
  const q = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(ex.query || ex.name);
  return h('p', { class: 'small' }, extLink(q, 'Bemutató videók keresése a YouTube-on'), h('span', { class: 'muted' }, ' · új lapon nyílik'));
}

export const levelBadge = (level, text) => h('span', { class: 'badge ' + level }, text);
export const fmtNum = v => (Number.isInteger(v) ? String(v) : String(v).replace('.', ','));

/* A CSP nem enged style-attribútumot: a méretet a CSSOM-on át állítjuk. */
export const sized = (el, prop, pct) => { el.style[prop] = Number(pct).toFixed(1) + '%'; return el; };

/* Finom rezgés a fontos gombokon (ha a készülék tudja); a csökkentett mozgás beállítást tiszteletben tartja. */
export function initHaptics() {
  addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('.btn.primary, .seg-item, .react-pad');
    if (!b || (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
    try { if (navigator.vibrate) navigator.vibrate(12); } catch { /* nem létfontosságú */ }
  }, { passive: true });
}

/* Rövid szintlépés-visszajelzés; csökkentett mozgásnál nem takarja a képernyőt. */
export function celebrate() {
  if (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const box = h('div', { class: 'celebration', role: 'status' }, h('span', { 'aria-hidden': 'true' }, '✓'), 'Szintet léptél!');
  document.body.append(box);
  setTimeout(() => box.remove(), 2200);
}

/* Felpörgő szám: a cél értékig animál (csökkentett mozgásnál azonnal). */
export function countUp(el, target, suffix = '', ms = 700) {
  if (!Number.isFinite(target) || (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches) || typeof requestAnimationFrame !== 'function') { el.textContent = (Number.isFinite(target) ? target : '–') + suffix; return el; }
  const t0 = performance.now();
  const step = t => { const f = Math.min(1, (t - t0) / ms); el.textContent = Math.round(target * (1 - (1 - f) ** 3)) + suffix; if (f < 1) requestAnimationFrame(step); };
  el.textContent = '0' + suffix; requestAnimationFrame(step);
  return el;
}

/* Napszak a nyitórajzhoz: reggel, nappal, naplemente, éjszaka. */
/* Fejlécképek (assets/art/): edzéstípusonként. Nem töltődnek le előre: első megnyitáskor jönnek, utána offline is megvannak. */
export const ART = { strength: ['strength', 'strength2', 'curl', 'press', 'pushup', 'plank'], speed: ['speed', 'speed2', 'runner'], mobility: ['mobility', 'mobility2', 'balance', 'walk'], cardio: ['cardio', 'swim', 'ride', 'spin'], home: ['home', 'walk'], progress: ['progress2', 'climb', 'flag'], run: ['duo-run', 'night-run', 'speed2'], kick: ['kick'] };
export function artClass(kind, d = new Date()) {
  const k = String(kind || '').startsWith('strength') ? 'strength' : String(kind || '').startsWith('speed') ? 'speed' : kind;
  const list = ART[k] || ART.home;
  return 'art art-' + list[d.getDate() % list.length];
}
/* képes fejlécsáv egy oldal tetejére (dekoráció: a cím szövegként is ott van) */
export const artBanner = (kind, eyebrow, title) => h('div', { class: 'art-banner ' + artClass(kind).replace('art ', '') }, eyebrow ? h('p', { class: 'eyebrow' }, eyebrow) : null, h('h2', null, title));
export function heroTime(d = new Date()) {
  const hr = d.getHours();
  return hr >= 5 && hr < 10 ? 'morning' : hr >= 10 && hr < 17 ? 'day' : hr >= 17 && hr < 21 ? 'sunset' : 'night';
}

/* Üres állapot egy biztató ábrával. */
export function emptyState(text, action) {
  return h('div', { class: 'empty' }, h('span', { class: 'empty-ic', 'aria-hidden': 'true' }), h('p', null, text), action || null);
}

/* Gyakorlattípus-ikon a listákban. */
export const typeIcon = type => h('span', { class: 'ic tic tic-' + type, 'aria-hidden': 'true' });
