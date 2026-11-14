/* Kanyar service worker. GENERÁLT FÁJL (kanyar/build.py), ne szerkeszd kézzel.
   Az app váza, a kód és a tananyag telepítéskor a gyorsítótárba kerül. A pózbecslő (kb. 16 MB) az első
   használatkor, vagy a Beállítások „Letöltés offline használatra” gombjával. Az AI-kérések nem mennek át rajta. */
const SHELL = 'kanyar-shell-9a05704a7c';
const VENDOR = 'kanyar-vendor-62fc9e8c57';
const PRECACHE = [
"./",
"index.html",
"styles.css",
"manifest.webmanifest",
"icons/apple-touch-icon.png",
"icons/hero.svg",
"icons/icon-192.png",
"icons/icon-512.png",
"icons/icon.svg",
"icons/ui-book.svg",
"icons/ui-check.svg",
"icons/ui-gear.svg",
"icons/ui-home.svg",
"icons/ui-log.svg",
"icons/ui-train.svg",
"icons/ui-video.svg",
"js/core/coach.js",
"js/core/compare.js",
"js/core/exercise.js",
"js/core/geometry.js",
"js/core/program.js",
"js/core/series.js",
"js/core/snow.js",
"js/ui/app.js",
"js/ui/coach-client.js",
"js/ui/data.js",
"js/ui/dom.js",
"js/ui/live.js",
"js/ui/overlay.js",
"js/ui/pose.js",
"js/ui/store.js",
"js/ui/views-main.js",
"js/ui/views-snow.js",
"js/ui/views-train.js",
"js/ui/widgets.js",
"data/exercises.json",
"data/faults.json",
"data/lessons.json"
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(SHELL).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('kanyar-') && k !== SHELL && k !== VENDOR).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  if (url.pathname.includes('/vendor/')) {
    /* pózbecslő: gyorsítótár először, különben hálózat és mentés */
    e.respondWith(caches.open(VENDOR).then(c => c.match(req).then(hit => hit || fetch(req).then(r => { if (r.ok) c.put(req, r.clone()); return r; }))));
    return;
  }
  /* váz, kód, tananyag: a telepített változat; ami nincs benne, az a hálózatról jön */
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req).catch(() => (req.mode === 'navigate' ? caches.match('index.html') : Response.error()))));
});
