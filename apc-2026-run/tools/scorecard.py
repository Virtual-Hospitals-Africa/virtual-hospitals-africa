"""Merge one page's validation, reconcile record and six checker reports into a scorecard and a
review queue (deterministic). Every item a person must look at becomes one queue row.

Element (forward, 3 checkers):
  agreed      all 3 say in_scope+correct, or all 3 say out_of_scope and the build did not encode it
  queue       high if any checker says error or missing; medium if 2+ say partial, or 2+ say in
              scope for an element the build left out; low for a single dissent
Claim (backward, 3 checkers):
  agreed      all 3 faithful
  queue       high if any says wrong or unsupported (or a report is missing); medium if 2+ say
              imprecise; low for a single imprecise
Also queued: every rule-level problem (high/medium per checker severity), every unsettled
reconcile decision (medium), every known issue left in place (medium), and every builder
disagreement the reconciler resolved (low, so the reviewer can see both builds' choices).
Usage: python -I scorecard.py <ROOT> <slug> <page>"""
import json, os, sys
from collections import Counter
ROOT, slug, page = sys.argv[1], sys.argv[2], int(sys.argv[3])
F = lambda *p: os.path.join(ROOT, *p)
def load(p, default=None):
    try: return json.load(open(p))
    except Exception: return default
els = load(F("inputs", "2026", f"p{page}.json"))["elements"]
prov = load(F("build", "final", slug, slug + ".provenance.json"), {})
val = load(F("build", "final", slug, "validation.json"), {})
rec = load(F("build", "final", slug, "reconcile.json"), {})
diff = load(F("build", "final", slug, "diff.json"), {})
claims = load(F("checks", slug, "input", slug + ".claims.json"), {}).get("claims", [])
fw = [load(F("checks", slug, f"forward-{i}.json")) for i in (1, 2, 3)]
bw = [load(F("checks", slug, f"backward-{i}.json")) for i in (1, 2, 3)]
missing_reports = [f"forward-{i+1}" for i, x in enumerate(fw) if not x] + [f"backward-{i+1}" for i, x in enumerate(bw) if not x]
fw = [x for x in fw if x]; bw = [x for x in bw if x]
not_encoded = {x["element_key"]: x for x in prov.get("elements_not_encoded", [])}
queue = []
def q(kind, priority, ref, text, detail):
    queue.append(dict(page=page, slug=slug, kind=kind, priority=priority, ref=ref, text=text, detail=detail))

# forward, per element
el_rows = []
for e in els:
    k = e["key"]
    votes = []
    for r in fw:
        m = [x for x in r.get("elements", []) if x.get("element_key") == k]
        if m: votes.append(m[0])
        elif e.get("box") == 0 and k in (r.get("outside_not_logic") or []): votes.append(dict(scope="out_of_scope", verdict="", scope_reason="not triage/diagnostic logic"))
        else: votes.append(dict(scope="(no verdict)", verdict="(no verdict)", checker=r.get("checker")))
    scopes = Counter(v.get("scope") for v in votes); verdicts = Counter(v.get("verdict") for v in votes if v.get("scope") != "out_of_scope")
    all_correct = len(votes) == 3 and all(v.get("scope") == "in_scope" and v.get("verdict") == "correct" for v in votes)
    cited_keys = {kk for p in prov.get("conditions", []) for kk in p.get("element_keys", [])}
    all_out = len(votes) == 3 and all(v.get("scope") == "out_of_scope" for v in votes) and (k in not_encoded or (e.get("box") == 0 and k not in cited_keys))
    status = "agreed" if (all_correct or all_out) else "queue"
    if status == "queue":
        bad = verdicts.get("error", 0) + verdicts.get("missing", 0)
        pr = "high" if bad else ("medium" if verdicts.get("partial", 0) >= 2 or (scopes.get("in_scope", 0) >= 2 and k in not_encoded) else "low")
        q("element", pr, k, e["text"][:300], [dict(checker=r.get("checker"), scope=v.get("scope"), verdict=v.get("verdict"),
          parts_missing=v.get("parts_missing"), problem=v.get("problem") or v.get("scope_reason"), confidence=v.get("confidence")) for r, v in zip(fw, votes)])
    el_rows.append(dict(key=k, id=e["id"], box=e.get("box"), status=status, scopes=dict(scopes), verdicts=dict(verdicts)))

# backward, per claim
cl_rows = []
for c in claims:
    votes = []
    for r in bw:
        m = [x for x in r.get("claims", []) if x.get("claim_id") == c["claim_id"]]
        votes.append(m[0] if m else dict(verdict="(no verdict)"))
    v = Counter(x.get("verdict") for x in votes)
    status = "agreed" if len(votes) == 3 and v.get("faithful", 0) == 3 else "queue"
    if status == "queue":
        hi = v.get("wrong", 0) + v.get("unsupported", 0) or v.get("(no verdict)", 0)
        pr = "high" if hi else ("medium" if v.get("imprecise", 0) >= 2 else "low")
        q("claim", pr, c["claim_id"], f'{c["rule"]} :: {c["expr"]}', [dict(checker=r.get("checker"), verdict=x.get("verdict"), reason=x.get("reason"),
          fix=x.get("fix"), confidence=x.get("confidence")) for r, x in zip(bw, votes)])
    cl_rows.append(dict(claim_id=c["claim_id"], rule=c["rule"], status=status, verdicts=dict(v)))

# rule-level problems
for r in fw:
    for p in r.get("rule_level_problems", []):
        q("rule", "high" if p.get("severity") == "high" else "medium", p.get("rule", ""), p.get("problem", ""), [dict(checker=r.get("checker"), severity=p.get("severity"))])
for r in bw:
    for p in r.get("rules", []):
        if p.get("verdict") == "problem":
            q("rule", "high" if p.get("severity") == "high" else "medium", p.get("rule", ""), p.get("problem", ""), [dict(checker=r.get("checker"), severity=p.get("severity"))])
for d in rec.get("decisions", []):
    q("build_disagreement", "medium" if d.get("unsettled") else "low", d.get("role", ""), d.get("difference", ""),
      [dict(choice=d.get("choice"), final=d.get("final_expr"), reason=d.get("reason"), unsettled=d.get("unsettled"))])
for r_ in rec.get("repairs", []):
    q("post_check_repair", "medium", r_.get("what", ""), r_.get("change", ""), [dict(reason=r_.get("reason"), checked_version=r_.get("checked_version"))])
for k in prov.get("known_issues", []):
    q("known_issue", "medium", k.get("check", ""), k.get("s_expression", ""), [dict(reason=k.get("reason"))])
if not val.get("ok"):
    q("validation", "high", "page_check", "final build does not pass the deterministic checks", val.get("problems"))
for m in missing_reports:
    q("process", "high", m, "checker report missing", [])

pc = Counter(x["priority"] for x in queue)
card = dict(page=page, slug=slug, validation_ok=val.get("ok"), builder_agreement=diff.get("agreement"),
            elements=len(el_rows), elements_agreed=sum(1 for x in el_rows if x["status"] == "agreed"),
            claims=len(cl_rows), claims_agreed=sum(1 for x in cl_rows if x["status"] == "agreed"),
            queue=len(queue), queue_by_priority=dict(pc), missing_reports=missing_reports, element_rows=el_rows, claim_rows=cl_rows)
os.makedirs(F("checks", slug), exist_ok=True)
json.dump(card, open(F("checks", slug, "scorecard.json"), "w"), indent=1, ensure_ascii=False)
json.dump(queue, open(F("checks", slug, "review-queue.json"), "w"), indent=1, ensure_ascii=False)
print(f"p{page} {slug}: elements agreed {card['elements_agreed']}/{card['elements']}, claims agreed {card['claims_agreed']}/{card['claims']}, queue {len(queue)} {dict(pc)}")
