/* Heti áttekintés, levezetés edzés után, napi fehérje- és vízcél. */
import { h, clear, fmtDate } from './dom.js';
import { page, card, btn, link, note, list, speak, beep, tickMs } from './widgets.js';
import { D } from './data.js';
import { kvGet, kvSet, itemsAll } from './store.js';
import { getProgram } from './state.js';
import { weeklyReview, cooldownSteps, nutritionTargets, dayKey } from '../core/wellness.js';
import { bodyTrend } from '../core/achievements.js';
import { weekStart } from '../core/cardio.js';
import { figureAnim } from './figure.js';

const DAY = 86400000;

function reviewBody(r) {
  return [
    h('div', { class: 'stat-row' },
      h('div', { class: 'stat' }, h('span', { class: 'muted' }, 'Edzés'), h('strong', null, `${r.workouts} / ${r.goal}`)),
      h('div', { class: 'stat' }, h('span', { class: 'muted' }, 'Kardió'), h('strong', null, `${r.cardio} p`))),
    r.wins.length ? h('div', null, h('h3', null, 'Ami sikerült'), list(r.wins)) : null,
    r.misses.length ? h('div', null, h('h3', null, 'Ami elmaradt'), list(r.misses)) : null,
    h('h3', null, 'Fókusz a jövő hétre'), h('p', { class: 'lead' }, r.focus),
  ];
}

/* Kezdőlapi kártya: hétfőn és vasárnap, amíg el nem olvasod. → elem vagy null */
export async function reviewCard(items, { compact = false } = {}) {
  const now = new Date(), wd = now.getDay();
  if (wd !== 0 && wd !== 1) return null;
  /* vasárnap az aktuális, hétfőn az előző hét */
  const start = wd === 0 ? weekStart(now.getTime()) : weekStart(now.getTime()) - 7 * DAY;
  if ((await kvGet('reviewSeen', 0)) === start) return null;
  const r = weeklyReview(items, { start });
  if (r.empty) return null;
  const title = h('h2', null, wd === 0 ? 'Az e heti áttekintésed' : 'A múlt heted');
  const el = h(compact ? 'details' : 'section', { class: compact ? 'card home-summary' : 'card accent' }, compact ? h('summary', null, title) : title, ...reviewBody(r),
    h('div', { class: 'row' }, btn('Rendben', async () => { await kvSet('reviewSeen', start); el.remove(); }, 'primary'), link('#/review', 'Korábbi hetek', 'btn small')));
  return el;
}

export async function reviewView() {
  const items = await itemsAll(), now = Date.now();
  const weeks = [0, 1, 2, 3].map(i => weeklyReview(items, { start: weekStart(now) - i * 7 * DAY }));
  return page('Heti áttekintés',
    weeks.map((r, i) => card(h('h2', null, i === 0 ? 'Ez a hét (eddig)' : `${fmtDate(r.start)} – ${fmtDate(r.end - DAY)}`), r.empty ? h('p', { class: 'muted' }, 'Nincs bejegyzés.') : reviewBody(r))));
}

import { remaining } from '../core/session.js';

/* Levezetés: nyújtás és lassú légzés, időzítővel. */
export async function cooldownView(arg, onCleanup) {
  const prog = await getProgram();
  const steps = cooldownSteps((prog && prog.targets) || []).flatMap(s => (s.perSide ? [{ ...s, side: 'bal oldal' }, { ...s, side: 'jobb oldal' }] : [s]));
  let i = 0, left = 0, timer = null;
  const stage = h('div', { class: 'workout', 'aria-live': 'polite' });
  const stop = () => { if (timer) { clearInterval(timer); timer = null; } };
  onCleanup(stop);
  const show = () => {
    stop();
    if (i >= steps.length) { clear(stage).append(card(h('h2', null, 'Kész a levezetés'), h('p', null, 'Igyál egy pohár vizet. Jó regenerálódást!'), h('div', { class: 'row' }, link('#/', 'Kezdőlap', 'btn primary')))); speak('Kész a levezetés.'); return; }
    const st = steps[i], ex = D.ex[st.id];
    left = st.seconds;
    const clock = h('div', { class: 'workout-clock' }, String(left));
    clear(stage).append(card(h('p', { class: 'workout-kicker' }, `${i + 1} / ${steps.length}` + (st.side ? ' · ' + st.side : '')), h('h2', { class: 'workout-title' }, ex.name),
      figureAnim(D.figures[ex.figure], { compact: true }), clock, h('p', { class: 'small' }, ex.how),
      h('div', { class: 'row' }, btn('Tovább', () => { i++; show(); }, 'primary'))));
    speak(ex.name + (st.side ? ', ' + st.side : ''));
    const deadline = Date.now() + left * tickMs();
    timer = setInterval(() => { left = remaining(deadline, Date.now(), tickMs()); clock.textContent = String(left); if (left <= 0) { beep(520, 200); i++; show(); } }, tickMs());
  };
  show();
  const hidden = () => { if (document.hidden && timer) { stop(); stage.append(note('A levezetés szünetel.', 'small'), btn('Aktuális nyújtás újrakezdése', show)); } };
  document.addEventListener('visibilitychange', hidden); onCleanup(() => document.removeEventListener('visibilitychange', hidden));
  return page('Levezetés', h('p', { class: 'muted' }, 'Kb. 4 perc nyújtás és lassú légzés: segít lecsendesedni, és csökkenti a másnapi merevséget.'), stage);
}

/* Napi fehérje- és vízcél a kezdőlapon (a legutóbbi testsúlyból). */
export async function nutritionCard(items) {
  const body = bodyTrend(items), t = body.weight ? nutritionTargets(body.weight.value) : null;
  if (!t) return card(h('h2', null, 'Fehérje és víz'), h('p', { class: 'small muted' }, 'Add meg a testsúlyod a Fejlődés oldalon, és kiszámolom a napi fehérje- és vízcélodat.'), h('div', { class: 'row' }, link('#/progress', 'Testsúly megadása', 'btn small')));
  const all = (await kvGet('nutrition', {})) || {}, key = dayKey();
  const today = { p: 0, w: 0, ...(all[key] || {}) };
  const save = async () => {
    const keep = Object.fromEntries(Object.entries({ ...all, [key]: today }).sort().slice(-60)); /* az utolsó 60 nap */
    await kvSet('nutrition', keep);
  };
  const row = (k, label, goal, unit) => {
    const val = h('strong', null, `${today[k]} / ${goal}`);
    const bar = h('progress', { max: goal, value: Math.min(goal, today[k]), 'aria-label': `${label}: ${today[k]} a ${goal}-ből` });
    const set = d => { today[k] = Math.max(0, Math.min(goal * 2, today[k] + d)); val.textContent = `${today[k]} / ${goal}`; bar.value = Math.min(goal, today[k]); save(); };
    return h('div', { class: 'goal' }, h('div', { class: 'row tight nut-row' }, h('span', null, label + ' ', val, h('span', { class: 'small muted' }, ' ' + unit)),
      btn('−', () => set(-1), 'small'), btn('+', () => set(1), 'small primary')), bar);
  };
  return card(h('h2', null, 'Fehérje és víz ma'),
    row('p', 'Fehérjeadag', t.portions, `(kb. 30 g, összesen ~${t.protein} g)`),
    row('w', 'Pohár víz', t.glasses, `(2,5 dl, összesen ~${(t.waterMl / 1000).toFixed(1).replace('.', ',')} l)`),
    note('Általános irányelv rendszeresen edzőknek (1,6 g fehérje/ttkg, 33 ml víz/ttkg). Vese- vagy szívbetegség esetén kérdezd meg az orvosod.', 'small'));
}
