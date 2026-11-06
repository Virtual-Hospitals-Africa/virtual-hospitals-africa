"""Where each finding the 2026 rules use would sit on VHA's 23 body regions (deterministic).

VHA's region lists (s_expression/finding_site_findings/*.lisp) give each region a SNOMED body
structure, the structures it leaves to other regions, and the findings it offers. The app uses
them to filter the triage warning-signs page by body site. A nurse can still search all of
SNOMED by name, so a finding missing from the lists can be recorded; it just has no place on
a body map.

Each distinct finding in the 2026 rules (conditions, triggers, check_for items) is placed by
the first test that succeeds:
  listed     the same concept is on a region list (an entry that names its own finding site
             matches only a finding at that site; qualifiers are ignored)
  rule site  the rule itself names a finding site that falls in a region
  related    it is a more specific kind (is-a descendant) of a region-list finding
  snomed     SNOMED's finding-site link puts it in a region
  spans      SNOMED gives a body site, but it covers several regions or none of the 23
  general    SNOMED gives no body site (systemic, history, tests); a "General" strip finding
Measurements, references to diagnoses and allergies are counted apart: they are not exam
findings.

A structure falls in a region when the region's structure is among its is-a or part-of
ancestors and none of the region's excluded structures is. When several regions qualify, the
most specific wins (Eye over Head).

Usage: python -I body_map_gaps.py <ROOT> <VHA clone>   (writes <ROOT>/body-map/)"""
import csv, glob, json, os, re, sqlite3, sys
from collections import defaultdict

ROOT, VHA = sys.argv[1], sys.argv[2]
OUT = os.path.join(ROOT, "body-map"); os.makedirs(OUT, exist_ok=True)
db = sqlite3.connect(f"file:{os.path.join(ROOT, 'data', 'snomed-20251201.sqlite')}?mode=ro", uri=True)
C = re.compile(r'\(snomed_concept "((?:[^"\\]|\\.)*)" "([^"]*)"\)')
PART_OF = ("regional_part_of", "constitutional_part_of", "lateral_half_of", "all_or_part_of")

def cid(name, cat):
    r = db.execute("select id from vha_name where name=? and category=?", (name, cat)).fetchone()
    return r[0] if r else None

_anc = {}
def ancestors(i, part_of=True):
    """is-a ancestors (and part-of, for body structures), including i itself."""
    k = (i, part_of)
    if k in _anc: return _anc[k]
    seen, todo = {i}, [i]
    while todo:
        x = todo.pop()
        nxt = [r[0] for r in db.execute("select parent from isa where child=?", (x,))]
        if part_of:
            nxt += [r[0] for r in db.execute(
                f"select dst from rel where src=? and type in ({','.join('?' * len(PART_OF))})", (x, *PART_OF))]
        for y in nxt:
            if y not in seen: seen.add(y); todo.append(y)
    _anc[k] = seen
    return seen

# ---- VHA's 23 regions ------------------------------------------------------------------------
regions = []
for f in sorted(glob.glob(os.path.join(VHA, "s_expression", "finding_site_findings", "*.lisp"))):
    t = open(f).read()
    label = re.search(r'\(finding_site_findings\s+"([^"]+)"', t).group(1)
    struct = C.search(t[t.index("(finding_site_structure"):]).groups()
    excl = []
    if "(excluding_structures" in t:
        block = t[t.index("(excluding_structures"):t.index("(clinical_findings")]
        excl = C.findall(block)
    findings = []                                           # ((name, cat), site or None)
    for line in t[t.index("(clinical_findings"):].splitlines():
        if "(clinical_finding " in line:
            s = re.search(r'\(finding_site \(snomed_concept "((?:[^"\\]|\\.)*)" "([^"]*)"\)\)', line)
            findings.append((C.findall(line)[0], s.groups() if s else None))
    regions.append(dict(file=os.path.basename(f), label=label, structure=struct, structure_id=cid(*struct),
                        excluding=excl, excluding_ids=[cid(*e) for e in excl], findings=findings))
for r in regions: assert r["structure_id"], r["label"]

def regions_of_structure(sid):
    anc = ancestors(sid)
    hits = [r for r in regions if r["structure_id"] in anc and not any(e in anc for e in r["excluding_ids"] if e)]
    # most specific wins: drop a region whose structure is an ancestor of another hit's structure
    return [r for r in hits if not any(o is not r and r["structure_id"] in ancestors(o["structure_id"]) for o in hits)]

entries = []                                                 # every region-list entry
for r in regions:
    for k, site in r["findings"]:
        entries.append(dict(region=r["label"], key=k, id=cid(*k), site=site, site_id=cid(*site) if site else None, used=None))
by_key = defaultdict(list)
for e in entries: by_key[e["key"]].append(e)
by_id = defaultdict(list)                                    # bare entries (no own site), for is-a matching
for e in entries:
    if e["id"] and not e["site"]: by_id[e["id"]].append(e)
ROOT_FINDING = cid("Clinical finding", "finding")

def site_ok(e, site_ids):
    return not e["site"] or any(e["site_id"] in ancestors(s) for s in site_ids)

# ---- findings the 2026 rules use ---------------------------------------------------------------
g = json.load(open(os.path.join(ROOT, "ruleset", ".check", "gate.json")))
FINDING = re.compile(r'\(finding \(snomed_concept "[^"]*" "[^"]*"\) \(snomed_concept "((?:[^"\\]|\\.)*)" "([^"]*)"\)')
SITE = re.compile(r'\(attribute \(snomed_concept "Finding site" "attribute"\) \(snomed_concept "((?:[^"\\]|\\.)*)" "([^"]*)"\)\)')
use = defaultdict(lambda: dict(pages=set(), roles=set(), sites=set(), rules=0))
other = defaultdict(lambda: dict(pages=set(), n=0))
for x in g["conditions"]:
    if x["role"] == "diagnosis" or not re.match(r"^\d+-", os.path.basename(x["file"])): continue
    e, page = x["expr"], int(os.path.basename(x["file"]).split("-")[0])
    m = FINDING.search(e)
    if m and not re.match(r"^\((no )?\(?(diagnosis|active_condition)", e):
        u = use[m.groups()]
        u["pages"].add(page); u["roles"].add(x["role"]); u["rules"] += 1
        for s in SITE.findall(e): u["sites"].add(s)
        continue
    kind = ("measurement" if "(measurement" in e else "allergy" if e.startswith("(allergy") else
            "diagnosis or condition" if re.search(r"\((diagnosis|active_condition) ", e) else "other")
    o = other[kind]; o["pages"].add(page); o["n"] += 1

anchor_names = set()
for f in ("warning_signs", "common_symptoms"):
    anchor_names |= set(C.findall(open(os.path.join(ROOT, "builder-pack", "anchors", f + ".ts")).read()))

# ---- place each finding --------------------------------------------------------------------------
rows = []
for (name, cat), u in sorted(use.items()):
    i = cid(name, cat)
    site_ids = [s for s in (cid(*x) for x in sorted(u["sites"])) if s]
    row = dict(finding=name, category=cat, pages=len(u["pages"]), page_list=" ".join(map(str, sorted(u["pages"]))),
               uses=u["rules"], roles=", ".join(sorted(u["roles"])),
               rule_sites="; ".join(sorted(s[0] for s in u["sites"])), status="", regions="", via="",
               on_triage_lists=(name, cat) in anchor_names)
    exact = [e for e in by_key.get((name, cat), []) if site_ok(e, site_ids)]
    if exact:
        for e in exact: e["used"] = e["used"] or "exact"
        row.update(status="listed", regions=", ".join(sorted({e["region"] for e in exact})))
        rows.append(row); continue
    placed = {}                                              # the rules' own sites: every region they name
    for s in site_ids:
        hits = regions_of_structure(s)
        if len(hits) == 1:
            placed.setdefault(hits[0]["label"], db.execute("select name from vha_name where id=?", (s,)).fetchone()[0])
    if placed:
        row.update(status="rule site", regions=", ".join(sorted(placed)), via="; ".join(placed[k] for k in sorted(placed)))
    if row["status"]: rows.append(row); continue
    if i and i != ROOT_FINDING:                              # a more specific kind of a listed finding
        rel = [e for a in ancestors(i, False) if a != i and a != ROOT_FINDING for e in by_id.get(a, [])]
        if rel:
            for e in rel: e["used"] = e["used"] or "related"
            row.update(status="related", regions=", ".join(sorted({e["region"] for e in rel})),
                       via="; ".join(sorted({f"{e['key'][0]} ({e['key'][1]})" for e in rel})[:3]))
            rows.append(row); continue
    if i and i != ROOT_FINDING:                              # SNOMED's own finding site
        sites = [r[0] for r in db.execute("select dst from rel where src=? and type='finding_site'", (i,))]
        names = sorted(db.execute("select name from vha_name where id=?", (s,)).fetchone()[0] for s in sites)
        hits = sorted({r["label"] for s in sites for r in regions_of_structure(s)})
        if len(hits) == 1:
            row.update(status="snomed", regions=hits[0], via="; ".join(names))
        elif sites:
            row.update(status="spans", regions=", ".join(hits), via="; ".join(names))
    if not row["status"]:
        row.update(status="general")
    rows.append(row)

with open(os.path.join(OUT, "findings.csv"), "w", newline="") as fh:
    w = csv.DictWriter(fh, fieldnames=list(rows[0].keys())); w.writeheader(); w.writerows(rows)

# A list item is a finding at an optional site; the same item listed again with other qualifiers
# counts once, with the best use any of its entries got (exact > related > unused).
RANK = {"exact": 2, "related": 1, None: 0}
fmt = lambda e: f"{e['key'][0]} ({e['key'][1]})" + (f" at {e['site'][0]}" if e["site"] else "")
items = {}                                                   # (region, item) -> best use
for e in entries:
    k = (e["region"], fmt(e))
    if k not in items or RANK[e["used"]] > RANK[items[k]]: items[k] = e["used"]
per_region = []
for r in regions:
    lab = r["label"]
    mine = {name: u for (reg, name), u in items.items() if reg == lab}
    per_region.append(dict(
        region=lab, file=r["file"], structure=r["structure"][0], listed=len(mine),
        used_exact=sorted(n for n, u in mine.items() if u == "exact"),
        used_related_only=sorted(n for n, u in mine.items() if u == "related"),
        unused=sorted(n for n, u in mine.items() if not u),
        gaps=sorted(([x["finding"] + f" ({x['category']})", x["pages"], x["status"]] for x in rows
                     if x["status"] in ("rule site", "snomed") and lab in x["regions"].split(", ")), key=lambda t: (-t[1], t[0])),
    ))
summary = dict(
    findings=len(rows),
    by_status={s: sum(1 for x in rows if x["status"] == s) for s in ("listed", "rule site", "related", "snomed", "spans", "general")},
    general_on_triage_lists=sum(1 for x in rows if x["status"] == "general" and x["on_triage_lists"]),
    not_exam_findings={k: dict(conditions=v["n"], pages=len(v["pages"])) for k, v in sorted(other.items())},
    region_list_items=len(items),
    region_list_items_unused=sum(1 for u in items.values() if not u),
)
json.dump(dict(summary=summary, regions=per_region), open(os.path.join(OUT, "gaps.json"), "w"), indent=1, ensure_ascii=False)
print(json.dumps(summary, indent=1))
for p in per_region:
    print(f'{p["region"]:28} listed {p["listed"]:3}  used {len(p["used_exact"]):3}  related {len(p["used_related_only"]):3}  '
          f'unused {len(p["unused"]):3}  new here {len(p["gaps"]):3}')
