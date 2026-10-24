"""Alapszókincs a tools/core/<nyelv>-<szint>.txt listákból: angol (kb. 3000 szó, A1–B2), olasz és spanyol (kb. 800 szó, A1–B1).
Futtatás: python3 parliamo/tools/content_core.py  →  data/core-en.json, core-it.json, core-es.json
Minden szó azonosítója (<nyelv>-core-<szint>-<sorszám>) a listabeli sorrendből jön, ezért új szót mindig a lista VÉGÉRE írj."""
import json, os
HERE = os.path.dirname(__file__)
CHUNK = 150


LEVELS = {"en": ("a1", "a2", "b1", "b2"), "it": ("a1", "a2", "b1"), "es": ("a1", "a2", "b1")}


def build(l):
    seen, levels = set(), []
    for lv in LEVELS[l]:
        words = []
        for line in open(os.path.join(HERE, "core", f"{l}-{lv}.txt"), encoding="utf-8"):
            if line.startswith("#") or "|" not in line:
                continue
            it, hu = (x.strip() for x in line.split("|", 1))
            if it.lower() in seen:
                continue
            seen.add(it.lower())
            n = len(words)
            words.append({"id": f"{l}-core-{lv}-{n + 1}", "it": it, "hu": hu, "b": f"core-{l}-{lv}-{n // CHUNK + 1}"})
        levels.append({"level": lv.upper(), "words": words})
    json.dump({"levels": levels}, open(os.path.join(HERE, "..", "data", f"core-{l}.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print(l, "alapszókincs:", ", ".join(f"{l['level']} {len(l['words'])}" for l in levels), "összesen", sum(len(l["words"]) for l in levels))


def main():
    for l in LEVELS:
        build(l)


if __name__ == "__main__":
    main()
