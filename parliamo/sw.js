/* Parliamo service worker. GENERÁLT FÁJL (parliamo/build.py), ne szerkeszd kézzel.
   Az app váza és a tananyag telepítéskor a gyorsítótárba kerül; a hangok és képek az első használatkor
   (vagy a Beállítások „Letöltés offline használatra” gombjával). Az AI-kérések nem mennek át rajta. */
const SHELL = 'parliamo-shell-cd82e831de';
const MEDIA = 'parliamo-media-7dbc5043e1';
const PRECACHE = [
"./",
"index.html",
"manifest.webmanifest",
"fonts/fonts.css",
"fonts/atkinson-hyperlegible-latin-400-normal.woff2",
"fonts/atkinson-hyperlegible-latin-700-normal.woff2",
"fonts/atkinson-hyperlegible-latin-ext-400-normal.woff2",
"fonts/atkinson-hyperlegible-latin-ext-700-normal.woff2",
"fonts/figtree-latin-ext.woff2",
"fonts/figtree-latin.woff2",
"fonts/young-serif-latin-ext.woff2",
"fonts/young-serif-latin.woff2",
"icons/apple-touch-icon.png",
"icons/icon-192.png",
"icons/icon-512.png",
"icons/icon-maskable-512.png",
"data/accents-en.json",
"data/colloc-en.json",
"data/core-en.json",
"data/core-es.json",
"data/core-it.json",
"data/drills-en.json",
"data/drills-es.json",
"data/drills-it.json",
"data/en.json",
"data/es.json",
"data/exam-en.json",
"data/exam-es.json",
"data/exam-it.json",
"data/grammar-en.json",
"data/grammar-es.json",
"data/grammar-it.json",
"data/it.json",
"data/mock-en.json",
"data/offline-en.json",
"data/packs-en.json",
"data/packs-es.json",
"data/packs-it.json",
"data/podcasts-en.json",
"data/podcasts-es.json",
"data/podcasts-it.json",
"data/pron-en.json",
"data/pron-es.json",
"data/pron-it.json",
"data/serials-en.json",
"data/serials-es.json",
"data/serials-it.json",
"data/speaking-en.json",
"data/stories-en.json",
"data/stories-es.json",
"data/stories-it.json",
"data/verbs-en.json",
"data/verbs-es.json",
"data/verbs-it.json",
"data/vocabtest-en.json",
"data/writing-en.json",
"img/hero.webp",
"img/hero-en.webp",
"img/world-en.webp",
"img/world-it.webp",
"img/world-es.webp"
];
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'parliamo-offline-manifest' && e.ports && e.ports[0]) {
    e.ports[0].postMessage({ type: 'parliamo-offline-manifest', shell: SHELL, media: MEDIA, precache: PRECACHE });
  }
});
self.addEventListener('install', e => {
  e.waitUntil(caches.open(SHELL).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('parliamo-') && k !== SHELL && k !== MEDIA).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  const media = /\/(audio|img)\//.test(url.pathname);
  if (media) {
    /* hang és kép: gyorsítótár először, különben hálózat és mentés */
    e.respondWith(caches.open(MEDIA).then(c => c.match(req).then(hit => hit || fetch(req).then(r => { if (r.ok) c.put(req, r.clone()); return r; }))));
    return;
  }
  /* oldal, tananyag, betűk: hálózat először (friss tartalom), net nélkül a mentett változat */
  e.respondWith(fetch(req).then(r => {
    if (r.ok) { const cp = r.clone(); caches.open(SHELL).then(c => c.put(req, cp)); }
    return r;
  }).catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || (req.mode === 'navigate' ? caches.match('index.html') : undefined))));
});
/* napi emlékeztető (a saját szerver küldi, lásd worker/) */
self.addEventListener('push', e => {
  let m = { title: 'Parliamo', body: 'A napi köröd vár.', url: './#ma' };
  try { m = Object.assign(m, e.data ? e.data.json() : {}); } catch (err) {}
  e.waitUntil(self.registration.showNotification(m.title, { body: m.body, icon: 'icons/icon-192.png', badge: 'icons/icon-192.png', tag: 'parliamo-daily', data: { url: m.url } }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = new URL((e.notification.data && e.notification.data.url) || './', self.registration.scope).href;
  e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(ws => {
    for (const w of ws) if (w.url.startsWith(self.registration.scope)) return w.focus().then(c => (c || w).navigate ? (c || w).navigate(url) : c).catch(() => w.focus());
    return clients.openWindow(url);
  }));
});
