load helpers
setup() {
  use_bot_dir
  export BOT_GH_READ_SECONDS=0
}

read_github() { BOT_LOOPS=1 bash "$(repo_root)/bot/gh-reader.sh" 2>"$BATS_TEST_TMPDIR/gh-reader.log"; }

# blocked <card> <worktree>: the card, with that worktree, blocked by its worker.
blocked() {
  admit "$1"
  with_worktree "$1" "$2"
  emit worker.launched "$1"
  echo '{"kind":"blocked","reason":"stuck"}' > "$2/.vha/outcome.json"
  emit worker.outcome "$1" --arg kind blocked --arg file "$2/.vha/outcome.json"
}

@test "finishes a blocked card whose branch's PR was merged" {
  stub gh 'echo https://github.com/o/r/pull/9'
  blocked "$CARD_A" "$BOT_WORKTREES/bot_fix_a"
  read_github
  grep -q "^gh pr list --head bot_fix_a --state merged --json url" "$STUB_LOG"
  [ "$(bot_state card "$CARD_A" | jq -r '.state, .pr' | paste -sd' ' -)" = "Finished https://github.com/o/r/pull/9" ]
}

@test "leaves a blocked card blocked while its branch has no merged PR" {
  stub gh 'echo ""'
  blocked "$CARD_A" "$BOT_WORKTREES/bot_fix_a"
  read_github
  [ "$(events_of pr.merged)" = 0 ]
  [ "$(bot_state card "$CARD_A" | jq -r .state)" = Blocked ]
}

@test "asks only about blocked cards whose worktree is on disk" {
  stub gh 'echo https://github.com/o/r/pull/9'
  blocked "$CARD_A" "$BOT_WORKTREES/bot_fix_a"
  rm -rf "$BOT_WORKTREES/bot_fix_a"
  admit "$CARD_B"
  with_worktree "$CARD_B" "$BOT_WORKTREES/bot_fix_b"
  read_github
  run ! test -e "$STUB_LOG"
  [ "$(events_of pr.merged)" = 0 ]
}

@test "a failed look records nothing, says so and carries on to the next card" {
  stub gh 'case "$*" in *bot_fix_a*) exit 1 ;; *) echo https://github.com/o/r/pull/10 ;; esac'
  blocked "$CARD_A" "$BOT_WORKTREES/bot_fix_a"
  blocked "$CARD_B" "$BOT_WORKTREES/bot_fix_b"
  read_github
  grep -q "asking GitHub for bot_fix_a's merged PR failed" "$BATS_TEST_TMPDIR/gh-reader.log"
  [ "$(bot_state card "$CARD_A" | jq -r .state)" = Blocked ]
  [ "$(bot_state card "$CARD_B" | jq -r .state)" = Finished ]
}

# awaiting_ci <card> <worktree>: the card, its checks passed and its PR pushed, now waiting on CI.
awaiting_ci() {
  admit "$1"
  with_worktree "$1" "$2"
  emit worker.launched "$1"
  echo '{"kind":"done","summary":"s","prTitle":"t","prBody":"b"}' > "$2/.vha/outcome.json"
  emit checks.started "$1" --arg file "$2/.vha/outcome.json"
  emit pr.pushed "$1" --arg url https://github.com/o/r/pull/9 --arg sha "$SHA"
}

SHA=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa

# github <merged url> <view JSON>: what gh answers — the merged PR (none for ''), and the PR's checks.
github() {
  stub gh "case \"\$*\" in \"pr list\"*) echo '$1' ;; \"pr view\"*) echo '$2' ;; esac"
}

@test "finishes a card awaiting CI once every check passed" {
  github '' '{"headRefOid":"'$SHA'","statusCheckRollup":[{"name":"lint","status":"COMPLETED","conclusion":"SUCCESS"}]}'
  awaiting_ci "$CARD_A" "$BOT_WORKTREES/bot_fix_a"
  read_github
  grep -q "^gh pr view https://github.com/o/r/pull/9 --json headRefOid,statusCheckRollup" "$STUB_LOG"
  [ "$(events_of ci.passed)" = 1 ]
  [ "$(bot_state card "$CARD_A" | jq -r .state)" = Finished ]
}

@test "sends a card back to the worker when CI failed, naming the checks" {
  github '' '{"headRefOid":"'$SHA'","statusCheckRollup":[{"name":"lint","status":"COMPLETED","conclusion":"FAILURE"},{"name":"e2e","status":"COMPLETED","conclusion":"SUCCESS"}]}'
  awaiting_ci "$CARD_A" "$BOT_WORKTREES/bot_fix_a"
  read_github
  [ "$(jq -sr '[.[] | select(.type == "ci.failed")] | .[0].failure' "$BOT_DIR/events.jsonl")" = "lint failed" ]
  [ "$(bot_state card "$CARD_A" | jq -r .state)" = Queued ]
}

@test "waits while checks are running, and for a PR no check has started on" {
  github '' '{"headRefOid":"'$SHA'","statusCheckRollup":[{"name":"e2e","status":"IN_PROGRESS","conclusion":""}]}'
  awaiting_ci "$CARD_A" "$BOT_WORKTREES/bot_fix_a"
  read_github
  github '' '{"headRefOid":"'$SHA'","statusCheckRollup":[]}'
  read_github
  [ "$(bot_state card "$CARD_A" | jq -r .state)" = "Awaiting CI" ]
}

@test "a PR no check ever started on passes once the card has waited out the grace" {
  github '' '{"headRefOid":"'$SHA'","statusCheckRollup":[]}'
  awaiting_ci "$CARD_A" "$BOT_WORKTREES/bot_fix_a"
  git -C "$BOT_WORKTREES/bot_fix_a" init -q
  git -C "$BOT_WORKTREES/bot_fix_a" -c user.email=t@t -c user.name=t commit -q --allow-empty -m init
  BOT_CI_GRACE_SECONDS=0 read_github
  [ "$(bot_state card "$CARD_A" | jq -r .state)" = Finished ]
}

@test "a card awaiting CI whose PR was merged is finished by the merge, without reading its checks" {
  github https://github.com/o/r/pull/9 '{}'
  awaiting_ci "$CARD_A" "$BOT_WORKTREES/bot_fix_a"
  read_github
  [ "$(events_of pr.merged)" = 1 ]
  [ "$(events_of ci.passed)" = 0 ]
  run ! grep -q "^gh pr view" "$STUB_LOG"
}

@test "a failed look at CI records nothing and is tried again" {
  stub gh 'case "$*" in "pr list"*) echo "" ;; *) exit 1 ;; esac'
  awaiting_ci "$CARD_A" "$BOT_WORKTREES/bot_fix_a"
  read_github
  grep -q "asking GitHub for the checks on https://github.com/o/r/pull/9 failed" "$BATS_TEST_TMPDIR/gh-reader.log"
  [ "$(bot_state card "$CARD_A" | jq -r .state)" = "Awaiting CI" ]
}
