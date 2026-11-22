/* Nyers, dátumhoz kötött értékek. Eltérő vagy ismeretlen protokollt nem kötünk össze. */
import { h, clear, fmtDate } from './dom.js';
import { card, link, fmtNum } from './widgets.js';
import { D } from './data.js';
export function measurementTrend(items) {
  const area = h('select', { 'aria-label': 'Mérési terület' }, D.tests.areas.map(a => h('option', { value: a.id }, a.name)));
  const test = h('select', { 'aria-label': 'Mért teszt' }), content = h('div', { 'aria-live': 'polite' });
  const svgEl = (tag, attrs) => { const el = document.createElementNS('http://www.w3.org/2000/svg', tag); for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v); return el; };
  function draw() {
    const t = D.test[test.value]; clear(content);
    if (!t) { content.append(h('p', null, 'Ehhez a területhez nincs számos teszt.')); return; }
    const points = items.filter(i => ['assessment', 'mini'].includes(i.kind) && Number.isFinite(i.results?.[t.id])).sort((a, b) => a.date - b.date).map(i => ({ date: i.date, value: i.results[t.id], protocol: i.scoring?.testsVersion || null }));
    if (!points.length) { content.append(h('p', null, 'Még nincs mérésed ehhez a teszthez.'), link('#/assess', 'Felmérés megnyitása', 'btn small')); return; }
    const lo = Math.min(...points.map(p => p.value)), hi = Math.max(...points.map(p => p.value));
    const first = points[0].date, span = Math.max(1, points.at(-1).date - first);
    const x = p => 24 + (p.date - first) / span * 552, y = p => 140 - (p.value - lo) / Math.max(1, hi - lo) * 112;
    const svg = svgEl('svg', { viewBox: '0 0 600 175', class: 'measurement-chart', role: 'img', 'aria-label': t.name + ': ' + points.map(p => fmtDate(p.date) + ', ' + fmtNum(p.value) + ' ' + (t.input.unit || '')).join('; ') });
    svg.append(svgEl('path', { d: 'M24 18V148H578', class: 'trend-axis' }));
    points.forEach((p, i) => {
      const prev = points[i - 1];
      if (prev && p.protocol && prev.protocol === p.protocol) svg.append(svgEl('path', { d: `M${x(prev)} ${y(prev)}L${x(p)} ${y(p)}`, class: 'trend-line' }));
      const dot = svgEl('circle', { cx: x(p), cy: y(p), r: 4, class: 'trend-dot' });
      const title = svgEl('title', {}); title.textContent = `${fmtDate(p.date)}: ${p.value} ${t.input.unit || ''}`; dot.append(title); svg.append(dot);
    });
    content.append(h('p', { class: 'small muted' }, `${t.input.unit || 'érték'} · ${points.length} mérés. ${points.length < 2 ? 'A következő mérés után látszik a változás.' : 'Csak azonos, ismert tesztverziójú pontokat kötünk össze.'}`), svg,
      h('div', { class: 'trend-dates small muted' }, h('span', null, fmtDate(first)), h('span', null, fmtDate(points.at(-1).date))),
      h('details', null, h('summary', null, 'Mérési értékek és verziók'), h('ul', { class: 'rows' }, points.map(p => h('li', null, `${fmtDate(p.date)} · ${fmtNum(p.value)} ${t.input.unit || ''} · ${p.protocol || 'ismeretlen / mini protokoll'}`)))));
  }
  function selectArea() {
    clear(test).append(...D.tests.tests.filter(t => t.area === area.value && t.input.type === 'number').map(t => h('option', { value: t.id }, t.name))); draw();
  }
  area.onchange = selectArea; test.onchange = draw; selectArea();
  return card(h('h2', null, 'Méréseid időben'), h('p', { class: 'small muted' }, 'Saját nyers eredmények, az adott teszt egységében. Azonos körülmények között mérve érdemes összevetni őket.'), h('label', { class: 'field' }, 'Terület', area), h('label', { class: 'field' }, 'Teszt', test), content);
}
