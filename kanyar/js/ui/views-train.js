/* Felkészülés: mozgásfelmérés, program, gyakorlatok és a felvett gyakorlat elemzése. */
import { h, clear, uid, fmtSec, fmtDate, toast } from './dom.js';
import { page, card, btn, link, note, list, videoPicker, videoLinks, confBadge, sourceBadge, captureFrames } from './widgets.js';
import { D, S } from './data.js';
import { kvGet, kvSet, itemPut, itemsAll } from './store.js';
import { analyzeExercise, isAnalyzable } from '../core/exercise.js';
import { TESTS, buildProfile, buildProgram } from '../core/program.js';
import { prepCoach } from './coach-client.js';
import { liveCounter } from './live.js';

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
        h('label', { class: 'session-head' }, box, h('strong', null, `${i + 1}. edzés: ${SESSION[s.key]}`)),
        h('ol', { class: 'blocks' }, s.blocks.map(b => h('li', null, link('#/ex/' + b.exercise, D.ex[b.exercise].name), h('span', { class: 'muted' }, ' · ' + dose(b))))));
    })));
  return page('6 hetes program',
    note(prog.program.jumps ? 'A programban ugrások is vannak: csak puha, hangtalan érkezéssel csináld őket.' : 'A program ugrások nélkül készült.'),
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
