"""Re-render the review pages from the data already embedded in them (deterministic), after a change
to the page templates, help text or guide. Unlike build_review.py it needs no page images or SNOMED
database: each page's crops, rules and checker data are read back out of its own HTML. Each page's
flowchart and remaining-questions text is refreshed from build/final/<slug>/, since those notes can
change after the build. Usage: python -I rerender_review.py <ROOT>"""
import html, json, os, re, shutil, sys
ROOT = sys.argv[1]
HERE = os.path.dirname(os.path.abspath(__file__))
REV = os.path.join(ROOT, "review")
DATA = re.compile(r'<script id="data" type="application/json">(.*?)</script>', re.S)
def text(p):
    try:
        with open(p) as f: return f.read()
    except Exception: return None
def data_of(path):
    return json.loads(DATA.search(open(path).read()).group(1).replace("<\\/", "</"))
def dump(d):
    return json.dumps(d, ensure_ascii=False).replace("</", "<\\/")
page_t = open(os.path.join(HERE, "review_template.html")).read()
index_t = open(os.path.join(HERE, "review_index_template.html")).read()
n = 0
for name in sorted(os.listdir(REV)):
    if not name.endswith(".html") or name in ("index.html", "guide.html"): continue
    d = data_of(os.path.join(REV, name))
    fin = os.path.join(ROOT, "build", "final", d["slug"])
    d["flowchart"] = text(os.path.join(fin, d["slug"] + "-flowchart.md"))
    d["questions"] = text(os.path.join(fin, d["slug"] + "-remaining-questions.md"))
    out = page_t.replace("__TITLE__", html.escape(f"APC 2026 p{d['page']} {d['title'].title()}")).replace("__DATA__", dump(d))
    with open(os.path.join(REV, name), "w") as f: f.write(out)
    n += 1
idx = data_of(os.path.join(REV, "index.html"))
with open(os.path.join(REV, "index.html"), "w") as f: f.write(index_t.replace("__DATA__", dump(idx)))
shutil.copyfile(os.path.join(HERE, "review_help.js"), os.path.join(REV, "help.js"))
shutil.copyfile(os.path.join(HERE, "review_guide.html"), os.path.join(REV, "guide.html"))
print(f"re-rendered {n} review pages, index.html, help.js and guide.html")
