# APC 2026 red-box pages as VHA rules: full run report

**Run:** 2026-11-04; load and test rerun 2026-11-05 · **Status:** built and checked by AI agents; no clinician has reviewed any of it

Every APC 2026 page with a clinical red box has been written as VHA rules in Will's Lisp format: 83 pages, 612 rules. A red box is the red-bordered box of urgent findings on an APC page ("Manage and refer urgently"). The scope is the red boxes and the page logic that feeds them. Management steps (drugs, doses, referral wording) are not encoded.

The builders followed Will's PR #1310 briefing. This run added the rest of the pipeline: two separate builds per page, a reconcile that settles their differences, an automated gate and six AI model checkers. Each stage is described in "How each page was made"; departures from the briefing are in `DECISIONS.md`.

The set compiles and seeds into a private local copy of VHA's database, with a one-line fix to a VHA bug in `inverseSExpression` applied during the load (see "VHA findings from the run"). Without the fix, Will's test can't load the rules at all.

Will's PR #1310 test, run as VHA's CI would (Deno 2.8.0, type-checking on) with that fix and no known-issue waivers, passes 5 of its 8 test cases. The other 3, its coverage checks, flag 170 cases on 37 pages. Our gate accepts every one of them; they are where his test and our gate differ, in three kinds: 146 `(no X)` evidence, 15 onset subjects and 9 measured items. 3 may be real defects in the rules; the other 167 rest on our gate's looser reading, haven't been checked one by one, and depend on a "None of the above" mechanism nobody has tested in the app. Whether VHA can evaluate a rule that needs `(no X)` at all is an open question for Will (see `docs/apc-2026-conversion.md`). On the full branch, 8 of VHA's other test files also fail, apparently because their fixtures expect 2023 rules. An earlier run, under Deno 2.7.5 with type-checking off and those cases waived, passed all 8 test cases (see "What the test result means").

The checkers' agreement is moderate, and agreement between AI models is not evidence that the rules are clinically right. All three checkers called 71% of conditions faithful to the page, and 60% of the in-scope page elements correctly encoded. Most errors they found were flagged by only one of the three.

## Start here

- **`ruleset/apc-adult-2026/`:** per page, named by 2026 page number:
  - `<page>-<slug>.lisp`: the rules (83 files; p181's has no rules, as nothing on that page is representable);
  - `<page>-<slug>-remaining-questions.md`: criteria the rules can't hold, where they fire more or less often than the page, and open questions (83 files);
  - `<page>-<slug>-flowchart.md`: the page's flowchart, written before the rules (70 files).
- **`DECISIONS.md`:** every method choice, with the alternatives and the reason.
- **`load-logs/`:** the compile, seed and test logs, the gate output, the test file as the loader edited it, and the no-waiver test rerun (`rerun-no-waivers/`).
- **`review/index.html`:** the review pages, one per page, for going through the rules against the red box. See "How to review".
- **`body-map/`:** a separate report comparing the rules' findings with VHA's 23 body-map regions.

## Results

| Measure | Result |
|---|---|
| Pages | 83. The red-border scan found 84; p6, the alphabetical index, is excluded |
| Rules | 612: 150 tasks, 91 priority evaluations, 371 diagnosis rules |
| Conditions | 6,224, each citing the page element it comes from (one bullet, box line or flowchart node) and a verbatim quote |
| SNOMED concepts | 1,190 distinct; all resolve in the 2025-12-01 International release (note below) |
| Automated gate | 83 of 83 pages pass with no findings, after a bug in the gate was fixed on 2026-11-05 (see "Limits") |
| Compile and seed | Pass, in a private copy of VHA (main at `211b16110`) with the `(no X)` fix applied during the load |
| Will's PR #1310 test | With no waivers: 5 of 8 test cases pass (Deno counts 8 cases as 12 steps, with the 4 groups), and the 3 coverage checks flag 170 cases where his test and our gate differ. The loader run, with waivers: all 8 pass |
| Review queue | 5,708 items for a person to decide: 615 high, 3,083 medium, 2,010 low (what goes in it: "How each page was made") |
| Cost | $797 at API list prices: 756 agent runs, 27 in a three-page shakedown and 729 in the main run |

Notes:

- **SNOMED.** The 1,190 include concepts VHA's parser adds itself, such as "Clinical finding" and the "No" qualifier. They were looked up under our reimplementation of VHA's rule (active fully specified name, exact match, as in `03_snomed_inferred.ts`).
- **Seed.** The seed log shows 762 rule inserts: the 612 rules here, 9 from VHA's three shared rule files, and 141 "Display medical guidance" tasks that VHA generates in code (`shared/tasks.ts`).

## What the test result means

Two runs of Will's test reached its checks, both in the private build copy at main `211b16110`, with the `(no X)` fix and with `APC_PAGES_NOT_YET_REVIEWED` emptied:

| Run | Deno, type-checking | Known-issue waivers | Result | Logs |
|---|---|---|---|---|
| Loader run, with waivers (2026-11-05) | 2.7.5, off (`--no-check`) | 247: 40 from the builders' known issues, 207 listed by our gate before its fix | all 8 pass | `load-logs/will-test.log` |
| No-waiver rerun (2026-11-05, on the build Mac) | 2.8.0, on | none | 5 of 8 test cases pass; the 3 coverage checks flag 240 failures, 170 distinct cases | `load-logs/rerun-no-waivers/` (run A2, the type-correct patched run) |

The no-waiver run is the informative one: it shows exactly what Will's test makes of the set.

| Coverage check | Cases | What they are |
|---|---|---|
| Every finding a task checks for is used by some rule | 15 | onset subjects: findings used only inside an onset comparison |
| Every finding a priority evaluation uses is checked for | 11 | 7 `(no X)` evidence, 4 measured items |
| Every finding a probable-diagnosis rule uses is checked for | 145 | 140 `(no X)` evidence, 5 measured items |
| Total | 170 | 146 `(no X)`, 15 onset subjects, 9 measured items, on 37 pages |

(The checks list 240 failures. Counted the way the test keys its waivers, by page and expression, that is 15 + 11 + 145 cases; one `(no X)` case appears in two checks, so 170 in all.)

Every case is of one of the three kinds where his test and our gate differ (see "Where Will's test and our gate differ" under "VHA findings from the run"). That sorts them; it doesn't show the rules are right. In 143 of the 146 `(no X)` cases the same page checks for X; Will's own task check states that principle ("a rule keying off of the finding's absence still relies on us having checked for it"), though the two checks that flag these cases don't apply it. In the other 3, X is only a task trigger and is never checked for, so the rule may never fire: two on p34 (the low-risk self-harm rule needs `(no Suicide attempt)` and `(no Intentionally harming self)`) and one on p23 (post-infectious cough needs `(no Difficulty breathing)`). Those 3 may be real defects. The test's other five checks pass:

- the self-reference check;
- the one-file-per-page check;
- the three SNOMED checks, which use VHA's own lookup against its database. By our reading of `allConceptsToLookFor`, they cover 1,111 of the 1,190 concepts. The other 79 rest on our reimplementation (77 body structures, 1 attribute and 1 substance); all 1,190 resolve in the release.

Two edits to the test matter for reading these results:

- **The not-yet-reviewed list is emptied.** `APC_PAGES_NOT_YET_REVIEWED` is the test's skip list. In PR #1310 it holds 52 page numbers from the 2023 edition. Emptying it puts all 83 pages through every check: the stricter setting. In the test's own terms it also declares every page "brought up to standard", which no clinician has confirmed.
- **Waivers, in the loader run.** In the test's own terms, an `APC_KNOWN_ISSUES` entry is an issue that survived a page review; none of the 247 had one. 40 came from the builders' known issues and 207 from our gate's list of differences, made before the gate's fix. Between them they cover all 170 cases: the gate's rows 139, the builders' 31. Thirty of those 31 are qualified `(no X)` cases the old gate couldn't list, which is why the builders declared them; the other 9 builder rows waive nothing. The fixed gate lists all 170 itself, so it needs no builder rows. The test matches a waiver by page and expression, so one row waives that expression in all three coverage checks on that page.

The loader run's pass therefore shows only that the set is consistent with our gate's reading of Will's constraints. The no-waiver rerun shows where the two readings differ. No run has waived exactly the 170 under Deno 2.8.0.

## VHA findings from the run

Line numbers are at main `211b16110`.

| Finding | Where | Effect | What the run did |
|---|---|---|---|
| `(no X)` round trip | `shared/s_expression_inverse.ts:39–40` | Any rule containing `(no X)` crashes whatever loads the compiled rules | Fixed it for the load only |
| Time comparisons | migration `20260905021111` | `>` and `<` are rejected | Wrote `>=` and `<=` |
| Where the test and our gate differ | the three coverage checks | 170 cases flagged, 3 of them possible rule defects | Listed for Will to decide |
| `not` unsupported | `allEvidenceToLookFor` | Throws "Not supported" | Used `(no X)` instead |
| Attribute values not SNOMED-checked | `shared/s_expression_concepts.ts:21–23` | Two unresolved 2023 names pass the test | Our gate checks them |
| Deno version mismatch | `runtime.txt` vs CI and the app Dockerfiles | 2.7.5 vs 2.8.0; the test fails to type-check under 2.7.5 and passes under 2.8.0 | Reran under 2.8.0 |

1. **`(no X)` breaks the database load.**
   - `inverseSExpression` writes `(no X)` keeping the internal "No" value, and the compiler writes the compiled rules that way. The modules that load them (`shared/tasks.ts` and its counterparts for diagnosis rules and priority evaluations) re-parse them at import, and the re-parse fails `no_finding`'s assert. So anything that imports them crashes on a rule containing `(no X)`: the seed, Will's test (the no-waiver rerun's unpatched run B, whose compile step succeeded), and presumably the app.
   - VHA's current rules contain no `(no X)`, so main seeds fine today.
   - The fix is one line: pass `value_snomed_concept: null` alongside `existence: 'Yes'`. Our loader applies it during the load and reverts it afterward. Without it, Will's test can't load the 2026 rules at all. With it, the test's `(no X)` case (a checked-for finding counts as used if a rule uses `(no X)`) passes.
   - Our loader first used `undefined`, which doesn't type-check (TS2322); the loader run's `--no-check` hid that. It now uses `null`.
2. **Time comparisons.** The database's check accepts only `>=` and `<=` in time comparisons, though the rule language allows `>` and `<`. Will's briefing teaches `(< (onset …) (time_ago 3 days))`, which the check rejects. Because only inclusive comparisons (`>=`, `<=`) are allowed, a boundary value can satisfy two rules meant to exclude each other. On p24, exactly 10 minutes counts toward both acute coronary syndrome and stable angina.
3. **Where Will's test and our gate differ.** These are all 170 cases his test flags. For `(no X)` evidence his test applies his briefing's exact-match rule as written, and our gate reads it more loosely; his briefing itself allows `(no X)` in the other direction. Will may intend them; they're listed so he can decide. (In one way the test is looser: since it never sees onset subjects, it never requires a finding used only inside an onset comparison to be checked for.)
   - **`(no X)` evidence.** In the priority-evaluation and probable-diagnosis checks, a finding counts as covered only if the same file checks for it, or uses it in a task's `due_to`, as the exact expression. A check for X doesn't cover `(no X)`. Our gate accepts a check for X, or X as a task's trigger. 146 cases.
   - **Onset subjects.** The subject of an onset comparison isn't counted as evidence (`allEvidenceToLookFor`, `db/models/s_expression_evidence.ts`). Our gate counts it. 15 cases.
   - **Measured items.** Items of a `measure` task aren't counted as checked for; the test has a TODO for this. Our gate counts them. 9 cases.
4. **`not`.** It is documented in `docs/rules-guide.md` (line 398) and the schema accepts it, but `allEvidenceToLookFor` throws "Not supported". The app's evaluator calls the same function, so a rule using `not` would probably fail at run time too (not run). The 2026 set uses no `not`.
5. **Attribute values aren't SNOMED-checked.** `allConceptsToLookFor` yields only an attribute's type, never its value, so the test's SNOMED checks skip finding sites and other values. Our gate checks them. Four 2023 rules, in `21-burns.lisp` and `32-face-symptoms.lisp`, use values that don't resolve: "Eyelid" (the release's name is "Eyelid structure") and "Chest structure" ("Thoracic structure").
6. **Deno version.** `runtime.txt` says 2.7.5, but CI, the main app Dockerfiles and VHA's `CLAUDE.md` use 2.8.0. Under 2.7.5, `deno check` on the test fails with TS2488 at `for (const finding of task_node.to_be_done.value)`. That is line 249 of the PR #1310 file; main's own copy of the test fails the same way, at its line 189. Under 2.8.0 both type-check cleanly. Our loader run followed `runtime.txt` and ran the test with `--no-check`; the no-waiver rerun used 2.8.0 with type-checking on.

## How each page was made

| Stage | Done by | What it does |
|---|---|---|
| Build | Two Opus agents, separately | Follow Will's briefing: page image first, then a flowchart file, the rules and a remaining-questions file, modeled on the gold-standard anaphylaxis page |
| Diff | Script (no model) | Lists every difference between the two builds |
| Reconcile | One Opus agent | Chooses a side, or writes something new, for each difference, and records why |
| Gate | Script (no model) | Checks each page; a finding can pass only as a builder-declared known issue with a reason |
| Check | Six agents: in each direction, one each on three AI models (Fable, Opus and Sonnet) | Page to rules: is each page element encoded, and correctly? Rules to page: is each condition faithful to the page? |
| Scorecard | Script (no model) | Combines the six reports into the review queue |

Notes on each stage:

- **Builders.**
  - Every builder was given Will's rules for the gold standard, anaphylaxis (2023 p20, 2026 p28), as revised in PR #1310, as the model.
  - Builders were instructed not to open Will's other 2023 rules.
  - They were given the 491 SNOMED terms used in VHA's current rules and told to prefer them.
  - For SNOMED lookups they used a local copy of the release, in place of the `vha-snomed` server the briefing names, applying the same lookup rule.
  - The two builds share the briefing, gold standard, vocabulary and element list, so they are separate, not independent.
- **Builder agreement.** On average 79% of conditions were identical in the two builds (lowest 34%). The measure is the Dice overlap of exact condition strings.
- **The gate checks:**
  - VHA's parser, the SNOMED release and the database's limits;
  - provenance: every condition cites a page element and a verbatim quote;
  - element coverage: every page element is encoded or declared out of scope;
  - our reading of Will's six constraints (see "Where Will's test and our gate differ" under "VHA findings from the run").
- **Checkers.** Each was instructed not to look at the others' work or the builders' notes. Each read a copy of the rules with the comments removed.
- **File names.** Page to rules is `forward-*.json` in `checks/<page>/`; rules to page is `backward-*.json`. A condition is a `claim` in the scorecard and queue files.
- **The review queue holds six kinds of item:**

  | Kind | High | Medium | Low | Queued when |
  |---|---|---|---|---|
  | Condition | 95 | 797 | 902 | any checker didn't call it faithful |
  | Page element | 295 | 217 | 449 | the three checkers didn't all agree it was encoded correctly, or all agree it was out of scope and the build left it unencoded |
  | Rule-level problem | 225 | 1,853 | 0 | a checker reported a problem with a whole rule; priority follows the checker's severity |
  | Builder disagreement | 0 | 175 | 659 | the reconciler resolved a difference between the builds |
  | Known issue | 0 | 40 | 0 | a builder declared one |
  | Repair after checking | 0 | 1 | 0 | a script changed rules the checkers had already read |
  | Total | 615 | 3,083 | 2,010 | |

  Elements are high priority if any checker said error or missing; conditions if any said wrong or unsupported, or a checker's vote is missing.

## What the checkers found

Each element got three page-to-rules votes (8,862 in all), and each condition three rules-to-page votes (18,672). For elements, a checker first marked scope. "Borderline" means reasonable people could disagree about whether the element is in scope.

| Votes | Count | Correct / faithful | Partial / imprecise | Missing | Error / wrong | Unsupported |
|---|---|---|---|---|---|---|
| Page to rules, in scope | 3,352 | 74% | 22% | 2.7% | 1.9% | — |
| Page to rules, borderline | 508 | 12% | 17% | 70% | 0.4% | — |
| Page to rules, both together | 3,860 | 66% | 21% | 11.5% | 1.7% | — |
| Page to rules, out of scope | 4,965 | | | | | |
| Page to rules, no verdict | 37 | | | | | |
| Rules to page | 18,672 | 84% | 15% | — | 0.5% (86) | 0.1% (19) |

Of the 4,965 out-of-scope votes, 2,365 were on text outside the boxes that checkers listed as not triage logic.

Counted per item rather than per vote, agreement is weaker:

- **Elements.** All three checkers called 956 elements in scope; they all called 576 of those (60%) encoded correctly. All three called 1,461 elements out of scope. For 44 of these the build had encoded the element anyway, so they are queued.
- **Conditions.** All three called 4,430 of the 6,224 conditions (71%) faithful.
- **Checkers differ.** The three page-to-rules checkers called between 65% and 82% of their in-scope elements correct.
- **Most error votes came from a single checker.** Of the 95 conditions with a wrong or unsupported vote, 87 got one from only one checker. Which errors surfaced depended on which model looked. That fits false alarms and misses by the other two equally well, and none of the flags has been adjudicated. A condition all three called faithful has not been shown correct either.

Common weak spots:

- durations ("lasts ≥ 10 minutes") forced into onset times;
- page criteria with no SNOMED concept;
- lab values the rule language can't hold (e.g. Hb, MCV);
- flowchart routing ("if no, go to …"). Routing arrows are not page elements, so a missing branch can't be voted "missing".

Each page's remaining-questions file lists its cases.

## Compared with Will's 2023 rules

About half of Will's 2023 conditions reappear exactly in the 2026 build, and a third have no exact or SNOMED-related match. The comparison measures agreement, not correctness: the two sets encode different editions, and no clinician has judged either.

46 of the 83 pages have a 2023 rule file, read at VHA main `211b16110`. A condition is counted once per expression and place in the rule (trigger, check-for, priority condition, diagnosis condition, diagnosis or measured item):

| Will's 2023 conditions | Count | Share |
|---|---|---|
| Appear exactly in the 2026 build | 697 | 53% |
| Related through SNOMED only (one main concept an ancestor of the other) | 187 | 14% |
| No exact or related match | 443 | 33% |
| Total | 1,327 | |

The 2026 build has 3,487 distinct conditions on those pages. "Related" requires different main concepts and ignores negation and qualifiers. So conditions that share a main concept but differ in qualifiers, negation or attributes count as neither exact nor related; 113 of the 443 unmatched are like that.

Five things bear on these figures:

- **Most 2023 files are on Will's not-yet-reviewed list.** PR #1310's list covers 45 of the 46 files compared; only p20, the gold standard, is off it. The list exists only in that open PR.
- **Shared vocabulary.** The builders had the SNOMED terms from VHA's current rules, which raises the exact-match rate.
- **The gold-standard page isn't independent.** Every builder had Will's version as the model, and it matches 54 of 55. The comparison uses p20 as on main, before PR #1310 revised it, while the builders saw the revised version. Without p20 the exact-match rate is 643 of 1,272 (51%).
- **Edition changes don't explain the mismatches.** By the 2023-to-2026 page index's rough grouping (`apc-index-2023-to-2026/`), the 29 other pages whose red box changed in substance match 54% exactly (508 of 938). The 15 pages whose red box is unchanged, or changed only in numbers, wording or position, match less: 42% (135 of 321). p93 (2023 p78) has no red-box status and is in neither group; it matches 0 of 13. Conditions cluster by page, so this is a rough comparison, not a test.

Each review page has an "Edition context" tab with that page's comparison. It lists the 2023-only and 2026-only conditions and the related pairs between them.

## Limits

- **No clinical review.**
- **The rules fire more often than the guide in some places and less often in others.**
  - **Less often:** criteria that need lab values or have no SNOMED concept are not encoded. For example, on p44 a patient with Hb < 6 and no other sign is missed.
  - **More often:** durations become onset times and some qualifiers are dropped. For example, on p24 chest pain that "lasts ≥ 10 minutes" is encoded as onset ≥ 10 minutes ago, so pain that has already stopped still counts toward acute coronary syndrome.
  - Each page's remaining-questions file says which, and where.
- **The checks are less independent than "six checkers" suggests:**
  - Opus wrote both builds, did the reconcile, and was one of the three checkers in each direction;
  - all six checkers worked from the same list of page elements;
  - the rules-to-page checkers saw each condition's cited element and quote;
  - keeping builders and checkers from each other's work was instructed, not enforced.
- **Our gate had a bug, fixed on 2026-11-05.**
  - Its `(no X)` pattern (`tools/gate.ts`) didn't recognize `(no X)` when X has a qualifier or finding site, because the "No" value then sits before the qualifier. That form is 65 of the set's 282 `(no X)` uses.
  - It caused 57 false findings on 11 pages: 50 probable-diagnosis evidence never checked for, 6 evidence checked for but never used, 1 priority-evaluation evidence never checked for.
  - The builders declared 36 known issues to get past them, plus 4 on p28 for an onset gap the gate had already closed on 2026-11-04. All 40 reasons blame our tooling. With the pattern fixed, the gate finds nothing on any page and needs none of the 40. Will's test still flags 31 of them, as part of the 170 cases.
  - The fixed gate was rerun over the whole set but not over each page's build history, and the build records still list the 40 known issues.
  - Because a builder could pass any gate finding by declaring a known issue, the gate's pass is only as strong as the reasons given. Here every reason traced to our tooling.
  - The remaining-questions files for the 11 affected pages (p14, p21, p24, p34, p53, p64, p77, p78, p89, p90 and p130) describe the bug as their builders saw it; each now carries a dated note that it is fixed.
- **Four conditions on p28 changed after the checkers read them.** A script repaired their time comparators (`>` to `>=`). One review-queue item covers them. p28's remaining-questions file now says so; the loader run's waiver reasons still describe `>`.
- **The loader run's tooling had two gaps.** It ran Will's test under Deno 2.7.5 with `--no-check`, and its `(no X)` fix used `undefined`, which doesn't type-check. Both are fixed: `tools/load_into_vha.sh` now runs the test as VHA's CI does (Deno 2.8.0, type-checking on, `null` in the fix), excuses nothing unless run with `--waive`, and saves the full list of flagged cases. A test run of the updated loader on the build Mac reproduced the no-waiver result exactly: 5 of 8 test cases, and 170 cases on 37 pages (`load-logs/loader-test/`).
- **The load shows the set compiles, seeds, and meets Will's test except where his test and our gate differ.** It does not show that the app behaves correctly with these rules.
- **The logs in `load-logs/` are from 2026-11-05:** the loader run (seed, compile, test with waivers, gate) and the no-waiver rerun (`load-logs/rerun-no-waivers/`). The 2026-11-04 logs were overwritten. The rule files have not changed since the 2026-11-04 run.
- **The review pages have been tested in headless Chrome, and by eye in Chrome on one page.** Export was tested only in headless Chrome.

## How to review

The review pages have a reviewer's guide (`review/guide.html`), and every column, pane and tab has a "?" that explains it in a sentence and links to the guide.

1. Download the folder and open `review/index.html` in Chrome. It lists the 83 pages with each page's queue size and high-priority count.
2. On a page, first enter your name as **reviewer** and choose your **role**. Both are saved with every decision, and the page reminds you until they're set.
3. The red box from the e-book page runs across the top at full width, in a band about a third of the window tall: scroll inside it, or drag its corner to resize it. Below it, the red box's text, piece by piece, is on the left and the rules on the right. Click a piece of text or a condition to highlight its partner. **hide details** and the red box's title bar collapse the header and the red box to give the panes more room.
4. Decide each element or condition with the buttons on it:
   - conditions, and elements the rules encode: **accept**, **fix** (with a note) or **question**;
   - elements the rules don't encode: **confirm out of scope**, **should be encoded** or **question**.
5. **show structured rules** switches the right pane from English to the rules as written in the rule file, laid out the way a code editor shows them.
6. The **Review queue** tab, at the bottom, lists the items by priority. Click an item to jump to it. Rule-level problems, builder disagreements and known issues have no buttons of their own; record a decision on them as a note on a related condition.
7. Decisions are saved in the browser. If the rules change after a decision, it is flagged for re-confirmation.
8. **Export decisions** writes a decisions file. Send it to Tony, who appends it to `review/decisions.csv` with `tools/merge_decisions.py` (the file is created on the first merge).
