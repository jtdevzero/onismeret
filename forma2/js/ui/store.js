
import { tr } from './i18n.js';
import { BACKUP_VERSION } from '../core/backup.js';
import { backupDraft } from '../core/workout-draft.js';
/* Helyi tárolás IndexedDB-ben: beállítások és állapot (kv), felmérések és edzések (items).
   Minden adat a készüléken marad. Ha az IndexedDB nem érhető el (pl. privát ablak), memóriában dolgozunk tovább. */
/* Az előnézet saját tárolót kap: sem az élő Forma, sem a telefonon mentett
   korábbi edzések nem olvashatók/felülírhatók a forma2 belépési pontból. */
const DB = typeof location !== 'undefined' && /(?:^|\/)forma2(?:\/|$)/.test(location.pathname) ? 'forma2-preview' : 'forma', VERSION = 1;
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
      req.onsuccess = () => finish(req.result);
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
    const fail = e => { if (mode === 'readwrite') report({ writeError: true }); reject(e || new Error(tr('Tárolási hiba'))); };
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

/* Több kulcs és tétel egyetlen tranzakcióban (pl. edzés vége: program + naplóbejegyzés).
   Vagy minden íródik, vagy semmi; ugyanazzal az azonosítóval megismételve nem keletkezik duplikátum. */
export async function commit(values = {}, items = [], deleteKeys = []) {
  const data = structuredClone({ values, items, deleteKeys });
  if (data.items.some(it => !it || typeof it.id !== 'string' || !it.id)) throw new Error(tr('Hibás mentési adat.'));
  if (!Array.isArray(data.deleteKeys) || data.deleteKeys.some(k => typeof k !== 'string' || !k)) throw new Error(tr('Hibás törlési kulcs.'));
  const db = await open();
  if (!db) {
    for (const [k, v] of Object.entries(data.values)) mem.kv.set(k, v);
    for (const it of data.items) mem.items.set(it.id, it);
    for (const k of data.deleteKeys) mem.kv.delete(k);
    return;
  }
  return new Promise((resolve, reject) => {
    let t;
    const fail = e => { report({ writeError: true }); reject(e || new Error(tr('A mentés nem sikerült.'))); };
    try {
      t = db.transaction(['kv', 'items'], 'readwrite');
      t.oncomplete = () => resolve();
      t.onerror = t.onabort = () => fail(t.error);
      const kv = t.objectStore('kv'), store = t.objectStore('items');
      for (const [k, v] of Object.entries(data.values)) kv.put(v, k);
      for (const it of data.items) store.put(it);
      for (const k of data.deleteKeys) kv.delete(k);
    } catch (e) { if (t) t.abort(); fail(e); }
  });
}

export async function wipeAll() {
  await replaceAll({}, []);
}
/* Egyetlen, konzisztens pillanatkép a KV-kulcsokból és a naplóból. Az exportot
   közben érkező edzésmentés nem oszthatja ketté (régi program + új napló). */
const EXPORT_KEYS = ['settings', 'program', 'run', 'nutrition', 'favs', 'custom', 'challenge', 'block', 'workoutDraft'];
export async function exportSnapshot() {
  const db = await open();
  if (!db) return structuredClone({
    values: Object.fromEntries(EXPORT_KEYS.map(key => [key, mem.kv.get(key)])),
    items: [...mem.items.values()].sort((a, b) => b.date - a.date),
  });
  return new Promise((resolve, reject) => {
    try {
      const t = db.transaction(['kv', 'items'], 'readonly');
      const kv = t.objectStore('kv');
      const requests = Object.fromEntries(EXPORT_KEYS.map(key => [key, kv.get(key)]));
      const items = t.objectStore('items').getAll();
      t.oncomplete = () => resolve({
        values: Object.fromEntries(EXPORT_KEYS.map(key => [key, requests[key].result])),
        items: (items.result || []).sort((a, b) => b.date - a.date),
      });
      t.onerror = t.onabort = () => reject(t.error || new Error(tr('A mentésfájl nem készíthető el.')));
    } catch (e) { reject(e); }
  });
}
/* Mentés fájlba: beállítások, program, felmérések és edzések. */
export async function exportAll() {
  const { values, items } = await exportSnapshot();
  const draft = values.workoutDraft;
  if (draft && !backupDraft(draft)) throw new Error(tr('A félbehagyott edzés mentése sérült. A fájlexport megszakadt.'));
  return { app: 'forma', version: BACKUP_VERSION, exported: new Date().toISOString(),
    settings: values.settings ?? {}, program: values.program ?? null, run: values.run ?? null,
    nutrition: values.nutrition ?? null, favs: values.favs ?? null, custom: values.custom ?? null,
    challenge: values.challenge ?? null, block: values.block ?? null, workoutDraft: backupDraft(draft), items };
}

/* Visszatöltés ellenőrzött mentésből (core/backup.js): minden meglévő adat helyére. */
export async function restoreAll({ settings, program, run, nutrition, favs, custom, challenge, block, workoutDraft, items }) {
  // Másolási/bemeneti hiba még a régi állomány érintése előtt derüljön ki.
  const data = structuredClone({ settings, program, run, nutrition, favs, custom, challenge, block, workoutDraft, items });
  if (!Array.isArray(data.items) || data.items.some(it => !it || typeof it.id !== 'string' || !it.id)) throw new Error(tr('Hibás visszatöltési adat.'));
  if (data.workoutDraft != null) {
    const validated = backupDraft(data.workoutDraft);
    if (!validated) throw new Error(tr('Hibás visszatöltési adat.'));
    data.workoutDraft = validated;
  }
  const kv = Object.fromEntries(Object.entries(data).filter(([k, v]) => k !== 'items' && v != null));
  await replaceAll(kv, data.items);
}

/* Egyetlen tranzakció: megszakításkor a törlés és az összes írás együtt visszagördül. */
async function replaceAll(values, items) {
  const db = await open();
  if (!db) {
    const kv = new Map(Object.entries(values)), nextItems = new Map(items.map(it => [it.id, it]));
    mem.kv = kv; mem.items = nextItems;
    return;
  }
  return new Promise((resolve, reject) => {
    let t;
    const fail = e => { report({ writeError: true }); reject(e || new Error(tr('A visszatöltés nem sikerült.'))); };
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
