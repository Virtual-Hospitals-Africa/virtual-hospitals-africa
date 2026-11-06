# Page 19 – Assess and manage glucose: remaining questions

## Decisions made

- **Glucose is the routine vital.** Every glucose threshold is `Blood glucose status` (observable
  entity) in mmol/L, so no `measure` task is needed for the random fingerprick glucose.
- **"< 4 if diabetes"** is encoded as `(and (< glucose 4) known diabetes)`, with known diabetes as
  `(clinical_finding "Diabetes mellitus" (qualifier "Known present"))`. A small task
  (`Check for known diabetes when glucose is low`, trigger glucose < 4) asks for it.
- **"Patient has hypoglycaemia"** → `probable` Hypoglycemia. **"Diagnose diabetes"** → `probable`
  Diabetes mellitus. Both pages state these as facts; `definite` was considered.
- **Red box 1 "Give urgent attention"** → `Urgent`, using the glucose criteria directly rather than
  `(active_condition Hypoglycemia)`, which would also fire on a past history of hypoglycaemia. VHA's
  "Glucose less than 3mmol/L" warning sign carries `Emergency`; the page says urgent, so Urgent is used.
- **Red boxes 2 and 3** → one `Urgent` rule: glucose ≥ 11.1 **and** any red box 2 item, or ketones
  present (both lead to red box 3, "Refer urgently"). Temperature ≥ 38°C is the routine vital.
  "Nausea or vomiting" is split into Nausea and Finding of vomiting. "Rapid deep breathing" is
  Kussmaul's respiration.
- **Diabetes diagnosis from the random glucose path:** glucose ≥ 11.1 **and** `(no Ketonuria)`
  **and** `(no known diabetes)` **and** any footnote 8 symptom. The page reaches "check urine for
  ketones" only after red box 2 = No, so the recorded "No ketones" stands in for that path rather
  than writing `(no …)` for all ten red box 2 items.
- **"Is patient alert?"** and the 15-minute recheck bands in red box 1 only select management, so
  they are accounted for as routing, not encoded.
- **Footnote 7 vs 8 in the fasting box.** The fasting "≥ 7: Does have symptoms⁷ of diabetes?" points
  to footnote 7 (dehydration signs), probably meaning footnote 8. The fasting branch is not encoded
  anyway (below), so this did not change any rule.

## Could not model

- **Fasting blood glucose branch** (check FBG after an 8-hour fast or 2-h OGTT; < 6.1, 6.1-6.9
  "impaired fasting glucose", ≥ 7 with or without symptoms, repeat after 1 week, ≥ 7 again →
  diagnose diabetes). No observable exists for a fasting glucose (`Fasting blood glucose` observable
  entity: not found; only the procedure `Fasting blood glucose measurement`), and a repeat
  measurement cannot be told apart from an earlier one. Reusing `Blood glucose status` would collide
  with the random-glucose rules. Consequence: no Impaired fasting glycemia rule, and the diabetes
  diagnosis fires **less often** than the page intends (it misses fasting-glucose diagnoses).
- **Glucose 3-6 (risk factors) and 6.1-11 bands.** Their only outputs are a fasting glucose check or
  a recheck, so nothing is encoded for them. The risk factors (BMI ≥ 25, waist by sex, the list of
  nine) are not checked for, because no rule could use them. Waist circumference by sex would also
  need a sex criterion, which the language lacks.
- **"If < 35 years, type 1 diabetes likely"**: the language has no age criterion, so there is no
  Diabetes mellitus type 1 rule (fires **less often**: never).
- **"thirst (especially at night)"** and **"periodic changes in vision"**: the timing words are not
  encoded (Excessive thirst; Visual disturbance), so those symptoms count at any time (fires **more
  often**).
- All medicines, doses, fluids, insulin, rechecks, referrals and "routine care 145" are management.

## SNOMED gaps

- `Tiredness` (finding): not found → `Fatigue` (finding).
- `Thirst` (finding): not found (only `Thirst, function` observable) → `Excessive thirst` (finding).
- `Rapid breathing` (finding): not found → `Kussmaul's respiration` (finding), which is rapid deep breathing.
- `Fasting blood glucose` (observable entity): not found → fasting branch not encoded.
- `Skin infection` (disorder): not found; frequent infections → `Recurrent infectious disease` (disorder).

## Checker issues left in place

- `PROBABLE DIAGNOSIS EVIDENCE NOT CHECKED FOR`:
  `(no (finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Diabetes mellitus" "disorder") (snomed_concept "No" "qualifier value") (qualifier (snomed_concept "Known present" "qualifier value"))))`
  The known-diabetes finding is in the `check_for` of `Check for urgent high glucose conditions`;
  the checker does not match the `(no …)` form of a *qualified* finding (the unqualified
  `(no Ketonuria)` in the same rule passes). "If not known diabetes" needs the negation.

## Questions for a clinician

- Should glucose < 3 mmol/L be `Emergency` (as VHA's warning sign has it) rather than the page's
  "urgent attention"?
- Dehydration in red box 2 is defined by footnote 7 (thirst, dry mouth, poor skin turgor,
  BP < 90/60, pulse ≥ 100). Should any one of those signs make a hyperglycaemic patient urgent, or
  only a recorded "Signs of dehydration"?
- In the fasting box, "symptoms⁷ of diabetes" points at the dehydration footnote. Is footnote 8
  meant?
- Should a diabetes diagnosis from glucose ≥ 11.1 require every red box 2 item to be recorded as
  absent, or is "No ketones" enough?
