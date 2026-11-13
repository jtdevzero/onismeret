/* Helyi tárolás IndexedDB-ben: beállítások (kv), elemzések (items), videók (videos).
   Minden adat a készüléken marad. Ha az IndexedDB nem érhető el (pl. privát ablak), memóriában dolgozunk tovább. */
const DB = 'kanyar', VERSION = 1;
const MAX_VIDEO = 80 * 1024 * 1024; /* ennél nagyobb videót nem mentünk el, csak az elemzés eredményét */
let dbp = null;
const mem = { kv: new Map(), items: new Map(), videos: new Map() };

function open() {
  if (dbp) return dbp;
  dbp = new Promise(resolve => {
    try {
      const req = indexedDB.open(DB, VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains('kv')) db.createObjectStore('kv');
        if (!db.objectStoreNames.contains('items')) db.createObjectStore('items', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('videos')) db.createObjectStore('videos');
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

export const itemPut = item => tx('items', 'readwrite', s => (s ? s.put(item) : (mem.items.set(item.id, item), null)));
export const itemGet = id => tx('items', 'readonly', s => (s ? s.get(id) : { result: mem.items.get(id) }));
export async function itemsAll() {
  const all = await tx('items', 'readonly', s => (s ? s.getAll() : { result: [...mem.items.values()] }));
  return (all || []).sort((a, b) => b.date - a.date);
}
export async function itemDelete(id) {
  await tx('items', 'readwrite', s => (s ? s.delete(id) : (mem.items.delete(id), null)));
  await tx('videos', 'readwrite', s => (s ? s.delete(id) : (mem.videos.delete(id), null)));
}

/* A videó mentése nem kötelező: ha túl nagy vagy nincs hely, az elemzés eredménye attól még megmarad. */
export async function videoPut(id, blob) {
  if (!blob || blob.size > MAX_VIDEO) return false;
  try { await tx('videos', 'readwrite', s => (s ? s.put(blob, id) : (mem.videos.set(id, blob), null))); return true; } catch { return false; }
}
export const videoGet = id => tx('videos', 'readonly', s => (s ? s.get(id) : { result: mem.videos.get(id) }));

export async function wipeAll() {
  for (const st of ['kv', 'items', 'videos']) await tx(st, 'readwrite', s => (s ? s.clear() : (mem[st].clear(), null)));
}
/* Mentés fájlba: beállítások és elemzések, videók nélkül. Az AI-szerver belépőkódja nem kerül bele. */
export async function exportAll() {
  const settings = { ...(await kvGet('settings', {})) };
  delete settings.ai;
  return { app: 'kanyar', version: 1, exported: new Date().toISOString(), settings, profileResults: await kvGet('assessment', {}), program: await kvGet('program', null), items: await itemsAll() };
}
