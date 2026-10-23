load helpers
setup() {
  REAL_DENO=$(command -v deno || true)
  use_bot_dir
  git_world
  BOT_CHECKOUT="$CHECKOUT"
}

@test "a card's databases are named by its id, never its branch" {
  [ "$(card_db_dev "$CARD_A")" = vha_dev_bot_3ec91359 ]
  [ "$(card_db_test "$CARD_A")" = vha_test_bot_3ec91359 ]
  # db/db.ts turns the first into the second under IS_TEST, by replacing vha_dev with vha_test.
  [ "$(card_db_dev "$CARD_A" | sed 's/vha_dev/vha_test/')" = "$(card_db_test "$CARD_A")" ]
}

@test "port block i is the pair 21000+2i and the one after it, clear of the human worktrees' ports" {
  [ "$(ports_env 1 "$CARD_A" | sed -n 's/^export HTTP_SERVER_PORT=//p')" = 21002 ]
  [ "$(ports_env 1 "$CARD_A" | sed -n 's/^export HTTPS_PROXY_SERVER_PORT=//p')" = 21003 ]
  [ "$(ports_env 200 "$CARD_A" | sed -n 's/^export HTTPS_PROXY_SERVER_PORT=//p')" = 21401 ]
  ports_env 1 "$CARD_A" | grep -qx 'export DATABASE_URL=postgres://vha_superadmin:local_docker_pw@localhost:5432/vha_dev_bot_3ec91359'
  run ports_env 0 "$CARD_A"
  [ "$status" -ne 0 ]
  run ports_env 201 "$CARD_A"
  [ "$status" -ne 0 ]
}

@test "BOT_PORT_BASE moves the blocks" {
  PORTS_BASE=30000
  [ "$(ports_env 3 "$CARD_A" | sed -n 's/^export HTTP_SERVER_PORT=//p')" = 30006 ]
}

@test "ports_load puts a worktree on its own ports and database, and leaves any other alone" {
  wt="$BATS_TEST_TMPDIR/wt"; mkdir -p "$wt/.vha"
  ports_env 4 "$CARD_A" > "$wt/.vha/ports.env"
  (ports_load "$wt"; [ "$HTTP_SERVER_PORT" = 21008 ]; [ "$HTTPS_PROXY_SERVER_PORT" = 21009 ]; [[ "$DATABASE_URL" == */vha_dev_bot_3ec91359 ]])
  mkdir -p "$BATS_TEST_TMPDIR/human"
  (unset HTTP_SERVER_PORT; ports_load "$BATS_TEST_TMPDIR/human"; [ -z "${HTTP_SERVER_PORT:-}" ])
}

@test "the next free port index skips taken blocks and ones something listens on, and fails when none is left" {
  for i in 1 2; do mkdir -p "$BOT_WORKTREES/w$i/.vha"; ports_env "$i" "$CARD_A" > "$BOT_WORKTREES/w$i/.vha/ports.env"; done
  stub lsof 'case "$*" in *21006*) exit 0 ;; *) exit 1 ;; esac'
  [ "$(ports_free_index "$BOT_WORKTREES")" = 4 ]
  PORTS_MAX_INDEX=2
  run ports_free_index "$BOT_WORKTREES"
  [ "$status" -ne 0 ]
  [[ "$output" == *"all 2 port blocks"* ]]
}

@test "a dump that is there, readable and fresh passes" {
  run dump_check
  [ "$status" -eq 0 ]
}

@test "a Git LFS pointer is no dump" {
  printf 'version https://git-lfs.github.com/spec/v1\noid sha256:abc\nsize 3\n' > "$BOT_DB_DUMP"
  run dump_check
  [ "$status" -eq 10 ]
  [[ "$output" == *"Git LFS pointer"* ]]
}

@test "a dump older than BOT_DUMP_MAX_AGE_DAYS is stale, and the limit can be moved" {
  touch -t 202001010000 "$BOT_DB_DUMP"
  run dump_check
  [ "$status" -eq 11 ]
  BOT_DUMP_MAX_AGE_DAYS=100000
  run dump_check
  [ "$status" -eq 0 ]
}

@test "a dump pg_restore cannot read is 11, with its complaint" {
  stub pg_restore 'echo "pg_restore: error: unsupported version (1.16) in file header" >&2; exit 1'
  run dump_check
  [ "$status" -eq 11 ]
  [[ "$output" == *"unsupported version"* ]]
}

@test "card_db_create makes both databases, restores the dump into each and migrates in the worktree" {
  wt="$BATS_TEST_TMPDIR/wt"; mkdir -p "$wt/.vha"
  card_db_create "$CARD_A" "$wt"
  card_db_ready "$CARD_A"
  grep -q "^pg_restore --no-owner -d .*/vha_dev_bot_3ec91359 $BOT_DB_DUMP" "$STUB_LOG"
  grep -q "^pg_restore --no-owner -d .*/vha_test_bot_3ec91359 $BOT_DB_DUMP" "$STUB_LOG"
  grep -q 'create database "vha_test_bot_3ec91359" template template0' "$STUB_LOG"
  grep -q '^deno task local db:migrate latest' "$STUB_LOG"
  grep -q 'creating vha_dev_bot_3ec91359' "$wt/.vha/db.log"
}

@test "card_db_create replaces what a crashed attempt left" {
  wt="$BATS_TEST_TMPDIR/wt"; mkdir -p "$wt/.vha"
  echo vha_dev_bot_3ec91359 > "$PG_DBS"
  card_db_create "$CARD_A" "$wt"
  [ "$(sort "$PG_DBS" | tr '\n' ' ')" = "vha_dev_bot_3ec91359 vha_test_bot_3ec91359 " ]
}

@test "a restore that fails drops both databases again and says why in db.log" {
  wt="$BATS_TEST_TMPDIR/wt"; mkdir -p "$wt/.vha"
  stub pg_restore 'exit 1'
  run card_db_create "$CARD_A" "$wt"
  [ "$status" -ne 0 ]
  [ ! -s "$PG_DBS" ]
  grep -q "pg_restore failed" "$wt/.vha/db.log"
}

@test "card_db_drop drops both, and fails when the server cannot be asked" {
  printf '%s\n' vha_dev_bot_3ec91359 vha_test_bot_3ec91359 vha_dev_bot_aaaaaaaa > "$PG_DBS"
  card_db_drop "$CARD_A"
  [ "$(cat "$PG_DBS")" = vha_dev_bot_aaaaaaaa ]
  stub psql 'exit 2'
  run card_db_drop "$CARD_A"
  [ "$status" -ne 0 ]
}

@test "db_sweep drops the bot's databases no card with a worktree owns, and no other" {
  printf '%s\n' vha_dev vha_test vha_dev_somebranch vha_dev_bot_3ec91359 vha_test_bot_3ec91359 vha_dev_bot_aaaaaaaa vha_test_bot_aaaaaaaa > "$PG_DBS"
  run db_sweep <<<"$CARD_A"
  [[ "$output" == *"dropped vha_dev_bot_aaaaaaaa"* ]]
  [[ "$output" == *"dropped vha_test_bot_aaaaaaaa"* ]]
  [ "$(sort "$PG_DBS" | tr '\n' ' ')" = "vha_dev vha_dev_bot_3ec91359 vha_dev_somebranch vha_test vha_test_bot_3ec91359 " ]
}

@test "stack_pids finds the deno and node processes of a worktree, and no others" {
  [[ -n "$REAL_DENO" ]] || skip "needs a real deno"
  wt="$BATS_TEST_TMPDIR/wt"; mkdir -p "$wt/sub"
  source "$(repo_root)/bot/lib/servers.sh"
  (cd "$wt/sub" && exec "$REAL_DENO" eval 'setTimeout(() => {}, 30000)') &
  inside=$!
  (cd "$BATS_TEST_TMPDIR" && exec "$REAL_DENO" eval 'setTimeout(() => {}, 30000)') &
  outside=$!
  (cd "$wt" && exec sleep 30) &
  other=$!
  sleep 2
  run stack_pids "$wt"
  kill "$inside" "$outside" "$other" 2>/dev/null || true
  [ "$output" = "$inside" ]
}
