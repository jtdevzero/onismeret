#!/usr/bin/env python3
"""Önismereti térképek — build.

1. A motoros hub-oldalak (kapcsolat, cselekves, szabalyozas) újragenerálása a src/ mappából.
2. Minden *.html fejlécébe pontosan egy <script src="assets/oni-core.js"> kerül (közös eredménytár,
   kitöltés-segéd, mentési visszajelzés). Régi, beágyazott ONI-CORE blokkokat eltávolítja.

Futtatás a repó gyökeréből:  python3 tools/build.py
"""
import re, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / 'src'
CORE_TAG = '<script src="assets/oni-core.js"></script>'
THEME_TAG = '<link rel="stylesheet" href="assets/theme.css">'
FONTS = '<link rel="stylesheet" href="fonts/fonts.css">'
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

def link_core():
    for p in sorted(ROOT.glob('*.html')):
        s = p.read_text()
        s2 = re.sub(r'<script>\n/\* ONI-CORE v\d.*?</script>\n', '', s, flags=re.S)
        if CORE_TAG not in s2:
            s2 = s2.replace('</head>', CORE_TAG + '\n</head>', 1)
        s2 = s2.replace(THEME_TAG + '\n', '')
        s2 = s2.replace('</head>', THEME_TAG + '\n</head>', 1)   # a témafájl mindig utolsó a fejlécben
        if s2.count(CORE_TAG) != 1:
            raise SystemExit(f'{p.name}: core tag count {s2.count(CORE_TAG)}')
        if s2 != s:
            p.write_text(s2); print('core linked', p.name)

if __name__ == '__main__':
    build_hubs()
    link_core()
