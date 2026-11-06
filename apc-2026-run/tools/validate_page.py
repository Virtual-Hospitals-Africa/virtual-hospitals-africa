"""Deterministic validation of one page's build (no model involved).

Reads the gate output (VHA parser + Will's constraints + canonical conditions), the page's
provenance file and its element inventory, and checks:
  parse         the .lisp file parses with VHA's compiler and schemas
  snomed        every concept resolves the way VHA resolves it (incl. finding_site values)
  provenance    every canonical condition has a provenance entry with the same rule and expr, and
                every provenance entry matches a condition (multiset, per rule)
  quotes        every quote is a verbatim substring of the cited elements' text (joined by a space)
  keys          every cited element key exists on the page
  coverage      every element is cited or listed in elements_not_encoded with a reason
  always_true   no (and A (or ... B ...)) where A is B or a descendant of B (is-a only)
  will          Will's integrity constraints at page level (reported; FAIL unless listed as a
                known issue in provenance.known_issues with a reason)
  files         remaining-questions.md exists; flowchart.md exists if the page is a flowchart page
Usage: python -I validate_page.py <gate.json> <provenance.json> <elements pNN.json> <snomed.sqlite> <page_dir> [--flowchart]
Prints a report and writes <page_dir>/validation.json. Exit 0 only if everything passes.
"""
import json, os, re, sqlite3, sys
from collections import Counter

gate_p, prov_p, el_p, db_p, page_dir = sys.argv[1:6]
flowchart = "--flowchart" in sys.argv
g = json.load(open(gate_p)); els = json.load(open(el_p)); db = sqlite3.connect(f"file:{db_p}?mode=ro", uri=True)
ws = lambda s: re.sub(r"\s+", " ", s or "").strip()
problems = {k: [] for k in ("parse", "snomed", "database", "provenance", "quotes", "keys", "coverage", "always_true", "will", "files")}

try:
    prov = json.load(open(prov_p))
except Exception as e:
    prov = {"conditions": [], "elements_not_encoded": [], "known_issues": []}
    problems["provenance"].append(f"cannot read provenance: {e}")

for pe in g["parse_errors"]:
    if pe["file"].startswith(g["apc_dir"]): problems["parse"].append(pe["error"][:600])
apc = [f for f in g["files"]]
if len(apc) != 1: problems["files"].append(f"expected exactly one .lisp file in the page folder, found {len(apc)}")

# snomed
for c in g["concepts"]:
    if not c["file"].startswith(g["apc_dir"]): continue
    if not db.execute("select 1 from vha_name where name=? and category=? limit 1", (c["name"], c["category"])).fetchone():
        problems["snomed"].append(f'{c["name"]} | {c["category"]}  (rule: {c["description"]})' + ("" if c["vha_checks"] else "  [VHA's own test would not catch this]"))
problems["snomed"] = sorted(set(problems["snomed"]))

# provenance <-> conditions (multiset per rule+expr)
conds = Counter((c["rule"], ws(c["expr"])) for c in g["conditions"] if c["file"].startswith(g["apc_dir"]))
provs = Counter((p.get("rule"), ws(p.get("expr"))) for p in prov.get("conditions", []))
for k, n in (conds - provs).items():
    problems["provenance"].append(f"condition without provenance (x{n}): rule '{k[0]}' :: {k[1]}")
for k, n in (provs - conds).items():
    problems["provenance"].append(f"provenance matches no condition (x{n}): rule '{k[0]}' :: {k[1]}")

# keys, quotes, coverage
by_key = {e["key"]: e for e in els["elements"]}
cited = set()
for p in prov.get("conditions", []):
    keys = p.get("element_keys") or []
    bad = [k for k in keys if k not in by_key]
    if bad: problems["keys"].append(f"unknown element keys {bad} (rule '{p.get('rule')}')")
    if not keys: problems["keys"].append(f"no element_keys for rule '{p.get('rule')}' :: {ws(p.get('expr'))[:120]}")
    cited |= set(keys)
    text = " ".join(ws(by_key[k]["text"]) for k in keys if k in by_key)
    q = ws(p.get("quote"))
    if not q: problems["quotes"].append(f"empty quote (rule '{p.get('rule')}')")
    elif q not in text: problems["quotes"].append(f"not verbatim: {q!r} not in cited text {text[:200]!r}")
declared = set()
for ne in prov.get("elements_not_encoded", []):
    k = ne.get("element_key")
    if k not in by_key: problems["keys"].append(f"elements_not_encoded has unknown key {k}")
    if not ws(ne.get("reason")): problems["coverage"].append(f"no reason given for not encoding {k}")
    declared.add(k)
for k in cited & declared:
    problems["coverage"].append(f"element both cited and listed as not encoded: {k}")
CATS = {"management_step", "flowchart_routing", "figure_or_note", "cross_reference_only", "not_representable", "no_snomed_concept", "out_of_scope_other"}
CONF = {"high", "medium", "low"}
for ne in prov.get("elements_not_encoded", []):
    if ne.get("reason_category") not in CATS: problems["coverage"].append(f"bad reason_category {ne.get('reason_category')!r} for {ne.get('element_key')} (allowed: {sorted(CATS)})")
for p in prov.get("conditions", []):
    if p.get("confidence") not in CONF: problems["provenance"].append(f"bad confidence {p.get('confidence')!r} (rule '{p.get('rule')}' :: {ws(p.get('expr'))[:80]})")
warnings = []
for p in prov.get("conditions", []):
    if p.get("role") == "trigger" and not any(by_key.get(k, {}).get("kind_hint") in ("header", "outside") for k in p.get("element_keys", [])):
        warnings.append(f"trigger does not cite a box header or page heading: rule '{p.get('rule')}' :: {ws(p.get('expr'))[:100]}")
for k, e in by_key.items():
    if e.get("box") == 0: continue  # text outside the red boxes: citable, coverage not required
    if k not in cited and k not in declared:
        problems["coverage"].append(f"element unaccounted for: {k} ({e['id']}) {e['text'][:100]!r}")

# always-true (is-a only, against the RF2 active is-a graph)
def ids(n, c): return {r[0] for r in db.execute("select id from vha_name where name=? and category=?", (n, c))}
def is_a_or_self(a, b):
    start, goal = ids(*a), ids(*b)
    if not start or not goal: return False
    seen = frontier = set(start)
    while frontier and not (seen & goal):
        frontier = {p for (p,) in db.execute(f"select parent from isa where child in ({','.join('?' * len(frontier))})", list(frontier))} - seen
        seen = seen | frontier
    return bool(seen & goal)
for c in g.get("always_true_candidates", []):
    # a qualified/attributed or-branch is narrower than its head concept: only flag when every
    # qualifier, attribute, value or history marker on the or-branch is also on the and-member
    if not set(c.get("or_extras", [])) <= set(c.get("and_extras", [])): continue
    if c["file"].startswith(g["apc_dir"]) and is_a_or_self(c["and_member"], c["or_member"]):
        problems["always_true"].append(f"rule '{c['rule']}': {c['and_member'][0]} is (a kind of) {c['or_member'][0]}, so that or-branch is always true when the rule's other condition holds")

# Will's constraints, unless declared as known issues
known = {(ws(k.get("check")), ws(k.get("s_expression"))) for k in prov.get("known_issues", []) if ws(k.get("reason"))}
for f in g["findings"]:
    if not f["file"].startswith(g["apc_dir"]): continue
    if f["check"] == "DATABASE REJECTS TIME COMPARATOR":
        problems["database"].append(f"{f['detail'][:200]} (rule: {f['description']}). VHA's database accepts only >= and <= in time comparisons: use >= for 'more than / at least', <= for 'within / up to', and note the change in provenance")
        continue
    if (ws(f["check"]), ws(f["detail"])) in known: continue
    problems["will"].append(f"{f['check']}: {f['detail'][:220]}  (rule: {f['description']})")

# companion files
names = os.listdir(page_dir)
if not any(n.endswith("-remaining-questions.md") for n in names): problems["files"].append("missing <slug>-remaining-questions.md")
if flowchart and not any(n.endswith("-flowchart.md") for n in names): problems["files"].append("flowchart page: missing <slug>-flowchart.md")

ok = not any(problems.values())
summary = {k: len(v) for k, v in problems.items()}
out = dict(ok=ok, summary=summary, problems=problems, warnings=warnings,
           counts=next(iter(g["counts"].values()), {}) if g["counts"] else {},
           n_conditions=sum(conds.values()), n_elements=sum(1 for e in by_key.values() if e.get("box")), n_outside=sum(1 for e in by_key.values() if not e.get("box")), n_cited=len(cited & set(by_key)), n_not_encoded=len(declared))
json.dump(out, open(os.path.join(page_dir, "validation.json"), "w"), indent=1, ensure_ascii=False)
print(("PASS" if ok else "FAIL"), json.dumps(summary), f"conditions={out['n_conditions']} elements={out['n_elements']} cited={out['n_cited']} not_encoded={out['n_not_encoded']}")
for k, v in problems.items():
    for line in v[:40]: print(f"  [{k}] {line}")
for line in warnings: print(f"  [warning, not blocking] {line}")
sys.exit(0 if ok else 1)
