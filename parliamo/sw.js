/* Parliamo service worker. GENERÁLT FÁJL (parliamo/build.py), ne szerkeszd kézzel.
   Az app váza és a tananyag telepítéskor a gyorsítótárba kerül; a hangok és képek az első használatkor
   (vagy a Beállítások „Letöltés offline használatra” gombjával). Az AI-kérések nem mennek át rajta. */
const SHELL = 'parliamo-shell-653d878827';
const MEDIA = 'parliamo-media-d9fa8aaa57';
const PRECACHE = [
"./",
"index.html",
"manifest.webmanifest",
"fonts/fonts.css",
"fonts/figtree-latin-ext.woff2",
"fonts/figtree-latin.woff2",
"fonts/young-serif-latin-ext.woff2",
"fonts/young-serif-latin.woff2",
"icons/apple-touch-icon.png",
"icons/icon-192.png",
"icons/icon-512.png",
"icons/icon-maskable-512.png",
"data/en.json",
"data/it.json",
"data/stories-en.json",
"data/stories-it.json",
"data/verbs-en.json",
"data/verbs-it.json",
"img/hero.jpg",
"img/hero-en.jpg"
];
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
