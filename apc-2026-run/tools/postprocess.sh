#!/bin/sh
# postprocess.sh [slug ...]: for each finished page (default: every page with a final build),
# re-run the deterministic checks on the final build, render it, and build its scorecard, review
# queue and 2023 comparison. Does not touch the checker inputs (what the checkers saw).
set -u
ROOT=$(cd "$(dirname "$0")/.." && pwd); PY=$HOME/.venvs/vha/bin/python
VHA=${VHA_BUILD:-$HOME/Developer/vha-build}; DENO=${DENO:-$HOME/.local/bin/deno-2.7.5}
[ $# -gt 0 ] || set -- $(cd "$ROOT/build/final" && ls)
for S in "$@"; do
  N=${S%%-*}; D="$ROOT/build/final/$S"
  [ -f "$D/$S.lisp" ] || { echo "$S: no final build"; continue; }
  mkdir -p "$D/.check"; sh "$ROOT/tools/page_check.sh" "$D" "$N" > "$D/.check/final-check.txt" 2>&1; printf '%s: %s\n' "$S" "$(head -1 "$D/.check/final-check.txt" | cut -c1-60)"
  G=apc2026_render_$$.ts; cp "$ROOT/tools/render.ts" "$VHA/$G"
  ( cd "$VHA" && NO_EXTERNAL_CONNECT=1 "$DENO" run -q -A "$G" "$D/.check/render.json" "$D/$S.lisp" ) > /dev/null; rm -f "$VHA/$G"
  "$PY" -I "$ROOT/tools/scorecard.py" "$ROOT" "$S" "$N" | sed 's/^/   /'
  "$PY" -I "$ROOT/tools/compare_will.py" "$ROOT" "$S" | sed 's/^/   /'
done
