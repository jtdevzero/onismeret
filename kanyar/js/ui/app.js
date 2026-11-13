/* Belépési pont: adatok betöltése, útválasztás a hash alapján. */
import { h, clear } from './dom.js';
import { loadData, S } from './data.js';
import { startView, homeView, learnView, lessonView, logView, settingsView } from './views-main.js';
import { prepView, programView, exerciseView } from './views-train.js';
import { snowView, analysisView } from './views-snow.js';

const main = document.getElementById('main'), nav = document.getElementById('nav');
const ROUTES = {
  '': homeView, start: startView, prep: prepView, program: programView, ex: exerciseView, snow: snowView,
  a: analysisView, learn: learnView, l: lessonView, log: logView, settings: settingsView,
};
const TAB = { '': '', prep: 'prep', program: 'prep', ex: 'prep', snow: 'snow', a: 'snow', learn: 'learn', l: 'learn', log: 'log', settings: 'settings' };
let cleanups = [], seq = 0;

async function route() {
  const my = ++seq;
  cleanups.splice(0).forEach(fn => { try { fn(); } catch (e) { console.error(e); } });
  const [name = '', arg] = location.hash.replace(/^#\/?/, '').split('/').map(decodeURIComponent);
  /* első indításkor, amíg nincs elfogadott beállítás, minden út a kezdőképernyőre visz */
  const ready = S.settings && S.settings.accepted;
  const key = !ready ? 'start' : Object.prototype.hasOwnProperty.call(ROUTES, name) ? name : '';
  nav.hidden = !ready || key === 'start';
  for (const a of nav.querySelectorAll('a')) { const on = a.dataset.tab === TAB[key]; a.classList.toggle('on', on); if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); }
  let view;
  try { view = await ROUTES[key](arg, fn => cleanups.push(fn)); }
  catch (e) { console.error(e); view = h('div', { class: 'page' }, h('h1', null, 'Hiba történt'), h('p', null, 'Ezt az oldalt most nem sikerült megjeleníteni. Töltsd újra az appot.')); }
  if (my !== seq) return; /* közben máshova navigáltak */
  clear(main).append(view);
  document.documentElement.dataset.view = location.hash;
  window.scrollTo(0, 0);
  const h1 = main.querySelector('h1');
  if (h1) { h1.tabIndex = -1; h1.focus({ preventScroll: true }); }
}

async function boot() {
  try { await loadData(); }
  catch (e) { console.error(e); clear(main).append(h('div', { class: 'page' }, h('h1', null, 'Nem sikerült betölteni'), h('p', null, 'Ellenőrizd az internetkapcsolatot, és töltsd újra az oldalt.'))); return; }
  addEventListener('hashchange', route);
  await route();
  document.documentElement.dataset.ready = '1';
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
}
boot();
