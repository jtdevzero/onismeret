#!/usr/bin/env python3
"""Önismereti térképek — betűtípusok szűkítése.

A Fontsource „latin-ext” fájlok több száz jelet tartalmaznak, de a magyar szöveghez ebből csak
néhány kell (ő, ű és nagybetűs párjuk). Ez a szkript a tools/fonts-src/ eredetijeiből a Latin
Extended-A tartományra (U+0100–017F: magyar, cseh, lengyel, horvát stb. ékezetes betűk) szűkített
változatot készít a fonts/ mappába. A ritkább jeleket a böngésző rendszerbetűvel jeleníti meg.

Futtatás (ha betűt cserélsz):  pip install fonttools brotli && python3 tools/fonts.py
"""
import pathlib
from fontTools.ttLib import TTFont
from fontTools import subset

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC, DST = ROOT / 'tools' / 'fonts-src', ROOT / 'fonts'
RANGE = list(range(0x0100, 0x0180))   # Latin Extended-A

for src in sorted(SRC.glob('*.woff2')):
    f = TTFont(src)
    keep = [c for c in RANGE if c in f.getBestCmap()]
    o = subset.Options(); o.flavor = 'woff2'; o.layout_features = ['*']; o.notdef_outline = True
    s = subset.Subsetter(o); s.populate(unicodes=keep); s.subset(f)
    f.flavor = 'woff2'; f.save(DST / src.name)
    print(f'{src.name:44} {src.stat().st_size // 1024:4} KB -> {(DST / src.name).stat().st_size // 1024:3} KB')
