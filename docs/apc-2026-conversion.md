# APC 2026 red boxes as VHA rules: what we did, and how to check it

VHA's adult rules encode the 2023 edition of APC, the *Adult Primary Care* guide. The 2026 edition (version 4.1, published October 2026 by the Knowledge Translation Foundation with South Africa's National Department of Health) has changed pages, criteria and page numbers. Anaphylaxis, for example, has moved from p20 to p28, and 2026 p20 is seizures. This branch holds a first attempt at encoding the 2026 edition.

**Status:** a first pass, built and checked by AI agents. No clinician has reviewed any of it, and we haven't run any rule against a patient case. We plan to go through it ourselves, make changes and run it again before it's worth a clinician's time. · **Written:** 2026-11-05, by Tony DeFazio, a volunteer with VHA, with Claude

## In short

The clinical red boxes of APC 2026 are written here as VHA rules in VHA's s-expression rule format: 83 pages, 612 rules. A red box is the box of urgent findings, bordered in red, on an APC page. Management steps (drugs, doses, referral wording) are not encoded. AI agents followed the briefing that Will Weiss (VHA's CTO) wrote in PR #1310 (`docs/apc-adult-rules-briefing.md`), with our own checks added.

| Check | Result |
|---|---|
| Compiles and seeds into VHA | Yes, after a one-line fix to a VHA bug: VHA can't re-read rules that use `(no X)`, meaning "the patient does not have X" |
| Will's integrity test for the rules (`test/shared/compiled_s_expressions.test.ts`), with nothing excused | 8 of its 11 test cases pass. The other 3 flag 170 rule expressions. 3 of those look like real defects in our rules. The other 167 rest on our gate reading Will's constraints more loosely than his test does, and none has been checked one by one. |
| VHA's other non-web tests | 8 test files fail, because their fixtures expect 2023 rules; one of them is the rules dry-run test. VHA `main` passes all of them. |
| Clinician review | None |
| Run against a patient case | Not by us |

We also found five issues in VHA's code and setup ("What we found in VHA"), and we have six questions ("Our questions for Will"). The main ones: is this the direction Will wants, and which reading of the 170 flagged expressions is right?

## What we did

We took every page of the APC 2026 e-book that has a clinical red box (83 pages). For each, we wrote its red box, and the page logic that feeds it, as VHA rules: tasks, priority evaluations and diagnosis rules. There is one rule file per page, named by 2026 page number.

p181's file has no rules: its only red box is a treatment box, all management steps, which are out of scope. Beside each rule file, as Will's briefing asks:

- a **remaining-questions** file: what the rules can't hold, where they fire more or less often than the page intends, and open questions (83 pages);
- a **flowchart** file, where the page has a flowchart, Yes/No branches or a multi-step algorithm (the briefing's criterion): its logic written out before the rules (70 pages).

The rules don't match the guide everywhere:

| Rules fire | Where | Example |
|---|---|---|
| Less often | a criterion needs a lab value, which the rule language can't hold, or has no SNOMED concept | p44: a patient with hemoglobin (Hb) < 6 and no other sign is missed |
| More often | the guide gives a duration, but the rule language records only when a symptom began | p24: chest pain that "lasts ≥ 10 minutes" becomes chest pain that began at least 10 minutes ago, which counts even if it has stopped |

Each page's remaining-questions file says where.

**Page numbers changed.** The 2026 files are numbered by 2026 page, and many 2026 numbers belong to a different topic in 2023. Several things in VHA are still keyed to 2023 numbers; they are listed under "Our questions for Will".

**Seven 2023 topics have no 2026 file.** No 2026 red-box page matched ear symptoms, the three COVID-19 pages, scalp symptoms, nail symptoms or ischemic heart disease, so this branch has no rules for them. Some of those 2023 files encoded pages without a red box; our scope was red boxes only.

## How we did it

| Stage | Done by | What it does |
|---|---|---|
| Build | Two AI agents (Claude Opus), separately | Each writes its own draft of the page's rules (a "build"), following Will's briefing and his worked example (the anaphylaxis page, 2023 p20, 2026 p28): page image first, then the flowchart file, the rules and the remaining-questions file |
| Diff | Script | Lists every difference between the two builds |
| Reconcile | One AI agent | Settles each difference, and records why |
| Gate | Script | Checks each page with VHA's own parser and helpers, following the logic of Will's test as in PR #1310 but reading three of his constraints more loosely (below). Every SNOMED concept must exist in the 2025-12-01 release, and every comparison operator must be one the database accepts. Every condition needs a cited page element (one bullet, box line or flowchart node) and a verbatim quote. Every page element must be encoded or declared out of scope. |
| Check | Six AI agents on three Anthropic models (Claude Fable, Opus and Sonnet) | Three read the page and judge whether the rules encode each element; three read the rules and judge whether each condition is faithful to the page |
| Scorecard | Script | Combines the checks into a review queue for each page |

We departed from the briefing in two ways:

- **SNOMED names came from our copy of VHA's lookup**, not the `vha-snomed` MCP the briefing names, so the work could run without Docker. It uses the same release and the same matching rule. Will's test then confirmed every concept it reaches against VHA's own database.
- **The gate reads three of Will's constraints more loosely than his test does**, explained under "What Will's test makes of it".

The red boxes were found with the same red-border test as VHA's `scripts/data-munging/extract_red_boxes.py`, using our own extractor. Every method choice, with the alternatives and the reason, is in [`apc-2026-run/DECISIONS.md`](../apc-2026-run/DECISIONS.md). The full account, with every figure and limit, is in [`apc-2026-run/RUN-REPORT.md`](../apc-2026-run/RUN-REPORT.md).

## What Will's test makes of it

We ran the test on this branch under Deno 2.8.0, with type-checking on, every page checked and no waivers. (A waiver is an `APC_KNOWN_ISSUES` entry, which excuses one expression on one page.) It passes 8 of its 11 test cases: PR #1310's eight plus `main`'s three finding-site checks. (The run report's "5 of 8" is PR #1310's test file alone.) The 3 that fail are the coverage checks:

- **Tasks:** is each finding a task checks for used by some rule? This check already counts a rule's `(no X)` as using X.
- **Priority evaluations and diagnosis rules:** is each finding a rule uses checked for by a task on the same page? These checks demand `(no X)` itself, matched as an exact string.

One of them, the tasks check ("check_for used as evidence"), is skipped in `main`'s copy of the test; Will's PR turns it back on.

The coverage checks list 240 failures. Counted by page and expression, as waivers are, these come to 170 **flagged expressions** on 37 pages. (The run's logs and the run report call them "cases".) Our gate accepted every one:

| Kind | Flagged | From | What the rule does | What the test wants |
|---|---|---|---|---|
| `(no X)` evidence, X checked for on the page | 143 | priority and diagnosis checks | uses `(no X)`, and a task on that page checks for X (the app asks the health worker about X) | `(no X)` itself checked for, or used in a task's `due_to`, on the same page |
| `(no X)` evidence, X not checked for | 3 | priority and diagnosis checks | uses `(no X)`, but X appears only as a task's `due_to` trigger and in other rules' conditions | as above |
| Onset subjects | 15 | tasks check | uses a finding only inside an onset comparison | the finding also used outside one; the test's evidence helper skips onset comparisons |
| Measured items | 9 | priority and diagnosis checks | collects an item with a `measure` task | the item checked for; the test doesn't count measured items (it has a TODO for this) |
| Total | 170 | | on 37 pages | |

**On `(no X)`, the test and the briefing are asymmetric.** The briefing says evidence matching is by exact s-expression string, and the priority and diagnosis checks apply that. But for the tasks direction the briefing says "Usage as `(no …)` also counts", and the tasks check agrees. Our gate applies the looser reading in both directions.

Our case for it: when a health worker presses "None of the above" for a group of findings to check for, VHA records each unanswered finding in the group as absent (`shared/none_of_the_above_findings_post.ts`). So checking for X can produce `(no X)`. Two conditions limit this:

- the task that asks about X must fire whenever the rule needs the answer;
- the health worker must press "None of the above". If they tick what is present and move on, nothing is recorded as absent, and a rule needing `(no X)` stays silent.

Nobody has checked the first condition for each of the 143, and nobody has tested the mechanism in the app.

**3 look like real defects.** In the 3 cases where no task on the page checks for X, the app may never record `(no X)`, so the rule may never fire. Two are on p34, where the low-risk self-harm rule needs `(no Suicide attempt)` and `(no Intentionally harming self)`. The third is on p23, where post-infectious cough needs `(no Difficulty breathing)`.

The onset subjects and measured items weren't looked at one by one. They were accepted as kinds, because the test can't see them: its evidence helper skips onset comparisons, and it has a TODO for measured items.

The full list is in [`apc-2026-run/load-logs/merged-branch-final/`](../apc-2026-run/load-logs/merged-branch-final/). It is identical to the list from an earlier run on PR #1310's test file before the merge ([`apc-2026-run/load-logs/loader-test/`](../apc-2026-run/load-logs/loader-test/)). An earlier run still, under Deno 2.7.5 with type-checking off, passed every check with 247 waivers. Those covered all 170 plus 77 expressions that weren't flagged.

**Our gate's verdict doesn't depend on VHA's bug.** The gate first ran against VHA code without the one-line fix, and its `(no X)` matching relied on how the unfixed code writes `(no X)`. With the fix applied, that version would have flagged the 146 too. We changed the gate to read both forms. Rerun against fixed VHA code, it finds nothing on any page, and it lists the same differences from Will's test ([`apc-2026-run/load-logs/gate-fixed-nox-fix.json`](../apc-2026-run/load-logs/gate-fixed-nox-fix.json)).

**SNOMED attribute values aren't tested.** The 2026 set has 460 finding-site values, on 43 pages. Will's test can't fail on any of them, because its SNOMED check looks up an attribute's type, not its value (see "What we found in VHA"). `main`'s three finding-site checks cover the files in `s_expression/finding_site_findings/`, not values inside rules. Our gate checked the values against the 2025-12-01 release.

## How far to trust it

The review queue holds 5,708 items; 615 are high priority:

| High-priority item | Count | Queued at high priority when |
|---|---|---|
| Condition | 95 | a rules-to-page checker called it wrong or unsupported; 87 of these were flagged by only one checker |
| Page element | 295 | a page-to-rules checker called it missing or wrong |
| Rule-level problem | 225 | a checker reported a severe problem with a whole rule |
| Total | 615 | |

Agreement among the checkers:

| Measure | Result |
|---|---|
| Page elements (2,954 in all) | All three checkers called 956 in scope and 1,461 out of scope; 537 had split scope votes. Of the 956, all three called 576 correctly encoded (60%). The split elements are the contested ones, and borderline scope votes were mostly "missing". |
| Conditions (6,224) | All three rules-to-page checkers called 4,430 faithful (71%). The other 1,794 drew at least one vote other than faithful. |

None of these flags has been adjudicated. Most of the 95 condition flags came from one checker, which fits false alarms and misses by the other two equally well. The checks also aren't independent: the same model (Opus) wrote both builds, did the reconcile, and was one of the three checkers each way, and all six checkers worked from one list of page elements.

**Flowchart routing goes unchecked.** "If no, go to …" arrows aren't page elements. So neither the gate's coverage check nor any checker can flag a missing or wrong branch on the 70 flowchart pages. Only a person's review can catch these.

**The gate passed the 3 possible defects above**, which Will's test catches. A builder can also get past the gate by declaring an exception with a reason. The builders declared 40, all blaming our tooling: 36 for a gate bug in recognizing qualified `(no X)` forms, fixed on 2026-11-05, and 4 for an onset gap fixed the day before. The gate needs none of them now, though the build records still list them. Will's test still flags 31 of the 40, among the 170. That's why the next step is our own review, not a clinician's sign-off.

**Compared with Will's 2023 rules.** On the 46 pages that have a 2023 rule file, 53% of Will's 2023 conditions (697 of 1,327) appear exactly in the 2026 build. Another 14% are related through SNOMED, and 33% have no match. This measures agreement, not correctness: the two sets encode different editions, the builders saw VHA's existing SNOMED terms, and no clinician has judged either set. Pages whose red box changed in substance match more often (54%) than pages whose red box is unchanged or changed only in numbers, wording or position (42%), so edition changes don't explain the mismatches. This is a rough grouping, since conditions cluster by page. Each review page's "Edition context" tab shows its page's comparison; the run report has the detail.

## What we found in VHA

Line numbers are at `main` `6e2cc0e82`.

1. **`(no X)` crashes the seed and Will's test.** `inverseSExpression` (`shared/s_expression_inverse.ts:39–40`) writes `(no X)` with the internal "No" value (`value_snomed_concept`) still in it. The modules that load the compiled rules (`shared/tasks.ts`, `shared/system_diagnosis_rules.ts` and `shared/system_priority_evaluations.ts`) re-parse them at import. That fails `no_finding`'s assert (`shared/s_expression_schemas.ts:481`). The compile step itself succeeds.
   - **The fix** is one line: pass `value_snomed_concept: null` alongside `existence: 'Yes'`.
   - **On `main`:** no effect today, since its rules have no `(no X)`.
   - **Not yet tested:** the app, and the web tests that exercise negative findings (the triage warning-signs and none-of-the-above tests). `inverseSExpression` is also used at run time by the warning-signs screen, the rules dry run and additional tasks.
2. **The database rejects `>`, `<` and `=` in time comparisons** (migration `20260905021111`), though the rule language allows them and Will's briefing teaches `(< (onset …) (time_ago 3 days))`. With only `>=` and `<=`, a boundary value can satisfy two rules meant to exclude each other. On p24, exactly 10 minutes counts toward both acute coronary syndrome and stable angina.
3. **`not` can't be used.** The rules guide (`docs/rules-guide.md:398`) and the schema accept it, but `allEvidenceToLookFor` throws "Not supported" on it (`db/models/s_expression_evidence.ts:35`). The seed's `dueToInsert` silently drops it (`shared/rules.ts:157`). The 2026 set uses `(no X)` instead.
4. **SNOMED attribute values go unchecked.** `allConceptsToLookFor` (`shared/s_expression_concepts.ts:21–23`) yields an attribute's type but not its value, so the test's SNOMED checks skip finding sites. Four 2023 rules, in `21-burns.lisp` and `32-face-symptoms.lisp`, use values that don't resolve in our copy of VHA's lookup: "Eyelid" and "Chest structure". The release names these "Eyelid structure" and "Thoracic structure".
5. **VHA's runtime and CI name different Deno versions.** `runtime.txt` says 2.7.5; CI, `CLAUDE.md` and the web, migrator and events-processor Dockerfiles use 2.8.0 (the two chatbot Dockerfiles use 2.6.4). `main`'s copy of Will's test fails to type-check under 2.7.5 (TS2488) and passes under 2.8.0, and so does PR #1310's. The outputs are in [`apc-2026-run/load-logs/`](../apc-2026-run/load-logs/).

## What's on this branch

This branch starts from VHA `main` at `6e2cc0e82`, with Will's PR #1310 (`pack-adult-fable`, head `936ef54e4`) merged in.

| Commit | What it changes |
|---|---|
| Merge of PR #1310 | Will's test, briefing and anaphylaxis example, plus the PR's changes to the compiled rule files. One hunk of the test conflicted with `main`, in the priority-evaluation check: we kept `main`'s handling of `active_condition` findings and added the PR's known-issue check. Everything else merged cleanly, including `main`'s three finding-site checks. |
| The `(no X)` fix | the one line in `shared/s_expression_inverse.ts` described above. It comes before the rules, so every commit loads. |
| The 2026 rules | `s_expression/rules/apc-adult/`: 83 rule files, with their remaining-questions and flowchart files. A README there says they are an AI-built first pass, not clinically reviewed. They replace the 2023 set: 53 rule files, an `.xlisp` draft, and PR #1310's two anaphylaxis notes, which stay in git history. The commit includes the three files VHA compiles from the rules (`s_expression/tasks.ts`, `system_priority_evaluations.ts`, `system_diagnosis_rules.ts`), so a fresh checkout runs the 2026 rules without compiling first. |
| Test: check every page | empties `APC_PAGES_NOT_YET_REVIEWED` in Will's test, with a comment saying why. The list holds 2023 page numbers, which match 37 unrelated 2026 pages, 21 of them among the flagged pages. Left as it is, the test would skip those pages and hide 85 of the 170 flagged expressions. Emptying it is not a claim that any page has been reviewed. `APC_KNOWN_ISSUES` stays empty. |
| Keep the run folder out of checks and images | `deno.json` excludes `apc-2026-run/` from formatting, linting and type-checking, and `.dockerignore` keeps it out of Docker images. The folder holds no file Deno treats as a test. |
| Our run folder | `apc-2026-run/`: review pages, checker reports, both builds, logs, the run report, method notes and the tools we used (about 110 MB). `build/` and the `*.log` files (about 1,400 files) are force-added despite VHA's `.gitignore`. |
| This document | `docs/apc-2026-conversion.md` |

### What will fail

VHA's CI runs only on a pull request into `main`, so pushing this branch runs nothing. We ran the pull-request checks locally on `main` and on the finished branch, with all of the commits above. They match an earlier run on the branch's first four commits, and `deno test` discovered nothing in `apc-2026-run/`.

- `deno check`, `deno fmt --check` and `deno lint` pass on both.
- VHA's non-web tests: on `main`, 83 top-level tests pass (2 ignored). On this branch, 74 pass and 9 fail:
  - Will's test: its 3 coverage checks, above.
  - 7 model test files fail 17 cases, because their fixtures use 2023 rules: `additional_tasks`, `due_to`, `patient_findings_insert`, `patient_findings_with_modifiers`, `snomed_warning_signs`, `system_diagnosis_rules` and `system_priority_evaluations`, all in `test/models/`. Examples are constipation onset ≥ 24 hours, the insect-bite tasks, fever leading to probable meningitis, and the "Check for Anaphylaxis" task.
  - `test/models/rules_dry_run.test.ts` crashes as it loads, because its fixture looks up the 2023 task "Check for Anaphylaxis". None of its 19 cases ran.

These tests cover VHA's code (due_to matching, findings with modifiers, priority evaluations, diagnosis rules, the rules dry run) using 2023 rules as fixtures. Until the fixtures move to 2026 content, or those rules are kept, that code goes untested on this branch.

We didn't run the web tests, the migration tests or the Docker image build. `deno task hygiene` needs bash 4 and ripgrep, which our test machine lacks. So we ran its three repo-wide patterns by hand over everything in `apc-2026-run/` and `docs/`: they find nothing hygiene doesn't allow (`load-logs/hygiene-rg-final.txt`). (Hygiene doesn't read `deno.json`, so in CI it will scan the run folder's 8 `.ts` files.) The test runs used a local development database, not CI's fresh one, so compare `main` and this branch with each other, not with CI.

## Our questions for Will

1. **Direction.** Is this the approach you want before we put more work into it?
2. **The 170 flagged expressions.** Should the priority and diagnosis checks treat `(no X)` the way the tasks check already does, on the "None of the above" argument? Or should they keep demanding `(no X)` itself? And should onset subjects and measured items count as uses? The kinds are in the table under "What Will's test makes of it".
3. **The `(no X)` fix.** Is the one-line change to `inverseSExpression` the right fix?
4. **Time comparisons.** Should the database accept `>` and `<`, or should rules keep to `>=` and `<=` and the briefing say so?
5. **Deno.** Which version is canonical: `runtime.txt` (2.7.5) or CI (2.8.0)?
6. **Things keyed to 2023 page numbers.** How would you like these handled?
   - `APC_PAGES_NOT_YET_REVIEWED`;
   - the APC table of contents in `shared/pack-adult.ts`, used for page links and the Notion script;
   - the 141 "Display medical guidance" tasks, which a health worker sees on the triage screen labeled "APC 2023" with 2023 page links, beside the 2026 rules;
   - `s_expression/finding_site_findings/*.lisp`;
   - `red_boxes/apc-adult/`: our extractor has already pulled the 2026 red boxes, with the same detection test as `scripts/data-munging/extract_red_boxes.py`, into `apc-2026-run/inputs/2026/`;
   - the screenshot folders in `apc-test-results/`;
   - the briefing's worked example, which points to the 2023 anaphylaxis files this branch replaces.

The `deno.json` and `.dockerignore` change can be dropped only together with the run folder. Without it, the folder's own scripts fail `deno check`, `fmt` and `lint`.

## How to review the results with our tooling

**Review pages.** From a local checkout, open `apc-2026-run/review/index.html` in Chrome. It lists the 83 APC pages; each one's review page shows:

- the red box from the e-book across the top;
- the red box's text, piece by piece (the page elements), on the left;
- the rules on the right, either in English or as written in the rule file. Findings are worded by the app's own `findingFullDisplay`, as health workers see them; absence, onset times and diagnoses are in our own wording.

Each page element and each condition shows what the checkers said, with buttons to decide it. For a condition, the buttons are accept, fix or question. For text the rules leave out, they are confirm out of scope, should be encoded or question. The review queue at the bottom lists what needs a person first (checker flags, builder disagreements and declared exceptions), high priority first. Every column and pane has a "?" that explains it, and [`apc-2026-run/review/guide.html`](../apc-2026-run/review/guide.html) explains the page as a whole.

Decisions stay in your browser until you export them. Send the exported file to Tony, who collects them in `apc-2026-run/review/decisions.csv` (created on the first merge). The pages have been tested in headless Chrome, and by eye in Chrome on one page. Export has been tested only in headless Chrome.

**Files.**

| What | Where |
|---|---|
| Rules, flowchart notes, remaining questions | `s_expression/rules/apc-adult/`. The copy in `apc-2026-run/ruleset/apc-adult-2026/` is the snapshot as built; edit only `s_expression/rules/apc-adult/`. |
| Both builds and the reconcile records (the remaining-questions files cite `reconcile.json` and builders A and B) | [`apc-2026-run/build/`](../apc-2026-run/build/) |
| Each page's six checker reports, scorecard and review queue | `apc-2026-run/checks/<page>-<slug>/`, for example [`checks/24-chest-pain/`](../apc-2026-run/checks/24-chest-pain/) |
| Compile, seed and test logs, and the gate's output | [`apc-2026-run/load-logs/`](../apc-2026-run/load-logs/); this branch's runs are in `merged-branch-final/` (the finished branch, with the merge's conflict resolution) and `merged-branch/` (its first four commits) |
| Every method choice | [`apc-2026-run/DECISIONS.md`](../apc-2026-run/DECISIONS.md) |
| The full report: figures, limits, what Will's test made of it | [`apc-2026-run/RUN-REPORT.md`](../apc-2026-run/RUN-REPORT.md) |

The run folder's documents were written in our working repository, where the folder is called `apc-2026-full/`, so some of their paths use that name. Some also cite our meeting notes, which aren't included. The run folder's tools run from that repository, which is private, and its setup notes aren't included. On this branch you don't need them: VHA's own tooling below works on the rules as committed.

## How to see it with VHA's tooling

**Don't run `scripts/populateNotionAPCDatabase.ts` from this branch.** It writes to VHA's live Notion database, and it pairs 2023 inputs (tables of contents, PDF links, thumbnails, `red_boxes/`, screenshots) with whatever rule file has the same number.

`scripts/seed/createSamplePatientsForEachAPCPage.ts` writes to whichever database `.env` names, so run it after `rules:rebuild`, which points `.env` at Docker.

| Tool | What it shows | Run by us on this branch? |
|---|---|---|
| `deno task rules:rebuild` | compiles the rules and reseeds the local Docker database (the reseed switches `.env` to `.env.docker` first, if needed) | Yes: 762 rule inserts, which are our 612, VHA's 9 shared rules and 141 "Display medical guidance" tasks VHA generates |
| `deno task test test/shared/compiled_s_expressions.test.ts` | Will's integrity test | Yes: 8 of 11 test cases pass, 170 flagged expressions (under "What Will's test makes of it") |
| `deno task test --ignore=test/web` | VHA's non-web tests | Yes: 74 pass, 9 fail (under "What will fail") |
| `deno task run:trusted scripts/seed/createSamplePatientsForEachAPCPage.ts` | creates a sample patient for each APC task, to open on the triage screen | No; safe on a local database |
| The app: a patient's triage screen | which follow-up tasks, diagnoses and priorities the rules produce as findings are entered (the rules dry run) | No; safe locally |
| `scripts/seed/screenshotAPCAdditionalTasks.ts` | a screenshot of each task as a health worker sees it, saved in `apc-test-results/<page>/`. Needs the app running, Puppeteer and a seeded database. | No. It takes the page number from the rule file's name, and the guidance tasks' numbers from the 2023 table of contents. It skips any image that already exists, so 2026 screenshots would be silently skipped wherever a 2023 one has the same name. |

## Limits

- No clinician has reviewed any of it. We haven't run any rule against a patient case; VHA's own patient-case tests that depend on rule content fail on this branch (under "What will fail").
- The checkers are AI models, and their agreement isn't evidence that the rules are clinically right.
- Loading cleanly shows the rules fit VHA's format; it doesn't show the app behaves correctly with them.

More in [`apc-2026-run/RUN-REPORT.md`](../apc-2026-run/RUN-REPORT.md), "Limits".
