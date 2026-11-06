# Page 170 – Contraception: remaining questions

## Decisions made

- **The red box is management only and is not encoded as rules.** "Give emergency contraception if
  patient had unprotected sex in past 5 days and does not want pregnancy" is followed only by a
  pregnancy test, the choice and dose of Copper IUD or levonorgestrel, drug interactions, repeat
  dosing, starting long-term contraception, PEP (↻ 119) and return advice. Unlike symptom pages, the
  box does not say "give urgent attention", so no `system_priority_evaluation` was written, and since
  no rule on the page consumes any finding from it, no `check_for` task was made either. All seven
  red-box elements are accounted for as `management_step`.
- **One "suspected" rule from the assessment table.** The Pregnancy row says "if pregnancy suspected
  (nausea/breast tenderness/missed period when using combined oral contraceptive), check for
  pregnancy ↻ 174". This becomes `Diagnose possible pregnancy on combined oral contraceptive`
  (`Pregnancy` finding, `possible`) with evidence: uses combined oral contraception **and** any of
  nausea, tenderness of breast, missed period. A `check_for` task triggered by combined oral
  contraceptive use asks for the three symptoms so the rule can fire.
- The rest of the assessment table (STI symptoms → 62, BP ≥ 140/90 → 148, BMI ≥ 25 → 156, breast and
  axillary lumps → 55/42, menopause → 187, HIV → 124/126/119, cervical screening → 70) is routing or
  routine care and is not encoded. These are outside the red box and need no accounting.
- No flowchart file: the page has no flowchart or Yes/No algorithm.

## Could not model

- **Emergency contraception indication.** "Unprotected sex in past 5 days" could be written as
  `(<= (onset (clinical_finding (snomed_concept "Unprotected sexual intercourse" "finding"))) (time_ago 5 days))`,
  but "does not want pregnancy" has no SNOMED finding and the consequence is a manage task, which is
  out of scope for this pass.
- "Patient > 80kg, BMI ≥ 30" in the red box only changes the levonorgestrel dose (management).
- "Advise patient to return for pregnancy test if next period is more than 7 days late": follow-up
  advice; not a rule.

## SNOMED gaps

- "Does not want pregnancy": searched "pregnancy unwanted", "not wanting pregnancy", "wants pregnancy",
  "pregnancy not desired". Nothing fits (`Wanted pregnancy` and `Unplanned pregnancy` describe an
  existing pregnancy). Not encoded.
- "Suspected pregnancy": `Possible pregnancy` (situation) exists, but the rule uses the `Pregnancy`
  finding at `possible` certainty, as the language intends.

## Checker issues left in place

- None.

## Questions for a clinician

- Does "when using combined oral contraceptive" apply to all three signs (nausea, breast tenderness,
  missed period) or only to "missed period"? The rule applies it to all three. The other reading
  would fire more often (nausea or breast tenderness in any patient using contraception).
- `Uses combined oral contraception` is not a recorded common symptom. Will the contraception intake
  record it, so that the task and rule actually fire?
- Should emergency contraception (unprotected sex within 5 days) carry a triage priority? It is
  time-critical, but the page does not say so, so none was encoded.
