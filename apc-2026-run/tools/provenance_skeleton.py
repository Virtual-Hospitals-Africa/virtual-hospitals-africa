"""Write or refresh <page_dir>/<slug>.provenance.json from the gate's canonical conditions.
Keeps entries already filled in (matched on rule + expr, in order); adds blank entries for new
conditions; drops entries whose condition no longer exists (printed). Also lists every red-box
element not yet cited or declared under `elements_not_encoded` with an empty reason. Run it again
after you fill in citations: it removes the elements you have since cited, so what is left is
exactly what still needs a reason.
Usage: python -I provenance_skeleton.py <page_dir> <elements pNN.json>   (run page_check.sh first)"""
import glob, json, os, re, sys
d, el = sys.argv[1], json.load(open(sys.argv[2]))
g = json.load(open(os.path.join(d, ".check", "gate.json")))
lisp = [f for f in g["files"]]
assert len(lisp) == 1, f"need exactly one .lisp in {d}: {lisp}"
slug = os.path.basename(lisp[0])[:-5]
path = os.path.join(d, slug + ".provenance.json")
old = json.load(open(path)) if os.path.exists(path) else {}
ws = lambda s: re.sub(r"\s+", " ", s or "").strip()
pool = {}
for p in old.get("conditions", []): pool.setdefault((p.get("rule"), ws(p.get("expr"))), []).append(p)
conds = []
for c in g["conditions"]:
    if not c["file"].startswith(g["apc_dir"]): continue
    k = (c["rule"], ws(c["expr"]))
    if pool.get(k): conds.append(pool[k].pop(0))
    else: conds.append(dict(rule=c["rule"], role=c["role"], expr=c["expr"], element_keys=[], quote="", confidence="", note=""))
for k, rest in pool.items():
    for p in rest: print("dropped (condition no longer in the .lisp):", k[0], "::", k[1][:120])
cited = {k for p in conds for k in p.get("element_keys", [])}
ne = [x for x in old.get("elements_not_encoded", []) if x.get("element_key") not in cited]
have = {x.get("element_key") for x in ne}
for e in el["elements"]:
    if e.get("box") == 0: continue  # outside the red boxes: cite if used, otherwise leave alone
    if e["key"] not in cited and e["key"] not in have:
        ne.append(dict(element_key=e["key"], element_id=e["id"], text=e["text"][:160], reason_category="", reason=""))
out = dict(edition="2026", page=el["page"], lisp_file=slug + ".lisp", conditions=conds, elements_not_encoded=ne,
           known_issues=old.get("known_issues", []), judgment_calls=old.get("judgment_calls", []))
json.dump(out, open(path, "w"), indent=1, ensure_ascii=False)
print(f"wrote {path}: {len(conds)} conditions ({sum(1 for p in conds if not p.get('quote'))} to fill), {len(ne)} elements not cited")
