/* Mentés fájlba és küldés e-mailben / megosztással. Az app semmit nem küld magától: a telefon megosztó ablakában
   te választod ki, hova kerüljön (például a levelezőbe, csatolmányként). */
import { h, toast } from './dom.js';
import { btn, card } from './widgets.js';
import { exportAll, kvGet, kvSet, itemsAll } from './store.js';
import { backupStatus, backupFileName } from '../core/backup-reminder.js';

async function backupFile() {
  const text = JSON.stringify(await exportAll(), null, 1);
  return new File([text], backupFileName(), { type: 'application/json' });
}
const mark = () => kvSet('lastBackup', Date.now()).catch(() => {});

export async function downloadBackup() {
  const f = await backupFile();
  const url = URL.createObjectURL(f), a = h('a', { href: url, download: f.name });
  document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 2000);
  await mark(); toast('Elmentettem: ' + f.name);
}

/* Megosztás: ahol a böngésző tud fájlt megosztani (iPhone, Android), a megosztó ablakból a levelező választható.
   Ahol nem, letöltjük a fájlt, és megnyitjuk a levelezőt egy előre kitöltött levéllel; a fájlt ilyenkor kézzel kell csatolni. */
export async function shareBackup() {
  const f = await backupFile();
  const text = 'A Forma mentésfájlja. Új telefonon: Forma → Beállítások → Visszatöltés fájlból.';
  try {
    if (navigator.canShare && navigator.canShare({ files: [f] })) {
      await navigator.share({ files: [f], title: 'Forma mentés', text });
      await mark(); toast('Elküldve.'); return;
    }
  } catch (e) { if (e && e.name === 'AbortError') return; }
  await downloadBackup();
  location.href = 'mailto:?subject=' + encodeURIComponent('Forma mentés ' + f.name.slice(13, 23)) + '&body=' + encodeURIComponent(text + '\n\nCsatold a most letöltött fájlt: ' + f.name);
  toast('Letöltöttem a fájlt; csatold a megnyíló levélhez.');
}

/* Tartós tárolás kérése: csökkenti az esélyét, hogy a böngésző helyhiány vagy használaton kívüliség miatt törölje az adatokat. */
export async function requestPersist() {
  try { if (navigator.storage && navigator.storage.persist && !(await navigator.storage.persisted())) return await navigator.storage.persist(); return navigator.storage ? await navigator.storage.persisted() : false; } catch { return false; }
}
export async function persistState() { try { return navigator.storage && navigator.storage.persisted ? await navigator.storage.persisted() : null; } catch { return null; } }

const fmt = ts => new Date(ts).toLocaleDateString('hu-HU');
/* Kezdőlapi emlékeztető kártya (csak ha esedékes) */
export async function backupReminderCard() {
  const [last, items, dismissed] = await Promise.all([kvGet('lastBackup', null), itemsAll(), kvGet('backupSnooze', 0)]);
  const st = backupStatus({ lastBackup: last, itemCount: items.length, dismissedUntil: dismissed });
  if (!st.due) return null;
  const el = card(h('h2', null, 'Mentsd el az adataidat'),
    h('p', { class: 'small' }, (st.never ? 'Még nem készítettél mentést.' : `Az utolsó mentés ${st.daysSince} napja volt (${fmt(last)}).`) + ' Minden adat csak ezen a telefonon van: ha a böngésző törli, vagy elveszik a telefon, a mentés nélkül elveszne.'),
    h('div', { class: 'row' }, btn('Küldés e-mailben', async () => { await shareBackup(); el.remove(); }, 'small'), btn('Mentés fájlba', async () => { await downloadBackup(); el.remove(); }, 'small'),
      btn('Később', async () => { await kvSet('backupSnooze', Date.now() + 3 * 86400000).catch(() => {}); el.remove(); }, 'small')));
  el.classList.add('backup-reminder');
  return el;
}

/* Beállítások: mentés, küldés, utolsó mentés dátuma, tartós tárolás állapota */
export async function backupSettingsBlock() {
  const last = await kvGet('lastBackup', null), persisted = await persistState();
  return h('div', null,
    h('p', { class: 'small muted' }, (last ? `Utolsó mentés: ${fmt(last)}.` : 'Még nincs mentésed.') + (persisted === true ? ' A böngésző tartós tárolást engedélyezett.' : persisted === false ? ' A böngésző nem garantálja a tartós tárolást; a rendszeres mentés különösen fontos.' : '')),
    h('div', { class: 'row' }, btn('Küldés e-mailben', shareBackup, 'primary'), btn('Mentés fájlba', downloadBackup)));
}
