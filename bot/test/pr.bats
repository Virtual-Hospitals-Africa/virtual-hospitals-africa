load helpers
setup() {
  use_bot_dir
  source "$(repo_root)/bot/lib/names.sh"
  source "$(repo_root)/bot/lib/pr.sh"
  ORIGIN="$BATS_TEST_TMPDIR/origin.git"
  WT="$BATS_TEST_TMPDIR/wt"
  git init -q --bare -b main "$ORIGIN"
  git clone -q "$ORIGIN" "$WT" 2>/dev/null
  git -C "$WT" -c user.email=t@t -c user.name=t commit -q --allow-empty -m init
  git -C "$WT" remote set-url origin https://github.com/o/r.git
  git -C "$WT" config url."$ORIGIN".insteadOf https://github.com/o/r.git
  git -C "$WT" checkout -q -b bot_fix_a
  echo body > "$BATS_TEST_TMPDIR/body.md"
  export GIT_AUTHOR_NAME=t GIT_AUTHOR_EMAIL=t@t GIT_COMMITTER_NAME=t GIT_COMMITTER_EMAIL=t@t
}

# checks_json <sha> <rollup JSON>: what gh pr view prints for the PR.
checks_json() { echo "{\"headRefOid\":\"$1\",\"statusCheckRollup\":$2}"; }

@test "opens a new PR after pushing the branch" {
  stub gh 'case "$*" in "pr list"*) echo "" ;; "pr create"*) echo https://github.com/o/r/pull/9 ;; esac'
  run pr_publish "$WT" "Fix A" "$BATS_TEST_TMPDIR/body.md"
  [ "$status" -eq 0 ]
  [ "$output" = https://github.com/o/r/pull/9 ]
  [ "$(git -C "$ORIGIN" rev-parse refs/heads/bot_fix_a)" = "$(git -C "$WT" rev-parse HEAD)" ]
  grep -q "^gh pr create --head bot_fix_a --title Fix A --body-file $BATS_TEST_TMPDIR/body.md$" "$STUB_LOG"
}

@test "an open PR is pushed to, never opened twice" {
  stub gh 'case "$*" in "pr list"*) echo https://github.com/o/r/pull/9 ;; esac'
  run pr_publish "$WT" "Fix A" "$BATS_TEST_TMPDIR/body.md"
  [ "$status" -eq 0 ]
  [ "$output" = https://github.com/o/r/pull/9 ]
  [ "$(git -C "$ORIGIN" rev-parse refs/heads/bot_fix_a)" = "$(git -C "$WT" rev-parse HEAD)" ]
  run ! grep -q "pr create" "$STUB_LOG"
}

@test "a comment posts its file" {
  stub gh 'true'
  pr_comment "$WT" https://github.com/o/r/pull/9 "$BATS_TEST_TMPDIR/body.md"
  grep -q "^gh pr comment https://github.com/o/r/pull/9 --body-file $BATS_TEST_TMPDIR/body.md" "$STUB_LOG"
}

@test "a failed gh call fails the function" {
  stub gh 'exit 1'
  run pr_publish "$WT" "Fix A" "$BATS_TEST_TMPDIR/body.md"
  [ "$status" -ne 0 ]
  run pr_comment "$WT" https://github.com/o/r/pull/9 "$BATS_TEST_TMPDIR/body.md"
  [ "$status" -ne 0 ]
}

SHA=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
PR_URL=https://github.com/o/r/pull/9

@test "CI is none until a check has started, pending while one runs, passed once all pass or are skipped" {
  stub gh 'cat "$BATS_TEST_TMPDIR/view.json"'
  checks_json $SHA '[]' > "$BATS_TEST_TMPDIR/view.json"
  [ "$(pr_ci "$WT" $PR_URL)" = none ]
  checks_json $SHA '[{"name":"lint","status":"COMPLETED","conclusion":"SUCCESS"},{"name":"e2e","status":"IN_PROGRESS","conclusion":""}]' > "$BATS_TEST_TMPDIR/view.json"
  [ "$(pr_ci "$WT" $PR_URL)" = pending ]
  checks_json $SHA '[{"name":"lint","status":"COMPLETED","conclusion":"SUCCESS"},{"name":"web","status":"COMPLETED","conclusion":"SKIPPED"},{"context":"vercel","state":"SUCCESS"}]' > "$BATS_TEST_TMPDIR/view.json"
  [ "$(pr_ci "$WT" $PR_URL)" = "$(printf 'passed\t%s' $SHA)" ]
  grep -q "^gh pr view $PR_URL --json headRefOid,statusCheckRollup" "$STUB_LOG"
}

@test "CI fails as soon as one check fails, naming the ones that did, even while others run" {
  stub gh 'cat "$BATS_TEST_TMPDIR/view.json"'
  checks_json $SHA '[{"name":"lint","status":"COMPLETED","conclusion":"FAILURE"},{"name":"e2e","status":"IN_PROGRESS","conclusion":""},{"context":"deploy","state":"ERROR"},{"name":"knip","status":"COMPLETED","conclusion":"CANCELLED"}]' > "$BATS_TEST_TMPDIR/view.json"
  [ "$(pr_ci "$WT" $PR_URL)" = "$(printf 'failed\t%s\tlint, deploy, knip' $SHA)" ]
}

@test "a failed look at CI fails the function" {
  stub gh 'exit 1'
  run pr_ci "$WT" $PR_URL
  [ "$status" -ne 0 ]
}
