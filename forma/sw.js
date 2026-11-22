/* Forma service worker. GENERÁLT FÁJL (forma/build.py), ne szerkeszd kézzel.
   Az app váza, a kód és a tartalom telepítéskor a gyorsítótárba kerül, így az app offline is működik.
   A pózbecslő (kb. 15 MB) csak a kamera első használatakor töltődik le, utána az is offline megy. */
const SHELL = 'forma-shell-db6bfd975f';
const VENDOR = 'forma-vendor-62fc9e8c57';
const ART = 'forma-art-5de026015b';
const PRECACHE = [
"./",
"index.html",
"styles.css",
"manifest.webmanifest",
"icons/apple-touch-icon.png",
"icons/hero-night.svg",
"icons/hero.svg",
"icons/icon-192.png",
"icons/icon-512.png",
"icons/icon.svg",
"icons/t-balance.svg",
"icons/t-cardio.svg",
"icons/t-core.svg",
"icons/t-mobility.svg",
"icons/t-power.svg",
"icons/t-recovery.svg",
"icons/t-speed.svg",
"icons/t-strength.svg",
"icons/t-warmup.svg",
"icons/ui-chart.svg",
"icons/ui-check.svg",
"icons/ui-gear.svg",
"icons/ui-home.svg",
"icons/ui-log.svg",
"icons/ui-more.svg",
"icons/ui-train.svg",
"assets/forma-sunset.webp",
"assets/fonts/anton-latin-400-normal.woff2",
"assets/fonts/anton-latin-ext-400-normal.woff2",
"js/core/achievements.js",
"js/core/analytics.js",
"js/core/assessment.js",
"js/core/backup-reminder.js",
"js/core/backup.js",
"js/core/calendar.js",
"js/core/cardio.js",
"js/core/coach-rules.js",
"js/core/dashboard.js",
"js/core/exercise.js",
"js/core/extras.js",
"js/core/figure.js",
"js/core/geometry.js",
"js/core/history.js",
"js/core/load.js",
"js/core/motion-quality.js",
"js/core/posture.js",
"js/core/program.js",
"js/core/progress.js",
"js/core/progression.js",
"js/core/reaction.js",
"js/core/runplan.js",
"js/core/score.js",
"js/core/sensors.js",
"js/core/series.js",
"js/core/share.js",
"js/core/track.js",
"js/core/wellness.js",
"js/core/workout-schema.js",
"js/ui/app.js",
"js/ui/backup-ui.js",
"js/ui/data.js",
"js/ui/dom.js",
"js/ui/figure.js",
"js/ui/helpers.js",
"js/ui/i18n-en.js",
"js/ui/i18n.js",
"js/ui/live.js",
"js/ui/pose.js",
"js/ui/progress-card.js",
"js/ui/radar.js",
"js/ui/share-card.js",
"js/ui/state.js",
"js/ui/store.js",
"js/ui/views-analytics.js",
"js/ui/views-assess.js",
"js/ui/views-cardio.js",
"js/ui/views-coach.js",
"js/ui/views-diag.js",
"js/ui/views-extra.js",
"js/ui/views-library.js",
"js/ui/views-main.js",
"js/ui/views-posture.js",
"js/ui/views-progress.js",
"js/ui/views-run.js",
"js/ui/views-train.js",
"js/ui/views-wellness.js",
"js/ui/widgets.js",
"data/blocks.json",
"data/exercises.json",
"data/figures.json",
"data/norms.json",
"data/routines.json",
"data/tests.json"
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(SHELL).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('forma-') && k !== SHELL && k !== VENDOR && k !== ART).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  if (url.pathname.includes('/assets/art/')) {
    /* fejlécképek: első megnyitáskor töltődnek, utána a gyorsítótárból (offline is) */
    e.respondWith(caches.open(ART).then(c => c.match(req).then(hit => hit || fetch(req).then(r => { if (r.ok) c.put(req, r.clone()); return r; }))));
    return;
  }
  if (url.pathname.includes('/vendor/')) {
    /* pózbecslő: gyorsítótár először, különben hálózat és mentés */
    e.respondWith(caches.open(VENDOR).then(c => c.match(req).then(hit => hit || fetch(req).then(r => { if (r.ok) c.put(req, r.clone()); return r; }))));
    return;
  }
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req).catch(() => (req.mode === 'navigate' ? caches.match('index.html') : Response.error()))));
});
