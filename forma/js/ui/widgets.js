/* Közös felületi elemek, hang és időzítő. */
import { h, extLink } from './dom.js';

export const page = (title, ...kids) => h('div', { class: 'page' }, h('h1', null, title), kids);
export const card = (...kids) => h('section', { class: 'card' }, kids);
export const btn = (text, onclick, cls = '') => h('button', { type: 'button', class: 'btn ' + cls, onclick }, text);
export const link = (href, text, cls = '') => h('a', { href, class: cls }, text);
export const note = (text, cls = '') => h('p', { class: 'note ' + cls }, text);
export const list = items => h('ul', { class: 'plain' }, items.map(i => h('li', null, i)));

/* Választógombok (rádiócsoport). options: [[érték, felirat]] */
export function choice(name, options, value, onchange, label) {
  return h('div', { class: 'choice', role: 'radiogroup', 'aria-label': label }, options.map(([v, text]) =>
    h('label', { class: 'choice-item' },
      h('input', { type: 'radio', name, value: String(v), checked: v === value, onchange: () => onchange(v) }),
      h('span', null, text))));
}

/* Az időzítő üteme a tesztekben felgyorsítható. */
let tick = 1000;
export const setTick = ms => { tick = ms; };
export const tickMs = () => tick;

export function speak(text, enabled = true) {
  if (!enabled || !('speechSynthesis' in window)) return;
  try { const u = new SpeechSynthesisUtterance(text); u.lang = 'hu-HU'; u.rate = 1.1; speechSynthesis.cancel(); speechSynthesis.speak(u); } catch { /* a hang nem létfontosságú */ }
}

/* Rövid hangjelzés (metronóm, időzítő vége). A hangkimenetet csak felhasználói mozdulat után indítjuk. */
let audio = null;
export function beep(freq = 880, ms = 90) {
  try {
    audio ||= new (window.AudioContext || window.webkitAudioContext)();
    const o = audio.createOscillator(), g = audio.createGain();
    o.frequency.value = freq; g.gain.value = 0.15;
    o.connect(g).connect(audio.destination);
    o.start(); o.stop(audio.currentTime + ms / 1000);
  } catch { /* hang nélkül is működik */ }
}

export function videoSearch(ex) {
  const q = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(ex.query || ex.name);
  return h('p', { class: 'small' }, extLink(q, 'Bemutató videók keresése a YouTube-on'), h('span', { class: 'muted' }, ' · új lapon nyílik'));
}

export const levelBadge = (level, text) => h('span', { class: 'badge ' + level }, text);
export const fmtNum = v => (Number.isInteger(v) ? String(v) : String(v).replace('.', ','));

/* A CSP nem enged style-attribútumot: a méretet a CSSOM-on át állítjuk. */
export const sized = (el, prop, pct) => { el.style[prop] = Number(pct).toFixed(1) + '%'; return el; };
