/* Belépési pont: adatok betöltése, útválasztás a hash alapján. */
import { h, clear } from './dom.js';
import { loadData, applyLook } from './data.js';
import { initHaptics } from './widgets.js';
import { settingsReady } from './state.js';
import { watchStorage } from './store.js';
import { downloadBackup, requestPersist } from './backup-ui.js';
import { startView, homeView, logView, settingsView, moreView } from './views-main.js';
import { cardioView, checkView } from './views-cardio.js';
import { reviewView, cooldownView } from './views-wellness.js';
import { pulseView, challengeView, blocksView, reportView } from './views-extra.js';
import { diagView, qaView, initErrorLog } from './views-diag.js';
import { tr } from './i18n.js';

const main = document.getElementById('main'), nav = document.getElementById('nav');
const storageNotice = document.getElementById('storage-notice');
watchStorage(({ mode, writeError }) => {
  clear(storageNotice);
  storageNotice.hidden = mode !== 'memory' && !writeError;
  if (storageNotice.hidden) return;
  storageNotice.append(h('strong', null, mode === 'memory' ? tr('Az adatok most csak ideiglenesen tárolódnak.') : tr('Egy mentés nem sikerült.')),
    h('p', null, mode === 'memory' ? tr('A böngésző tartós tárolója nem érhető el. Az oldal bezárásakor vagy újratöltésekor az adataid elvesznek. Ments fájlba, mielőtt kilépsz.') : tr('A legutóbbi változtatások egy része nem került a tartós tárolóba. A mentett előzményekből készíts fájlos másolatot, és ellenőrizd az utolsó bejegyzést.')),
    h('button', { type: 'button', class: 'btn small', onclick: async () => {
      await downloadBackup();
    } }, tr('Mentés fájlba')),
    h('a', { href: '#/settings' }, tr('Beállítások')));
});
/* A ritkábban vagy később megnyitott képernyők csak megnyitáskor töltődnek be (gyorsabb első indulás);
   a service worker ezeket is az offline csomagba teszi. */
const lazy = (load, name) => async (arg, onCleanup) => (await load())[name](arg, onCleanup);
const A = () => import('./views-assess.js'), T = () => import('./views-train.js'), P = () => import('./views-progress.js');
const L = () => import('./views-library.js');
const assessView = lazy(A, 'assessView'), testView = lazy(A, 'testView'), resultView = lazy(A, 'resultView');
const programView = lazy(T, 'programView'), sessionView = lazy(T, 'sessionView'), exerciseView = lazy(T, 'exerciseView');
const progressView = lazy(P, 'progressView'), miniView = lazy(P, 'miniView');
const runView = lazy(() => import('./views-run.js'), 'runView'), postureView = lazy(() => import('./views-posture.js'), 'postureView');
const libraryView = lazy(L, 'libraryView'), routinesView = lazy(L, 'routinesView'), customView = lazy(L, 'customView');
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
  catch (e) { console.error(e); view = h('div', { class: 'page' }, h('h1', null, tr('Hiba történt')), h('p', null, tr('Ezt az oldalt most nem sikerült megjeleníteni. Töltsd újra az appot.'))); }
  if (my !== seq) return; /* közben máshova navigáltak */
  clear(main).append(view);
  document.documentElement.dataset.view = location.hash;
  window.scrollTo(0, 0);
  const h1 = main.querySelector('h1');
  if (h1) { h1.tabIndex = -1; h1.focus({ preventScroll: true }); }
}

initErrorLog();

/* aktív edzés, mérés vagy futás közben a frissítés csak megerősítéssel indul (ami még nincs mentve, elveszne) */
const busy = () => /^#\/(session|test|run|mini|cooldown|pulse|posture)(\/|$)/.test(location.hash);
let updateRequested = false;
function updateBanner(reg) {
  if (document.querySelector('.update-bar')) return;
  const bar = h('div', { class: 'update-bar', role: 'status' }, h('span', null, tr('Új változat érhető el.')),
    h('button', { type: 'button', class: 'btn small light', onclick: () => {
      if (busy() && !confirm(tr('Most egy edzés, mérés vagy futás fut. A frissítés megszakítja, és ami még nincs elmentve, elveszhet. Frissítesz most?'))) return;
      if (!reg.waiting) { bar.remove(); return; }
      updateRequested = true;
      reg.waiting.postMessage({ type: 'SKIP_WAITING' });
    } }, tr('Frissítés')),
    h('button', { type: 'button', class: 'btn small', 'aria-label': tr('Később'), onclick: () => bar.remove() }, '×'));
  document.body.append(bar);
}

async function boot() {
  try { await loadData(); applyLook(); initHaptics(); }
  catch (e) { console.error(e); clear(main).append(h('div', { class: 'page' }, h('h1', null, tr('Nem sikerült betölteni')), h('p', null, tr('Ellenőrizd az internetkapcsolatot, és töltsd újra az oldalt.')))); return; }
  addEventListener('hashchange', route);
  await route();
  document.documentElement.dataset.ready = '1';
  /* tartós tárolás kérése, amint van mit megőrizni (a böngésző dönt; csendben, felugró ablak nélkül) */
  if (settingsReady()) requestPersist();
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    /* Az új worker várakozik, amíg a felhasználó kéri a frissítést.
       Az aktív edzés közben a régi cache marad irányítás alatt. */
    navigator.serviceWorker.addEventListener('controllerchange', () => { if (updateRequested) location.reload(); });
    navigator.serviceWorker.register('sw.js').then(reg => {
      if (reg.waiting && navigator.serviceWorker.controller) updateBanner(reg);
      reg.addEventListener('updatefound', () => {
        const installing = reg.installing;
        if (installing) installing.addEventListener('statechange', () => {
          if (installing.state === 'installed' && navigator.serviceWorker.controller) updateBanner(reg);
        });
      });
      setInterval(() => reg.update().catch(() => {}), 30 * 60000);
    }).catch(() => {});
  }
}
boot();
