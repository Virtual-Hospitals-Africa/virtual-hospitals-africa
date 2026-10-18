load helpers
setup() {
  # Its own HOME and its own tmux server.
  REAL_DENO=$(command -v deno || true)
  # bot.sh looks for deno under $HOME/.deno/bin, and HOME is about to be a fake one.
  export BOT_DENO="$REAL_DENO"
  # ...and its cache is under HOME too: keep the real one, or every state.ts run downloads its imports.
  if [[ -n "$REAL_DENO" ]]; then DENO_DIR=$("$REAL_DENO" info --json | jq -r .denoDir); export DENO_DIR; fi
  export HOME="$BATS_TEST_TMPDIR/home" TMUX_TMPDIR="$BATS_TEST_TMPDIR" BOT_TMUX_SOCKET=bats
  mkdir -p "$HOME"
  use_bot_dir
  RUN="$(repo_root)/bot/run.sh"
  # The worktrees' port blocks are real ones a running bot's cards may hold: no server of theirs is
  # found there to be stopped.
  stub lsof 'exit 1'
  # The orchestrator: says what it was started with, and on a TERM stops after a moment.
  export BOT_ORCHESTRATOR="$BATS_TEST_TMPDIR/orchestrator.sh"
  cat > "$BOT_ORCHESTRATOR" <<'SH'
trap 'echo "orchestrator stopping"; sleep 1; exit 0' TERM
echo "orchestrator running, PATH=$PATH BOT_DIR=$BOT_DIR NOTION_TOKEN=${NOTION_TOKEN:-none}"
while :; do sleep 0.2; done
SH
}
teardown() { tmux -L bats kill-server 2>/dev/null || true; }

running() { tmux -L bats list-panes -s -t vhabot -F '#{@role}|#{@runs}|#{pane_dead}' | grep -qx 'orchestrator|orchestrator|0'; }
stopped() { ! running; }
logged() { grep -q "$1" "$BOT_DIR/orchestrator.log" 2>/dev/null; }
started_times() { [ "$(grep -c "orchestrator running" "$BOT_DIR/orchestrator.log")" = "$1" ]; }

@test "bot:start runs the orchestrator in the bot window, in the bot's own environment, its output logged" {
  NOTION_TOKEN=secret run bash "$RUN" start
  [ "$status" -eq 0 ]
  [[ "$output" == *"bot started"*"deno task bot:attach"* ]]
  running
  wait_for 5 logged "orchestrator running"
  logged "PATH=$BOT_PATH BOT_DIR=$BOT_DIR NOTION_TOKEN=none"
  [ "$(tmux -L bats list-windows -t vhabot -F '#W #{window_panes}' | tr '\n' ,)" = "bot 3,events 1," ]
}

sidebars() { tmux -L bats list-panes -s -t vhabot -F '#W|#{@role}' | grep -c '|sidebar$' || true; }

@test "bot:start starts the sidebar afresh in the window you are at, and bot:stop closes it" {
  bash "$RUN" start
  [ "$(tmux -L bats list-panes -s -t vhabot -F '#W|#{@role}' | grep '|sidebar$')" = "bot|sidebar" ]
  before=$(tmux -L bats list-panes -s -t vhabot -F '#{pane_id}|#{@role}' | grep '|sidebar$')
  bash "$RUN" start
  [ "$(sidebars)" = 1 ]
  [ "$(tmux -L bats list-panes -s -t vhabot -F '#{pane_id}|#{@role}' | grep '|sidebar$')" != "$before" ]
  bash "$RUN" stop
  [ "$(sidebars)" = 0 ]
}

@test "bot:start again restarts it, letting the old one stop first" {
  bash "$RUN" start
  wait_for 5 logged "orchestrator running"
  bash "$RUN" start
  wait_for 5 logged "orchestrator stopping"
  wait_for 5 started_times 2
  running
}

@test "bot:stop waits for it to stop, and leaves its last words on screen" {
  bash "$RUN" start
  wait_for 5 logged "orchestrator running"
  run bash "$RUN" stop
  [[ "$output" == *"bot stopped"* ]]
  wait_for 5 stopped
  wait_for 5 logged "orchestrator stopping"
  pane=$(tmux -L bats list-panes -s -t vhabot -F '#{pane_id}|#{@role}' | awk -F'|' '$2 == "orchestrator" { print $1 }')
  tmux -L bats capture-pane -p -t "$pane" | grep -q "orchestrator stopping"
}

@test "bot:stop kills an orchestrator that won't stop in time" {
  printf '%s\n' "trap '' TERM" 'while :; do sleep 0.2; done' > "$BOT_ORCHESTRATOR"
  bash "$RUN" start
  BOT_STOP_SECONDS=1 run bash "$RUN" stop
  [[ "$output" == *"killed it"* ]]
  wait_for 5 stopped
}

# card_behind_main <file> <ours> <theirs>: $CARD_A's worktree at $WT, origin/main moved past it — <file>
# is <ours> on the card's branch (when given) and <theirs> on main.
card_behind_main() {
  git_world
  git -C "$CHECKOUT" config user.email t@t && git -C "$CHECKOUT" config user.name t
  export BOT_CHECKOUT="$CHECKOUT"
  source "$(repo_root)/bot/lib/worktree.sh"
  admit "$CARD_A" "Fix join link"
  read -r WT _ <<<"$(worktree_create "$CARD_A" "Fix join link")"
  if [[ -n "$2" ]]; then echo "$2" > "$WT/$1" && git -C "$WT" add "$1" && git -C "$WT" commit -qm ours; fi
  echo "$3" > "$CHECKOUT/$1" && git -C "$CHECKOUT" add "$1" && git -C "$CHECKOUT" commit -qm theirs
  git -C "$CHECKOUT" push -q origin main
}

@test "bot:start brings every card's worktree up to origin/main" {
  card_behind_main n "" theirs
  run bash "$RUN" start
  [ "$status" -eq 0 ]
  git -C "$WT" merge-base --is-ancestor origin/main HEAD
  [ "$(cat "$WT/n")" = theirs ]
  [ "$(events_of worktree.unmerged)" = 0 ]
  running
}

@test "bot:start leaves a worktree that won't merge as it was, says so, and starts anyway" {
  card_behind_main n ours theirs
  run bash "$RUN" start
  [ "$status" -eq 0 ]
  [[ "$output" == *"${WT##*/}: origin/main won't merge"* ]]
  [ "$(cat "$WT/n")" = ours ]
  [ -z "$(git -C "$WT" status --porcelain --untracked-files=no)" ]
  [ "$(jq -sc '[.[] | select(.type == "worktree.unmerged") | .why]' "$BOT_DIR/events.jsonl")" = '["would-not-merge"]' ]
  running
}

@test "bot:start passes over a worktree you are talking to in its talk window" {
  card_behind_main n "" theirs
  source "$(repo_root)/bot/lib/tmux.sh"
  tmux_open talk-fix "$WT" sleep 60 > "$WT/.vha/talk.window"
  run bash "$RUN" start
  [ "$status" -eq 0 ]
  [[ "$output" == *"${WT##*/}: you are talking to its worker session"* ]]
  run ! git -C "$WT" merge-base --is-ancestor origin/main HEAD
  [ "$(jq -sc '[.[] | select(.type == "worktree.unmerged") | .why]' "$BOT_DIR/events.jsonl")" = '["talking"]' ]
}

@test "bot:stop stops the servers a test left running in a card's worktree, and no process of anyone else's" {
  [[ -n "$REAL_DENO" ]] || skip "needs a real deno"
  card_behind_main n "" theirs
  rm "$BATS_TEST_TMPDIR/stubs/lsof"
  (cd "$WT" && exec "$REAL_DENO" eval 'setTimeout(() => {}, 60000)') &
  inside=$!
  (cd "$BATS_TEST_TMPDIR" && exec "$REAL_DENO" eval 'setTimeout(() => {}, 60000)') &
  outside=$!
  sleep 2
  run bash "$RUN" stop
  [ "$status" -eq 0 ]
  run ! kill -0 "$inside"
  kill -0 "$outside"
  kill "$outside"
}

@test "bot:start says so when the orchestrator exits at once" {
  echo 'echo "no bot.env"; exit 1' > "$BOT_ORCHESTRATOR"
  run bash "$RUN" start
  [ "$status" -ne 0 ]
  [[ "$output" == *"exited at once"* ]]
}

@test "bot:stop with no bot running is fine" {
  run bash "$RUN" stop
  [ "$status" -eq 0 ]
  [[ "$output" == *"bot stopped"* ]]
}

@test "bot:status says whether the orchestrator is running" {
  stub ts 'exit 0'
  export BOT_TS="$BATS_TEST_TMPDIR/stubs/ts"
  run bash "$(repo_root)/bot/status.sh"
  [[ "$output" == *"Bot: not running"* ]]
  bash "$RUN" start
  run bash "$(repo_root)/bot/status.sh"
  [[ "$output" == *"Bot: running from"*"orchestrator pid"* ]]
}
