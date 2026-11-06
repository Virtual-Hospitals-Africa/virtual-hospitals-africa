# apc-2026-conversion, finished branch: local build and checks (2026-11-05, Mac mini)

**Branch:** `apc-2026-conversion`, in a worktree at `~/Developer/vha-apc2026`, off the private copy `~/Developer/vha-build` (push disabled). It is based on VHA main `6e2cc0e82`. Nothing is pushed to VHA. Commits are listed in `commits.txt`; on top of the earlier four, it now adds:
- `8893758c2`: excludes `apc-2026-run/` in `deno.json`'s top-level `exclude` and in `.dockerignore`;
- `eb5331478`: the run folder `apc-2026-run/`, the 2,980 tracked files of vha-work's `apc-2026-full/` minus `APC-2026-CONVERSION.md` and `SETUP.md`;
- `4bfd5f089`: `docs/apc-2026-conversion.md`.

**Baseline:** plain main in a detached worktree at `~/Developer/vha-main-base`, same commit.

**Deno:** 2.8.0 (VHA CI), type-checking on.

**Database:** local Docker only (`rules:rebuild` = compile + `docker db:seed recreate 31_rules`). It ends holding the 2026 rules.

| Check | Main | Branch |
|---|---|---|
| `deno check` / `deno fmt --check` / `deno lint` | pass / pass / pass | pass / pass / pass |
| `rules:rebuild` | 312 inserts | 762 inserts; compiled output matched the commit (0 files changed) |
| Will's merged test (`compiled_s_expressions`, 11 checks) | main's version passes (its "check_for used as evidence" check is ignored on main) | **8 pass, 3 fail**. 170 distinct cases on 37 pages (15 / 11 / 145 by check; one case is flagged by two checks, so these sum to 171; 146 (no X), 15 onset subject, 9 measured item), identical to `../merged-branch/` |
| `test --ignore=test/web` (CI's test_non_web) | 83 passed, 0 failed | 74 passed, 9 failed: Will's test (3 checks), 7 model files (17 cases) whose fixtures expect specific 2023 rules, and `test/models/rules_dry_run.test.ts`, which crashes on load looking for the 2023 "Check for Anaphylaxis" task. Full list: `branch-test-non-web-failures.txt` |
| `apc-2026-run/` seen by deno? | n/a | No. The check, fmt, lint, Will's test and suite logs never mention it, and it holds no test-pattern files |
| `deno task hygiene` | **not run**: needs bash 4 and ripgrep; under macOS bash 3.2 it crashes but exits 0 | not run (same) |
| hygiene's repo-wide patterns by hand (Python, over `apc-2026-run/` and `docs/`) | n/a | 0 hits (camelCase const, `node:`-scheme imports, inline `import(`): `hygiene-by-hand.txt` |
| test_web, test_migrations, Docker image build | not run | not run |

`../merged-branch/` reported only 7 failing model files and left out `rules_dry_run`, which crashed in that run too. Its "18 cases" was corrected to 17.

## Files

- `commits.txt`: the branch's commits, with PR #1310's head.
- `conflict-resolution.txt`: the one merge conflict, explained, plus `git show --remerge-diff` of the merge for the test file.
- `branch-will-test.log`, `branch-will-test-cases.txt`: Will's test, and its 170 cases (page, kind, expression).
- `branch-will-test-cases.diff-vs-merged-branch.txt`: the comparison with last run's list (identical).
- `branch-test-non-web.log`, `branch-test-non-web-failures.txt`: the suite, and every failing file and case.
- `base-*.log`: the same on plain main.
- `branch-*.log`, `base-*-rules-rebuild.log`: static checks and seeding.
- `hygiene-by-hand.txt`, `results.txt`, `deno-version.txt`, `run.sh`, `run-suite.sh`.
