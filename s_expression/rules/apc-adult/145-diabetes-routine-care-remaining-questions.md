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

- **Weight and BMI** (listed in the routine-care table) are not in a `measure` task: weight is an adult vital and BMI is computed from height and weight, so both are recorded with the routine vitals, like BP and fingerprick glucose. Only waist circumference, which is not a vital, gets a task.

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
- "Thirst" (finding): not found → `Excessive thirst` (finding), which has the synonym "Thirsty" (sibling `Increased thirst` was the other option).
- "Hunger" (finding): not found → `Hungry` (finding).
- "Pulse rate" (observable): not found → `Pulse, function` (VHA's heart-rate vital).

## Checker issues left in place

- None.

## Questions for a clinician

- Is each dehydration sign (e.g. pulse ≥ 100 alone, or dry mouth alone) meant to make a diabetic patient urgent,
  or only when they together indicate dehydration?
- In "fingerprick glucose ≥ 11.1 with symptoms", are "symptoms" the red-box list, or hyperglycaemia symptoms such as
  polyuria and thirst? If the latter, a separate branch is needed.
- Should glucose < 4, and ketonuria with glucose ≥ 11.1, be `Emergency` or `Very urgent` rather than `Urgent` (VHA's warning sign "Glucose less than 3mmol/L" is Emergency; page 19 may escalate)?
- Is Kussmaul's respiration an acceptable reading of "rapid deep breathing" (or should Tachypnea and Deep breathing be recorded separately), and Tremor of "shaking"?
- "Thirst": is `Excessive thirst` the right concept, or `Increased thirst` (the two builders split; SNOMED siblings)?
