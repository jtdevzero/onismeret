/* Pulzusmérés kamerával, regenerációs pontszám, 30 napos kihívások, szezonális blokkok, kihíváskód, nyomtatható összefoglaló. */
import { h, clear, uid, fmtDate, toast } from './dom.js';
import { page, card, btn, link, note, list, speak, beep, openPpg, celebrate, fmtNum } from './widgets.js';
import { D, profile } from './data.js';
import { kvGet, kvSet, itemPut, itemsAll } from './store.js';
import { assessments, evaluateItem, workouts } from './state.js';
import { bpmFromSignal } from '../core/sensors.js';
import { recoveryScore, CHALLENGES, challengeDose, challengeDay, encodeChallenge, decodeChallenge } from '../core/extras.js';
import { latestValue, LOWER_BETTER } from '../core/achievements.js';
import { figureAnim } from './figure.js';

const reload = hash => { location.hash = hash; dispatchEvent(new HashChangeEvent('hashchange')); };
const DAY = 86400000;

/* ---- pulzus ---- */
export async function pulseView(arg, onCleanup) {
  const past = (await itemsAll('pulse')).slice(0, 7);
  const out = h('div', { 'aria-live': 'polite' }), clock = h('div', { class: 'workout-clock' }, '30'), status = h('p', { class: 'small muted' });
  let cam = null, stopped = false;
  onCleanup(() => { stopped = true; if (cam) cam.close(); });
  const go = btn('Mérés indítása', async () => {
    go.disabled = true; clear(out);
    try { cam = await openPpg(); } catch (e) { status.textContent = e && e.code === 'camera_denied' ? 'Nem kaptam engedélyt a kamerához.' : 'Ezen a készüléken nem érhető el a hátsó kamera.'; go.disabled = false; return; }
    status.textContent = cam.torch ? 'Tartsd az ujjad nyugodtan a lencsén és a vakun.' : 'A vakut nem tudom bekapcsolni: mérj világos helyen, ujjal a lencsén.';
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
    if (!r || r.quality < 0.4) { clear(out).append(note('Nem sikerült megbízható jelet kapni. Takard le teljesen a lencsét az ujjbegyeddel, ne nyomd erősen, és ne mozogj.', 'warn')); return; }
    await itemPut({ id: uid(), kind: 'pulse', date: Date.now(), bpm: r.bpm, quality: r.quality });
    speak(`${r.bpm} ütés percenként.`);
    clear(out).append(card(h('p', { class: 'lead' }, `${r.bpm} ütés/perc`), h('p', { class: 'small muted' }, `Jelminőség: ${Math.round(r.quality * 100)}%. A regenerációs pontszám a reggeli pulzust a saját átlagodhoz méri.`)));
  }, 'primary');
  return page('Reggeli pulzus',
    h('p', { class: 'muted' }, 'Ébredés után, ülve vagy fekve: tedd a mutatóujjad a hátsó kamera lencséjére és a vakura, és tartsd 30 másodpercig. A kép nem kerül sehova, csak a fényerő változását mérem.'),
    card(clock, h('div', { class: 'row' }, go), status), out,
    past.length ? card(h('h2', null, 'Korábbi mérések'), h('ul', { class: 'rows' }, past.map(p => h('li', null, h('span', null, fmtDate(p.date)), h('strong', null, p.bpm + ' /perc'))))) : null,
    note('Tájékoztató mérés, nem orvosi eszköz. Szabálytalan szívverés gyanújával fordulj orvoshoz.', 'small'));
}

/* ---- regenerációs pontszám ---- */
export async function recoveryTileData(items) {
  return recoveryScore({ readiness: await kvGet('readiness', null), pulses: items.filter(i => i.kind === 'pulse'), workouts: items.filter(i => i.kind === 'workout') });
}
export async function recoveryCard(items) {
  const r = recoveryScore({ readiness: await kvGet('readiness', null), pulses: items.filter(i => i.kind === 'pulse'), workouts: items.filter(i => i.kind === 'workout') });
  const label = { go: 'Mehet a teljes edzés', light: 'Könnyített edzés javasolt', rest: 'Ma inkább regenerálódj' };
  if (!r) return card(h('h2', null, 'Regeneráció'), h('p', { class: 'small muted' }, 'A napi „hogy vagy?” kérdésekből és a reggeli pulzusból számolom.'), h('div', { class: 'row' }, link('#/pulse', 'Reggeli pulzus mérése', 'btn small')));
  return card(h('div', { class: 'row tight' }, h('h2', null, 'Regeneráció'), h('span', { class: 'badge ' + (r.level === 'go' ? 'good' : r.level === 'light' ? 'mid' : 'warn') }, `${r.score} / 100`)),
    h('p', null, label[r.level]), h('p', { class: 'small muted' }, r.parts.map(([n, v]) => `${n}: ${n === 'Reggeli pulzus' ? (v > 0 ? '+' : '') + v + '/perc az átlaghoz' : n.startsWith('Terhelés') ? v + ' perc' : v + '%'}`).join(' · ')),
    h('div', { class: 'row' }, link('#/pulse', 'Reggeli pulzus', 'btn small')));
}

/* ---- 30 napos kihívások ---- */
export async function challengeView() {
  const st = (await kvGet('challenge', null)) || null, items = await itemsAll('challenge');
  if (!st) {
    return page('30 napos kihívás', h('p', { class: 'muted' }, 'Napi pár perc, fokozatosan emelkedő adaggal; minden 4. nap könnyebb.'),
      h('ul', { class: 'menu-list' }, CHALLENGES.map(c => h('li', null, h('a', { href: '#/challenge', onclick: async e => { e.preventDefault(); await kvSet('challenge', { id: c.id, start: Date.now() }); reload('#/challenge'); } },
        h('span', { class: 'routine-min' }, '30'), h('span', null, h('strong', null, c.name), h('span', { class: 'small' }, `${c.start} → kb. ${Math.min(c.max, c.start + c.step * 22)} ${c.unit}`)))))));
  }
  const ch = CHALLENGES.find(c => c.id === st.id), day = challengeDay(st.start), dose = challengeDose(ch, day);
  const doneDays = new Set(items.filter(i => i.challenge === st.id && i.date >= st.start).map(i => i.day));
  const ex = D.ex[ch.exercise];
  const grid = h('div', { class: 'ch-grid', role: 'list', 'aria-label': 'A 30 nap' }, Array.from({ length: 30 }, (_, i) => h('span', { role: 'listitem', class: 'ch-day' + (doneDays.has(i + 1) ? ' done' : i + 1 === day ? ' today' : i + 1 < day ? ' missed' : ''), 'aria-label': `${i + 1}. nap${doneDays.has(i + 1) ? ', kész' : ''}` }, String(i + 1))));
  const finished = day > 30 || doneDays.size >= 30;
  return page(ch.name,
    h('p', { class: 'muted' }, finished ? 'A 30 nap véget ért.' : `${day}. nap a 30-ból · ${doneDays.size} nap teljesítve`),
    card(grid),
    !finished && dose ? h('section', { class: 'card accent' }, h('h2', null, `Mai adag: ${dose.amount} ${ch.unit}` + (dose.easy ? ' (könnyített nap)' : '')),
      figureAnim(D.figures[ex.figure], { compact: true }), h('p', null, link('#/ex/' + ex.id, ex.name)),
      doneDays.has(day) ? h('p', { class: 'lead' }, '✓ Mára kész.') : h('div', { class: 'row' }, btn('Kész, megcsináltam', async () => {
        await itemPut({ id: uid(), kind: 'challenge', date: Date.now(), challenge: st.id, day, amount: dose.amount });
        if (doneDays.size + 1 >= 30) celebrate();
        toast('Szép! Holnap folytatjuk.'); reload('#/challenge');
      }, 'primary'))) : card(h('p', { class: 'lead' }, `Teljesítve: ${doneDays.size} / 30 nap.`)),
    h('div', { class: 'row' }, btn(finished ? 'Új kihívás' : 'Kihívás feladása', async () => { if (!finished && !confirm('Feladod ezt a kihívást?')) return; await kvSet('challenge', null); reload('#/challenge'); }, 'small')));
}

/* ---- szezonális blokkok ---- */
export async function blocksView() {
  const blocks = await (await fetch(new URL('../../data/blocks.json', import.meta.url))).json();
  const st = await kvGet('block', null);
  const R = Object.fromEntries(D.routines.map(r => [r.id, r]));
  if (st) {
    const b = blocks.blocks.find(x => x.id === st.id);
    if (b) {
      const total = b.weeks * b.perWeek, week = Math.floor((Date.now() - st.start) / (7 * DAY)) + 1;
      const next = R[b.routines[(st.done || 0) % b.routines.length]];
      const finished = (st.done || 0) >= total;
      return page(b.name, h('p', { class: 'muted' }, `${Math.min(week, b.weeks)}. hét a ${b.weeks}-ből · ${st.done || 0} / ${total} alkalom`),
        h('progress', { max: total, value: st.done || 0, 'aria-label': 'A blokk haladása' }),
        finished ? card(h('h2', null, 'Kész a blokk! 🎉'), h('p', null, 'Szép munka. Indíthatsz egy újat, vagy maradhatsz a forgó rendnél.'))
          : h('section', { class: 'card accent' }, h('h2', null, 'Következő alkalom'), h('p', { class: 'lead' }, next.name), h('p', { class: 'small muted' }, next.about), h('div', { class: 'row' }, link('#/prepare/routine-' + next.id, 'Indítás', 'btn primary'))),
        h('div', { class: 'row' }, btn(finished ? 'Új blokk' : 'Blokk befejezése', async () => { if (!finished && !confirm('Befejezed ezt a blokkot?')) return; await kvSet('block', null); reload('#/blocks'); }, 'small')));
    }
  }
  return page('Szezonális programok', h('p', { class: 'muted' }, 'Hetente 3 rövid alkalom a forgó rend mellé, egy-egy cél köré. A rutinok a Több → Rövid rutinok alatt külön is elérhetők.'),
    h('ul', { class: 'menu-list' }, blocks.blocks.map(b => h('li', null, h('a', { href: '#/blocks', onclick: async e => { e.preventDefault(); await kvSet('block', { id: b.id, start: Date.now(), done: 0 }); toast('Elindult: ' + b.name); reload('#/blocks'); } },
      h('span', { class: 'routine-min' }, b.weeks + 'h'), h('span', null, h('strong', null, b.name), h('span', { class: 'small' }, b.about)))))));
}
/* egy rutin befejezése lépteti az aktív blokkot, ha a rutin része */
export async function blockProgress(routineId) {
  const st = await kvGet('block', null);
  if (!st) return;
  const blocks = await (await fetch(new URL('../../data/blocks.json', import.meta.url))).json();
  const b = blocks.blocks.find(x => x.id === st.id);
  if (b && b.routines.includes(routineId)) await kvSet('block', { ...st, done: (st.done || 0) + 1 });
}

/* ---- kihíváskód barátoknak ---- */
const CODE_TESTS = () => D.tests.tests.filter(t => t.kind !== 'criterion' && t.input.type === 'number').map(t => t.id);
export async function friendCard(items) {
  const mine = Object.fromEntries(CODE_TESTS().map(id => [id, latestValue(items, id)]).filter(([, v]) => v).map(([id, v]) => [id, v.value]));
  const code = Object.keys(mine).length ? encodeChallenge({ name: 'Én', results: mine }) : null;
  const input = h('input', { type: 'text', placeholder: 'FORMA1.…', 'aria-label': 'Barátod kihíváskódja', class: 'search', id: 'fcode' });
  const out = h('div', { 'aria-live': 'polite' });
  return card(h('h2', null, 'Kihívás egy baráttal'),
    h('p', { class: 'small muted' }, 'Küldd el a kódodat egy barátodnak (üzenetben), és ő is a sajátját neked: összevetem az eredményeiteket. Szerver és fiók nélkül, csak a tesztek számai vannak benne.'),
    code ? h('div', { class: 'row' }, btn('Kódom másolása', async () => {
      try { if (navigator.share) await navigator.share({ text: 'Mérjük össze magunkat a Formában! Az én kódom: ' + code }); else { await navigator.clipboard.writeText(code); toast('Kimásoltam.'); } } catch { /* a megosztást elvethette */ }
    }, 'small')) : h('p', { class: 'small muted' }, 'Egy felmérés vagy mini-teszt után lesz kódod.'),
    h('label', { class: 'field' }, 'Barátod kódja', input),
    h('div', { class: 'row' }, btn('Összevetés', () => {
      const f = decodeChallenge(input.value, CODE_TESTS());
      if (!f || !Object.keys(f.results).length) { toast('Ez nem érvényes kihíváskód.'); return; }
      clear(out).append(h('table', { class: 'tests-table' }, h('thead', null, h('tr', null, h('th', null, 'Teszt'), h('th', null, 'Te'), h('th', null, 'Barátod'))),
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
    h('h1', null, 'Forma – összefoglaló'),
    h('p', { class: 'muted' }, `${p.age} éves ${p.sex === 'female' ? 'nő' : 'férfi'} · készült: ${fmtDate(Date.now())}`),
    h('div', { class: 'row no-print' }, btn('Nyomtatás vagy mentés PDF-be', () => print(), 'primary'), link('#/', 'Vissza', 'btn small')),
    ev ? h('section', null, h('h2', null, `Legutóbbi felmérés (${fmtDate(last.date)})`),
      h('p', null, `Fittségi kor: ${ev.fitnessAge ?? '–'} év · összesített pontszám: ${ev.overall ?? '–'} / 100`),
      h('p', { class: 'small muted' }, last.scoring ? `A felméréskor mentett kiértékelés; pontozás ${last.scoring.version}, normák ${last.scoring.normsVersion}, tesztek ${last.scoring.testsVersion}.` : 'Régi felmérés: az eredeti pontozási verzió nem ismert; a jelenlegi normákkal újraszámolva.'),
      h('table', { class: 'tests-table' }, h('thead', null, h('tr', null, h('th', null, 'Terület'), h('th', null, 'Pont'))),
        h('tbody', null, D.tests.areas.filter(a => ev.areas[a.id]).map(a => h('tr', null, h('td', null, a.name), h('td', null, String(ev.areas[a.id].score)))))),
      h('table', { class: 'tests-table' }, h('thead', null, h('tr', null, h('th', null, 'Teszt'), h('th', null, 'Eredmény'))),
        h('tbody', null, D.tests.tests.filter(t => ev.tests[t.id]).map(t => h('tr', null, h('td', null, t.name), h('td', null, t.input.type === 'choice' ? ev.tests[t.id].value + ' / 3' : fmtNum(ev.tests[t.id].value) + ' ' + t.input.unit)))))) : h('p', null, 'Még nincs felmérés.'),
    as.length > 1 ? h('section', null, h('h2', null, 'Felmérések'), list(as.slice(0, 6).map(a => { const e = evaluateItem(a); return `${fmtDate(a.date)}: ${e.overall ?? '–'} / 100, fittségi kor ${e.fitnessAge ?? '–'}`; }))) : null,
    h('section', null, h('h2', null, 'Az elmúlt 30 nap'), h('p', null, `${ws.filter(w => w.date >= since).length} edzés, összesen ${ws.filter(w => w.date >= since).reduce((s, w) => s + (w.minutes || 0), 0)} perc.`)),
    p.age && (await kvGet('settings', {})).complaints?.length ? h('p', null, 'Jelzett panaszok: ' + (await kvGet('settings', {})).complaints.map(c => ({ knee: 'térd', back: 'derék', shoulder: 'váll' })[c]).join(', ')) : null,
    h('p', { class: 'small muted' }, 'A Forma önmérésen alapuló, tájékoztató alkalmazás, nem orvosi eszköz. A normák egy része becsült.'));
}
