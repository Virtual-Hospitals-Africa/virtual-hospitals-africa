"""Recorded repair (deterministic): rewrite strict time comparisons, which VHA's database rejects,
to the nearest comparator it accepts: (> (onset ...) ...) -> (>= ...), (< (onset ...) ...) -> (<= ...).
Applied to the final .lisp, its provenance, and the checker claims (so the review page still joins
verdicts to conditions). Each change is appended to reconcile.json "repairs" and becomes a
review-queue item: the six checkers judged the strict version.
Usage: python -I repair_time_comparators.py <ROOT> <slug>"""
import json, os, re, sys
ROOT, slug = sys.argv[1:3]
D = os.path.join(ROOT, "build", "final", slug)
PAT = re.compile(r"\((>|<)(\s+\((?:onset|timestamp_of_event)\b)")
fix = lambda t: PAT.sub(lambda m: "(" + m.group(1) + "=" + m.group(2), t)
lp = os.path.join(D, slug + ".lisp"); src = open(lp).read(); new = fix(src)
if new == src: print(slug, "no strict time comparisons"); sys.exit(0)
n = len(PAT.findall(src)); open(lp, "w").write(new)
for p in (os.path.join(D, slug + ".provenance.json"), os.path.join(ROOT, "checks", slug, "input", slug + ".claims.json")):
    if not os.path.exists(p): continue
    j = json.load(open(p))
    for c in j.get("conditions", []) + j.get("claims", []):
        old = c["expr"]; c["expr"] = fix(old)
        if p.endswith("provenance.json") and c["expr"] != old:
            c["note"] = (c.get("note") or "") + " [Repaired after checking: strict comparator changed to the nearest one VHA's database accepts.]"
    json.dump(j, open(p, "w"), indent=1, ensure_ascii=False)
rp = os.path.join(D, "reconcile.json"); r = json.load(open(rp)) if os.path.exists(rp) else {}
r.setdefault("repairs", []).append(dict(what="time comparator", change=f"{n} strict onset comparison(s): > became >=, < became <=",
    reason="VHA's database accepts only >= and <= for time comparisons (db/migrations/20260905021111); the language accepts > and <, so seeding failed",
    checked_version="the six checkers judged the strict version"))
json.dump(r, open(rp, "w"), indent=1, ensure_ascii=False)
print(slug, f"repaired {n} time comparison(s)")
