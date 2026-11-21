/* Helyi tárolás IndexedDB-ben: beállítások és állapot (kv), felmérések és edzések (items).
   Minden adat a készüléken marad. Ha az IndexedDB nem érhető el (pl. privát ablak), memóriában dolgozunk tovább. */
const DB = 'forma', VERSION = 1;
let dbp = null;
const mem = { kv: new Map(), items: new Map() };

function open() {
  if (dbp) return dbp;
  dbp = new Promise(resolve => {
    try {
      const req = indexedDB.open(DB, VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains('kv')) db.createObjectStore('kv');
        if (!db.objectStoreNames.contains('items')) db.createObjectStore('items', { keyPath: 'id' });
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
      req.onblocked = () => resolve(null);
    } catch { resolve(null); }
  });
  return dbp;
}
async function tx(store, mode, fn) {
  const db = await open();
  if (!db) { const r = fn(null); return r ? r.result : undefined; }
  return new Promise((resolve, reject) => {
    const t = db.transaction(store, mode), req = fn(t.objectStore(store));
    t.oncomplete = () => resolve(req ? req.result : undefined);
    t.onerror = t.onabort = () => reject(t.error || new Error('Tárolási hiba'));
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
  for (const st of ['kv', 'items']) await tx(st, 'readwrite', s => (s ? s.clear() : (mem[st].clear(), null)));
}
/* Mentés fájlba: beállítások, program, felmérések és edzések. */
export async function exportAll() {
  return { app: 'forma', version: 1, exported: new Date().toISOString(), settings: await kvGet('settings', {}), program: await kvGet('program', null), items: await itemsAll() };
}

/* Visszatöltés ellenőrzött mentésből (core/backup.js): minden meglévő adat helyére. */
export async function restoreAll({ settings, program, items }) {
  await wipeAll();
  if (settings) await kvSet('settings', settings);
  if (program) await kvSet('program', program);
  for (const it of items) await itemPut(it);
}
