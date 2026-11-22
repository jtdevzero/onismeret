/* A gyakorlatok ábrái SVG-ként. Csak attribútumokat állítunk (nincs beágyazott stílus), így a CSP-vel is működik. */
import { figurePoints, lerpPose, LEN } from '../core/figure.js';
import { h } from './dom.js';

const NS = 'http://www.w3.org/2000/svg';
const el = (tag, attrs) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v)); return e; };
const line = (a, b, cls) => el('line', { x1: a.x.toFixed(1), y1: a.y.toFixed(1), x2: b.x.toFixed(1), y2: b.y.toFixed(1), class: cls });
const path = (pts, cls) => el('polyline', { points: pts.map(p => p.x.toFixed(1) + ',' + p.y.toFixed(1)).join(' '), class: cls });

/* Ruházatot formázó, semleges sziluett ugyanazokra az ízületi pontokra.
   A távolabbi végtag halványabb; a mérési póz és az eszközök helye nem változik. */
function athlete(svg, front) {
  const far = front ? '' : ' fig-far';
  const parts = { legF: path([], 'fig-limb fig-leg' + far), armF: path([], 'fig-limb fig-arm' + far),
    neck: line({ x: 0, y: 0 }, { x: 0, y: 0 }, 'fig-limb fig-neck'), shirt: el('path', { class: 'fig-shirt' }),
    legN: path([], 'fig-limb fig-leg'), armN: path([], 'fig-limb fig-arm'), head: el('circle', { r: LEN.head, class: 'fig-head' }) };
  svg.append(parts.legF, parts.armF, parts.neck, parts.shirt, parts.legN, parts.armN, parts.head);
  const pts = a => a.map(p => p.x.toFixed(1) + ',' + p.y.toFixed(1)).join(' ');
  return f => {
    for (const k of ['legF', 'armF', 'legN', 'armN']) parts[k].setAttribute('points', pts(f[k]));
    const shoulder = { x: (f.armN[0].x + f.armF[0].x) / 2, y: (f.armN[0].y + f.armF[0].y) / 2 };
    const dx = shoulder.x - f.pelvis.x, dy = shoulder.y - f.pelvis.y, length = Math.hypot(dx, dy) || 1;
    const nx = -dy / length, ny = dx / length;
    const edge = (p, width) => ({ x: p.x + nx * width, y: p.y + ny * width });
    const a = edge(shoulder, 10), b = edge(f.pelvis, 7), c = edge(f.pelvis, -7), d = edge(shoulder, -10);
    const xy = p => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
    parts.shirt.setAttribute('d', `M ${xy(a)} L ${xy(b)} Q ${xy(f.pelvis)} ${xy(c)} L ${xy(d)} Q ${xy(f.neck)} ${xy(a)} Z`);
    for (const [key, p] of [['1', f.neck], ['2', f.head]]) {
      parts.neck.setAttribute('x' + key, p.x.toFixed(1)); parts.neck.setAttribute('y' + key, p.y.toFixed(1));
    }
    parts.head.setAttribute('cx', f.head.x.toFixed(1)); parts.head.setAttribute('cy', f.head.y.toFixed(1));
  };
}

function sceneProps(svg, spec) {
  for (const points of spec.props || []) svg.append(path(points.map(([x, y]) => ({ x, y })), 'fig-prop'));
}
function sceneBounds(boxes, spec) {
  const props = (spec.props || []).flat();
  const xs = props.map(p => p[0]), ys = props.map(p => p[1]);
  return { x0: Math.min(...boxes.map(b => b.x0), ...xs), x1: Math.max(...boxes.map(b => b.x1), ...xs),
    y0: Math.min(...boxes.map(b => b.y0), ...ys), y1: Math.max(...boxes.map(b => b.y1), ...ys) };
}
function equipment(svg, spec) {
  const loads = [];
  for (const side of spec.load === 'both' ? ['armN', 'armF'] : spec.load ? ['armN'] : []) {
    const g = el('g', { class: 'fig-weight' });
    if (spec.load === 'kettle') {
      g.append(el('circle', { cx: 0, cy: -3, r: 4, class: 'fig-handle' }), el('circle', { cx: 0, cy: 6, r: 7 }));
    } else g.append(line({ x: -7, y: 0 }, { x: 7, y: 0 }, 'fig-prop'), el('rect', { x: -10, y: -6, width: 5, height: 12, rx: 1 }), el('rect', { x: 5, y: -6, width: 5, height: 12, rx: 1 }));
    svg.append(g); loads.push({ g, side });
  }
  const band = spec.band ? line({ x: 0, y: 0 }, { x: 0, y: 0 }, 'fig-band') : null;
  if (band) svg.append(band);
  return f => {
    for (const { g, side } of loads) { const p = f[side].at(-1); g.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`); }
    if (band) {
      const a = f.armN.at(-1), b = spec.band === 'hands' ? f.armF.at(-1) : { x: spec.anchor[0], y: spec.anchor[1] };
      band.setAttribute('x1', a.x); band.setAttribute('y1', a.y); band.setAttribute('x2', b.x); band.setAttribute('y2', b.y);
    }
  };
}

function frameSvg(frame, opts) {
  const f = figurePoints(frame.pose), pad = 12;
  let { x0, x1, y0, y1 } = sceneBounds([f.box], opts);
  const wallX = opts.wall === 'back' ? x0 - 3 : opts.wall === 'front' ? x1 + 3 : null;
  if (wallX != null) { x0 = Math.min(x0, wallX - 4); x1 = Math.max(x1, wallX + 4); }
  const svg = el('svg', { viewBox: `${(x0 - pad).toFixed(1)} ${(y0 - pad).toFixed(1)} ${(x1 - x0 + 2 * pad).toFixed(1)} ${(y1 - y0 + pad + 4).toFixed(1)}`, class: 'fig', 'aria-hidden': 'true' });
  svg.append(line({ x: x0 - pad, y: f.ground + 2 }, { x: x1 + pad, y: f.ground + 2 }, 'fig-ground'));
  sceneProps(svg, opts);
  if (wallX != null) svg.append(line({ x: wallX, y: y0 - pad }, { x: wallX, y: f.ground + 2 }, 'fig-ground'));
  athlete(svg, opts.front)(f);
  equipment(svg, opts)(f);
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
  let { x0, x1, y0, y1 } = sceneBounds(boxes, spec);
  const wallX = spec.wall === 'back' ? x0 - 3 : spec.wall === 'front' ? x1 + 3 : null;
  if (wallX != null) { x0 = Math.min(x0, wallX - 4); x1 = Math.max(x1, wallX + 4); }
  const svg = el('svg', { viewBox: `${(x0 - pad).toFixed(1)} ${(y0 - pad).toFixed(1)} ${(x1 - x0 + 2 * pad).toFixed(1)} ${(y1 - y0 + pad + 4).toFixed(1)}`, class: 'fig fig-anim', 'aria-hidden': 'true' });
  const ground = line({ x: x0 - pad, y: y1 + 2 }, { x: x1 + pad, y: y1 + 2 }, 'fig-ground');
  svg.append(ground);
  sceneProps(svg, spec);
  if (wallX != null) svg.append(line({ x: wallX, y: y0 - pad }, { x: wallX, y: y1 + 2 }, 'fig-ground'));
  const drawAthlete = athlete(svg, spec.front);
  const drawEquipment = equipment(svg, spec);
  const draw = pose => {
    const f = figurePoints(pose), dy = y1 - f.ground; /* a talajhoz igazítva */
    const sh = a => a.map(p => ({ x: p.x, y: p.y + dy }));
    const moved = { ...f, pelvis: sh([f.pelvis])[0], neck: sh([f.neck])[0], head: sh([f.head])[0],
      legN: sh(f.legN), legF: sh(f.legF), armN: sh(f.armN), armF: sh(f.armF) };
    drawAthlete(moved); drawEquipment(moved);
  };
  draw(frames[0].pose);
  const label = h('figcaption', { class: 'fig-live-label' }, frames[0].label);
  const box = h('figure', { class: 'fig-live' + (opts.compact ? ' compact' : '') + (opts.big ? ' big' : ''), role: 'img', 'aria-label': 'Ábra: ' + frames.map(f => f.label).join(', majd ') }, svg, label);
  const motion = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : null;
  const still = opts.still || motion?.matches;
  if (frames.length > 1 && !still && typeof requestAnimationFrame === 'function') {
    const seg = 1400, hold = 500, n = frames.length, cycle = (n - 1) * 2 * (seg + hold);
    let t0 = null, seen = false, waits = 0;
    const ease = x => (x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2);
    const tick = ts => {
      /* ha még nincs a lapon, legfeljebb kb. 2 mp-ig vár rá; ha már volt rajta és lekerült, leáll */
      if (!box.isConnected) { if (seen || ++waits > 120) return; requestAnimationFrame(tick); return; }
      seen = true;
      if (motion?.matches || document.hidden) { draw(frames[0].pose); label.textContent = frames[0].label; t0 = null; requestAnimationFrame(tick); return; }
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
