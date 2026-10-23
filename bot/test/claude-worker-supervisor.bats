load helpers
setup() {
  use_bot_dir
  stub_postgres
  SUPERVISOR="$(repo_root)/bot/claude-worker-supervisor.sh"
  export BOT_WORKER="$BATS_TEST_TMPDIR/worker.sh" BOT_POLL_SECONDS=1
}
teardown() {
  local f
  for f in "$BOT_WORKTREES"/*/.vha/worker.pid "$BATS_TEST_TMPDIR"/*.pid; do [[ -e "$f" ]] && stop_recorded "$f"; done
  return 0
}

# worker_does <bash>: what each worker turn does, with the bot's helpers loaded.
worker_does() {
  printf '#!/usr/bin/env bash\nsource "%s/bot/lib/bot.sh"\ncard="$1"\n%s\n' "$(repo_root)" "$1" > "$BOT_WORKER"
}
supervise() { BOT_LOOPS="$1" bash "$SUPERVISOR" >"$BATS_TEST_TMPDIR/supervisor.log" 2>&1; }

@test "starts up to BOT_WORKERS turns, highest priority first" {
  worker_does 'sleep 30'
  for c in "$CARD_A" "$CARD_B" "$CARD_C"; do admit "$c"; with_worktree "$c" "$BOT_WORKTREES/w-$c"; done
  emit card.reprioritized "$CARD_C" --arg priority High
  BOT_WORKERS=2 supervise 1
  [ "$(events_of worker.launched)" = 2 ]
  [ "$(jq -sr '[.[] | select(.type == "worker.launched") | .card][0]' "$BOT_DIR/events.jsonl")" = "$CARD_C" ]
  [ -s "$BOT_WORKTREES/w-$CARD_C/.vha/worker.pid" ]
}

@test "a turn that ends without its event is recorded as interrupted, and the card resumed" {
  worker_does 'exit 0'
  admit "$CARD_A"; with_worktree "$CARD_A" "$BOT_WORKTREES/a"
  supervise 2
  [ "$(events_of worker.interrupted)" -ge 1 ]
  [ "$(events_of worker.launched)" = 2 ]
}

@test "a turn that reports its outcome is left alone" {
  worker_does 'echo "{\"kind\":\"ask\",\"comment\":\"Which?\"}" > "$BOT_WORKTREES/a/.vha/o.json"; emit worker.outcome "$card" --arg kind ask --arg file "$BOT_WORKTREES/a/.vha/o.json"'
  admit "$CARD_A"; with_worktree "$CARD_A" "$BOT_WORKTREES/a"
  supervise 2
  [ "$(events_of worker.outcome)" = 1 ]
  [ "$(events_of worker.interrupted)" = 0 ]
  [ "$(bot_state card "$CARD_A" | jq -r .state)" = "Waiting on you" ]
}

@test "a turn left running by an earlier supervisor is stopped and recorded as interrupted" {
  worker_does 'sleep 30'
  admit "$CARD_A"; with_worktree "$CARD_A" "$BOT_WORKTREES/a"
  emit worker.launched "$CARD_A"
  spawn "$BOT_WORKTREES/a/.vha/worker.pid" sleep 60
  orphan=$SPAWNED
  supervise 1
  run ! kill -0 "$orphan"
  [ "$(events_of worker.interrupted)" = 1 ]
}

@test "makes a new card's worktree before its first turn" {
  git_world
  export BOT_CHECKOUT="$CHECKOUT"
  worker_does 'sleep 30'
  admit "$CARD_A" "Fix it"
  supervise 1
  [ "$(events_of worktree.created)" = 1 ]
  [ -d "$BOT_WORKTREES/bot_fix_it_3ec91359c53b80cf83a5e88a6c4e37f0/.vha" ]
  [ "$(events_of worker.launched)" = 1 ]
}

@test "a card whose database dump is missing is blocked with the reason, not retried" {
  git_world
  export BOT_CHECKOUT="$CHECKOUT"
  worker_does 'sleep 30'
  rm "$BOT_DB_DUMP"
  admit "$CARD_A" "Fix it"
  supervise 2
  [ "$(events_of worktree.failed)" = 1 ]
  [ "$(jq -sr '[.[] | select(.type == "worktree.failed")][0].resource' "$BOT_DIR/events.jsonl")" = dump_missing ]
  [ "$(bot_state card "$CARD_A" | jq -r .state)" = Blocked ]
  [[ "$(bot_state card "$CARD_A" | jq -r .block)" == *"A human must make the dump"* ]]
  [ "$(events_of worker.launched)" = 0 ]
  [ -z "$(ls "$BOT_WORKTREES")" ]
}

@test "a human setting the blocked card Queued, with a fresh dump, gets it its worktree" {
  git_world
  export BOT_CHECKOUT="$CHECKOUT"
  worker_does 'sleep 30'
  mv "$BOT_DB_DUMP" "$BOT_DB_DUMP.away"
  admit "$CARD_A" "Fix it"
  supervise 1
  [ "$(bot_state card "$CARD_A" | jq -r .state)" = Blocked ]
  mv "$BOT_DB_DUMP.away" "$BOT_DB_DUMP"
  emit card.unblocked "$CARD_A"
  supervise 1
  [ "$(events_of worktree.created)" = 1 ]
  [ "$(events_of worker.launched)" = 1 ]
}

@test "a Postgres that is down is waited out: nothing is recorded, no worker starts, and the loop moves on" {
  git_world
  export BOT_CHECKOUT="$CHECKOUT"
  worker_does 'sleep 30'
  stub psql 'exit 2'
  admit "$CARD_A" "Fix it"
  supervise 2
  [ "$(events_of worktree.failed)" = 0 ]
  [ "$(events_of worker.launched)" = 0 ]
  [ -z "$(ls "$BOT_WORKTREES")" ]
  grep -q "not reachable" "$BATS_TEST_TMPDIR/supervisor.log"
}

@test "a card's databases dropped behind its back are made again before its worker starts" {
  worker_does 'sleep 30'
  admit "$CARD_A"; with_worktree "$CARD_A" "$BOT_WORKTREES/a"
  : > "$PG_DBS"
  supervise 1
  [ "$(sort "$PG_DBS" | tr '\n' ' ')" = "vha_dev_bot_3ec91359 vha_test_bot_3ec91359 " ]
  [ "$(events_of worker.launched)" = 1 ]
}

@test "databases no card with a worktree owns are dropped as the supervisor starts" {
  worker_does 'sleep 30'
  admit "$CARD_A"; with_worktree "$CARD_A" "$BOT_WORKTREES/a"
  printf '%s\n' vha_dev_bot_deadbeef vha_test_bot_deadbeef vha_dev >> "$PG_DBS"
  supervise 1
  run ! grep -q deadbeef "$PG_DBS"
  grep -qx vha_dev "$PG_DBS"
  grep -qx vha_dev_bot_3ec91359 "$PG_DBS"
}

@test "a withdrawn card's turn is stopped, its databases dropped and its worktree removed, its branch kept" {
  git_world
  export BOT_CHECKOUT="$CHECKOUT"
  worker_does 'sleep 60'
  admit "$CARD_A" "Fix it"
  BOT_LOOPS=6 bash "$SUPERVISOR" >"$BATS_TEST_TMPDIR/supervisor.log" 2>&1 &
  supervisor=$!
  wait_for 20 has_event worker.launched
  emit card.withdrawn "$CARD_A" --arg by kill
  wait "$supervisor"
  [ "$(events_of worker.interrupted)" = 1 ]
  [ "$(events_of worktree.removed)" = 1 ]
  [ ! -s "$PG_DBS" ]
  [ ! -e "$BOT_WORKTREES/bot_fix_it_3ec91359c53b80cf83a5e88a6c4e37f0" ]
  git -C "$CHECKOUT" show-ref --verify --quiet refs/heads/bot_fix_it_3ec91359c53b80cf83a5e88a6c4e37f0
}

# talked_in <worktree> <transcript line>…: a talk window on the card's worker session, already closed,
# whose transcript holds those lines, each stamped after the window opened.
talked_in() {
  local worktree="$1" transcript="$BATS_TEST_TMPDIR/transcript.jsonl" line
  shift
  echo "{\"id\":\"$CARD_A\",\"title\":\"Fix A\"}" > "$worktree/.vha/card.json"
  echo @999 > "$worktree/.vha/talk.window"
  echo "$transcript" > "$worktree/.vha/transcript"
  : > "$transcript"
  for line in "$@"; do
    jq -c --arg ts "$(date -u +%Y-%m-%dT%H:%M:%S.000Z)" '.timestamp = $ts' <<<"$line" >> "$transcript"
  done
}
waiting_on_you() {
  admit "$CARD_A"; with_worktree "$CARD_A" "$1"
  emit worker.launched "$CARD_A"
  emit worker.outcome "$CARD_A" --arg kind ask --arg file "$1/.vha/outcomes/1.json"
}
said='{"type":"user","message":{"content":"Go with your defaults"}}'
tool='{"type":"user","message":{"content":[{"type":"tool_result","content":"ok"}]}}'
command='{"type":"user","message":{"content":"<command-name>/exit</command-name>"}}'

@test "a closed talk window the human typed in is a reply: the card waiting on you is resumed" {
  export TMUX_TMPDIR="$BATS_TEST_TMPDIR" BOT_TMUX_SOCKET=bats
  worker_does 'sleep 30'
  waiting_on_you "$BOT_WORKTREES/a"
  talked_in "$BOT_WORKTREES/a" "$tool" "$said"
  supervise 1
  [ "$(events_of card.talked)" = 1 ]
  [ "$(events_of worker.launched)" = 2 ]
  [ ! -e "$BOT_WORKTREES/a/.vha/talk.window" ]
}

@test "a closed talk window that left an outcome is a reply, whatever was typed" {
  export TMUX_TMPDIR="$BATS_TEST_TMPDIR" BOT_TMUX_SOCKET=bats
  worker_does 'sleep 30'
  waiting_on_you "$BOT_WORKTREES/a"
  talked_in "$BOT_WORKTREES/a"
  echo '{"kind":"run","command":"true","why":"see it"}' > "$BOT_WORKTREES/a/.vha/outcome.json"
  supervise 1
  [ "$(events_of card.talked)" = 1 ]
  [ "$(events_of worker.launched)" = 2 ]
}

@test "a talk window closed with nothing said leaves the card waiting on you" {
  export TMUX_TMPDIR="$BATS_TEST_TMPDIR" BOT_TMUX_SOCKET=bats
  worker_does 'sleep 30'
  waiting_on_you "$BOT_WORKTREES/a"
  talked_in "$BOT_WORKTREES/a" "$tool" "$command"
  supervise 1
  [ "$(events_of card.talked)" = 0 ]
  [ "$(bot_state card "$CARD_A" | jq -r .state)" = "Waiting on you" ]
  [ ! -e "$BOT_WORKTREES/a/.vha/talk.window" ]
}

@test "a talk window still open is left alone" {
  export TMUX_TMPDIR="$BATS_TEST_TMPDIR" BOT_TMUX_SOCKET=bats
  source "$(repo_root)/bot/lib/tmux.sh"
  worker_does 'sleep 30'
  waiting_on_you "$BOT_WORKTREES/a"
  talked_in "$BOT_WORKTREES/a" "$said"
  tmux_open talk-a "$BOT_WORKTREES/a" sleep 60 > "$BOT_WORKTREES/a/.vha/talk.window"
  supervise 1
  tmux -L bats kill-server 2>/dev/null || true
  [ "$(events_of card.talked)" = 0 ]
  [ -s "$BOT_WORKTREES/a/.vha/talk.window" ]
}
