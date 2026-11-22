/* Pókhálóábra a területek pontszámáról (0–100). Csak attribútumokat állítunk, nincs beágyazott stílus (CSP). */
const NS = 'http://www.w3.org/2000/svg';
const el = (tag, attrs, text) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v)); if (text != null) e.textContent = text; return e; };

/* axes: [{ label, value, prev? }] · → svg elem */
export function radar(axes, opts = {}) {
  const size = 320, c = size / 2, R = 108, n = axes.length;
  const pt = (i, v) => { const a = -Math.PI / 2 + (2 * Math.PI * i) / n, r = R * Math.max(0, Math.min(100, v)) / 100; return [c + r * Math.cos(a), c + r * Math.sin(a)]; };
  const poly = vals => vals.map((v, i) => pt(i, v).map(x => x.toFixed(1)).join(',')).join(' ');
  const svg = el('svg', { viewBox: `-30 -10 ${size + 60} ${size + 20}`, class: 'radar', role: 'img', 'aria-label': opts.label || 'Pókhálóábra' });
  for (const r of [25, 50, 75, 100]) svg.append(el('polygon', { points: poly(axes.map(() => r)), class: r === 50 ? 'radar-ref' : 'radar-grid' }));
  axes.forEach((_, i) => { const [x, y] = pt(i, 100); svg.append(el('line', { x1: c, y1: c, x2: x.toFixed(1), y2: y.toFixed(1), class: 'radar-grid' })); });
  if (axes.every(a => a.prev != null)) svg.append(el('polygon', { points: poly(axes.map(a => a.prev)), class: 'radar-prev' }));
  svg.append(el('polygon', { points: poly(axes.map(a => a.value)), class: 'radar-area' }));
  axes.forEach((a, i) => {
    const [x, y] = pt(i, a.value);
    svg.append(el('circle', { cx: x.toFixed(1), cy: y.toFixed(1), r: 4, class: 'radar-dot' }));
    const [lx, ly] = pt(i, 124), anchor = Math.abs(lx - c) < 8 ? 'middle' : lx > c ? 'start' : 'end';
    svg.append(el('text', { x: lx.toFixed(1), y: (ly + (ly < c ? -4 : 10)).toFixed(1), 'text-anchor': anchor, class: 'radar-label' }, a.label));
    svg.append(el('text', { x: lx.toFixed(1), y: (ly + (ly < c ? 10 : 24)).toFixed(1), 'text-anchor': anchor, class: 'radar-val' }, String(a.value)));
  });
  return svg;
}
