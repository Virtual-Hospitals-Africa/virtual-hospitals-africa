#!/bin/sh
# setup_check.sh: can this machine continue the APC 2026 work? Checks every prerequisite and says
# how to fix what is missing (SETUP.md has the full steps). Changes nothing unless --rebuild.
#
#   sh tools/setup_check.sh             check only
#   sh tools/setup_check.sh --rebuild   also rebuild the git-ignored data (SNOMED database, page
#                                       images, .check outputs), then confirm the rebuild left every
#                                       tracked file unchanged (the tools are deterministic)
#
# Never reads .env values: it only greps for "localhost".
set -u
ROOT=$(cd "$(dirname "$0")/.." && pwd); cd "$ROOT" || exit 1
PY=${PY:-$HOME/.venvs/vha/bin/python}; DENO=${DENO:-$HOME/.local/bin/deno-2.7.5}
VHA=${VHA_CLONE:-$HOME/Developer/virtual-hospitals-africa}; BUILD=${VHA_BUILD:-$HOME/Developer/vha-build}
ZIP="$VHA/db/resources/SnomedCT_InternationalRF2_PRODUCTION_20251201T120000Z.zip"
DARKROOM="$HOME/Library/CloudStorage/Dropbox-UniversityofMichigan/Richard DeFazio/darkroom/vha"
bad=0
ok()   { echo "  ok    $1"; }
need() { echo "  NEED  $1"; echo "        fix: $2"; bad=$((bad + 1)); }
opt()  { echo "  --    $1"; echo "        fix: $2"; }

echo "Repo"
git -C "$ROOT" fetch -q 2>/dev/null
[ -z "$(git -C "$ROOT" status --porcelain)" ] && ok "vha-work clean" || opt "vha-work has local changes" "commit or stash before building"
behind=$(git -C "$ROOT" rev-list --count HEAD..@{u} 2>/dev/null || echo "?")
[ "$behind" = 0 ] && ok "vha-work up to date with origin" || need "vha-work is $behind commits behind origin" "git pull"

echo "Tools"
"$PY" -c "import pymupdf" 2>/dev/null && ok "python venv with pymupdf ($PY)" \
  || need "python venv with pymupdf" "python3 -m venv ~/.venvs/vha && ~/.venvs/vha/bin/pip install pymupdf"
v=$("$DENO" --version 2>/dev/null | head -1)
case "$v" in "deno 2.7.5"*) ok "deno 2.7.5 ($DENO)";; *) need "deno 2.7.5 at $DENO (found: ${v:-none})" "SETUP.md step 2";; esac
command -v sqlite3 >/dev/null && ok "sqlite3" || opt "sqlite3 (only for poking at the SNOMED database)" "brew install sqlite"

# What VHA's own checks need (2026-11-06, after the APC 2026 retrospective). On the build machine
# (the one with the build copy) these are required; elsewhere they are optional.
ci=$(git -C "$VHA" show origin/main:.github/actions/setup-deno/action.yml 2>/dev/null | sed -n 's/.*deno-version: *v\{0,1\}\([0-9.]*\).*/\1/p' | head -1)
ci=${ci:-2.8.0}
if [ -d "$BUILD/.git" ]; then req=need; else req=opt; fi
v=$("$HOME/.local/bin/deno-$ci" --version 2>/dev/null | head -1)
case "$v" in "deno $ci"*) ok "deno $ci, the version VHA's CI uses ($HOME/.local/bin/deno-$ci)";; *) $req "deno $ci, the version VHA's CI uses, at ~/.local/bin/deno-$ci (found: ${v:-none})" "SETUP.md step 2, with $ci";; esac
bv=$(bash -c 'echo "${BASH_VERSINFO[0]} ${BASH_VERSINFO[1]}"' 2>/dev/null)
bmaj=$(echo "$bv" | cut -d' ' -f1); bmin=$(echo "$bv" | cut -d' ' -f2)
if [ "${bmaj:-0}" -gt 4 ] || { [ "${bmaj:-0}" -eq 4 ] && [ "${bmin:-0}" -ge 3 ]; }; then ok "bash on PATH is $bmaj.$bmin (VHA's hygiene check needs 4.3 or later)"
else $req "bash 4.3 or later first on PATH (found ${bmaj:-?}.${bmin:-?}); under older bash VHA's hygiene check crashes and still exits 0" "brew install bash, and put $(brew --prefix 2>/dev/null || echo /opt/homebrew)/bin before /bin on PATH"; fi
if rg --pcre2-version >/dev/null 2>&1; then ok "ripgrep with PCRE2 (VHA's hygiene check)"
else $req "ripgrep with PCRE2 (VHA's hygiene check passes silently without it)" "brew install ripgrep"; fi

echo "VHA clones"
[ -d "$VHA/.git" ] && ok "read-only VHA clone ($VHA)" || need "read-only VHA clone at $VHA" "SETUP.md step 3"
if [ -f "$ZIP" ] && [ "$(wc -c < "$ZIP")" -gt 100000000 ]; then ok "SNOMED release zip (LFS object present)"
else need "SNOMED release zip in the VHA clone (absent, or an LFS pointer)" "cd $VHA && git lfs pull --include db/resources/SnomedCT_InternationalRF2_PRODUCTION_20251201T120000Z.zip"; fi
pu=$(git -C "$VHA" config remote.origin.pushurl 2>/dev/null)
[ "$pu" = no_push ] && ok "VHA clone cannot push" || opt "VHA clone can push to GitHub (pushurl: ${pu:-unset})" "install the guards (vha-guards), or: git -C $VHA config remote.origin.pushurl no_push"
if [ -d "$BUILD/.git" ]; then
  [ "$(git -C "$BUILD" rev-parse --abbrev-ref HEAD)" = apc-2026-build ] && ok "build copy on branch apc-2026-build" || need "build copy not on branch apc-2026-build" "SETUP.md step 4"
  [ "$(git -C "$BUILD" config remote.origin.pushurl)" = no_push ] && ok "build copy cannot push" || need "build copy can push" "git -C $BUILD config remote.origin.pushurl no_push"
  git -C "$BUILD" rev-parse -q --verify pr-1310 >/dev/null && ok "build copy has pr-1310" || need "build copy lacks pr-1310" "git -C $BUILD fetch origin pull/1310/head:pr-1310"
  [ -d "$BUILD/node_modules" ] && ok "build copy dependencies installed" || need "build copy dependencies" "SETUP.md step 4"
  [ -s "$BUILD/.git/vha-guards/push-url" ] && ok "build copy: vha-guards push address set (pushes go through tools/push)" || opt "build copy: no vha-guards push address" "Tony installs vha-guards and sets the push address himself"
  grep -q localhost "$BUILD/.env" 2>/dev/null && ok "build copy .env points at a local database" || opt ".env for the local database (only for loading)" "cd $BUILD && deno task switch:docker"
else need "private build copy at $BUILD" "SETUP.md step 4"; fi

echo "Optional"
if command -v docker >/dev/null || [ -x /Applications/Docker.app/Contents/Resources/bin/docker ]; then ok "Docker installed (database load only)"
else opt "Docker (only for load_into_vha.sh)" "install Docker Desktop"; fi
[ -d "$DARKROOM" ] && ok "Dropbox darkroom/vha (publishing)" || opt "Dropbox darkroom/vha (only for publish.py)" "install Dropbox, sign in to the UM account"

echo "Derived data (git-ignored, rebuildable)"
have_db=0; [ -f data/snomed-20251201.sqlite ] && sqlite3 data/snomed-20251201.sqlite "select 1 from rel limit 1" >/dev/null 2>&1 && have_db=1
[ $have_db = 1 ] && ok "SNOMED database" || echo "  --    SNOMED database missing or old (rebuilt by --rebuild)"
missing_png=$("$PY" -I -c "
import json, os
print(sum(not os.path.exists(f'inputs/2026/p{p[\"page\"]}.png') for p in json.load(open('manifest.json'))))" 2>/dev/null || echo 83)
[ "$missing_png" = 0 ] && ok "page images" || echo "  --    page images missing for $missing_png pages (rebuilt by --rebuild; needed only to rebuild review pages)"

if [ "${1:-}" = --rebuild ]; then
  [ $bad = 0 ] || { echo; echo "Fix the NEED items before --rebuild."; exit 1; }
  echo; echo "Rebuilding"
  before=$(git status --porcelain -- . | grep -v '^??' | while read -r _ f; do echo "$f $(git hash-object "../$f" 2>/dev/null)"; done)
  if [ $have_db = 0 ]; then "$PY" -I tools/build_snomed_db.py "$ZIP" data/snomed-20251201.sqlite || exit 1; fi
  if [ "$missing_png" != 0 ]; then
    pages=$("$PY" -I -c "import json; print(' '.join(str(p['page']) for p in json.load(open('manifest.json'))))")
    # shellcheck disable=SC2086
    "$PY" -I tools/extract_elements.py "../lit/APC 2026 E-book.pdf" inputs/2026 $pages > /dev/null || exit 1
  fi
  sh tools/postprocess.sh > /dev/null 2>&1 || { echo "postprocess failed"; exit 1; }
  sh tools/assemble_ruleset.sh | tail -2 || exit 1
  "$PY" -I tools/body_map_gaps.py . "$VHA" > /dev/null || exit 1
  after=$(git status --porcelain -- . | grep -v '^??' | while read -r _ f; do echo "$f $(git hash-object "../$f" 2>/dev/null)"; done)
  if [ "$before" = "$after" ]; then echo "  ok    rebuild reproduced every tracked file"
  else
    echo "  NEED  rebuild changed tracked files; the machines disagree:"
    tb=$(mktemp); ta=$(mktemp); echo "$before" > "$tb"; echo "$after" > "$ta"; diff "$tb" "$ta"; rm -f "$tb" "$ta"
    bad=$((bad + 1))
  fi
fi
echo; [ $bad = 0 ] && echo "Ready." || echo "$bad item(s) to fix (see SETUP.md)."
exit $bad
