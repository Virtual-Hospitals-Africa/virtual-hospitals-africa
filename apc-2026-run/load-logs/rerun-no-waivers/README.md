# Will's PR #1310 test on the APC 2026 set, with no known-issue waivers

**Run:** 2026-11-05, on the Mac mini, at the request of the vha-work-1 session on Arioch (Tony said go).

**Repo:** `~/Developer/vha-build`, the private copy with push disabled. It is at commit `211b16110c052b68f77f0c7a501b08cd344033ff` ("test fixes", VHA main), branch `apc-2026-build`, holding the 83-page 2026 rule set in `s_expression/rules/apc-adult/`.

**Deno:** 2.8.0, VHA's CI version (`runtime.txt` says 2.7.5).

**Type-checking:** on (no `--no-check`).

**Database:** the local Docker one. The test uses it for SNOMED lookups; the rules tables were not reseeded.

Every touched file was restored afterward and checked against checksums taken before; `git status` was identical before and after. Nothing was committed or pushed, and `.env` was not read (VHA's own test script sources it).

## The test file

`compiled_s_expressions.test.no-waivers.ts` is `git show pr-1310:test/shared/compiled_s_expressions.test.ts` with three edits:

1. `APC_PAGES_NOT_YET_REVIEWED` is emptied (its 2023 page numbers would skip 2026 files).
2. `APC_KNOWN_ISSUES` is emptied.
3. All 7 `assertArrayEmpty(...)` calls go through a small helper that writes the check's full list to `$APC_DUMP_DIR/NN-<check>.json` before asserting, so nothing is truncated.

   The PR file has only one commented-out `Deno.writeFileSync` dump, not three, so the helper is used instead and covers every check. That one comment is left as it was.

## The runs

| Run | Inverse patch | Result |
|---|---|---|
| A | The loader's patch exactly: `value_snomed_concept: undefined` | **Fails type-checking** (TS2322: `undefined` is not assignable to `SnomedConcept \| null`). No test ran. The loader runs the test with `--no-check`, which is why this was never seen; the patch should use `null`. Logs: `runA-*.log` |
| B | None (VHA as-is) | **Crashes on load** with "Attempt to overwrite value_snomed_concept with (no)". The compiled rules can't be re-read, so no check runs at all. The round-trip bug alone stops the whole test. Logs: `runB-*.log` |
| A2 | The type-correct patch: `value_snomed_concept: null` | **Type-checks, runs, fails 3 of its 8 test cases.** Logs: `runA2-*.log`; full lists: `runA2-dumps/` |

Run A2 was added beyond the plan, because Run A could not get past type-checking.

## Run A2 failures (no waivers)

| Check | Failures | What they are |
|---|---|---|
| TASKS: each check_for finding is used as evidence | 15 | All 15 are findings used only as the subject of an onset comparison, which the test does not see |
| PRIORITY EVALUATIONS: evidence is checked for | 12 | 7 are `(no X)` forms the test does not match to X (one of them is also a recorded known issue); 5 are values collected by a `measure` task, which the test does not count |
| DIAGNOSIS RULES: evidence is checked for | 213 | 206 are `(no X)` forms (50 of them also recorded known issues); 7 are `measure` task items |
| SNOMED concepts valid (3 checks), no task checks its own trigger, one file per page | 0 | Pass |

**All 240 failures were predicted.** Each is a case the vha-work gate listed in advance as a place where Will's test is stricter than the gate, or a known issue recorded on that page. None is unexplained. Counted by page and expression, as the test keys its waivers, they are 170 distinct cases (see `RUN-REPORT.md`, "What the test result means"). With waivers, the test passed all 8 cases (12 Deno steps) in the loader run, under Deno 2.7.5 with `--no-check` (`../will-test.log`).

*Edited on 2026-11-05 by the vha-work-1 session for consistency with the run report: case counts, the log path, and wording.*

The `deno-check-*.txt` files hold only the line Deno prints before checking; a pass prints nothing more, and both exited 0.

## Type checks (`deno check`, Deno 2.8.0)

- **`deno-check-pr1310-unedited.txt`: the unedited PR #1310 test passes.**
- **`deno-check-main-test.txt`: main's own test passes.**

**This changes a finding.** Under Deno 2.7.5 the same PR file fails with TS2488 (`../typecheck-pr1310-test.txt`). So "the PR #1310 test no longer type-checks against main" is true only under 2.7.5, the version VHA's `runtime.txt` pins; it type-checks under 2.8.0, the version VHA's CI uses. The real finding is that VHA's two Deno pins disagree.

## Files

- `runA-compile.log`, `runA-test.log`: Run A.
- `runB-compile.log`, `runB-test.log`: Run B.
- `runA2-compile.log`, `runA2-test.log`, `runA2-dumps/` (7 JSON files, one per check, each `{check, count, values}`): Run A2.
- `deno-check-pr1310-unedited.txt`, `deno-check-main-test.txt`: the two type checks.
- `compiled_s_expressions.test.no-waivers.ts`: the edited test file.
- `rerun.sh` (runs A, B and both checks), `rerunA2.sh` (run A2): the scripts that ran them, including the backup and restore.
