"""Constraint 1: every SNOMED concept resolves the way VHA resolves it (exact name + category,
active FSN of an active concept). For a miss, suggest close VHA names from synonyms.
Usage: python -I check_concepts.py <gate.json> <snomed.sqlite> <out.json>"""
import json, sqlite3, sys
g = json.load(open(sys.argv[1])); db = sqlite3.connect(sys.argv[2]); out = []
seen = {}
for c in g["concepts"]:
    k = (c["name"], c["category"])
    if k not in seen:
        ok = db.execute("select 1 from vha_name where name=? and category=? limit 1", k).fetchone() is not None
        sugg = []
        if not ok:
            sugg = [f"{n} ({cat})" for n, cat in db.execute(
                "select distinct v.name, v.category from synonym s join vha_name v on v.id=s.id where s.term=? collate nocase "
                "union select name, category from vha_name where name=? collate nocase limit 6", (k[0], k[0]))]
        seen[k] = (ok, sugg)
    ok, sugg = seen[k]
    if not ok: out.append(dict(c, suggestions=sugg))
json.dump(out, open(sys.argv[3], "w"), indent=1, ensure_ascii=False)
print(f"concepts {len(g['concepts'])} distinct {len(seen)} not resolving {sum(1 for v in seen.values() if not v[0])}")
for o in {(o['name'], o['category']): o for o in out}.values(): print(" ", o["file"].split("/")[-1], "|", o["name"], "|", o["category"], "->", o["suggestions"][:3])
