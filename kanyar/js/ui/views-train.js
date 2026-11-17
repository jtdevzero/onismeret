/* Felkészülés: mozgásfelmérés, program, gyakorlatok és a felvett gyakorlat elemzése. */
import { h, clear, uid, fmtSec, fmtDate, toast } from './dom.js';
import { page, card, btn, link, note, list, videoPicker, videoLinks, confBadge, sourceBadge, captureFrames, tickMs } from './widgets.js';
import { D, S } from './data.js';
import { kvGet, kvSet, itemPut, itemsAll } from './store.js';
import { analyzeExercise, isAnalyzable } from '../core/exercise.js';
import { TESTS, buildProfile, buildProgram, sessionSteps, sessionMinutes } from '../core/program.js';
import { buildIcs } from '../core/calendar.js';
import { prepCoach } from './coach-client.js';
import { liveCounter, speak } from './live.js';

const pain = () => !!(S.settings.health && S.settings.health.pain);
const exMap = () => Object.fromEntries(Object.values(D.ex).map(e => [e.id, e]));
export const getProfile = async () => buildProfile(await kvGet('assessment', {}));
const dose = b => (b.seconds ? fmtSec(b.seconds) : b.reps + ' ism.') + (b.perSide ? ' oldalanként' : '') + (b.sets > 1 ? ' × ' + b.sets + ' kör' : '');
const SESSION = { strength: 'Erő', lateral: 'Oldalirány és törzs', endurance: 'Állóképesség' };
const UNIT = { deg: '°', s: ' mp', '%': '%', ratio: '' };
const CHECK_NAMES = {
  depth: 'Mélység', knees_out: 'Térdek kifelé', chest_up: 'Törzstartás', tempo: 'Tempó', knee_line: 'Térd vonala', pelvis_level: 'Medence',
  other_leg_straight: 'Nyújtott láb', hips_high: 'Csípő magassága', rhythm: 'Ritmus', soft_landing: 'Puha érkezés', knee_angle: 'Térdszög',
  steady: 'Stabilitás', straight_line: 'Egyenes testvonal', still: 'Kilengés', hold_time: 'Kitartás', range: 'Mozgástartomány', ankle_range: 'Bokahajlás',
};

export async function prepView() {
  const results = await kvGet('assessment', {}), profile = buildProfile(results), prog = await kvGet('program', null);
  const tests = h('ul', { class: 'rows' }, TESTS.map(id => {
    const sc = profile.scores[id];
    return h('li', null, link('#/ex/' + id, D.ex[id].name),
      h('span', { class: 'badge ' + (sc === 'weak' ? 'warn' : sc ? 'good' : '') }, sc === 'weak' ? 'Fejlesztendő' : sc ? 'Rendben' : 'Még nincs meg'));
  }));
  const weak = profile.weak.length
    ? h('p', null, 'Gyenge pontjaid a felmérés szerint: ', h('strong', null, profile.weak.map(w => D.exercises.weakNames[w]).join(', ')), '.')
    : profile.done ? h('p', null, 'Az eddigi tesztek alapján nincs kiemelt gyenge pontod.') : null;
  const asym = profile.asym.length ? h('p', null, 'Bal–jobb különbség: ' + profile.asym.map(a => `${D.ex[a.test].name}: a ${a.weaker === 'left' ? 'bal' : 'jobb'} oldal gyengébb (${a.pct}%)`).join('; ') + '.') : null;

  const makeProgram = async () => {
    await kvSet('program', { created: Date.now(), program: buildProgram(profile, S.settings.sport, exMap(), S.settings.health || {}), done: {}, basedOn: profile.done });
    location.hash = '#/program';
  };
  let programCard;
  if (prog) {
    const total = prog.program.weeks.length * 3, done = Object.keys(prog.done || {}).length;
    programCard = card(h('h2', null, '6 hetes program'),
      h('p', null, `${done} / ${total} edzés kész.`), h('progress', { max: total, value: done }),
      h('div', { class: 'row' }, link('#/program', 'Program megnyitása', 'btn primary'), btn('Újratervezés a felmérés alapján', makeProgram)),
      profile.done > (prog.basedOn || 0) ? note('Azóta új teszteket végeztél: az újratervezés figyelembe veszi őket. A kész edzések jelölése törlődik.') : null);
  } else {
    programCard = card(h('h2', null, '6 hetes program'),
      h('p', null, 'Heti 3 edzés, nagyjából 25 perc: erő, törzs, egyensúly, állóképesség és nyújtás.'),
      profile.done ? null : note('Felmérés nélkül általános programot kapsz, ugrások nélkül. A felmérés után személyre szabható.'),
      btn('Program készítése', makeProgram, 'primary'));
  }
  const groups = ['strength', 'core', 'balance', 'power', 'endurance', 'mobility'].map(type => h('div', null,
    h('h3', null, D.exercises.typeNames[type]),
    h('ul', { class: 'rows' }, D.exercises.exercises.filter(e => e.type === type).map(e =>
      h('li', null, link('#/ex/' + e.id, e.name), isAnalyzable(e.id) ? h('span', { class: 'badge' }, 'Elemezhető') : null)))));
  const follow = (D.exercises.workouts[S.settings.sport] || []);

  return page('Felkészülés',
    pain() ? note('Fájdalmat vagy friss sérülést jeleztél. A program ugrások nélkül készül, és nem javasol nehezítést. Kezdés előtt beszélj orvossal vagy gyógytornásszal.', 'warn') : null,
    card(h('h2', null, 'Mozgásfelmérés'),
      h('p', null, `Hét rövid teszt a telefon kamerájával, összesen nagyjából 10 perc. Eddig ${profile.done} / ${profile.total} készült el.`),
      tests, weak, asym),
    programCard,
    card(h('h2', null, 'Gyakorlatok'), groups),
    follow.length ? card(h('h2', null, 'Végigkövethető edzések'), videoLinks({ videos: follow, query: S.settings.sport === 'snowboard' ? 'snowboard workout at home' : 'ski fitness workout at home' })) : null,
    note('A felkészülési rész nem orvosi eszköz. A gyakorlatokat és a határértékeket szakember még nem lektorálta.', 'small'));
}

const DAYS = [[1, 'H'], [2, 'K'], [3, 'Sze'], [4, 'Cs'], [5, 'P'], [6, 'Szo'], [0, 'V']];
const DAY_NAMES = { 0: 'vasárnap', 1: 'hétfő', 2: 'kedd', 3: 'szerda', 4: 'csütörtök', 5: 'péntek', 6: 'szombat' };

/* Emlékeztetők a telefon naptárában: a program edzései naptárfájlként, 15 perccel előtte jelzéssel. */
async function calendarCard(prog) {
  const saved = await kvGet('calendar', null) || { weekdays: [1, 3, 5], time: '18:00' };
  const picked = new Set(saved.weekdays);
  const msg = h('p', { class: 'small', 'aria-live': 'polite' });
  const time = h('input', { type: 'time', value: saved.time, 'aria-label': 'Az edzések kezdési ideje' });
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const start = h('input', { type: 'date', value: iso(today), min: iso(today), 'aria-label': 'Az első nap' });
  const boxes = DAYS.map(([d, label]) => {
    const box = h('input', { type: 'checkbox', checked: picked.has(d), onchange: () => { if (box.checked) picked.add(d); else picked.delete(d); } });
    return h('label', { class: 'day-pick', title: DAY_NAMES[d] }, box, h('span', null, label));
  });
  const download = async () => {
    if (picked.size !== 3) { msg.textContent = 'Pontosan három napot válassz.'; return; }
    if (!/^\d{2}:\d{2}$/.test(time.value) || !start.value) { msg.textContent = 'Adj meg kezdési időt és első napot.'; return; }
    const weekdays = [...picked];
    await kvSet('calendar', { weekdays, time: time.value });
    const ics = buildIcs(prog.program, {
      start: new Date(start.value + 'T00:00'), weekdays, time: time.value, minutes: 30,
      title: (w, i) => `Kanyar: ${w}. hét, ${i + 1}. edzés – ${SESSION[prog.program.weeks[w - 1].sessions[i].key]}`,
      body: (w, i) => prog.program.weeks[w - 1].sessions[i].blocks.map(b => `${D.ex[b.exercise].name}: ${dose(b)}`).join('\n'),
      url: location.href.replace(/#.*$/, '') + '#/program',
    });
    const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
    const a = h('a', { href: url, download: 'kanyar-edzesterv.ics' });
    document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 5000);
    msg.textContent = 'Kész. Nyisd meg a letöltött fájlt, és add hozzá a naptáradhoz: minden edzés előtt 15 perccel szól.';
  };
  return card(h('h2', null, 'Emlékeztetők a naptárban'),
    h('p', null, 'Válassz három napot és egy időpontot: a 18 edzés bekerül a telefonod naptárába, és mindegyik előtt 15 perccel jelez.'),
    h('div', { class: 'days', role: 'group', 'aria-label': 'Edzésnapok' }, boxes),
    h('div', { class: 'row' }, h('label', { class: 'field inline' }, h('span', null, 'Időpont'), time), h('label', { class: 'field inline' }, h('span', null, 'Első nap'), start)),
    btn('Naptárfájl letöltése', download, 'primary'), msg);
}

export async function programView() {
  const prog = await kvGet('program', null);
  if (!prog) return page('Program', card(h('p', null, 'Még nincs programod.'), link('#/prep', 'Vissza a felkészüléshez', 'btn')));
  const done = prog.done || {};
  const firstOpen = prog.program.weeks.find(w => w.sessions.some((_, i) => !done[w.week + '-' + i]));
  const weeks = prog.program.weeks.map(w => h('details', { class: 'card', open: firstOpen ? firstOpen.week === w.week : w.week === 1 },
    h('summary', null, h('h2', null, `${w.week}. hét`),
      h('span', { class: 'badge' }, w.sessions.filter((_, i) => done[w.week + '-' + i]).length + ' / 3')),
    w.week === prog.program.retestWeek ? note('A hét végén érdemes megismételni a felmérést, és újratervezni a programot.') : null,
    w.sessions.map((s, i) => {
      const key = w.week + '-' + i;
      const box = h('input', { type: 'checkbox', checked: !!done[key], onchange: async () => {
        if (box.checked) done[key] = Date.now(); else delete done[key];
        await kvSet('program', { ...prog, done });
      } });
      return h('div', { class: 'session' },
        h('div', { class: 'row tight session-top' },
          h('label', { class: 'session-head' }, box, h('strong', null, `${i + 1}. edzés: ${SESSION[s.key]}`)),
          link('#/session/' + key, done[key] ? 'Újra' : 'Indítás', 'btn small' + (done[key] ? '' : ' primary'))),
        h('ol', { class: 'blocks' }, s.blocks.map(b => h('li', null, link('#/ex/' + b.exercise, D.ex[b.exercise].name), h('span', { class: 'muted' }, ' · ' + dose(b))))));
    })));
  return page('6 hetes program',
    note(prog.program.jumps ? 'A programban ugrások is vannak: csak puha, hangtalan érkezéssel csináld őket.' : 'A program ugrások nélkül készült.'),
    await calendarCard(prog),
    weeks, link('#/prep', '← Felkészülés', 'btn'));
}

function resultCard(result, ex, coach) {
  const head = result.holdSeconds ? `${fmtSec(result.holdSeconds)} tartás` : result.reps ? `${result.reps} ismétlés` : 'Mérés kész';
  const sides = result.sides ? h('p', null, `Bal: ${result.sides.left} · Jobb: ${result.sides.right}` + (result.asymmetry != null ? ` · különbség: ${result.asymmetry}%` : '')) : null;
  return card(
    h('div', { class: 'row' }, h('h2', null, head), sourceBadge(coach), confBadge(coach.confidence)),
    h('p', { class: 'lead' }, coach.summary),
    h('ul', { class: 'rows' }, result.checks.map(c => h('li', null,
      h('span', null, CHECK_NAMES[c.id] || c.id, h('span', { class: 'muted small' }, c.value != null ? ` (${c.value}${UNIT[c.unit] ?? ''})` : '')),
      h('span', { class: 'badge ' + (c.band === 'ok' ? 'good' : 'warn') }, c.band === 'ok' ? 'Rendben' : 'Javítandó')))),
    sides,
    h('h3', null, 'Ami jól megy'), h('p', null, coach.good),
    h('h3', null, 'Amin javíts'), h('p', null, coach.fix.what), h('p', { class: 'cue' }, coach.fix.cue),
    coach.asymmetry ? h('p', null, coach.asymmetry) : null,
    h('h3', null, 'A havon'), h('p', null, coach.on_snow),
    coach.option_id && D.ex[coach.option_id] ? h('p', null, coach.next === 'harder' ? 'Mehet a nehezebb változat: ' : 'Próbáld a könnyebb változatot: ', link('#/ex/' + coach.option_id, D.ex[coach.option_id].name)) : null,
    coach.reshoot_tip ? note(coach.reshoot_tip, 'warn') : null,
    coach.aiError ? note('Az AI-edzőt most nem sikerült elérni, ezért a helyi elemzést látod.', 'small') : null);
}

export async function exerciseView(id, onCleanup) {
  const ex = D.ex[id];
  if (!ex) return page('Nincs ilyen gyakorlat', link('#/prep', '← Felkészülés', 'btn'));
  const isTest = TESTS.includes(id), out = h('div', { 'aria-live': 'polite' });
  let analyze = null;
  if (isAnalyzable(id)) {
    /* A videóból és az élő számlálásból érkező mérés ugyanazon az úton megy tovább. */
    const finish = async ({ blob, frames, aspect }, statusEl, say = () => {}) => {
      const result = analyzeExercise(frames, { aspect, exercise: id });
      if (!result.ok) {
        clear(statusEl).append(note(result.reason === 'no_movement'
          ? 'Nem találtam a gyakorlat mozgását a felvételen. Ellenőrizd a kameraállást, és hogy végig látszol-e.'
          : 'Nem látszottál elég jól a felvételen. Támaszd le a telefont úgy, hogy tetőtől talpig beleférj, és legyen elég fény.', 'warn'));
        return;
      }
      say('Visszajelzés készül…');
      const profile = await getProfile();
      let images = [];
      if (blob) try { const d = frames[frames.length - 1].t; images = await captureFrames(blob, [0.3 * d, 0.6 * d], 384, 0.5); } catch { images = []; }
      const coach = await prepCoach(result, ex, { mode: isTest ? 'assessment' : 'exercise', profile }, images);
      await itemPut({ id: uid(), kind: 'exercise', date: Date.now(), exercise: id, isTest, live: !blob, result, coach });
      if (isTest) { const all = await kvGet('assessment', {}); all[id] = result; await kvSet('assessment', all); toast('A teszt eredménye bekerült a profilodba.'); }
      clear(statusEl);
      clear(out).append(resultCard(result, ex, coach));
      out.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    const picker = videoPicker(isTest ? 'Teszt felvétele vagy feltöltése' : 'Vedd fel, és elemzem', (r, say) => finish(r, picker.status, say));
    const live = liveCounter(id, (r, statusEl) => finish(r, statusEl));
    if (onCleanup) onCleanup(live.stop);
    analyze = card(h('h2', null, isTest ? 'Teszt elvégzése' : 'Végrehajtás elemzése'),
      h('p', null, ex.camera || 'Támaszd le a telefont úgy, hogy tetőtől talpig látszódj.'),
      note('A videó a telefonodon marad, az elemzés a készüléken fut.', 'small'), picker.el,
      h('h3', null, 'Vagy számoljak élőben?'), live.el);
  }
  /* korábbi eredmények ebből a gyakorlatból */
  const past = (await itemsAll()).filter(i => i.kind === 'exercise' && i.exercise === id).slice(0, 6);
  const history = past.length ? card(h('h2', null, 'Korábbi eredményeid'),
    h('ul', { class: 'rows' }, past.map(i => {
      const fixes = i.result.checks.filter(c => c.band === 'fix').length;
      return h('li', null,
        h('span', null, fmtDate(i.date), h('span', { class: 'muted small' }, ' · ' + (i.result.holdSeconds ? fmtSec(i.result.holdSeconds) + ' tartás' : i.result.reps + ' ismétlés') + (i.live ? ' · élő' : ''))),
        h('span', { class: 'badge ' + (fixes ? 'warn' : 'good') }, fixes ? fixes + ' javítandó' : 'Rendben'));
    }))) : null;
  return page(ex.name,
    h('p', { class: 'muted' }, D.exercises.typeNames[ex.type] + (ex.dose.seconds ? ' · ' + fmtSec(ex.dose.seconds) : ' · ' + ex.dose.reps + ' ismétlés') + (ex.perSide ? ' oldalanként' : '')),
    ['power'].includes(ex.type) && pain() ? note('Fájdalmat jeleztél: ezt az ugrásos gyakorlatot most hagyd ki.', 'warn') : null,
    card(h('h2', null, 'Hogyan csináld'), h('p', null, ex.how), h('h3', null, 'Három dolog, amire figyelj'), list(ex.points),
      h('h3', null, 'Miért számít a havon'), h('p', null, ex.onSnow)),
    analyze, out, history, card(videoLinks(ex)),
    link(isTest ? '#/prep' : '#/prep', '← Felkészülés', 'btn'));
}

const SIDE = { left: 'bal oldal', right: 'jobb oldal', both: 'oldalanként' };

/* Vezetett edzés: lépésről lépésre, időzítővel, pihenővel és hangos bemondással. */
export async function sessionView(key, onCleanup) {
  const prog = await kvGet('program', null);
  const [w, i] = String(key || '').split('-').map(Number);
  const week = prog && prog.program.weeks.find(x => x.week === w), session = week && week.sessions[i];
  if (!session) return page('Nincs ilyen edzés', link('#/program', '← Program', 'btn'));
  const steps = sessionSteps(session, D.ex), total = steps.length, started = Date.now();
  let at = 0, left = 0, timer = null, running = false, wake = null, finished = false;
  const voice = h('input', { type: 'checkbox', checked: true });
  const bar = h('progress', { max: total, value: 0, 'aria-label': 'Az edzés előrehaladása' });
  const count = h('p', { class: 'muted small' });
  const stage = h('div', { class: 'workout', 'aria-live': 'polite' });
  const stop = () => { if (timer) { clearInterval(timer); timer = null; } running = false; };
  const release = () => { stop(); if (wake) { wake.release().catch(() => {}); wake = null; } try { if ('speechSynthesis' in window) speechSynthesis.cancel(); } catch { /* a hang nem létfontosságú */ } };
  onCleanup(release);
  try { wake = await navigator.wakeLock.request('screen'); } catch { wake = null; }

  const next = () => { stop(); at++; if (at >= total) finish(); else show(); };
  const back = () => { stop(); if (at > 0) { at--; show(); } };

  async function finish() {
    if (finished) return;
    finished = true; release();
    const minutes = Math.max(1, Math.round((Date.now() - started) / 60000));
    const fresh = (await kvGet('program', null)) || prog;
    await kvSet('program', { ...fresh, done: { ...(fresh.done || {}), [key]: Date.now() } });
    await itemPut({ id: uid(), kind: 'workout', date: Date.now(), week: w, session: i, name: SESSION[session.key], minutes, steps: total });
    speak('Kész az edzés. Szép munka!', voice.checked);
    bar.value = total; count.textContent = `${total} / ${total} lépés`;
    clear(stage).append(card(h('h2', null, 'Edzés kész'),
      h('p', { class: 'lead' }, `${w}. hét, ${i + 1}. edzés: ${SESSION[session.key]}.`),
      h('p', null, 'Bekerült a naplódba, és a programban kipipáltam.'),
      h('div', { class: 'row' }, link('#/program', 'Vissza a programhoz', 'btn primary'), link('#/log', 'Napló', 'btn'))));
  }

  function show() {
    const st = steps[at];
    bar.value = at; count.textContent = `${at + 1} / ${total} lépés`;
    const nav = h('div', { class: 'row' },
      at > 0 ? btn('Vissza', back, 'small') : null,
      btn('Edzés befejezése most', () => { if (confirm('Befejezed most az edzést? A hátralévő lépések kimaradnak, de az edzés késznek számít.')) finish(); }, 'small'));
    const clock = h('div', { class: 'workout-clock', role: 'timer' });
    const draw = () => { clock.textContent = left >= 60 ? Math.floor(left / 60) + ':' + String(left % 60).padStart(2, '0') : String(left); };
    const run = () => {
      if (running) return;
      running = true;
      timer = setInterval(() => {
        left--; draw();
        if (left === 3) speak('három', voice.checked);
        if (left <= 0) next();
      }, tickMs());
    };
    if (st.type === 'rest') {
      const after = steps[at + 1];
      left = st.seconds; draw();
      clear(stage).append(card(h('p', { class: 'workout-kicker' }, 'Pihenő'), clock,
        after ? h('p', null, 'Következik: ', h('strong', null, D.ex[after.exercise].name)) : null,
        h('div', { class: 'row' }, btn('Pihenő kihagyása', next, 'primary'))), nav);
      speak('Pihenő', voice.checked);
      run();
      return;
    }
    const ex = D.ex[st.exercise];
    const kicker = [D.exercises.typeNames[ex.type] === ex.name ? null : D.exercises.typeNames[ex.type], st.sets > 1 ? `${st.set}. kör / ${st.sets}` : null].filter(Boolean).join(' · ');
    const head = [kicker ? h('p', { class: 'workout-kicker' }, kicker) : null, h('h2', { class: 'workout-title' }, ex.name)];
    const points = h('ul', { class: 'plain' }, ex.points.map(p => h('li', null, p)));
    const more = link('#/ex/' + ex.id, 'Leírás és videó');
    if (st.seconds) {
      left = st.seconds; draw();
      const go = btn('Indítás', () => { go.hidden = true; pause.hidden = false; run(); }, 'primary');
      const pause = btn('Szünet', () => { if (running) { stop(); pause.textContent = 'Folytatás'; } else { pause.textContent = 'Szünet'; run(); } });
      pause.hidden = true;
      clear(stage).append(card(head, st.side ? h('p', { class: 'badge' }, SIDE[st.side]) : null, clock, points,
        h('div', { class: 'row' }, go, pause, btn('Kész, tovább', next)), more), nav);
      speak(ex.name + (st.side ? ', ' + SIDE[st.side] : '') + ', ' + st.seconds + ' másodperc', voice.checked);
    } else {
      clear(stage).append(card(head, h('div', { class: 'workout-clock' }, String(st.reps)),
        h('p', { class: 'workout-unit' }, 'ismétlés' + (st.side === 'both' ? ' oldalanként' : '')), points,
        h('div', { class: 'row' }, btn('Kész, tovább', next, 'primary')), more), nav);
      speak(ex.name + ', ' + st.reps + ' ismétlés' + (st.side === 'both' ? ' oldalanként' : ''), voice.checked);
    }
  }
  show();
  return page(`${w}. hét · ${SESSION[session.key]}`,
    h('p', { class: 'muted' }, `Nagyjából ${sessionMinutes(steps)} perc · ${session.blocks.length} gyakorlat`),
    bar, h('div', { class: 'row tight workout-meta' }, count, h('label', { class: 'check' }, voice, h('span', null, 'Hangos bemondás'))),
    pain() ? note('Fájdalmat jeleztél: ha bármelyik gyakorlat fáj, hagyd ki.', 'warn') : null,
    stage);
}
