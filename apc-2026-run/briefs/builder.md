# Builder brief: one APC 2026 page as VHA rules

You are a **builder**. You encode one page of the South African Adult Primary Care guide, 2026
edition (APC 2026), as clinical rules in the Lisp language of Virtual Hospitals Africa (VHA).
Another builder is encoding the same page independently. The two builds are then compared by
code, merged, and graded by six blind checkers: three from the page to the rules and three from
the rules to the page. After that, a clinician reviews the result. So the goal is to be faithful
to the page and to record every judgment call honestly, not to look complete. An honest "could
not encode this, because …" is worth more than a confident guess.

`ROOT` below is `/Users/syncytium/Developer/vha-work/apc-2026-full`.

## The standard you are building to

Read these first, in this order:

1. `ROOT/builder-pack/will-briefing.md`: the briefing of VHA's CTO (Will Weiss) for rule authors.
   **It is the standard.** Follow it: the sources of truth in order, what a finished page looks
   like, the six hard constraints, anchoring `due_to`, time-based criteria, the language
   reminders, and the flowchart and remaining-questions formats.
   - It was written for APC **2023** and for authors working inside the VHA repo. Where it names
     repo paths, use the copies listed below. Where it says "`vha-snomed` MCP server", use the
     SNOMED tool below, which applies the same exact-match rule. Where it names its per-page
     checker, use `page_check.sh` below.
2. `ROOT/builder-pack/gold/20-anaphylaxis.lisp`, with `-flowchart.md` and
   `-remaining-questions.md`: Will's gold standard (2023 page 20). Match its completeness and style.
3. `ROOT/builder-pack/language-schemas.ts`: the grammar (zod schemas). `rules-guide.md`: an older
   guide. Its folder layout is stale; its language parts are useful.
4. `ROOT/builder-pack/anchors/`: `common_symptoms.ts`, `warning_signs.ts` and `vitals.ts`, the
   things the app records, which make a `due_to` fire.
5. `ROOT/builder-pack/vocabulary.tsv`: SNOMED terms VHA's current rules already use. Prefer one of
   these when it fits, so that the same idea is written the same way across pages.

## Your inputs for page N

- `ROOT/inputs/2026/pN.png`: the full page at 200 dpi. **Read it first, with the Read tool.** It is
  authoritative for arrows, Yes/No branches and what sits inside the red box.
- `ROOT/inputs/2026/pN-box1.png` (and `-box2`, …): crops of each red box.
- `ROOT/inputs/2026/pN.md` and `pN.json`: the page's text as elements, made by code. Each element
  has a readable `id` and a stable `key` (cite the `key`).
  - **Red-box elements** (`box` ≥ 1): every line inside the red boxes. Box headers are elements too
    (`kind_hint: header`). Every red-box element must be accounted for.
  - **Outside elements** (`box` 0, `kind_hint: outside`): the rest of the page, one per text block.
    Cite them for the page's "X likely" / "consider X" logic and its flowchart. They need no
    accounting if unused. Flowchart text is fragmented into several blocks; a quote may span
    several keys, listed in reading order.
  - The `kind_hint` is a rough guess, often wrong on flowcharts.
- `ROOT/inputs/2026/pN.meta.json`: title, slug, and whether code thinks the page is a flowchart.
  Don't open `ROOT/manifest.json`; it names files you must not read.
- Page text, if you need surrounding wording: `pdftotext -f N -l N -layout "/Users/syncytium/Developer/vha-work/lit/APC 2026 E-book.pdf" -`.
  When the text and the image disagree, the image wins.

**Do not open anything else.** Not the VHA repo (`~/Developer/vha-build`,
`~/Developer/virtual-hospitals-africa`), not any other `.lisp` file except the gold standard, not
`apc-2026-pilot-20261101/`, not the APC 2023 PDF, not other pages' builds, not the other builder's
folder. This keeps the build independent; the comparison with VHA's 2023 rules happens later, by
code. If you think you need something that isn't listed, write that in the remaining-questions
file instead of opening it.

Do not add, remove or change criteria from clinical knowledge. Encode what the page says. Numbers,
comparison directions and units must be exactly the page's.

## SNOMED

Use `ROOT/tools/snomed` (a wrapper for `snomed.py`; it applies VHA's exact rule: a concept exists
only if its name and category match an active fully specified name exactly, case included):

    snomed search purpuric rash        # candidates; every line is a usable (snomed_concept ...) form
    snomed exists "Pallor" "finding"   # YES / NO, with suggestions on NO
    snomed parents "Burn" "disorder"   # the hierarchy, to judge broader or narrower
    snomed children "Rash" "disorder" 30
    snomed is_a "Obstipation" "disorder" "Constipation" "finding"

Never write a concept that `exists` has not confirmed. If nothing fits, don't encode that criterion;
record it under **SNOMED gaps** in the remaining-questions file, and give the element a
`no_snomed_concept` reason in provenance. `finding_site` values are body structures, and they must
resolve too (VHA's own test misses these, so check them yourself).

## Decisions already made for all pages (don't re-decide them)

- **Scope:** the whole page's triage and diagnostic logic, as in Will's briefing: the red box
  becomes the `check_for` task(s) and the priority evaluation(s); each "X likely" on the page
  becomes a `probable` diagnosis rule and each "consider/suspect X" a `possible` one, where the
  language can express the evidence; plus `measure` tasks. **No `manage` tasks**, and no medicines,
  doses or referral steps. These are management elements; account for them as `management_step`.
- **Shock:** where the page writes "Shock/SBP < 80" (with or without the footnote), encode exactly
  that on this page, as the page's own logic (e.g. an `or` of the shock finding and systolic BP
  < 80). Don't build a shared definition of shock, and don't import thresholds from the general
  shock definition unless this page spells them out. Note it under **Decisions made**.
- **BP < 90/60** stays as written where the 2026 page still says it (systolic < 90 or diastolic
  < 60, following Will's convention for this pair).
- **The e-book is the source.** Where it disagrees with the NDOH Summary of Changes, follow the
  e-book; you are not given the summary.
- **Pointer-only boxes** ("Treat as anaphylaxis 28", "Check if the patient needs urgent
  attention 82"): write a `.lisp` file containing only the `;; Page N - Title` comment (and rules
  only if the page itself has triage logic outside the pointer). Account for the pointer elements
  as `cross_reference_only`.
- **Rule descriptions** are database ids in VHA and must be unique across the whole book. Name rules
  for this page's topic, e.g. "Check for urgent pallor/anaemia conditions" or "Urgent: pallor/anaemia
  with danger signs". Never reuse a generic description such as "Urgent: danger signs".
- **File names** use the 2026 page number and the manifest slug: `<slug>.lisp`,
  `<slug>-flowchart.md`, `<slug>-remaining-questions.md`, `<slug>.provenance.json`.
- **Haemoglobin, MCV and other lab values have no unit or observable in the language** (units are
  `%` `bpm` `°C` `cm` `kg` `kg/m²` `mmol/L` `mmHg` `mm`). A criterion that needs one is
  `not_representable`. Encode the rest of its rule if the page's logic still holds without it, and
  list the gap under **Could not model**, with whether the rule then fires more often or less often
  than the page intends. Don't invent a proxy.
- A task's `due_to` may be an `or` of several findings.
- For a complaint that no rule diagnoses at `probable` (e.g. anaemia), use the `clinical_finding`
  form in both the trigger and the priority rule, not `active_condition` (see Will's briefing,
  "Language reminders"). A priority rule's evidence counts as checked for when it appears in a
  task's `check_for` **or** in a task's `due_to` in the same file.
- `page_check.sh` counts a finding as used when a rule uses it as `(no X)` or inside `(onset X)`,
  as Will's briefing says (VHA's own test misses both; that is recorded separately). A measured
  item in a `measure` task counts as checked for. Don't declare these as known issues.
- **Time comparisons use only `>=` or `<=`.** VHA's database rejects `>`, `<` and `=` in an `(onset …)`
  comparison (the language accepts them, but seeding fails). Write "more than / at least 4 weeks"
  as `(>= (onset X) (time_ago 4 weeks))` and "within 3 days" as `(<= …)`; note the change in provenance.
- Don't restructure logic to get past a check. If a check looks wrong, keep the faithful encoding,
  declare it, and say so in your reply.
- Age group is `adult` throughout.

## Provenance (a validator enforces all of this)

`<slug>.provenance.json` ties every atomic condition to the page:

```json
{
  "edition": "2026", "page": 44, "lisp_file": "44-pallor-and-anaemia.lisp",
  "conditions": [
    {"rule": "Urgent: pallor/anaemia with danger signs", "role": "priority_condition",
     "expr": "<canonical form, filled in by the skeleton tool>",
     "element_keys": ["p44-6d7615f6"], "quote": "SBP < 80",
     "confidence": "high | medium | low", "note": "why this encoding; alternatives considered (short)"}
  ],
  "elements_not_encoded": [
    {"element_key": "p44-…", "element_id": "p44-rb1-e12", "text": "…",
     "reason_category": "management_step | flowchart_routing | figure_or_note | cross_reference_only | not_representable | no_snomed_concept | out_of_scope_other",
     "reason": "short"}
  ],
  "known_issues": [
    {"check": "CHECKED FOR BUT NEVER USED AS EVIDENCE", "s_expression": "<exact detail string from page_check>", "reason": "why it stays"}
  ],
  "judgment_calls": [{"topic": "…", "decision": "…", "alternatives": "…", "confidence": "high | medium | low"}]
}
```

- **One entry per atomic condition per rule:** every trigger, `check_for` item, measured item,
  priority condition, diagnosis condition and diagnosis concept. **Don't type `expr` by hand.** Run
  the skeleton tool; it writes every condition in VHA's canonical text, and you fill in
  `element_keys`, `quote`, `confidence` and `note`.
- `quote` must be a verbatim, contiguous substring of the cited elements' texts (several keys are
  joined with one space, in the order you list them). Quote the shortest span that justifies the
  condition, e.g. `"SBP < 80"` or `"Jaundice"`. The text keeps footnote digits (e.g. `Shock1/SBP`);
  quote around them if needed.
- A rule's **trigger** (the presenting complaint) cites the box **header** element, quoting the
  complaint words in it.
- **Every element is accounted for:** cited by at least one condition, or listed in
  `elements_not_encoded` with a category and a reason.
- `known_issues` is only for constraint findings you deliberately leave in place, each with a
  reason. Copy each one into **Checker issues left in place** in the remaining-questions file too.

## How to work

1. Read the briefing, the gold standard, the page image, the box crops and `pN.md`.
2. If the page has a flowchart, Yes/No branches or a multi-step algorithm, write
   `<slug>-flowchart.md` first (Will's format: Mermaid plus a table of decision nodes naming the
   rule behind each).
3. Write `<slug>.lisp` in your output folder.
4. Run the checks, which create `.check/gate.json` in your folder:

       sh ROOT/tools/page_check.sh <your folder> N

5. Write or refresh the provenance skeleton, then fill it in:

       ~/.venvs/vha/bin/python -I ROOT/tools/provenance_skeleton.py <your folder> ROOT/inputs/2026/pN.json

   Rerun it whenever you change the `.lisp`, and once more after filling in citations; it keeps
   what you have filled in and removes from `elements_not_encoded` every element you have since
   cited, so what is left there is exactly what still needs a category and a reason.
6. Write `<slug>-remaining-questions.md` (Will's sections: Decisions made, Could not model, SNOMED
   gaps, Checker issues left in place, Questions for a clinician).
7. Repeat steps 4–6 until `page_check.sh` prints `PASS`. Don't weaken a rule just to pass. If a
   constraint can't honestly be met, keep the faithful encoding and declare it under
   `known_issues`.

`page_check.sh` runs VHA's parser by placing a temporary copy of the gate in
`~/Developer/vha-build` and removing it afterwards. That is expected; you still must not open or
edit anything there yourself. Warnings it prints are not blocking, but read them.

Write only inside your output folder. When done, reply with: the `page_check.sh` summary line,
rule counts (tasks / diagnosis rules / priority evaluations), and your three least-confident
decisions.
