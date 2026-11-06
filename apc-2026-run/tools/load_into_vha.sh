#!/bin/sh
# load_into_vha.sh: put the assembled 2026 rule set into the PRIVATE build copy of VHA
# (~/Developer/vha-build, local branch apc-2026-build, push disabled), compile it with VHA's
# compiler, reseed the rules tables of the LOCAL Docker database, and run Will's integrity test
# (PR #1310 version) against it. Never touches the guarded clone, any remote, or production.
#
# By default the test runs the way VHA's CI runs it (Deno 2.8.0, type-checking on) and excuses
# nothing, so its output is exactly what Will's test makes of the set. Each check's full list of
# flagged cases is written to ruleset/.check/will-test-dumps/, and a summary to will-test-cases.json.
#
# Usage: sh tools/load_into_vha.sh            no waivers (the honest result)
#        sh tools/load_into_vha.sh --waive    excuse the cases our gate lists as places where Will's
#                                             test reads the constraints more strictly than the gate
#                                             (gate.json vha_test_differences; rerun the gate first)
#        DENO=~/.local/bin/deno-2.7.5 NO_CHECK=1 sh tools/load_into_vha.sh
#                                             the old setup: runtime.txt's Deno, type-checking off
#
# Undo: cd ~/Developer/vha-build && git checkout -- s_expression test && git clean -fd s_expression/rules/apc-adult
#       && deno task rules:rebuild
set -u
ROOT=$(cd "$(dirname "$0")/.." && pwd); PY=$HOME/.venvs/vha/bin/python
VHA=${VHA_BUILD:-$HOME/Developer/vha-build}; DENO=${DENO:-$HOME/.local/bin/deno-2.8.0}
WAIVE=0; [ "${1:-}" = --waive ] && WAIVE=1
OUT="$ROOT/ruleset/.check"; mkdir -p "$OUT"
# `deno task` runs `deno` from PATH, so put the pinned version first (VHA's CI uses 2.8.0; its
# runtime.txt says 2.7.5), and find Docker's CLI if Docker Desktop didn't add it to PATH.
[ -x "$DENO" ] || { echo "refusing: no deno at $DENO (see apc-2026-full/SETUP.md)"; exit 1; }
SHIM=$(mktemp -d); ln -s "$DENO" "$SHIM/deno"; PATH="$SHIM:$PATH"
command -v docker >/dev/null || PATH="$PATH:/Applications/Docker.app/Contents/Resources/bin"
command -v docker >/dev/null || { echo "refusing: docker not found (start Docker Desktop)"; exit 1; }
docker info >/dev/null 2>&1 || { echo "refusing: Docker is not running"; exit 1; }
cd "$VHA" || exit 1
[ "$(git rev-parse --abbrev-ref HEAD)" = apc-2026-build ] || { echo "refusing: $VHA is not on branch apc-2026-build"; exit 1; }
[ "$(git config remote.origin.pushurl)" = no_push ] || { echo "refusing: push is not disabled in $VHA"; exit 1; }
grep -q 'localhost' .env 2>/dev/null || { echo "refusing: .env does not point at a local database (run deno task switch:docker)"; exit 1; }

# 1. rule files: the 2026 set replaces apc-adult (the 2023 set stays in git history)
find s_expression/rules/apc-adult -maxdepth 1 -type f -delete
cp "$ROOT"/ruleset/apc-adult-2026/* s_expression/rules/apc-adult/
echo "rule files: $(ls s_expression/rules/apc-adult/*.lisp | wc -l | tr -d ' ')"

# 2. Will's test from PR #1310. Edits: the not-yet-reviewed list (2023 page numbers) is emptied so every
# 2026 page gets every check; the known-issue list is empty unless --waive; each check writes its full
# list of flagged cases before asserting.
git show pr-1310:test/shared/compiled_s_expressions.test.ts > test/shared/compiled_s_expressions.test.ts
"$PY" -I - "$ROOT" test/shared/compiled_s_expressions.test.ts "$WAIVE" <<'EOF'
import json, os, re, sys
root, test, waive = sys.argv[1], sys.argv[2], sys.argv[3] == "1"
g = json.load(open(os.path.join(root, "ruleset", ".check", "gate.json"))) if waive else {}
issues = []
# The gate renders (no X) with the internal "No" value; with the round-trip patch (step 2b) the
# compiled rules, and so Will's test output, spell it (no (finding ... X)). Key on that spelling.
NO_VALUE = ' (snomed_concept "No" "qualifier value")'
def key(s): return s.replace(NO_VALUE, "", 1) if s.startswith("(no ") else s
issues = [(p, key(s), w) for p, s, w in issues]
for d in g.get("vha_test_differences", []):
    page = os.path.basename(d["file"]).split("-")[0]
    issues.append((page, key(d["s_expression"]), d["kind"] + " (VHA test limitation, see apc-2026-full)"))
seen, rows = set(), []
for page, s, why in issues:
    if (page, s) in seen or not s: continue
    seen.add((page, s))
    rows.append("  { page: %s, s_expression: %s, reason: %s }," % (json.dumps(page), json.dumps(s), json.dumps(why)))
t = open(test).read()
t = re.sub(r"const APC_PAGES_NOT_YET_REVIEWED = new Set<string>\(\[[^\]]*\]\)", "const APC_PAGES_NOT_YET_REVIEWED = new Set<string>([])", t, flags=re.S)
t = re.sub(r"(const APC_KNOWN_ISSUES: \{[^}]*\}\[\] = \[)(.*?)(\n\])", lambda m: m.group(1) + "\n" + "\n".join(rows) + m.group(3), t, count=1, flags=re.S)
t = re.sub(r"assertArrayEmpty\((\w+)\)", r'dumpThenAssertEmpty("\1", \1)', t)
t = t.replace("\nconst APC_KNOWN_ISSUES", '''
// [load_into_vha.sh] write each check's full list to $APC_DUMP_DIR before asserting
let __dump_n = 0
function dumpThenAssertEmpty<T>(check: string, values: T[]) {
  const dir = Deno.env.get('APC_DUMP_DIR')
  if (dir) {
    __dump_n++
    Deno.writeTextFileSync(`${dir}/${String(__dump_n).padStart(2, '0')}-${check}.json`, JSON.stringify({ check, count: values.length, values }, null, 1))
  }
  assertArrayEmpty(values)
}

const APC_KNOWN_ISSUES''', 1)
open(test, "w").write(t)
print(f"test: every page checked; {len(rows)} cases waived" + ("" if waive else " (none: run with --waive to excuse the gate's listed differences)"))
EOF

# 2b. VHA bug, patched only for the duration of this load and reverted on exit: inverseSExpression
# writes (no X) as (no (finding ... X (snomed_concept "No" ...))), keeping the internal "No" value,
# and re-reading that fails no_finding's assert ("Attempt to overwrite value_snomed_concept with (no)").
# VHA's own compiled rules contain no (no X), so the path was never exercised. Our gate runs against the
# unpatched file, so the patch must not outlive the load.
INV=shared/s_expression_inverse.ts
trap 'git checkout -- "$INV"; rm -rf "$SHIM"' EXIT
"$PY" -I - "$INV" <<'EOF'
import sys
p = sys.argv[1]; t = open(p).read()
old = "return `(no ${inverseSExpression({ ...node, existence: 'Yes' })})`"
new = "return `(no ${inverseSExpression({ ...node, existence: 'Yes', value_snomed_concept: null })})`"
assert t.count(old) == 1, "inverse patch target not found"
open(p, "w").write(t.replace(old, new))
print("patched (temporarily) " + p + ": (no X) round trip")
EOF

# 3. compile and reseed the rules tables (local Docker database only)
deno task compile:s_expressions > "$OUT/compile.log" 2>&1 || { echo "compile FAILED"; tail -30 "$OUT/compile.log"; exit 1; }
echo "compiled"
deno task docker db:seed recreate 31_rules > "$OUT/seed.log" 2>&1 || { echo "seed FAILED"; tail -30 "$OUT/seed.log"; exit 1; }
echo "seeded: $(grep -c 'Inserting' "$OUT/seed.log") rules inserted"

# 4. Will's integrity test. Type-checking is on unless NO_CHECK=1: under Deno 2.8.0 (VHA's CI) the PR #1310
#    test file type-checks; under 2.7.5 (runtime.txt) it fails TS2488. The patch uses null, which type-checks.
DUMPS="$OUT/will-test-dumps"; rm -rf "$DUMPS"; mkdir -p "$DUMPS"
CHECKFLAG=""; [ "${NO_CHECK:-0}" = 1 ] && CHECKFLAG="--no-check"
APC_DUMP_DIR="$DUMPS" deno task test $CHECKFLAG test/shared/compiled_s_expressions.test.ts > "$OUT/will-test.log" 2>&1; rc=$?
echo "Deno: $("$DENO" --version | head -1); type-checking: $([ -n "$CHECKFLAG" ] && echo off || echo on)"
sed 's/\x1b\[[0-9;]*m//g' "$OUT/will-test.log" | grep -E '\.\.\. (ok|FAILED) \(|passed|failed' | sed 's/.*=> s_expression ... //' | tail -20
# 5. what the test flagged, counted the way it keys waivers: by page and expression
"$PY" -I - "$DUMPS" "$OUT/will-test-cases.json" <<'EOF'
import glob, json, os, sys
dumps, out = sys.argv[1], sys.argv[2]
cases, by_check = set(), {}
for f in sorted(glob.glob(os.path.join(dumps, "*.json"))):
    d = json.load(open(f)); seen = set()
    for x in d["values"]:
        if not isinstance(x, dict) or "file_path" not in x: continue
        expr = x.get("didnt_check_for") or x.get("never_used_as_evidence") or ""
        k = (os.path.basename(x["file_path"]).split("-")[0], expr); seen.add(k); cases.add(k)
    if d["count"]: by_check[os.path.basename(f)[:-5]] = dict(failures=d["count"], cases=len(seen))
kinds = {"(no X) evidence": sum(1 for p, e in cases if e.startswith("(no ")), "other": sum(1 for p, e in cases if not e.startswith("(no "))}
json.dump(dict(cases=len(cases), pages=len({p for p, e in cases}), by_check=by_check, kinds=kinds,
               list=sorted([dict(page=p, s_expression=e) for p, e in cases], key=lambda r: (int(r["page"]), r["s_expression"]))), open(out, "w"), indent=1)
print(f"flagged: {len(cases)} cases on {len({p for p, e in cases})} pages; " + "; ".join(f"{k}: {v['cases']}" for k, v in by_check.items()) + f" (full list: {out})")
EOF
echo "Will's test exit code: $rc (log: $OUT/will-test.log)"
exit $rc
