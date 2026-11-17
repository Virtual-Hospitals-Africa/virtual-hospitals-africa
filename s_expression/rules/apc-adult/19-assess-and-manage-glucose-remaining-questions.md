# Page 19 – Assess and manage glucose: remaining questions

## Decisions made

- **Trigger is the routine glucose vital.** Every rule hangs off the random fingerprick glucose,
  `(measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L)`, which the app
  records as a vital. No `measure` task is needed for it.
- **Hypoglycaemia** ("Glucose < 3 (< 4 if diabetes) Patient has hypoglycaemia") is a `probable`
  diagnosis: glucose < 3, or glucose < 4 with known diabetes (Diabetes mellitus + Known present).
  The page states it outright; `probable` was chosen so the red-box-1 Urgent rule can use
  `(active_condition Hypoglycemia)`.
- **Red box 1 ("Give urgent attention")** → `Urgent: hypoglycaemia on fingerprick glucose`. The page
  does not escalate further for the non-alert patient, so no Very urgent/Emergency level is used.
  "Is patient alert?" and everything under it is treatment routing (oral vs IV glucose, thiamine,
  15-minute recheck, refer) and is accounted for as management/flowchart routing.
- **Red box 2** → `check_for` of its items when glucose ≥ 11.1, and `Urgent: glucose 11.1 or more
  with danger signs` (glucose ≥ 11.1 and any item). Temperature ≥ 38 °C is a routine vital.
  "Nausea or vomiting" is split into Nausea and Finding of vomiting. "Dehydration⁷" is the concept
  Dehydration; its footnote signs are not turned into separate criteria.
- **Ketones present** leads to red box 3 ("Refer urgently") → `Urgent: glucose 11.1 or more with
  urine ketones`. Urine ketones are recorded as the finding Ketonuria; "No ketones" is `(no Ketonuria)`.
- **Diagnose diabetes** is encoded only for the random-glucose route: glucose ≥ 11.1, no ketonuria,
  not known diabetes, and any footnote-8 symptom → `probable` Diabetes mellitus. The "No" answer to
  red box 2 that precedes the ketone check is not required by the rule, so it can also fire when
  urgent signs are present (fires more often than the page path; that patient is Urgent anyway).
- The "≥ 7 Does have symptoms⁷ of diabetes?" node cites footnote 7 (dehydration signs); read as a
  misprint for footnote 8. It only matters for the fasting branch, which is not modelled.
- **Reconciled build (builder B's encoding).** Builder A's alternatives were weighed: A used Acute
  confusion and Signs of dehydration; this build keeps Clouded consciousness (SNOMED's concept for
  "Confusion", broader) and Dehydration (the page's word). A's Urgent hypoglycaemia rule repeated the
  glucose thresholds; this build uses `(active_condition Hypoglycemia)` as Will's briefing asks.
- No shock threshold is encoded: "shock/SBP < 80" appears only in footnote 9 as a fluid-dosing
  instruction (management).

## Could not model

- **Fasting blood glucose branches** (check FBG after an 8-hour fast / 2-h OGTT; < 6.1, 6.1-6.9
  "impaired fasting glucose", ≥ 7; repeat after 1 week / 1 year / 3 years; Diagnose diabetes via
  two fasting values ≥ 7 or one with symptoms). SNOMED has no fasting-glucose *observable entity*
  (only procedures such as "Fasting blood glucose measurement"), and `measurement` takes no
  qualifier, so a fasting value cannot be told from a random one. No proxy used. Effect: diabetes
  and impaired fasting glycaemia are diagnosed less often than the page intends.
- **Risk-factor screen** for glucose 3-6 (BMI ≥ 25 / waist ≥ 94 cm man, ≥ 80 cm woman, and ≥ 1
  risk factor): it leads only to the fasting-glucose check above and to rechecking schedules, so it
  is not encoded. Sex-specific waist thresholds would also need a sex criterion.
- **"If < 35 years, type 1 diabetes likely"**: the language has no age-in-years comparison (only
  age groups), so no `probable` type 1 diabetes rule. Fires less often than the page (never).
- **15-minute recheck thresholds in box 1** (< 3 (< 4) / ≥ 3 (≥ 4)): a repeat glucose after
  treatment cannot be distinguished from the first reading; these only route treatment.
- "Thirst (especially at night)" and "periodic changes in vision": the qualifiers "at night" and
  "periodic" are not expressed.

## SNOMED gaps

- Fasting blood glucose (observable entity): none exists. Not encoded.
- "Confusion" (finding): not an FSN; used Clouded consciousness (its SNOMED synonym is Confusion).
- "Thirst" (finding): not an FSN; used Excessive thirst.
- "Tiredness" (finding): not an FSN; used Fatigue.
- "Weight loss" (finding): not an FSN; used Unexplained weight loss (matches the page wording).
- "Rapid deep breathing": used Kussmaul's respiration.
- "Frequent infections": used Recurrent infectious disease (disorder).

## Checker issues left in place

- None.

## Questions for a clinician

- Should a hypoglycaemic patient who is **not alert** be escalated above Urgent (e.g. Emergency /
  Very urgent), or is the page's "Give urgent attention" enough?
- Is it right that the system diagnoses diabetes from one random glucose ≥ 11.1 plus a single
  symptom (e.g. fatigue alone), as the page's flow implies?
- Should the hyperglycaemia + urgent signs / ketones patient (red box 3) carry a named diagnosis
  (diabetic ketoacidosis or hyperosmolar state)? The page names none, so none was encoded.
- Should glucose < 3 mmol/L be `Emergency` (as VHA's "Glucose less than 3mmol/L" warning sign has
  it) rather than the page's "urgent attention"?
- `(active_condition Hypoglycemia)` in the Urgent rule could also match a recorded past
  hypoglycaemia. Should the Urgent rule instead use today's glucose reading directly?
- Dehydration in red box 2 is defined by footnote 7 (thirst, dry mouth, poor skin turgor,
  BP < 90/60, pulse ≥ 100). Should any one of those signs make a hyperglycaemic patient urgent, and
  is Dehydration (disorder) or Signs of dehydration (finding) the right recorded form?
- Should a diabetes diagnosis from glucose ≥ 11.1 require every red box 2 item to be recorded as
  absent, or is "No ketones" enough?
- Is Kussmaul's respiration the right recorded form for "rapid deep breathing", and Clouded
  consciousness for "confusion"?
