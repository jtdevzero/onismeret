/* Futóprogram nulláról 5 km-ig: vezetett intervallumok hangos bemondással; a végén kardióként naplóz és továbblép. */
import { h, clear, uid, toast } from './dom.js';
import { page, card, btn, link, note, speak, beep, tickMs } from './widgets.js';
import { kvGet, kvSet, itemPut } from './store.js';
import { runSession, totalSeconds, runSeconds, describe, nextRun, repeatWeek, RUN_WEEKS, RUN_DAYS } from '../core/runplan.js';

const LABEL = { warm: 'Bemelegítő séta', walk: 'Séta', run: 'Futás', cool: 'Levezető séta' };
const SAY = { warm: 'Bemelegítő séta, öt perc.', walk: 'Most sétálj.', run: 'Most fuss!', cool: 'Kész a futás. Levezető séta.' };
const fmt = s => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
export const getRun = async () => (await kvGet('run', null)) || { week: 1, day: 1, done: false };

export async function runView(arg, onCleanup) {
  const st = await getRun();
  if (st.done) {
    return page('Futóprogram', card(h('h2', null, 'Megvan a 30 perces futás! 🎉'), h('p', null, 'Végigcsináltad a 9 hetes programot. Tartsd meg heti 2–3 futással, vagy kezdd újra gyorsabb tempóval.'),
      h('div', { class: 'row' }, btn('Újrakezdés', async () => { await kvSet('run', { week: 1, day: 1, done: false }); location.hash = '#/run'; dispatchEvent(new HashChangeEvent('hashchange')); }), link('#/cardio', 'Kardió', 'btn'))));
  }
  const segs = runSession(st.week, st.day), total = totalSeconds(segs);
  let i = 0, left = segs[0].seconds, elapsed = 0, timer = null, wake = null, finished = false;
  const voice = h('input', { type: 'checkbox', checked: true });
  const bar = h('progress', { max: total, value: 0, 'aria-label': 'Az alkalom előrehaladása' });
  const kicker = h('p', { class: 'workout-kicker' }), clock = h('div', { class: 'workout-clock', role: 'timer' }), next = h('p', { class: 'muted' });
  const stage = h('div', { class: 'workout', 'aria-live': 'polite' });
  const stop = () => { if (timer) { clearInterval(timer); timer = null; } };
  const release = () => { stop(); if (wake) { wake.release().catch(() => {}); wake = null; } };
  onCleanup(release);

  const draw = () => {
    const s = segs[i];
    kicker.textContent = `${LABEL[s.type]} · ${i + 1}. szakasz a ${segs.length}-ből`;
    clock.textContent = fmt(left);
    clock.classList.toggle('run', s.type === 'run');
    const n = segs[i + 1];
    next.textContent = n ? `Következik: ${LABEL[n.type]}, ${fmt(n.seconds)}` : 'Ez az utolsó szakasz.';
    bar.value = elapsed;
  };
  const enter = () => { left = segs[i].seconds; draw(); speak(SAY[segs[i].type], voice.checked); beep(segs[i].type === 'run' ? 880 : 520, 250); };
  const tick = () => {
    left--; elapsed++;
    if (left === 10 && segs[i + 1]) speak(`Tíz másodperc, aztán ${segs[i + 1].type === 'run' ? 'futás' : 'séta'}.`, voice.checked);
    if (left <= 0) { i++; if (i >= segs.length) { finish(false); return; } enter(); return; }
    draw();
  };
  async function finish(partial) {
    if (finished) return;
    finished = true; release();
    const minutes = Math.max(1, Math.round(elapsed / 60));
    await itemPut({ id: uid(), kind: 'cardio', date: Date.now(), type: 'run', minutes, intensity: 'moderate', plan: { week: st.week, day: st.day }, partial });
    if (!partial) await kvSet('run', nextRun(st));
    speak(partial ? 'Leállítva. A naplóba bekerült.' : 'Szép munka! Kész a mai futás.', voice.checked);
    clear(stage).append(card(h('h2', null, partial ? 'Leállítva' : 'Kész a mai futás'),
      h('p', null, `${minutes} perc bekerült a kardió naplóba.` + (partial ? ' A program nem lépett tovább; legközelebb ugyanezt csinálod.' : '')),
      partial ? null : h('p', { class: 'small muted' }, 'Ha nagyon nehéz volt, ismételd meg ezt a hetet: ez teljesen rendben van.'),
      h('div', { class: 'row' }, link('#/cardio', 'Kardió', 'btn primary'),
        partial ? null : btn('Ezt a hetet megismétlem', async () => { await kvSet('run', repeatWeek(st)); toast('Rendben, a hét elejéről folytatod.'); location.hash = '#/run'; dispatchEvent(new HashChangeEvent('hashchange')); }))));
  }

  const go = btn('Indítás', () => {
    go.hidden = true; pause.hidden = false; end.hidden = false;
    /* a képernyő ébren tartása a háttérben: az időzítő nem vár rá (egyes böngészőkben sokáig nem válaszol) */
    try { navigator.wakeLock.request('screen').then(w => { if (finished) w.release().catch(() => {}); else wake = w; }, () => {}); } catch { wake = null; }
    enter();
    timer = setInterval(tick, tickMs());
  }, 'primary');
  const pause = btn('Szünet', () => { if (timer) { stop(); pause.textContent = 'Folytatás'; } else { pause.textContent = 'Szünet'; timer = setInterval(tick, tickMs()); } });
  const end = btn('Befejezés most', () => { if (confirm('Befejezed most? Az eddigi idő bekerül a naplóba, de a program nem lép tovább.')) finish(true); }, 'small');
  pause.hidden = true; end.hidden = true;
  draw();
  stage.append(card(kicker, clock, next, h('div', { class: 'row' }, go, pause, end)));

  return page('Futóprogram',
    h('p', { class: 'muted' }, `${st.week}. hét / ${RUN_WEEKS}, ${st.day}. alkalom / ${RUN_DAYS} · ${Math.round(total / 60)} perc, ebből ${Math.round(runSeconds(segs) / 60)} perc futás`),
    card(h('h2', null, 'A mai alkalom'), h('p', null, describe(segs)), h('p', { class: 'small muted' }, 'Előtte 5 perc bemelegítő séta, utána 5 perc levezetés. A futás legyen olyan tempójú, hogy közben még tudj beszélni (2. zóna). Két futás között legyen legalább egy pihenőnap.')),
    bar, h('div', { class: 'row tight workout-meta' }, h('span', { class: 'muted small' }, 'Telefon a zsebben is mehet: hangosan szólok a váltásoknál.'), h('label', { class: 'check' }, voice, h('span', null, 'Hangos bemondás'))),
    note('Ha mellkasi fájdalmat, szédülést vagy szokatlan légszomjat érzel, azonnal állj meg. Ízületi fájdalomnál válts sétára.', 'small'),
    stage);
}
