/* Filmező mód: felvétel az appban a társ kezében, keretezési és vízszintjelzéssel.
   A rossz felvétel a leggyakoribb oka az elemezhetetlen videónak; itt már felvétel közben szólunk. */
import { h, clear } from './dom.js';
import { note, openFilmCamera, tickMs } from './widgets.js';

const MAX_SECONDS = 45, MIN_SECONDS = 5;
const ERR = {
  no_camera: 'Ebben a böngészőben nem tudok videót rögzíteni. Vedd fel a telefon kamerájával, és töltsd fel.',
  camera_denied: 'Nem kaptam engedélyt a kamerához. Engedélyezd a böngésző beállításaiban, vagy töltsd fel a videót.',
};
const FRAME = {
  no_person: ['Nem látom a csúszót', 'warn'], too_far: ['Túl messze van: menj közelebb', 'warn'],
  cut_off: ['Lelóg a képről: tartsd középen, tetőtől talpig', 'warn'], ok: ['Jó a keret', 'good'], unknown: ['Keretezés ellenőrzése…', ''],
};

/* A telefon oldalirányú dőlése fokban (0 = vízszintes), álló és fekvő tartásban is. null, ha nem tudni. */
export function rollFrom(beta, gamma, angle) {
  if (beta == null || gamma == null) return null;
  const a = ((angle || 0) % 360 + 360) % 360;
  const r = a === 90 ? -beta : a === 270 ? beta : a === 180 ? -gamma : gamma;
  return Math.max(-90, Math.min(90, r));
}

/* onDone(blob): a kész felvétel · → { el, stop() } */
export function recorder(onDone) {
  const stage = h('div', { class: 'film-stage', hidden: true });
  const frameBadge = h('span', { class: 'badge film-frame' }, FRAME.unknown[0]);
  const levelLine = h('div', { class: 'film-level-line' });
  const levelText = h('span', { class: 'badge film-level', hidden: true });
  const clock = h('span', { class: 'film-clock', role: 'timer' }, '0:00');
  const status = h('div', { 'aria-live': 'polite' });
  const openBtn = h('button', { type: 'button', class: 'btn', onclick: open }, 'Felvétel az appban');
  const recBtn = h('button', { type: 'button', class: 'btn primary film-rec', onclick: toggle }, 'Felvétel indítása');
  const cancelBtn = h('button', { type: 'button', class: 'btn', onclick: () => close() }, 'Mégse');
  let cam = null, recording = false, seconds = 0, tick = null, check = null, wake = null;

  const onOrient = e => {
    const roll = rollFrom(e.beta, e.gamma, (screen.orientation && screen.orientation.angle) || 0);
    if (roll == null) return;
    const ok = Math.abs(roll) <= 3;
    levelText.hidden = false;
    levelText.textContent = ok ? 'Vízszintes' : 'Ferde: ' + Math.round(Math.abs(roll)) + '°';
    levelText.className = 'badge film-level ' + (ok ? 'good' : 'warn');
    levelLine.style.transform = 'rotate(' + (-roll) + 'deg)';
    levelLine.classList.toggle('ok', ok);
  };

  async function open() {
    clear(status).append(note('Kamera indítása…', 'small'));
    openBtn.disabled = true;
    /* iOS-en a dőlésérzékelőhöz külön engedély kell, és csak gombnyomásra kérhető */
    try { if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') await DeviceOrientationEvent.requestPermission(); } catch { /* jelzés nélkül is működik */ }
    try { cam = await openFilmCamera(); }
    catch (e) { console.error(e); clear(status).append(note(ERR[e && e.code] || 'Nem sikerült elindítani a kamerát.', 'warn')); openBtn.disabled = false; return; }
    clear(status);
    clear(stage).append(...(cam.el ? [cam.el] : []), h('div', { class: 'film-guide', 'aria-hidden': 'true' }), levelLine,
      h('div', { class: 'film-hud' }, frameBadge, levelText, clock));
    stage.hidden = false; openBtn.hidden = true; controls.hidden = false;
    addEventListener('deviceorientation', onOrient);
    try { wake = await navigator.wakeLock.request('screen'); } catch { wake = null; }
    check = setInterval(() => {
      let r = null;
      try { r = cam.frameCheck(); } catch { r = null; }
      const [text, cls] = FRAME[r == null ? 'unknown' : r.ok ? 'ok' : r.reason] || FRAME.unknown;
      frameBadge.textContent = text; frameBadge.className = 'badge film-frame ' + cls;
    }, Math.max(20, tickMs() / 2));
  }

  async function toggle() {
    if (!cam) return;
    if (!recording) {
      cam.start(); recording = true; seconds = 0; clock.textContent = '0:00';
      recBtn.textContent = 'Leállítás és elemzés'; stage.classList.add('recording'); cancelBtn.hidden = true;
      tick = setInterval(() => {
        seconds++; clock.textContent = Math.floor(seconds / 60) + ':' + String(seconds % 60).padStart(2, '0');
        if (seconds >= MAX_SECONDS) toggle();
      }, tickMs());
      return;
    }
    clearInterval(tick); tick = null; recording = false;
    const blob = await cam.stop();
    const tooShort = seconds < MIN_SECONDS;
    close();
    if (!blob || !blob.size) { clear(status).append(note('A felvétel üres lett. Próbáld újra.', 'warn')); return; }
    if (tooShort) { clear(status).append(note(`A felvétel túl rövid (${seconds} mp). Legalább ${MIN_SECONDS} másodperc kell, 4–6 kanyarral.`, 'warn')); return; }
    onDone(blob);
  }

  function close() {
    clearInterval(tick); clearInterval(check); tick = check = null; recording = false;
    removeEventListener('deviceorientation', onOrient);
    if (cam) { cam.close(); cam = null; }
    if (wake) { wake.release().catch(() => {}); wake = null; }
    stage.hidden = true; stage.classList.remove('recording'); clear(stage);
    controls.hidden = true; openBtn.hidden = false; openBtn.disabled = false; cancelBtn.hidden = false;
    recBtn.textContent = 'Felvétel indítása';
  }

  const controls = h('div', { class: 'row', hidden: true }, recBtn, cancelBtn);
  const el = h('div', { class: 'film' }, openBtn, stage, controls, status,
    note('Add a telefont a társadnak. A kép közben jelzi, ha ferdén tartja, vagy ha nem látszol tetőtől talpig. A felvétel a telefonon marad.', 'small'));
  return { el, stop: close };
}
