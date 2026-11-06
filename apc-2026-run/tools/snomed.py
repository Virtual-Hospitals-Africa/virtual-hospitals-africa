"""SNOMED lookup for builders and checkers. Same rule as VHA: a concept exists iff
(name, category) is an active fully specified name of an active concept, exact and case-sensitive.
  snomed.py exists "<name>" "<category>"
  snomed.py search <words...>          names and synonyms containing all the words (case-insensitive)
  snomed.py parents "<name>" "<category>"
  snomed.py children "<name>" "<category>" [limit]
  snomed.py is_a "<name>" "<category>" "<ancestor name>" "<ancestor category>"
Every result line is a usable (snomed_concept "<name>" "<category>") form."""
import os, sqlite3, sys
DB = os.environ.get("SNOMED_DB") or os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data", "snomed-20251201.sqlite")
db = sqlite3.connect(f"file:{DB}?mode=ro", uri=True)
def form(n, c): return f'(snomed_concept "{n}" "{c}")'
def ids(n, c): return [r[0] for r in db.execute("select id from vha_name where name=? and category=?", (n, c))]
def name_of(i):
    r = db.execute("select name, category from vha_name where id=? limit 1", (i,)).fetchone()
    return form(*r) if r else f"<no VHA name: {i}>"
cmd, a = sys.argv[1], sys.argv[2:]
if cmd == "exists":
    i = ids(*a); print(("YES " + form(*a) + " id " + ",".join(i)) if i else ("NO  " + form(*a)))
    if not i:
        for n, c in db.execute("select name, category from vha_name where name=? collate nocase union select v.name, v.category from synonym s join vha_name v on v.id=s.id where s.term=? collate nocase limit 8", (a[0], a[0])):
            print("  did you mean", form(n, c))
    sys.exit(0)
elif cmd == "search":
    words = [w.lower() for w in a]
    where = " and ".join(["lower(t) like ?"] * len(words)); args = [f"%{w}%" for w in words]
    q = f"""select v.name, v.category, min(src) from (
              select id, name t, 'name' src from vha_name union all select id, term t, 'synonym' src from synonym) x
            join vha_name v on v.id = x.id where {where} group by v.id order by min(src), length(v.name) limit 40"""
    rows = list(db.execute(q, args))
    for n, c, s in rows: print(form(n, c), "" if s == "name" else "  [matched a synonym]")
    if not rows: print("# no results (try fewer or shorter words)")
elif cmd == "parents":
    for i in ids(*a[:2]):
        for (p,) in db.execute("select parent from isa where child=?", (i,)): print(name_of(p))
elif cmd == "children":
    lim = int(a[2]) if len(a) > 2 else 50
    for i in ids(*a[:2]):
        n = db.execute("select count(*) from isa where parent=?", (i,)).fetchone()[0]; print(f"# {n} direct children")
        for (ch,) in db.execute("select child from isa where parent=? limit ?", (i, lim)): print(name_of(ch))
elif cmd == "is_a":
    start, goal = set(ids(*a[:2])), set(ids(*a[2:4])); seen, frontier = set(start), set(start)
    while frontier and not (seen & goal):
        frontier = {p for (p,) in db.execute(f"select parent from isa where child in ({','.join('?'*len(frontier))})", list(frontier))} - seen
        seen |= frontier
    print("YES" if seen & goal else "NO")
else: sys.exit(__doc__)
