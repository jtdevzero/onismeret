/* Társasest — offline működés: az app-héj a gyorsítótárból jön, hálózat esetén frissül. */
const CACHE = 'tarsas-v1';
const SHELL = ['./', 'index.html', 'style.css?v=1', 'data.js?v=1', 'app.js?v=1', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('tarsas-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  // Hálózat először (friss kód), gyorsítótár tartaléknak
  e.respondWith(fetch(req).then(res => {
    const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res;
  }).catch(() => caches.match(req).then(hit => hit || caches.match('index.html'))));
});
