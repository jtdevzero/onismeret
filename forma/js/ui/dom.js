/* DOM-segédek. Minden szöveg textContentként kerül a lapra, soha nem HTML-ként: így az AI-válasz, a felhasználói
   bevitel és az importált adat nem tud kódot bejuttatni. */

/* h('div', { class: 'x', onclick: fn }, 'szöveg', gyerekElem, [tömb]) */
export function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  if (attrs) for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else if (k === 'class') el.className = v;
    else if (k === 'dataset') Object.assign(el.dataset, v);
    else if (k in el && k !== 'list' && k !== 'form') el[k] = v;
    else el.setAttribute(k, v === true ? '' : String(v));
  }
  append(el, kids);
  return el;
}
function append(el, kids) {
  for (const k of kids) {
    if (k == null || k === false) continue;
    if (Array.isArray(k)) append(el, k);
    else el.append(k instanceof Node ? k : document.createTextNode(String(k)));
  }
}
export function clear(el) { while (el.firstChild) el.removeChild(el.firstChild); return el; }

/* Külső hivatkozás: csak https, új lapon, hivatkozó (referrer) és opener nélkül. */
export function extLink(url, text, cls) {
  let ok = false;
  try { ok = new URL(url).protocol === 'https:'; } catch { ok = false; }
  if (!ok) return h('span', { class: cls }, text);
  return h('a', { href: url, target: '_blank', rel: 'noopener noreferrer', class: cls }, text);
}

export const fmtDate = ts => new Date(ts).toLocaleDateString('hu-HU', { year: 'numeric', month: 'short', day: 'numeric' });
export const fmtSec = s => (s >= 60 ? Math.floor(s / 60) + ' p ' + Math.round(s % 60) + ' mp' : Math.round(s) + ' mp');
export const uid = () => Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);

export function toast(msg) {
  const t = h('div', { class: 'toast', role: 'status' }, msg);
  document.body.append(t);
  setTimeout(() => t.remove(), 3500);
}
