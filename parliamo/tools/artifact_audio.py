"""A claude.ai artifacthoz: az audio/*.json hangcsomagokat néhány nagyobb csomagba fűzi (artifactonként legfeljebb 511 fájl
lehet), és megírja az audio/packs.json térképet (csomagnév → összefűzött fájl). A webes app nem használja.
Futtatás: python3 parliamo/tools/artifact_audio.py <kimeneti mappa>  →  <mappa>/audio/pack-NN.json és packs.json"""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
CAP = 6_000_000  # bájt csomagonként; így egy-egy csomag letöltése sem túl nagy


def main(out):
    src = os.path.join(HERE, "..", "audio")
    os.makedirs(os.path.join(out, "audio"), exist_ok=True)
    names = sorted(f[:-5] for f in os.listdir(src) if f.endswith(".json") and f != "packs.json")
    packs, cur, size, mapping = [], {}, 0, {}
    for n in names:
        raw = open(os.path.join(src, n + ".json"), encoding="utf-8").read()
        if cur and size + len(raw) > CAP:
            packs.append(cur); cur, size = {}, 0
        cur[n] = json.loads(raw); size += len(raw)
    if cur:
        packs.append(cur)
    for i, p in enumerate(packs, 1):
        pid = f"pack-{i:02d}"
        json.dump(p, open(os.path.join(out, "audio", pid + ".json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
        for n in p:
            mapping[n] = pid
    json.dump(mapping, open(os.path.join(out, "audio", "packs.json"), "w", encoding="utf-8"), separators=(",", ":"))
    print(len(names), "hangcsomag →", len(packs), "összefűzött fájl")


if __name__ == "__main__":
    main(sys.argv[1])
