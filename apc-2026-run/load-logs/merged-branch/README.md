# apc-2026-conversion: local build and checks (2026-11-05, Mac mini)

**Branch:** `apc-2026-conversion`, in a worktree at `~/Developer/vha-apc2026`, off the private copy `~/Developer/vha-build` (push disabled). It is based on VHA main `6e2cc0e82` ("check fix"). Commits are in `commits.txt`. Nothing is pushed.

**Baseline:** plain main in a detached worktree at `~/Developer/vha-main-base`, same commit.

**Deno:** 2.8.0 (VHA CI), type-checking on.

**Database:** local Docker only, via `rules:rebuild` (compile + `docker db:seed recreate 31_rules`). It ends holding the 2026 rules (762 inserts).

| Check | Main | Branch |
|---|---|---|
| `rules:rebuild` | 312 inserts | 762 inserts; the compiled output matched the commit |
| Will's merged test (`compiled_s_expressions`) | main's own version: passes, with "check_for used as evidence" ignored | 8 of 11 checks pass; 3 coverage checks fail |
| `deno check` / `deno fmt --check` / `deno lint` | pass / pass / pass | pass / pass / pass |
| `deno task hygiene` | **not run**: needs bash 4 and ripgrep; under macOS bash 3.2 it crashed ("unbound variable") yet reported exit 0 | not run (same) |
| `test --ignore=test/web` (CI's test_non_web) | 83 passed, 0 failed | 74 passed, 9 failed: Will's test, plus 8 model test files whose fixtures expect specific 2023 rules. 7 fail 17 cases (additional_tasks 3, due_to 1, patient_findings_insert 1, patient_findings_with_modifiers 7, snomed_warning_signs 1, system_diagnosis_rules 3, system_priority_evaluations 1). The 8th, `rules_dry_run.test.ts`, crashes on load (uncaught error at line 69: no task "Check for Anaphylaxis"), so none of its 19 cases ran; on main all 19 pass. (Corrected 2026-11-05 on Tony's laptop: the first version of this README missed it.) The 74/83 counts are top-level tests, not files |
| test_web, test_migrations, Docker image build | not run | not run |

**Will's test cases:** `branch-will-test-cases.txt` (page, kind, expression) and `.json`. 240 raw failures make 170 distinct cases on 37 pages: 146 (no X), 15 onset subject, 9 measured item. That is the same set as the previous no-waiver run (`darkroom/vha-run-logs/loader-test/`).

**Scripts:** `run.sh` (rebuild, Will's test, static checks) and `run-suite.sh` (non-web suite on both trees).
