/* Verziózott, teljes offline csomag. Az új változat megvárja a régi játéklapok bezárását. */
const CACHE = 'tarsas-v18';
const HP = ['index.html', 'app.js', 'style.css', 'questions.js', 'images/castle-hero.webp', ...['owl', 'diary', 'map', 'goblet', 'quill', 'potion', 'locket', 'hallows'].map(name => 'images/' + name + '.webp')].map(file => 'harry-potter/' + file);
const SHELL = [...HP, './', 'index.html', 'style.css?v=18', 'data.js?v=18', 'app.js?v=18',
  'games-party.js?v=18', 'games-social.js?v=18', 'games-bluff.js?v=18', 'games-quiz.js?v=18', 'enhancements.js?v=18', 'games-dreams.js?v=18', 'images/dreams-atlas.webp', 'images/party-hero.webp', 'images/game-covers.webp',
  'atkozott/', 'atkozott/index.html', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png',
  'homlok/', 'homlok/index.html', 'homlok/styles.css?v=6', 'homlok/app.js?v=4', 'homlok/data.js?v=4',
  'homlok/party-history.js?v=4', 'homlok/round-recorder.js?v=4', 'homlok/game-core.js', 'homlok/favicon.svg',
  'homlok/manifest.webmanifest?v=4', 'homlok/service-worker.js',
  'activity18/', 'activity18/index.html', 'activity18/styles.css', 'activity18/app.js', 'activity18/game.js',
  'activity18/prompts.js', 'activity18/prompt-metadata.js', 'activity18/difficulty.js', 'activity18/custom-pack.js',
  'activity18/offline.js', 'activity18/sw.js', 'activity18/favicon.svg', 'activity18/manifest.webmanifest', 'activity18/icon.svg'];
const scope = new URL(self.registration.scope);
const childRoots = ['activity18/', 'homlok/', 'harry-potter/'].map(path => new URL(path, scope));
const indexURL = new URL('index.html', scope).href;
self.addEventListener('install', e => {
  e.waitUntil((async () => {
    try {
      const cache = await caches.open(CACHE);
      await cache.addAll(SHELL.map(url => new Request(new URL(url, scope), { cache: 'reload' })));
    } catch (error) {
      await caches.delete(CACHE);
      throw error;
    }
    // Nincs skipWaiting: a futó játékokat a korábbi, teljes csomag szolgálja ki.
  })());
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('tarsas-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== scope.origin || !url.pathname.startsWith(scope.pathname)) return;
  const childRoot = childRoots.find(root => url.pathname.startsWith(root.pathname));
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    if (childRoot) {
      const childIndexURL = new URL('index.html', childRoot).href;
      // Minden külön játék a saját workerének első aktiválódásáig is megnyitható offline.
      // Online a saját új változatát kapja, a portál teljes tartalékcsomagját nem keverjük át.
      try {
        const response = await fetch(req);
        if (!response.ok) throw new Error('activity-navigation');
        return response;
      } catch {
        const isChildIndex = url.pathname === childRoot.pathname || url.pathname === new URL(childIndexURL).pathname;
        const key = req.mode === 'navigate' && isChildIndex ? childIndexURL : url.origin + url.pathname;
        return await cache.match(key) || await cache.match(req) || Response.error();
      }
    }
    // A portál HTML-je és verziózott moduljai egyetlen teljes csomagból származnak.
    const isIndex = req.mode === 'navigate' && (url.pathname === scope.pathname || url.pathname === new URL(indexURL).pathname);
    const hit = await cache.match(isIndex ? indexURL : req);
    if (hit) return hit;
    try { return await fetch(req); }
    catch { return req.mode === 'navigate' ? await cache.match(indexURL) || Response.error() : Response.error(); }
  })());
});
