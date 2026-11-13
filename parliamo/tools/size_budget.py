#!/usr/bin/env python3
"""Parliamo méretkorlát: az első induláskor letöltött váz ne hízzon észrevétlenül.

A korlát szándékosan a jelenlegi méret fölött van egy kevéssel. Ha egy változtatás átlépi,
előbb nézd meg, mi nőtt meg; a korlátot csak tudatos döntéssel emeld.
Futtatás: python3 parliamo/tools/size_budget.py
"""
import gzip
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent.parent
KB = 1024
# fájl: (nyers korlát, gzip-korlát) bájtban
BUDGET = {
    'index.html': (650 * KB, 215 * KB),
    'data/en.json': (230 * KB, 52 * KB),
    'data/it.json': (230 * KB, 52 * KB),
    'data/es.json': (230 * KB, 52 * KB),
}

failed = False
for name, (raw_max, gz_max) in BUDGET.items():
    data = (HERE / name).read_bytes()
    raw, gz = len(data), len(gzip.compress(data, 9))
    ok = raw <= raw_max and gz <= gz_max
    failed |= not ok
    print(f"{'ok ' if ok else 'TÚL NAGY'} {name}: {raw // KB} KB (korlát {raw_max // KB}), tömörítve {gz // KB} KB (korlát {gz_max // KB})")
sys.exit(1 if failed else 0)
