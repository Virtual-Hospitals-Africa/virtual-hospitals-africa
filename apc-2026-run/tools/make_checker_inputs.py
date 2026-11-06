"""Make blind checker inputs from a final page build (deterministic).
  <out>/<slug>.lisp         the rules with every ;; comment removed (VHA's stripComments rule)
  <out>/<slug>.claims.json  one claim per provenance condition: id, rule, role, expr, element keys,
                            quote. No notes, no confidence, no judgment calls (avoid anchoring).
Usage: python -I make_checker_inputs.py <final_page_dir> <out_dir>"""
import glob, json, os, sys
d, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
lisp = [p for p in glob.glob(os.path.join(d, "*.lisp"))]
assert len(lisp) == 1, lisp
slug = os.path.basename(lisp[0])[:-5]
text = open(lisp[0]).read()
stripped = "\n".join(l[: l.index(";;")] if ";;" in l else l for l in text.split("\n"))
stripped = "\n".join(l.rstrip() for l in stripped.split("\n"))
open(os.path.join(out, slug + ".lisp"), "w").write(stripped.strip() + "\n")
prov = json.load(open(os.path.join(d, slug + ".provenance.json")))
claims = [dict(claim_id=f"c{i:03d}", rule=p["rule"], role=p["role"], expr=p["expr"], element_keys=p["element_keys"], quote=p["quote"])
          for i, p in enumerate(prov["conditions"], 1)]
json.dump(dict(page=prov["page"], lisp_file=slug + ".lisp", claims=claims), open(os.path.join(out, slug + ".claims.json"), "w"), indent=1, ensure_ascii=False)
print(f"{slug}: {len(claims)} claims")
