"""SNOMED lookup that mirrors VHA's concept-exists rule (deterministic).

VHA (db/seed/defs/03_snomed_inferred.ts + db/models/snomed_concept_exists.ts) treats a
(name, category) pair as existing iff some ACTIVE fully specified name of an ACTIVE concept
splits as "<name> (<category>)", matched exactly and case-sensitively.
This builds the same table from the RF2 zip, plus synonyms (for search), the active
is-a graph (for descendant checks), and the active inferred finding-site and part-of
relationships (for placing findings on body regions: tools/body_map_gaps.py).

Usage: python -I build_snomed_db.py <rf2.zip> <out.sqlite>
"""
import csv, io, re, sqlite3, sys, zipfile
FSN, SYN, ISA = "900000000000003001", "900000000000013009", "116680003"
# finding site; all or part of; regional part of; constitutional part of; lateral half of
REL = {"363698007": "finding_site", "733928003": "all_or_part_of", "1003703000": "regional_part_of",
       "1003735000": "constitutional_part_of", "733925000": "lateral_half_of"}
z = zipfile.ZipFile(sys.argv[1]); out = sys.argv[2]
def member(pat):
    m = [n for n in z.namelist() if re.search(pat, n)]
    assert len(m) == 1, (pat, m); return m[0]
def rows(name):
    with z.open(name) as f:
        r = csv.reader(io.TextIOWrapper(f, "utf-8"), delimiter="\t", quoting=csv.QUOTE_NONE)
        next(r); yield from r
db = sqlite3.connect(out); c = db.cursor()
c.executescript("""
drop table if exists concept; drop table if exists vha_name; drop table if exists synonym; drop table if exists isa; drop table if exists rel;
create table concept(id text primary key, active int);
create table vha_name(id text, name text, category text);
create table synonym(id text, term text);
create table isa(child text, parent text);
create table rel(src text, type text, dst text);
""")
c.executemany("insert or replace into concept values(?,?)",
              ((r[0], int(r[2])) for r in rows(member(r"Snapshot/Terminology/sct2_Concept_Snapshot_INT"))))
active = {r[0] for r in c.execute("select id from concept where active=1")}
pat = re.compile(r"^(.*) \((.*)\)$")
fs, sy = [], []
for r in rows(member(r"Snapshot/Terminology/sct2_Description_Snapshot-en_INT")):
    if r[2] != "1" or r[4] not in active: continue
    if r[6] == FSN:
        m = pat.match(r[7])
        if m: fs.append((r[4], m.group(1), m.group(2)))
    elif r[6] == SYN: sy.append((r[4], r[7]))
c.executemany("insert into vha_name values(?,?,?)", fs)
c.executemany("insert into synonym values(?,?)", sy)
isa, rel = [], []
for r in rows(member(r"Snapshot/Terminology/sct2_Relationship_Snapshot_INT")):
    if r[2] != "1": continue
    if r[7] == ISA: isa.append((r[4], r[5]))
    elif r[7] in REL: rel.append((r[4], REL[r[7]], r[5]))
c.executemany("insert into isa values(?,?)", isa)
c.executemany("insert into rel values(?,?,?)", set(rel))
c.executescript("""create index vn on vha_name(name, category); create index vi on vha_name(id);
create index sy on synonym(term collate nocase); create index si on synonym(id);
create index ic on isa(child); create index ip on isa(parent);
create index rs on rel(src, type); create index rd on rel(dst, type);""")
db.commit()
print({t: c.execute(f"select count(*) from {t}").fetchone()[0] for t in ("concept", "vha_name", "synonym", "isa", "rel")})
