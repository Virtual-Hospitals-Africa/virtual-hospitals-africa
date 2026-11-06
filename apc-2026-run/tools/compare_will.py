"""Compare a page's final 2026 build with Will's 2023 rules for the paired page (deterministic).
Will's conditions come from data/gate-will-2023.json (tools/gate.ts over s_expression/rules/apc-adult
at VHA main 211b16110). Matching is within role: exact canonical match, then is-a related (one
concept a descendant of the other), else only-2023 / only-2026. This is a comparison, not a grade:
2026 pages changed, and Will's 2023 rules are themselves mostly unreviewed against his standard.
Usage: python -I compare_will.py <ROOT> <slug>"""
import json, os, re, sqlite3, sys
ROOT, slug = sys.argv[1], sys.argv[2]
F = lambda *p: os.path.join(ROOT, *p)
m = next(p for p in json.load(open(F("manifest.json"))) if p["slug"] == slug)
db = sqlite3.connect(f"file:{F('data', 'snomed-20251201.sqlite')}?mode=ro", uri=True)
ws = lambda s: re.sub(r"\s+", " ", s or "").strip()
CONCEPT = re.compile(r'\(snomed_concept "((?:[^"\\]|\\.)*)" "([^"]*)"\)')
def spec(e):
    cs = [c for c in CONCEPT.findall(e) if c != ("Clinical finding", "finding")]
    return cs[0] if cs else None
def ids(c): return {r[0] for r in db.execute("select id from vha_name where name=? and category=?", c)}
def is_a(c, anc):
    s, g = ids(c), ids(anc)
    if not s or not g: return False
    seen = fr = set(s)
    while fr and not (seen & g):
        fr = {p for (p,) in db.execute(f"select parent from isa where child in ({','.join('?' * len(fr))})", list(fr))} - seen
        seen = seen | fr
    return bool(seen & g)
role = lambda c: c["role"] if c["role"] in ("trigger", "check_for", "priority_condition", "diagnosis_condition", "diagnosis") else "measured"
out = dict(page_2026=m["page"], page_2023=m.get("page_2023"), will_file=m.get("will_2023_file"), redbox_status_2023=m.get("redbox_status"), groups={})
gf = F("build", "final", slug, ".check", "gate.json")
if not m.get("will_2023_file") or not os.path.exists(gf):
    out["note"] = "no 2023 rule file for this page" if not m.get("will_2023_file") else "no final build"
else:
    will = [c for c in json.load(open(F("data", "gate-will-2023.json")))["conditions"] if c["file"].endswith("/" + m["will_2023_file"])]
    g = json.load(open(gf)); new = [c for c in g["conditions"] if c["file"].startswith(g["apc_dir"])]
    for r in ("trigger", "check_for", "priority_condition", "diagnosis_condition", "diagnosis", "measured"):
        W = sorted({ws(c["expr"]) for c in will if role(c) == r}); N = sorted({ws(c["expr"]) for c in new if role(c) == r})
        both = sorted(set(W) & set(N)); ow = [x for x in W if x not in both]; on = [x for x in N if x not in both]
        rel = []
        for x in ow:
            for y in on:
                a, b = spec(x), spec(y)
                if a and b and a != b and (is_a(a, b) or is_a(b, a)): rel.append(dict(will_2023=x, build_2026=y, relation="2023 narrower" if is_a(a, b) else "2026 narrower"))
        out["groups"][r] = dict(both=both, only_2023=ow, only_2026=on, is_a_related=rel)
    out["counts"] = dict(will_2023=len({ws(c["expr"]) + c["role"] for c in will}), build_2026=len({ws(c["expr"]) + c["role"] for c in new}),
                         exact=sum(len(v["both"]) for v in out["groups"].values()), related=sum(len(v["is_a_related"]) for v in out["groups"].values()))
os.makedirs(F("checks", slug), exist_ok=True)
json.dump(out, open(F("checks", slug, "vs-will-2023.json"), "w"), indent=1, ensure_ascii=False)
print(slug, out.get("counts") or out.get("note"))
