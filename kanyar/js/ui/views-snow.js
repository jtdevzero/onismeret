/* Havas elemzés: videó feltöltése, eredményoldal rárajzolt visszajátszással. */
import { h, clear, uid, fmtDate, toast } from './dom.js';
import { page, card, btn, link, note, choice, videoPicker, confBadge, sourceBadge, captureFrames, packFrames } from './widgets.js';
import { D, S, sportName, levelName } from './data.js';
import { itemPut, itemGet, itemsAll, itemDelete, videoPut, videoGet } from './store.js';
import { analyzeRun, RELIABLE } from '../core/snow.js';
import { snowCoach } from './coach-client.js';
import { compareRuns } from '../core/compare.js';
import { getProfile } from './views-train.js';
import { replay } from './overlay.js';

const VIEWS = [['side', 'Oldalról'], ['front', 'Szemből'], ['back', 'Hátulról']];
const viewName = v => (VIEWS.find(x => x[0] === v) || [0, v])[1].toLowerCase();

export async function snowView() {
  const form = { sport: S.settings.sport, view: 'side', travel: 'right' };
  const extra = h('div');
  const drawExtra = () => {
    clear(extra);
    if (form.sport === 'snowboard' && form.view === 'side') extra.append(
      h('h3', null, 'Merre haladsz a képen?'),
      choice('travel', [['right', 'Balról jobbra'], ['left', 'Jobbról balra']], form.travel, v => { form.travel = v; }),
      note('Snowboardon ebből tudom megítélni, hogy az elülső vagy a hátsó lábadon van-e a súlyod.', 'small'));
    extra.append(note(form.view === 'side'
      ? (form.sport === 'snowboard' ? 'Oldalról: keresztben haladj el a kamera előtt. Ebből a súlyelosztás, a térdek és a felsőtest látszik.' : 'Oldalról a tartás látszik: hátraülsz-e, mennyire hajlítasz.')
      : 'Szemből vagy hátulról a kanyarok látszanak: dőlés, a két irány különbsége, ritmus.', 'small'));
  };
  drawExtra();
  const picker = videoPicker('Videó felvétele vagy feltöltése', async ({ blob, frames, aspect }, say) => {
    const analysis = analyzeRun(frames, { aspect, sport: form.sport, view: form.view, travel: form.sport === 'snowboard' && form.view === 'side' ? form.travel : undefined });
    if (!analysis.ok) {
      clear(picker.status).append(note(analysis.reason === 'too_short'
        ? 'A felvételen túl rövid ideig látszottál. Legalább 3 másodperc folyamatos csúszás kell.'
        : 'Nem tudtam követni a mozgásodat. Filmezzetek közelebbről, hogy végig tetőtől talpig látsszál, és más ne takarjon el.', 'warn'),
        link('#/l/guide_filming', 'Filmezési útmutató'));
      return;
    }
    say('Visszajelzés készül…');
    const prev = (await itemsAll()).find(i => i.kind === 'snow' && i.sport === form.sport);
    const history = prev && prev.coach.main_issue.id ? { faultId: prev.coach.main_issue.id, drillId: prev.coach.drill_id } : null;
    let images = [];
    try { images = await captureFrames(blob, analysis.keyframes.slice(0, 5)); } catch { images = []; }
    const coach = await snowCoach(analysis, { level: S.settings.level, profile: await getProfile(), history }, images);
    const id = uid();
    const hasVideo = await videoPut(id, blob);
    await itemPut({ id, kind: 'snow', date: Date.now(), sport: form.sport, view: form.view, level: S.settings.level, analysis, coach, frames: packFrames(frames), hasVideo, thumb: images[0] || null });
    location.hash = '#/a/' + id;
  });
  return page('Havas elemzés',
    card(h('h2', null, 'Mit elemezzek?'),
      h('h3', null, 'Sportág'),
      choice('sport', [['ski', 'Sí'], ['snowboard', 'Snowboard']], form.sport, v => { form.sport = v; drawExtra(); }),
      h('h3', null, 'Honnan készült a felvétel?'),
      choice('view', VIEWS, form.view, v => { form.view = v; drawExtra(); }),
      extra),
    card(h('h2', null, 'Videó'),
      h('p', null, '10–30 másodperc, legalább 4–6 kanyar, a csúszó végig tetőtől talpig látszik. A telefont vízszintesen és egyenesen tartsátok.'),
      link('#/l/guide_filming', 'Részletes filmezési útmutató'),
      note('A videó a telefonodon marad; az elemzés a készüléken fut.', 'small'),
      picker.el),
    link('#/l/guide_limits', 'Mit tud és mit nem az elemzés?'));
}

function metricRows(a) {
  const M = D.faults.metricNames, B = D.faults.bandNames;
  const ids = Object.keys(a.metrics);
  const usable = ids.filter(id => a.metrics[id].usable), hidden = ids.filter(id => !a.metrics[id].usable);
  return [
    h('ul', { class: 'rows' }, usable.map(id => {
      const m = a.metrics[id], ok = m.confidence >= RELIABLE, bad = m.band !== 'ok';
      return h('li', { class: ok ? '' : 'dim' },
        h('span', null, M[id]),
        h('span', { class: 'row tight' },
          ok ? h('span', { class: 'badge ' + (bad ? 'warn' : 'good') }, (B[id] && B[id][m.band]) || m.band) : h('span', { class: 'badge' }, 'bizonytalan'),
          h('meter', { min: 0, max: 1, low: RELIABLE, optimum: 1, value: m.confidence, title: 'Megbízhatóság: ' + Math.round(m.confidence * 100) + '%' })));
    })),
    hidden.length ? note('Ebből a nézetből nem mérhető: ' + hidden.map(id => M[id].toLowerCase()).join(', ') + '.', 'small') : null,
    note('A sáv mellett a mérés megbízhatósága látható. A bizonytalan mutatókból nem vonok le következtetést.', 'small'),
  ];
}

export async function analysisView(id, onCleanup) {
  const it = await itemGet(id);
  if (!it || it.kind !== 'snow') return page('Nincs ilyen elemzés', link('#/log', '← Napló', 'btn'));
  const a = it.analysis, c = it.coach;
  const blob = it.hasVideo ? await videoGet(id) : null;
  let player = null;
  if (blob) { player = replay(blob, it.frames || [], a.turns); onCleanup(player.destroy); }
  /* a legutóbbi korábbi, összevethető elemzés (azonos sportág és nézet) */
  let cmpCard = null;
  for (const o of await itemsAll()) {
    if (o.kind !== 'snow' || o.date >= it.date) continue;
    const cmp = compareRuns(o.analysis, a);
    if (!cmp) continue;
    const M = D.faults.metricNames, B = D.faults.bandNames, LABEL = { better: 'Javult', worse: 'Romlott', same: 'Változatlan' };
    const order = { better: 0, worse: 1, same: 2 };
    cmpCard = card(h('h2', null, 'Változás az előző elemzéshez képest'),
      h('p', { class: 'muted' }, `Előző: ${fmtDate(o.date)} · ${cmp.better} javult, ${cmp.worse} romlott, ${cmp.same} változatlan`),
      cmp.rows.length
        ? h('ul', { class: 'rows' }, [...cmp.rows].sort((x, y) => order[x.change] - order[y.change]).map(r => h('li', null,
          h('span', null, M[r.id], h('span', { class: 'muted small' }, ` (${(B[r.id] && B[r.id][r.from]) || r.from} → ${(B[r.id] && B[r.id][r.to]) || r.to})`)),
          h('span', { class: 'badge ' + (r.change === 'better' ? 'good' : r.change === 'worse' ? 'warn' : '') }, LABEL[r.change]))))
        : note('Nincs olyan mutató, amely mindkét felvételen megbízhatóan mérhető volt.', 'small'),
      link('#/a/' + o.id, 'Az előző elemzés megnyitása'));
    break;
  }
  const drill = c.drill_id && D.lesson[c.drill_id], home = c.home_drill_id && D.ex[c.home_drill_id];
  const fb = h('div', { class: 'row' });
  const drawFb = () => {
    clear(fb).append(h('span', { class: 'muted' }, 'Hasznos volt ez a visszajelzés?'),
      ...[['yes', 'Igen'], ['no', 'Nem']].map(([v, t]) => h('button', { type: 'button', class: 'chip' + (it.feedback === v ? ' on' : ''), 'aria-pressed': String(it.feedback === v), onclick: async () => { it.feedback = v; await itemPut(it); drawFb(); } }, t)));
  };
  drawFb();
  return page(`${sportName(it.sport)} · ${fmtDate(it.date)}`,
    h('p', { class: 'muted' }, `Nézet: ${viewName(it.view)} · szint: ${levelName(it.sport, it.level)} · ${a.turnCount} kanyar · a képkockák ${Math.round(a.quality.tracked * 100)}%-án követhető`),
    player ? player.el : note('A videó nincs elmentve (túl nagy volt, vagy nem volt hely), ezért nincs visszajátszás.', 'small'),
    card(h('div', { class: 'row' }, h('h2', null, 'Visszajelzés'), sourceBadge(c), confBadge(c.confidence)),
      h('p', { class: 'lead' }, c.summary),
      h('h3', null, 'Ami jól megy'), h('p', null, c.strength),
      h('h3', null, c.main_issue.id ? 'A legfontosabb javítanivaló' : 'Amit látok'), h('p', null, c.main_issue.what), h('p', null, c.main_issue.why),
      c.cue ? h('p', { class: 'cue' }, c.cue) : null,
      drill ? h('p', null, 'Gyakorlat a következő csúszásra: ', link('#/l/' + drill.id, drill.title)) : null,
      home ? h('p', null, 'Otthoni gyakorlat hozzá: ', link('#/ex/' + home.id, home.name)) : null,
      c.progress ? h('p', null, c.progress) : null,
      c.reshoot_tip ? note(c.reshoot_tip, 'warn') : null,
      c.aiError ? note('Az AI-edzőt most nem sikerült elérni, ezért a helyi elemzést látod.', 'small') : null,
      fb),
    cmpCard,
    card(h('h2', null, 'Mért mutatók'), metricRows(a)),
    h('div', { class: 'row' }, link('#/snow', 'Új elemzés', 'btn primary'), link('#/log', 'Napló', 'btn'),
      btn('Törlés', async () => { if (confirm('Törlöd ezt az elemzést és a hozzá mentett videót?')) { await itemDelete(id); toast('Törölve.'); location.hash = '#/log'; } }, 'danger')));
}
