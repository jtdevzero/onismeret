/* Eszközpróba és hibajelentés, valamint a kipróbálási lista. A jelentés csak kimásolható szöveg: magától nem megy sehova. */
import { h, toast } from './dom.js';
import { page, card, btn, link, note } from './widgets.js';
import { S } from './data.js';
import { kvGet, kvSet } from './store.js';

/* az utolsó hibák a memóriában (a jelentéshez); a felhasználói adatokat nem tartalmazzák */
const ERRORS = [];
export function initErrorLog() {
  const push = msg => { ERRORS.push(`${new Date().toISOString().slice(11, 19)} ${String(msg).slice(0, 300)}`); if (ERRORS.length > 15) ERRORS.shift(); };
  addEventListener('error', e => push(e.message || 'hiba'));
  addEventListener('unhandledrejection', e => push((e.reason && e.reason.message) || 'elutasított ígéret'));
}

async function probe() {
  const yes = b => (b ? 'van' : 'nincs');
  let storage = 'ismeretlen';
  try { const e = await navigator.storage.estimate(); storage = `${Math.round((e.usage || 0) / 1e6)} / ${Math.round((e.quota || 0) / 1e6)} MB`; } catch { /* nem minden böngésző tudja */ }
  let sw = 'nincs';
  try { const keys = await caches.keys(); sw = keys.filter(k => k.startsWith('forma-')).join(', ') || 'nincs'; } catch { /* privát mód */ }
  let pose = 'nem mértem';
  return {
    'Böngésző': navigator.userAgent,
    'Képernyő': `${screen.width}×${screen.height} @${devicePixelRatio}x, ${matchMedia('(orientation: landscape)').matches ? 'fekvő' : 'álló'}`,
    'Nyelv': navigator.language,
    'Telepítve (app módban)': yes(matchMedia('(display-mode: standalone)').matches || navigator.standalone),
    'Kamera': yes(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
    'Mozgásérzékelő': yes(typeof DeviceMotionEvent !== 'undefined'),
    'Képernyő ébren tartása': yes('wakeLock' in navigator),
    'Rezgés': yes('vibrate' in navigator),
    'Magyar hang': yes('speechSynthesis' in window && speechSynthesis.getVoices().some(v => /^hu/i.test(v.lang))),
    'Megosztás': yes(navigator.share),
    'Tárhely': storage,
    'Offline gyorsítótár': sw,
    'Téma, betűméret': `${S.settings && S.settings.theme || 'auto'}, ${S.settings && S.settings.size || 'normal'}`,
    'Pózbecslő': pose,
    'Legutóbbi hibák': ERRORS.length ? '\n  ' + ERRORS.join('\n  ') : 'nincs',
  };
}

export async function diagView() {
  const out = h('pre', { class: 'devlog', tabIndex: 0 }, 'Mérés…');
  const desc = h('textarea', { rows: 3, maxLength: 600, class: 'note-input', placeholder: 'Mit csináltál, és mi történt? (pl. a felugrásnál 60 cm-t mért, pedig kb. 30 lehetett)', 'aria-label': 'A hiba leírása' });
  const render = async () => { const p = await probe(); out.textContent = Object.entries(p).map(([k, v]) => `${k}: ${v}`).join('\n'); };
  await render();
  return page('Eszközpróba és hibajelentés',
    h('p', { class: 'muted' }, 'Ha valami nem működik jól, írd le röviden, másold ki a jelentést, és küldd el annak, aki az appot fejleszti. A jelentés nem tartalmazza a méréseidet és az edzéseidet, és magától nem megy sehova.'),
    card(h('label', { class: 'field' }, 'A hiba leírása', desc),
      h('div', { class: 'row' }, btn('Jelentés másolása', async () => {
        const text = `Forma hibajelentés\n\nLeírás: ${desc.value.trim() || '–'}\n\n${out.textContent}`;
        try { await navigator.clipboard.writeText(text); toast('Kimásoltam. Beillesztheted egy üzenetbe.'); } catch { toast('Nem sikerült a vágólapra másolni: jelöld ki a szöveget kézzel.'); }
      }, 'primary'), btn('Pózbecslő sebességének mérése', async () => {
        out.textContent += '\n\nPózbecslő betöltése…';
        try { const { benchmark } = await import('./pose.js'); const b = await benchmark(); out.textContent = out.textContent.replace('Pózbecslő: nem mértem', `Pózbecslő: betöltés ${b.loadMs} ms, képkocka ${b.frameMs} ms`).replace('\n\nPózbecslő betöltése…', ''); }
        catch (e) { out.textContent = out.textContent.replace('\n\nPózbecslő betöltése…', '') + '\nPózbecslő: nem sikerült betölteni (' + ((e && e.message) || 'hiba') + ')'; }
      }, 'small'))),
    card(h('h2', null, 'A készüléked'), out));
}

/* Kipróbálási lista: a valódi telefonos próba lépései, kipipálhatóan. */
const QA = [
  ['assess', 'Felmérés: legalább 6 teszt kitöltése, kiértékelés', '#/assess'],
  ['session', 'Egy teljes edzés végig, az utolsó körök értékelésével', '#/program'],
  ['camera', 'Kamerás számlálás: fekvőtámasz vagy guggolás a gyakorlatoldalon', '#/ex/squat'],
  ['jump', 'Felugrás magassága kamerával (Felmérés → Felugrás)', '#/test/vertical_jump'],
  ['posture', 'Testtartás szemből és oldalról', '#/posture'],
  ['reaction', 'Reakcióidő-teszt', '#/test/reaction'],
  ['sway', 'Egyensúly a gyorsulásmérővel', '#/test/sway'],
  ['pulse', 'Reggeli pulzus kamerával', '#/pulse'],
  ['run', 'Futóprogram: egy alkalom, a hangos váltások és a kadencia', '#/run'],
  ['backup', 'Mentés fájlba, majd visszatöltés', '#/settings'],
  ['install', 'Telepítés a kezdőképernyőre, és indítás repülő üzemmódban (offline)', '#/'],
];
export async function qaView() {
  const done = new Set((await kvGet('qa', [])) || []);
  const prog = h('p', { class: 'muted' });
  const upd = () => { prog.textContent = `${done.size} / ${QA.length} kipróbálva`; };
  upd();
  return page('Kipróbálási lista',
    h('p', { class: 'muted' }, 'A kamerás és érzékelős méréseket csak valódi telefonon lehet beállítani. Menj végig a listán; ahol valami furcsa, az Eszközpróba oldalon küldj jelentést.'),
    h('p', null, 'Kijelölt próbakészülék: iPhone 15 Pro Max. Külön ellenőrizendő a Safari, a kezdőképernyős app és az alkalmazáson belüli böngésző.'),
    h('p', null, link('docs/telefonos-ellenorzes.md', 'Részletes telefonos és kalibrációs jegyzőkönyv'), ' · ', link('docs/szakmai-atnezes.html', 'Nyomtatható szakmai anyag')),
    prog,
    card(h('ul', { class: 'rows' }, QA.map(([k, text, href]) => h('li', null,
      h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: done.has(k), onchange: async e => { if (e.target.checked) done.add(k); else done.delete(k); await kvSet('qa', [...done]); upd(); } }), h('span', null, text)),
      link(href, 'Megnyitás', 'btn small'))))),
    h('div', { class: 'row' }, link('#/diag', 'Eszközpróba és hibajelentés', 'btn primary')));
}
