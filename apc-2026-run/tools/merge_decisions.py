"""Append exported review decisions to the ledger (deterministic, append-only).
Rows are never edited or removed. A row already in the ledger (same reviewer, item and timestamp)
is not added twice. Each reviewer's current decision on an item is their latest row; the derived
state is printed, not stored.
Usage: python -I merge_decisions.py <ROOT> <exported.json> [...]"""
import csv, json, os, sys
ROOT, files = sys.argv[1], sys.argv[2:]
LEDGER = os.path.join(ROOT, "review", "decisions.csv")
COLS = ["timestamp", "reviewer", "role", "edition", "page", "slug", "item", "decision", "note", "rule_hash", "needs_reconfirm",
        "snomed_release", "extractor", "renderer", "source_file"]
manifest = {p["slug"]: p for p in json.load(open(os.path.join(ROOT, "manifest.json")))}
seen = set()
if os.path.exists(LEDGER):
    for r in csv.DictReader(open(LEDGER)): seen.add((r["reviewer"], r["item"], r["timestamp"]))
new = []
for f in files:
    d = json.load(open(f))
    if d.get("slug") not in manifest: sys.exit(f"{f}: unknown page {d.get('slug')}")
    for x in d.get("decisions", []):
        k = (x.get("reviewer") or d.get("reviewer") or "", x["item"], x.get("ts", ""))
        if k in seen: continue
        seen.add(k)
        new.append(dict(timestamp=x.get("ts", ""), reviewer=k[0], role=x.get("role") or d.get("role") or "", edition=d["edition"], page=d["page"], slug=d["slug"],
                        item=x["item"], decision=x.get("decision", ""), note=x.get("note", ""), rule_hash=x.get("rule_hash", ""),
                        needs_reconfirm=x.get("rule_hash") != d.get("rule_hash"), snomed_release="INT 20251201", extractor="v2", renderer="r1",
                        source_file=os.path.basename(f)))
os.makedirs(os.path.dirname(LEDGER), exist_ok=True)
write_header = not os.path.exists(LEDGER)
with open(LEDGER, "a", newline="") as fh:
    w = csv.DictWriter(fh, fieldnames=COLS)
    if write_header: w.writeheader()
    w.writerows(new)
rows = list(csv.DictReader(open(LEDGER)))
latest = {}
for r in sorted(rows, key=lambda r: r["timestamp"]): latest[(r["reviewer"], r["slug"], r["item"])] = r
conflicts = {}
for (rv, slug, item), r in latest.items(): conflicts.setdefault((slug, item), set()).add(r["decision"])
print(f"added {len(new)} rows; ledger has {len(rows)}; current decisions {len(latest)}; "
      f"signed off by a clinical reviewer {sum(1 for r in latest.values() if r['role'] == 'clinical' and r['decision'] in ('accept', 'confirm out of scope'))}; "
      f"items where reviewers disagree {sum(1 for v in conflicts.values() if len(v) > 1)}")
