# Forward checker brief: from the page to the rules

You are one of **three independent forward checkers** for one page of the South African Adult
Primary Care guide, 2026 edition (APC 2026), encoded as clinical rules for Virtual Hospitals Africa
(VHA). Other agents built the rules. You can't see how, and shouldn't try to find out; you also
can't see the other checkers. Start from the **page** and ask, element by element: did the rules
capture this, and capture it correctly? You are measuring **misses and errors**. Be strict and
specific. A clean result is only useful if it is earned.

`ROOT` is `/Users/syncytium/Developer/vha-work/apc-2026-full`.

## Inputs (only these)

- `ROOT/inputs/2026/pN.png` (the full page, **read it first**), `pN-box*.png` (red-box crops), and
  `pN.md` / `pN.json`: the page's text as elements, with `key`, `id` and a rough `kind_hint`
  (often wrong on flowcharts). Red-box elements have `box` ≥ 1; the rest of the page is in
  `box` 0 elements (`kind_hint: outside`, one per text block; flowchart text is fragmented).
- The rules to check: the `.lisp` file named in your task, with comments removed.
- The house standard: `ROOT/builder-pack/will-briefing.md` (what a finished page should contain;
  **no `manage` tasks**, so management steps are out of scope by design), the gold standard
  `ROOT/builder-pack/gold/20-anaphylaxis.lisp`, and the grammar `ROOT/builder-pack/language-schemas.ts`.
- SNOMED: `ROOT/tools/snomed search|exists|parents|children|is_a …`,
  to judge whether a concept means what the page says, and whether a closer one exists.

Do not open anything else: not the builders' provenance, notes, flowchart or remaining-questions
files, not other checkers' output, not the VHA repo, not the pilot, not other pages.

## What to judge

The rules are meant to encode the whole page's triage and diagnostic logic (Will's briefing): the
red box as check tasks and priority evaluations, every "X likely" as a `probable` diagnosis rule,
every "consider/suspect X" as a `possible` one. Lab values such as haemoglobin and MCV have no unit
in the language, so criteria that need them are `not_representable`.

Judge **every red-box element**. For outside elements (`box` 0), judge only those that carry
triage or diagnostic logic (a criterion, an "X likely", a flowchart decision); list the others in
`outside_not_logic` by key, without a verdict.

## For every judged element (by `key`), decide

1. `scope`:
   - `in_scope`: a criterion, threshold, condition or "X likely" / "consider X" conclusion that the
     language can express and the house standard would encode.
   - `out_of_scope`, with a reason category: `management_step | flowchart_routing | figure_or_note |
     cross_reference_only | not_representable`.
   - `borderline`: reasonable people could disagree; say why.
2. For `in_scope` and `borderline` elements, a `verdict`:
   - `correct`: every part encoded with the right concept, threshold, unit, logic and rule type;
   - `partial`: some parts missing (list them);
   - `error`: encoded but wrong (wrong concept, number, direction, unit, logic, or put in the wrong
     rule). Say exactly what is wrong;
   - `missing`: not encoded at all.
3. `evidence`: the rule description(s) and the s-expression(s) you matched, copied from the file.

Split compound elements into their parts ("Pulse irregular, > 100 or < 50" has three) and judge
each part.

Then look for **rule-level problems** an element-by-element pass misses: a priority rule without
its trigger, criteria from different boxes merged, "and" where the page means "or", a flowchart
branch lost, a check list and a priority rule that disagree, a priority level the page doesn't
justify, a `check_for` item that no rule uses.

## Output

Write the JSON file named in your task:

```json
{"page": 44, "checker": "forward-1",
 "elements": [
   {"element_key": "p44-…", "scope": "in_scope", "scope_reason": "", "verdict": "partial",
    "parts_missing": ["…"], "problem": "", "evidence": ["<rule> :: <s-expression>"],
    "confidence": "high | medium | low"}
 ],
 "outside_not_logic": ["p44-…"],
 "rule_level_problems": [{"rule": "…", "problem": "…", "severity": "high | medium | low"}],
 "summary": "two or three sentences, the most consequential problem first"}
```

Every red-box element key must appear exactly once in `elements`; every outside key must appear
either in `elements` or in `outside_not_logic`. Reply with counts by scope and verdict, and
the three most important problems.
