/* Eszközpróba és hibajelentés, valamint a kipróbálási lista. A jelentés csak kimásolható szöveg: magától nem megy sehova. */
import { h, toast } from './dom.js';
import { page, card, btn, link, note } from './widgets.js';
import { S } from './data.js';
import { kvGet, kvSet } from './store.js';
import { tr } from './i18n.js';

/* az utolsó hibák a memóriában (a jelentéshez); a felhasználói adatokat nem tartalmazzák */
const ERRORS = [];
export function initErrorLog() {
  const push = msg => { ERRORS.push(`${new Date().toISOString().slice(11, 19)} ${String(msg).slice(0, 300)}`); if (ERRORS.length > 15) ERRORS.shift(); };
  addEventListener('error', e => push(e.message || 'hiba'));
  addEventListener('unhandledrejection', e => push((e.reason && e.reason.message) || tr('elutasított ígéret')));
}

async function probe() {
  const yes = b => (b ? 'van' : 'nincs');
  let storage = 'ismeretlen';
  try { const e = await navigator.storage.estimate(); storage = `${Math.round((e.usage || 0) / 1e6)} / ${Math.round((e.quota || 0) / 1e6)} MB`; } catch { /* nem minden böngésző tudja */ }
  let sw = 'nincs';
  try { const keys = await caches.keys(); sw = keys.filter(k => k.startsWith('forma-')).join(', ') || 'nincs'; } catch { /* privát mód */ }
  let pose = tr('nem mértem');
  return {
    [tr('Böngésző')]: navigator.userAgent,
    [tr('Képernyő')]: `${screen.width}×${screen.height} @${devicePixelRatio}x, ${matchMedia('(orientation: landscape)').matches ? 'fekvő' : 'álló'}`,
    [tr('Nyelv')]: navigator.language,
    [tr('Telepítve (app módban)')]: yes(matchMedia('(display-mode: standalone)').matches || navigator.standalone),
    [tr('Kamera')]: yes(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
    [tr('Mozgásérzékelő')]: yes(typeof DeviceMotionEvent !== 'undefined'),
    [tr('Képernyő ébren tartása')]: yes('wakeLock' in navigator),
    [tr('Rezgés')]: yes('vibrate' in navigator),
    [tr('Magyar hang')]: yes('speechSynthesis' in window && speechSynthesis.getVoices().some(v => /^hu/i.test(v.lang))),
    [tr('Megosztás')]: yes(navigator.share),
    [tr('Tárhely')]: storage,
    [tr('Offline gyorsítótár')]: sw,
    [tr('Téma, betűméret')]: `${S.settings && S.settings.theme || 'auto'}, ${S.settings && S.settings.size || 'normal'}`,
    [tr('Pózbecslő')]: pose,
    [tr('Legutóbbi hibák')]: ERRORS.length ? '\n  ' + ERRORS.join('\n  ') : 'nincs',
  };
}

export async function diagView() {
  const out = h('pre', { class: 'devlog', tabIndex: 0 }, tr('Mérés…'));
  const desc = h('textarea', { rows: 3, maxLength: 600, class: 'note-input', placeholder: tr('Mit csináltál, és mi történt? (pl. a felugrásnál 60 cm-t mért, pedig kb. 30 lehetett)'), 'aria-label': tr('A hiba leírása') });
  const render = async () => { const p = await probe(); out.textContent = Object.entries(p).map(([k, v]) => `${k}: ${v}`).join('\n'); };
  await render();
  return page(tr('Eszközpróba és hibajelentés'),
    h('p', { class: 'muted' }, tr('Ha valami nem működik jól, írd le röviden, másold ki a jelentést, és küldd el annak, aki az appot fejleszti. A jelentés nem tartalmazza a méréseidet és az edzéseidet, és magától nem megy sehova.')),
    card(h('label', { class: 'field' }, tr('A hiba leírása'), desc),
      h('div', { class: 'row' }, btn(tr('Jelentés másolása'), async () => {
        const text = tr('Forma hibajelentés\n\nLeírás: {p0}\n\n{p1}', { p0: desc.value.trim() || '–', p1: out.textContent });
        try { await navigator.clipboard.writeText(text); toast('Kimásoltam. Beillesztheted egy üzenetbe.'); } catch { toast('Nem sikerült a vágólapra másolni: jelöld ki a szöveget kézzel.'); }
      }, 'primary'), btn(tr('Pózbecslő sebességének mérése'), async () => {
        out.textContent += tr('\n\nPózbecslő betöltése…');
        try { const { benchmark } = await import('./pose.js'); const b = await benchmark(); out.textContent = out.textContent.replace(tr('Pózbecslő: nem mértem'), tr('Pózbecslő: betöltés {p0} ms, képkocka {p1} ms', { p0: b.loadMs, p1: b.frameMs })).replace(tr('\n\nPózbecslő betöltése…'), ''); }
        catch (e) { out.textContent = out.textContent.replace(tr('\n\nPózbecslő betöltése…'), '') + tr('\nPózbecslő: nem sikerült betölteni (') + ((e && e.message) || 'hiba') + ')'; }
      }, 'small'))),
    card(h('h2', null, tr('A készüléked')), out));
}

/* Kipróbálási lista: a valódi telefonos próba lépései, kipipálhatóan. */
const QA = [
  ['assess', tr('Felmérés: legalább 6 teszt kitöltése, kiértékelés'), '#/assess'],
  ['session', tr('Egy teljes edzés végig, az utolsó körök értékelésével'), '#/program'],
  ['camera', tr('Kamerás számlálás: fekvőtámasz vagy guggolás a gyakorlatoldalon'), '#/ex/squat'],
  ['jump', tr('Felugrás magassága kamerával (Felmérés → Felugrás)'), '#/test/vertical_jump'],
  ['posture', tr('Testtartás szemből és oldalról'), '#/posture'],
  ['reaction', tr('Reakcióidő-teszt'), '#/test/reaction'],
  ['sway', tr('Egyensúly a gyorsulásmérővel'), '#/test/sway'],
  ['pulse', tr('Reggeli pulzus kamerával'), '#/pulse'],
  ['run', tr('Futóprogram: egy alkalom, a hangos váltások és a kadencia'), '#/run'],
  ['backup', tr('Mentés fájlba, majd visszatöltés'), '#/settings'],
  ['install', tr('Telepítés a kezdőképernyőre, és indítás repülő üzemmódban (offline)'), '#/'],
];
export async function qaView() {
  const done = new Set((await kvGet('qa', [])) || []);
  const prog = h('p', { class: 'muted' });
  const upd = () => { prog.textContent = tr('{p0} / {p1} kipróbálva', { p0: done.size, p1: QA.length }); };
  upd();
  return page(tr('Kipróbálási lista'),
    h('p', { class: 'muted' }, tr('A kamerás és érzékelős méréseket csak valódi telefonon lehet beállítani. Menj végig a listán; ahol valami furcsa, az Eszközpróba oldalon küldj jelentést.')),
    prog,
    card(h('ul', { class: 'rows' }, QA.map(([k, text, href]) => h('li', null,
      h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: done.has(k), onchange: async e => { if (e.target.checked) done.add(k); else done.delete(k); await kvSet('qa', [...done]); upd(); } }), h('span', null, text)),
      link(href, tr('Megnyitás'), 'btn small'))))),
    h('div', { class: 'row' }, link('#/diag', tr('Eszközpróba és hibajelentés'), 'btn primary')));
}
