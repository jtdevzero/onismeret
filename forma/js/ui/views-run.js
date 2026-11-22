/* Futóprogram nulláról 5 km-ig: vezetett intervallumok hangos bemondással; a végén kardióként naplóz és továbblép. */
import { h, clear, uid, toast } from './dom.js';
import { page, card, btn, link, note, speak, beep, tickMs, openMotion, artBanner } from './widgets.js';
import { stepCount } from '../core/sensors.js';
import { kvGet, kvSet, itemPut } from './store.js';
import { runSession, totalSeconds, runSeconds, describe, nextRun, repeatWeek, RUN_WEEKS, RUN_DAYS } from '../core/runplan.js';
import { tr } from './i18n.js';

const LABEL = { warm: tr('Bemelegítő séta'), walk: tr('Séta'), run: tr('Futás'), cool: tr('Levezető séta') };
const SAY = { warm: tr('Bemelegítő séta, öt perc.'), walk: tr('Most sétálj.'), run: tr('Most fuss!'), cool: tr('Kész a futás. Levezető séta.') };
const fmt = s => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
export const getRun = async () => (await kvGet('run', null)) || { week: 1, day: 1, done: false };

export async function runView(arg, onCleanup) {
  const st = await getRun();
  if (st.done) {
    return page(tr('Futóprogram'), card(h('h2', null, tr('Megvan a 30 perces futás! 🎉')), h('p', null, tr('Végigcsináltad a 9 hetes programot. Tartsd meg heti 2–3 futással, vagy kezdd újra gyorsabb tempóval.')),
      h('div', { class: 'row' }, btn(tr('Újrakezdés'), async () => { await kvSet('run', { week: 1, day: 1, done: false }); location.hash = '#/run'; dispatchEvent(new HashChangeEvent('hashchange')); }), link('#/cardio', tr('Kardió'), 'btn'))));
  }
  const segs = runSession(st.week, st.day), total = totalSeconds(segs);
  let i = 0, left = segs[0].seconds, elapsed = 0, timer = null, wake = null, finished = false;
  const voice = h('input', { type: 'checkbox', checked: true });
  const bar = h('progress', { max: total, value: 0, 'aria-label': tr('Az alkalom előrehaladása') });
  const kicker = h('p', { class: 'workout-kicker' }), clock = h('div', { class: 'workout-clock', role: 'timer' }), next = h('p', { class: 'muted' });
  const stage = h('div', { class: 'workout', 'aria-live': 'polite' });
  /* metronóm és kadencia (lépés/perc) a mozgásérzékelőből */
  let metro = null, motion = null;
  const bpmSel = h('select', { 'aria-label': tr('Metronóm üteme') }, [['0', tr('Metronóm ki')], ['160', tr('{p0} /perc', { p0: 160 })], ['170', tr('{p0} /perc', { p0: 170 })], ['180', tr('{p0} /perc', { p0: 180 })]].map(([v, t]) => h('option', { value: v }, t)));
  const cad = h('p', { class: 'small muted', 'aria-live': 'off' });
  const setMetro = () => { if (metro) { clearInterval(metro); metro = null; } const b = Number(bpmSel.value); if (b && timer) metro = setInterval(() => beep(1200, 25), 60000 / b); };
  bpmSel.addEventListener('change', setMetro);
  const stop = () => { if (timer) { clearInterval(timer); timer = null; } if (metro) { clearInterval(metro); metro = null; } };
  const release = () => { stop(); if (wake) { wake.release().catch(() => {}); wake = null; } if (motion) { motion.stop(); motion = null; } };
  onCleanup(release);

  const draw = () => {
    const s = segs[i];
    kicker.textContent = tr('{p0} · {p1}. szakasz a {p2}-ből', { p0: LABEL[s.type], p1: i + 1, p2: segs.length });
    clock.textContent = fmt(left);
    clock.classList.toggle('run', s.type === 'run');
    const n = segs[i + 1];
    next.textContent = n ? tr('Következik: {p0}, {p1}', { p0: LABEL[n.type], p1: fmt(n.seconds) }) : tr('Ez az utolsó szakasz.');
    bar.value = elapsed;
  };
  const enter = () => { left = segs[i].seconds; draw(); speak(SAY[segs[i].type], voice.checked); beep(segs[i].type === 'run' ? 880 : 520, 250); };
  const tick = () => {
    left--; elapsed++;
    if (left === 10 && segs[i + 1]) speak(tr('Tíz másodperc, aztán {p0}.', { p0: segs[i + 1].type === 'run' ? 'futás' : 'séta' }), voice.checked);
    if (left <= 0) { i++; if (i >= segs.length) { finish(false); return; } enter(); return; }
    if (motion && elapsed % 5 === 0) { const s = motion.samples, recent = s.filter(p => p.t >= s[s.length - 1].t - 15); const c = stepCount(recent); cad.textContent = c.cadence ? tr('Kadencia: {p0} lépés/perc (cél futásnál 165–180)', { p0: c.cadence }) : ''; if (s.length > 6000) s.splice(0, s.length - 3000); }
    draw();
  };
  async function finish(partial) {
    if (finished) return;
    finished = true; release();
    const minutes = Math.max(1, Math.round(elapsed / 60));
    await itemPut({ id: uid(), kind: 'cardio', date: Date.now(), type: 'run', minutes, intensity: 'moderate', plan: { week: st.week, day: st.day }, partial });
    if (!partial) await kvSet('run', nextRun(st));
    speak(partial ? tr('Leállítva. A naplóba bekerült.') : tr('Szép munka! Kész a mai futás.'), voice.checked);
    clear(stage).append(card(h('h2', null, partial ? tr('Leállítva') : tr('Kész a mai futás')),
      h('p', null, tr('{p0} perc bekerült a kardió naplóba.', { p0: minutes }) + (partial ? tr(' A program nem lépett tovább; legközelebb ugyanezt csinálod.') : '')),
      partial ? null : h('p', { class: 'small muted' }, tr('Ha nagyon nehéz volt, ismételd meg ezt a hetet: ez teljesen rendben van.')),
      h('div', { class: 'row' }, link('#/cardio', tr('Kardió'), 'btn primary'),
        partial ? null : btn(tr('Ezt a hetet megismétlem'), async () => { await kvSet('run', repeatWeek(st)); toast('Rendben, a hét elejéről folytatod.'); location.hash = '#/run'; dispatchEvent(new HashChangeEvent('hashchange')); }))));
  }

  const go = btn(tr('Indítás'), () => {
    go.hidden = true; pause.hidden = false; end.hidden = false;
    /* a képernyő ébren tartása a háttérben: az időzítő nem vár rá (egyes böngészőkben sokáig nem válaszol) */
    try { navigator.wakeLock.request('screen').then(w => { if (finished) w.release().catch(() => {}); else wake = w; }, () => {}); } catch { wake = null; }
    enter();
    timer = setInterval(tick, tickMs());
    setMetro();
    openMotion().then(m => { motion = m; }, () => { motion = null; });
  }, 'primary');
  const pause = btn(tr('Szünet'), () => { if (timer) { stop(); pause.textContent = tr('Folytatás'); } else { pause.textContent = tr('Szünet'); timer = setInterval(tick, tickMs()); setMetro(); } });
  const end = btn(tr('Befejezés most'), () => { if (confirm(tr('Befejezed most? Az eddigi idő bekerül a naplóba, de a program nem lép tovább.'))) finish(true); }, 'small');
  pause.hidden = true; end.hidden = true;
  draw();
  stage.append(card(kicker, clock, next, cad, h('div', { class: 'row' }, go, pause, end), h('label', { class: 'field inline' }, tr('Ütem a futáshoz'), bpmSel)));

  return page(tr('Futóprogram'),
    artBanner('run', tr('9 hét, heti 3 alkalom'), tr('Nulláról 5 km-ig')),
    h('p', { class: 'muted' }, tr('{p0}. hét / {p1}, {p2}. alkalom / {p3} · {p4} perc, ebből {p5} perc futás', { p0: st.week, p1: RUN_WEEKS, p2: st.day, p3: RUN_DAYS, p4: Math.round(total / 60), p5: Math.round(runSeconds(segs) / 60) })),
    card(h('h2', null, tr('A mai alkalom')), h('p', null, describe(segs)), h('p', { class: 'small muted' }, tr('Előtte 5 perc bemelegítő séta, utána 5 perc levezetés. A futás legyen olyan tempójú, hogy közben még tudj beszélni (2. zóna). Két futás között legyen legalább egy pihenőnap.'))),
    bar, h('div', { class: 'row tight workout-meta' }, h('span', { class: 'muted small' }, tr('Telefon a zsebben is mehet: hangosan szólok a váltásoknál.')), h('label', { class: 'check' }, voice, h('span', null, tr('Hangos bemondás')))),
    note(tr('Ha mellkasi fájdalmat, szédülést vagy szokatlan légszomjat érzel, azonnal állj meg. Ízületi fájdalomnál válts sétára.'), 'small'),
    stage);
}
