# Page 22 – Wheeze/tight chest: remaining questions

## Decisions made

- **Presenting complaint** is `Wheezing` (finding) or `Tight chest` (finding). Neither is a recorded
  common symptom or warning sign, so the rules fire only once one of them is recorded (Dyspnea is
  the nearest common symptom; it is not used as a trigger because the page does not say so).
- **Priority levels.** The red-box header gives urgent attention to *every* patient with
  wheeze/tight chest, so `Urgent: wheeze/tight chest` has the complaint alone as evidence. The
  page's "Life threatening" tier is `Emergency` (explicit escalation). The "Severe" tier
  ("Refer urgently") is a separate `Urgent` rule, `Urgent: severe wheeze/tight chest episode`,
  which records the tier and consumes its findings, but gives no higher level than the header rule.
- **Silent chest** is encoded as the page defines it: `Tight chest` and `(no Wheezing)`. Because
  `(no …)` needs the health worker to mark wheeze "No", and Wheezing cannot be checked for in a task
  that it triggers, a second task `Check for wheeze in the patient with tight chest` asks about it.
- **PEFR** uses `Recorded/predicted peak expiratory flow rate ratio` (observable entity) in `%`,
  following footnote 2 (PEFR as a percentage of predicted). It is not a routine vital, so it has a
  `measure` task.
- **Unable to talk** → `Unable to speak`; **unable to talk in full sentences** → `Unable to complete
  a sentence in one breath`; **confused** → `Acute confusion` (the Confusion warning sign concept).
- **Strict comparisons** are kept as on the page: RR > 30, pulse > 120, pulse < 50, SpO₂ < 90.
- **Anaphylaxis bullet** ("check for anaphylaxis ↻ 28") is a `possible` anaphylaxis rule: sudden-onset
  wheeze/tight chest **and** any of generalised itch/rash, face/tongue swelling, BP < 90/60
  (systolic < 90 or diastolic < 60), dizziness/collapse, abdominal pain, vomiting, or exposure to
  medication/food/insect bite/sting (footnote 1). That diagnosis triggers page 28's checks.
- **Heart failure likely** is a `probable` rule: wheeze/tight chest **and** Orthopnea **and** Leg
  swelling symptom. The "or" is read as `(orthopnea and leg swelling) or (≥ 50 years and first episode)`.
- No `manage` tasks; all treatment, referral, monitoring and discharge text is `management_step`.

## Could not model

- **"Patient ≥ 50 years with first episode of wheeze/tight chest"** (heart failure likely): the
  language has no age comparison. The branch is left out, so the heart-failure rule fires *less often*
  than the page intends. Encoding "first episode" without the age would fire more often, so it was not done.
- **Reassessment after 1 hour of treatment** (improving vs worsening, RR < 20 / ≥ 20, "PEFR improved
  by > 20%", wheeze still present after 3 hours): response to treatment over time and relative change
  in PEFR cannot be expressed; these steps only route management.
- **"Within the past few hours"** (footnote 1): exposures are not time-compared; an exposure recorded
  in the encounter is taken as recent (as on gold page 20).
- **"Sudden"** wheeze/tight chest is the `Sudden onset` qualifier, not a time comparison.

## SNOMED gaps

- "Silent chest": no concept (`Silent chest` finding: NO). Encoded from the page's own definition.
- "Possible allergen": no general allergen substance (`Allergen` exists only as an attribute);
  footnote 1's medication, food and insect bite/sting used instead.
- "Unable to talk in full sentences": no exact concept; `Unable to complete a sentence in one breath` used.

## Checker issues left in place

- None.

## Questions for a clinician

- Should the "Severe" tier be `Very urgent` rather than `Urgent`, and the "Life threatening" tier
  `Emergency` rather than `Very urgent`?
- Silent chest: should it be recorded as absent breath sounds (the usual clinical meaning) rather
  than "tight chest but no wheeze"?
- Is `Food` (substance) as the exposure agent acceptable, or should the page-20 food list (peanut,
  tree nut, egg, milk, fish) be repeated here?
- Should the anaphylaxis and heart-failure rules also be anchored to `Dyspnea`, since many wheezy
  patients will be recorded only as short of breath?
