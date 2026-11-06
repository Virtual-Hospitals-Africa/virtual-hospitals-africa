#!/bin/sh
# finalize_page.sh <slug> <page>: final checks, blind checker inputs, plain-English rendering.
# Exit 0 only if the final build passes page_check.
set -u
ROOT=$(cd "$(dirname "$0")/.." && pwd); S=$1; N=$2; PY=$HOME/.venvs/vha/bin/python
VHA=${VHA_BUILD:-$HOME/Developer/vha-build}; DENO=${DENO:-$HOME/.local/bin/deno-2.7.5}
D="$ROOT/build/final/$S"
mkdir -p "$D/.check"; sh "$ROOT/tools/page_check.sh" "$D" "$N" > "$D/.check/final-check.txt" 2>&1; rc=$?
head -1 "$D/.check/final-check.txt"
[ $rc -eq 0 ] || { cat "$D/.check/final-check.txt"; exit 1; }
"$PY" -I "$ROOT/tools/make_checker_inputs.py" "$D" "$ROOT/checks/$S/input" || exit 1
G=apc2026_render_$$.ts; cp "$ROOT/tools/render.ts" "$VHA/$G"; trap 'rm -f "$VHA/$G"' EXIT
( cd "$VHA" && NO_EXTERNAL_CONNECT=1 "$DENO" run -q -A "$G" "$D/.check/render.json" "$D/$S.lisp" ) || exit 1
