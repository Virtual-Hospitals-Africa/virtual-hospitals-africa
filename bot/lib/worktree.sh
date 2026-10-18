# shellcheck shell=bash
# bot/lib/worktree.sh — a card's worktree: made, kept current, removed (docs/bot.md#how-it-works).
# Source after bot.sh. Only the worker supervisor makes or removes one, and one at a time, so the
# port index it picks cannot be picked twice. A worktree comes with its resources (bot/lib/resources.sh):
# its own ports and its dev and test databases, which go when it does.

# shellcheck source=bot/lib/names.sh
source "$BOT_CODE/bot/lib/names.sh"

# The gitignored paths a worktree needs that git will not carry, cloned from the checkout (on APFS,
# instant and with no extra disk for the 300 MB of packages; db/codegen's own packages are what
# `deno task db:codegen` runs, which the merge of a db.d.ts conflict does). Secrets are not among them: the
# worktree's .env is made by card_env_write.
LOCAL_ONLY_PATHS=(node_modules db/codegen/node_modules)

# copy_local_only_paths <from> <to>: clones each path <from> has and <to> lacks.
copy_local_only_paths() {
  local from="$1" to="$2" path
  for path in "${LOCAL_ONLY_PATHS[@]}"; do
    [[ -e "$from/$path" && ! -e "$to/$path" ]] || continue
    mkdir -p "$(dirname "$to/$path")"
    cp -cRp "$from/$path" "$to/$path" 2>/dev/null || cp -Rp "$from/$path" "$to/$path" || return 1
  done
}

# worktree_create <card> <title>: the card's worktree in $BOT_WORKTREES, on its branch — the branch
# as it was if the card had one, else new from origin/main; the checkout itself is never touched.
# Prints `<path> <branch> <port index>`. Called in a condition, so every step returns on failure,
# taking down what it made. Before it makes anything it asks whether the card's databases can be made:
# 10 when db/dumps/latest is missing and 11 when it is stale or unreadable (each with the reason on
# stderr: a block reason for the card, which retrying will not change), 12 when the Postgres is not
# reachable (nothing is recorded; the caller tries again later).
worktree_create() {
  local card="$1" title="$2" branch path index new_branch=0 code=0
  dump_check >&2 || { code=$?; return "$code"; }
  if ! db_server_ready; then
    echo "the Postgres at $(db_base_url) is not reachable" >&2
    return 12
  fi
  branch=$(branch_for "$title" "$card") || return 1
  path="$BOT_WORKTREES/$branch"
  mkdir -p "$BOT_WORKTREES" || return 1
  git -C "$BOT_CHECKOUT" fetch -q origin || return 1
  if git -C "$BOT_CHECKOUT" show-ref --verify --quiet "refs/heads/$branch"; then
    git -C "$BOT_CHECKOUT" worktree add -q "$path" "$branch" >&2 || return 1
  else
    git -C "$BOT_CHECKOUT" worktree add -q --no-track -b "$branch" "$path" origin/main >&2 || return 1
    new_branch=1
  fi
  if ! worktree_fill "$path" "$card" "$title"; then
    card_db_drop "$card" >&2 || true
    git -C "$BOT_CHECKOUT" worktree remove --force "$path" >&2 || rm -rf "$path"
    if (( new_branch )); then git -C "$BOT_CHECKOUT" branch -D "$branch" >/dev/null 2>&1 || true; fi
    return 1
  fi
  index=$(sed -n 's/^export VHA_PORT_INDEX=//p' "$path/.vha/ports.env")
  echo "$path $branch $index"
}

# worktree_fill <path> <card> <title>: the worktree's own state: packages, a port block, an .env on
# the card's database, then the databases themselves (<path>/.vha/db.log has their output).
worktree_fill() {
  local path="$1" card="$2" title="$3" index
  mkdir -p "$path/.vha" || return 1
  copy_local_only_paths "$BOT_CHECKOUT" "$path" || return 1
  index=$(ports_free_index "$BOT_WORKTREES") || return 1
  ports_env "$index" "$card" > "$path/.vha/ports.env" || return 1
  jq -n --arg id "$card" --arg title "$title" '{id: $id, title: $title}' > "$path/.vha/card.json"
  card_env_write "$path" "$card" || return 1
  deps_refresh "$path" || return 1
  card_db_create "$card" "$path" || return 1
}

# deps_refresh <worktree>: `deno install` where deno.json or deno.lock changed since the packages were
# last installed there (node_modules is manual); a no-op otherwise.
deps_refresh() {
  local wt="$1" stamp="$1/node_modules/.bot-installed" want
  want=$(cat "$wt/deno.json" "$wt/deno.lock" 2>/dev/null | shasum | cut -d' ' -f1)
  if [[ -f "$stamp" && "$(cat "$stamp")" == "$want" ]]; then return 0; fi
  (cd "$wt" && deno install --allow-scripts) || return 1
  mkdir -p "$wt/node_modules"
  printf '%s\n' "$want" > "$stamp"
}

# What the last branch_merge_main did beyond merging, for its caller to tell the worker. MERGE_DB_TYPES:
# "regenerated" when db.d.ts conflicted, the only file that did, and the bot resolved it; "failed" when
# it could not (main's db.d.ts is staged, the merge is left for the worker); "pending" when other
# files conflicted too (main's db.d.ts is staged, the worker finishes the rest and regenerates).
# MERGE_MIGRATED is 1 when the merge brought migrations and they were run on the card's databases.
MERGE_DB_TYPES="" MERGE_MIGRATED=0

# card_db_sync <worktree> <regenerate: 0|1>: the card's databases migrated to the worktree's latest
# migration (BOT_DB_MIGRATE, as card_db_build runs it), then, if asked, db.d.ts regenerated from its dev
# database (BOT_DB_CODEGEN): `deno task db:codegen` only reads the database and writes <worktree>/db.d.ts.
# Run in the isolated environment, since the migrations and the codegen are the card's own code. Only a
# card's worktree (.vha/ports.env, its own DATABASE_URL) is ever synced: never a human's checkout.
card_db_sync() {
  local wt="$1" regenerate="$2" script
  [[ -f "$wt/.vha/ports.env" ]] || { echo "$wt has no .vha/ports.env: not syncing a database that is not a card's"; return 1; }
  # shellcheck disable=SC2016 # a bash -c script names its $arguments in single quotes
  script='cd "$1" && source "$2/bot/lib/resources.sh" && ports_load "$1" && '"${BOT_DB_MIGRATE:-deno task local db:migrate latest}"
  if (( regenerate )); then script+=" && ${BOT_DB_CODEGEN:-deno task db:codegen}"; fi
  env -i "${ISOLATED_ENV[@]}" bash -c "$script" _ "$wt" "$BOT_CODE"
}

# branch_merge_main <worktree> [keep]: the branch brought up to origin/main — 0 when it already was
# or merged cleanly (packages refreshed; the card's databases migrated if the merge brought migrations),
# 3 when the merge conflicts (aborted, the tree left as it was; with `keep`, a merge that stopped on
# conflicted files is left in progress for the worker to resolve), 1 on any other failure.
# db.d.ts is generated (deno task db:codegen) and conflicts across cards that change the schema, so
# in a card's worktree a conflict in it is never left to be merged by hand: main's version is taken,
# and when it was the only file, the card's databases are migrated, db.d.ts regenerated from them and
# the merge committed. See MERGE_DB_TYPES for what the caller is to tell the worker.
# shellcheck disable=SC2034 # MERGE_DB_TYPES and MERGE_MIGRATED are read by the callers
branch_merge_main() {
  local wt="$1" keep="${2:-}" before conflicted remaining
  MERGE_DB_TYPES="" MERGE_MIGRATED=0
  git -C "$wt" fetch -q origin || return 1
  if git -C "$wt" merge-base --is-ancestor origin/main HEAD; then return 0; fi
  before=$(git -C "$wt" rev-parse HEAD) || return 1
  if ! git -C "$wt" merge -q --no-edit origin/main; then
    conflicted=$(git -C "$wt" diff --name-only --diff-filter=U)
    if grep -qx db.d.ts <<<"$conflicted" && [[ -f "$wt/.vha/ports.env" ]]; then
      if ! { git -C "$wt" checkout -q --theirs -- db.d.ts && git -C "$wt" add db.d.ts; }; then
        git -C "$wt" merge --abort 2>/dev/null || true
        return 1
      fi
      if [[ "$conflicted" != db.d.ts ]]; then
        MERGE_DB_TYPES=pending
      elif card_db_sync "$wt" 1 && git -C "$wt" add db.d.ts && git -C "$wt" commit -q --no-edit; then
        MERGE_DB_TYPES=regenerated MERGE_MIGRATED=1
      else
        MERGE_DB_TYPES=failed
      fi
    fi
    if [[ "$MERGE_DB_TYPES" != regenerated ]]; then
      remaining=$(git -C "$wt" diff --name-only --diff-filter=U)
      if [[ "$keep" == keep ]] && { [[ -n "$remaining" ]] || [[ "$MERGE_DB_TYPES" == failed ]]; }; then return 3; fi
      git -C "$wt" merge --abort 2>/dev/null || true
      if [[ "$MERGE_DB_TYPES" == failed ]]; then return 1; fi
      MERGE_DB_TYPES=""
      return 3
    fi
  elif [[ -f "$wt/.vha/ports.env" ]] && ! git -C "$wt" diff --quiet "$before" HEAD -- db/migrations; then
    card_db_sync "$wt" 0 || return 1
    MERGE_MIGRATED=1
  fi
  deps_refresh "$wt" || return 1
}

# merge_in_progress <worktree>: a merge stopped on its conflicts and is waiting to be committed.
merge_in_progress() { git -C "$1" rev-parse -q --verify MERGE_HEAD >/dev/null; }

# commit_work_in_progress <worktree>: whatever is uncommitted, untracked files included, committed
# on the branch — 0 when it committed, 1 when there was nothing to commit, 2 when the commit failed.
commit_work_in_progress() {
  [[ -n "$(git -C "$1" status --porcelain)" ]] || return 1
  git -C "$1" add -A && git -C "$1" commit -q -m "wip: work in progress, committed by the bot before merging origin/main" ||
    return 2
}

# worktree_remove <path> <branch> <delete branch: 0|1>: the worktree goes; the
# branch goes too only when asked and only if it is merged (git branch -d). The card's databases are
# dropped by the caller (card_db_drop), which knows its id.
worktree_remove() {
  local path="$1" branch="$2" delete_branch="$3"
  if [[ -d "$path" ]]; then
    git -C "$BOT_CHECKOUT" worktree remove --force "$path" || return 1
  fi
  git -C "$BOT_CHECKOUT" worktree prune
  if (( delete_branch )); then git -C "$BOT_CHECKOUT" branch -d "$branch" >/dev/null 2>&1 || true; fi
}
