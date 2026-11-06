#!/bin/sh
# assemble_ruleset.sh [slug ...]: collect every final page into ruleset/apc-adult-2026/ (the 2026 rule set,
# in VHA's one-file-per-page layout, with flowchart and remaining-questions companions), then run
# the gate over the whole set: cross-page constraints, duplicate rule names, SNOMED.
set -u
ROOT=$(cd "$(dirname "$0")/.." && pwd); PY=$HOME/.venvs/vha/bin/python
VHA=${VHA_BUILD:-$HOME/Developer/vha-build}; DENO=${DENO:-$HOME/.local/bin/deno-2.7.5}
OUT="$ROOT/ruleset/apc-adult-2026"; mkdir -p "$OUT" "$ROOT/ruleset/.check"
find "$OUT" -maxdepth 1 -type f \( -name '*.lisp' -o -name '*.md' \) -delete
[ $# -gt 0 ] || set -- $(cd "$ROOT/build/final" && ls)
n=0; for s in "$@"; do
  d="$ROOT/build/final/$s"; [ -f "$d/$s.lisp" ] || continue
  grep -q PASS "$d/.check/final-check.txt" 2>/dev/null || { echo "skipping $s: final build has not passed"; continue; }
  cp "$d/$s.lisp" "$OUT/"; for f in "$d/$s"-flowchart.md "$d/$s"-remaining-questions.md; do [ -f "$f" ] && cp "$f" "$OUT/"; done; n=$((n+1))
done
echo "assembled $n pages into $OUT"
G=apc2026_gate_$$.ts; cp "$ROOT/tools/gate.ts" "$VHA/$G"; trap 'rm -f "$VHA/$G"' EXIT
( cd "$VHA" && NO_EXTERNAL_CONNECT=1 "$DENO" run -q -A "$G" "$ROOT/ruleset/.check/gate.json" "$OUT" \
  s_expression/rules/other.lisp s_expression/rules/pain.lisp s_expression/rules/sats.lisp )
"$PY" -I "$ROOT/tools/check_concepts.py" "$ROOT/ruleset/.check/gate.json" "$ROOT/data/snomed-20251201.sqlite" "$ROOT/ruleset/.check/concepts-not-resolving.json" | head -20
"$PY" -I -c "
import json,collections;g=json.load(open('$ROOT/ruleset/.check/gate.json'))
c=collections.Counter(f['check'] for f in g['findings']); print('whole-set constraint findings:', dict(c) or 'none')
for f in g['findings']:
    if f['check'].startswith('DUPLICATE'): print('  ', f['check'], '|', f['description'], '|', f['detail'][:160])
"
