/* Rárajzolt visszajátszás: a videó fölé rajzoljuk a csontvázat, alá a kanyarok idővonalát. */
import { h } from './dom.js';
import { BONES, KEY_POINTS } from '../core/geometry.js';

/* A t időponthoz legközelebbi mért képkocka (bináris keresés). */
function frameAt(frames, t) {
  let lo = 0, hi = frames.length - 1;
  while (lo < hi) { const m = (lo + hi) >> 1; if (frames[m].t < t) lo = m + 1; else hi = m; }
  const a = frames[Math.max(0, lo - 1)], b = frames[lo];
  const f = Math.abs(a.t - t) < Math.abs(b.t - t) ? a : b;
  return f.lm && Math.abs(f.t - t) < 0.25 ? f : null;
}

/* blob: a videó · frames: [{ t, lm }] · turns: a kanyarok (lehet üres) → { el, destroy } */
export function replay(blob, frames, turns = []) {
  const url = URL.createObjectURL(blob);
  const video = h('video', { src: url, controls: true, playsInline: true, muted: true, preload: 'metadata', class: 'replay-video' });
  const canvas = h('canvas', { class: 'replay-canvas', 'aria-hidden': 'true' });
  const cursor = h('div', { class: 'tl-cursor' });
  const timeline = h('div', { class: 'timeline', role: 'img', 'aria-label': 'A kanyarok idővonala' }, cursor);
  let raf = 0, dead = false;

  function layout() {
    const d = video.duration;
    if (!Number.isFinite(d) || !d) return;
    for (const k of turns) {
      const seg = h('div', { class: 'tl-turn tl-' + k.dir + (k.partial ? ' tl-partial' : '') });
      seg.style.left = (100 * k.t0 / d) + '%';
      seg.style.width = (100 * (k.t1 - k.t0) / d) + '%';
      timeline.append(seg);
    }
  }
  function draw() {
    if (dead) return;
    const w = video.clientWidth, hgt = video.clientHeight, dpr = window.devicePixelRatio || 1;
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(hgt * dpr)) { canvas.width = Math.round(w * dpr); canvas.height = Math.round(hgt * dpr); }
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const f = frames.length ? frameAt(frames, video.currentTime) : null;
    if (f) {
      const X = p => p[0] * canvas.width, Y = p => p[1] * canvas.height;
      ctx.lineWidth = 3 * dpr; ctx.lineCap = 'round';
      for (const [a, b] of BONES) {
        const p = f.lm[a], q = f.lm[b];
        if (Math.min(p[3], q[3]) < 0.3) continue;
        ctx.strokeStyle = Math.min(p[3], q[3]) >= 0.5 ? '#3ee0a6' : 'rgba(255,200,60,.8)';
        ctx.beginPath(); ctx.moveTo(X(p), Y(p)); ctx.lineTo(X(q), Y(q)); ctx.stroke();
      }
      ctx.fillStyle = '#fff';
      for (const i of KEY_POINTS) { const p = f.lm[i]; if (p[3] >= 0.3) { ctx.beginPath(); ctx.arc(X(p), Y(p), 4 * dpr, 0, 7); ctx.fill(); } }
    }
    if (Number.isFinite(video.duration) && video.duration) cursor.style.left = (100 * video.currentTime / video.duration) + '%';
    raf = requestAnimationFrame(draw);
  }
  video.addEventListener('loadedmetadata', () => { layout(); raf = requestAnimationFrame(draw); }, { once: true });

  const slow = h('button', { type: 'button', class: 'chip', 'aria-pressed': 'false', onclick: () => {
    const on = video.playbackRate === 1;
    video.playbackRate = on ? 0.5 : 1;
    slow.setAttribute('aria-pressed', String(on));
    slow.classList.toggle('on', on);
  } }, 'Lassítva (0,5×)');
  const el = h('div', { class: 'replay' },
    h('div', { class: 'replay-stage' }, video, canvas),
    turns.length ? timeline : null,
    h('div', { class: 'row' }, slow, turns.length ? h('span', { class: 'muted small' }, 'Az idővonalon a két szín a két kanyarirány.') : null));
  return { el, destroy: () => { dead = true; cancelAnimationFrame(raf); video.pause(); video.removeAttribute('src'); video.load(); URL.revokeObjectURL(url); } };
}
