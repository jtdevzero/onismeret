/* Felmérés: tesztlista, vezetett teszt időzítővel, alapadatok, eredmény. */
import { h, clear, fmtDate, toast } from './dom.js';
import { page, card, btn, link, note, choice, speak, beep, tickMs, levelBadge, fmtNum, sized, openMotion, countUp } from './widgets.js';
import { D, profile, lowImpact, reviewed, reviewText } from './data.js';
import { getDraft, setDraft, saveAssessment, assessments, evaluateItem, programFromAssessment, getProgram } from './state.js';
import { LEVEL_NAMES } from '../core/score.js';
import { sameScoring } from '../core/assessment.js';
import { radar } from './radar.js';
import { itemsAll } from './store.js';
import { LOWER_BETTER } from '../core/achievements.js';
import { TRIALS, reactionResult, randomDelay } from '../core/reaction.js';
import { swayMetrics } from '../core/sensors.js';
import { measurementReliability } from '../core/motion-quality.js';
import { liveCounter } from './live.js';
import { assessmentShareCard } from './share-card.js';
import { tr } from './i18n.js';

const isDone = (d, id) => d.results[id] != null || d.skipped[id];
const testsFor = () => D.tests.tests.filter(t => !(lowImpact() && t.impact) && !(t.minAge && !(profile().age >= t.minAge)));
const vitalsDone = v => ['rhr', 'waist', 'frequency', 'intensity', 'duration'].every(k => Number.isFinite(v[k]));
const MIN_TESTS = 6;

export async function assessView() {
  const d = await getDraft(), tests = testsFor();
  const filled = tests.filter(t => d.results[t.id] != null).length, done = tests.filter(t => isDone(d, t.id)).length;
  const nextTest = tests.find(t => !isDone(d, t.id));
  const groups = D.tests.areas.map(a => {
    const ts = tests.filter(t => t.area === a.id);
    if (!ts.length) return null;
    return h('li', null, h('div', { class: 'plan-item' }, h('strong', null, a.name),
      h('ul', { class: 'rows' }, ts.map(t => h('li', null, link('#/test/' + t.id, t.name),
        d.results[t.id] != null ? h('span', { class: 'test-done' }, '✓ ' + fmtNum(d.results[t.id]) + ' ' + unitOf(t))
          : d.skipped[t.id] ? h('span', { class: 'badge' }, tr('Kihagyva')) : h('span', { class: 'badge' }, t.optional ? tr('Nem kötelező') : tr('Hátra van')))))));
  });
  const evalBtn = btn(tr('Kiértékelés'), async () => {
    const item = await saveAssessment(d);
    location.hash = '#/result/' + item.id;
  }, 'primary');
  evalBtn.disabled = filled < MIN_TESTS;
  return page(tr('Felmérés'),
    h('p', { class: 'muted' }, tr('{p0} / {p1} teszt kész', { p0: done, p1: tests.length }) + (vitalsDone(d.vitals) ? ' · alapadatok megvannak' : '')),
    h('progress', { max: tests.length + 1, value: done + (vitalsDone(d.vitals) ? 1 : 0), 'aria-label': tr('A felmérés előrehaladása') }),
    lowImpact() ? note(tr('Kímélő mód: a távolugrás és a lépcsőteszt kimarad.'), 'small') : null,
    card(h('h2', null, tr('Előtte')), h('p', null, tr('5 perc bemelegítés: helyben járás, karkörzés, néhány laza guggolás. A teszteket bármilyen sorrendben, akár több napra elosztva is csinálhatod; amit beírsz, megmarad.')),
      h('div', { class: 'row' }, nextTest ? link('#/test/' + nextTest.id, done ? tr('Következő teszt') : tr('Első teszt'), 'btn primary') : null, link('#/test/vitals', tr('Alapadatok (fittségi korhoz)'), 'btn'))),
    card(h('ul', { class: 'rows plan' }, groups),
      h('ul', { class: 'rows' }, h('li', null, link('#/test/vitals', tr('Alapadatok: pulzus, derék, mozgás')), h('span', { class: vitalsDone(d.vitals) ? 'test-done' : 'badge' }, vitalsDone(d.vitals) ? '✓ Megvan' : tr('Hátra van'))))),
    card(h('p', null, filled >= MIN_TESTS ? tr('Mehet a kiértékelés. A kihagyott tesztek területe üresen marad, később pótolhatod egy újraméréssel.') : tr('Legalább {p0} teszt eredménye kell a kiértékeléshez (most {p1}).', { p0: MIN_TESTS, p1: filled })),
      h('div', { class: 'row' }, evalBtn, done || filled ? btn(tr('Újrakezdés'), async () => { if (confirm(tr('Törlöd a mostani, még ki nem értékelt eredményeket?'))) { await setDraft(null); location.hash = '#/assess'; dispatchEvent(new HashChangeEvent('hashchange')); } }, 'small') : null)));
}
const unitOf = t => (t.input.type === 'choice' ? 'pont' : t.input.unit);

/* Időzítő a teszthez. mode: countdown | stopwatch | counter | step. onValue(v): az eredmény beírása a mezőbe. */
export function timerWidget(cfg, onValue, onCleanup) {
  const clock = h('div', { class: 'timer-clock', role: 'timer', 'aria-live': 'off' }, '0');
  const status = h('p', { class: 'small muted', 'aria-live': 'polite' });
  const row = h('div', { class: 'row' });
  const box = h('div', { class: 'timer' }, clock, status, row);
  let iv = null, metro = null;
  const stop = () => { if (iv) clearInterval(iv); if (metro) clearInterval(metro); iv = metro = null; };
  onCleanup(stop);
  const fmt = s => (s >= 60 ? Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0') : String(Math.floor(s)));
  /* 3-2-1 visszaszámlálás, utána indul a mérés */
  const countIn = then => {
    let n = 3; clock.textContent = String(n); speak(tr('három')); status.textContent = tr('Felkészülni…');
    iv = setInterval(() => { n--; if (n > 0) { clock.textContent = String(n); speak(n === 2 ? tr('kettő') : 'egy'); } else { clearInterval(iv); iv = null; beep(1040, 150); speak(tr('Rajt!')); then(); } }, tickMs());
  };
  if (cfg.mode === 'countdown' || cfg.mode === 'step') {
    let left = cfg.seconds; clock.textContent = fmt(left);
    const start = btn(tr('Indítás'), () => {
      start.hidden = true; abort.hidden = false;
      countIn(() => {
        status.textContent = cfg.mode === 'step' ? tr('Fel-fel-le-le, a hangjelzés ütemére') : tr('Mehet!');
        if (cfg.mode === 'step') metro = setInterval(() => beep(660, 60), (60000 / cfg.bpm) * tickMs() / 1000);
        iv = setInterval(() => {
          left--; clock.textContent = fmt(left);
          if (left === 10 && cfg.seconds > 20) speak(tr('még tíz másodperc'));
          if (left <= 0) {
            stop(); beep(520, 400);
            if (cfg.mode === 'step') {
              speak(tr('Állj meg, ülj le, és számold a szívveréseidet a teljes következő percben.'));
              let rec = cfg.recovery; clock.textContent = fmt(rec); status.textContent = tr('Ülj le, és most kezdd számolni a szívveréseidet 60 másodpercig!');
              iv = setInterval(() => { rec--; clock.textContent = fmt(rec); if (rec <= 0) { stop(); beep(520, 400); speak(tr('Vége. Írd be a teljes perc alatt számolt szívverések számát.')); status.textContent = tr('Kész. Írd be a 60 másodperc alatt összesen számolt szívveréseket, ne az óra pillanatnyi pulzusát.'); abort.hidden = true; } }, tickMs());
            } else { speak(tr('Vége')); status.textContent = tr('Kész. Írd be az eredményt.'); abort.hidden = true; }
          }
        }, tickMs());
      });
    }, 'primary');
    const abort = btn(tr('Leállítás'), () => { stop(); left = cfg.seconds; clock.textContent = fmt(left); status.textContent = ''; start.hidden = false; abort.hidden = true; });
    abort.hidden = true;
    row.append(start, abort);
  } else if (cfg.mode === 'stopwatch') {
    let t = 0;
    const start = btn(tr('Indítás'), () => { start.hidden = true; halt.hidden = false; t = 0; countIn(() => { status.textContent = tr('Mérés…'); iv = setInterval(() => { t++; clock.textContent = fmt(t); if (t % 30 === 0) speak(t + tr(' másodperc')); }, tickMs()); }); }, 'primary');
    const halt = btn(tr('Megállt'), () => { stop(); halt.hidden = true; start.hidden = false; start.textContent = tr('Újra'); status.textContent = tr('Beírtam az időt; ha kell, javítsd.'); onValue(t); beep(520, 200); }, 'primary');
    halt.hidden = true;
    row.append(start, halt);
  } else if (cfg.mode === 'reaction') {
    /* koppintós reakcióteszt: a mező színváltására koppints; korai koppintás érvénytelen */
    const pad = h('button', { type: 'button', class: 'react-pad', 'aria-label': tr('Reakciómező: koppints, amikor zöldre vált') }, tr('Indításhoz koppints ide'));
    const times = [];
    let state = 'idle', shown = 0, wait = null;
    onCleanup(() => clearTimeout(wait));
    const arm = () => {
      state = 'wait'; pad.className = 'react-pad wait'; pad.textContent = tr('Várj…');
      wait = setTimeout(() => { state = 'go'; shown = performance.now(); pad.className = 'react-pad go'; pad.textContent = tr('MOST!'); }, randomDelay() * tickMs() / 1000);
    };
    pad.addEventListener('pointerdown', () => {
      if (state === 'idle' || state === 'done') { times.length = 0; status.textContent = ''; clock.textContent = '–'; arm(); return; }
      if (state === 'wait') { clearTimeout(wait); times.push(NaN); status.textContent = tr('Túl korán! ({p0}/{p1})', { p0: times.length, p1: TRIALS }); }
      else if (state === 'go') { const ms = performance.now() - shown; times.push(ms); clock.textContent = Math.round(ms) + ' ms'; status.textContent = tr('{p0}/{p1}. próba', { p0: times.length, p1: TRIALS }); }
      if (times.length >= TRIALS) {
        const r = reactionResult(times);
        state = 'done'; pad.className = 'react-pad'; pad.textContent = tr('Újra');
        if (r) { clock.textContent = r.median + ' ms'; status.textContent = tr('Medián {p0} ms (legjobb {p1} ms). Beírtam.', { p0: r.median, p1: r.best }); onValue(r.median); }
        else status.textContent = tr('Túl sok korai koppintás. Próbáld újra.');
        return;
      }
      arm();
    });
    clock.textContent = '–';
    row.append(pad);
  } else if (cfg.mode === 'sway') {
    /* egyensúly a gyorsulásmérővel: visszaszámlálás, majd 20 mp mérés */
    let motion = null;
    onCleanup(() => { if (motion) motion.stop(); });
    clock.textContent = String(cfg.seconds);
    const start = btn(tr('Indítás'), async () => {
      try { motion = await openMotion(); } catch (e) { status.textContent = e && e.code === 'motion_denied' ? tr('Nem kaptam engedélyt a mozgásérzékelőhöz.') : tr('Ezen a készüléken nincs elérhető mozgásérzékelő.'); return; }
      start.hidden = true;
      countIn(() => {
        motion.samples.length = 0;
        let left = cfg.seconds; status.textContent = tr('Állj nyugodtan…');
        iv = setInterval(() => {
          left--; clock.textContent = String(left);
          if (left <= 0) {
            stop(); motion.stop(); beep(520, 300);
            const r = swayMetrics(motion.samples);
            start.hidden = false; start.textContent = tr('Újra');
            if (!r) { status.textContent = tr('Nem érkezett elég mérési adat. Próbáld újra.'); return; }
            clock.textContent = String(r.score); status.textContent = tr('Stabilitás: {p0} / 100. Beírtam.', { p0: r.score }); speak(tr('Kész.')); onValue(r.score);
          }
        }, tickMs());
      });
    }, 'primary');
    row.append(start);
  } else if (cfg.mode === 'counter') {
    let n = 0; clock.textContent = '0';
    const tap = btn('+1', () => { n++; clock.textContent = String(n); onValue(n); }, 'primary counter-btn');
    tap.setAttribute('aria-label', tr('Egy ismétlés hozzáadása'));
    row.append(tap, btn(tr('Nullázás'), () => { n = 0; clock.textContent = '0'; onValue(''); }, 'small'));
    status.textContent = tr('Koppints minden teljes ismétlés után, vagy írd be a számot alul.');
  }
  return box;
}

export async function testView(id, onCleanup) {
  if (id === 'vitals') return vitalsView();
  const t = D.test[id];
  if (!t) return page(tr('Nincs ilyen teszt'), link('#/assess', tr('← Felmérés'), 'btn'));
  const d = await getDraft(), tests = testsFor(), idx = tests.findIndex(x => x.id === id);
  const next = tests.slice(idx + 1).find(x => !isDone(d, x.id)) || tests.find(x => !isDone(d, x.id) && x.id !== id);
  const goNext = () => { location.hash = next ? '#/test/' + next.id : '#/assess'; };
  let value = d.results[id] ?? null, input;
  const save = btn(tr('Mentés'), async () => {
    const v = value === '' || value == null ? null : Number(value);
    if (v == null || !Number.isFinite(v)) { toast('Adj meg egy eredményt, vagy hagyd ki a tesztet.'); return; }
    if (t.input.type === 'number' && (v < t.input.min || v > t.input.max)) { toast(tr('Az érték {p0} és {p1} között lehet.', { p0: t.input.min, p1: t.input.max })); return; }
    const fresh = await getDraft();
    fresh.results[id] = v; delete fresh.skipped[id];
    await setDraft(fresh); toast('Elmentve.'); goNext();
  }, 'primary');
  if (t.input.type === 'choice') input = choice('t-' + id, t.input.options, value, v => { value = v; }, t.name);
  else {
    const el = h('input', { type: 'number', inputMode: 'decimal', min: t.input.min, max: t.input.max, step: t.input.step, value: value ?? '', id: 'val', oninput: () => { value = el.value; } });
    input = h('label', { class: 'field' }, tr('Eredmény'), h('span', { class: 'unit-input' }, el, h('span', null, t.input.unit)));
    input.setValue = v => { el.value = v; value = v; };
  }
  const timer = t.timer ? timerWidget(t.timer, v => input.setValue && input.setValue(v), onCleanup) : null;
  /* kamerás mérés: az eredmény a mezőbe kerül, ellenőrizheted és javíthatod */
  const live = liveCounter(id, {
    maxSeconds: t.timer && t.timer.mode === 'countdown' ? t.timer.seconds : undefined,
    startLabel: tr('Mérés kamerával'),
    onDone: r => {
      if (!r.ok || !input.setValue) return;
      const rel = measurementReliability(r);
      if (!rel.autofill) { toast('A kamerás mérés nem volt megbízható, ezért nem írtam be. Mérj újra, vagy írd be kézzel.'); return; }
      const hs = r.holdSides;
      const v = id === 'vertical_jump' ? r.jumpCm : id === 'sl_stance' && hs && hs.left != null && hs.right != null ? Math.round((hs.left + hs.right) * 2) / 4 : r.holdSeconds != null && !r.reps ? Math.floor(r.holdSeconds) : r.reps;
      if (v == null) return;
      input.setValue(v);
      toast(rel.level === 'limited' ? tr('Beírtam a mért eredményt, de a mérés megbízhatósága korlátozott: ellenőrizd, és ha kell, javítsd.') : tr('Beírtam a mért eredményt; ha kell, javítsd, majd mentsd.'));
    },
  });
  if (live) onCleanup(live.stop);
  /* korábbi mérések ebből a tesztből: a legutóbbi az összevetéshez */
  const past = (await assessments()).filter(a => a.results && a.results[id] != null).slice(0, 5);
  const history = past.length ? card(h('h2', null, tr('Korábbi eredményeid')), h('ul', { class: 'rows' }, past.map(a => {
    const sc = evaluateItem(a).tests[id];
    return h('li', null, h('span', null, fmtDate(a.date)), h('span', null, h('strong', null, (t.input.type === 'choice' ? a.results[id] + ' / 3' : fmtNum(a.results[id]) + ' ' + t.input.unit)),
      sc && sc.score != null ? h('span', { class: 'muted small' }, ' · ' + (sc.kind === 'norm' ? sc.score + '. pc.' : sc.score + ' pont')) : null));
  }))) : null;
  return page(t.name,
    h('p', { class: 'muted' }, tr('{p0}. teszt a {p1}-ből · {p2}', { p0: idx + 1, p1: tests.length, p2: D.area[t.area].name }) + (t.kind === 'baseline' ? tr(' · saját alapvonal') : t.kind === 'criterion' ? tr(' · funkcionális küszöb') : '')),
    card(h('h2', null, tr('Hogyan csináld')), h('p', null, t.how), t.safety ? note(t.safety, 'warn') : null),
    timer ? card(timer) : null,
    live ? h('details', { class: 'card' }, h('summary', null, h('h2', null, tr('Mérés kamerával')), h('span', { class: 'badge' }, tr('béta'))), id === 'sl_stance' ? h('p', { class: 'small' }, tr('Szemből vedd fel: előbb a bal, aztán a jobb lábon állj, csukott szemmel. A két idő átlagát írom be.')) : t.timer && t.timer.mode === 'countdown' ? h('p', { class: 'small' }, tr('A visszaszámlálás után {p0} másodpercig számolok, aztán magamtól leállok.', { p0: t.timer.seconds })) : null, live.el) : null,
    history,
    card(input, h('div', { class: 'row' }, save, btn(tr('Kihagyom'), async () => {
      const fresh = await getDraft(); delete fresh.results[id]; fresh.skipped[id] = true; await setDraft(fresh); goNext();
    }))),
    link('#/assess', tr('← Vissza a tesztlistához'), 'btn'));
}

async function vitalsView() {
  const d = await getDraft(), v = { ...d.vitals }, V = D.tests.vitals;
  const num = (k, label, hint, min, max) => {
    const el = h('input', { type: 'number', inputMode: 'numeric', min, max, value: v[k] ?? '', oninput: () => { v[k] = el.value === '' ? null : Number(el.value); } });
    return h('label', { class: 'field' }, label, h('span', { class: 'hint' }, hint), el);
  };
  return page(tr('Alapadatok'),
    h('p', { class: 'muted' }, V.how),
    card(num('rhr', tr('Nyugalmi pulzus (ütés/perc)'), tr('Reggel ágyban, vagy 5 perc nyugodt ülés után: 30 másodpercig számold, és szorozd kettővel.'), 30, 130),
      num('waist', tr('Derékbőség (cm)'), tr('Köldökmagasságban, kilégzés végén, a mérőszalag ne szorítson.'), 50, 180)),
    card(h('h2', null, tr('Milyen gyakran mozogsz?')), h('p', { class: 'small muted' }, tr('Edzés, futás, kerékpár, intenzív kerti munka is számít.')),
      choice('freq', V.frequency, v.frequency, x => { v.frequency = x; }, tr('Gyakoriság')),
      h('h3', null, tr('Milyen intenzíven?')), choice('int', V.intensity, v.intensity, x => { v.intensity = x; }, tr('Intenzitás')),
      h('h3', null, tr('Alkalmanként mennyi ideig?')), choice('dur', V.duration, v.duration, x => { v.duration = x; }, tr('Időtartam'))),
    h('div', { class: 'row' }, btn(tr('Mentés'), async () => {
      if (v.rhr != null && (v.rhr < 30 || v.rhr > 130)) { toast('A nyugalmi pulzus 30 és 130 között lehet.'); return; }
      if (v.waist != null && (v.waist < 50 || v.waist > 180)) { toast('A derékbőség 50 és 180 cm között lehet.'); return; }
      const fresh = await getDraft(); fresh.vitals = v; await setDraft(fresh); toast('Elmentve.'); location.hash = '#/assess';
    }, 'primary'), link('#/assess', tr('← Felmérés'), 'btn')));
}

/* ---- eredmény ---- */
const QUALITY = { A: tr('publikált norma'), B: tr('becsült norma') };
/* pókhálóábra csúszkával: az előző felmérésből a mostaniba húzva animál (ha van előző) */
function radarCompare(axes) {
  const label = tr('Területek pontszáma: ') + axes.map(a => `${a.label} ${a.value}`).join(', ');
  const box = h('div', null, radar(axes, { label }));
  if (!axes.every(a => a.prev != null)) return box;
  const range = h('input', { type: 'range', min: 0, max: 100, value: 100, class: 'radar-range', 'aria-label': tr('Összevetés: előző felmérés (bal) – mostani (jobb)'), oninput: () => {
    const f = Number(range.value) / 100;
    const mixed = axes.map(a => ({ ...a, value: Math.round(a.prev + (a.value - a.prev) * f), prev: a.prev }));
    clear(box).append(radar(mixed, { label }), wrap);
  } });
  const wrap = h('div', { class: 'radar-slider' }, h('span', { class: 'small muted' }, tr('előző')), range, h('span', { class: 'small muted' }, 'most'));
  box.append(wrap);
  return box;
}
/* apró vonaldiagram a változásról (legalább két felmérésnél) */
function spark(vals, name) {
  if (vals.length < 2) return null;
  const NS = 'http://www.w3.org/2000/svg', W = 72, H = 22;
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('class', 'spark'); svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', `${name}: ${vals.join(' → ')}`);
  const pts = vals.map((v, i) => [2 + i * (W - 4) / (vals.length - 1), H - 2 - (v / 100) * (H - 4)]);
  const pl = document.createElementNS(NS, 'polyline'); pl.setAttribute('points', pts.map(p => p.map(x => x.toFixed(1)).join(',')).join(' '));
  const dot = document.createElementNS(NS, 'circle'); const [lx, ly] = pts[pts.length - 1];
  dot.setAttribute('cx', lx.toFixed(1)); dot.setAttribute('cy', ly.toFixed(1)); dot.setAttribute('r', '2.5');
  svg.append(pl, dot);
  return h('p', { class: 'small muted' }, tr('Változás: '), svg, ' ' + vals.join(' → '));
}
function meter(score) {
  return h('div', null, h('div', { class: 'meter', role: 'img', 'aria-label': tr('{p0} a 100-ból', { p0: score }) }, sized(h('span', { class: 'meter-fill' }), 'left', score)),
    h('div', { class: 'meter-scale', 'aria-hidden': 'true' }, h('span', null, '0'), h('span', null, tr('alacsony | közepes | magas pontszám')), h('span', null, '100')));
}
const ADVICE = {
  mobility: tr('Minden nap 10 perc célzott mobilitás jut rá, a leggyengébb ízületre szabva.'),
  flexibility: tr('A napi blokkban a nyújtások a gyengébb izomcsoportra kerülnek; tartsd ki a teljes időt, rugózás nélkül.'),
  strength: tr('Hetente háromszor erőedzés, és amint egy szint könnyű, lépsz a következőre.'),
  core: tr('Plank- és dead bug-változatok minden erő- és gyorsasági napon.'),
  power: tr('Heti két gyorsasági nap ugrásokkal és rövid, maximális sebességű szakaszokkal.'),
  balance: tr('Egylábas gyakorlatok szinte minden nap; ezek a hétköznapi sérülésvédelemben is számítanak.'),
  cardio: tr('A gyorsasági napok intervallumai mellett heti 2–3 alkalom 30 perces tempós séta, kerékpár vagy futás javítja leginkább.'),
};

export async function resultView(id) {
  const all = await assessments();
  const item = id ? all.find(a => a.id === id) : all[0];
  if (!item) return page(tr('Eredmény'), h('p', null, tr('Még nincs kiértékelt felmérés.')), link('#/assess', tr('Felmérés indítása'), 'btn primary'));
  const ev = evaluateItem(item), prevItem = all[all.indexOf(item) + 1];
  const comparable = sameScoring(item, prevItem), prev = comparable ? evaluateItem(prevItem) : null;
  const areas = D.tests.areas.filter(a => ev.areas[a.id]);
  const prog = await getProgram();
  const p = item.profile;
  const axes = areas.map(a => ({ label: a.short, value: ev.areas[a.id].score, prev: prev && prev.areas[a.id] ? prev.areas[a.id].score : null }));
  const progBtn = btn(prog ? tr('Program frissítése ebből a felmérésből') : tr('Program készítése'), async () => {
    await programFromAssessment(item); toast(prog ? tr('A program frissült, új 6 hetes ciklus indul.') : tr('Kész a programod.')); location.hash = '#/program';
  }, 'primary');
  const ageDiff = ev.fitnessAge != null ? p.age - ev.fitnessAge : null;
  /* új egyéni csúcs: ebben a felmérésben jobb lett, mint bármelyik korábbi mérésben */
  const allItems = await itemsAll();
  const earlier = allItems.filter(i => (i.kind === 'assessment' || i.kind === 'mini') && i.date < item.date && i.results);
  const isRecord = id => { const v = item.results[id]; if (!Number.isFinite(v)) return false; const prevVals = earlier.map(i => i.results[id]).filter(Number.isFinite); if (!prevVals.length) return false; return LOWER_BETTER.has(id) || (D.test[id] && D.test[id].lower) ? v < Math.min(...prevVals) : v > Math.max(...prevVals); };
  const recordIds = D.tests.tests.filter(t => t.input.type === 'number' && isRecord(t.id)).map(t => t.id);
  /* a terület pontszáma felmérésről felmérésre (a legrégebbitől a megjelenítettig) */
  const upto = all.slice(all.indexOf(item)).filter(a => sameScoring(item, a)).reverse().map(evaluateItem);
  const history = id => upto.map(e => (e.areas[id] ? e.areas[id].score : null)).filter(v => v != null);
  return page(tr('Eredmény'),
    h('p', { class: 'muted' }, tr('{p0} · {p1} éves {p2} · normák, funkcionális küszöbök és saját alapvonal', { p0: fmtDate(item.date), p1: p.age, p2: p.sex === 'female' ? tr('nő') : tr('férfi') })),
    !item.scoring ? note(tr('Régi felmérés: az eredeti pontozás verziója nem ismert. Ezt az eredményt a jelenlegi normákkal számoltam újra; a nyers mérési adatok változatlanok.'), 'warn') : null,
    prevItem && !comparable ? note(tr('Az előző felmérés pontozási verziója eltér vagy nem ismert. A pontszámokból nem jelzek fejlődést vagy visszaesést; a nyers teszteredményeket csak azonos mérési móddal érdemes összevetni.'), 'small') : null,
    note((reviewed() ? tr('Tájékoztató önfelmérés; a tesztleírásokat és a normákat szakember átnézte. ') : tr('Tájékoztató önfelmérés, szakmai lektorálás nélkül. ')) + tr('A pontszám nem korosztályos helyezés, a fittségi kor kérdőíves becslés.'), 'small'),
    h('section', { class: 'card accent result-overview' }, h('p', { class: 'eyebrow' }, tr('A mostani kiindulópontod')),
      h('div', { class: 'stat-row' },
        h('div', { class: 'stat' }, h('span', { class: 'muted' }, tr('Fittségi kor')), countUp(h('strong'), ev.fitnessAge, tr(' év')),
          h('span', { class: 'small muted' }, ev.fitnessAge == null ? tr('Add meg az alapadatokat.') : ageDiff > 0 ? tr('{p0} évvel fiatalabb a korodnál', { p0: ageDiff }) : ageDiff < 0 ? tr('{p0} évvel idősebb a korodnál', { p0: -ageDiff }) : tr('pont a korodnak megfelelő'))),
        h('div', { class: 'stat' }, h('span', { class: 'muted' }, tr('Összesített')), countUp(h('strong'), ev.overall),
          ev.overall != null ? levelBadge(ev.overallLevel || lvl(ev.overall), LEVEL_NAMES[ev.overallLevel || lvl(ev.overall)]) : null)),
      axes.length >= 3 ? radarCompare(axes) : null,
      h('div', { class: 'legend' }, h('span', null, 'most'), h('span', { class: 'lg-ref' }, tr('50 pontos segédvonal')), prev ? h('span', { class: 'lg-prev' }, tr('előző felmérés')) : null),
      h('details', { class: 'result-explainer' }, h('summary', null, tr('Mit jelentenek ezek a számok?')),
        h('p', { class: 'small muted' }, tr('A területi és az összesített pontszám különböző mércéket átlagol: nem percentilis, és nem mutatja a korosztályon belüli helyezésedet. A fittségi kor az alapadatokból becsült VO₂max átszámítása, nem a teljes mozgásfelmérés vagy a biológiai kor mérése.')),
        ev.vo2 != null ? h('p', { class: 'small muted' }, tr('Becsült VO₂max: {p0} ml/kg/perc. Kérdőíves becslés, jelentős egyéni bizonytalansággal; a Forma pontosságát saját mérésen még nem validáltuk.', { p0: fmtNum(ev.vo2) })) : null,
        item.scoring ? h('p', { class: 'small muted' }, tr('A felméréskor mentett kiértékelés. Pontozás: {p0}; normák: {p1}; tesztek: {p2}.', { p0: item.scoring.version, p1: item.scoring.normsVersion, p2: item.scoring.testsVersion })) : null)),
    areas.length >= 3 ? assessmentShareCard(item, ev, areas) : null,
    recordIds.length ? h('section', { class: 'card accent record-card' }, h('h2', null, tr('🏆 Új egyéni csúcs')), h('p', null, recordIds.map(id => `${D.test[id].name}: ${fmtNum(item.results[id])} ${D.test[id].input.unit}`).join(' · '))) : null,
    ev.pain.length ? note(tr('Fájdalmat jeleztél: ') + ev.pain.map(t => D.test[t].name.toLowerCase()).join(', ') + tr('. Ezt érdemes orvossal vagy gyógytornásszal megnézetni; a programban a kapcsolódó gyakorlatok a legkönnyebb szinten indulnak.'), 'warn') : null,
    card(h('h2', null, tr('Erre fókuszálunk')), ev.weakest.map(a => h('p', null, h('strong', null, D.area[a].name + ': '), ADVICE[a])),
      h('p', { class: 'small muted' }, prog ? tr('Az újramért gyakorlatok szintje az eredményhez igazodik, lefelé is. A kihagyott tesztekhez tartozó korábbi szintek megmaradnak; fájdalomjelzésnél könnyítek. A program az aktuális normákkal készül.') : tr('A program a gyenge területekre több időt szán, és a mért szintedről indul.')),
      h('div', { class: 'row' }, progBtn, link('#/progress', tr('Célok és rekordok'), 'btn small'))),
    card(h('h2', null, tr('Területenként')), h('p', { class: 'small muted' }, tr('Pontszámsávok: 40 alatt alacsony, 40-től közepes, 75-től magas pontszám. Ezek a Forma saját sávjai, nem korosztályos helyezések.')),
      areas.map(a => { const r = ev.areas[a.id], pr = prev && prev.areas[a.id]; return h('div', { class: 'area-row' },
        h('div', { class: 'area-top' }, h('span', null, a.name), h('span', null, String(r.score) + (pr ? ` (${r.score - pr.score >= 0 ? '+' : ''}${r.score - pr.score})` : ''), ' ', levelBadge(r.level, LEVEL_NAMES[r.level]))),
        meter(r.score), spark(history(a.id), a.name)); })),
    h('details', { class: 'card section' }, h('summary', null, h('h2', null, tr('Tesztek részletesen'))), h('table', { class: 'tests-table' },
      h('thead', null, h('tr', null, h('th', null, tr('Teszt')), h('th', null, tr('Eredmény')), h('th', null, tr('Pont')))),
      h('tbody', null, D.tests.tests.filter(t => ev.tests[t.id]).map(t => { const s = ev.tests[t.id]; return h('tr', null,
        h('td', null, t.name, h('br'), h('span', { class: 'small muted' }, s.kind === 'norm' ? QUALITY[s.quality] + (s.outside ? tr(', korsávon kívül') : '') : s.kind === 'criterion' ? tr('funkcionális küszöb') : tr('saját alapvonal'))),
        h('td', null, t.input.type === 'choice' ? s.value + ' / 3' : fmtNum(s.value) + ' ' + t.input.unit),
        h('td', null, s.score != null ? (s.kind === 'norm' ? s.score + '. pc.' : String(s.score)) : '–')); }))),
      h('details', null, h('summary', null, tr('Források és pontosság')),
        item.scoring && item.scoring.normsVersion !== D.norms.version ? h('p', { class: 'small' }, tr('Az alábbi forráslista az aktuális normákhoz tartozik; a fenti mentett eredmény korábbi normaverzióval készült.')) : null,
        h('p', { class: 'small' }, tr('A „pc.” percentilist jelent: 60. pc. = a korosztályod 60%-ánál jobb eredmény. A funkcionális küszöbök kortól függetlenek (például a teljes mély guggolás minden felnőttnek elérhető cél).')),
        h('ul', { class: 'plain small' }, Object.entries(D.norms.tests).map(([k, n]) => h('li', null, h('strong', null, D.test[k].name + ': '), n.source)), h('li', null, D.norms.vo2.source)),
        h('p', { class: 'small muted' }, reviewText() + tr(' A Forma nem orvosi eszköz.')))));
}
const lvl = s => (s >= D.norms.levels.top ? 'top' : s >= D.norms.levels.low ? 'mid' : 'low');
