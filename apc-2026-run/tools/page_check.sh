#!/bin/sh
# page_check.sh <page_dir> <page_number>
# Runs every deterministic check on one page build. Exit 0 = PASS.
# <page_dir> holds exactly one <page>-<slug>.lisp, its .provenance.json and its .md companions.
set -u
HERE=$(cd "$(dirname "$0")/.." && pwd)
DIR=$(cd "$1" && pwd) || exit 2
N=$2
VHA=${VHA_BUILD:-$HOME/Developer/vha-build}
DENO=${DENO:-$HOME/.local/bin/deno-2.7.5}
PY=${PY:-$HOME/.venvs/vha/bin/python}
mkdir -p "$DIR/.check"
G=apc2026_gate_$$.ts; cp "$HERE/tools/gate.ts" "$VHA/$G"; trap 'rm -f "$VHA/$G"' EXIT
( cd "$VHA" && NO_EXTERNAL_CONNECT=1 "$DENO" run -q -A "$G" "$DIR/.check/gate.json" "$DIR" \
    s_expression/rules/other.lisp s_expression/rules/pain.lisp s_expression/rules/sats.lisp ) > "$DIR/.check/gate.log" 2>&1 \
  || { echo "FAIL gate did not run:"; tail -20 "$DIR/.check/gate.log"; exit 1; }
FC=$("$PY" -I -c "import json,sys;print(next((p['flowchart'] for p in json.load(open('$HERE/manifest.json')) if p['page']==$N),False))")
PROV=$(ls "$DIR"/*.provenance.json 2>/dev/null | head -1)
[ -n "$PROV" ] || PROV="$DIR/missing.provenance.json"
"$PY" -I "$HERE/tools/validate_page.py" "$DIR/.check/gate.json" "$PROV" "$HERE/inputs/2026/p$N.json" \
  "$HERE/data/snomed-20251201.sqlite" "$DIR" $( [ "$FC" = True ] && echo --flowchart )
