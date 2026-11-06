# Reconciler brief: merge two independent builds of one page

You are the **reconciler** for one page of APC 2026. Two builders, A and B, encoded the page
independently, following `ROOT/briefs/builder.md`. Both builds passed the deterministic checks.
Code has compared them condition by condition (`diff.json` in your task). Your job is to write the
**final** build for the page: for every difference, decide which encoding is more faithful to the
page, or write a better one, and record why. Six blind checkers will then grade your final build,
and a clinician will see every difference you resolved.

`ROOT` is `/Users/syncytium/Developer/vha-work/apc-2026-full`.

## Inputs

- Everything a builder may read (see "Your inputs" and "The standard you are building to" in
  `ROOT/briefs/builder.md`): the page image, box crops, element list, builder pack and SNOMED tool.
- `build/A/<slug>/` and `build/B/<slug>/`: both builds, with their provenance, flowchart and
  remaining-questions files.
- `diff.json`: code's comparison. Conditions are grouped by role (trigger, check_for,
  priority_condition, diagnosis_condition, diagnosis, measured). For each group it lists conditions
  only A has, conditions only B has, and conditions both have, plus the rule descriptions and rule
  types each build uses. Concept differences come with an is-a note where one concept is a
  descendant of the other (`A_narrower` / `B_narrower`).

The same restrictions apply as for builders: don't open the VHA repo, the pilot, the 2023 PDF or
any other `.lisp` file except the gold standard and the two builds.

## What to do

1. Read the page image first, then both builds and `diff.json`.
2. Start from whichever build is more faithful overall. For every difference in `diff.json`:
   - choose **A**, **B**, **both** (when the page supports both conditions), **neither** (when
     neither is supported), or **new** (a better encoding than either);
   - give a one-sentence reason anchored in the page's wording.
   Never resolve a difference by clinical preference. If the page truly doesn't settle it, pick
   the encoding closer to the page's words, mark it `unsettled`, and add it to **Questions for a
   clinician**.
3. Write the final build into your output folder, in the same format as a builder's: `<slug>.lisp`,
   `<slug>.provenance.json`, `<slug>-remaining-questions.md`, and `<slug>-flowchart.md` if either
   build had one or the page needs one. Merge both builders' remaining questions, dropping only
   those your final build resolves.
4. Write `reconcile.json`:

```json
{"page": 44, "base": "A | B",
 "decisions": [
   {"role": "check_for", "difference": "A: (…)  vs  B: (…)", "choice": "A | B | both | neither | new",
    "final_expr": "(…) or empty", "reason": "…", "unsettled": false}
 ],
 "notes": "anything a reviewer should know about the merge"}
```

5. Run `sh ROOT/tools/page_check.sh <your folder> N` and the provenance skeleton tool, as in the
   builder brief, until it prints `PASS`.

Reply with the `page_check.sh` summary line, the number of differences by choice, and every
`unsettled` decision.
