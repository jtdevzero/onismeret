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
REG_TAG = '<script src="assets/registry.js"></script>'   # tesztnyilvántartás: a közös mag előtt kell
THEME_TAG = '<link rel="stylesheet" href="assets/theme.css">'
SCHEMA_TAG = '<script src="assets/oni-schema.js" defer></script>'
RULES_TAG = '<script src="assets/oni-rules.js"></script>'   # nem defer: az összegzés beágyazott szkriptje azonnal használja
# A három szinkron közös szkript (nyilvántartás, mag, minták) egy fájlba csomagolva: egy kérés három helyett,
# így rövidebb a megjelenés előtti várakozás. A forrás továbbra is a három külön fájl.
BUNDLE = 'assets/oni.js'
BUNDLE_TAG = '<script src="assets/oni.js"></script>'
TRIO = REG_TAG + '\n' + CORE_TAG + '\n' + RULES_TAG + '\n'
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

ASSETS = ['assets/registry.js', 'assets/oni-core.js', 'assets/oni-schema.js', 'assets/tests-data.js', 'assets/results-plus.js', 'assets/theme.css', 'assets/demo-data.js', 'assets/ysq-mely.js', 'assets/mely.js', 'assets/oni-rules.js', 'assets/csillag-calc.js', 'assets/csillag-data.js', 'assets/konyvtar-data.js', 'fonts/fonts.css']

def build_bundle():
    parts = ['assets/registry.js', 'assets/oni-core.js', 'assets/oni-rules.js']
    out = '/* GENERÁLT FÁJL (tools/build.py): ' + ' + '.join(parts) + ' — ne szerkeszd kézzel, a forrásfájlokat módosítsd. */\n'
    out += '\n'.join(f'/* ── {x} ── */\n' + (ROOT / x).read_text() for x in parts)
    (ROOT / BUNDLE).write_text(out)

def link_core():
    build_bundle()
    V = {a: ver(a) for a in ASSETS + [BUNDLE]}
    for p in sorted(ROOT.glob('*.html')):
        s = p.read_text()
        s2 = re.sub(r'<script>\n/\* ONI-CORE v\d.*?</script>\n', '', s, flags=re.S)
        s2 = re.sub(r'(assets/[\w.-]+\.(?:js|css)|fonts/fonts\.css)\?v=[0-9a-f]+', r'\1', s2)   # régi verziójelek le
        s2 = s2.replace(BUNDLE_TAG + '\n', TRIO)   # a csomag helyén a három forrás, a sorrend-ellenőrzés miatt
        if CORE_TAG not in s2:
            s2 = s2.replace('</head>', CORE_TAG + '\n</head>', 1)
        s2 = s2.replace(REG_TAG + '\n', '')
        s2 = s2.replace(CORE_TAG + '\n', REG_TAG + '\n' + CORE_TAG + '\n', 1)
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
        if '<main' not in s2:   # tájolópont (landmark) a képernyőolvasóknak: az oldal teljes tartalma egy <main> elemben
            s2 = re.sub(r'(<body[^>]*>)', r'\1\n<main id="main">', s2, count=1)
            s2 = s2.replace('</body>', '</main>\n</body>', 1)
        if '<meta name="description"' not in s2:   # keresőknek és megosztáskor megjelenő leírás
            t = re.search(r'<title>(.*?)</title>', s2, re.S)
            desc = (t.group(1).strip() + ' — ' if t else '') + 'önismereti kérdőívek magyarul. A válaszok és az eredmények csak ebben a böngészőben tárolódnak.'
            s2 = s2.replace('</title>', '</title>\n<meta name="description" content="' + desc.replace('"', '&quot;') + '">', 1)
        s2 = s2.replace(PWA_TAGS + '\n', '')
        s2 = s2.replace('</head>', PWA_TAGS + '\n</head>', 1)
        if s2.count(CORE_TAG) != 1 or TRIO not in s2:
            raise SystemExit(f'{p.name}: core tag count {s2.count(CORE_TAG)}')
        s2 = s2.replace(TRIO, BUNDLE_TAG + '\n', 1)
        for a in ASSETS + [BUNDLE] + melys:
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

def build_konyvtar():
    """Önismereti könyvtár: egyetlen forrás (src/konyvtar.json) → assets/konyvtar-data.js (az oldalnak)
    és konyvtar/<alkönyvtár>/README.md (GitHubon olvasható awesome-lista). Ellenőrzi a hivatkozásokat is."""
    d = json.loads((SRC / 'konyvtar.json').read_text())
    reg = {m.group(1): (m.group(2), m.group(3)) for m in re.finditer(r"\{id:'([\w-]+)'.*?name:'([^']*)',link:'([^']*)'", (ROOT / 'assets/registry.js').read_text())}
    M, cats = d['meta'], {c['id']: c for c in d['cats']}
    items = {}
    for i in d['items']:
        e = f"konyvtar: {i.get('id')}"
        if not re.fullmatch(r'[a-z0-9-]{2,40}', i['id']) or i['id'] in items: raise SystemExit(e + ': hibás vagy ismétlődő azonosító')
        if i['c'] not in cats or (i.get('c2') and i['c2'] not in cats): raise SystemExit(e + ': ismeretlen alkönyvtár')
        if i['t'] not in M['types'] or i['ev'] not in M['ev']: raise SystemExit(e + ': ismeretlen típus vagy bizonyítékszint')
        bad = [x for x in i['tg'] if x not in M['tags']] + [x for x in i['ts'] if x not in reg]
        if bad: raise SystemExit(e + ': ismeretlen címke vagy teszt: ' + ', '.join(bad))
        if i.get('site') and not (ROOT / i['site']).exists(): raise SystemExit(e + ': nem létező oldal ' + i['site'])
        if i.get('u') and not re.match(r'(https://|tel:)', i['u']): raise SystemExit(e + ': a link csak https:// vagy tel: lehet')
        items[i['id']] = i
    for p in d['paths']:
        bad = [x for s in p['steps'] for x in s['i'] if x not in items] + [x for x in p['ts'] if x not in reg]
        if bad or (p.get('site') and not (ROOT / p['site']).exists()): raise SystemExit(f"konyvtar: útvonal {p['id']}: hibás hivatkozás {bad}")
    (ROOT / 'assets/konyvtar-data.js').write_text('/* GENERÁLT FÁJL (tools/build.py) a src/konyvtar.json-ból — ne szerkeszd kézzel. */\nwindow.ONI_LIB=' +
                                                json.dumps(d, ensure_ascii=False, separators=(',', ':')) + ';\n')
    # ── Markdown: alkönyvtárak ──
    site, out = M['site'], ROOT / 'konyvtar'
    EVB = {'A': '🟢 A', 'B': '🟡 B', 'C': '⚪ C', 'V': '🔴 vitatott'}
    def tlink(t): return f"[{reg[t][0].split(' · ')[0]}]({site}{reg[t][1]})"
    def entry(i):
        head = f"[{i['ti']}]({i['u']})" if i.get('u', '').startswith('https://') else i['ti']
        if i.get('u', '').startswith('tel:'): head = f"**{i['ti']}**"
        else: head = f"**{head}**"
        by = ' — ' + i['a'] if i.get('a') else ''
        yr = f" ({i['y']})" if i.get('y') else ''
        lines = [f"- {head}{by}{yr}"]
        meta = [EVB[i['ev']], M['types'][i['t']]]
        if i.get('hu'): meta.append(f"magyarul: *{i['hu']}*")
        if i.get('time'): meta.append('⏱ ' + i['time'])
        lines.append(f"  <br>{' · '.join(meta)}")
        lines.append(f"  <br>{i['w']}")
        if i.get('how'): lines += [f"  {n}. {s}" for n, s in enumerate(i['how'], 1)]
        rel = [tlink(t) for t in i['ts']] + ([f"[{i['site']}]({site}{i['site']})"] if i.get('site') else [])
        if rel: lines.append(f"  <br>↳ Kapcsolódó: {', '.join(rel)}")
        return '\n'.join(lines)
    legend = '**Bizonyítékszint:** ' + ' · '.join(EVB[k] + ('' if k == 'V' else ' ' + v[0].lower()) for k, v in M['ev'].items())
    gen = '<!-- GENERÁLT FÁJL (tools/build.py) a src/konyvtar.json-ból — ne szerkeszd kézzel. -->\n'
    nav = lambda: ' · '.join(f"[{c['num']} {c['title']}](../{c['dir']}/)" for c in d['cats']) + ' · [09 Útvonalak](../09-utvonalak/)'
    written = set()
    for c in d['cats']:
        mine = [i for i in d['items'] if c['id'] in (i['c'], i.get('c2'))]
        md = [gen, f"# {c['num']} · {c['title']}", '', f"> {c['desc']}", '', f"[← Könyvtár]({'../'}) · [Böngészhető, kereshető változat]({site}konyvtar.html#k-{c['id']})", '', legend, '']
        if c['id'] == 'gyakorlatok' or len(mine) < 14:
            md += [entry(i) + '\n' for i in mine]
        else:
            groups = {}
            for i in mine: groups.setdefault(i['tg'][0], []).append(i)
            md += ['## Tartalom', ''] + [f"- [{M['tags'][g]}](#{re.sub(r'[^a-z0-9áéíóöőúüű -]', '', M['tags'][g].lower()).replace(' ', '-')}) ({len(v)})" for g, v in groups.items()] + ['']
            for g, v in groups.items(): md += [f"## {M['tags'][g]}", ''] + [entry(i) + '\n' for i in v]
        md += ['---', '', nav(), '']
        (out / c['dir']).mkdir(parents=True, exist_ok=True)
        (out / c['dir'] / 'README.md').write_text('\n'.join(md)); written.add(c['dir'])
    md = [gen, '# 09 · Útvonalak', '', '> Több hetes, sorrendbe rakott programok: mérés, olvasmány, gyakorlat, újramérés. A böngészős változatban a lépések kipipálhatók, és a haladás mentődik.', '',
          f"[← Könyvtár](../) · [Böngészhető változat]({site}konyvtar.html#utvonalak)", '']
    for p in d['paths']:
        md += [f"## {p['ti']} · {p['em']}", '', f"*{p['goal']}*", '', 'Mérés: ' + ', '.join(tlink(t) for t in p['ts']) + (f" · Oldal: [{p['site']}]({site}{p['site']})" if p.get('site') else ''), '']
        for s in p['steps']:
            refs = ', '.join(f"[{items[x]['ti']}](../{next(c['dir'] for c in d['cats'] if c['id'] == items[x]['c'])}/)" for x in s['i'])
            md.append(f"1. **{s['w']} · {s['t']}** — {s['d']}" + (f" <br>↳ {refs}" if refs else ''))
        md.append('')
    md += ['---', '', nav(), '']
    (out / '09-utvonalak').mkdir(parents=True, exist_ok=True)
    (out / '09-utvonalak' / 'README.md').write_text('\n'.join(md)); written.add('09-utvonalak')
    # ── Markdown: főoldal ──
    cnt = {c['id']: sum(1 for i in d['items'] if c['id'] in (i['c'], i.get('c2'))) for c in d['cats']}
    evc = {k: sum(1 for i in d['items'] if i['ev'] == k) for k in M['ev']}
    md = [gen, '# Önismereti könyvtár', '',
          f"> Kurált, magyar nyelvű forrásgyűjtemény az [Önismereti térképek]({site}) tesztjei mellé: könyvek, módszerek, gyakorlatok, eszközök, kurzusok és kutatások, "
          'mindegyiknél bizonyítékszinttel és a kapcsolódó tesztekkel.', '',
          f"**{len(d['items'])} forrás · {len(d['cats'])} alkönyvtár · {len(d['paths'])} útvonal** · "
          f"[Böngészhető, kereshető változat]({site}konyvtar.html) (olvasólistával és a kitöltött tesztjeid alapján ajánlással)", '',
          '## Alkönyvtárak', '', '| | Alkönyvtár | Tartalom | Forrás |', '|---|---|---|---|']
    md += [f"| {c['num']} | [{c['title']}]({c['dir']}/) | {c['desc']} | {cnt[c['id']]} |" for c in d['cats']]
    md += [f"| 09 | [Útvonalak](09-utvonalak/) | Több hetes programok mérésről mérésig: " + ', '.join(p['ti'].lower() for p in d['paths']) + f". | {len(d['paths'])} |", '',
           '## Bizonyítékszint', '', '| Jel | Jelentés | Forrás |', '|---|---|---|']
    md += [f"| {EVB[k]} | **{v[0]}.** {v[1]} | {evc[k]} |" for k, v in M['ev'].items()]
    md += ['', '## Elvek', '',
           '- **Őszinteség a népszerűség előtt.** A sokat idézett, de nem igazolt állítások is itt vannak, vitatott jelöléssel, hogy tudd, mire figyelj.',
           '- **Teszttől a tettig.** Minden forrás mellett ott a teszt, amelynek az eredményéhez kapcsolódik; az útvonalak méréssel kezdődnek és újraméréssel zárulnak.',
           '- **Nem helyettesít szakembert.** Ha most nehéz: Lelki Elsősegély Telefonszolgálat **116-123** (ingyenes, éjjel-nappal), életveszélyben **112**.', '',
           'Bővítés: [HOZZAJARULAS.md](HOZZAJARULAS.md).', '']
    (out / 'README.md').write_text('\n'.join(md))
    for x in out.iterdir():   # elárvult, régi alkönyvtár ne maradjon
        if x.is_dir() and x.name not in written: raise SystemExit(f'konyvtar: elárvult mappa {x.name}, töröld vagy vedd fel a forrásba')
    print('konyvtar', len(d['items']), 'forrás,', len(d['paths']), 'útvonal')

if __name__ == '__main__':
    build_konyvtar()
    build_hubs()
    link_core()
    build_sw()
