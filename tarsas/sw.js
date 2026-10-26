/* Verziózott, teljes offline csomag. Sikertelen frissítéskor a régi csomag marad aktív. */
const CACHE = 'tarsas-v4';
const SHELL = ['./', 'index.html', 'style.css?v=4', 'data.js?v=4', 'app.js?v=4',
  'games-party.js?v=4', 'games-social.js?v=4', 'games-bluff.js?v=4', 'games-quiz.js?v=4', 'enhancements.js?v=4', 'games-dreams.js?v=4', 'images/dreams-atlas.webp',
  'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL.map(url => new Request(url, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('tarsas-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin || !url.pathname.startsWith(new URL(self.registration.scope).pathname)) return;
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(async res => {
      if (!res.ok) throw new Error('navigation');
      const cache = await caches.open(CACHE); await cache.put(req, res.clone()); return res;
    }).catch(async () => await caches.match(req) || await caches.match('index.html')));
  } else {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); e.waitUntil(caches.open(CACHE).then(c => c.put(req, copy))); }
      return res;
    })));
  }
});
