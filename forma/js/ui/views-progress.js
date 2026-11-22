/* Fejlődés: rekordok, jelvények, célok, testméretek, és a félidős mini-teszt. */
import { GOAL_METRICS } from './helpers.js';
import { trainingLoadCard, exerciseTrendCard, recoveryTimelineCard, periodAnalyticsCard } from './views-analytics.js';
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
import { tr } from './i18n.js';

const reload = hash => { location.hash = hash; dispatchEvent(new HashChangeEvent('hashchange')); };
const numericTests = () => D.tests.tests.filter(t => t.kind === 'norm' && t.input.type === 'number');
export { GOAL_METRICS };
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
  const curText = () => { const v = metricValue(items, gs.metric, p, D.norms); return v == null ? tr('Még nincs mért értéked ehhez.') : `Most: ${fmtNum(v)} ${metricUnit(gs.metric)}`; };
  /* a választó és a mentett érték mindig egyezzen */
  sel.value = gs.metric;
  const hint = h('span', { class: 'hint' }, curText());

  /* fittségi kor előrejelzés a felmérésekből */
  const history = items.filter(i => i.kind === 'assessment').sort((a, b) => b.date - a.date);
  const faPoints = history.filter(a => sameScoring(a, history[0])).map(a => ({ date: a.date, age: evaluateItem(a).fitnessAge })).filter(x => x.age != null);
  const fc = forecastFitnessAge(faPoints);
  const coachProg = await getProgram();
  return page(tr('Fejlődés'),
    artBanner('progress', tr('A saját történeted'), tr('Lépésről lépésre feljebb')),
    coachProg ? coachCard(coachProg, items) : null,
    periodAnalyticsCard(items),
    trainingLoadCard(items),
    exerciseTrendCard(items),
    recoveryTimelineCard(items),
    card(h('h2', null, tr('Fittségi kor most')),
      h('p', { class: 'small muted' }, tr('Tájékoztató VO₂max-becslés az alapadatokból, jelentős egyéni bizonytalansággal. Nem a biológiai kor vagy a teljes mozgásfelmérés mérése. Az előrejelzés csak azonos pontozási verziójú felméréseket használ.')),
      h('div', { class: 'stat-row' },
        h('div', { class: 'stat' }, h('span', { class: 'muted' }, tr('Becsült fittségi kor')), h('strong', null, fa ? fa.age + tr(' év') : '–'), h('span', { class: 'small muted' }, tr('naptári: ') + p.age + tr(' év'))),
        h('div', { class: 'stat' }, h('span', { class: 'muted' }, tr('Derékbőség')), h('strong', null, body.waist ? fmtNum(body.waist.value) + ' cm' : '–'),
          h('span', { class: 'small muted' }, body.waist && body.waist.change != null ? tr('{p0}{p1} cm az első mérés óta', { p0: body.waist.change > 0 ? '+' : '', p1: fmtNum(body.waist.change) }) : tr('heti méréssel követhető')))),
      fc ? h('p', { class: 'forecast' }, tr('Ha így folytatod, 3 hónap múlva a fittségi korod kb. {p0} év lehet', { p0: fc.in90 }), h('span', { class: 'small muted' }, tr(' (havi {p0}{p1} év a felméréseid alapján)', { p0: fc.perMonth > 0 ? '+' : '', p1: String(fc.perMonth).replace('.', ',') }))) : h('p', { class: 'small muted' }, tr('Két felmérés után (legalább 3 hét különbséggel) előrejelzést is mutatok.')),
      fa && fa.waistUpdated ? h('p', { class: 'small muted' }, tr('A fittségi kort az aktuális normákkal és a legfrissebb derékbőséggel számoltam újra; a pulzus és a mozgás a legutóbbi felmérésből van. A felméréskor mentett eredmény ettől nem változik.')) : null),
    card(h('h2', null, tr('Célok')),
      gp.length ? h('ul', { class: 'rows' }, gp.map(({ g, s }) => h('li', null,
        h('span', { class: 'log-item' }, h('strong', null, `${metricName(g.metric)}: ${fmtNum(g.target)} ${metricUnit(g.metric)}`),
          h('progress', { max: 100, value: s.pct, 'aria-label': tr('{p0} cél: {p1}%', { p0: metricName(g.metric), p1: s.pct }) }),
          h('span', { class: 'muted small' }, (s.current != null ? tr('most {p0}, indulás {p1}', { p0: fmtNum(s.current), p1: fmtNum(g.start) }) : tr('még nincs mérés')) + (s.done ? tr(' · teljesítve!') : s.daysLeft != null ? (s.daysLeft >= 0 ? tr(' · még {p0} nap', { p0: s.daysLeft }) : tr(' · lejárt')) : ''))),
        btn(tr('Törlés'), async () => { if (confirm(tr('Törlöd ezt a célt?'))) { await itemDelete(g.id); reload('#/progress'); } }, 'small')))) : emptyState(tr('Még nincs célod. Egy konkrét, határidős cél (például „30 fekvőtámasz júniusra”) sokat segít.')),
      h('h3', null, tr('Új cél')),
      h('label', { class: 'field' }, tr('Mit'), sel, hint),
      h('label', { class: 'field' }, tr('Célérték'), gTarget),
      h('label', { class: 'field' }, tr('Határidő (nem kötelező)'), gDate),
      h('div', { class: 'row' }, btn(tr('Cél mentése'), async () => {
        const target = Number(gTarget.value), start = metricValue(items, gs.metric, p, D.norms);
        if (!gTarget.value || !Number.isFinite(target)) { toast('Adj meg egy célértéket.'); return; }
        if (start == null) { toast('Ehhez még nincs mért értéked: előbb mérd meg (felmérés, mini-teszt vagy testméret).'); return; }
        if (target === start) { toast('A célérték legyen más, mint a mostani.'); return; }
        const deadline = gDate.value ? new Date(gDate.value + 'T23:59:00').getTime() : null;
        await itemPut({ id: uid(), kind: 'goal', date: Date.now(), metric: gs.metric, start, target, deadline });
        toast('Elmentettem a célt.'); reload('#/progress');
      }, 'primary'))),
    progressCard(items),
    card(h('h2', null, tr('Jelvények')), h('p', { class: 'small muted' }, tr('{p0} / {p1} megszerezve. Csak a saját eredményeidhez mérve.', { p0: bs.filter(b => b.earned).length, p1: bs.length })),
      h('ul', { class: 'badges' }, bs.map(b => h('li', { class: 'badge-item' + (b.earned ? ' earned' : '') },
        h('span', { class: 'badge-ic', 'aria-hidden': 'true' }, b.earned ? '★' : '☆'),
        h('span', null, h('strong', null, b.name), h('span', { class: 'small muted' }, ' · ' + b.about + (b.earned && b.date ? ` (${fmtDate(b.date)})` : ''))))))),
    card(h('h2', null, tr('Egyéni rekordok')),
      recs.length ? h('ul', { class: 'rows' }, recs.map(r => { const t = D.test[r.id]; return h('li', null,
        h('span', { class: 'log-item' }, h('strong', null, t.name), h('span', { class: 'muted small' }, tr('{p0} · {p1} mérés', { p0: fmtDate(r.date), p1: r.count }))),
        h('span', { class: 'badge ' + (r.improved ? 'good' : '') }, `${fmtNum(r.best)} ${t.input.unit}`)); })) : h('p', { class: 'muted' }, tr('Az első felmérés után itt látszanak.'))),
    card(h('h2', null, tr('Testméretek')), h('p', { class: 'small muted' }, tr('Hetente egyszer, reggel, ugyanúgy mérve. A derékbőség a köldök magasságában, kilégzés végén.')),
      h('label', { class: 'field' }, tr('Derékbőség (cm)'), bw), h('label', { class: 'field' }, tr('Testsúly (kg, nem kötelező)'), bkg),
      h('div', { class: 'row' }, btn(tr('Mentés'), async () => {
        const waist = bw.value ? Number(bw.value) : null, weight = bkg.value ? Number(bkg.value) : null;
        if (waist == null && weight == null) { toast('Adj meg legalább egy értéket.'); return; }
        if (waist != null && !(waist >= 50 && waist <= 180)) { toast('A derékbőség 50 és 180 cm között lehet.'); return; }
        if (weight != null && !(weight >= 30 && weight <= 250)) { toast('A testsúly 30 és 250 kg között lehet.'); return; }
        await itemPut({ id: uid(), kind: 'body', date: Date.now(), ...(waist != null ? { waist } : {}), ...(weight != null ? { weight } : {}) });
        toast('Bekerült a naplóba.'); reload('#/progress');
      }, 'primary')),
      body.weight ? h('p', { class: 'small' }, tr('Testsúly: {p0} kg', { p0: fmtNum(body.weight.value) }) + (body.weight.change != null ? tr(' ({p0}{p1} kg az első mérés óta)', { p0: body.weight.change > 0 ? '+' : '', p1: fmtNum(body.weight.change) }) : '')) : null),
    await recoveryCard(items),
    await nutritionCard(items),
    await friendCard(items),
    h('div', { class: 'row' }, link('#/review', tr('Heti áttekintés'), 'btn'), link('#/mini', tr('Mini-teszt (5 perc)'), 'btn'), link('#/result', tr('Legutóbbi felmérés'), 'btn')));
}

/* Félidős mini-teszt: fekvőtámasz, plank, egylábas állás, a felmérés időzítőivel. */
export async function miniView(arg, onCleanup) {
  const items = await itemsAll(), p = profile(), vals = {};
  const rows = MINI_TESTS.map(id => {
    const t = D.test[id], prev = latestValue(items, id);
    const input = h('input', { type: 'number', inputMode: 'decimal', min: t.input.min, max: t.input.max, step: t.input.step, id: 'm-' + id, oninput: () => { vals[id] = input.value; } });
    const timer = t.timer ? timerWidget(t.timer, v => { input.value = v; vals[id] = v; }, onCleanup) : null;
    return card(h('h2', null, t.name), h('p', { class: 'small' }, t.how), timer,
      h('label', { class: 'field' }, tr('Eredmény ({p0})', { p0: t.input.unit }), input),
      prev ? h('p', { class: 'small muted' }, tr('Legutóbb: {p0} {p1} ({p2})', { p0: fmtNum(prev.value), p1: t.input.unit, p2: fmtDate(prev.date) })) : null);
  });
  const out = h('div', { 'aria-live': 'polite' });
  return page(tr('Mini-teszt'),
    h('p', { class: 'muted' }, tr('Félidős ellenőrzés a 6 hetes ciklus közepén: három teszt, kb. 5 perc. Bemelegítés után, kipihenten.')),
    rows,
    h('div', { class: 'row' }, btn(tr('Mentés és összevetés'), async () => {
      const results = {};
      for (const id of MINI_TESTS) {
        const v = vals[id] === '' || vals[id] == null ? null : Number(vals[id]), t = D.test[id];
        if (v == null) continue;
        if (!(v >= t.input.min && v <= t.input.max)) { toast(tr('{p0}: az érték {p1} és {p2} között lehet.', { p0: t.name, p1: t.input.min, p2: t.input.max })); return; }
        results[id] = v;
      }
      if (!Object.keys(results).length) { toast('Adj meg legalább egy eredményt.'); return; }
      const before = Object.fromEntries(MINI_TESTS.map(id => [id, latestValue(items, id)]));
      await itemPut({ id: uid(), kind: 'mini', date: Date.now(), profile: { age: p.age, sex: p.sex }, results });
      clear(out).append(card(h('h2', null, tr('Összevetés')), h('ul', { class: 'rows' }, Object.entries(results).map(([id, v]) => {
        const t = D.test[id], b = before[id], s = scoreTest(t, v, p, D.norms);
        const diff = b ? v - b.value : null, better = diff != null && (LOWER_BETTER.has(id) ? diff < 0 : diff > 0);
        return h('li', null, h('span', { class: 'log-item' }, h('strong', null, t.name), h('span', { class: 'muted small' }, `${fmtNum(v)} ${t.input.unit}` + (s && s.score != null ? ` · ${s.score}. percentilis` : ''))),
          diff != null ? h('span', { class: 'badge ' + (better ? 'good' : diff === 0 ? '' : 'warn') }, `${diff > 0 ? '+' : ''}${fmtNum(Math.round(diff * 10) / 10)}`) : h('span', { class: 'badge' }, tr('első mérés')));
      })), h('p', { class: 'small muted' }, tr('A mini-teszt nem írja át a programot; a teljes újramérés a ciklus végén jön.')), link('#/progress', tr('Fejlődés'), 'btn')));
      out.scrollIntoView({ behavior: 'smooth' });
    }, 'primary')),
    out);
}
