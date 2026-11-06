#!/bin/sh
# No-waiver rerun of Will's PR #1310 test in ~/Developer/vha-build (private, push disabled).
# Run A: deno 2.8.0, type-checking on, inverse patch applied. Run B: same, no patch (VHA as-is).
# Restores every touched file from the backup at the end.
set -u
S=/private/tmp/claude-501/-Users-syncytium-Developer-vha-work/31e6d911-7b67-4f35-a287-207875bd4296/scratchpad
B=$S/vhabuild-backup; OUT=$S/rerun-out; rm -rf "$OUT"; mkdir -p "$OUT/runA-dumps" "$OUT/runB-dumps"
VHA=$HOME/Developer/vha-build; cd "$VHA" || exit 1
[ "$(git config remote.origin.pushurl)" = no_push ] || { echo "push not disabled"; exit 1; }
SHIM=$(mktemp -d); ln -s "$HOME/.local/bin/deno-2.8.0" "$SHIM/deno"
PATH="$SHIM:$PATH:/Applications/Docker.app/Contents/Resources/bin"; export PATH
deno --version | head -1 > "$OUT/deno-version.txt"
docker info >/dev/null 2>&1 || { echo "Docker not running"; exit 1; }
INV=shared/s_expression_inverse.ts
restore() {
  tar xf "$B/files.tar"
  shasum s_expression/*.ts deno.lock test/shared/compiled_s_expressions.test.ts shared/s_expression_inverse.ts > "$OUT/sha-after.txt"
  git status --short > "$OUT/status-after.txt"
  rm -rf "$SHIM"
}
trap restore EXIT
patch_inverse() {
  "$HOME/.venvs/vha/bin/python" -I - "$INV" <<'EOF'
import sys
p = sys.argv[1]; t = open(p).read()
old = "return `(no ${inverseSExpression({ ...node, existence: 'Yes' })})`"
new = "return `(no ${inverseSExpression({ ...node, existence: 'Yes', value_snomed_concept: undefined })})`"
assert t.count(old) == 1; open(p, "w").write(t.replace(old, new))
EOF
}
run() {  # $1 = A or B
  deno task compile:s_expressions > "$OUT/run$1-compile.log" 2>&1; echo "run $1 compile exit $?" | tee -a "$OUT/summary.txt"
  cp "$S/test-no-waivers.ts" test/shared/compiled_s_expressions.test.ts
  APC_DUMP_DIR="$OUT/run$1-dumps" deno task test test/shared/compiled_s_expressions.test.ts > "$OUT/run$1-test.log" 2>&1
  echo "run $1 test exit $?" | tee -a "$OUT/summary.txt"
}
# Run A: patched
patch_inverse && run A
git checkout -- "$INV"
# Run B: VHA as-is
run B
# deno check: the unedited PR #1310 file, and main's own test
git show pr-1310:test/shared/compiled_s_expressions.test.ts > test/shared/compiled_s_expressions.test.ts
deno check test/shared/compiled_s_expressions.test.ts > "$OUT/check-pr1310-unedited.txt" 2>&1; echo "deno check PR #1310 file exit $?" | tee -a "$OUT/summary.txt"
git show HEAD:test/shared/compiled_s_expressions.test.ts > test/shared/compiled_s_expressions.test.ts
deno check test/shared/compiled_s_expressions.test.ts > "$OUT/check-main-test.txt" 2>&1; echo "deno check main's test exit $?" | tee -a "$OUT/summary.txt"
git diff --stat deno.lock > "$OUT/deno-lock-diff-before-restore.txt"
