/* A gyakorlatok ábrái SVG-ként. Csak attribútumokat állítunk (nincs beágyazott stílus), így a CSP-vel is működik. */
import { figurePoints, LEN } from '../core/figure.js';
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
