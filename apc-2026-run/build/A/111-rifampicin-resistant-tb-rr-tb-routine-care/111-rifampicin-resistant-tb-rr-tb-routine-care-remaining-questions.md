# Page 111 – Rifampicin-resistant TB (RR-TB): routine care — remaining questions

No flowchart file: the page is an assessment table with a red box, not a Yes/No algorithm.

## Decisions made

- **Trigger** is `(clinical_finding (snomed_concept "Rifampicin resistant tuberculosis" "disorder"))` in every rule. No rule diagnoses RR-TB at `probable`, so the `clinical_finding` form is used in the trigger and both priority rules. Descendants (e.g. MDR-TB) match.
- **Red box → Urgent** ("discuss or refer to hospital for admission"), following Will's convention that the red box becomes `Urgent`. The page doesn't say "urgent attention" here.
- **The Symptoms row** ("give urgent attention and refer") is a second `Urgent` rule, "Urgent: RR-TB with danger symptoms at routine visit". It shares some findings with the red box: RR ≥ 30, drowsy, confused, neck stiffness and persistent vomiting.
- "Confused" → `Acute confusion` (finding), the warning-sign concept. "Severe headache" → `Headache` + `Severe (severity modifier)`.
- "Unable to walk unaided" → `Unable to walk`. "Difficulty with adherence" → `Noncompliance with medication regimen`.
- **BMI < 18**: the red box's threshold (18) is used. The Weight row's 18.5 is a nutritional-support referral, so it is management. A `measure` task for BMI (kg/m²) was added because BMI is not an adult routine vital and the page asks for weight and BMI every visit.
- Everything else on the page is management, notification, cross-references or routine screening (pregnancy, HIV, BP, alcohol, mental health, palliative care), with no "likely/consider" diagnostic logic. None of it is encoded.

## Could not model

- **Hb < 8**: there is no haemoglobin observable or unit. Only BMI < 18 is encoded, so the red-box rule fires **less often** than the page intends.
- **"Coughs up ≥ 1 tablespoon fresh blood"**: the volume and "fresh" can't be expressed. Any `Hemoptysis` triggers the symptom rule, so it fires **more often** than the page intends.
- **"Breathless … while talking"**: there is no concept for it. Only `Dyspnea at rest` is encoded, so the rule fires **less often**.
- **"Any condition that would be better managed in an inpatient setting"**: an open-ended clinical judgement.
- **Time rules**: "Not improving at 3–4 months / month 3 culture positive" is a management decision (DST, PCAC), so it is not encoded.

## SNOMED gaps

- **Infection control challenges at home**: none found. `Infection control status` (finding) is too unspecific.
- **Unstable social circumstances**: none found. `Social problem not due to a mental disorder` (finding) was considered and rejected.
- **Patient requests admission**: none found. `Patient requests a hospital referral` (situation) exists but means referral, not admission.
- **Unable to walk unaided**: no exact concept. `Unable to walk` is used.
- **Breathless while talking**: none found.

## Checker issues left in place

- None.

## Questions for a clinician

- Should the red box ("discuss or refer for admission") really raise the priority to Urgent? Some of its criteria aren't time-critical: difficulty with adherence, BMI < 18 and social circumstances.
- Is any haemoptysis in a patient with RR-TB acceptable as the Urgent trigger, given that the page sets a threshold of ≥ 1 tablespoon of fresh blood?
- Should `Patient requests a hospital referral` stand in for "Patient requests admission"?
