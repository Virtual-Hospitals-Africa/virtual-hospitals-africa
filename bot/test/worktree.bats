load helpers
setup() {
  use_bot_dir
  source "$(repo_root)/bot/lib/worktree.sh"
  git_world
  BOT_CHECKOUT="$CHECKOUT"
  mkdir -p "$CHECKOUT/node_modules/left-pad"
  # Secrets a worker must not read are in the checkout's .env.extra: none of them reaches a card.
  printf 'NOTION_INTEGRATION_SECRET=ntn_secret\nGOOGLE_CLIENT_ID=client\nVAPID_SUBJECT=http://localhost:8001\n' > "$CHECKOUT/.env.extra"
}

@test "a new card gets a worktree on a new branch from origin/main, its own ports, env, databases and card.json" {
  run worktree_create "$CARD_A" "Fix join link"
  [ "$status" -eq 0 ]
  read -r path branch index <<<"$output"
  [ "$branch" = bot_fix_join_link_3ec91359c53b80cf83a5e88a6c4e37f0 ]
  [ "$path" = "$BOT_WORKTREES/$branch" ]
  [ "$index" = 1 ]
  [ "$(git -C "$path" branch --show-current)" = "$branch" ]
  [ "$(git -C "$path" rev-parse HEAD)" = "$(git -C "$CHECKOUT" rev-parse origin/main)" ]
  grep -qx 'export VHA_PORT_INDEX=1' "$path/.vha/ports.env"
  grep -qx 'export HTTP_SERVER_PORT=21002' "$path/.vha/ports.env"
  grep -qx 'export HTTPS_PROXY_SERVER_PORT=21003' "$path/.vha/ports.env"
  [ "$(jq -r .id "$path/.vha/card.json")" = "$CARD_A" ]
  [ -d "$path/node_modules/left-pad" ]
  [ "$(git -C "$CHECKOUT" branch --show-current)" = main ]
  # Its databases exist, were restored from the dump and migrated, and its worktree is not dirty.
  [ "$(sort "$PG_DBS" | tr '\n' ' ')" = "vha_dev_bot_3ec91359 vha_test_bot_3ec91359 " ]
  [ "$(grep -c '^pg_restore --no-owner' "$STUB_LOG")" = 2 ]
  grep -q '^deno task local db:migrate latest' "$STUB_LOG"
  [ -z "$(git -C "$path" status --porcelain)" ]
}

@test "its .env.local is .env.docker on the card's database and ports, and its .env starts with it and holds no token" {
  read -r path _ <<<"$(worktree_create "$CARD_A" "Fix")"
  grep -qx 'DATABASE_URL=postgres://vha_superadmin:local_docker_pw@localhost:5432/vha_dev_bot_3ec91359' "$path/.env.local"
  grep -qx 'USE_DOCKER_QUICKSTART=true' "$path/.env.local"
  grep -qx 'HTTP_SERVER_PORT=21002' "$path/.env.local"
  grep -qx 'HTTPS_PROXY_SERVER_PORT=21003' "$path/.env.local"
  # scripts/test/test.sh and `deno task local` want .env to begin with .env.local.
  [ "$(head -c "$(wc -c < "$path/.env.local")" "$path/.env")" = "$(cat "$path/.env.local")" ]
  grep -qx 'GOOGLE_MAPS_API_KEY=TEST_GOOGLE_MAPS_API_KEY' "$path/.env"
  grep -qx 'GOOGLE_CLIENT_ID=client' "$path/.env"
  grep -qx 'VAPID_SUBJECT=http://localhost:8001' "$path/.env"
  run ! grep -rq ntn_secret "$path/.env" "$path/.env.local" "$path/.vha"
}

@test "the next worktree takes the lowest port index nobody has" {
  worktree_create "$CARD_A" "One" >/dev/null
  worktree_create "$CARD_B" "Two" >/dev/null
  rm -rf "$BOT_WORKTREES"/bot_one_*
  read -r _ _ index <<<"$(worktree_create "$CARD_C" "Three")"
  [ "$index" = 1 ]
}

@test "a port block something listens on is passed over" {
  stub lsof 'case "$*" in *21002*) exit 0 ;; *) exit 1 ;; esac'
  read -r _ _ index <<<"$(worktree_create "$CARD_A" "One")"
  [ "$index" = 2 ]
}

@test "a card ticked again picks up its old branch" {
  read -r path branch _ <<<"$(worktree_create "$CARD_A" "Fix")"
  git -C "$path" -c user.email=t@t -c user.name=t commit -q --allow-empty -m "work"
  worktree_remove "$path" "$branch" 0
  read -r path _ _ <<<"$(worktree_create "$CARD_A" "Fix")"
  [ "$(git -C "$path" log -1 --format=%s)" = work ]
}

@test "a failure part-way leaves no worktree, no new branch and no database behind" {
  PORTS_MAX_INDEX=0
  run worktree_create "$CARD_A" "Fix"
  [ "$status" -ne 0 ]
  [ -z "$(ls "$BOT_WORKTREES")" ]
  run ! git -C "$CHECKOUT" show-ref --verify --quiet refs/heads/bot_fix_3ec91359c53b80cf83a5e88a6c4e37f0
}

@test "a migration that fails drops the databases it made, and the worktree goes" {
  BOT_DB_MIGRATE=false
  run worktree_create "$CARD_A" "Fix"
  [ "$status" -ne 0 ]
  [ ! -s "$PG_DBS" ]
  [ -z "$(ls "$BOT_WORKTREES")" ]
  run ! git -C "$CHECKOUT" show-ref --verify --quiet refs/heads/bot_fix_3ec91359c53b80cf83a5e88a6c4e37f0
}

@test "a missing dump is 10 and nothing is made: a reason to block the card, not to retry" {
  rm "$BOT_DB_DUMP"
  run worktree_create "$CARD_A" "Fix"
  [ "$status" -eq 10 ]
  [[ "$output" == *"does not exist"* ]]
  [ -z "$(ls "$BOT_WORKTREES")" ]
  [ ! -s "$PG_DBS" ]
}

@test "a stale dump is 11" {
  touch -t 202001010000 "$BOT_DB_DUMP"
  run worktree_create "$CARD_A" "Fix"
  [ "$status" -eq 11 ]
  [[ "$output" == *"days old"* ]]
  [ -z "$(ls "$BOT_WORKTREES")" ]
}

@test "a Postgres that is down is 12, to wait out" {
  stub psql 'exit 2'
  run worktree_create "$CARD_A" "Fix"
  [ "$status" -eq 12 ]
  [[ "$output" == *"not reachable"* ]]
  [ -z "$(ls "$BOT_WORKTREES")" ]
}

@test "removal keeps the branch unless asked, and deletes it then only if merged" {
  read -r path branch _ <<<"$(worktree_create "$CARD_A" "Fix")"
  worktree_remove "$path" "$branch" 0
  [ ! -e "$path" ]
  git -C "$CHECKOUT" show-ref --verify --quiet "refs/heads/$branch"
  read -r path branch _ <<<"$(worktree_create "$CARD_A" "Fix")"
  worktree_remove "$path" "$branch" 1
  run ! git -C "$CHECKOUT" show-ref --verify --quiet "refs/heads/$branch"
}

@test "packages are installed only where deno.json or deno.lock changed since" {
  wt="$BATS_TEST_TMPDIR/wt"; mkdir -p "$wt"
  echo '{}' > "$wt/deno.json"; echo '{"v":1}' > "$wt/deno.lock"
  deps_refresh "$wt"
  [ "$(grep -c '^deno install' "$STUB_LOG")" -eq 1 ]
  deps_refresh "$wt"
  [ "$(grep -c '^deno install' "$STUB_LOG")" -eq 1 ]
  echo '{"v":2}' > "$wt/deno.lock"
  deps_refresh "$wt"
  [ "$(grep -c '^deno install' "$STUB_LOG")" -eq 2 ]
}

# behind_main <file> <ours|""> <theirs>: a feature branch behind a main that moved; ours is committed
# on the branch first when given.
behind_main() {
  local g=(-c user.email=t@t -c user.name=t)
  git -C "$CHECKOUT" checkout -q -b feature
  if [[ -n "$2" ]]; then echo "$2" > "$CHECKOUT/$1" && git -C "$CHECKOUT" add "$1" && git -C "$CHECKOUT" "${g[@]}" commit -qm ours; fi
  git -C "$CHECKOUT" checkout -q main
  echo "$3" > "$CHECKOUT/$1" && git -C "$CHECKOUT" add "$1" && git -C "$CHECKOUT" "${g[@]}" commit -qm theirs
  git -C "$CHECKOUT" push -q origin main && git -C "$CHECKOUT" checkout -q feature
  git -C "$CHECKOUT" config user.email t@t && git -C "$CHECKOUT" config user.name t
}

@test "branch_merge_main merges a branch main has moved past, and refreshes its packages" {
  behind_main n "" theirs
  run branch_merge_main "$CHECKOUT"
  [ "$status" -eq 0 ]
  git -C "$CHECKOUT" merge-base --is-ancestor origin/main HEAD
  grep -q "^deno install" "$STUB_LOG"
}

@test "branch_merge_main leaves a current branch alone" {
  run branch_merge_main "$CHECKOUT"
  [ "$status" -eq 0 ]
  run ! grep -q "^deno" "$STUB_LOG"
}

@test "branch_merge_main reports a conflict as 3, the merge aborted" {
  behind_main n ours theirs
  run branch_merge_main "$CHECKOUT"
  [ "$status" -eq 3 ]
  [ -z "$(git -C "$CHECKOUT" status --porcelain --untracked-files=no)" ]
  [ "$(cat "$CHECKOUT/n")" = ours ]
}

# A card's worktree is one with its own .vha/ports.env, which is what lets the bot migrate its databases
# and regenerate db.d.ts there. regenerates_db_types: a deno that, asked for the codegen, writes db.d.ts.
as_card_worktree() { mkdir -p "$CHECKOUT/.vha" && echo 'export DATABASE_URL=postgres://u:p@localhost:5432/vha_dev_bot_3ec91359' > "$CHECKOUT/.vha/ports.env"; }
regenerates_db_types() { stub deno 'case "$*" in "task db:codegen") echo regenerated > db.d.ts ;; esac'; }
# behind_main_in_two <ours file> <theirs file>: db.d.ts conflicts, and so does a second file.
behind_main_in_two() {
  local g=(-c user.email=t@t -c user.name=t)
  git -C "$CHECKOUT" checkout -q -b feature
  echo ours > "$CHECKOUT/db.d.ts" && echo ours > "$CHECKOUT/n" && git -C "$CHECKOUT" add db.d.ts n && git -C "$CHECKOUT" "${g[@]}" commit -qm ours
  git -C "$CHECKOUT" checkout -q main
  echo theirs > "$CHECKOUT/db.d.ts" && echo theirs > "$CHECKOUT/n" && git -C "$CHECKOUT" add db.d.ts n && git -C "$CHECKOUT" "${g[@]}" commit -qm theirs
  git -C "$CHECKOUT" push -q origin main && git -C "$CHECKOUT" checkout -q feature
  git -C "$CHECKOUT" config user.email t@t && git -C "$CHECKOUT" config user.name t
}

@test "a conflict in db.d.ts alone is resolved: main's, the card's databases migrated, regenerated, the merge committed" {
  as_card_worktree
  regenerates_db_types
  behind_main db.d.ts ours theirs
  code=0
  branch_merge_main "$CHECKOUT" || code=$?
  [ "$code" -eq 0 ]
  [ "$MERGE_DB_TYPES" = regenerated ]
  [ "$(cat "$CHECKOUT/db.d.ts")" = regenerated ]
  run ! git -C "$CHECKOUT" rev-parse -q --verify MERGE_HEAD
  [ "$(git -C "$CHECKOUT" rev-list --parents -n 1 HEAD | wc -w)" -eq 3 ]
  [ -z "$(git -C "$CHECKOUT" status --porcelain --untracked-files=no)" ]
  # Migrated first, then regenerated, both from the card's own database.
  [ "$(grep -x -e 'deno task local db:migrate latest' -e 'deno task db:codegen' "$STUB_LOG")" = "$(printf 'deno task local db:migrate latest\ndeno task db:codegen')" ]
}

@test "the migrating and the codegen get the card's database and none of the bot's tokens" {
  as_card_worktree
  stub deno "echo \"\$* db=\${DATABASE_URL:-none} token=\${GH_TOKEN:-none}\" >> '$BATS_TEST_TMPDIR/seen'; case \"\$*\" in 'task db:codegen') echo x > db.d.ts ;; esac"
  behind_main db.d.ts ours theirs
  GH_TOKEN=secret branch_merge_main "$CHECKOUT"
  grep -q '^task db:codegen db=postgres://u:p@localhost:5432/vha_dev_bot_3ec91359 token=none$' "$BATS_TEST_TMPDIR/seen"
}

@test "a db.d.ts that cannot be regenerated aborts the merge as a failure, and leaves it in progress with keep" {
  as_card_worktree
  stub deno 'case "$*" in "task db:codegen") echo "codegen: cannot connect" >&2; exit 1 ;; esac'
  behind_main db.d.ts ours theirs
  code=0
  branch_merge_main "$CHECKOUT" || code=$?
  [ "$code" -eq 1 ]
  run ! git -C "$CHECKOUT" rev-parse -q --verify MERGE_HEAD
  [ "$(cat "$CHECKOUT/db.d.ts")" = ours ]
  code=0
  branch_merge_main "$CHECKOUT" keep || code=$?
  [ "$code" -eq 3 ]
  [ "$MERGE_DB_TYPES" = failed ]
  git -C "$CHECKOUT" rev-parse -q --verify MERGE_HEAD
  [ "$(cat "$CHECKOUT/db.d.ts")" = theirs ]
  [ -z "$(git -C "$CHECKOUT" diff --name-only --diff-filter=U)" ]
}

@test "db.d.ts conflicting with other files: aborted as a conflict, or with keep main's db.d.ts staged and the rest left" {
  as_card_worktree
  regenerates_db_types
  behind_main_in_two
  code=0
  branch_merge_main "$CHECKOUT" || code=$?
  [ "$code" -eq 3 ]
  run ! git -C "$CHECKOUT" rev-parse -q --verify MERGE_HEAD
  [ "$(cat "$CHECKOUT/db.d.ts")" = ours ]
  code=0
  branch_merge_main "$CHECKOUT" keep || code=$?
  [ "$code" -eq 3 ]
  [ "$MERGE_DB_TYPES" = pending ]
  git -C "$CHECKOUT" rev-parse -q --verify MERGE_HEAD
  [ "$(git -C "$CHECKOUT" diff --name-only --diff-filter=U)" = n ]
  [ "$(cat "$CHECKOUT/db.d.ts")" = theirs ]
  run ! grep -q "db:codegen" "$STUB_LOG"
}

@test "a db.d.ts conflict outside a card's worktree is an ordinary conflict: nothing is migrated or generated" {
  regenerates_db_types
  behind_main db.d.ts ours theirs
  code=0
  branch_merge_main "$CHECKOUT" || code=$?
  [ "$code" -eq 3 ]
  [ "$(cat "$CHECKOUT/db.d.ts")" = ours ]
  run ! grep -q "^deno task" "$STUB_LOG"
}

@test "a merge that brings migrations has them run on the card's databases; one that does not, does not" {
  as_card_worktree
  mkdir -p "$CHECKOUT/db/migrations"
  behind_main n "" theirs
  code=0
  branch_merge_main "$CHECKOUT" || code=$?
  [ "$code" -eq 0 ]
  [ "$MERGE_MIGRATED" -eq 0 ]
  run ! grep -q "db:migrate" "$STUB_LOG"
  git -C "$CHECKOUT" checkout -q main
  echo 'export default {}' > "$CHECKOUT/db/migrations/20261017000000_x.ts"
  git -C "$CHECKOUT" add db/migrations && git -C "$CHECKOUT" -c user.email=t@t -c user.name=t commit -qm migration && git -C "$CHECKOUT" push -q origin main
  git -C "$CHECKOUT" checkout -q feature
  branch_merge_main "$CHECKOUT"
  [ "$MERGE_MIGRATED" -eq 1 ]
  grep -q "^deno task local db:migrate latest$" "$STUB_LOG"
  run ! grep -q "db:codegen" "$STUB_LOG"
}

@test "migrations that cannot be run after a clean merge are a failure, 1" {
  as_card_worktree
  stub deno 'case "$*" in "task local db:migrate latest") echo "corrupted migrations" >&2; exit 1 ;; esac'
  git -C "$CHECKOUT" checkout -q -b feature
  git -C "$CHECKOUT" checkout -q main
  mkdir -p "$CHECKOUT/db/migrations" && echo 'export default {}' > "$CHECKOUT/db/migrations/20261017000000_x.ts"
  git -C "$CHECKOUT" add db/migrations && git -C "$CHECKOUT" -c user.email=t@t -c user.name=t commit -qm migration && git -C "$CHECKOUT" push -q origin main
  git -C "$CHECKOUT" checkout -q feature
  git -C "$CHECKOUT" config user.email t@t && git -C "$CHECKOUT" config user.name t
  code=0
  branch_merge_main "$CHECKOUT" || code=$?
  [ "$code" -eq 1 ]
}
