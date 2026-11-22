/* Helyi tárolás IndexedDB-ben: beállítások és állapot (kv), felmérések és edzések (items).
   Minden adat a készüléken marad. Ha az IndexedDB nem érhető el (pl. privát ablak), memóriában dolgozunk tovább. */
const DB = 'forma', VERSION = 1;
let dbp = null;
const mem = { kv: new Map(), items: new Map() };
let status = { mode: 'pending', writeError: false };
const listeners = new Set();
export const storageStatus = () => ({ ...status });
export function watchStorage(fn) {
  listeners.add(fn); fn(storageStatus());
  return () => listeners.delete(fn);
}
function report(patch) {
  status = { ...status, ...patch };
  for (const fn of listeners) fn(storageStatus());
}

function open() {
  if (dbp) return dbp;
  dbp = new Promise(resolve => {
    let settled = false;
    const finish = db => {
      if (settled) { if (db) db.close(); return; }
      settled = true; report({ mode: db ? 'persistent' : 'memory' }); resolve(db);
    };
    try {
      const req = indexedDB.open(DB, VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains('kv')) db.createObjectStore('kv');
        if (!db.objectStoreNames.contains('items')) db.createObjectStore('items', { keyPath: 'id' });
      };
      req.onsuccess = () => {
        const db = req.result;
        db.onversionchange = () => { db.close(); dbp = null; report({ mode: 'pending' }); };
        finish(db);
      };
      req.onerror = () => finish(null);
      req.onblocked = () => finish(null);
    } catch { finish(null); }
  });
  return dbp;
}
async function tx(store, mode, fn) {
  const db = await open();
  if (!db) { const r = fn(null); return r ? r.result : undefined; }
  return new Promise((resolve, reject) => {
    let t, req;
    const fail = e => { if (mode === 'readwrite') report({ writeError: true }); reject(e || new Error('Tárolási hiba')); };
    try {
      t = db.transaction(store, mode);
      t.oncomplete = () => resolve(req ? req.result : undefined);
      t.onerror = t.onabort = () => fail(t.error);
      req = fn(t.objectStore(store));
    } catch (e) { if (t) t.abort(); fail(e); }
  });
}

export const kvGet = async (key, fallback = null) => { const v = await tx('kv', 'readonly', s => (s ? s.get(key) : { result: mem.kv.get(key) })); return v === undefined ? fallback : v; };
export const kvSet = (key, value) => tx('kv', 'readwrite', s => (s ? s.put(value, key) : (mem.kv.set(key, value), null)));
export const kvDelete = key => tx('kv', 'readwrite', s => (s ? s.delete(key) : (mem.kv.delete(key), null)));

export const itemPut = item => tx('items', 'readwrite', s => (s ? s.put(item) : (mem.items.set(item.id, item), null)));
export const itemGet = id => tx('items', 'readonly', s => (s ? s.get(id) : { result: mem.items.get(id) }));
export async function itemsAll(kind) {
  const all = await tx('items', 'readonly', s => (s ? s.getAll() : { result: [...mem.items.values()] }));
  return (all || []).filter(i => !kind || i.kind === kind).sort((a, b) => b.date - a.date);
}
export const itemDelete = id => tx('items', 'readwrite', s => (s ? s.delete(id) : (mem.items.delete(id), null)));

export async function wipeAll() {
  await replaceAll({}, []);
}
/* Mentés fájlba: beállítások, program, felmérések és edzések. */
export async function exportAll() {
  return { app: 'forma', version: 1, exported: new Date().toISOString(), settings: await kvGet('settings', {}), program: await kvGet('program', null), run: await kvGet('run', null), nutrition: await kvGet('nutrition', null), favs: await kvGet('favs', null), custom: await kvGet('custom', null), items: await itemsAll() };
}

/* Visszatöltés ellenőrzött mentésből (core/backup.js): minden meglévő adat helyére. */
export async function restoreAll({ settings, program, run, nutrition, favs, custom, items }) {
  // Másolási/bemeneti hiba még a régi állomány érintése előtt derüljön ki.
  const data = structuredClone({ settings, program, run, nutrition, favs, custom, items });
  if (!Array.isArray(data.items) || data.items.some(it => !it || typeof it.id !== 'string' || !it.id)) throw new Error('Hibás visszatöltési adat.');
  const kv = Object.fromEntries(Object.entries(data).filter(([k, v]) => k !== 'items' && v != null));
  await replaceAll(kv, data.items);
}

/* Egyetlen tranzakció: megszakításkor a törlés és az összes írás együtt visszagördül. */
async function replaceAll(values, items) {
  const db = await open();
  const previousEpoch = epoch++;
  if (!db) {
    const kv = new Map(Object.entries(values)), nextItems = new Map(items.map(it => [it.id, it]));
    mem.kv = kv; mem.items = nextItems;
    return;
  }
  return new Promise((resolve, reject) => {
    let t;
    const fail = e => { if (epoch === previousEpoch + 1) epoch = previousEpoch; report({ writeError: true }); reject(e || new Error('A visszatöltés nem sikerült.')); };
    try {
      t = db.transaction(['kv', 'items'], 'readwrite');
      t.oncomplete = () => resolve();
      t.onerror = t.onabort = () => fail(t.error);
      const kv = t.objectStore('kv'), store = t.objectStore('items');
      kv.clear(); store.clear();
      for (const [key, value] of Object.entries(values)) kv.put(value, key);
      for (const it of items) store.put(it);
    } catch (e) { if (t) t.abort(); fail(e); }
  });
}

/* Edzésnapló és program együtt: sikertelen íráskor egyik sem lép tovább.
   A stabil azonosítóval ismételt befejezés sem növeli kétszer a programszámlálót. */
let epoch = 0;
export const storageEpoch = () => epoch;
export async function checkpointSession(draft, expectedEpoch) {
  const db = await open();
  if (expectedEpoch !== epoch) return false;
  if (!db) {
    if (mem.items.has(draft.id)) return false;
    mem.kv.set('activeSession', structuredClone(draft)); return true;
  }
  return new Promise((resolve, reject) => {
    const t = db.transaction(['kv', 'items'], 'readwrite');
    let written = false;
    t.oncomplete = () => resolve(written);
    t.onerror = t.onabort = () => { report({ writeError: true }); reject(t.error || new Error('Az edzésállás mentése nem sikerült.')); };
    const completed = t.objectStore('items').get(draft.id);
    completed.onsuccess = () => { if (!completed.result) { t.objectStore('kv').put(draft, 'activeSession'); written = true; } };
  });
}
export async function completeSession(item, program, expectedEpoch) {
  const db = await open();
  if (expectedEpoch !== epoch) throw new Error('Az adatok közben megváltoztak. Nyisd meg újra az edzést.');
  if (!db) {
    if (mem.items.has(item.id)) return;
    mem.items.set(item.id, structuredClone(item));
    if (program) mem.kv.set('program', structuredClone(program));
    mem.kv.delete('activeSession'); return;
  }
  await new Promise((resolve, reject) => {
    const t = db.transaction(['kv', 'items'], 'readwrite');
    t.oncomplete = resolve;
    t.onerror = t.onabort = () => { report({ writeError: true }); reject(t.error || new Error('Az edzés mentése nem sikerült.')); };
    const store = t.objectStore('items'), kv = t.objectStore('kv');
    const old = store.get(item.id);
    old.onsuccess = () => {
      if (old.result) return;
      store.put(item); if (program) kv.put(program, 'program'); kv.delete('activeSession');
    };
  });
}
