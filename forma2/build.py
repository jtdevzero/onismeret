#!/usr/bin/env python3
"""Standalone FORMA 2 test-app build. Does not modify the live forma/ tree.

A forrás:  src/shell.html (az oldal váza), styles.css, js/ (ES-modulok), data/ (tartalom), icons/, vendor/ (pózbecslő).
Ez a szkript állítja elő:
  index.html  a teljes dokumentum: szigorú CSP, manifest, a váz és a belépési pont
  sw.js       offline működés; a gyorsítótár neve a fájlok tartalmából számolt hash
Futtatás: python3 forma/build.py
"""
import hashlib
import json, re
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
<title>FORMA 2 ULTIMATE – tesztverzió</title>
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icons/icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="FORMA 2">
<link rel="stylesheet" href="styles.css">
<link rel="preload" as="image" href="assets/forma-sunset.webp">
__PRELOAD__<script type="module" src="js/ui/app.js"></script>
</head>
<body>
"""
FOOT = "</body>\n</html>\n"

SW = """/* Forma service worker. GENERÁLT FÁJL (forma/build.py), ne szerkeszd kézzel.
   Az app váza, a kód és a tartalom telepítéskor a gyorsítótárba kerül, így az app offline is működik.
   A pózbecslő (kb. 15 MB) csak a kamera első használatakor töltődik le, utána az is offline megy. */
const SHELL = 'forma2-shell-__SHELL__';
const VENDOR = 'forma2-vendor-__VENDOR__';
const ART = 'forma2-art-__ART__';
const PRECACHE = __LIST__;
self.addEventListener('install', e => {
  /* Frissítéskor várakozunk, amíg a felhasználó jóváhagyja a váltást.
     Első telepítéskor a worker aktívvá válhat beavatkozás nélkül. */
  e.waitUntil(caches.open(SHELL).then(c => c.addAll(PRECACHE)));
});
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') e.waitUntil(self.skipWaiting());
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('forma2-') && k !== SHELL && k !== VENDOR && k !== ART).map(k => caches.delete(k))))
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
  if (url.pathname.includes('/vendor/') || url.pathname.includes('/assets/models/')) {
    /* pózbecslő és anatómiai GLB: az első megnyitás után külön helyi cache, nem precache */
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
    # csak az első képernyőhöz kellő modulok (az app.js statikus import-lezártja); a dinamikusan betöltött képernyők nem
    def static_closure(start):
        seen, todo = [], [start]
        while todo:
            f = todo.pop()
            if f in seen: continue
            seen.append(f)
            for m in re.findall(r"^import [^;]*? from '(\.{1,2}/[^']+\.js)';", f.read_text(encoding='utf-8'), re.M):
                todo.append((f.parent / m).resolve())
        return sorted(str(p.relative_to(HERE)).replace('\\', '/') for p in seen)
    shell_html = (HERE / 'src' / 'shell.html').read_text(encoding='utf-8')
    # a modulok előre jelezve: a böngésző párhuzamosan tölti őket, nem egymás után fedezi fel az importokat
    mods = static_closure(HERE / 'js' / 'ui' / 'app.js')
    preload = ''.join(f'<link rel="modulepreload" href="{m}">\n' for m in mods)
    (HERE / 'index.html').write_text(HEAD.replace('__PRELOAD__', preload) + shell_html.rstrip() + '\n' + FOOT, encoding='utf-8')
    # FORMA 2 külön gyökérútvonal és Service Worker scope; nincs /forma/ módosítás.

    shell = ['index.html', 'styles.css', 'manifest.webmanifest']
    shell += rel((HERE / 'icons').glob('*.*'))
    shell += rel((HERE / 'assets').glob('*.webp'))
    shell += rel((HERE / 'assets' / 'fonts').glob('*.woff2'))
    shell += rel((HERE / 'js').rglob('*.js'))
    shell += rel((HERE / 'data').glob('*.json'))
    vendor = [p for p in sorted((HERE / 'vendor').rglob('*')) if p.is_file() and p.suffix != '.md']
    vendor += sorted((HERE / 'assets' / 'models').glob('*.glb'))
    sw = (SW.replace('__SHELL__', digest([HERE / s for s in shell]))
            .replace('__VENDOR__', digest(vendor))
            .replace('__ART__', digest(sorted((HERE / 'assets' / 'art').glob('*.webp'))))
            .replace('__LIST__', json.dumps(['./'] + shell, indent=0, ensure_ascii=False)))
    (HERE / 'sw.js').write_text(sw, encoding='utf-8')
    print('forma: index.html és sw.js kész')


def review_pack():
    """Szakmai átnézés csomag: a normák, tesztek, gyakorlatok és a panaszmód egy nyomtatható oldalon (docs/szakmai-atnezes.html)."""
    import html
    load = lambda n: json.loads((HERE / 'data' / n).read_text(encoding='utf-8'))
    norms, tests, ex, routines = load('norms.json'), load('tests.json'), load('exercises.json'), load('routines.json')
    e = html.escape
    bands = ', '.join(f'{a}–{b}' for a, b in norms['bands'])
    out = ['<!doctype html><html lang="hu"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">',
           "<meta http-equiv=\"Content-Security-Policy\" content=\"default-src 'none'; style-src 'unsafe-inline'\">",
           '<title>Forma – szakmai átnézés</title><style>body{font:15px/1.5 system-ui,sans-serif;max-width:900px;margin:24px auto;padding:0 16px;color:#111}'
           'table{border-collapse:collapse;width:100%;margin:8px 0 18px}td,th{border:1px solid #bbb;padding:4px 6px;text-align:left;vertical-align:top;font-size:13px}'
           'h2{margin-top:32px;border-bottom:2px solid #8a1f6b}.q{color:#8a1f6b;font-weight:700}.box{border:1px dashed #999;min-height:40px;margin:4px 0 12px;padding:4px;color:#777}</style></head><body>',
           '<!-- GENERÁLT FÁJL: a forma/build.py állítja elő a data/ mappából. Ne szerkeszd kézzel. -->',
           '<h1>Forma – szakmai átnézés</h1>',
           '<p>Ez a dokumentum a Forma alkalmazás normáit, tesztjeit, gyakorlatait és kímélő szabályait gyűjti össze gyógytornász vagy edző számára. '
           'Minden résznél van hely a megjegyzéseknek. Nyomtatható, PDF-be menthető.</p>',
           f'<h2>1. Normák (korsávok: {e(bands)})</h2><p>Töréspontok: a 20., 40., 60. és 80. percentilis értéke. A minőség: A = publikált, B = becsült.</p>']
    for k, n in norms['tests'].items():
        out.append(f'<h3>{e(k)} <span class="q">[{e(n["quality"])}]</span>{" (kisebb a jobb)" if n.get("lower") else ""}</h3><p>{e(n["source"])}</p><table><tr><th>Nem</th>'
                   + ''.join(f'<th>{a}–{b}</th>' for a, b in norms['bands']) + '</tr>'
                   + ''.join(f'<tr><td>{"férfi" if sex == "male" else "nő"}</td>' + ''.join(f'<td>{" / ".join(str(x) for x in c)}</td>' for c in n[sex]) + '</tr>' for sex in ('male', 'female'))
                   + '</table><div class="box">Megjegyzés:</div>')
    out.append('<h2>2. Tesztek</h2>')
    for t in tests['tests']:
        extra = f' · csak {t["minAge"]} év fölött' if t.get('minAge') else ''
        out.append(f'<h3>{e(t["name"])} <span class="q">[{e(t["kind"])}{e(extra)}]</span></h3><p>{e(t["how"])}</p>'
                   + (f'<p><b>Biztonság:</b> {e(t["safety"])}</p>' if t.get('safety') else '')
                   + (f'<p><b>Pontozás:</b> {e(json.dumps(t["map"], ensure_ascii=False))}</p>' if t.get('map') else '') + '<div class="box">Megjegyzés:</div>')
    out.append('<h2>3. Gyakorlatok és gyakorlatsorok</h2><table><tr><th>Gyakorlat</th><th>Sor / szint</th><th>Adag</th><th>Leírás</th></tr>')
    for x in ex['exercises']:
        dose = x['dose'].get('reps') or x['dose'].get('seconds')
        out.append(f'<tr><td>{e(x["name"])}{" · ugrásos" if x.get("impact") else ""}{" · " + e(x["equipment"]) if x.get("equipment") else ""}</td>'
                   f'<td>{e(x.get("ladder", x["type"]))} {x.get("level", "")}</td><td>{dose[0]}–{dose[1]} {"ism." if "reps" in x["dose"] else "mp"}</td><td>{e(x["how"])}</td></tr>')
    out.append('</table><div class="box">Megjegyzés:</div><h2>4. Rutinok</h2><ul>')
    for r in routines['routines']:
        out.append(f'<li><b>{e(r["name"])}</b> ({r["minutes"]} perc): {e(", ".join(b[0] for b in r["blocks"]))}</li>')
    out.append('</ul><div class="box">Megjegyzés:</div><h2>5. Panaszmód (js/core/program.js, complaintRules)</h2><ul>'
               '<li><b>Térd:</b> nincs ugrás; guggolás legfeljebb a 2. szintig (testsúlyos guggolás), kitörés az 1. szinten, egyensúly legfeljebb a 2. szinten.</li>'
               '<li><b>Derék:</b> nincs ugrás; csípőfeszítés az 1. szinten (csípőemelés), törzs legfeljebb a plankig, burpee nélkül, a kitöréses forgatás kimarad.</li>'
               '<li><b>Váll:</b> fekvőtámasz legfeljebb térdelve, rúd nélkül, húzás legfeljebb a 2. szintig; a törölközős vállkörzés és a falcsúsztatás kimarad.</li>'
               '</ul><div class="box">Megjegyzés:</div><h2>6. Egyéb küszöbök</h2><ul>'
               '<li>Regeneráció: közérzet 40–100 pont; a reggeli pulzus +6/perc fölött −12, +10 fölött −25; 3 nap alatt 120 percnél több edzés −10.</li>'
               '<li>Testtartás: váll- és csípődőlés 3° fölött, a fej előretolódása a törzshossz 15%-a fölött „figyelj rá”.</li>'
               '<li>Fehérje 1,6 g/ttkg, víz 33 ml/ttkg; pulzuszónák: Tanaka-maximum, Karvonen-módszer.</li>'
               '</ul><div class="box">Megjegyzés:</div></body></html>')
    (HERE / 'docs').mkdir(exist_ok=True)
    (HERE / 'docs' / 'szakmai-atnezes.html').write_text('\n'.join(out) + '\n', encoding='utf-8')


if __name__ == '__main__':
    main()
