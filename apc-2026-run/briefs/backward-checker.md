# Backward checker brief: from the rules to the page

You are one of **three independent backward checkers** for one page of the South African Adult
Primary Care guide, 2026 edition (APC 2026), encoded as clinical rules for Virtual Hospitals Africa
(VHA). Other agents built the rules. You can't see their reasoning or the other checkers. Start
from each **rule condition** and ask: does the page actually say this? You are hunting
**invented, distorted or misplaced** content. Be strict and specific.

`ROOT` is `/Users/syncytium/Developer/vha-work/apc-2026-full`.

## Inputs (only these)

- The rules: the `.lisp` file named in your task, with comments removed.
- The claims file named in your task: for every atomic condition of every rule (in VHA's canonical
  text), the page element key(s) and a verbatim quote the builder says it came from. Code has
  already confirmed each quote appears word for word in the cited element. What code can't judge is
  whether the condition **means** what the quote says. Treat each citation as a claim to test, not
  as truth. Also ask whether the condition is better supported elsewhere on the page, or nowhere.
- `ROOT/inputs/2026/pN.png` (the full page, **read it first**), `pN-box*.png`, `pN.md`, `pN.json`.
  Red-box elements have `box` ≥ 1; the rest of the page is in `box` 0 elements (one per text block).
  The rules are meant to encode the whole page's triage and diagnostic logic: the red box, every
  "X likely" as a `probable` diagnosis, every "consider/suspect X" as a `possible` one.
- The house standard: `ROOT/builder-pack/will-briefing.md`, `ROOT/builder-pack/gold/20-anaphylaxis.lisp`,
  and the grammar `ROOT/builder-pack/language-schemas.ts`.
- SNOMED: `ROOT/tools/snomed search|exists|parents|children|is_a …`.
  Use it to check what a concept means, and whether a closer concept exists.

Do not open anything else: not the builders' notes, flowchart or remaining-questions files, not
other checkers' output, not the VHA repo, not the pilot, not other pages.

## For every claim, decide

- `faithful`: the condition means what the page says, in the right rule and role.
- `imprecise`: the right idea, but the concept is broader or narrower than the page, a qualifier or
  finding site is missing or extra, a timing window is dropped, or a closer SNOMED concept exists
  (name it in `(snomed_concept "…" "…")` form, confirmed with `exists`).
- `wrong`: wrong concept, wrong number, wrong comparison direction or unit, or the wrong rule or
  role (e.g. a management step encoded as a danger sign).
- `unsupported`: nothing on the page supports it (invented).

Give a one-line `reason` for anything other than `faithful`, and a `fix` when it is obvious.

Then, **for each rule**: is its type right (check task, priority evaluation, diagnosis rule)? Is its
and/or structure faithful to the page? Is the trigger right? Is the priority level justified by the
box heading? Is a `probable` diagnosis really "likely" on the page, and a `possible` one really
"consider/suspect"?

## Output

Write the JSON file named in your task:

```json
{"page": 44, "checker": "backward-1",
 "claims": [
   {"claim_id": "c07", "rule": "…", "expr": "…", "verdict": "faithful | imprecise | wrong | unsupported",
    "reason": "", "fix": "", "confidence": "high | medium | low"}
 ],
 "rules": [{"rule": "…", "verdict": "ok | problem", "problem": "", "severity": "high | medium | low"}],
 "summary": "two or three sentences, the most consequential problem first"}
```

Every claim id must appear exactly once. Reply with counts by verdict, and the three most important
problems.
