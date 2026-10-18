load helpers
setup() {
  use_bot_dir
  WORKER="$(repo_root)/bot/claude-worker.sh"
  WT="$BOT_WORKTREES/bot_fix_a"
  ORIGIN="$BATS_TEST_TMPDIR/origin.git"
  git init -q --bare -b main "$ORIGIN"
  git clone -q "$ORIGIN" "$WT" 2>/dev/null
  git -C "$WT" config user.email t@t
  git -C "$WT" config user.name t
  printf '.vha/\nnode_modules/\npackage-lock.json\n' > "$WT/.gitignore"
  git -C "$WT" add -A && git -C "$WT" commit -q -m init && git -C "$WT" push -q origin HEAD:main
  # The worktree's origin is GitHub's, rewritten here to the local one, as the PR push needs.
  git -C "$WT" remote set-url origin https://github.com/o/r.git
  git -C "$WT" config url."$ORIGIN".insteadOf https://github.com/o/r.git
  git -C "$WT" fetch -q origin && git -C "$WT" checkout -q -b bot_fix_a
  mkdir -p "$WT/.vha"
  printf 'export VHA_PORT_INDEX=5\nexport HTTP_SERVER_PORT=21010\nexport HTTPS_PROXY_SERVER_PORT=21011\n' > "$WT/.vha/ports.env"
  # Nothing here runs the real deno: packages are installed (deps_refresh) and the checks run through this.
  stub deno 'exit 0'
  admit "$CARD_A"
  with_worktree "$CARD_A" "$WT"
  emit worker.launched "$CARD_A"
  emit worker.session "$CARD_A" --arg session sess-1
  # Each test its own tmux server, under its own directory, and a second's grace after a turn.
  export TMUX_TMPDIR="$BATS_TEST_TMPDIR" BOT_TMUX_SOCKET=bats BOT_DETACH_GRACE_SECONDS=1
  TRANSCRIPT="$BATS_TEST_TMPDIR/transcript.jsonl"
}
teardown() {
  tmux -L bats-viewer kill-server 2>/dev/null || true
  tmux -L bats kill-server 2>/dev/null || true
}

# claude_turn <bash run in the worktree> [the hook it ends on: Stop (the default), StopFailure or
# none]: a stub of interactive claude. It takes its prompt (UserPromptSubmit, naming its session and
# transcript), says a line and calls a tool, does that, fires the hook, then stays open as the real
# one does, until its window is closed.
claude_turn() {
  local ends="${2:-Stop}"
  stub claude "$(cat <<STUB
settings="" session=""
while (( \$# )); do
  case "\$1" in --settings) settings=\$2; shift ;; --session-id | --resume) session=\$2; shift ;; esac
  shift
done
hook() {
  jq -nc --arg s "\$session" --arg t "$TRANSCRIPT" '{session_id: \$s, transcript_path: \$t}' |
    bash -c "\$(jq -r --arg e "\$1" '.hooks[\$e][0].hooks[0].command' "\$settings")"
}
transcript="$TRANSCRIPT"
hook UserPromptSubmit
echo '{"type":"assistant","message":{"content":[{"type":"text","text":"Looking at the bus stop page"},{"type":"tool_use","name":"Bash","input":{"command":"deno task check"}}]}}' >> "\$transcript"
$1
if [[ "$ends" != none ]]; then hook "$ends"; fi
sleep 600
STUB
)"
}
last_event() { tail -1 "$BOT_DIR/events.jsonl"; }
windows() { tmux -L bats list-windows -a -F '#W' 2>/dev/null | grep -vxE 'bot|events' || true; }
attached() { [[ -n "$(tmux -L bats list-clients 2>/dev/null)" ]]; }
asks='echo "{\"kind\":\"ask\",\"comment\":\"Which colour?\"}" > .vha/outcome.json'

@test "a valid outcome is recorded, its file kept, the turn in card.log, and its window closed" {
  claude_turn "$asks"
  bash "$WORKER" "$CARD_A"
  [ "$(last_event | jq -c '[.type, .kind, .file]')" = "[\"worker.outcome\",\"ask\",\"$WT/.vha/outcomes/1.json\"]" ]
  [ ! -e "$WT/.vha/outcome.json" ]
  grep -q "worker#1 │ 💬 Looking at the bus stop page" "$WT/.vha/card.log"
  grep -q "worker#1 │ → Bash: deno task check" "$WT/.vha/card.log"
  grep -q "worker │ turn 1 started; to watch or talk to it: tmux -L bats attach -t vhabot:fix_a" "$WT/.vha/card.log"
  grep -q -- "--resume sess-1" "$STUB_LOG"
  grep -q "Looking at the bus stop page" "$WT/.vha/sessions/1.jsonl"
  [ "$(cat "$WT/.vha/transcript")" = "$TRANSCRIPT" ]
  [ -z "$(windows)" ]
  [ ! -e "$WT/.vha/worker.window" ]
}

@test "an outcome left before the turn, as in a talk, is named in its prompt and taken if the turn keeps it" {
  echo '{"kind":"ask","comment":"From the talk"}' > "$WT/.vha/outcome.json"
  claude_turn ':'
  bash "$WORKER" "$CARD_A"
  grep -q "outcome.json is already there (kind: ask)" "$WT/.vha/hooks/1.prompt"
  [ "$(last_event | jq -c '[.type, .kind]')" = '["worker.outcome","ask"]' ]
  grep -q "From the talk" "$WT/.vha/outcomes/1.json"
}

@test "a resumed turn keeps only its own part of the transcript" {
  echo '{"type":"assistant","message":{"content":[{"type":"text","text":"Last turn"}]}}' > "$TRANSCRIPT"
  echo "$TRANSCRIPT" > "$WT/.vha/transcript"
  claude_turn "$asks"
  bash "$WORKER" "$CARD_A"
  run ! grep -q "Last turn" "$WT/.vha/sessions/1.jsonl" "$WT/.vha/card.log"
  grep -q "Looking at the bus stop page" "$WT/.vha/sessions/1.jsonl"
}

@test "a transcript somewhere other than the worker expected is taken whole" {
  echo '{"type":"assistant","message":{"content":[{"type":"text","text":"Last turn"}]}}' > "$TRANSCRIPT"
  claude_turn "$asks"
  bash "$WORKER" "$CARD_A"
  grep -q "Last turn" "$WT/.vha/sessions/1.jsonl"
  grep -q "Looking at the bus stop page" "$WT/.vha/sessions/1.jsonl"
}

@test "a first turn starts a session of its own, recorded once Claude takes the prompt" {
  admit "$CARD_B"
  with_worktree "$CARD_B" "$WT"
  emit worker.launched "$CARD_B"
  export BOT_TS="$BATS_TEST_TMPDIR/stubs/ts"
  stub ts 'case "$*" in
    *notion.ts*comments*) echo "[]" ;;
    *notion.ts*card-markdown*) echo "# Fix B" ;;
    *) exec "'"$(repo_root)"'/bot/lib/run-ts.sh" "$@" ;;
  esac'
  claude_turn "$asks"
  bash "$WORKER" "$CARD_B"
  minted=$(grep -oE -- '--session-id [0-9a-f-]{36}' "$STUB_LOG" | cut -d' ' -f2)
  [ -n "$minted" ]
  [ "$(jq -sr --arg c "$CARD_B" '[.[] | select(.card == $c and .type == "worker.session")][0].session' "$BOT_DIR/events.jsonl")" = "$minted" ]
  grep -q "# Fix B" "$WT/.vha/hooks/1.prompt"
}

@test "a turn without an outcome is a failure the worker is told about" {
  claude_turn 'true'
  bash "$WORKER" "$CARD_A"
  [ "$(last_event | jq -c '[.type, .why]')" = '["worker.failed","no_outcome"]' ]
}

@test "an invalid outcome is kept aside and its fault named" {
  claude_turn 'echo "{\"kind\":\"run\",\"demo\":{\"name\":\"x\"},\"command\":\"x\"}" > .vha/outcome.json'
  bash "$WORKER" "$CARD_A"
  [ "$(last_event | jq -r .why)" = bad_outcome ]
  [[ "$(last_event | jq -r .detail)" == *demo* ]]
  [ -e "$WT/.vha/outcomes/1.rejected.json" ]
}

@test "a usage limit pauses the bot until it resets" {
  claude_turn 'echo "{\"type\":\"assistant\",\"isApiErrorMessage\":true,\"message\":{\"content\":[{\"type\":\"text\",\"text\":\"Claude AI usage limit reached|1791234567\"}]}}" >> "$transcript"' StopFailure
  bash "$WORKER" "$CARD_A"
  [ "$(last_event | jq -c '[.type, .until]')" = '["worker.usage_limited","2026-10-05T21:09:27.000Z"]' ]
}

@test "a turn somebody stopped with Esc and left ends, though Claude fires no Stop then" {
  claude_turn 'echo "{\"type\":\"user\",\"message\":{\"content\":[{\"type\":\"text\",\"text\":\"[Request interrupted by user]\"}]}}" >> "$transcript"' none
  bash "$WORKER" "$CARD_A"
  [ "$(last_event | jq -c '[.type, .why]')" = '["worker.failed","no_outcome"]' ]
}

@test "a turn past the time cap is stopped" {
  claude_turn 'true' none
  BOT_SESSION_CAP_SECONDS=2 bash "$WORKER" "$CARD_A"
  [ "$(last_event | jq -c '[.type, .why]')" = '["worker.failed","overran"]' ]
  [ -z "$(windows)" ]
}

@test "a Claude that never takes its prompt is a crash naming what its window showed" {
  stub claude 'echo "Is this a project you trust?"; sleep 600'
  BOT_START_SECONDS=2 bash "$WORKER" "$CARD_A"
  [ "$(last_event | jq -c '[.type, .why]')" = '["worker.failed","crashed"]' ]
  [[ "$(last_event | jq -r .detail)" == *"did not start"*"Is this a project you trust?"* ]]
}

@test "a Claude that exits by itself is judged by what it left" {
  claude_turn "$asks; exit 0" none
  bash "$WORKER" "$CARD_A"
  [ "$(last_event | jq -r .type)" = worker.outcome ]
}

@test "a window somebody closes ends the turn with no result, for the supervisor to resume" {
  claude_turn 'true' none
  bash "$WORKER" "$CARD_A" &
  worker=$!
  wait_for 10 test -s "$WT/.vha/worker.window"
  tmux -L bats kill-window -t "$(cat "$WT/.vha/worker.window")"
  wait "$worker"
  [ "$(last_event | jq -r .type)" = worker.session ]
}

@test "a turn is held open while somebody watches its window" {
  claude_turn "$asks"
  bash "$WORKER" "$CARD_A" &
  worker=$!
  wait_for 10 test -s "$WT/.vha/worker.window"
  tmux -L bats select-window -t "$(cat "$WT/.vha/worker.window")"
  # The viewer: a client attached from a window of a second server, which gives it a terminal.
  tmux -L bats-viewer new-session -d -x 120 -y 40 env -u TMUX tmux -L bats attach -t vhabot
  wait_for 10 attached || { tmux -L bats-viewer capture-pane -p; false; }
  sleep 4
  kill -0 "$worker"
  [ "$(last_event | jq -r .type)" = worker.session ]
  tmux -L bats detach-client -s vhabot
  wait "$worker"
  [ "$(last_event | jq -r .type)" = worker.outcome ]
}

@test "a step that fails unexpectedly is reported, not left for the supervisor to retry forever" {
  claude_turn 'true'
  mkdir -p "$WT/.vha"; touch "$WT/.vha/sessions"
  run bash "$WORKER" "$CARD_A"
  [ "$(last_event | jq -c '[.type, .why]')" = '["worker.failed","crashed"]' ]
  [[ "$(last_event | jq -r .detail)" == *"stopped unexpectedly"* ]]
}

done_outcome='{"kind":"done","summary":"Fixed","prTitle":"Fix A","prBody":"Body"}'
writes_done() {
  claude_turn "echo '$done_outcome' > .vha/outcome.json"
}

@test "a done whose checks pass is pushed and opened as a PR, then waits for CI" {
  writes_done
  stub gh 'case "$*" in "pr list"*) echo "" ;; "pr create"*) echo https://github.com/o/r/pull/9 ;; esac'
  bash "$WORKER" "$CARD_A"
  [ "$(jq -sc '[.[-2].type, .[-1].type, .[-1].url]' "$BOT_DIR/events.jsonl")" = '["checks.started","pr.pushed","https://github.com/o/r/pull/9"]' ]
  [ "$(jq -sr '.[-1].sha' "$BOT_DIR/events.jsonl")" = "$(git -C "$WT" rev-parse HEAD)" ]
  grep -q "^deno check$" "$STUB_LOG"
  grep -q "^deno fmt --check$" "$STUB_LOG"
  grep -q "^deno lint$" "$STUB_LOG"
  grep -q "^deno task hygiene$" "$STUB_LOG"
  grep -q "^deno task test --ignore=test/web$" "$STUB_LOG"
  grep -q "^gh pr create --head bot_fix_a" "$STUB_LOG"
  [ "$(git -C "$ORIGIN" rev-parse refs/heads/bot_fix_a)" = "$(git -C "$WT" rev-parse HEAD)" ]
  [ "$(bot_state card "$CARD_A" | jq -r .state)" = "Awaiting CI" ]
}

@test "the PR body names the checks that passed, from the runner's own list" {
  writes_done
  stub gh 'case "$*" in "pr list"*) echo "" ;; "pr create"*) echo https://github.com/o/r/pull/9 ;; esac'
  bash "$WORKER" "$CARD_A"
  body="$WT/.vha/checks/1.pr.md"
  grep -q "^Body$" "$body"
  grep -q "checks passed before this PR was opened (typecheck, fmt, lint, hygiene, test-non-web); CI is the gate" "$body"
}

@test "the checks run in the card's own environment: its database and ports, none of the bot's tokens" {
  printf 'export DATABASE_URL=postgres://u:p@localhost:5432/vha_dev_bot_3ec91359\n' >> "$WT/.vha/ports.env"
  stub deno "echo \"deno \$* db=\${DATABASE_URL:-none} port=\${HTTP_SERVER_PORT:-none} token=\${GH_TOKEN:-none}\" >> '$BATS_TEST_TMPDIR/seen'"
  writes_done
  stub gh 'case "$*" in "pr list"*) echo "" ;; "pr create"*) echo https://github.com/o/r/pull/9 ;; esac'
  GH_TOKEN=secret bash "$WORKER" "$CARD_A"
  grep -q "^deno task test --ignore=test/web db=postgres://u:p@localhost:5432/vha_dev_bot_3ec91359 port=21010 token=none$" "$BATS_TEST_TMPDIR/seen"
}

@test "a done whose checks fail goes back to the worker with the log, and nothing is pushed" {
  writes_done
  stub deno 'case "$*" in lint) echo "lint: 3 problems"; exit 1 ;; *) exit 0 ;; esac'
  stub gh 'exit 1'
  bash "$WORKER" "$CARD_A"
  [ "$(jq -sc '[.[-1].type, .[-1].result]' "$BOT_DIR/events.jsonl")" = '["checks.failed","failed"]' ]
  grep -q "lint: 3 problems" "$(last_event | jq -r .log)"
  [[ "$(last_event | jq -r .failure)" == *"lint: 3 problems"* ]]
  run ! grep -q "^gh" "$STUB_LOG"
  [[ "$(last_event | jq -r .failure)" == "checks failed: lint — lint: 3 problems" ]]
  [ "$(bot_state card "$CARD_A" | jq -r .state)" = Queued ]
}

@test "the first check to fail stops the others, so the card hears at once" {
  writes_done
  stub deno 'case "$*" in lint) exit 1 ;; "task test"*) sleep 61 ;; *) exit 0 ;; esac'
  stub gh 'exit 1'
  start=$SECONDS
  bash "$WORKER" "$CARD_A"
  (( SECONDS - start < 30 ))
  [ "$(last_event | jq -c '[.type, .result]')" = '["checks.failed","failed"]' ]
  run ! pgrep -f "sleep 61"
}

@test "a done that changes a protected path is refused before its checks" {
  mkdir -p "$WT/scripts/code-quality" && echo 'exit 0' > "$WT/scripts/code-quality/hygiene.sh"
  git -C "$WT" add -A && git -C "$WT" commit -qm "loosen hygiene"
  writes_done
  bash "$WORKER" "$CARD_A"
  [ "$(last_event | jq -c '[.type, .result, .files]')" = '["checks.failed","refused",["scripts/code-quality/hygiene.sh"]]' ]
  run ! grep -q "^deno check" "$STUB_LOG"
  [ "$(bot_state card "$CARD_A" | jq -r .state)" = Blocked ]
}

@test "a done that changes anything under a protected directory is refused, every file named" {
  mkdir -p "$WT/bot/lib" "$WT/.github/workflows" && echo x > "$WT/bot/lib/a.sh" && echo x > "$WT/.github/workflows/b.yml"
  git -C "$WT" add -A && git -C "$WT" commit -qm "touch the bot"
  writes_done
  bash "$WORKER" "$CARD_A"
  [ "$(last_event | jq -c '[.type, .result, .files]')" = '["checks.failed","refused",[".github/workflows/b.yml","bot/lib/a.sh"]]' ]
}

@test "a done that adds an import to deno.json is not refused" {
  echo '{"imports":{}}' > "$WT/deno.json"
  git -C "$WT" add -A && git -C "$WT" commit -qm "an import"
  writes_done
  stub gh 'case "$*" in "pr list"*) echo "" ;; "pr create"*) echo https://github.com/o/r/pull/9 ;; esac'
  bash "$WORKER" "$CARD_A"
  [ "$(last_event | jq -r .type)" = pr.pushed ]
}

@test "a push that fails sends the done back to the worker" {
  writes_done
  stub gh 'case "$*" in "pr list"*) echo "HTTP 502" >&2; exit 1 ;; esac'
  bash "$WORKER" "$CARD_A"
  [ "$(last_event | jq -c '[.type, .error]')" = '["pr.failed","HTTP 502"]' ]
  [ "$(bot_state card "$CARD_A" | jq -r .state)" = Queued ]
}

@test "a done with uncommitted changes is refused before any check runs" {
  echo wip > "$WT/wip.ts"
  writes_done
  bash "$WORKER" "$CARD_A"
  [ "$(last_event | jq -c '[.type, .why]')" = '["worker.failed","bad_outcome"]' ]
  [[ "$(last_event | jq -r .detail)" == *"uncommitted: wip.ts"* ]]
  run ! grep -q "^deno check" "$STUB_LOG"
}

# main_moves <file> <content>: origin/main gains a commit setting <file> to <content>.
main_moves() {
  local other="$BATS_TEST_TMPDIR/other"
  [[ -d "$other" ]] || git clone -q "$ORIGIN" "$other" 2>/dev/null
  mkdir -p "$(dirname "$other/$1")" && echo "$2" > "$other/$1" && git -C "$other" add "$1"
  git -C "$other" -c user.email=t@t -c user.name=t commit -qm "main: $1" && git -C "$other" push -q origin HEAD:main
}
# owed_merge: the card's next turn is owed a merge of origin/main bot:start could not make.
owed_merge() {
  emit worker.interrupted "$CARD_A"
  emit worktree.unmerged "$CARD_A" --arg why would-not-merge
  emit worker.launched "$CARD_A"
}
turn_prompt() { cat "$WT/.vha/hooks/1.prompt"; }

@test "a turn owed a merge of origin/main has its work committed and main merged before Claude starts" {
  main_moves theirs.txt main
  echo wip > "$WT/mine.txt"
  owed_merge
  claude_turn "$asks"
  bash "$WORKER" "$CARD_A"
  git -C "$WT" merge-base --is-ancestor origin/main HEAD
  [ "$(cat "$WT/theirs.txt")" = main ]
  [ -z "$(git -C "$WT" status --porcelain)" ]
  git -C "$WT" log --format=%s | grep -qx "wip: work in progress, committed by the bot before merging origin/main"
  [[ "$(turn_prompt | head -1)" == "The bot merged origin/main into your branch. It committed your uncommitted work first"* ]]
  [ "$(last_event | jq -r .type)" = worker.outcome ]
}

@test "a merge of origin/main that conflicts is left in progress, its files named for Claude" {
  echo ours > "$WT/n" && git -C "$WT" add n && git -C "$WT" commit -qm ours
  main_moves n theirs
  main_moves clean.txt main
  owed_merge
  claude_turn "$asks"
  bash "$WORKER" "$CARD_A"
  git -C "$WT" rev-parse -q --verify MERGE_HEAD
  [ "$(cat "$WT/clean.txt")" = main ]
  turn_prompt | grep -qx -- "- n"
  turn_prompt | grep -q "Do not run git merge again"
}

@test "a turn left in the middle of a merge is told to finish it, not merged again" {
  echo ours > "$WT/n" && git -C "$WT" add n && git -C "$WT" commit -qm ours
  main_moves n theirs
  git -C "$WT" fetch -q origin && run git -C "$WT" merge -q origin/main
  owed_merge
  claude_turn "$asks"
  bash "$WORKER" "$CARD_A"
  git -C "$WT" rev-parse -q --verify MERGE_HEAD
  turn_prompt | grep -qx -- "- n"
  run git -C "$WT" log --format=%s --grep '^wip:'
  [ -z "$output" ]
}

@test "a turn owed no merge leaves the branch where it is" {
  main_moves theirs.txt main
  git -C "$WT" fetch -q origin
  claude_turn "$asks"
  bash "$WORKER" "$CARD_A"
  run ! git -C "$WT" merge-base --is-ancestor origin/main HEAD
  run ! grep -q "origin/main" "$WT/.vha/hooks/1.prompt"
}

# regenerates_db_types: a deno that, asked for the codegen, writes db.d.ts.
regenerates_db_types() { stub deno 'case "$*" in "task db:codegen") echo regenerated > db.d.ts ;; esac'; }

@test "a turn owed a merge whose only conflict is db.d.ts has it regenerated, and is told so" {
  echo ours > "$WT/db.d.ts" && git -C "$WT" add db.d.ts && git -C "$WT" commit -qm "ours"
  main_moves db.d.ts theirs
  owed_merge
  regenerates_db_types
  claude_turn "$asks"
  bash "$WORKER" "$CARD_A"
  run ! git -C "$WT" rev-parse -q --verify MERGE_HEAD
  [ "$(cat "$WT/db.d.ts")" = regenerated ]
  git -C "$WT" merge-base --is-ancestor origin/main HEAD
  [[ "$(turn_prompt | head -1)" == "The bot merged origin/main into your branch. db.d.ts conflicted: it took origin/main's version, ran db:migrate latest"* ]]
}

@test "a turn owed a merge that conflicts in db.d.ts and more is told the rest is its, and how to finish db.d.ts" {
  echo ours > "$WT/db.d.ts" && echo ours > "$WT/n" && git -C "$WT" add db.d.ts n && git -C "$WT" commit -qm "ours"
  main_moves db.d.ts theirs
  main_moves n theirs
  owed_merge
  regenerates_db_types
  claude_turn "$asks"
  bash "$WORKER" "$CARD_A"
  git -C "$WT" rev-parse -q --verify MERGE_HEAD
  turn_prompt | grep -qx -- "- n"
  run ! grep -qx -- "- db.d.ts" "$WT/.vha/hooks/1.prompt"
  turn_prompt | grep -q "db.d.ts conflicts too, but it is generated: do not merge it by hand"
  turn_prompt | grep -q 'deno task local db:migrate latest` and then `deno task db:codegen`'
  [ "$(cat "$WT/db.d.ts")" = theirs ]
}

@test "a db.d.ts that could not be regenerated is the one thing left, and the prompt says so" {
  echo ours > "$WT/db.d.ts" && git -C "$WT" add db.d.ts && git -C "$WT" commit -qm "ours"
  main_moves db.d.ts theirs
  owed_merge
  stub deno 'case "$*" in "task db:codegen") echo "codegen: cannot connect" >&2; exit 1 ;; esac'
  claude_turn "$asks"
  bash "$WORKER" "$CARD_A"
  git -C "$WT" rev-parse -q --verify MERGE_HEAD
  turn_prompt | grep -q "Every file merged cleanly except db.d.ts"
  grep -q "codegen: cannot connect" "$WT/.vha/merge-main.log"
  turn_prompt | grep -q "merge-main.log"
}

@test "a merge left in progress with db.d.ts still conflicted is told the same" {
  echo ours > "$WT/db.d.ts" && echo ours > "$WT/n" && git -C "$WT" add db.d.ts n && git -C "$WT" commit -qm "ours"
  main_moves db.d.ts theirs
  main_moves n theirs
  git -C "$WT" fetch -q origin && run git -C "$WT" merge -q origin/main
  owed_merge
  claude_turn "$asks"
  bash "$WORKER" "$CARD_A"
  turn_prompt | grep -qx -- "- db.d.ts"
  turn_prompt | grep -q "db.d.ts conflicts too, but it is generated"
}

@test "a merge that brings migrations is told they were run on the card's databases" {
  mkdir -p "$WT/db/migrations"
  main_moves db/migrations/20261017000000_x.ts 'export default {}'
  owed_merge
  claude_turn "$asks"
  bash "$WORKER" "$CARD_A"
  grep -q "^deno task local db:migrate latest$" "$STUB_LOG"
  [[ "$(turn_prompt | head -1)" == *"main brought migrations, which it ran on your card's databases"* ]]
}

@test "migrations that fail after a clean merge are named, the merge being done" {
  mkdir -p "$WT/db/migrations"
  main_moves db/migrations/20261017000000_x.ts 'export default {}'
  owed_merge
  stub deno 'case "$*" in "task local db:migrate latest") echo "corrupted migrations" >&2; exit 1 ;; esac'
  claude_turn "$asks"
  bash "$WORKER" "$CARD_A"
  git -C "$WT" merge-base --is-ancestor origin/main HEAD
  [[ "$(turn_prompt | head -1)" == *"merged origin/main into your branch, but a step after the merge failed (corrupted migrations"* ]]
}
