/* Közös felületi elemek és a „videó → elemzés” folyamat. */
import { h, clear, extLink } from './dom.js';
import * as pose from './pose.js';
import { D } from './data.js';

export const page = (title, ...kids) => h('div', { class: 'page' }, h('h1', null, title), kids);
export const card = (...kids) => h('section', { class: 'card' }, kids);
export const btn = (text, onclick, cls = '') => h('button', { type: 'button', class: 'btn ' + cls, onclick }, text);
export const link = (href, text, cls = '') => h('a', { href, class: cls }, text);
export const note = (text, cls = '') => h('p', { class: 'note ' + cls }, text);
export const list = items => h('ul', { class: 'plain' }, items.map(i => h('li', null, i)));

/* Választógombok (rádiócsoport). options: [[érték, felirat]] */
export function choice(name, options, value, onchange) {
  return h('div', { class: 'choice', role: 'radiogroup' }, options.map(([v, label]) =>
    h('label', { class: 'choice-item' },
      h('input', { type: 'radio', name, value: v, checked: v === value, onchange: () => onchange(v) }),
      h('span', null, label))));
}

/* A pózbecslés a tesztekben lecserélhető (valódi videó nélkül nem lehet determinisztikusan tesztelni). */
let runner = { analyzeVideo: pose.analyzeVideo, captureFrames: pose.captureFrames };
export const setRunner = r => { runner = { ...runner, ...r }; };
export const captureFrames = (...a) => runner.captureFrames(...a);

const ERR = {
  too_short: `A videó túl rövid. Legalább ${pose.MIN_SECONDS} másodperc kell.`,
  too_long: `A videó túl hosszú. Legfeljebb ${pose.MAX_SECONDS} másodperces felvételt tudok elemezni: vágd rövidebbre.`,
};

/* Videóválasztó és feldolgozás. onResult({ blob, frames, aspect, duration }) a hívó dolga; hibánál itt írjuk ki. */
export function videoPicker(label, onResult) {
  const status = h('div', { class: 'picker-status', 'aria-live': 'polite' });
  const input = h('input', { type: 'file', accept: 'video/*', class: 'visually-hidden', onchange: () => run(input.files && input.files[0]) });
  const pick = h('label', { class: 'btn primary' }, label, input);
  const box = h('div', { class: 'picker' }, pick, status);
  async function run(file) {
    if (!file) return;
    if (!/^video\//.test(file.type || '')) { clear(status).append(note('Ez nem videófájl.', 'warn')); input.value = ''; return; }
    const bar = h('progress', { max: 1, value: 0 });
    const msg = h('span', null, 'A pózbecslő betöltése…');
    clear(status).append(h('div', { class: 'progress' }, bar, msg));
    pick.classList.add('disabled'); input.disabled = true;
    try {
      const r = await runner.analyzeVideo(file, p => { bar.value = p; msg.textContent = p >= 1 ? 'Számolás…' : 'Elemzés a készüléken: ' + Math.round(p * 100) + '%'; });
      await onResult({ blob: file, ...r }, t => { msg.textContent = t; });
    } catch (e) {
      console.error(e);
      clear(status).append(note(ERR[e && e.code] || 'Nem sikerült elemezni a videót. Próbáld meg másik felvétellel, vagy töltsd újra az oldalt.', 'warn'));
    } finally { pick.classList.remove('disabled'); input.disabled = false; input.value = ''; }
  }
  return { el: box, status };
}

/* A képkockák tárolható (kerekített) formája a visszajátszáshoz. */
export const packFrames = frames => frames.map(f => ({ t: Math.round(f.t * 1000) / 1000, lm: f.lm ? f.lm.map(p => p.map(v => Math.round(v * 1000) / 1000)) : null }));

export function videoLinks(ex) {
  const q = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(ex.query || ex.name);
  return h('div', { class: 'videos' },
    h('h3', null, 'Bemutató videók'),
    h('ul', { class: 'plain' },
      (ex.videos || []).map(v => h('li', null, extLink(v.url, v.title), h('span', { class: 'muted small' }, ' · YouTube'))),
      h('li', null, extLink(q, 'További videók keresése'))),
    D.exercises.reviewed ? null : note('A videókat cím alapján válogattuk, szakember még nem nézte át őket. Új lapon nyílnak, a YouTube-on.', 'small'));
}

const CONF = { high: 'Magabiztos', medium: 'Közepesen biztos', low: 'Bizonytalan' };
export const confBadge = c => h('span', { class: 'badge conf-' + c }, CONF[c] || c);
export const sourceBadge = coach => h('span', { class: 'badge' }, coach.source === 'ai' ? 'AI-edző' : 'Helyi elemzés');
