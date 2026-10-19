#!/usr/bin/env python3
"""Önismereti térképek — build.

1. A motoros hub-oldalak (kapcsolat, cselekves, szabalyozas) újragenerálása a src/ mappából.
2. Minden *.html fejlécébe pontosan egy <script src="assets/oni-core.js"> kerül (közös eredménytár,
   kitöltés-segéd, mentési visszajelzés). Régi, beágyazott ONI-CORE blokkokat eltávolítja.

Futtatás a repó gyökeréből:  python3 tools/build.py
"""
import re, pathlib, hashlib, json
ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / 'src'
CORE_TAG = '<script src="assets/oni-core.js"></script>'
THEME_TAG = '<link rel="stylesheet" href="assets/theme.css">'
SCHEMA_TAG = '<script src="assets/oni-schema.js" defer></script>'
RULES_TAG = '<script src="assets/oni-rules.js"></script>'   # nem defer: az összegzés beágyazott szkriptje azonnal használja
PLUS_TAGS = '<script src="assets/tests-data.js" defer></script>\n<script src="assets/mely.js" defer></script>\n<script src="assets/results-plus.js" defer></script>'
FONTS = '<link rel="stylesheet" href="fonts/fonts.css">'
PWA_TAGS = ('<link rel="manifest" href="manifest.webmanifest">\n<meta name="theme-color" content="#050d1e">\n'
            '<link rel="icon" type="image/png" href="icons/favicon-32.png">\n<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">')
FOOTER = ('<footer class="hub-footer">Önismereti térkép, nem diagnózis. A válaszaid csak ebben a böngészőben tárolódnak '
          '(localStorage), válasz vagy eredmény nem megy szerverre.<br><a href="index.html" style="color:inherit">← Vissza az összes teszthez</a></footer>')

def build_hubs():
    css = (SRC / 'hub-base.css').read_text() + (SRC / 'extra.css').read_text()
    engine = (SRC / 'engine.js').read_text()
    for hub in sorted((SRC / 'hubs').glob('*.hub.html')):
        name = hub.name.split('.')[0]
        h = hub.read_text()
        tests = (SRC / 'hubs' / f'{name}.tests.js').read_text()
        title = re.search(r'<!--TITLE:(.*?)-->', h).group(1).strip()
        order = re.search(r'<!--ORDER:(.*?)-->', h).group(1).strip()
        header = re.sub(r'<!--(TITLE|ORDER):.*?-->\n?', '', h)
        html = (f'<!DOCTYPE html>\n<html lang="hu">\n<head>\n<meta charset="UTF-8">\n'
                f'<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>{title}</title>\n'
                f'{FONTS}\n{CORE_TAG}\n<style>{css}</style>\n</head>\n<body>\n{header}\n<div id="panels"></div>\n{FOOTER}\n'
                f'<script>\n{engine}\n{tests}\nbootHub({order});\n</script>\n</body>\n</html>\n')
        (ROOT / f'{name}.html').write_text(html)
        print('hub', name, len(html))

def ver(rel):
    """Rövid tartalom-hash a gyorsítótár-ürítéshez: ha a fájl változik, a böngésző biztosan az újat tölti le."""
    return hashlib.sha1((ROOT / rel).read_bytes()).hexdigest()[:8]

ASSETS = ['assets/oni-core.js', 'assets/oni-schema.js', 'assets/tests-data.js', 'assets/results-plus.js', 'assets/theme.css', 'assets/demo-data.js', 'assets/ysq-mely.js', 'assets/mely.js', 'assets/oni-rules.js', 'assets/csillag-calc.js', 'assets/csillag-data.js', 'fonts/fonts.css']

def link_core():
    V = {a: ver(a) for a in ASSETS}
    for p in sorted(ROOT.glob('*.html')):
        s = p.read_text()
        s2 = re.sub(r'<script>\n/\* ONI-CORE v\d.*?</script>\n', '', s, flags=re.S)
        s2 = re.sub(r'(assets/[\w.-]+\.(?:js|css)|fonts/fonts\.css)\?v=[0-9a-f]+', r'\1', s2)   # régi verziójelek le
        if CORE_TAG not in s2:
            s2 = s2.replace('</head>', CORE_TAG + '\n</head>', 1)
        s2 = s2.replace(RULES_TAG + '\n', '')
        s2 = s2.replace(CORE_TAG + '\n', CORE_TAG + '\n' + RULES_TAG + '\n', 1)
        s2 = s2.replace(THEME_TAG + '\n', '').replace(SCHEMA_TAG + '\n', '').replace(PLUS_TAGS + '\n', '')
        for t in PLUS_TAGS.split('\n'): s2 = s2.replace(t + '\n', '')
        # oldalankénti mélyelemzés-adatok, ha vannak; a Fókusz-oldal és az Összegzés (riport) mindet betölti
        s2 = re.sub(r'<script src="assets/mely-[\w-]+\.js" defer></script>\n', '', s2)
        melys = sorted(str(x.relative_to(ROOT)) for x in (ROOT / 'assets').glob('mely-*.js')) if p.stem in ('fokusz', 'osszegzes') else \
                [m for m in [f'assets/mely-{p.stem}.js'] if (ROOT / m).exists()]
        mtag = ''.join(f'<script src="{m}" defer></script>\n' for m in melys)
        for m in melys: V[m] = ver(m)
        s2 = s2.replace('</head>', SCHEMA_TAG + '\n' + PLUS_TAGS + '\n' + mtag + THEME_TAG + '\n</head>', 1)   # a témafájl mindig utolsó a fejlécben
        s2 = s2.replace(PWA_TAGS + '\n', '')
        s2 = s2.replace('</head>', PWA_TAGS + '\n</head>', 1)
        if s2.count(CORE_TAG) != 1:
            raise SystemExit(f'{p.name}: core tag count {s2.count(CORE_TAG)}')
        for a in ASSETS + melys:
            s2 = re.sub(r'(src|href)="' + re.escape(a) + '"', lambda m: f'{m.group(1)}="{a}?v={V[a]}"', s2)
        if s2 != s:
            p.write_text(s2); print('linked', p.name)

SW_HEAD = '''/* Önismereti térképek — service worker. GENERÁLT FÁJL (tools/build.py), ne szerkeszd kézzel.
   Offline működés: az első látogatáskor minden oldal és közös fájl a böngésző gyorsítótárába kerül.
   Az oldalak hálózatról frissülnek, ha van net; a verziózott (?v=…) fájlok a gyorsítótárból jönnek.
   Válasz vagy eredmény nem megy át rajta: csak a statikus fájlokat kezeli. */
'''
SW_BODY = r'''
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
'''

def build_sw():
    """Az előtöltési lista pontosan azokból az URL-ekből áll, amelyekre az oldalak hivatkoznak (a ?v= hash-sel együtt)."""
    urls = set()
    for p in sorted(ROOT.glob('*.html')):
        urls.add(p.name)
        for m in re.finditer(r'(?:src|href)="((?:assets|fonts|icons)/[^"#]+|manifest\.webmanifest)"', p.read_text()):
            urls.add(m.group(1))
    for m in re.finditer(r'url\(\./([\w.-]+\.woff2)\)', (ROOT / 'fonts' / 'fonts.css').read_text()):
        urls.add('fonts/' + m.group(1))
    urls |= {'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'manifest.webmanifest'}
    for u in list(urls):
        if not (ROOT / u.split('?')[0]).exists():
            raise SystemExit(f'sw: hiányzó fájl az előtöltési listában: {u}')
    lst = sorted(urls)
    version = hashlib.sha1(''.join(lst).encode() + b''.join((ROOT / u.split('?')[0]).read_bytes() for u in lst if u.endswith('.html'))).hexdigest()[:10]
    body = SW_HEAD + f'const VERSION = {version!r};\nconst PRECACHE = ' + json.dumps(['./'] + lst, ensure_ascii=False, indent=0) + ';\n' + SW_BODY
    (ROOT / 'sw.js').write_text(body)
    print('sw', len(lst), 'fájl', version)

if __name__ == '__main__':
    build_hubs()
    link_core()
    build_sw()
