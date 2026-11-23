/* Külön IndexedDB a fotóknak: nincs automatikus export, nincs hálózati továbbítás.
   A normál FORMA backup/import nem érinti ezt az adatbázist. */
const NAME = 'forma2-private-photos', STORE = 'photos';
function open() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') { reject(new Error('indexedDB')); return; }
    const req = indexedDB.open(NAME, 1);
    req.onupgradeneeded = () => { if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE, { keyPath:'id' }); };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error('photo-db'));
    req.onblocked = () => reject(new Error('blocked'));
  });
}
async function transact(mode, action) {
  const db = await open();
  try { return await new Promise((resolve, reject) => {
    const t=db.transaction(STORE,mode), req=action(t.objectStore(STORE));
    t.oncomplete=()=>resolve(req?.result);
    t.onabort=t.onerror=()=>reject(t.error||new Error('photo-write'));
  }); } finally { db.close(); }
}
export const photosAll = () => transact('readonly',s=>s.getAll());
export const photoPut = data => transact('readwrite',s=>s.put(data));
export const photoDelete = id => transact('readwrite',s=>s.delete(id));
