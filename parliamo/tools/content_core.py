"""Angol alapszókincs (kb. 3000 szó, A1–B2) a tools/core/en-*.txt listákból.
Futtatás: python3 parliamo/tools/content_core.py  →  data/core-en.json
Minden szó azonosítója (en-core-<szint>-<sorszám>) a listabeli sorrendből jön, ezért új szót mindig a lista VÉGÉRE írj."""
import json, os
HERE = os.path.dirname(__file__)
CHUNK = 150


def main():
    seen, levels = set(), []
    for lv in ("a1", "a2", "b1", "b2"):
        words = []
        for line in open(os.path.join(HERE, "core", f"en-{lv}.txt"), encoding="utf-8"):
            if line.startswith("#") or "|" not in line:
                continue
            it, hu = (x.strip() for x in line.split("|", 1))
            if it.lower() in seen:
                continue
            seen.add(it.lower())
            n = len(words)
            words.append({"id": f"en-core-{lv}-{n + 1}", "it": it, "hu": hu, "b": f"core-en-{lv}-{n // CHUNK + 1}"})
        levels.append({"level": lv.upper(), "words": words})
    json.dump({"levels": levels}, open(os.path.join(HERE, "..", "data", "core-en.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print("alapszókincs:", ", ".join(f"{l['level']} {len(l['words'])}" for l in levels), "összesen", sum(len(l["words"]) for l in levels))


if __name__ == "__main__":
    main()
