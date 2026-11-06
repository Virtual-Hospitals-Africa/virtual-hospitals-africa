# Page 145 – Diabetes: routine care: remaining questions

## Decisions made

- **Trigger:** the presenting condition is `(clinical_finding (snomed_concept "Diabetes mellitus" "disorder"))`
  in both the `check_for` trigger and the priority rules, because no rule diagnoses diabetes at `probable`.
  Diabetes is not a recorded common symptom or warning sign; the rules fire when diabetes is recorded as a finding.
- **Two priority rules, both `Urgent`:** one for the red-box signs, one for the fingerprick glucose checks
  (glucose < 4; glucose ≥ 11.1 with ketonuria). The page says "give urgent attention"; the arrows to pages
  19, 20 and 24 are cross-references, so no escalation to Emergency.
- **Dehydration:** "Dehydration: dry mouth, poor skin turgor, BP < 90/60, pulse ≥ 100" is encoded as an `or` of
  Dehydration (disorder) and each listed sign alone (systolic < 90 or diastolic < 60, pulse ≥ 100 bpm).
  This fires more often than a reading that requires dehydration to be judged present overall.
- **Glucose ≥ 11.1 with symptoms → 19:** not encoded as its own branch, because each red-box symptom already
  makes the patient Urgent. Recorded under `elements_not_encoded`.
- **Glucose ≥ 11.1 without symptoms → ketone check:** a task checks for Ketonuria whenever diabetes and glucose ≥ 11.1;
  the "without symptoms" condition is not added to the task trigger (checking ketones when symptoms are present is harmless).
- **Or-pairs split:** "Confusion or unusual behaviour", "Weakness or dizziness", "Nausea or vomiting",
  "Thirst or hunger", "Decreased consciousness, drowsiness" each become two findings.
- **Routine-care table:** only waist circumference became a `measure` task (weight, BMI, BP and glucose are routine vitals).
  Everything else in the table (TB, mental health, cancer, substance use, palliative care, eyes, feet, family planning,
  step-up treatment, enalapril, referral) is management or routing to other pages and is not encoded.

## Could not model

- HbA1c targets, urine albumin/creatinine ratio, creatinine/eGFR, potassium, total cholesterol and triglycerides:
  lab values without an observable/unit in the language. Not encoded (outside the red box; routing/management only).
- Waist-hip ratio: no unit for a ratio.
- Timing in the table ("every visit", "at diagnosis, yearly", "3-6 monthly"): the language has no schedule; the waist
  circumference task fires at every encounter where diabetes is recorded (more often than the page intends).
- "Without symptoms" on the ketone branch: would need `(no …)` of every red-box finding; omitted (task fires slightly more often).

## SNOMED gaps

- "Confusion" (finding): not found → `Acute confusion` (VHA's Confusion warning sign).
- "Unusual behaviour": "Unusual change in behavior" is only a synonym → `Abnormal behavior` (finding).
- "Weakness" (finding): not found → `Asthenia` (finding).
- "Shaking" (finding): not found → `Tremor` (finding).
- "Rapid deep breathing" → `Kussmaul's respiration` (finding).
- "Thirst" (finding): not found → `Increased thirst` (finding).
- "Hunger" (finding): not found → `Hungry` (finding).
- "Pulse rate" (observable): not found → `Pulse, function` (VHA's heart-rate vital).

## Checker issues left in place

- None.

## Questions for a clinician

- Is each dehydration sign (e.g. pulse ≥ 100 alone, or dry mouth alone) meant to make a diabetic patient urgent,
  or only when they together indicate dehydration?
- In "fingerprick glucose ≥ 11.1 with symptoms", are "symptoms" the red-box list, or hyperglycaemia symptoms such as
  polyuria and thirst? If the latter, a separate branch is needed.
- Should glucose < 4 be `Emergency` rather than `Urgent` (VHA's warning sign "Glucose less than 3mmol/L" is Emergency)?
- Is Kussmaul's respiration an acceptable reading of "rapid deep breathing", and Tremor of "shaking"?
