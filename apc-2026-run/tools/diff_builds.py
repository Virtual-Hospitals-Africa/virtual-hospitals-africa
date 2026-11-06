"""Compare two builds of one page, condition by condition (deterministic).
Uses each build's .check/gate.json (canonical conditions from VHA's parser). Rule names are
ignored for matching; conditions are compared within each role. Where a condition only one build
has shares a concept lineage with one only the other has, the is-a relation is noted.
Usage: python -I diff_builds.py <A_dir> <B_dir> <snomed.sqlite> <out diff.json>"""
import json, os, re, sqlite3, sys
from collections import Counter
a_dir, b_dir, db_p, out_p = sys.argv[1:5]
db = sqlite3.connect(f"file:{db_p}?mode=ro", uri=True)
ws = lambda s: re.sub(r"\s+", " ", s or "").strip()
CONCEPT = re.compile(r'\(snomed_concept "((?:[^"\\]|\\.)*)" "([^"]*)"\)')

def load(d):
    g = json.load(open(os.path.join(d, ".check", "gate.json")))
    cs = [c for c in g["conditions"] if c["file"].startswith(g["apc_dir"])]
    rules = sorted({(c["atom"], c["rule"]) for c in cs})
    return cs, rules

def role_of(c):
    return c["role"] if c["role"] in ("trigger", "check_for", "priority_condition", "diagnosis_condition", "diagnosis") else "measured"

def specific(expr):
    cs = CONCEPT.findall(expr)
    cs = [c for c in cs if c != ("Clinical finding", "finding")]
    return cs[0] if cs else None

def ids(c): return {r[0] for r in db.execute("select id from vha_name where name=? and category=?", c)}
def is_a(c, anc):
    s, goal = ids(c), ids(anc)
    if not s or not goal: return False
    seen = fr = set(s)
    while fr and not (seen & goal):
        fr = {p for (p,) in db.execute(f"select parent from isa where child in ({','.join('?' * len(fr))})", list(fr))} - seen
        seen = seen | fr
    return bool(seen & goal)

ca, ra = load(a_dir); cb, rb = load(b_dir)
groups = {}
for role in ("trigger", "check_for", "priority_condition", "diagnosis_condition", "diagnosis", "measured"):
    A = Counter(ws(c["expr"]) for c in ca if role_of(c) == role)
    B = Counter(ws(c["expr"]) for c in cb if role_of(c) == role)
    only_a, only_b, both = sorted((A - B).elements()), sorted((B - A).elements()), sorted((A & B).elements())
    lineage = []
    for x in set(only_a):
        for y in set(only_b):
            sx, sy = specific(x), specific(y)
            if not sx or not sy or sx == sy: continue
            if is_a(sx, sy): lineage.append(dict(A=x, B=y, relation="A_narrower"))
            elif is_a(sy, sx): lineage.append(dict(A=x, B=y, relation="B_narrower"))
    same_concept_diff_form = [dict(A=x, B=y) for x in set(only_a) for y in set(only_b) if specific(x) and specific(x) == specific(y)]
    groups[role] = dict(only_A=only_a, only_B=only_b, both=both, is_a_related=lineage, same_concept_different_form=same_concept_diff_form)
tot_a, tot_b = len(ca), len(cb)
agree = sum(len(g["both"]) for g in groups.values())
out = dict(A=a_dir, B=b_dir, rules_A=[dict(atom=x, description=y) for x, y in ra], rules_B=[dict(atom=x, description=y) for x, y in rb],
           conditions_A=tot_a, conditions_B=tot_b, conditions_in_both=agree,
           agreement=round(2 * agree / (tot_a + tot_b), 3) if tot_a + tot_b else 1.0, groups=groups)
json.dump(out, open(out_p, "w"), indent=1, ensure_ascii=False)
print(f"A {tot_a} conditions, B {tot_b}, in both {agree}, agreement {out['agreement']}; differences: " +
      ", ".join(f"{r}: -{len(g['only_A'])}/+{len(g['only_B'])}" for r, g in groups.items() if g['only_A'] or g['only_B']))
