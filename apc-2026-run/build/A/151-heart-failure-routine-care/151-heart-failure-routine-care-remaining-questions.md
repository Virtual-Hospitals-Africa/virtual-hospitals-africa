# Page 151 – Heart failure: routine care: remaining questions

## Decisions made

- **No flowchart file.** The page has a red box and tables, but no Yes/No branches or algorithm.
- **Trigger is heart failure itself.** `(clinical_finding (snomed_concept "Heart failure" "disorder"))` is used in the `check_for` task, the `measure` task and the priority rule. No rule on this page diagnoses heart failure at `probable` ("A doctor must confirm the diagnosis"), so the `clinical_finding` form is used rather than `active_condition`. Heart failure is not a recorded common symptom or warning sign.
- **Red box → `Urgent`**: heart failure AND any of chest pain, rapid worsening of symptoms, respiratory rate ≥ 30, difficulty breathing, BP < 90/60 (systolic < 90 or diastolic < 60), new wheeze. Nothing on the page escalates beyond Urgent.
- **"Rapid worsening of symptoms"** is encoded literally as heart failure qualified `Worsening` and `Rapid`. "Decompensated chronic heart failure" (disorder) exists, but using it would be a clinical reinterpretation.
- **Weight every visit** → a `measure` task for Body weight (kg). BP and pulse are routine vitals and need no task.
- **Footnote 3 ("… shock likely")** is not encoded. It explains "cardiogenic shock" in a carvedilol contraindication (management), it doesn't say whether one sign or all signs are needed, and the brief says not to build a shared shock definition.
- **Same-day referral items** ("If fainting/blackouts, refer same day", "If new irregular pulse, refer same day") are referral steps outside the red box, so they aren't encoded.

## Could not model

- "Assess changes in fluid balance by comparing with weight when patient least symptomatic" and "If patient gains ≥ 2kg in 2 days": the language can't compare a measurement with an earlier baseline.
- Creatinine/eGFR, potassium, Hb and TSH monitoring: lab values with no unit or observable in the language. They are also only used for medicine decisions.
- All medicines, doses, oxygen and referral steps: these are management steps.

## SNOMED gaps

- No concept for "worsening of symptoms" (searched: worsening, deterioration). Substitute: Heart failure + qualifiers Worsening, Rapid.

## Checker issues left in place

- None.

## Questions for a clinician

- Should "Rapid worsening of symptoms" map to "Decompensated chronic heart failure" (disorder) instead of the qualified heart-failure finding?
- Footnote 3 lists signs for "shock likely" (SBP < 80, pulse ≥ 100, RR > 30, confusion/restlessness, weakness). Should this be a probable cardiogenic shock rule? If so, should any one sign be enough, or a combination?
- Should "fainting/blackouts" and "new irregular pulse" (refer same day) raise a priority level?
- Does "difficulty breathing" in the red box mean breathing that is worse than the patient's baseline? Heart failure itself causes breathlessness on lying down or effort, so as encoded the rule may fire for most heart failure patients.
