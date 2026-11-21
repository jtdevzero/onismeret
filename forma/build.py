#!/usr/bin/env python3
"""Forma webapp build.

A forrás:  src/shell.html (az oldal váza), styles.css, js/ (ES-modulok), data/ (tartalom), icons/, vendor/ (pózbecslő).
Ez a szkript állítja elő:
  index.html  a teljes dokumentum: szigorú CSP, manifest, a váz és a belépési pont
  sw.js       offline működés; a gyorsítótár neve a fájlok tartalmából számolt hash
Futtatás: python3 forma/build.py
"""
import hashlib
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent

# Nincs beágyazott szkript és stílus, nincs külső kérés: minden adat a készüléken marad.
# A 'wasm-unsafe-eval' a pózbecslő WebAssembly-futtatójához kell (a Kanyarral azonos), a blob: a kamera képéhez.
CSP = ("default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; style-src 'self'; img-src 'self' data: blob:; "
       "font-src 'self'; connect-src 'self'; manifest-src 'self'; worker-src 'self'; media-src 'self' blob:; "
       "object-src 'none'; base-uri 'none'; form-action 'none'")

HEAD = f"""<!doctype html>
<!-- GENERÁLT FÁJL: a forma/build.py rakja össze a src/shell.html-ből. Ne szerkeszd kézzel. -->
<html lang="hu">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta http-equiv="Content-Security-Policy" content="{CSP}">
<meta name="referrer" content="no-referrer">
<meta name="theme-color" content="#8a1f6b">
<meta name="description" content="Állapotfelmérés a korosztályodhoz mérve (mobilitás, hajlékonyság, erő, gyorsaság, egyensúly, állóképesség), és napi rövid, eszköz nélküli otthoni edzés. Az adataid a telefonodon maradnak.">
<title>Forma</title>
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icons/icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Forma">
<link rel="stylesheet" href="styles.css">
<script type="module" src="js/ui/app.js"></script>
</head>
<body>
"""
FOOT = "</body>\n</html>\n"

SW = """/* Forma service worker. GENERÁLT FÁJL (forma/build.py), ne szerkeszd kézzel.
   Az app váza, a kód és a tartalom telepítéskor a gyorsítótárba kerül, így az app offline is működik.
   A pózbecslő (kb. 15 MB) csak a kamera első használatakor töltődik le, utána az is offline megy. */
const SHELL = 'forma-shell-__SHELL__';
const VENDOR = 'forma-vendor-__VENDOR__';
const PRECACHE = __LIST__;
self.addEventListener('install', e => {
  e.waitUntil(caches.open(SHELL).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('forma-') && k !== SHELL && k !== VENDOR).map(k => caches.delete(k))))
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
    print('forma: index.html és sw.js kész')


if __name__ == '__main__':
    main()
