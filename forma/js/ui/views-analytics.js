/* Fejlődés oldal: edzésterhelés és gyakorlattrend táblázatosan (a számok a core/load.js és core/analytics.js modulból).
   Minden oszlopnak saját egysége van; a hiányzó adat „–”, nem nulla. */
import { h, clear, fmtDate } from './dom.js';
import { card, note } from './widgets.js';
import { D, weeklyGoal } from './data.js';
import { aggregateWeeklyLoad } from '../core/load.js';
import { buildExerciseProgress, loggedExercises, buildConsistencyStats, buildRecoveryTimeline } from '../core/analytics.js';

const dash = v => (v == null ? '–' : String(v));
const fmtWeek = ts => { const d = new Date(ts); return `${d.getMonth() + 1}. ${d.getDate()}.`; };
const kg = v => (v == null ? '–' : Math.round(v).toLocaleString('hu-HU'));

/* egyszerű oszlopdiagram SVG-ben; a pontos számok a mellette lévő táblázatban vannak (szöveges alternatíva) */
const SVGNS = 'http://www.w3.org/2000/svg';
function bars(values, labels, label) {
  const W = 320, H = 120, n = values.length, max = Math.max(1, ...values.map(v => v || 0)), bw = W / n;
  const el = (t, a, txt) => { const e = document.createElementNS(SVGNS, t); for (const [k, v] of Object.entries(a)) e.setAttribute(k, String(v)); if (txt != null) e.textContent = txt; return e; };
  const svg = el('svg', { viewBox: `0 0 ${W} ${H + 18}`, class: 'mini-bars', role: 'img', 'aria-label': label + ': ' + values.map((v, i) => `${labels[i]} ${v ?? 'nincs adat'}`).join(', ') });
  values.forEach((v, i) => {
    const hgt = v ? Math.max(3, Math.round((H - 14) * v / max)) : 0;
    if (v) svg.append(el('rect', { x: (i * bw + bw * 0.18).toFixed(1), y: H - hgt, width: (bw * 0.64).toFixed(1), height: hgt, rx: 4, class: i === n - 1 ? 'bar now' : 'bar' }));
    else svg.append(el('rect', { x: (i * bw + bw * 0.18).toFixed(1), y: H - 2, width: (bw * 0.64).toFixed(1), height: 2, class: 'bar empty' }));
    svg.append(el('text', { x: (i * bw + bw / 2).toFixed(1), y: H + 14, 'text-anchor': 'middle', class: 'bar-label' }, labels[i]));
    if (v) svg.append(el('text', { x: (i * bw + bw / 2).toFixed(1), y: H - hgt - 4, 'text-anchor': 'middle', class: 'bar-val' }, String(v)));
  });
  return svg;
}

function table(caption, head, rows) {
  return h('div', { class: 'table-wrap', tabIndex: 0, role: 'region', 'aria-label': caption },
    h('table', { class: 'data-table' }, h('caption', { class: 'visually-hidden' }, caption),
      h('thead', null, h('tr', null, head.map(([t, abbr]) => h('th', { scope: 'col', title: abbr || null }, t)))),
      h('tbody', null, rows.map(r => h('tr', null, r.map((c, i) => (i === 0 ? h('th', { scope: 'row' }, c) : h('td', null, c))))))));
}

export function trainingLoadCard(items, now = Date.now()) {
  const wk = aggregateWeeklyLoad(items, { weeks: 8, now });
  if (!wk.some(w => w.workouts || w.cardioMinutes)) return card(h('h2', null, 'Edzésterhelés'), h('p', { class: 'small muted' }, 'Még nincs edzésed vagy kardiód az elmúlt 8 hétben. Az első edzés után itt hetente látod a sorozatokat, az ismétléseket és az időt.'));
  const cs = buildConsistencyStats(items, { weeks: 8, now, goal: weeklyGoal() });
  const anyLog = wk.some(w => w.logged), anyKg = wk.some(w => w.externalKgReps != null), anyRpe = wk.some(w => w.sessionLoad != null);
  const head = [['Hét'], ['Edzés'], ['Perc'], ['Sorozat'], ['Ismétlés'], ['Tartás (mp)'], ...(anyKg ? [['kg × ism.', 'ismert külső súly × ismétlés']] : []), ...(anyRpe ? [['RPE × perc', 'érzett nehézség × edzésidő']] : []), ['Kardió (perc)']];
  const rows = wk.map(w => [fmtWeek(w.start), String(w.workouts), String(w.minutes), w.workouts ? String(w.sets) : '–', w.workouts ? String(w.reps) : '–', w.workouts ? String(w.seconds) : '–', ...(anyKg ? [kg(w.externalKgReps)] : []), ...(anyRpe ? [dash(w.sessionLoad)] : []), String(w.cardioMinutes)]);
  return card(h('h2', null, 'Edzésterhelés (8 hét)'),
    bars(wk.map(w => w.workouts ? w.sets : null), wk.map(w => fmtWeek(w.start)), 'Sorozatok hetente'),
    h('p', { class: 'small muted center' }, 'Teljesített sorozatok hetente; a legutóbbi hét kiemelve.'),
    h('p', { class: 'small muted' }, `Hétfőtől vasárnapig. Az elmúlt ${cs.completeWeeks} lezárt hétből ${cs.activeWeeks} héten edzettél, ${cs.weeksMeetingGoal} héten legalább ${cs.goal}-ször.`),
    table('Heti edzésterhelés', head, rows),
    h('p', { class: 'small muted' }, (anyLog ? 'A sorozatnaplóval rögzített edzéseknél a tényleges számok; a többinél a tervezett mennyiség. ' : 'A számok a tervezett mennyiségből jönnek; az edzés végén a sorozatnaplóban rögzítheted a ténylegeset. ') +
      'A testsúlyos ismétlést nem számoljuk át kilogrammra, és a különböző egységeket nem adjuk össze.'));
}

export function exerciseTrendCard(items) {
  const list = loggedExercises(items).filter(x => D.ex[x.id] && !['warmup', 'mobility', 'recovery'].includes(D.ex[x.id].type));
  if (!list.length) return null;
  const out = h('div', { 'aria-live': 'polite' });
  const sel = h('select', { id: 'trend-ex', onchange: () => draw(sel.value) }, list.map(x => h('option', { value: x.id }, `${D.ex[x.id].name} (${x.count})`)));
  function draw(id) {
    const p = buildExerciseProgress(items, id).slice(-8).reverse();
    const perSide = D.ex[id] && D.ex[id].perSide;
    clear(out).append(p.length ? table('Gyakorlat trendje: ' + D.ex[id].name, [['Dátum'], ['Sorozat'], ['Legjobb sorozat'], ['Összesen'], ['Max súly (kg)'], ['Forrás']],
      p.map(r => [fmtDate(r.date), String(r.sets), r.bestReps != null ? r.bestReps + ' ism.' : r.bestSeconds != null ? r.bestSeconds + ' mp' : '–',
        r.totalReps != null ? r.totalReps + ' ism.' : r.totalSeconds != null ? r.totalSeconds + ' mp' : '–', dash(r.maxKg), r.source === 'log' ? 'napló' : 'terv'])) : note('Ehhez a gyakorlathoz nincs teljesített sorozat.', 'small'),
      perSide ? h('p', { class: 'small muted' }, 'Oldalankénti gyakorlat: az ismétlésszám a két oldal együtt.') : null);
  }
  draw(list[0].id);
  return card(h('h2', null, 'Gyakorlat trendje'), h('label', { class: 'field' }, 'Gyakorlat', sel), out,
    h('p', { class: 'small muted' }, 'Csak ugyanannak a gyakorlatnak az alkalmait vetjük össze; egy könnyebb vagy nehezebb változat külön szerepel.'));
}

const LVL = { go: 'teljes', light: 'könnyített', rest: 'pihenő' };
const S3 = ['', 'rossz', 'közepes', 'jó'], SORE = ['', 'erős', 'enyhe', 'nincs'];
export function recoveryTimelineCard(items, now = Date.now()) {
  const t = buildRecoveryTimeline(items, { days: 14, now });
  if (!t.length) return card(h('h2', null, 'Regeneráció'), h('p', { class: 'small muted' }, 'Az edzés előtti „Hogy vagy ma?” válaszaid itt naponta megjelennek, az aznapi edzéssel együtt.'));
  return card(h('h2', null, 'Regeneráció (14 nap)'),
    table('Napi állapot és edzés', [['Nap'], ['Alvás'], ['Izomláz'], ['Energia'], ['Fájdalom'], ['Javaslat'], ['Edzés']],
      t.map(r => [fmtDate(r.date), S3[r.sleep] || '–', SORE[r.soreness] || '–', S3[r.energy] || '–', r.pain ? 'igen' : 'nem', LVL[r.level] || '–', r.workouts ? (r.light ? 'könnyített' : String(r.workouts)) : '–'])),
    h('p', { class: 'small muted' }, 'Önbevallás, nem orvosi értékelés. Az, hogy két dolog együtt jár (például rossz alvás és könnyebb edzés), nem jelenti, hogy egyik okozza a másikat. Ahol nincs sor, ott nem töltötted ki a kérdőívet.'));
}
