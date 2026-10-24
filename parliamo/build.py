#!/usr/bin/env python3
"""Parliamo webapp build.

A forrás a src/ mappában van, részekre bontva:
  src/head.html, src/styles.css, src/shell.html, src/js/NN-*.js (számsorrendben), src/tail.html
Ez a szkript összerakja belőlük:
  app.html    egyetlen fájl, ez fut claude.ai artifactként (ott a claude.ai adja köré a <head>-et)
  index.html  az önálló webapp teljes dokumentuma: CSP, manifest, helyi betűk, service worker regisztráció
  sw.js       offline működés; a verzió a fájlok tartalmából számolt hash
Futtatás: python3 parliamo/build.py
"""
import hashlib
import re
from pathlib import Path

HERE = Path(__file__).resolve().parent

CSP = ("default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; "
       "img-src 'self' data: blob:; media-src 'self' data: blob:; font-src 'self'; "
       "connect-src 'self' https://*.workers.dev; manifest-src 'self'; worker-src 'self'; "
       "object-src 'none'; base-uri 'none'; form-action 'none'")

HEAD = f"""<!doctype html>
<html lang="hu">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta http-equiv="Content-Security-Policy" content="{CSP}">
<meta name="referrer" content="no-referrer">
<meta name="theme-color" content="#1F4FD6">
<meta name="description" content="Angol, olasz és spanyol nyelvtanulás magyarul: leckék felvett hanggal, ismétlés, podcastok, kiejtés, vizsgafelkészítő és AI-tanár.">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icons/logo.svg" type="image/svg+xml"><link rel="alternate icon" href="icons/icon-192.png">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Parliamo">
<link rel="stylesheet" href="fonts/fonts.css">
<link rel="preload" href="fonts/figtree-latin.woff2" as="font" type="font/woff2" crossorigin>
<script>/* A tananyag letöltése már a szkript előtt indul (a nyelvet a mentett állapotból olvassa). */
(function(){{var l='en';try{{l=(JSON.parse(localStorage.getItem('parliamo.v1'))||{{}}).settings.lang||'en';}}catch(e){{}}if(!/^(en|it|es)$/.test(l))l='en';
var k=document.createElement('link');k.rel='preload';k.as='fetch';k.href='data/'+l+'.json';k.crossOrigin='anonymous';document.head.appendChild(k);}})();</script>
<style>:root{{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px);color-scheme:light}}body{{margin:0;font:14px system-ui,sans-serif}}img{{max-width:100%}}[hidden]{{display:none!important}}</style>
</head>
<body>
"""

FOOT = """<script>if('serviceWorker' in navigator)addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));</script>
</body>
</html>
"""

SW = """/* Parliamo service worker. GENERÁLT FÁJL (parliamo/build.py), ne szerkeszd kézzel.
   Az app váza és a tananyag telepítéskor a gyorsítótárba kerül; a hangok és képek az első használatkor
   (vagy a Beállítások „Letöltés offline használatra” gombjával). Az AI-kérések nem mennek át rajta. */
const SHELL = 'parliamo-shell-__SHELL__';
const MEDIA = 'parliamo-media-__MEDIA__';
const PRECACHE = __LIST__;
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
  const media = /\\/(audio|img)\\//.test(url.pathname);
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
"""


def digest(paths):
    h = hashlib.sha1()
    for p in paths:
        h.update(p.relative_to(HERE).as_posix().encode())
        h.update(p.read_bytes())
    return h.hexdigest()[:10]


GENERATED = '<!-- GENERÁLT FÁJL: a parliamo/src/ részeiből a build.py rakja össze. Ne szerkeszd kézzel. -->\n'


def assemble():
    src = HERE / 'src'
    read = lambda p: p.read_text(encoding='utf-8')
    js = ''.join(read(p) for p in sorted((src / 'js').glob('*.js')))
    return (read(src / 'head.html') + '<style>\n' + read(src / 'styles.css') + '</style>\n' + read(src / 'shell.html')
            + '<script>\n' + js + '</script>' + read(src / 'tail.html'))


def main():
    app = assemble()
    (HERE / 'app.html').write_text(GENERATED + app, encoding='utf-8')
    # A claude.ai-os változat a Google Fontsot tölti; a webapp a helyi betűket (fonts/fonts.css).
    app = re.sub(r'<link rel="preconnect"[^>]*>\n?', '', app)
    app = re.sub(r'<link rel="stylesheet" href="https://fonts\.googleapis\.com[^>]*>\n?', '', app)
    (HERE / 'index.html').write_text(HEAD + app.rstrip() + '\n' + FOOT, encoding='utf-8')

    shell = ['./', 'index.html', 'manifest.webmanifest', 'fonts/fonts.css']
    shell += sorted(p.relative_to(HERE).as_posix() for p in (HERE / 'fonts').glob('*.woff2'))
    shell += sorted(p.relative_to(HERE).as_posix() for p in (HERE / 'icons').glob('*.png'))
    shell += sorted(p.relative_to(HERE).as_posix() for p in (HERE / 'data').glob('*.json'))
    shell += ['img/hero.webp', 'img/hero-en.webp']
    shell_files = [HERE / 'index.html'] + [HERE / s for s in shell if s not in ('./', 'index.html')]
    media_files = sorted((HERE / 'audio').glob('*.json')) + sorted((HERE / 'img').glob('*.webp'))
    sw = (SW.replace('__SHELL__', digest(shell_files))
            .replace('__MEDIA__', digest(media_files))
            .replace('__LIST__', '[\n' + ',\n'.join(f'"{s}"' for s in shell) + '\n]'))
    (HERE / 'sw.js').write_text(sw, encoding='utf-8')
    print('app.html, index.html és sw.js kész')


if __name__ == '__main__':
    main()
