/* Pályanap: bemelegítés sícipőben, napi napló, és a nap elemzései egy helyen. */
import { h, clear, uid, fmtDate } from './dom.js';
import { page, card, btn, link, note, tickMs } from './widgets.js';
import { D, S } from './data.js';
import { itemsAll, itemPut, kvGet, kvSet } from './store.js';
import { speak } from './live.js';
import { sameDay, runsOfDay, cleanDay } from '../core/progress.js';

/* Tömör, gombszerű választó (a választás egy rádiógomb-csoport, billentyűzettel is kezelhető). */
const seg = (name, labels, value, onchange) => h('div', { class: 'seg', role: 'radiogroup' }, labels.map((label, i) =>
  h('label', null, h('input', { type: 'radio', name, value: i, checked: i === value, onchange: () => onchange(i) }), h('span', null, label))));
const clockText = s => (s >= 60 ? Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0') : String(s));

function warmupCard(onCleanup) {
  const steps = D.slope.warmup[S.settings.sport] || D.slope.warmup.ski;
  const totalSec = steps.reduce((a, s) => a + s.seconds, 0);
  const voice = h('input', { type: 'checkbox', checked: true });
  const box = h('div', { class: 'workout', 'aria-live': 'polite' });
  let at = 0, left = 0, timer = null;
  const stop = () => { if (timer) { clearInterval(timer); timer = null; } };
  onCleanup(() => { stop(); try { if ('speechSynthesis' in window) speechSynthesis.cancel(); } catch { /* a hang nem létfontosságú */ } });
  const intro = () => clear(box).append(
    h('p', null, `${steps.length} rövid mozdulat, nagyjából ${Math.round(totalSec / 60)} perc, a pálya tetején, felcsatolt léccel vagy a deszka mellett. Hideg izommal az első lesiklás a legkockázatosabb.`),
    h('ol', { class: 'blocks' }, steps.map(s => h('li', null, s.name, h('span', { class: 'muted' }, ' · ' + s.seconds + ' mp')))),
    h('div', { class: 'row' }, btn('Bemelegítés indítása', () => { at = 0; show(); }, 'primary'), h('label', { class: 'check' }, voice, h('span', null, 'Hangos bemondás'))));
  const done = () => {
    stop();
    speak('Kész. Az első lesiklás legyen könnyű terepen, lazán.', voice.checked);
    clear(box).append(h('h3', null, 'Kész a bemelegítés'), h('p', null, 'Az első lesiklás legyen könnyű terepen, lazán, rövid kanyarokkal.'), btn('Újra', intro));
  };
  const show = () => {
    stop();
    if (at >= steps.length) return done();
    const st = steps[at];
    left = st.seconds;
    const clock = h('div', { class: 'workout-clock', role: 'timer' }, clockText(left));
    clear(box).append(
      h('p', { class: 'workout-kicker' }, `${at + 1}. / ${steps.length}`), h('h3', { class: 'workout-title' }, st.name), clock, h('p', null, st.cue),
      h('div', { class: 'row' }, at > 0 ? btn('Vissza', () => { at--; show(); }, 'small') : null, btn('Tovább', () => { at++; show(); }, 'primary'), btn('Leállítás', () => { stop(); intro(); }, 'small')));
    speak(st.name + '. ' + st.cue, voice.checked);
    timer = setInterval(() => {
      left--; clock.textContent = clockText(Math.max(0, left));
      if (left <= 0) { at++; show(); }
    }, tickMs());
  };
  intro();
  return card(h('h2', null, 'Bemelegítés sícipőben'), box);
}

async function journalCard(items) {
  const today = items.find(i => i.kind === 'day' && sameDay(i.date, Date.now()));
  const f = today ? { ...today } : { snow: null, vis: null, tired: null, runs: null, note: '' };
  const runs = h('input', { type: 'number', min: 0, max: 200, inputMode: 'numeric', value: f.runs ?? '' });
  const text = h('textarea', { rows: 3, maxLength: 300, placeholder: 'Mit gyakoroltál, mi ment jól, mire figyelj legközelebb?' });
  text.value = f.note || '';
  const msg = h('p', { 'aria-live': 'polite' });
  const save = async () => {
    const clean = cleanDay({ ...f, runs: runs.value === '' ? null : Number(runs.value), note: text.value }, D.slope);
    const item = { ...(today || { id: uid(), kind: 'day', date: Date.now() }), sport: S.settings.sport, ...clean };
    await itemPut(item);
    clear(msg).append('Elmentve a naplóba.',
      clean.tired != null && clean.tired >= 3 ? note('Fáradtan nő a sérülés kockázata, főleg a nap végén. Ha ma még csúszol, válassz könnyebb terepet, és tarts pihenőt.', 'warn') : null);
  };
  return card(h('h2', null, today ? 'Mai napló (szerkesztés)' : 'Mai napló'),
    h('h3', null, 'Milyen volt a hó?'), seg('snow', D.slope.snow, f.snow, v => { f.snow = v; }),
    h('h3', null, 'Látási viszonyok'), seg('vis', D.slope.visibility, f.vis, v => { f.vis = v; }),
    h('h3', null, 'Mennyire fáradtál el?'), seg('tired', D.slope.tired, f.tired, v => { f.tired = v; }),
    h('label', { class: 'field' }, h('span', null, 'Hány lesiklás (nem kötelező)'), runs),
    h('label', { class: 'field' }, h('span', null, 'Jegyzet'), text),
    btn('Mentés', save, 'primary'), msg);
}

export async function slopeView(_, onCleanup) {
  const items = await itemsAll();
  const runs = runsOfDay(items, { date: Date.now() });
  return page('Pályanap',
    h('p', { class: 'muted' }, 'Bemelegítés a hegyen, a nap jegyzetei és a mai elemzéseid egy helyen.'),
    warmupCard(onCleanup),
    await journalCard(items),
    card(h('h2', null, 'Mai elemzések'),
      runs.length ? h('ul', { class: 'rows' }, runs.map(r => h('li', null, link('#/a/' + r.id, fmtDate(r.date) + ' · ' + r.coach.main_issue.what)))) : h('p', { class: 'muted' }, 'Ma még nem töltöttél fel videót.'),
      h('div', { class: 'row' }, link('#/snow', 'Videó elemzése', 'btn'), runs.length ? link('#/day', 'Mai terv a hegyen', 'btn') : null)));
}
