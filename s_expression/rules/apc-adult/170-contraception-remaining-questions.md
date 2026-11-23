# Page 170 – Contraception: remaining questions

Final build (reconciled). Builders A and B produced the same nine conditions and the same two rules.
This file merges both builders' notes and questions.

## Decisions made

- **The red box is management only.** "Give emergency contraception if patient had unprotected sex
  in past 5 days and does not want pregnancy" is the indication for a medicine or device (Copper IUD or
  levonorgestrel). It is followed by a pregnancy test, doses, method changes for weight/BMI/interacting
  drugs, repeat dosing, starting long-term contraception, a PEP pointer (119) and return advice. It
  does not say "give urgent attention" and states no priority or diagnosis, so no `check_for` task or
  priority evaluation is built from it. All seven red-box elements are accounted for as `management_step`.
- **Pregnancy suspicion is encoded as a `possible` diagnosis.** The Pregnancy row says "if pregnancy
  suspected (nausea/breast tenderness/missed period when using combined oral contraceptive), check
  for pregnancy 174". This becomes `Diagnose possible pregnancy on combined oral contraceptive`:
  `(and Uses combined oral contraception (or Nausea, Tenderness of breast, Missed period))`. A
  `check_for` task triggered by COC use asks for the three signs so the rule can fire.
- "When using combined oral contraceptive" is applied to all three signs (the narrower reading).
- The diagnosis concept is `Pregnancy` (finding) at `possible` certainty, as used elsewhere in VHA's
  rules, rather than the narrower `Pregnancy on oral contraceptive` (finding) or the
  `Possible pregnancy` (situation).
- These are not encoded because they are cross-references, routine care or management: STI symptoms
  → 62, suitability → 172, missed pills/side effects → 171, BMI ≥ 25 → 156, BP ≥ 140/90 → 148 and
  COC/injectable avoidance, breast lumps → 55, axillary lumps → 42, menopause → 187,
  HIV → 124/126/119, cervical screening → 70, and the advice section. BP, weight and height are
  routine vitals, so there is no `measure` task.
- The page has no flowchart or Yes/No algorithm, so there is no flowchart file, and no shock,
  BP < 90/60 or time-comparison logic.

## Could not model

- **Emergency contraception indication.** "Unprotected sex in past 5 days" could be written as
  `(<= (onset (clinical_finding (snomed_concept "Unprotected sexual intercourse" "finding"))) (time_ago 5 days))`.
  But "does not want pregnancy" has no SNOMED finding, and the consequence is a manage task, which is
  out of scope for this pass.
- "Patient > 80kg, BMI ≥ 30" in the red box only changes the levonorgestrel dose, which is management.
- "Advise patient to return for pregnancy test if next period is more than 7 days late" is follow-up
  advice and can't be represented as a rule.
- The pregnancy test result (a lab value) has no observable in the language. The encoded rule doesn't need it.

## SNOMED gaps

- None among the encoded concepts. These were confirmed: `Uses combined oral contraception` (finding),
  `Nausea` (finding), `Tenderness of breast` (finding), `Missed period` (finding), `Pregnancy` (finding).
- "Does not want pregnancy": searched "pregnancy unwanted", "not wanting pregnancy", "wants pregnancy"
  and "pregnancy not desired". Nothing fits: `Wanted pregnancy` and `Unplanned pregnancy` describe an
  existing pregnancy. Not encoded.

## Checker issues left in place

- None.

## Questions for a clinician

- Does "when using combined oral contraceptive" apply to all three signs (nausea, breast tenderness,
  missed period) or only to "missed period"? The rule applies it to all three. The other reading
  would fire more often, for example on nausea or breast tenderness in any patient using contraception.
- Should nausea or breast tenderness alone raise suspicion of pregnancy in a patient on injectable
  or implant contraception, or only on the combined pill, as the page's parenthesis reads?
- `Uses combined oral contraception` is not a recorded common symptom. Will the contraception intake
  record it, so that the task and rule actually fire?
- Should emergency contraception (unprotected sex within 5 days) carry a triage priority? It is
  time-critical, but the page gives none, so none is encoded.
- Should the STI symptom row (vaginal discharge, ulcers, lower abdominal pain) produce a
  `possible` STI diagnosis here, or is page 62's own logic enough?
