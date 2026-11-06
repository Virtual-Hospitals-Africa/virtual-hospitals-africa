#!/bin/sh
# prepare_reconcile.sh <slug> <page>: re-check both builds and write build/final/<slug>/diff.json
set -u
ROOT=$(cd "$(dirname "$0")/.." && pwd); S=$1; N=$2; PY=$HOME/.venvs/vha/bin/python
mkdir -p "$ROOT/build/final/$S"
for R in A B; do
  printf '%s: ' "$R"; sh "$ROOT/tools/page_check.sh" "$ROOT/build/$R/$S" "$N" | head -1
done
"$PY" -I "$ROOT/tools/diff_builds.py" "$ROOT/build/A/$S" "$ROOT/build/B/$S" "$ROOT/data/snomed-20251201.sqlite" "$ROOT/build/final/$S/diff.json"
