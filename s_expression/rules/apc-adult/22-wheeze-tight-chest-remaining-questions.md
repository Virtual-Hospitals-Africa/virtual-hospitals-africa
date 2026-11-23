# Page 22 – Wheeze/tight chest: remaining questions

## Decisions made

- **Complaint.** "Wheeze/tight chest" is `(or Wheezing Tight chest)`. Neither concept is a recorded
  common symptom or warning sign, so the rules fire only once one of them is recorded (for example
  from another page's `check_for`).
- **Every patient with wheeze/tight chest is Urgent.** The header reads "Give urgent attention to
  the patient with wheeze/tight chest:" with no "and any of", so `Urgent: wheeze/tight chest` uses
  the complaint alone.
- **Life threatening → Emergency.** The page labels this tier "Life threatening", which is an
  explicit escalation (`Emergency: life-threatening wheeze/tight chest`).
- **Severe stays Urgent.** The page gives the severe tier no escalation beyond the header, so
  `Urgent: severe wheeze/tight chest` is also Urgent. As a priority it repeats the base rule, but it
  records the page's severe criteria and makes them used evidence.
- **Mild/moderate** has no rule of its own: it leads only to management and is covered by the base
  Urgent rule.
- **Silent chest** ("tight chest but no wheeze") has no SNOMED concept. It is encoded as the page
  defines it: `(and Tight chest (no Wheezing))`. `(no …)` needs a recorded "No", so a second task,
  `Check for wheeze in tight chest`, asks for wheeze whenever tight chest is recorded.
- **Unable to talk** → `Unable to speak` ("Unable to talk" does not exist). **Unable to talk in full
  sentences** → `Unable to complete a sentence in one breath`. **Confused** → `Acute confusion` (the
  warning-sign form). **Agitated** → `Feeling agitated`.
- **PEFR** is "a percentage of the predicted normal value" (footnote 2), so it is measured as
  `Recorded/predicted peak expiratory flow rate ratio` in `%`, with a `measure` task, and compared
  with < 33 and < 60.
- **Pulse** uses `Pulse, function` in bpm. SpO₂ < 90%, RR > 30 and pulse > 120 keep the page's
  strict comparisons.
- **"Check for anaphylaxis 28"** is read as "suspect anaphylaxis" → `possible` anaphylaxis
  (`Diagnose possible anaphylaxis from sudden wheeze/tight chest`). "Sudden" is the `Sudden onset`
  qualifier on the complaint. The listed features, and the footnote-1 allergens (medication, food,
  insect bite/sting), are added to the `check_for` so the rule can fire. BP < 90/60 is systolic < 90
  or diastolic < 60.
- **Heart failure likely** → `probable` Heart failure from complaint **and** `Orthopnea`
  ("difficulty breathing worse on lying flat") **and** `Leg swelling symptom`.
- No shock definition is involved on this page.

## Could not model

- **Heart failure, second branch: "patient ≥ 50 years with first episode of wheeze/tight chest".**
  The language has no age comparison. Encoding "first episode" alone would make heart failure
  probable for every first episode at any age, so the branch is left out. The rule therefore fires
  **less often** than the page intends (it misses older patients with a first episode and no
  orthopnoea/leg swelling).
- **Reassessment after 1 hour of treatment** (improving: talks normally and RR < 20, or PEFR
  improved by > 20%; worsening: unable to talk normally, RR ≥ 20, or PEFR not improved) and
  **"still present after 3 hours of treatment"**. These depend on time since treatment started and
  on change from a baseline PEFR, which the language cannot express. They only route management, so
  leaving them out changes no priority. Adding "RR ≥ 20" to the severe rule without the treatment
  context would make most patients severe on arrival, so it was not done.
- "Within the past few hours" (footnote 1) for allergen exposure: exposures recorded in the current
  encounter are taken as recent, as on the gold page.
- All management (oxygen, salbutamol, ipratropium, prednisone/hydrocortisone, referral, discharge
  advice) is out of scope for this pass.

## SNOMED gaps

- `Silent chest` (finding): not found. Substitute: `(and Tight chest (no Wheezing))`.
- `Unable to talk` (finding): not found. Substitute: `Unable to speak` (finding).
- No concept for "first episode of wheeze/tight chest" combined with age; `First episode`
  (qualifier value) exists but is unused because the age half cannot be expressed.

## Checker issues left in place

- None.

## Questions for a clinician

- Should the severe tier ("Yes: Severe", referred urgently) be **Very urgent** rather than Urgent? As
  encoded, mild/moderate and severe patients get the same priority.
- Is **Emergency** right for the life-threatening tier, or is "Very urgent" intended?
- Should "patient ≥ 50 years with first episode of wheeze/tight chest" be added once the language can
  compare age? Until then, should a `possible` heart failure on first episode alone be added instead?
- Is reading "check for anaphylaxis" as a `possible` anaphylaxis diagnosis acceptable, given that
  any single feature (e.g. vomiting) with sudden wheeze makes it fire?
- Silent chest relies on a recorded "no wheeze". Is a health worker expected to mark wheeze absent
  when a patient presents with tight chest?
- Silent chest: should it be recorded as absent breath sounds (the usual clinical meaning) rather
  than "tight chest but no wheeze"? (The page's own parenthesis was encoded.)
- Is `Food` (substance) as the exposure agent acceptable, or should the page-20 food list (peanut,
  tree nut, egg, milk, fish) be repeated here?
- Should the anaphylaxis and heart-failure rules also be anchored to `Dyspnea`, since many wheezy
  patients will be recorded only as short of breath?
