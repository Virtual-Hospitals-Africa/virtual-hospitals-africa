# APC Adult page review: briefing for rule authors

This is the working brief for bringing every file under `s_expression/rules/apc-adult/` up to the
standard of `20-anaphylaxis.lisp`, page by page, against the Adult Primary Care (APC) 2023 clinical
tool (`static/pack-sa.pdf`). Read `docs/rules-guide.md` first; this document only adds what that
guide does not cover.

## Sources of truth, in order

1. **The page image**: `static/medical-resources/za/primary-care/adult/thumbnails/full-size/<page>.png`.
   Read it with the Read tool. This is authoritative for the flow of arrows, Yes/No branches and
   what sits inside the red box. Earlier passes worked from PDF text and lost the flowchart logic.
2. **SNOMED CT via the `vha-snomed` MCP server** (`search_snomed`). Every concept name and category
   you write must come back from a search. Names are matched exactly and case-sensitively against
   the database. Never assume a concept exists from memory.
3. **The gold standard**: `s_expression/rules/apc-adult/20-anaphylaxis.lisp` plus its companion
   `20-anaphylaxis-flowchart.md`. Match its level of completeness and its style.
4. PDF text for the page (extracted with `pdftotext -layout`) is a convenience for copying exact
   wording. When it disagrees with the image, the image wins.

## What a finished page looks like

For each page there are up to three files, all named `<page>-<slug>*` in `s_expression/rules/apc-adult/`:

| File | When |
|---|---|
| `<page>-<slug>.lisp` | Always, if the page has any triage or diagnostic logic |
| `<page>-<slug>-flowchart.md` | Whenever the page has a flowchart, Yes/No branches, or a multi-step algorithm. Written **before** the rules so the rules can be traced back to it |
| `<page>-<slug>-remaining-questions.md` | Whenever anything was unclear, a judgment call was made, a SNOMED concept could not be found, or a checker issue is being left in place |

Only one `.lisp` file may exist per page number (a test enforces this). Use the page title for the
slug, lower-case and hyphenated (e.g. `43-breast-symptoms.lisp`).

A finished `.lisp` file contains, in this order, with `;; Page N - Title` comments:

1. **`check_for` task(s)** triggered by the presenting complaint. The list must include every item
   in the red box and every discriminating finding that the page's algorithm uses to reach a
   "likely" diagnosis. Group by theme with blank lines. Use qualifiers (`Sudden onset`,
   `Severe (severity modifier)`, `New`, `Known present`, `Current`) to express the page's wording.
2. **`measure` task(s)** where the page tells the health worker to measure something that is not
   already a routine vital (temperature, pulse, respiratory rate, BP, SpO₂, glucose are routine and
   need no task). Units available: `%` `bpm` `°C` `cm` `kg` `mmol/L` `mmHg` `mm`.
3. **`system_diagnosis_rule`(s)**:
   - The page says "**X likely**" → `probable` diagnosis of X, with evidence following the page's
     logic (`and` / `or` / `any2`).
   - The page says "consider X", "suspect X", "may be X", "exclude X" → `possible` diagnosis of X.
   - Anaphylaxis-style pre-screen: a `possible` rule whose evidence is broad, whose only purpose is
     to trigger the `check_for` task, is a good pattern when the presenting complaint is not one of
     the recorded common symptoms or warning signs.
4. **`system_priority_evaluation`(s)**. The red box ("Give urgent attention to the patient with …
   and any of:") becomes `Urgent`, structured as `(and <presenting complaint> (or …red box items…))`.
   Where the red box names a likely diagnosis for a subset of criteria, write a `probable` diagnosis
   rule for it and reference `(active_condition X)` from the priority rule. Use `Emergency` or
   `"Very urgent"` only where the page explicitly escalates (e.g. "Emergency patient", CPR, airway,
   BP < 90/60 with altered consciousness) or where the corresponding warning sign in
   `shared/warning_signs.ts` already carries that level. Note `"Very urgent"` must be quoted.
5. **Do not add `manage` tasks** in this pass (decided 2026-09-04). Leave the existing ones on page 20.

Age is `adult` for everything in this directory.

## Hard constraints from `test/shared/compiled_s_expressions.test.ts`

Run `deno task test test/shared/compiled_s_expressions.test.ts` (or the per-page checker below).
The tests enforce:

1. Every SNOMED concept in every rule exists (name + category, exact match).
2. **Every finding in a `check_for` is used as evidence** somewhere: in the `due_to` of any
   `system_diagnosis_rule` or `system_priority_evaluation` in any file, or in the `due_to` of a
   different task. Usage as `(no …)` also counts. If you check for it, a rule must consume it.
   If the page really does not use a finding for anything, remove it from the `check_for`.
3. A task must not `check_for` a finding that is already in its own `due_to`.
4. **Every piece of evidence in a `probable` diagnosis rule must be checked for in the same file**
   (in a `check_for` or as a task `due_to`), unless it is a routine vital, a warning sign, a common
   symptom, or `(active_condition Fever)`. `possible` rules are exempt.
5. Every piece of evidence in a `system_priority_evaluation` must be checked for in the same file,
   or be a vital/warning sign/common symptom, or be `(active_condition X)` where X is diagnosed at
   `probable` by some rule in any file.
6. One `.lisp` file per page number.

Evidence matching is by exact s-expression string, so `(clinical_finding (snomed_concept "Backache"
"finding"))` and the same finding with a qualifier are different pieces of evidence. If a rule needs
the qualified form, check for the qualified form.

## Per-page checker

A fast checker that mirrors the tests but reads the `.lisp` files straight from disk (so in-progress
edits count) and reports one page at a time:

```
/private/tmp/claude-501/-Users-willweiss-dev-morehumaninternet-virtual-hospitals-africa/7745545d-4933-4e0b-9bb7-34e5e52d93eb/scratchpad/check_page.sh 63
/private/tmp/claude-501/-Users-willweiss-dev-morehumaninternet-virtual-hospitals-africa/7745545d-4933-4e0b-9bb7-34e5e52d93eb/scratchpad/check_page.sh 20 63 28
/private/tmp/claude-501/-Users-willweiss-dev-morehumaninternet-virtual-hospitals-africa/7745545d-4933-4e0b-9bb7-34e5e52d93eb/scratchpad/check_page.sh --all
```

It reports `MISSING SNOMED CONCEPT`, `CHECKED FOR BUT NEVER USED AS EVIDENCE`, `SELF-REFERENTIAL
check_for`, `PROBABLE DIAGNOSIS … NOT CHECKED FOR`, `PRIORITY EVALUATION … NOT CHECKED FOR`, and
`PARSE ERROR`. A parse error in **any** file stops everything, because the compile step is global.
If the parse error is in a file that is not yours, another author is mid-edit: wait and re-run.
Never edit another page's files.

## Anchoring `due_to` so rules actually fire

A rule only runs when its `due_to` matches something the system records. Anchor to:

- Common symptoms (`shared/common_symptoms.ts`): Fever, Cough, Nasal discharge, Sore throat,
  Headache, Fatigue, Dyspnea, Nausea, Finding of vomiting, Diarrhea, Dizziness, Muscle pain,
  Insect bite - wound, Backache, Constipation. Use `(active_condition (snomed_concept "Fever"
  "finding"))` for fever; for the others a plain `clinical_finding` is the recorded form.
- Warning signs (`shared/warning_signs.ts`), e.g. Chest pain, Seizure, Collapse-related concepts,
  Poisoning, Burn of face, Dyspnea + Severe qualifier, Aggressive behavior, Bleeding + Uncontrolled.
- A `possible` diagnosis produced by another rule: `(diagnosis (snomed_concept X) possible)`.
- Another page's `check_for` finding. Findings recorded on one page are legitimate triggers on
  another (e.g. page 28 Collapse checks for Seizure, which triggers page 19).

If the presenting complaint is none of these (e.g. "Breast symptoms"), the `check_for` task's
`due_to` should still be the most natural `clinical_finding` for the complaint, and the
remaining-questions file should note that the complaint is not yet a recorded common symptom.

## Time-based criteria

`(>= (onset <subject>) (time_ago 24 hours))` means "onset was at least 24 hours ago". `(< (onset
<subject>) (time_ago 3 days))` means "onset within the last 3 days". The subject is a
`clinical_finding` or an `active_condition`. Onset is captured when a finding is recorded, so this
works in `due_to` positions. It cannot appear inside `check_for`. See
`48-constipation-and-anal-symptoms.lisp` for a live example.

## Language reminders not in the rules guide

- `(finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept
  "Fish" "substance"))` records exposure to a substance; `(allergy (snomed_concept "Fish"
  "substance"))` records a known allergy. Page 20 pairs them.
- Family history uses `situation` concepts, e.g. `(clinical_finding (snomed_concept "Family history
  of ischemic heart disease" "situation"))`.
- Known chronic conditions can be expressed as `(clinical_finding (snomed_concept "Diabetes
  mellitus" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))` in a
  `check_for`, and as `(active_condition (snomed_concept "Diabetes mellitus" "disorder"))` in a
  `due_to`. If you use `active_condition` in a probable rule, the same file must still check for a
  form that the test recognises; the simplest is to use the same `clinical_finding` form in both.
- Descendants match automatically in `due_to`, so prefer the general concept when the page is
  general ("rash") and the specific one when the page is specific ("purpuric rash").
- Body-site variants: use `finding_site` on a general finding when SNOMED lacks a precoordinated
  concept, e.g. `(clinical_finding (snomed_concept "Swelling" "finding") (finding_site
  (snomed_concept "Tongue structure" "body structure")))`.
- Laterality/side pairs (Left flank pain / Right flank pain) are fine when the page cares; otherwise
  use the sideless concept.
- `any2` = at least two of the children. Nest `or` inside it to make a group count once.

## Flowchart file format

Markdown with a Mermaid block, plus a table of the decision nodes. Every node in the flowchart that
carries clinical content should be traceable to a rule in the `.lisp` (name the rule description in
the table). Example: `20-anaphylaxis-flowchart.md`.

## Remaining-questions file format

Markdown. Sections: **Decisions made** (what you chose and why), **Could not model** (page content
the language cannot express, with the closest approximation if any), **SNOMED gaps** (concepts you
looked for and did not find, with the substitute used), **Checker issues left in place** (exact
s-expression strings, so they can be copied into `APC_KNOWN_ISSUES` in the test), **Questions for a
clinician**.

## Reporting back

When you finish a page, report: files written; rule counts (tasks / diagnosis rules / priority
evaluations); the checker's final output for your page; and the exact list of checker issues you
are leaving in place with a one-line reason each. Do not edit the test file, the compiled
`s_expression/*.ts` files, `docs/`, or any other page's files.
