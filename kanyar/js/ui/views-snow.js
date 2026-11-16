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
import { recorder } from './recorder.js';

const VIEWS = [['side', 'Oldalról'], ['front', 'Szemből'], ['back', 'Hátulról']];
const viewName = v => (VIEWS.find(x => x[0] === v) || [0, v])[1].toLowerCase();

export async function snowView(_arg, onCleanup) {
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
  const film = recorder(blob => picker.run(blob));
  if (onCleanup) onCleanup(film.stop);
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
      picker.el,
      h('h3', null, 'Vagy vegyétek fel itt'), film.el),
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
    card(h('h2', null, 'Mérési adatok'),
      h('p', null, 'A testpontok és a mutatók letölthetők egy fájlba, videó és kép nélkül. Ebből lehet a határértékeket a valódi felvételeidhez igazítani.'),
      btn('Mérési adatok letöltése', () => {
        const data = { app: 'kanyar', kind: 'snow-measurement', date: new Date(it.date).toISOString(), sport: it.sport, view: it.view, level: it.level, analysis: a, coach: { main_issue: c.main_issue.id, confidence: c.confidence, source: c.source }, feedback: it.feedback || null, frames: it.frames || [] };
        const url = URL.createObjectURL(new Blob([JSON.stringify(data)], { type: 'application/json' }));
        const el = h('a', { href: url, download: 'kanyar-meres-' + it.id + '.json' });
        document.body.append(el); el.click(); el.remove(); setTimeout(() => URL.revokeObjectURL(url), 5000);
      })),
    h('div', { class: 'row' }, link('#/day', 'Mai terv a hegyen', 'btn primary'), btn('Eredmény megosztása', () => shareCard(it)), link('#/snow', 'Új elemzés', 'btn'), link('#/log', 'Napló', 'btn'),
      btn('Törlés', async () => { if (confirm('Törlöd ezt az elemzést és a hozzá mentett videót?')) { await itemDelete(id); toast('Törölve.'); location.hash = '#/log'; } }, 'danger')));
}

/* Sortörés a vászonra: a szöveget a megadott szélességhez tördeli. */
function wrap(ctx, text, max) {
  const lines = [];
  let line = '';
  for (const word of String(text).split(/\s+/)) {
    const t = line ? line + ' ' + word : word;
    if (ctx.measureText(t).width > max && line) { lines.push(line); line = word; } else line = t;
  }
  if (line) lines.push(line);
  return lines;
}
/* Megosztható eredménykártya: kép az elemzés lényegével. Videó, arc és mérési adat nincs rajta. */
export async function shareCard(it) {
  const W = 1080, H = 1350, c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d');
  const grad = g.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, '#0b2545'); grad.addColorStop(0.6, '#13539a'); grad.addColorStop(1, '#2f8fd8');
  g.fillStyle = grad; g.fillRect(0, 0, W, H);
  g.fillStyle = 'rgba(255,255,255,.14)';
  g.beginPath(); g.moveTo(0, H); g.lineTo(260, H - 330); g.lineTo(420, H - 200); g.lineTo(640, H - 460); g.lineTo(860, H - 220); g.lineTo(W, H - 340); g.lineTo(W, H); g.closePath(); g.fill();
  g.fillStyle = '#ffd166'; g.beginPath(); g.arc(W - 150, 150, 62, 0, 7); g.fill();
  const F = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
  g.fillStyle = '#fff'; g.textBaseline = 'top';
  g.font = '800 96px ' + F; g.fillText('Kanyar', 80, 90);
  g.font = '600 40px ' + F; g.fillStyle = 'rgba(255,255,255,.85)';
  g.fillText(`${sportName(it.sport)} · ${fmtDate(it.date)}` + (it.analysis.turnCount ? ` · ${it.analysis.turnCount} kanyar` : ''), 80, 210);
  let y = 330;
  const block = (label, text, size, weight) => {
    g.font = '700 30px ' + F; g.fillStyle = '#ffd166'; g.fillText(label.toUpperCase(), 80, y); y += 50;
    g.font = `${weight} ${size}px ${F}`; g.fillStyle = '#fff';
    for (const line of wrap(g, text, W - 160).slice(0, 5)) { g.fillText(line, 80, y); y += Math.round(size * 1.28); }
    y += 46;
  };
  block('Ami jól megy', it.coach.strength, 46, 600);
  block(it.coach.main_issue.id ? 'Amin dolgozom' : 'Amit láttunk', it.coach.main_issue.what, 54, 800);
  if (it.coach.cue) block('Erre figyelek', it.coach.cue, 46, 600);
  g.font = '500 30px ' + F; g.fillStyle = 'rgba(255,255,255,.75)';
  g.fillText('Videóból, a telefonon elemezve · a mérés becslés', 80, H - 90);
  const blob = await new Promise(resolve => c.toBlob(resolve, 'image/png'));
  if (!blob) { toast('Nem sikerült elkészíteni a képet.'); return null; }
  const file = new File([blob], 'kanyar-eredmeny.png', { type: 'image/png' });
  try {
    if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: 'Kanyar' }); return blob; }
  } catch (e) { if (e && e.name === 'AbortError') return blob; }
  const url = URL.createObjectURL(blob), a = h('a', { href: url, download: 'kanyar-eredmeny.png' });
  document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 5000);
  return blob;
}
