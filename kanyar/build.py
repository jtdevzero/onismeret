#!/usr/bin/env python3
"""Kanyar webapp build.

A forrás:  src/shell.html (az oldal váza), styles.css, js/ (ES-modulok), data/ (tartalom), vendor/ (pózbecslő).
Ez a szkript állítja elő:
  index.html  a teljes dokumentum: szigorú CSP, manifest, a váz és a belépési pont
  sw.js       offline működés; a gyorsítótár neve a fájlok tartalmából számolt hash
Futtatás: python3 kanyar/build.py
"""
import hashlib
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent

# Nincs beágyazott szkript és stílus. A 'wasm-unsafe-eval' a pózbecslő WebAssembly-futtatójához kell;
# hálózati kérés csak a saját eredetre és a saját AI-szerverre (workers.dev) mehet.
CSP = ("default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; style-src 'self'; "
       "img-src 'self' data: blob:; media-src 'self' blob:; font-src 'self'; "
       "connect-src 'self' https://*.workers.dev; manifest-src 'self'; worker-src 'self'; "
       "object-src 'none'; base-uri 'none'; form-action 'none'")

HEAD = f"""<!doctype html>
<!-- GENERÁLT FÁJL: a kanyar/build.py rakja össze a src/shell.html-ből. Ne szerkeszd kézzel. -->
<html lang="hu">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta http-equiv="Content-Security-Policy" content="{CSP}">
<meta name="referrer" content="no-referrer">
<meta name="theme-color" content="#0b5cad">
<meta name="description" content="Sí- és snowboard-edző: szezon előtti felkészülés mozgásfelméréssel, és technikai visszajelzés a csúszásodról készült videóból. A videó a telefonodon marad.">
<title>Kanyar</title>
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icons/icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Kanyar">
<link rel="stylesheet" href="styles.css">
<script type="module" src="js/ui/app.js"></script>
</head>
<body>
"""
FOOT = "</body>\n</html>\n"

SW = """/* Kanyar service worker. GENERÁLT FÁJL (kanyar/build.py), ne szerkeszd kézzel.
   Az app váza, a kód és a tananyag telepítéskor a gyorsítótárba kerül. A pózbecslő (kb. 16 MB) az első
   használatkor, vagy a Beállítások „Letöltés offline használatra” gombjával. Az AI-kérések nem mennek át rajta. */
const SHELL = 'kanyar-shell-__SHELL__';
const VENDOR = 'kanyar-vendor-__VENDOR__';
const PRECACHE = __LIST__;
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
"""


def digest(paths):
    h = hashlib.sha1()
    for p in paths:
        h.update(p.relative_to(HERE).as_posix().encode())
        h.update(p.read_bytes())
    return h.hexdigest()[:10]


def rel(paths):
    return sorted(p.relative_to(HERE).as_posix() for p in paths)


def main():
    shell_html = (HERE / 'src' / 'shell.html').read_text(encoding='utf-8')
    (HERE / 'index.html').write_text(HEAD + shell_html.rstrip() + '\n' + FOOT, encoding='utf-8')

    shell = ['index.html', 'styles.css', 'manifest.webmanifest']
    shell += rel((HERE / 'icons').glob('*.*'))
    shell += rel((HERE / 'js').rglob('*.js'))
    shell += rel((HERE / 'data').glob('*.json'))
    vendor = [p for p in sorted((HERE / 'vendor').rglob('*')) if p.is_file() and p.suffix != '.md']
    sw = (SW.replace('__SHELL__', digest([HERE / s for s in shell]))
            .replace('__VENDOR__', digest(vendor))
            .replace('__LIST__', json.dumps(['./'] + shell, indent=0, ensure_ascii=False)))
    (HERE / 'sw.js').write_text(sw, encoding='utf-8')
    print('kanyar: index.html és sw.js kész')


if __name__ == '__main__':
    main()
