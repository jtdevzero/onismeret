/* A gyakorlatok ábrái SVG-ként. Csak attribútumokat állítunk (nincs beágyazott stílus), így a CSP-vel is működik. */
import { figurePoints, lerpPose, LEN } from '../core/figure.js';
import { h } from './dom.js';

const NS = 'http://www.w3.org/2000/svg';
const el = (tag, attrs) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v)); return e; };
const line = (a, b, cls) => el('line', { x1: a.x.toFixed(1), y1: a.y.toFixed(1), x2: b.x.toFixed(1), y2: b.y.toFixed(1), class: cls });
const path = (pts, cls) => el('polyline', { points: pts.map(p => p.x.toFixed(1) + ',' + p.y.toFixed(1)).join(' '), class: cls });

function frameSvg(frame, opts) {
  const f = figurePoints(frame.pose), pad = 12;
  let { x0, x1, y0, y1 } = f.box;
  const wallX = opts.wall === 'back' ? x0 - 3 : opts.wall === 'front' ? x1 + 3 : null;
  if (wallX != null) { x0 = Math.min(x0, wallX - 4); x1 = Math.max(x1, wallX + 4); }
  const svg = el('svg', { viewBox: `${(x0 - pad).toFixed(1)} ${(y0 - pad).toFixed(1)} ${(x1 - x0 + 2 * pad).toFixed(1)} ${(y1 - y0 + pad + 4).toFixed(1)}`, class: 'fig', 'aria-hidden': 'true' });
  svg.append(line({ x: x0 - pad, y: f.ground + 2 }, { x: x1 + pad, y: f.ground + 2 }, 'fig-ground'));
  if (wallX != null) svg.append(line({ x: wallX, y: y0 - pad }, { x: wallX, y: f.ground + 2 }, 'fig-ground'));
  const far = opts.front ? 'fig-limb' : 'fig-limb fig-far';
  svg.append(path(f.legF, far), path(f.armF, far));
  svg.append(line(f.pelvis, f.neck, 'fig-limb'), line(f.neck, f.head, 'fig-limb'));
  svg.append(path(f.legN, 'fig-limb'), path(f.armN, 'fig-limb'));
  svg.append(el('circle', { cx: f.head.x.toFixed(1), cy: f.head.y.toFixed(1), r: LEN.head, class: 'fig-head' }));
  return svg;
}

/* spec: a data/figures.json egy bejegyzése · → elem vagy null */
export function figureStrip(spec, compact = false) {
  if (!spec || !spec.frames || !spec.frames.length) return null;
  return h('div', { class: 'figs' + (compact ? ' compact' : ''), role: 'img', 'aria-label': 'Ábra: ' + spec.frames.map(f => f.label).join(', majd ') },
    spec.frames.map((fr, i) => [
      i ? h('span', { class: 'fig-arrow', 'aria-hidden': 'true' }, '→') : null,
      h('figure', { class: 'fig-frame' }, frameSvg(fr, spec), compact ? null : h('figcaption', null, fr.label)),
    ]));
}

/* Mozgó ábra: a képkockák között oda-vissza animál (egy képkockánál állókép). Csökkentett mozgás beállításnál,
   vagy ha a lap nem látszik, az első képkockán áll. A ciklus magától leáll, amikor az elem lekerül a lapról. */
export function figureAnim(spec, opts = {}) {
  if (!spec || !spec.frames || !spec.frames.length) return null;
  const frames = spec.frames;
  /* közös keret az összes képkockára, hogy a figura ne ugráljon */
  const boxes = frames.map(f => figurePoints(f.pose).box), pad = 12;
  let x0 = Math.min(...boxes.map(b => b.x0)), x1 = Math.max(...boxes.map(b => b.x1));
  const y0 = Math.min(...boxes.map(b => b.y0)), y1 = Math.max(...boxes.map(b => b.y1));
  const wallX = spec.wall === 'back' ? x0 - 3 : spec.wall === 'front' ? x1 + 3 : null;
  if (wallX != null) { x0 = Math.min(x0, wallX - 4); x1 = Math.max(x1, wallX + 4); }
  const svg = el('svg', { viewBox: `${(x0 - pad).toFixed(1)} ${(y0 - pad).toFixed(1)} ${(x1 - x0 + 2 * pad).toFixed(1)} ${(y1 - y0 + pad + 4).toFixed(1)}`, class: 'fig fig-anim', 'aria-hidden': 'true' });
  const ground = line({ x: x0 - pad, y: y1 + 2 }, { x: x1 + pad, y: y1 + 2 }, 'fig-ground');
  svg.append(ground);
  if (wallX != null) svg.append(line({ x: wallX, y: y0 - pad }, { x: wallX, y: y1 + 2 }, 'fig-ground'));
  const far = spec.front ? 'fig-limb' : 'fig-limb fig-far';
  const parts = { legF: path([], far), armF: path([], far), torso: line({ x: 0, y: 0 }, { x: 0, y: 0 }, 'fig-limb'), neck: line({ x: 0, y: 0 }, { x: 0, y: 0 }, 'fig-limb'), legN: path([], 'fig-limb'), armN: path([], 'fig-limb'), head: el('circle', { r: LEN.head, class: 'fig-head' }) };
  svg.append(parts.legF, parts.armF, parts.torso, parts.neck, parts.legN, parts.armN, parts.head);
  const pts = a => a.map(p => p.x.toFixed(1) + ',' + p.y.toFixed(1)).join(' ');
  const draw = pose => {
    const f = figurePoints(pose), dy = y1 - f.ground; /* a talajhoz igazítva */
    const sh = a => a.map(p => ({ x: p.x, y: p.y + dy }));
    parts.legF.setAttribute('points', pts(sh(f.legF))); parts.armF.setAttribute('points', pts(sh(f.armF)));
    parts.legN.setAttribute('points', pts(sh(f.legN))); parts.armN.setAttribute('points', pts(sh(f.armN)));
    for (const [ln, a, b] of [[parts.torso, f.pelvis, f.neck], [parts.neck, f.neck, f.head]]) {
      ln.setAttribute('x1', a.x.toFixed(1)); ln.setAttribute('y1', (a.y + dy).toFixed(1)); ln.setAttribute('x2', b.x.toFixed(1)); ln.setAttribute('y2', (b.y + dy).toFixed(1));
    }
    parts.head.setAttribute('cx', f.head.x.toFixed(1)); parts.head.setAttribute('cy', (f.head.y + dy).toFixed(1));
  };
  draw(frames[0].pose);
  const label = h('figcaption', { class: 'fig-live-label' }, frames[0].label);
  const box = h('figure', { class: 'fig-live' + (opts.compact ? ' compact' : ''), role: 'img', 'aria-label': 'Ábra: ' + frames.map(f => f.label).join(', majd ') }, svg, label);
  const still = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (frames.length > 1 && !still && typeof requestAnimationFrame === 'function') {
    const seg = 1400, hold = 500, n = frames.length, cycle = (n - 1) * 2 * (seg + hold);
    let t0 = null;
    const ease = x => (x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2);
    const tick = ts => {
      if (!box.isConnected && t0 != null) return; /* lekerült a lapról: leáll */
      if (t0 == null) t0 = ts;
      let t = (ts - t0) % cycle;
      /* oda: 0→1→…→n-1, vissza: n-1→…→0 */
      const order = [...Array(n).keys()].concat([...Array(n - 1).keys()].reverse());
      const legs = order.length - 1, legT = seg + hold, i = Math.min(legs - 1, Math.floor(t / legT)), within = t - i * legT;
      const a = frames[order[i]], b = frames[order[i + 1]];
      const f = within < hold ? 0 : ease(Math.min(1, (within - hold) / seg));
      draw(lerpPose(a.pose, b.pose, f));
      label.textContent = (f < 0.5 ? a : b).label;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
  return box;
}
