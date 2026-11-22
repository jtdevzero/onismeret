/* Fejlődés oldal: edzésterhelés és gyakorlattrend táblázatosan (a számok a core/load.js és core/analytics.js modulból).
   Minden oszlopnak saját egysége van; a hiányzó adat „–”, nem nulla. */
import { h, clear, fmtDate, toast } from './dom.js';
import { card, note } from './widgets.js';
import { D, weeklyGoal } from './data.js';
import { aggregateWeeklyLoad } from '../core/load.js';
import { buildExerciseProgress, loggedExercises, buildConsistencyStats, buildRecoveryTimeline, periodSummary, periodSummaryCsv, exerciseProgressCsv } from '../core/analytics.js';
import { tr, dateLocale } from './i18n.js';

const dash = v => (v == null ? '–' : String(v));
const fmtWeek = ts => { const d = new Date(ts); return `${d.getMonth() + 1}. ${d.getDate()}.`; };
const kg = v => (v == null ? '–' : Math.round(v).toLocaleString(dateLocale()));

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

function csvDownload(csv, name) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob), a = document.createElement('a');
  try { a.href = url; a.download = name; document.body.append(a); a.click(); }
  finally { a.remove(); setTimeout(() => URL.revokeObjectURL(url), 2000); }
  toast(tr('Letöltés indítva. Ellenőrizd a fájlt a Letöltések mappában.'));
}

export function periodAnalyticsCard(items, now = Date.now()) {
  const out = h('div', { 'aria-live': 'polite' });
  const choice = h('select', { 'aria-label': tr('Elemzési időszak'), onchange: render },
    [7, 30, 90].map(n => h('option', { value: String(n) }, tr('{p0} nap', { p0: n }))));
  choice.value = '30';
  function render() {
    const summary = periodSummary(items, { days: Number(choice.value), now });
    const rows = [
      [tr('Edzések'), summary.workouts, tr('alkalom')], [tr('Edzésidő'), summary.workoutMinutes, tr('perc')],
      [tr('Sorozatok'), summary.sets, tr('db')], [tr('Ismétlések'), summary.reps, tr('db')],
      [tr('Tartások'), summary.seconds, tr('mp')], [tr('Külső súlyos volumen'), summary.externalKgReps, tr('kg × ism.')],
      [tr('Érzett terhelés'), summary.sessionLoad, tr('RPE × perc')], [tr('Kardió'), summary.cardioMinutes, tr('perc')],
      [tr('Testsúly – utolsó'), summary.weight?.last, 'kg'], [tr('Derékbőség – utolsó'), summary.waist?.last, 'cm'],
      [tr('Testsúly változása'), summary.weight?.change, 'kg'],
      [tr('Derékbőség változása'), summary.waist?.change, 'cm'],
      [tr('Regenerációs bejegyzések'), summary.recoveryDays, tr('bejegyzés')],
      [tr('Tényleges sorozatnaplóval'), summary.loggedWorkouts, tr('edzés')],
      [tr('Könnyített edzések'), summary.lightWorkouts, tr('alkalom')],
      [tr('Félbehagyott vagy rövidített edzések'), summary.partialWorkouts, tr('alkalom')],
      [tr('Fájdalomjelzések'), summary.painReports, tr('önbevallás')],
      [tr('Fájdalomkérdés kitöltve'), summary.knownPainResponses, tr('válasz')]
    ];
    const download = h('button', { type: 'button', class: 'btn small', onclick: () => {
      csvDownload(periodSummaryCsv(summary), `forma2-analitika-${summary.days}-nap.csv`);
    } }, tr('CSV letöltése'));
    clear(out).append(table(tr('{p0} napos mozgásösszesítő', { p0: summary.days }), [[tr('Mutató')], [tr('Érték')], [tr('Egység')]],
      rows.map(([name, value, unit]) => [name, dash(value), unit])),
      h('p', { class: 'small muted' }, tr('A napló alapján készült összesítés. A hiányzó adat „–”, nem nulla. A változás az időszak első és utolsó rögzített mérésének különbsége; nem napi átlag. A tervezett és tényleges sorozatnaplós számok forrása eltérhet, eltérő mérési protokollokat nem hasonlítunk össze.')), download);
  }
  render();
  return card(h('h2', null, tr('Analytics Pro – időszaki összesítő')), h('label', { class: 'field' }, tr('Időszak'), choice), out);
}

export function trainingLoadCard(items, now = Date.now()) {
  const wk = aggregateWeeklyLoad(items, { weeks: 8, now });
  if (!wk.some(w => w.workouts || w.cardioMinutes)) return card(h('h2', null, tr('Edzésterhelés')), h('p', { class: 'small muted' }, tr('Még nincs edzésed vagy kardiód az elmúlt 8 hétben. Az első edzés után itt hetente látod a sorozatokat, az ismétléseket és az időt.')));
  const cs = buildConsistencyStats(items, { weeks: 8, now, goal: weeklyGoal() });
  const anyLog = wk.some(w => w.logged), anyKg = wk.some(w => w.externalKgReps != null), anyRpe = wk.some(w => w.sessionLoad != null);
  const head = [[tr('Hét')], [tr('Edzés')], [tr('Perc')], [tr('Sorozat')], [tr('Ismétlés')], [tr('Tartás (mp)')], ...(anyKg ? [[tr('kg × ism.'), tr('ismert külső súly × ismétlés')]] : []), ...(anyRpe ? [[tr('RPE × perc'), tr('érzett nehézség × edzésidő')]] : []), [tr('Kardió (perc)')]];
  const rows = wk.map(w => [fmtWeek(w.start), String(w.workouts), String(w.minutes), w.workouts ? String(w.sets) : '–', w.workouts ? String(w.reps) : '–', w.workouts ? String(w.seconds) : '–', ...(anyKg ? [kg(w.externalKgReps)] : []), ...(anyRpe ? [dash(w.sessionLoad)] : []), String(w.cardioMinutes)]);
  return card(h('h2', null, tr('Edzésterhelés (8 hét)')),
    bars(wk.map(w => w.workouts ? w.sets : null), wk.map(w => fmtWeek(w.start)), tr('Sorozatok hetente')),
    h('p', { class: 'small muted center' }, tr('Teljesített sorozatok hetente; a legutóbbi hét kiemelve.')),
    h('p', { class: 'small muted' }, tr('Hétfőtől vasárnapig. Az elmúlt {p0} lezárt hétből {p1} héten edzettél, {p2} héten legalább {p3}-ször.', { p0: cs.completeWeeks, p1: cs.activeWeeks, p2: cs.weeksMeetingGoal, p3: cs.goal })),
    table(tr('Heti edzésterhelés'), head, rows),
    h('p', { class: 'small muted' }, (anyLog ? tr('A sorozatnaplóval rögzített edzéseknél a tényleges számok; a többinél a tervezett mennyiség. ') : tr('A számok a tervezett mennyiségből jönnek; az edzés végén a sorozatnaplóban rögzítheted a ténylegeset. ')) +
      tr('A testsúlyos ismétlést nem számoljuk át kilogrammra, és a különböző egységeket nem adjuk össze.')));
}

export function exerciseTrendCard(items) {
  const list = loggedExercises(items).filter(x => D.ex[x.id] && !['warmup', 'mobility', 'recovery'].includes(D.ex[x.id].type));
  if (!list.length) return null;
  const out = h('div', { 'aria-live': 'polite' });
  const sel = h('select', { id: 'trend-ex', onchange: () => draw(sel.value) }, list.map(x => h('option', { value: x.id }, `${D.ex[x.id].name} (${x.count})`)));
  function draw(id) {
    const p = buildExerciseProgress(items, id).slice(-8).reverse();
    const perSide = D.ex[id] && D.ex[id].perSide;
    clear(out).append(p.length ? table(tr('Gyakorlat trendje: ') + D.ex[id].name, [[tr('Dátum')], [tr('Sorozat')], [tr('Legjobb sorozat')], [tr('Összesen')], [tr('Max súly (kg)')], [tr('Forrás')]],
      p.map(r => [fmtDate(r.date), String(r.sets), r.bestReps != null ? r.bestReps + tr(' ism.') : r.bestSeconds != null ? r.bestSeconds + tr(' mp') : '–',
        r.totalReps != null ? r.totalReps + tr(' ism.') : r.totalSeconds != null ? r.totalSeconds + tr(' mp') : '–', dash(r.maxKg), r.source === 'log' ? tr('napló') : 'terv'])) : note(tr('Ehhez a gyakorlathoz nincs teljesített sorozat.'), 'small'),
      perSide ? h('p', { class: 'small muted' }, tr('Oldalankénti gyakorlat: az ismétlésszám a két oldal együtt.')) : null);
  }
  draw(list[0].id);
  return card(h('h2', null, tr('Gyakorlat trendje')), h('label', { class: 'field' }, tr('Gyakorlat'), sel), out,
    h('button', { type: 'button', class: 'btn small', onclick: () => {
      const id = sel.value, records = buildExerciseProgress(items, id);
      csvDownload(exerciseProgressCsv(records, D.ex[id].name), 'forma2-gyakorlat-' + id.replace(/[^a-z0-9_-]/gi, '') + '.csv');
    } }, tr('Gyakorlat CSV-export')),
    h('p', { class: 'small muted' }, tr('Csak ugyanannak a gyakorlatnak az alkalmait vetjük össze; egy könnyebb vagy nehezebb változat külön szerepel.')));
}

const LVL = { go: 'teljes', light: tr('könnyített'), rest: tr('pihenő') };
const S3 = ['', 'rossz', tr('közepes'), tr('jó')], SORE = ['', tr('erős'), 'enyhe', 'nincs'];
export function recoveryTimelineCard(items, now = Date.now()) {
  const t = buildRecoveryTimeline(items, { days: 14, now });
  if (!t.length) return card(h('h2', null, tr('Regeneráció')), h('p', { class: 'small muted' }, tr('Az edzés előtti „Hogy vagy ma?” válaszaid itt naponta megjelennek, az aznapi edzéssel együtt.')));
  return card(h('h2', null, tr('Regeneráció (14 nap)')),
    table(tr('Napi állapot és edzés'), [[tr('Nap')], [tr('Alvás')], [tr('Izomláz')], [tr('Energia')], [tr('Fájdalom')], [tr('Javaslat')], [tr('Edzés')]],
      t.map(r => [fmtDate(r.date), S3[r.sleep] || '–', SORE[r.soreness] || '–', S3[r.energy] || '–', r.pain == null ? '–' : r.pain ? tr('igen') : tr('nem'), LVL[r.level] || '–', r.workouts ? (r.light ? tr('könnyített') : String(r.workouts)) : '–'])),
    h('p', { class: 'small muted' }, tr('Önbevallás, nem orvosi értékelés. Az, hogy két dolog együtt jár (például rossz alvás és könnyebb edzés), nem jelenti, hogy egyik okozza a másikat. Ahol nincs sor, ott nem töltötted ki a kérdőívet.')));
}
