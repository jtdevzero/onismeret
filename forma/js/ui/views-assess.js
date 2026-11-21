/* Felmérés: tesztlista, vezetett teszt időzítővel, alapadatok, eredmény. */
import { h, clear, fmtDate, toast } from './dom.js';
import { page, card, btn, link, note, choice, speak, beep, tickMs, levelBadge, fmtNum, sized } from './widgets.js';
import { D, profile, lowImpact } from './data.js';
import { getDraft, setDraft, saveAssessment, assessments, evaluateItem, programFromAssessment, getProgram } from './state.js';
import { LEVEL_NAMES } from '../core/score.js';
import { radar } from './radar.js';

const isDone = (d, id) => d.results[id] != null || d.skipped[id];
const testsFor = () => D.tests.tests.filter(t => !(lowImpact() && t.impact));
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
          : d.skipped[t.id] ? h('span', { class: 'badge' }, 'Kihagyva') : h('span', { class: 'badge' }, t.optional ? 'Nem kötelező' : 'Hátra van'))))));
  });
  const evalBtn = btn('Kiértékelés', async () => {
    const item = await saveAssessment(d);
    location.hash = '#/result/' + item.id;
  }, 'primary');
  evalBtn.disabled = filled < MIN_TESTS;
  return page('Felmérés',
    h('p', { class: 'muted' }, `${done} / ${tests.length} teszt kész` + (vitalsDone(d.vitals) ? ' · alapadatok megvannak' : '')),
    h('progress', { max: tests.length + 1, value: done + (vitalsDone(d.vitals) ? 1 : 0), 'aria-label': 'A felmérés előrehaladása' }),
    lowImpact() ? note('Kímélő mód: a távolugrás és a lépcsőteszt kimarad.', 'small') : null,
    card(h('h2', null, 'Előtte'), h('p', null, '5 perc bemelegítés: helyben járás, karkörzés, néhány laza guggolás. A teszteket bármilyen sorrendben, akár több napra elosztva is csinálhatod; amit beírsz, megmarad.'),
      h('div', { class: 'row' }, nextTest ? link('#/test/' + nextTest.id, done ? 'Következő teszt' : 'Első teszt', 'btn primary') : null, link('#/test/vitals', 'Alapadatok (fittségi korhoz)', 'btn'))),
    card(h('ul', { class: 'rows plan' }, groups),
      h('ul', { class: 'rows' }, h('li', null, link('#/test/vitals', 'Alapadatok: pulzus, derék, mozgás'), h('span', { class: vitalsDone(d.vitals) ? 'test-done' : 'badge' }, vitalsDone(d.vitals) ? '✓ Megvan' : 'Hátra van')))),
    card(h('p', null, filled >= MIN_TESTS ? 'Mehet a kiértékelés. A kihagyott tesztek területe üresen marad, később pótolhatod egy újraméréssel.' : `Legalább ${MIN_TESTS} teszt eredménye kell a kiértékeléshez (most ${filled}).`),
      h('div', { class: 'row' }, evalBtn, done || filled ? btn('Újrakezdés', async () => { if (confirm('Törlöd a mostani, még ki nem értékelt eredményeket?')) { await setDraft(null); location.hash = '#/assess'; dispatchEvent(new HashChangeEvent('hashchange')); } }, 'small') : null)));
}
const unitOf = t => (t.input.type === 'choice' ? 'pont' : t.input.unit);

/* Időzítő a teszthez. mode: countdown | stopwatch | counter | step. onValue(v): az eredmény beírása a mezőbe. */
function timerWidget(cfg, onValue, onCleanup) {
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
    let n = 3; clock.textContent = String(n); speak('három'); status.textContent = 'Felkészülni…';
    iv = setInterval(() => { n--; if (n > 0) { clock.textContent = String(n); speak(n === 2 ? 'kettő' : 'egy'); } else { clearInterval(iv); iv = null; beep(1040, 150); speak('Rajt!'); then(); } }, tickMs());
  };
  if (cfg.mode === 'countdown' || cfg.mode === 'step') {
    let left = cfg.seconds; clock.textContent = fmt(left);
    const start = btn('Indítás', () => {
      start.hidden = true; abort.hidden = false;
      countIn(() => {
        status.textContent = cfg.mode === 'step' ? 'Fel-fel-le-le, a hangjelzés ütemére' : 'Mehet!';
        if (cfg.mode === 'step') metro = setInterval(() => beep(660, 60), (60000 / cfg.bpm) * tickMs() / 1000);
        iv = setInterval(() => {
          left--; clock.textContent = fmt(left);
          if (left === 10 && cfg.seconds > 20) speak('még tíz másodperc');
          if (left <= 0) {
            stop(); beep(520, 400);
            if (cfg.mode === 'step') {
              speak('Állj meg, ülj le, és számold a pulzusod egy percig.');
              let rec = cfg.recovery; clock.textContent = fmt(rec); status.textContent = 'Ülj le, és most számold a pulzusod!';
              iv = setInterval(() => { rec--; clock.textContent = fmt(rec); if (rec <= 0) { stop(); beep(520, 400); speak('Vége. Írd be a pulzusod.'); status.textContent = 'Kész. Írd be, hányat számoltál.'; abort.hidden = true; } }, tickMs());
            } else { speak('Vége'); status.textContent = 'Kész. Írd be az eredményt.'; abort.hidden = true; }
          }
        }, tickMs());
      });
    }, 'primary');
    const abort = btn('Leállítás', () => { stop(); left = cfg.seconds; clock.textContent = fmt(left); status.textContent = ''; start.hidden = false; abort.hidden = true; });
    abort.hidden = true;
    row.append(start, abort);
  } else if (cfg.mode === 'stopwatch') {
    let t = 0;
    const start = btn('Indítás', () => { start.hidden = true; halt.hidden = false; t = 0; countIn(() => { status.textContent = 'Mérés…'; iv = setInterval(() => { t++; clock.textContent = fmt(t); if (t % 30 === 0) speak(t + ' másodperc'); }, tickMs()); }); }, 'primary');
    const halt = btn('Megállt', () => { stop(); halt.hidden = true; start.hidden = false; start.textContent = 'Újra'; status.textContent = 'Beírtam az időt; ha kell, javítsd.'; onValue(t); beep(520, 200); }, 'primary');
    halt.hidden = true;
    row.append(start, halt);
  } else if (cfg.mode === 'counter') {
    let n = 0; clock.textContent = '0';
    const tap = btn('+1', () => { n++; clock.textContent = String(n); onValue(n); }, 'primary counter-btn');
    tap.setAttribute('aria-label', 'Egy ismétlés hozzáadása');
    row.append(tap, btn('Nullázás', () => { n = 0; clock.textContent = '0'; onValue(''); }, 'small'));
    status.textContent = 'Koppints minden teljes ismétlés után, vagy írd be a számot alul.';
  }
  return box;
}

export async function testView(id, onCleanup) {
  if (id === 'vitals') return vitalsView();
  const t = D.test[id];
  if (!t) return page('Nincs ilyen teszt', link('#/assess', '← Felmérés', 'btn'));
  const d = await getDraft(), tests = testsFor(), idx = tests.findIndex(x => x.id === id);
  const next = tests.slice(idx + 1).find(x => !isDone(d, x.id)) || tests.find(x => !isDone(d, x.id) && x.id !== id);
  const goNext = () => { location.hash = next ? '#/test/' + next.id : '#/assess'; };
  let value = d.results[id] ?? null, input;
  const save = btn('Mentés', async () => {
    const v = value === '' || value == null ? null : Number(value);
    if (v == null || !Number.isFinite(v)) { toast('Adj meg egy eredményt, vagy hagyd ki a tesztet.'); return; }
    if (t.input.type === 'number' && (v < t.input.min || v > t.input.max)) { toast(`Az érték ${t.input.min} és ${t.input.max} között lehet.`); return; }
    const fresh = await getDraft();
    fresh.results[id] = v; delete fresh.skipped[id];
    await setDraft(fresh); toast('Elmentve.'); goNext();
  }, 'primary');
  if (t.input.type === 'choice') input = choice('t-' + id, t.input.options, value, v => { value = v; }, t.name);
  else {
    const el = h('input', { type: 'number', inputMode: 'decimal', min: t.input.min, max: t.input.max, step: t.input.step, value: value ?? '', id: 'val', oninput: () => { value = el.value; } });
    input = h('label', { class: 'field' }, 'Eredmény', h('span', { class: 'unit-input' }, el, h('span', null, t.input.unit)));
    input.setValue = v => { el.value = v; value = v; };
  }
  const timer = t.timer ? timerWidget(t.timer, v => input.setValue && input.setValue(v), onCleanup) : null;
  return page(t.name,
    h('p', { class: 'muted' }, `${idx + 1}. teszt a ${tests.length}-ből · ${D.area[t.area].name}` + (t.kind === 'baseline' ? ' · saját alapvonal' : t.kind === 'criterion' ? ' · funkcionális küszöb' : '')),
    card(h('h2', null, 'Hogyan csináld'), h('p', null, t.how), t.safety ? note(t.safety, 'warn') : null),
    timer ? card(timer) : null,
    card(input, h('div', { class: 'row' }, save, btn('Kihagyom', async () => {
      const fresh = await getDraft(); delete fresh.results[id]; fresh.skipped[id] = true; await setDraft(fresh); goNext();
    }))),
    link('#/assess', '← Vissza a tesztlistához', 'btn'));
}

async function vitalsView() {
  const d = await getDraft(), v = { ...d.vitals }, V = D.tests.vitals;
  const num = (k, label, hint, min, max) => {
    const el = h('input', { type: 'number', inputMode: 'numeric', min, max, value: v[k] ?? '', oninput: () => { v[k] = el.value === '' ? null : Number(el.value); } });
    return h('label', { class: 'field' }, label, h('span', { class: 'hint' }, hint), el);
  };
  return page('Alapadatok',
    h('p', { class: 'muted' }, V.how),
    card(num('rhr', 'Nyugalmi pulzus (ütés/perc)', 'Reggel ágyban, vagy 5 perc nyugodt ülés után: 30 másodpercig számold, és szorozd kettővel.', 30, 130),
      num('waist', 'Derékbőség (cm)', 'Köldökmagasságban, kilégzés végén, a mérőszalag ne szorítson.', 50, 180)),
    card(h('h2', null, 'Milyen gyakran mozogsz?'), h('p', { class: 'small muted' }, 'Edzés, futás, kerékpár, intenzív kerti munka is számít.'),
      choice('freq', V.frequency, v.frequency, x => { v.frequency = x; }, 'Gyakoriság'),
      h('h3', null, 'Milyen intenzíven?'), choice('int', V.intensity, v.intensity, x => { v.intensity = x; }, 'Intenzitás'),
      h('h3', null, 'Alkalmanként mennyi ideig?'), choice('dur', V.duration, v.duration, x => { v.duration = x; }, 'Időtartam')),
    h('div', { class: 'row' }, btn('Mentés', async () => {
      if (v.rhr != null && (v.rhr < 30 || v.rhr > 130)) { toast('A nyugalmi pulzus 30 és 130 között lehet.'); return; }
      if (v.waist != null && (v.waist < 50 || v.waist > 180)) { toast('A derékbőség 50 és 180 cm között lehet.'); return; }
      const fresh = await getDraft(); fresh.vitals = v; await setDraft(fresh); toast('Elmentve.'); location.hash = '#/assess';
    }, 'primary'), link('#/assess', '← Felmérés', 'btn')));
}

/* ---- eredmény ---- */
const QUALITY = { A: 'publikált norma', B: 'becsült norma' };
function meter(score) {
  return h('div', null, h('div', { class: 'meter', role: 'img', 'aria-label': `${score} a 100-ból` }, sized(h('span', { class: 'meter-fill' }), 'left', score)),
    h('div', { class: 'meter-scale', 'aria-hidden': 'true' }, h('span', null, '0'), h('span', null, 'fejlesztendő | átlag | felső negyed'), h('span', null, '100')));
}
const ADVICE = {
  mobility: 'Minden nap 10 perc célzott mobilitás jut rá, a leggyengébb ízületre szabva.',
  flexibility: 'A napi blokkban a nyújtások a gyengébb izomcsoportra kerülnek; tartsd ki a teljes időt, rugózás nélkül.',
  strength: 'Hetente háromszor erőedzés, és amint egy szint könnyű, lépsz a következőre.',
  core: 'Plank- és dead bug-változatok minden erő- és gyorsasági napon.',
  power: 'Heti két gyorsasági nap ugrásokkal és rövid, maximális sebességű szakaszokkal.',
  balance: 'Egylábas gyakorlatok szinte minden nap; ezek a hétköznapi sérülésvédelemben is számítanak.',
  cardio: 'A gyorsasági napok intervallumai mellett heti 2–3 alkalom 30 perces tempós séta, kerékpár vagy futás javítja leginkább.',
};

export async function resultView(id) {
  const all = await assessments();
  const item = id ? all.find(a => a.id === id) : all[0];
  if (!item) return page('Eredmény', h('p', null, 'Még nincs kiértékelt felmérés.'), link('#/assess', 'Felmérés indítása', 'btn primary'));
  const ev = evaluateItem(item), prevItem = all[all.indexOf(item) + 1], prev = prevItem ? evaluateItem(prevItem) : null;
  const areas = D.tests.areas.filter(a => ev.areas[a.id]);
  const prog = await getProgram();
  const p = item.profile;
  const axes = areas.map(a => ({ label: a.short, value: ev.areas[a.id].score, prev: prev && prev.areas[a.id] ? prev.areas[a.id].score : null }));
  const progBtn = btn(prog ? 'Program frissítése ebből a felmérésből' : 'Program készítése', async () => {
    await programFromAssessment(item); toast(prog ? 'A program frissült, új 6 hetes ciklus indul.' : 'Kész a programod.'); location.hash = '#/program';
  }, 'primary');
  const ageDiff = ev.fitnessAge != null ? p.age - ev.fitnessAge : null;
  return page('Eredmény',
    h('p', { class: 'muted' }, `${fmtDate(item.date)} · ${p.age} éves ${p.sex === 'female' ? 'nő' : 'férfi'}, a korosztályod normáihoz mérve`),
    card(axes.length >= 3 ? radar(axes, { label: 'Területek pontszáma: ' + axes.map(a => `${a.label} ${a.value}`).join(', ') }) : null,
      h('div', { class: 'legend' }, h('span', null, 'most'), h('span', { class: 'lg-ref' }, 'korosztályos átlag (50)'), prev ? h('span', { class: 'lg-prev' }, 'előző felmérés') : null),
      h('div', { class: 'stat-row' },
        h('div', { class: 'stat' }, h('span', { class: 'muted' }, 'Fittségi kor'), h('strong', null, ev.fitnessAge != null ? ev.fitnessAge + ' év' : '–'),
          h('span', { class: 'small muted' }, ev.fitnessAge == null ? 'Add meg az alapadatokat.' : ageDiff > 0 ? `${ageDiff} évvel fiatalabb a korodnál` : ageDiff < 0 ? `${-ageDiff} évvel idősebb a korodnál` : 'pont a korodnak megfelelő')),
        h('div', { class: 'stat' }, h('span', { class: 'muted' }, 'Összesített'), h('strong', null, ev.overall != null ? String(ev.overall) : '–'),
          ev.overall != null ? levelBadge(lvl(ev.overall), LEVEL_NAMES[lvl(ev.overall)]) : null)),
      ev.vo2 != null ? h('p', { class: 'small muted' }, `Becsült VO₂max: ${fmtNum(ev.vo2)} ml/kg/perc (edzés nélküli becslés, ±5–6 ml pontosságú).`) : null),
    ev.pain.length ? note('Fájdalmat jeleztél: ' + ev.pain.map(t => D.test[t].name.toLowerCase()).join(', ') + '. Ezt érdemes orvossal vagy gyógytornásszal megnézetni; a programban a kapcsolódó gyakorlatok a legkönnyebb szinten indulnak.', 'warn') : null,
    card(h('h2', null, 'Területenként'), h('p', { class: 'small muted' }, 'Cél: minden terület legalább a korosztályos szinten (40 fölött), utána a felső negyedben (75 fölött).'),
      areas.map(a => { const r = ev.areas[a.id], pr = prev && prev.areas[a.id]; return h('div', { class: 'area-row' },
        h('div', { class: 'area-top' }, h('span', null, a.name), h('span', null, String(r.score) + (pr ? ` (${r.score - pr.score >= 0 ? '+' : ''}${r.score - pr.score})` : ''), ' ', levelBadge(r.level, LEVEL_NAMES[r.level]))),
        meter(r.score), h('p', { class: 'small muted' }, a.about)); })),
    ev.weakest.length ? card(h('h2', null, 'Erre fókuszálunk'), ev.weakest.map(a => h('p', null, h('strong', null, D.area[a].name + ': '), ADVICE[a]))) : null,
    card(h('h2', null, 'Tesztek'), h('table', { class: 'tests-table' },
      h('thead', null, h('tr', null, h('th', null, 'Teszt'), h('th', null, 'Eredmény'), h('th', null, 'Pont'))),
      h('tbody', null, D.tests.tests.filter(t => ev.tests[t.id]).map(t => { const s = ev.tests[t.id]; return h('tr', null,
        h('td', null, t.name, h('br'), h('span', { class: 'small muted' }, s.kind === 'norm' ? QUALITY[s.quality] + (s.outside ? ', korsávon kívül' : '') : s.kind === 'criterion' ? 'funkcionális küszöb' : 'saját alapvonal')),
        h('td', null, t.input.type === 'choice' ? s.value + ' / 3' : fmtNum(s.value) + ' ' + t.input.unit),
        h('td', null, s.score != null ? (s.kind === 'norm' ? s.score + '. pc.' : String(s.score)) : '–')); }))),
      h('details', null, h('summary', null, 'Források és pontosság'),
        h('p', { class: 'small' }, 'A „pc.” percentilist jelent: 60. pc. = a korosztályod 60%-ánál jobb eredmény. A funkcionális küszöbök kortól függetlenek (például a teljes mély guggolás minden felnőttnek elérhető cél).'),
        h('ul', { class: 'plain small' }, Object.entries(D.norms.tests).map(([k, n]) => h('li', null, h('strong', null, D.test[k].name + ': '), n.source)), h('li', null, D.norms.vo2.source)),
        h('p', { class: 'small muted' }, 'Szakember még nem lektorálta. A Forma nem orvosi eszköz.'))),
    card(h('p', null, prog ? 'A programod szintjei nem csökkennek, a mobilitási fókusz és a gyakorlatok igazodnak az új eredményhez.' : 'A program a gyenge területekre több időt szán, és a mért szintedről indul.'), h('div', { class: 'row' }, progBtn)));
}
const lvl = s => (s >= D.norms.levels.top ? 'top' : s >= D.norms.levels.low ? 'mid' : 'low');
