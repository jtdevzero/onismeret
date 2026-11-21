/* Forma service worker. GENERÁLT FÁJL (forma/build.py), ne szerkeszd kézzel.
   Az app váza, a kód és a tartalom telepítéskor a gyorsítótárba kerül, így az app offline is működik. */
const SHELL = 'forma-shell-b8e095fc08';
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
"icons/ui-chart.svg",
"icons/ui-check.svg",
"icons/ui-gear.svg",
"icons/ui-home.svg",
"icons/ui-log.svg",
"icons/ui-train.svg",
"js/core/calendar.js",
"js/core/figure.js",
"js/core/program.js",
"js/core/score.js",
"js/ui/app.js",
"js/ui/data.js",
"js/ui/dom.js",
"js/ui/figure.js",
"js/ui/radar.js",
"js/ui/state.js",
"js/ui/store.js",
"js/ui/views-assess.js",
"js/ui/views-main.js",
"js/ui/views-train.js",
"js/ui/widgets.js",
"data/exercises.json",
"data/figures.json",
"data/norms.json",
"data/tests.json"
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(SHELL).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('forma-') && k !== SHELL).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req).catch(() => (req.mode === 'navigate' ? caches.match('index.html') : Response.error()))));
});
