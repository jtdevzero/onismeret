/* Fejlődés: rekordok, jelvények, célok, testméretek, és a félidős mini-teszt. */
import { trainingLoadCard, exerciseTrendCard, recoveryTimelineCard } from './views-analytics.js';
import { coachCard } from './views-coach.js';
import { h, clear, fmtDate, uid, toast } from './dom.js';
import { page, card, btn, link, fmtNum, emptyState, artBanner } from './widgets.js';
import { D, profile } from './data.js';
import { itemPut, itemsAll, itemDelete } from './store.js';
import { timerWidget } from './views-assess.js';
import { scoreTest } from '../core/score.js';
import { forecastFitnessAge } from '../core/extras.js';
import { friendCard, recoveryCard } from './views-extra.js';
import { nutritionCard } from './views-wellness.js';
import { evaluateItem, getProgram } from './state.js';
import { sameScoring } from '../core/assessment.js';
import { progressCard } from './progress-card.js';
import { MINI_TESTS, records, badges, bodyTrend, currentFitnessAge, goalProgress, metricValue, latestValue, LOWER_BETTER } from '../core/achievements.js';

const reload = hash => { location.hash = hash; dispatchEvent(new HashChangeEvent('hashchange')); };
const numericTests = () => D.tests.tests.filter(t => t.kind === 'norm' && t.input.type === 'number');
export const GOAL_METRICS = () => [
  ...numericTests().map(t => [t.id, t.name, t.input.unit]),
  ['fitness_age', 'Fittségi kor', 'év'], ['waist', 'Derékbőség', 'cm'], ['weight', 'Testsúly', 'kg'],
];
const metricName = id => (GOAL_METRICS().find(m => m[0] === id) || [id, id, ''])[1];
const metricUnit = id => (GOAL_METRICS().find(m => m[0] === id) || [id, id, ''])[2];

export async function progressView(arg, onCleanup) {
  const items = await itemsAll(), p = profile();
  const recs = records(items, numericTests().map(t => t.id));
  const fa = currentFitnessAge(items, p, D.norms);
  const goals = items.filter(i => i.kind === 'goal').sort((a, b) => a.date - b.date);
  const gp = goals.map(g => ({ g, s: goalProgress(g, items, p, D.norms) }));
  const bs = badges(items, { records: recs, fitnessAge: fa && fa.age, age: p.age, goalDone: gp.some(x => x.s.done) });
  const body = bodyTrend(items);

  /* testméret-bejegyzés */
  const bw = h('input', { type: 'number', inputMode: 'decimal', min: 50, max: 180, step: 0.5, id: 'bwaist' });
  const bkg = h('input', { type: 'number', inputMode: 'decimal', min: 30, max: 250, step: 0.1, id: 'bweight' });
  /* új cél */
  const gs = { metric: 'pushup' };
  const gTarget = h('input', { type: 'number', inputMode: 'decimal', id: 'gtarget' });
  const gDate = h('input', { type: 'date', id: 'gdate' });
  const sel = h('select', { id: 'gmetric', onchange: () => { gs.metric = sel.value; hint.textContent = curText(); } }, GOAL_METRICS().map(([v, n]) => h('option', { value: v }, n)));
  const curText = () => { const v = metricValue(items, gs.metric, p, D.norms); return v == null ? 'Még nincs mért értéked ehhez.' : `Most: ${fmtNum(v)} ${metricUnit(gs.metric)}`; };
  /* a választó és a mentett érték mindig egyezzen */
  sel.value = gs.metric;
  const hint = h('span', { class: 'hint' }, curText());

  /* fittségi kor előrejelzés a felmérésekből */
  const history = items.filter(i => i.kind === 'assessment').sort((a, b) => b.date - a.date);
  const faPoints = history.filter(a => sameScoring(a, history[0])).map(a => ({ date: a.date, age: evaluateItem(a).fitnessAge })).filter(x => x.age != null);
  const fc = forecastFitnessAge(faPoints);
  const coachProg = await getProgram();
  return page('Fejlődés',
    artBanner('progress', 'A saját történeted', 'Lépésről lépésre feljebb'),
    progressCard(items),
    coachProg ? coachCard(coachProg, items) : null,
    trainingLoadCard(items),
    exerciseTrendCard(items),
    recoveryTimelineCard(items),
    card(h('h2', null, 'Fittségi kor most'),
      h('p', { class: 'small muted' }, 'Tájékoztató VO₂max-becslés az alapadatokból, jelentős egyéni bizonytalansággal. Nem a biológiai kor vagy a teljes mozgásfelmérés mérése. Az előrejelzés csak azonos pontozási verziójú felméréseket használ.'),
      h('div', { class: 'stat-row' },
        h('div', { class: 'stat' }, h('span', { class: 'muted' }, 'Becsült fittségi kor'), h('strong', null, fa ? fa.age + ' év' : '–'), h('span', { class: 'small muted' }, 'naptári: ' + p.age + ' év')),
        h('div', { class: 'stat' }, h('span', { class: 'muted' }, 'Derékbőség'), h('strong', null, body.waist ? fmtNum(body.waist.value) + ' cm' : '–'),
          h('span', { class: 'small muted' }, body.waist && body.waist.change != null ? `${body.waist.change > 0 ? '+' : ''}${fmtNum(body.waist.change)} cm az első mérés óta` : 'heti méréssel követhető'))),
      fc ? h('p', { class: 'forecast' }, `Ha így folytatod, 3 hónap múlva a fittségi korod kb. ${fc.in90} év lehet`, h('span', { class: 'small muted' }, ` (havi ${fc.perMonth > 0 ? '+' : ''}${String(fc.perMonth).replace('.', ',')} év a felméréseid alapján)`)) : h('p', { class: 'small muted' }, 'Két felmérés után (legalább 3 hét különbséggel) előrejelzést is mutatok.'),
      fa && fa.waistUpdated ? h('p', { class: 'small muted' }, 'A fittségi kort az aktuális normákkal és a legfrissebb derékbőséggel számoltam újra; a pulzus és a mozgás a legutóbbi felmérésből van. A felméréskor mentett eredmény ettől nem változik.') : null),
    card(h('h2', null, 'Célok'),
      gp.length ? h('ul', { class: 'rows' }, gp.map(({ g, s }) => h('li', null,
        h('span', { class: 'log-item' }, h('strong', null, `${metricName(g.metric)}: ${fmtNum(g.target)} ${metricUnit(g.metric)}`),
          h('progress', { max: 100, value: s.pct, 'aria-label': `${metricName(g.metric)} cél: ${s.pct}%` }),
          h('span', { class: 'muted small' }, (s.current != null ? `most ${fmtNum(s.current)}, indulás ${fmtNum(g.start)}` : 'még nincs mérés') + (s.done ? ' · teljesítve!' : s.daysLeft != null ? (s.daysLeft >= 0 ? ` · még ${s.daysLeft} nap` : ' · lejárt') : ''))),
        btn('Törlés', async () => { if (confirm('Törlöd ezt a célt?')) { await itemDelete(g.id); reload('#/progress'); } }, 'small')))) : emptyState('Még nincs célod. Egy konkrét, határidős cél (például „30 fekvőtámasz júniusra”) sokat segít.'),
      h('h3', null, 'Új cél'),
      h('label', { class: 'field' }, 'Mit', sel, hint),
      h('label', { class: 'field' }, 'Célérték', gTarget),
      h('label', { class: 'field' }, 'Határidő (nem kötelező)', gDate),
      h('div', { class: 'row' }, btn('Cél mentése', async () => {
        const target = Number(gTarget.value), start = metricValue(items, gs.metric, p, D.norms);
        if (!gTarget.value || !Number.isFinite(target)) { toast('Adj meg egy célértéket.'); return; }
        if (start == null) { toast('Ehhez még nincs mért értéked: előbb mérd meg (felmérés, mini-teszt vagy testméret).'); return; }
        if (target === start) { toast('A célérték legyen más, mint a mostani.'); return; }
        const deadline = gDate.value ? new Date(gDate.value + 'T23:59:00').getTime() : null;
        await itemPut({ id: uid(), kind: 'goal', date: Date.now(), metric: gs.metric, start, target, deadline });
        toast('Elmentettem a célt.'); reload('#/progress');
      }, 'primary'))),
    card(h('h2', null, 'Jelvények'), h('p', { class: 'small muted' }, `${bs.filter(b => b.earned).length} / ${bs.length} megszerezve. Csak a saját eredményeidhez mérve.`),
      h('ul', { class: 'badges' }, bs.map(b => h('li', { class: 'badge-item' + (b.earned ? ' earned' : '') },
        h('span', { class: 'badge-ic', 'aria-hidden': 'true' }, b.earned ? '★' : '☆'),
        h('span', null, h('strong', null, b.name), h('span', { class: 'small muted' }, ' · ' + b.about + (b.earned && b.date ? ` (${fmtDate(b.date)})` : ''))))))),
    card(h('h2', null, 'Egyéni rekordok'),
      recs.length ? h('ul', { class: 'rows' }, recs.map(r => { const t = D.test[r.id]; return h('li', null,
        h('span', { class: 'log-item' }, h('strong', null, t.name), h('span', { class: 'muted small' }, `${fmtDate(r.date)} · ${r.count} mérés`)),
        h('span', { class: 'badge ' + (r.improved ? 'good' : '') }, `${fmtNum(r.best)} ${t.input.unit}`)); })) : h('p', { class: 'muted' }, 'Az első felmérés után itt látszanak.')),
    card(h('h2', null, 'Testméretek'), h('p', { class: 'small muted' }, 'Hetente egyszer, reggel, ugyanúgy mérve. A derékbőség a köldök magasságában, kilégzés végén.'),
      h('label', { class: 'field' }, 'Derékbőség (cm)', bw), h('label', { class: 'field' }, 'Testsúly (kg, nem kötelező)', bkg),
      h('div', { class: 'row' }, btn('Mentés', async () => {
        const waist = bw.value ? Number(bw.value) : null, weight = bkg.value ? Number(bkg.value) : null;
        if (waist == null && weight == null) { toast('Adj meg legalább egy értéket.'); return; }
        if (waist != null && !(waist >= 50 && waist <= 180)) { toast('A derékbőség 50 és 180 cm között lehet.'); return; }
        if (weight != null && !(weight >= 30 && weight <= 250)) { toast('A testsúly 30 és 250 kg között lehet.'); return; }
        await itemPut({ id: uid(), kind: 'body', date: Date.now(), ...(waist != null ? { waist } : {}), ...(weight != null ? { weight } : {}) });
        toast('Bekerült a naplóba.'); reload('#/progress');
      }, 'primary')),
      body.weight ? h('p', { class: 'small' }, `Testsúly: ${fmtNum(body.weight.value)} kg` + (body.weight.change != null ? ` (${body.weight.change > 0 ? '+' : ''}${fmtNum(body.weight.change)} kg az első mérés óta)` : '')) : null),
    await recoveryCard(items),
    await nutritionCard(items),
    await friendCard(items),
    h('div', { class: 'row' }, link('#/review', 'Heti áttekintés', 'btn'), link('#/mini', 'Mini-teszt (5 perc)', 'btn'), link('#/result', 'Legutóbbi felmérés', 'btn')));
}

/* Félidős mini-teszt: fekvőtámasz, plank, egylábas állás, a felmérés időzítőivel. */
export async function miniView(arg, onCleanup) {
  const items = await itemsAll(), p = profile(), vals = {};
  const rows = MINI_TESTS.map(id => {
    const t = D.test[id], prev = latestValue(items, id);
    const input = h('input', { type: 'number', inputMode: 'decimal', min: t.input.min, max: t.input.max, step: t.input.step, id: 'm-' + id, oninput: () => { vals[id] = input.value; } });
    const timer = t.timer ? timerWidget(t.timer, v => { input.value = v; vals[id] = v; }, onCleanup) : null;
    return card(h('h2', null, t.name), h('p', { class: 'small' }, t.how), timer,
      h('label', { class: 'field' }, `Eredmény (${t.input.unit})`, input),
      prev ? h('p', { class: 'small muted' }, `Legutóbb: ${fmtNum(prev.value)} ${t.input.unit} (${fmtDate(prev.date)})`) : null);
  });
  const out = h('div', { 'aria-live': 'polite' });
  return page('Mini-teszt',
    h('p', { class: 'muted' }, 'Félidős ellenőrzés a 6 hetes ciklus közepén: három teszt, kb. 5 perc. Bemelegítés után, kipihenten.'),
    rows,
    h('div', { class: 'row' }, btn('Mentés és összevetés', async () => {
      const results = {};
      for (const id of MINI_TESTS) {
        const v = vals[id] === '' || vals[id] == null ? null : Number(vals[id]), t = D.test[id];
        if (v == null) continue;
        if (!(v >= t.input.min && v <= t.input.max)) { toast(`${t.name}: az érték ${t.input.min} és ${t.input.max} között lehet.`); return; }
        results[id] = v;
      }
      if (!Object.keys(results).length) { toast('Adj meg legalább egy eredményt.'); return; }
      const before = Object.fromEntries(MINI_TESTS.map(id => [id, latestValue(items, id)]));
      await itemPut({ id: uid(), kind: 'mini', date: Date.now(), profile: { age: p.age, sex: p.sex }, results });
      clear(out).append(card(h('h2', null, 'Összevetés'), h('ul', { class: 'rows' }, Object.entries(results).map(([id, v]) => {
        const t = D.test[id], b = before[id], s = scoreTest(t, v, p, D.norms);
        const diff = b ? v - b.value : null, better = diff != null && (LOWER_BETTER.has(id) ? diff < 0 : diff > 0);
        return h('li', null, h('span', { class: 'log-item' }, h('strong', null, t.name), h('span', { class: 'muted small' }, `${fmtNum(v)} ${t.input.unit}` + (s && s.score != null ? ` · ${s.score}. percentilis` : ''))),
          diff != null ? h('span', { class: 'badge ' + (better ? 'good' : diff === 0 ? '' : 'warn') }, `${diff > 0 ? '+' : ''}${fmtNum(Math.round(diff * 10) / 10)}`) : h('span', { class: 'badge' }, 'első mérés'));
      })), h('p', { class: 'small muted' }, 'A mini-teszt nem írja át a programot; a teljes újramérés a ciklus végén jön.'), link('#/progress', 'Fejlődés', 'btn')));
      out.scrollIntoView({ behavior: 'smooth' });
    }, 'primary')),
    out);
}
