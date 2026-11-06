"""Generate the review pages (deterministic): one self-contained HTML per APC page plus an index,
into <ROOT>/review/. Data and crops are inlined (file:// cannot fetch). Nothing loads from the
network. Design: ../review-page-handoff-20261101.md, "The design".

Inputs per page (missing ones are shown as missing, never silently skipped):
  inputs/2026/pN.json, pN-boxK.png       elements, box rectangles, crops
  build/final/<slug>/                    .lisp, provenance, validation, reconcile, diff, flowchart, questions
  build/final/<slug>/.check/render.json  plain-English rendering (tools/render.ts)
  checks/<slug>/                         forward-1..3, backward-1..3, claims, scorecard, review-queue
  data/snomed-20251201.sqlite            breadth (active descendants) and parents
Usage: python -I build_review.py <ROOT> [slug ...]"""
import base64, hashlib, html, json, os, re, sqlite3, sys
from datetime import date

ROOT = sys.argv[1]
F = lambda *p: os.path.join(ROOT, *p)
def load(p, default=None):
    try:
        with open(p) as f: return json.load(f)
    except Exception: return default
def text(p):
    try:
        with open(p) as f: return f.read()
    except Exception: return None
manifest = load(F("manifest.json"))
only = set(sys.argv[2:])
db = sqlite3.connect(f"file:{F('data', 'snomed-20251201.sqlite')}?mode=ro", uri=True)
os.makedirs(F("review"), exist_ok=True)
CONCEPT = re.compile(r'\(snomed_concept "((?:[^"\\]|\\.)*)" "([^"]*)"\)')
_breadth = {}
def breadth(name, cat):
    k = (name, cat)
    if k in _breadth: return _breadth[k]
    ids = [r[0] for r in db.execute("select id from vha_name where name=? and category=?", k)]
    if not ids:
        _breadth[k] = dict(resolves=False); return _breadth[k]
    n = db.execute("""with recursive d(id) as (select child from isa where parent=? union select i.child from isa i join d on i.parent=d.id)
                      select count(*) from d""", (ids[0],)).fetchone()[0]
    parents = [r[0] + " (" + r[1] + ")" for r in db.execute(
        "select v.name, v.category from isa i join vha_name v on v.id=i.parent where i.child=? limit 3", (ids[0],))]
    _breadth[k] = dict(resolves=True, id=ids[0], descendants=n, parents=parents)
    return _breadth[k]

def b64(p):
    try:
        with open(p, "rb") as f: return "data:image/png;base64," + base64.b64encode(f.read()).decode()
    except Exception: return None

TODAY = date.today().isoformat()
index_rows = []
TEMPLATE = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "review_template.html")).read()

for m in manifest:
    slug, n = m["slug"], m["page"]
    if only and slug not in only: continue
    fin = F("build", "final", slug)
    els = load(F("inputs", "2026", f"p{n}.json"), {})
    prov = load(os.path.join(fin, slug + ".provenance.json"), {})
    render = load(os.path.join(fin, ".check", "render.json"), {})
    rules = next(iter(render.values()), []) if render else []
    concepts = {}
    for c in prov.get("conditions", []):
        for name, cat in CONCEPT.findall(c.get("expr", "")):
            if (name, cat) != ("Clinical finding", "finding"): concepts[f"{name}|{cat}"] = breadth(name, cat)
    data = dict(
        edition="2026", page=n, title=m["title"], slug=slug, generated=TODAY, manifest=m,
        elements=els.get("elements", []), boxes=els.get("boxes", []),
        crops={str(b["box"]): b64(F("inputs", "2026", f"p{n}-box{b['box']}.png")) for b in els.get("boxes", [])},
        page_image=None,
        lisp=text(os.path.join(fin, slug + ".lisp")), rules=rules, provenance=prov,
        validation=load(os.path.join(fin, "validation.json")), reconcile=load(os.path.join(fin, "reconcile.json")),
        diff=load(os.path.join(fin, "diff.json")),
        flowchart=text(os.path.join(fin, slug + "-flowchart.md")), questions=text(os.path.join(fin, slug + "-remaining-questions.md")),
        claims=load(F("checks", slug, "input", slug + ".claims.json"), {}).get("claims", []),
        forward=[load(F("checks", slug, f"forward-{i}.json")) for i in (1, 2, 3)],
        backward=[load(F("checks", slug, f"backward-{i}.json")) for i in (1, 2, 3)],
        scorecard=load(F("checks", slug, "scorecard.json")), queue=load(F("checks", slug, "review-queue.json"), []),
        concepts=concepts, vs_will=load(F("checks", slug, "vs-will-2023.json")),
    )
    data["rule_hash"] = hashlib.sha1((data["lisp"] or "").encode()).hexdigest()[:12]
    page_html = TEMPLATE.replace("__TITLE__", html.escape(f"APC 2026 p{n} {m['title'].title()}")).replace(
        "__DATA__", json.dumps(data, ensure_ascii=False).replace("</", "<\\/"))
    with open(F("review", slug + ".html"), "w") as f: f.write(page_html)
    sc = data["scorecard"] or {}
    index_rows.append(dict(page=n, slug=slug, title=m["title"], flowchart=m.get("flowchart"), status_2023=", ".join(m.get("redbox_status") or []) or m.get("index_status"),
        built=bool(data["lisp"]), ok=(data["validation"] or {}).get("ok"), conditions=len(prov.get("conditions", [])),
        elements=len(data["elements"]), queue=sc.get("queue"), high=(sc.get("queue_by_priority") or {}).get("high", 0),
        agreement=sc.get("builder_agreement"), rule_hash=data["rule_hash"]))

idx = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "review_index_template.html")).read()
with open(F("review", "index.html"), "w") as f:
    f.write(idx.replace("__DATA__", json.dumps(dict(generated=TODAY, rows=sorted(index_rows, key=lambda r: r["page"])), ensure_ascii=False).replace("</", "<\\/")))
import shutil
HERE = os.path.dirname(os.path.abspath(__file__))
shutil.copyfile(os.path.join(HERE, "review_help.js"), F("review", "help.js"))
shutil.copyfile(os.path.join(HERE, "review_guide.html"), F("review", "guide.html"))
print(f"wrote {len(index_rows)} review pages and review/index.html, help.js and guide.html")
