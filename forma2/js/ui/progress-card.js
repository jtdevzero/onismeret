import { h, toast } from './dom.js';
import { btn } from './widgets.js';
import { progressSummary } from '../core/progress.js';
import { tr, dateLocale } from './i18n.js';

export function progressCard(items) {
  const s = progressSummary(items);
  const change = s.delta == null ? tr('Minden alkalom számít.') : tr('{p0}{p1} pont a két felmérés között', { p0: s.delta > 0 ? '+' : '', p1: s.delta });
  const caveat = s.delta == null ? tr('Két azonos pontozású, azonos teszteket tartalmazó felmérés után a pontszámváltozásod is itt látszik.') : tr('{p0} → {p1} pont · {p2} nap telt el a két mérés között. Saját pontszám, nem percentilis.', { p0: s.before, p1: s.after, p2: s.measuredDays });
  const metrics = [[s.workouts, tr('edzés')], [s.activeDays, tr('aktív nap')], [s.minutes, tr('perc mozgás')]];
  let busy = false;
  const save = btn(tr('Kártya mentése képként'), async () => {
    if (busy) return; busy = true; save.disabled = true;
    try {
      const canvas = document.createElement('canvas'); canvas.width = 1080; canvas.height = 1080;
      const g = canvas.getContext('2d');
      if (!g) throw new Error('canvas');
      const bg = g.createLinearGradient(0, 0, 1080, 1080); bg.addColorStop(0, '#22102e'); bg.addColorStop(1, '#7c205f');
      g.fillStyle = bg; g.fillRect(0, 0, 1080, 1080);
      g.fillStyle = '#ff8a3d'; g.beginPath(); g.arc(920, 160, 220, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#3ee6e0'; g.fillRect(80, 120, 70, 6);
      g.fillStyle = '#ffffff'; g.font = 'italic 900 94px sans-serif'; g.fillText('FORMA', 80, 260);
      g.font = '600 28px sans-serif'; g.fillText('AZ ELMÚLT 6 HETED', 80, 330);
      g.font = '700 38px sans-serif'; g.fillText(change, 80, 420, 920);
      metrics.forEach(([value, label], i) => {
        const x = 80 + i * 310;
        g.fillStyle = '#ffffff'; g.font = '800 100px sans-serif'; g.fillText(String(value), x, 610, 280);
        g.fillStyle = '#ffd5e6'; g.font = '500 29px sans-serif'; g.fillText(label, x, 665);
      });
      g.fillStyle = '#ffffff'; g.font = '500 27px sans-serif';
      const lines = s.delta == null ? [tr('A fejlődésed a saját történeted.'), tr('Összevethető felmérések után pontszámváltozással.')] : [tr('{p0} → {p1} pont · {p2} nap a két mérés között.', { p0: s.before, p1: s.after, p2: s.measuredDays }), tr('Saját pontszám, nem korosztályos percentilis.')];
      lines.forEach((line, i) => g.fillText(line, 80, 810 + i * 44, 920));
      const date = t => new Date(t).toLocaleDateString(dateLocale());
      g.fillStyle = '#ffd5e6'; g.font = '500 24px sans-serif'; g.fillText(`${date(s.from)} – ${date(s.to)}`, 80, 980);
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('blob');
      const url = URL.createObjectURL(blob), a = h('a', { href: url, download: 'forma-6-hetem.png' });
      document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 60000);
      toast('Elkészült a fejlődéskártyád.');
    } catch { toast('A képet most nem sikerült elkészíteni. Próbáld újra.'); }
    finally { busy = false; save.disabled = false; }
  }, 'primary');
  return h('section', { class: 'card progress-poster' },
    h('p', { class: 'eyebrow' }, tr('A saját történeted')), h('h2', null, tr('Az elmúlt 6 heted')),
    h('p', { class: 'progress-change' }, change),
    h('div', { class: 'poster-metrics' }, metrics.map(([value, label]) => h('div', null, h('strong', null, String(value)), h('span', null, label)))),
    h('p', { class: 'small' }, caveat),
    h('p', { class: 'small' }, tr('A kép ezeket az összesített adatokat tartalmazza. Te döntöd el, kivel osztod meg.')),
    h('div', { class: 'row' }, save));
}
