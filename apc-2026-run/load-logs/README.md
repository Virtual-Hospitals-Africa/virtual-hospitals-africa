# Load and test logs

Copied from the build Mac's `ruleset/.check/` on 2026-11-05. They come from the loader run (`tools/load_into_vha.sh`) on 2026-11-05; the 2026-11-04 originals were overwritten.

| File | What it is |
|---|---|
| `will-test.log` | Will's PR #1310 test, as run by the loader (`deno task test --no-check`) |
| `compiled_s_expressions.with-waivers.ts` | That test file as the loader edited it (renamed from `compiled_s_expressions.test.ts` so Deno never runs it as a test): `APC_PAGES_NOT_YET_REVIEWED` emptied, 247 rows in `APC_KNOWN_ISSUES` |
| `seed.log`, `compile.log` | VHA's compile and seed in the private build copy |
| `gate-fixed.json` | The same gate after its `(no X)` pattern was fixed (2026-11-05, run on Tony's laptop against a clean export of VHA main `211b16110`, Deno 2.7.5): 0 findings. Paths are relative |
| `gate-fixed-nox-fix.json` | The gate after a second fix (2026-11-05, after review): it now reads `(no X)` with or without VHA's internal "No" value, so it gives the same answer with the one-line `inverseSExpression` fix applied. Run with Deno 2.8.0 against a clean export of VHA `211b16110` with that fix: 0 findings, and the same 383 differences from Will's test as `gate-fixed.json` |
| `gate.json` | The automated gate over the whole set, before that fix (57 false findings). It also covers VHA's three shared rule files (`other.lisp`, `pain.lisp`, `sats.lisp`); filter by `apc_dir` for the 83 pages |
| `concepts-not-resolving.json` | SNOMED concepts that did not resolve (none) |
| `vha-build-state.txt` | The build copy's commit and `git status` |
| `rerun-no-waivers/` | Will's test rerun on the build Mac with no known-issue waivers, Deno 2.8.0, type-checking on (its own README explains the runs) |
| `loader-test/` | A test run of the updated loader (`tools/load_into_vha.sh`, 2026-11-05): Deno 2.8.0, type-checking on, nothing excused. `will-test-cases.json` lists the 170 flagged cases; `will-test-dumps/` has each check's full list |
| `typecheck-pr1310-test.txt` | `deno check` on the edited test file; regenerated 2026-11-05, not saved by the run |
| `typecheck-main-test-2.7.5.txt`, `typecheck-main-test-2.8.0.txt` | `deno check` on VHA main's own copy of the test (at `211b16110`): TS2488 at line 189 under 2.7.5, clean under 2.8.0 |
| `merged-branch-final/` | The finished branch, on the mini (2026-11-05): all the commits, including the run folder, the `deno.json`/`.dockerignore` exclusions and the document. Same figures as `merged-branch/`; `deno test` discovered nothing in `apc-2026-run/`. Has `commits.txt`, `conflict-resolution.txt` (the merge's one hand-resolved hunk) and a hand run of hygiene's patterns. Its own README explains the runs |
| `merged-branch/` | The real branch, built on the mini (2026-11-05): VHA main `6e2cc0e82` + PR #1310 merged (test conflict resolved by hand) + the `(no X)` fix + the 2026 rules. Seed, Will's merged test (8 of 11 pass, the same 170 cases), and VHA's non-web tests on the branch and on main. Its own README explains the runs |
| `typecheck-pr1310-unedited-2.7.5.txt` | `deno check` under 2.7.5 on PR #1310's test file, unedited: TS2488 at line 249, exit 1 |
| `hygiene-rg-final.txt` | VHA's hygiene patterns, run with ripgrep over every file that ships in `apc-2026-run/` and the document: nothing hygiene doesn't allow |
| `run-cost.txt` | Agent runs and cost; regenerated 2026-11-05 from the run's transcripts |

Notes:

- **Colors.** `will-test.log`, `seed.log` and `compile.log` keep the terminal's color codes (`[0m[32m` and similar), so they read best in a terminal: `cat will-test.log`.
- **Paths.** Absolute paths start `/Users/syncytium/`, the build Mac's account.
- **Deno.** The load ran under Deno 2.7.5, the version in VHA's `runtime.txt`; VHA's CI uses 2.8.0. `typecheck-pr1310-test.txt` is the 2.7.5 result for the loader-edited copy (error at line 442); the unedited PR file fails the same way under 2.7.5 (line 249; `typecheck-pr1310-unedited-2.7.5.txt`). Under 2.8.0, the PR #1310 test file and main's own copy of the test both pass `deno check`; see `rerun-no-waivers/deno-check-pr1310-unedited.txt` and `deno-check-main-test.txt`. Under 2.7.5, main's own copy fails the same way (line 189), saved as `typecheck-main-test-2.7.5.txt` (and the 2.8.0 pass as `typecheck-main-test-2.8.0.txt`).
- **Cost header.** `run-cost.txt` labels the main run "80 pages", but its agent counts (162 Fable, 405 Opus, 162 Sonnet) fit 81 page builds at nine agents each. The difference is unexplained.
