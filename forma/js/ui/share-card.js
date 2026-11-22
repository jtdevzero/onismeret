/* Felméréses radar-kártya: előnézet, adatválasztó (alapból nincs személyes adat), mentés 1080 × 1350-es PNG-be.
   A kép a telefonon készül; az app nem küldi sehova. */
import { h, toast } from './dom.js';
import { btn } from './widgets.js';
import { buildAssessmentShare, SHARE_DEFAULTS } from '../core/share.js';

function draw(canvas, s) {
  const W = 1080, H = 1350, g = canvas.getContext('2d');
  canvas.width = W; canvas.height = H;
  const bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#22102e'); bg.addColorStop(0.65, '#7c205f'); bg.addColorStop(1, '#ff5a7a');
  g.fillStyle = bg; g.fillRect(0, 0, W, H);
  g.fillStyle = '#ff8a3d'; g.beginPath(); g.arc(900, 170, 170, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#3ee6e0'; g.fillRect(80, 110, 70, 6);
  g.fillStyle = '#fff'; g.font = 'italic 900 96px sans-serif'; g.fillText('FORMA', 80, 240);
  g.font = '600 34px sans-serif'; g.fillText(`${s.title.toUpperCase()} · ${s.when}`, 80, 300, 920);
  const cx = W / 2, cy = 690, R = 270, n = s.axes.length;
  const pt = (i, v) => { const a = -Math.PI / 2 + (2 * Math.PI * i) / n, r = R * Math.max(0, Math.min(100, v)) / 100; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; };
  if (n >= 3) {
    g.lineWidth = 2;
    for (const r of [25, 50, 75, 100]) {
      g.strokeStyle = r === 50 ? 'rgba(255,255,255,.55)' : 'rgba(255,255,255,.22)';
      g.beginPath(); s.axes.forEach((_, i) => { const [x, y] = pt(i, r); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.closePath(); g.stroke();
    }
    g.fillStyle = 'rgba(62,230,224,.35)'; g.strokeStyle = '#3ee6e0'; g.lineWidth = 5;
    g.beginPath(); s.axes.forEach((a, i) => { const [x, y] = pt(i, a.value); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.closePath(); g.fill(); g.stroke();
    g.textAlign = 'center'; g.fillStyle = '#fff';
    s.axes.forEach((a, i) => {
      const [x, y] = pt(i, 128);
      g.font = '600 30px sans-serif'; g.fillText(a.label, x, y);
      g.font = '800 36px sans-serif'; g.fillText(String(a.value), x, y + 40);
    });
    g.textAlign = 'left';
  }
  g.fillStyle = '#fff'; g.font = '600 34px sans-serif';
  s.lines.forEach((l, i) => g.fillText(l, 80, 1100 + i * 50, 920));
  g.fillStyle = '#ffe3ee'; g.font = '500 26px sans-serif'; g.fillText(s.footer, 80, 1290, 920);
}

/* item, ev: a megjelenített felmérés és kiértékelése · areas: D.tests.areas */
export function assessmentShareCard(item, ev, areas) {
  const opts = { ...SHARE_DEFAULTS };
  const canvas = h('canvas', { class: 'share-preview', role: 'img' });
  const summary = h('p', { class: 'small muted', 'aria-live': 'polite' });
  const refresh = () => {
    const s = buildAssessmentShare(item, ev, areas, opts);
    try { draw(canvas, s); } catch { /* vászon nélkül is menjen a szöveg */ }
    const text = `A képen: ${s.when}; ${s.axes.map(a => `${a.label} ${a.value}`).join(', ')}` + (s.lines.length ? '; ' + s.lines.join('; ') : '') + '.';
    canvas.setAttribute('aria-label', 'A megosztókártya előnézete. ' + text);
    summary.textContent = text;
  };
  const toggle = (key, label) => h('label', { class: 'check small' }, h('input', { type: 'checkbox', checked: opts[key], onchange: e => { opts[key] = e.target.checked; refresh(); } }), h('span', null, label));
  let busy = false;
  const save = btn('Kártya mentése képként', async () => {
    if (busy) return; busy = true; save.disabled = true;
    try {
      refresh();
      const blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
      if (!blob) throw new Error('blob');
      const url = URL.createObjectURL(blob), a = h('a', { href: url, download: 'forma-felmeres.png' });
      document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 60000);
      toast('Elkészült a felméréskártyád.');
    } catch { toast('A képet most nem sikerült elkészíteni. Próbáld újra.'); }
    finally { busy = false; save.disabled = false; }
  });
  refresh();
  return h('details', { class: 'card section share-card' }, h('summary', null, h('h2', null, 'Megosztható kártya')),
    h('p', { class: 'small muted' }, 'Név és személyes adat alapból nincs rajta. Válaszd ki, mi kerüljön még rá. A kép a telefonodon készül, az app nem küldi sehova.'),
    h('fieldset', { class: 'share-opts' }, h('legend', { class: 'small' }, 'A képen legyen'),
      toggle('age', 'Életkor és nem'), toggle('fitnessAge', 'Fittségi kor'), toggle('exactDate', 'Pontos nap (különben csak a hónap)')),
    canvas, summary, h('div', { class: 'row' }, save));
}
