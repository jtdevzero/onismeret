/* Pulzusmérés kamerával, regenerációs pontszám, 30 napos kihívások, szezonális blokkok, kihíváskód, nyomtatható összefoglaló. */
import { h, clear, uid, fmtDate, toast } from './dom.js';
import { applyBlocks } from '../core/content-i18n.js';
import { page, card, btn, link, note, list, speak, beep, openPpg, celebrate, fmtNum } from './widgets.js';
import { D, profile } from './data.js';
import { kvGet, kvSet, itemPut, itemsAll } from './store.js';
import { assessments, evaluateItem, workouts } from './state.js';
import { bpmFromSignal } from '../core/sensors.js';
import { recoveryScore, CHALLENGES, challengeDose, challengeDay, encodeChallenge, decodeChallenge } from '../core/extras.js';
import { latestValue, LOWER_BETTER } from '../core/achievements.js';
import { figureAnim } from './figure.js';
import { tr } from './i18n.js';

const reload = hash => { location.hash = hash; dispatchEvent(new HashChangeEvent('hashchange')); };
const DAY = 86400000;

/* ---- pulzus ---- */
export async function pulseView(arg, onCleanup) {
  const past = (await itemsAll('pulse')).slice(0, 7);
  const out = h('div', { 'aria-live': 'polite' }), clock = h('div', { class: 'workout-clock' }, '30'), status = h('p', { class: 'small muted' });
  let cam = null, stopped = false;
  onCleanup(() => { stopped = true; if (cam) cam.close(); });
  const go = btn(tr('Mérés indítása'), async () => {
    go.disabled = true; clear(out);
    try { cam = await openPpg(); } catch (e) { status.textContent = e && e.code === 'camera_denied' ? tr('Nem kaptam engedélyt a kamerához.') : tr('Ezen a készüléken nem érhető el a hátsó kamera.'); go.disabled = false; return; }
    status.textContent = cam.torch ? tr('Tartsd az ujjad nyugodtan a lencsén és a vakun.') : tr('A vakut nem tudom bekapcsolni: mérj világos helyen, ujjal a lencsén.');
    const t = [], v = [];
    const T = 30;
    for (;;) {
      if (stopped) return;
      const f = await cam.read();
      t.push(f.t); v.push(f.v);
      clock.textContent = String(Math.max(0, Math.ceil(T - f.t)));
      if (f.t >= T) break;
    }
    cam.close(); cam = null; go.disabled = false; beep(520, 250);
    const r = bpmFromSignal(t, v);
    if (!r || r.quality < 0.4) { clear(out).append(note(tr('Nem sikerült megbízható jelet kapni. Takard le teljesen a lencsét az ujjbegyeddel, ne nyomd erősen, és ne mozogj.'), 'warn')); return; }
    await itemPut({ id: uid(), kind: 'pulse', date: Date.now(), bpm: r.bpm, quality: r.quality });
    speak(tr('{p0} ütés percenként.', { p0: r.bpm }));
    clear(out).append(card(h('p', { class: 'lead' }, tr('{p0} ütés/perc', { p0: r.bpm })), h('p', { class: 'small muted' }, tr('Jelminőség: {p0}%. A regenerációs pontszám a reggeli pulzust a saját átlagodhoz méri.', { p0: Math.round(r.quality * 100) }))));
  }, 'primary');
  return page(tr('Reggeli pulzus'),
    h('p', { class: 'muted' }, tr('Ébredés után, ülve vagy fekve: tedd a mutatóujjad a hátsó kamera lencséjére és a vakura, és tartsd 30 másodpercig. A kép nem kerül sehova, csak a fényerő változását mérem.')),
    card(clock, h('div', { class: 'row' }, go), status), out,
    past.length ? card(h('h2', null, tr('Korábbi mérések')), h('ul', { class: 'rows' }, past.map(p => h('li', null, h('span', null, fmtDate(p.date)), h('strong', null, tr('{p0} /perc', { p0: p.bpm })))))) : null,
    note(tr('Tájékoztató mérés, nem orvosi eszköz. Szabálytalan szívverés gyanújával fordulj orvoshoz.'), 'small'));
}

/* ---- regenerációs pontszám ---- */
export async function recoveryTileData(items) {
  return recoveryScore({ readiness: await kvGet('readiness', null), pulses: items.filter(i => i.kind === 'pulse'), workouts: items.filter(i => i.kind === 'workout') });
}
export async function recoveryCard(items) {
  const r = recoveryScore({ readiness: await kvGet('readiness', null), pulses: items.filter(i => i.kind === 'pulse'), workouts: items.filter(i => i.kind === 'workout') });
  const label = { go: tr('Mehet a teljes edzés'), light: tr('Könnyített edzés javasolt'), rest: tr('Ma inkább regenerálódj') };
  if (!r) return card(h('h2', null, tr('Regeneráció')), h('p', { class: 'small muted' }, tr('Ma nincs elég friss adat a regenerációs pontszámhoz. A korábbi edzésterhelés önmagában nem bizonyítja a mai állapotodat.')), h('div', { class: 'row' }, link('#/pulse', tr('Reggeli pulzus mérése'), 'btn small')));
  return card(h('div', { class: 'row tight' }, h('h2', null, tr('Regeneráció')), h('span', { class: 'badge ' + (r.level === 'go' ? 'good' : r.level === 'light' ? 'mid' : 'warn') }, `${r.score} / 100`)),
    h('p', null, label[r.level]), h('p', { class: 'small muted' }, r.parts.map(([n, v]) => n === tr('Reggeli pulzus') ? tr('{p0}: {p1}/perc az átlaghoz', { p0: n, p1: (v > 0 ? '+' : '') + v }) : n === tr('Terhelés (3 nap)') ? tr('{p0}: {p1} perc', { p0: n, p1: v }) : `${n}: ${v}%`).join(' · ')),
    h('p', { class: 'small muted' }, tr('Adatforrás: ') + [r.evidence.selfReport ? tr('mai önbevallás') : null,
      r.evidence.pulseComparison ? tr('reggeli pulzus összevetése') : null,
      r.evidence.trainingLoad ? tr('naplózott edzésterhelés') : null].filter(Boolean).join(' · ') +
      (r.confidence === 'limited' ? tr(' · Korlátozott bizonyosság: hiányzik a közérzet vagy az összevethető pulzus.') : '')),
    h('p', { class: 'small muted' }, tr('Tájékoztató szabályalapú becslés, nem egészségügyi diagnózis. A javaslatot te döntöd el.')),
    h('div', { class: 'row' }, link('#/pulse', tr('Reggeli pulzus'), 'btn small')));
}

/* ---- 30 napos kihívások ---- */
export async function challengeView() {
  const st = (await kvGet('challenge', null)) || null, items = await itemsAll('challenge');
  if (!st) {
    return page(tr('30 napos kihívás'), h('p', { class: 'muted' }, tr('Napi pár perc, fokozatosan emelkedő adaggal; minden 4. nap könnyebb.')),
      h('ul', { class: 'menu-list' }, CHALLENGES.map(c => h('li', null, h('a', { href: '#/challenge', onclick: async e => { e.preventDefault(); await kvSet('challenge', { id: c.id, start: Date.now() }); reload('#/challenge'); } },
        h('span', { class: 'routine-min' }, '30'), h('span', null, h('strong', null, c.name), h('span', { class: 'small' }, `${c.start} → kb. ${Math.min(c.max, c.start + c.step * 22)} ${c.unit}`)))))));
  }
  const ch = CHALLENGES.find(c => c.id === st.id), day = challengeDay(st.start), dose = challengeDose(ch, day);
  const doneDays = new Set(items.filter(i => i.challenge === st.id && i.date >= st.start).map(i => i.day));
  const ex = D.ex[ch.exercise];
  const grid = h('div', { class: 'ch-grid', role: 'list', 'aria-label': tr('A 30 nap') }, Array.from({ length: 30 }, (_, i) => h('span', { role: 'listitem', class: 'ch-day' + (doneDays.has(i + 1) ? ' done' : i + 1 === day ? ' today' : i + 1 < day ? ' missed' : ''), 'aria-label': tr('{p0}. nap{p1}', { p0: i + 1, p1: doneDays.has(i + 1) ? ', kész' : '' }) }, String(i + 1))));
  const finished = day > 30 || doneDays.size >= 30;
  return page(ch.name,
    h('p', { class: 'muted' }, finished ? tr('A 30 nap véget ért.') : tr('{p0}. nap a 30-ból · {p1} nap teljesítve', { p0: day, p1: doneDays.size })),
    card(grid),
    !finished && dose ? h('section', { class: 'card accent' }, h('h2', null, `Mai adag: ${dose.amount} ${ch.unit}` + (dose.easy ? tr(' (könnyített nap)') : '')),
      figureAnim(D.figures[ex.figure], { compact: true }), h('p', null, link('#/ex/' + ex.id, ex.name)),
      doneDays.has(day) ? h('p', { class: 'lead' }, tr('✓ Mára kész.')) : h('div', { class: 'row' }, btn(tr('Kész, megcsináltam'), async () => {
        await itemPut({ id: uid(), kind: 'challenge', date: Date.now(), challenge: st.id, day, amount: dose.amount });
        if (doneDays.size + 1 >= 30) celebrate();
        toast('Szép! Holnap folytatjuk.'); reload('#/challenge');
      }, 'primary'))) : card(h('p', { class: 'lead' }, tr('Teljesítve: {p0} / 30 nap.', { p0: doneDays.size }))),
    h('div', { class: 'row' }, btn(finished ? tr('Új kihívás') : tr('Kihívás feladása'), async () => { if (!finished && !confirm(tr('Feladod ezt a kihívást?'))) return; await kvSet('challenge', null); reload('#/challenge'); }, 'small')));
}

/* ---- szezonális blokkok ---- */
export async function blocksView() {
  const blocks = applyBlocks(await (await fetch(new URL('../../data/blocks.json', import.meta.url))).json(), D.content);
  const st = await kvGet('block', null);
  const R = Object.fromEntries(D.routines.map(r => [r.id, r]));
  if (st) {
    const b = blocks.blocks.find(x => x.id === st.id);
    if (b) {
      const total = b.weeks * b.perWeek, week = Math.floor((Date.now() - st.start) / (7 * DAY)) + 1;
      const next = R[b.routines[(st.done || 0) % b.routines.length]];
      const finished = (st.done || 0) >= total;
      return page(b.name, h('p', { class: 'muted' }, tr('{p0}. hét a {p1}-ből · {p2} / {p3} alkalom', { p0: Math.min(week, b.weeks), p1: b.weeks, p2: st.done || 0, p3: total })),
        h('progress', { max: total, value: st.done || 0, 'aria-label': tr('A blokk haladása') }),
        finished ? card(h('h2', null, tr('Kész a blokk! 🎉')), h('p', null, tr('Szép munka. Indíthatsz egy újat, vagy maradhatsz a forgó rendnél.')))
          : h('section', { class: 'card accent' }, h('h2', null, tr('Következő alkalom')), h('p', { class: 'lead' }, next.name), h('p', { class: 'small muted' }, next.about), h('div', { class: 'row' }, link('#/session/routine-' + next.id, tr('Indítás'), 'btn primary'))),
        h('div', { class: 'row' }, btn(finished ? tr('Új blokk') : tr('Blokk befejezése'), async () => { if (!finished && !confirm(tr('Befejezed ezt a blokkot?'))) return; await kvSet('block', null); reload('#/blocks'); }, 'small')));
    }
  }
  return page(tr('Szezonális programok'), h('p', { class: 'muted' }, tr('Hetente 3 rövid alkalom a forgó rend mellé, egy-egy cél köré. A rutinok a Több → Rövid rutinok alatt külön is elérhetők.')),
    h('ul', { class: 'menu-list' }, blocks.blocks.map(b => h('li', null, h('a', { href: '#/blocks', onclick: async e => { e.preventDefault(); await kvSet('block', { id: b.id, start: Date.now(), done: 0 }); toast('Elindult: ' + b.name); reload('#/blocks'); } },
      h('span', { class: 'routine-min' }, b.weeks + 'h'), h('span', null, h('strong', null, b.name), h('span', { class: 'small' }, b.about)))))));
}
/* egy rutin befejezése lépteti az aktív blokkot, ha a rutin része */
export async function blockProgress(routineId) {
  const st = await kvGet('block', null);
  if (!st) return;
  const blocks = applyBlocks(await (await fetch(new URL('../../data/blocks.json', import.meta.url))).json(), D.content);
  const b = blocks.blocks.find(x => x.id === st.id);
  if (b && b.routines.includes(routineId)) await kvSet('block', { ...st, done: (st.done || 0) + 1 });
}

/* ---- kihíváskód barátoknak ---- */
const CODE_TESTS = () => D.tests.tests.filter(t => t.kind !== 'criterion' && t.input.type === 'number').map(t => t.id);
export async function friendCard(items) {
  const mine = Object.fromEntries(CODE_TESTS().map(id => [id, latestValue(items, id)]).filter(([, v]) => v).map(([id, v]) => [id, v.value]));
  const code = Object.keys(mine).length ? encodeChallenge({ name: tr('Én'), results: mine }) : null;
  const input = h('input', { type: 'text', placeholder: tr('FORMA1.…'), 'aria-label': tr('Barátod kihíváskódja'), class: 'search', id: 'fcode' });
  const out = h('div', { 'aria-live': 'polite' });
  return card(h('h2', null, tr('Kihívás egy baráttal')),
    h('p', { class: 'small muted' }, tr('Küldd el a kódodat egy barátodnak (üzenetben), és ő is a sajátját neked: összevetem az eredményeiteket. Szerver és fiók nélkül, csak a tesztek számai vannak benne.')),
    code ? h('div', { class: 'row' }, btn(tr('Kódom másolása'), async () => {
      try { if (navigator.share) await navigator.share({ text: tr('Mérjük össze magunkat a Formában! Az én kódom: ') + code }); else { await navigator.clipboard.writeText(code); toast('Kimásoltam.'); } } catch { /* a megosztást elvethette */ }
    }, 'small')) : h('p', { class: 'small muted' }, tr('Egy felmérés vagy mini-teszt után lesz kódod.')),
    h('label', { class: 'field' }, tr('Barátod kódja'), input),
    h('div', { class: 'row' }, btn(tr('Összevetés'), () => {
      const f = decodeChallenge(input.value, CODE_TESTS());
      if (!f || !Object.keys(f.results).length) { toast('Ez nem érvényes kihíváskód.'); return; }
      clear(out).append(h('table', { class: 'tests-table' }, h('thead', null, h('tr', null, h('th', null, tr('Teszt')), h('th', null, tr('Te')), h('th', null, tr('Barátod')))),
        h('tbody', null, Object.entries(f.results).filter(([id]) => D.test[id]).map(([id, v]) => {
          const m = mine[id], lower = LOWER_BETTER.has(id), win = m == null ? null : lower ? m < v : m > v;
          return h('tr', null, h('td', null, D.test[id].name), h('td', null, m == null ? '–' : `${fmtNum(m)}${win ? ' 🏆' : ''}`), h('td', null, `${fmtNum(v)}${win === false && m !== v ? ' 🏆' : ''}`));
        }))));
    })), out);
}

/* ---- nyomtatható összefoglaló (PDF-be menthető) ---- */
export async function reportView() {
  const as = await assessments(), p = profile();
  const last = as[0], ev = last ? evaluateItem(last) : null, ws = await workouts();
  const since = Date.now() - 30 * DAY;
  return h('div', { class: 'page report' },
    h('h1', null, tr('Forma – összefoglaló')),
    h('p', { class: 'muted' }, tr('{p0} éves {p1} · készült: {p2}', { p0: p.age, p1: p.sex === 'female' ? tr('nő') : tr('férfi'), p2: fmtDate(Date.now()) })),
    h('div', { class: 'row no-print' }, btn(tr('Nyomtatás vagy mentés PDF-be'), () => print(), 'primary'), link('#/', tr('Vissza'), 'btn small')),
    ev ? h('section', null, h('h2', null, tr('Legutóbbi felmérés ({p0})', { p0: fmtDate(last.date) })),
      h('p', null, tr('Fittségi kor: {p0} év · összesített pontszám: {p1} / 100', { p0: ev.fitnessAge ?? '–', p1: ev.overall ?? '–' })),
      h('p', { class: 'small muted' }, last.scoring ? tr('A felméréskor mentett kiértékelés; pontozás {p0}, normák {p1}, tesztek {p2}.', { p0: last.scoring.version, p1: last.scoring.normsVersion, p2: last.scoring.testsVersion }) : tr('Régi felmérés: az eredeti pontozási verzió nem ismert; a jelenlegi normákkal újraszámolva.')),
      h('table', { class: 'tests-table' }, h('thead', null, h('tr', null, h('th', null, tr('Terület')), h('th', null, tr('Pont')))),
        h('tbody', null, D.tests.areas.filter(a => ev.areas[a.id]).map(a => h('tr', null, h('td', null, a.name), h('td', null, String(ev.areas[a.id].score)))))),
      h('table', { class: 'tests-table' }, h('thead', null, h('tr', null, h('th', null, tr('Teszt')), h('th', null, tr('Eredmény')))),
        h('tbody', null, D.tests.tests.filter(t => ev.tests[t.id]).map(t => h('tr', null, h('td', null, t.name), h('td', null, t.input.type === 'choice' ? ev.tests[t.id].value + ' / 3' : fmtNum(ev.tests[t.id].value) + ' ' + t.input.unit)))))) : h('p', null, tr('Még nincs felmérés.')),
    as.length > 1 ? h('section', null, h('h2', null, tr('Felmérések')), list(as.slice(0, 6).map(a => { const e = evaluateItem(a); return tr('{p0}: {p1} / 100, fittségi kor {p2}', { p0: fmtDate(a.date), p1: e.overall ?? '–', p2: e.fitnessAge ?? '–' }); }))) : null,
    h('section', null, h('h2', null, tr('Az elmúlt 30 nap')), h('p', null, tr('{p0} edzés, összesen {p1} perc.', { p0: ws.filter(w => w.date >= since).length, p1: ws.filter(w => w.date >= since).reduce((s, w) => s + (w.minutes || 0), 0) }))),
    p.age && (await kvGet('settings', {})).complaints?.length ? h('p', null, tr('Jelzett panaszok: ') + (await kvGet('settings', {})).complaints.map(c => ({ knee: tr('térd'), back: tr('derék'), shoulder: tr('váll') })[c]).join(', ')) : null,
    h('p', { class: 'small muted' }, tr('A Forma önmérésen alapuló, tájékoztató alkalmazás, nem orvosi eszköz. A normák egy része becsült.')));
}
