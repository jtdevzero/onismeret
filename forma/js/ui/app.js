/* Belépési pont: adatok betöltése, útválasztás a hash alapján. */
import { h, clear } from './dom.js';
import { loadData, applyLook } from './data.js';
import { initHaptics } from './widgets.js';
import { settingsReady } from './state.js';
import { watchStorage, exportAll } from './store.js';
import { startView, homeView, logView, settingsView, moreView } from './views-main.js';
import { assessView, testView, resultView } from './views-assess.js';
import { programView, sessionView, exerciseView } from './views-train.js';
import { cardioView, checkView } from './views-cardio.js';
import { progressView, miniView } from './views-progress.js';
import { runView } from './views-run.js';
import { reviewView, cooldownView } from './views-wellness.js';
import { libraryView, routinesView, customView } from './views-library.js';
import { postureView } from './views-posture.js';
import { pulseView, challengeView, blocksView, reportView } from './views-extra.js';
import { diagView, qaView, initErrorLog } from './views-diag.js';

const main = document.getElementById('main'), nav = document.getElementById('nav');
const storageNotice = document.getElementById('storage-notice');
watchStorage(({ mode, writeError }) => {
  clear(storageNotice);
  storageNotice.hidden = mode !== 'memory' && !writeError;
  if (storageNotice.hidden) return;
  storageNotice.append(h('strong', null, mode === 'memory' ? 'Az adatok most csak ideiglenesen tárolódnak.' : 'Egy mentés nem sikerült.'),
    h('p', null, mode === 'memory' ? 'A böngésző tartós tárolója nem érhető el. Az oldal bezárásakor vagy újratöltésekor az adataid elvesznek. Ments fájlba, mielőtt kilépsz.' : 'A legutóbbi változtatások egy része nem került a tartós tárolóba. A mentett előzményekből készíts fájlos másolatot, és ellenőrizd az utolsó bejegyzést.'),
    h('button', { type: 'button', class: 'btn small', onclick: async () => {
      const url = URL.createObjectURL(new Blob([JSON.stringify(await exportAll(), null, 1)], { type: 'application/json' }));
      const a = h('a', { href: url, download: 'forma-mentes.json' });
      document.body.append(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    } }, 'Mentés fájlba'),
    h('a', { href: '#/settings' }, 'Beállítások'));
});
const ROUTES = {
  '': homeView, start: startView, assess: assessView, test: testView, result: resultView,
  program: programView, session: sessionView, ex: exerciseView, log: logView, settings: settingsView, cardio: cardioView, check: checkView, progress: progressView, mini: miniView, run: runView, more: moreView, review: reviewView, cooldown: cooldownView, library: libraryView, routines: routinesView, custom: customView, posture: postureView, pulse: pulseView, challenge: challengeView, blocks: blocksView, report: reportView, diag: diagView, qa: qaView,
};
const TAB = { '': '', program: 'program', session: 'program', ex: 'program', check: 'program', progress: 'progress', mini: 'progress', result: 'progress', assess: 'more', test: 'more', cardio: 'more', run: 'more', log: 'more', settings: 'more', more: 'more', review: 'progress', cooldown: 'program', library: 'more', routines: 'more', custom: 'more', posture: 'more', pulse: 'more', challenge: 'more', blocks: 'more', report: 'more', diag: 'more', qa: 'more' };
let cleanups = [], seq = 0;

async function route() {
  const my = ++seq;
  cleanups.splice(0).forEach(fn => { try { fn(); } catch (e) { console.error(e); } });
  /* hibás %-kódolású címnél se dőljön el az app: a dekódolhatatlan részt változatlanul hagyjuk */
  const safe = s => { try { return decodeURIComponent(s); } catch { return s; } };
  const [name = '', arg] = location.hash.replace(/^#\/?/, '').split('/').map(safe);
  /* első indításkor, amíg nincs elfogadott beállítás, minden út a kezdőképernyőre visz */
  const ready = settingsReady();
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

initErrorLog();

function updateBanner() {
  if (document.querySelector('.update-bar')) return;
  const bar = h('div', { class: 'update-bar', role: 'status' }, h('span', null, 'Új változat érhető el.'),
    h('button', { type: 'button', class: 'btn small light', onclick: () => location.reload() }, 'Frissítés'),
    h('button', { type: 'button', class: 'btn small', 'aria-label': 'Később', onclick: () => bar.remove() }, '×'));
  document.body.append(bar);
}

async function boot() {
  try { await loadData(); applyLook(); initHaptics(); }
  catch (e) { console.error(e); clear(main).append(h('div', { class: 'page' }, h('h1', null, 'Nem sikerült betölteni'), h('p', null, 'Ellenőrizd az internetkapcsolatot, és töltsd újra az oldalt.'))); return; }
  addEventListener('hashchange', route);
  await route();
  document.documentElement.dataset.ready = '1';
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    /* új változat: a service worker azonnal átveszi az irányítást; szólunk, de nem töltünk újra magunktól (edzés közben se szakadjon meg) */
    const hadController = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.addEventListener('controllerchange', () => { if (hadController) updateBanner(); });
    navigator.serviceWorker.register('sw.js').then(reg => { setInterval(() => reg.update().catch(() => {}), 30 * 60000); }).catch(() => {});
  }
}
boot();
