/* Testtartás-ellenőrzés kamerával: szemből és oldalról egy-egy rövid álló felvétel (csak testpontok, kép nélkül). */
import { h, clear, uid, fmtDate, toast } from './dom.js';
import { page, card, btn, link, note, openCamera, liveCountdown, speak } from './widgets.js';
import { D } from './data.js';
import { itemPut, itemsAll } from './store.js';
import { getProgram, setProgram } from './state.js';
import { analyzePosture, POSTURE_NAMES, POSTURE_FIX } from '../core/posture.js';
import { tr } from './i18n.js';

const HOLD = 3; /* ennyi másodpercig mérünk */
const VIEWS = [['front', tr('Szemből'), tr('Állj szemben a telefonnal, 2–3 méterre, egyenesen, karok lazán a test mellett. Ne igazodj ki szándékosan: úgy állj, ahogy szoktál.')],
  ['side', tr('Oldalról'), tr('Fordulj oldalra (a telefon a jobb vagy a bal oldaladnál), és nézz előre, ahogy szoktál.')]];

/* egy nézet felvétele: visszaszámlálás, majd HOLD másodpercnyi képkocka → elemzés */
async function capture(view, statusEl) {
  let cam;
  try { cam = await openCamera(); } catch (e) { clear(statusEl).append(note(e && e.code === 'camera_denied' ? tr('Nem kaptam engedélyt a kamerához.') : tr('Nem sikerült elindítani a kamerát.'), 'warn')); return null; }
  const stage = h('div', { class: 'live-stage' }, cam.el || null, h('div', { class: 'live-hud' }, h('div', { class: 'live-count', role: 'status' }, '…')));
  clear(statusEl).append(stage);
  const hud = stage.querySelector('.live-count'), frames = [], wait = liveCountdown();
  let t0 = null, said = -1;
  try {
    for (;;) {
      const f = await cam.read();
      if (!f) break;
      if (t0 == null) t0 = f.t;
      const el = f.t - t0, left = Math.ceil(wait - el);
      if (left > 0) { hud.textContent = String(left); if (left !== said) { said = left; if (left <= 3) speak(String(left)); } continue; }
      hud.textContent = tr('mérés'); frames.push({ t: el - wait, lm: f.lm });
      if (el - wait >= HOLD) break;
    }
  } finally { cam.close(); }
  clear(statusEl);
  return analyzePosture(frames, view, cam.aspect || 1);
}

export async function postureView(arg, onCleanup) {
  const past = (await itemsAll('posture')).slice(0, 3), res = {};
  const out = h('div', { 'aria-live': 'polite' });
  const cards = VIEWS.map(([id, title, how]) => {
    const status = h('div'), done = h('p', { class: 'small' });
    const go = btn(tr('{p0}: mérés', { p0: title }), async () => {
      go.disabled = true;
      const r = await capture(id, status);
      go.disabled = false;
      if (!r) return;
      if (!r.ok) { clear(status).append(note(tr('Nem láttalak elég jól. Állj távolabb, hogy tetőtől talpig beleférj, és legyen elég fény.'), 'warn')); return; }
      res[id] = r; done.textContent = '✓ Megvan.'; speak(tr('Megvan.'));
      if (res.front && res.side) show();
    }, 'primary');
    return card(h('h2', null, title), h('p', { class: 'small' }, how), h('div', { class: 'row' }, go), status, done);
  });
  async function show() {
    const metrics = { ...res.front.metrics, ...res.side.metrics };
    await itemPut({ id: uid(), kind: 'posture', date: Date.now(), metrics: Object.fromEntries(Object.entries(metrics).map(([k, m]) => [k, { value: m.value, band: m.band }])) });
    const fixes = Object.entries(metrics).filter(([, m]) => m.band === 'fix').map(([k]) => k);
    clear(out).append(card(h('h2', null, tr('Eredmény')),
      h('ul', { class: 'rows' }, Object.entries(metrics).map(([k, m]) => h('li', null, h('span', { class: 'log-item' }, h('strong', null, POSTURE_NAMES[k]), h('span', { class: 'muted small' }, `${m.value}${m.unit}`)), h('span', { class: 'badge ' + (m.band === 'ok' ? 'good' : 'warn') }, m.band === 'ok' ? tr('Rendben') : tr('Figyelj rá'))))),
      fixes.length ? h('div', null, h('h3', null, tr('Mit tehetsz')), fixes.map(k => h('p', null, POSTURE_FIX[k].text + ' ', ...POSTURE_FIX[k].exercises.filter(id => D.ex[id]).map((id, i) => [i ? ', ' : '', link('#/ex/' + id, D.ex[id].name)]))),
        h('div', { class: 'row' }, btn(tr('Vegye fel a programom a fókuszba'), async () => {
          const prog = await getProgram();
          if (!prog) { toast('Előbb készíts programot a felmérésből.'); return; }
          const targets = [...new Set([...fixes.map(k => POSTURE_FIX[k].target), ...(prog.targets || [])])];
          await setProgram({ ...prog, targets });
          toast('A napi mobilitás mostantól ezekre is fókuszál.');
        }))) : h('p', null, tr('Szép, egyenes tartás. Hathetente érdemes megismételni.')),
      note(tr('Tájékoztató mérés egy álló helyzetről, nem diagnózis. Tartós fájdalom vagy feltűnő aszimmetria esetén kérj gyógytornászt.'), 'small')));
    out.scrollIntoView({ behavior: 'smooth' });
  }
  return page(tr('Testtartás'),
    h('p', { class: 'muted' }, tr('Két rövid, {p0} másodperces álló mérés kamerával. A kamera képét nem rögzítem és nem küldöm sehova: csak a testpontokat mérem a telefonon.', { p0: HOLD })),
    cards, out,
    past.length ? card(h('h2', null, tr('Korábbi mérések')), h('ul', { class: 'rows' }, past.map(p => h('li', null, h('span', null, fmtDate(p.date)),
      h('span', { class: 'muted small' }, Object.entries(p.metrics).map(([k, m]) => `${POSTURE_NAMES[k]}: ${m.band === 'ok' ? 'rendben' : 'figyelj rá'}`).join(' · ')))))) : null);
}
