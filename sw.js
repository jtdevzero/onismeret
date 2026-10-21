/* Önismereti térképek — service worker. GENERÁLT FÁJL (tools/build.py), ne szerkeszd kézzel.
   Offline működés: az első látogatáskor minden oldal és közös fájl a böngésző gyorsítótárába kerül.
   Az oldalak hálózatról frissülnek, ha van net; a verziózott (?v=…) fájlok a gyorsítótárból jönnek.
   Válasz vagy eredmény nem megy át rajta: csak a statikus fájlokat kezeli. */
const VERSION = '9286d8457d';
const PRECACHE = [
"./",
"adatok.html",
"allapot.html",
"alvas.html",
"assets/csillag-calc.js?v=d8ce36f3",
"assets/csillag-data.js?v=5be1bbf6",
"assets/demo-data.js?v=8351e47a",
"assets/konyvtar-data.js?v=22a7ebab",
"assets/mely-allapot.js?v=386da5ef",
"assets/mely-alvas.js?v=707e2e14",
"assets/mely-attitudok.js?v=65ccba3e",
"assets/mely-cselekves.js?v=26834f40",
"assets/mely-eroforras.js?v=e0a3c94d",
"assets/mely-ertelem.js?v=7cbd708c",
"assets/mely-funkcio.js?v=33eea5fc",
"assets/mely-havi.js?v=f384e670",
"assets/mely-jollet.js?v=c22568ae",
"assets/mely-kapcsolat.js?v=7316bb8a",
"assets/mely-kotodes-melyterkep.js?v=bec4f693",
"assets/mely-maia2.js?v=ca96c402",
"assets/mely-munka.js?v=991e3d17",
"assets/mely-nyelvek.js?v=cfc604ef",
"assets/mely-onbizalom.js?v=17e74f4b",
"assets/mely-sis-ses.js?v=95da76a5",
"assets/mely-szabalyozas.js?v=a98cd7f9",
"assets/mely-szemelyiseg.js?v=e91e84bd",
"assets/mely-szokasok.js?v=0278c30b",
"assets/mely-terkepek.js?v=fc297f4e",
"assets/mely.js?v=394634ec",
"assets/oni-schema.js?v=9da2923c",
"assets/oni.js?v=604a0bdc",
"assets/results-plus.js?v=1f96d0e0",
"assets/tests-data.js?v=972452a2",
"assets/theme.css?v=b50d9800",
"assets/vendor/astronomy.browser.min.js",
"assets/ysq-mely.js?v=8155356a",
"attitudok.html",
"cselekves.html",
"csillagok.html",
"edzes.html",
"eroforras.html",
"ertelem.html",
"fokusz.html",
"fonts/cardo-latin-400-italic.woff2",
"fonts/cardo-latin-400-normal.woff2",
"fonts/cardo-latin-700-normal.woff2",
"fonts/cardo-latin-ext-400-italic.woff2",
"fonts/cardo-latin-ext-400-normal.woff2",
"fonts/cardo-latin-ext-700-normal.woff2",
"fonts/fonts.css?v=50e1f8e3",
"fonts/inter-latin-ext-wght-normal.woff2",
"fonts/inter-latin-wght-normal.woff2",
"fonts/jetbrains-mono-latin-ext-wght-normal.woff2",
"fonts/jetbrains-mono-latin-wght-normal.woff2",
"funkcio.html",
"havi.html",
"icons/apple-touch-icon.png",
"icons/favicon-32.png",
"icons/icon-192.png",
"icons/icon-512.png",
"icons/icon-maskable-512.png",
"index.html",
"jollet.html",
"kapcsolat.html",
"konyvtar.html",
"kotodes-melyterkep.html",
"maia2.html",
"manifest.webmanifest",
"munka.html",
"nyelvek.html",
"onbizalom.html",
"osszegzes.html",
"par.html",
"sis-ses.html",
"szabalyozas.html",
"szemelyiseg.html",
"szokasok.html",
"terkepek.html",
"valtozasok.html",
"ysq.html"
];

const CACHE = 'onismeret-' + VERSION;
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('onismeret-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  const isPage = req.mode === 'navigate' || /\.html$|\/$/.test(url.pathname);
  if (isPage) {
    /* oldal: hálózat először (friss tartalom), net nélkül a mentett változat */
    e.respondWith(fetch(req).then(r => {
      if (r.ok) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(url.pathname, cp)); }
      return r;
    }).catch(() => caches.match(url.pathname).then(r => r || caches.match(url.pathname.replace(/\/$/, '/index.html')))));
    return;
  }
  /* közös fájl: gyorsítótár először (a ?v= hash miatt sosem elavult), különben hálózat és mentés */
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => {
    if (r.ok) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)); }
    return r;
  })));
});
