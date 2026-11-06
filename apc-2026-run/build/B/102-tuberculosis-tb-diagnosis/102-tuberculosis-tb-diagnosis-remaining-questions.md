# Page 102 – Tuberculosis (TB): diagnosis: remaining questions

## Decisions made

- **Suspected TB is a `possible` diagnosis.** "Check for TB if the patient has any TB symptoms:
  current cough, weight loss, drenching night sweats or fever" becomes `Diagnose possible TB (TB
  symptoms or TB contact)`. Its output, `(diagnosis Tuberculosis possible)`, triggers the
  `check_for` task and anchors the Urgent priority ("suspected TB and any of").
- **TB contact** is encoded as exposure to *Mycobacterium tuberculosis complex* (the page-20
  exposure pattern) and is a `possible` trigger, as the page says "also test for TB … if TB contact".
- **Red box → `Urgent: suspected TB with danger signs`** as `(and suspected-TB (or …13 items…))`.
  Page thresholds kept exactly: RR ≥ 30, pulse > 120, temperature > 39 °C.
- Breathlessness at rest or while talking → `Dyspnea at rest` or `Unable to complete a sentence in
  one breath`. Drowsy/confused → `Drowsy` or `Acute confusion`. Severe malnutrition or wasted →
  `Deficiency of macronutrients` + Severe, or `Nutritional wasting`.
- No `measure` tasks: the only measurements are routine vitals. No `manage` tasks.

## Could not model

- **Coughs up ≥ 1 tablespoon of fresh blood**: amount and "fresh" cannot be expressed; plain
  `Hemoptysis` is used, so the rule fires **more often** than the page intends.
- **"Drenching" night sweats**: plain `Night sweats`, fires **more often**.
- **Unable to walk unaided**: `Unable to walk`; a patient who walks only with help may be missed
  (fires **less often**).
- **Test for TB without symptoms**: "DS-TB in last 2 years: yearly for 2 years", "PLHIV: at
  diagnosis, at re-engagement if interrupted ART > 90 days, yearly, first antenatal visit" and
  "abnormal findings on digital CXR + CAD" need schedules or imaging results the language cannot
  express. Not encoded; such patients without symptoms are not flagged (fires **less often**).
- **TB contact definition** (footnote 1: ≥ 1 night or extended daytime periods, within 3 months
  before the index patient's treatment) is not expressed; any recorded exposure counts.
- **The whole workup and results flowchart** (interrupted treatment > 2 months, TB NAAT, urine LAM
  with CD4 ≤ 200 / WHO stage 3–4, MTB detected positive/trace, treated in last 2 years, DST:
  rifampicin/INH sensitivity, "Diagnose TB on urine LAM", "Diagnose INH-resistant TB", "Diagnose
  RR-TB", "TB symptoms and signs present and/or abnormal CXR") depends on lab and imaging results
  with no representation in the language. No probable rules were written. All endpoints are
  management (treatment start, sputum, review results).

## SNOMED gaps

- "Weight loss" (finding) does not exist; `Weight decreased` used.
- No "drenching" qualifier; no "massive/large haemoptysis"; no "confusion" finding general enough
  to cover acute and chronic (`Acute confusion` used, matching VHA's warning sign).
- No adult "severe malnutrition" concept; `Deficiency of macronutrients` (protein-energy
  malnutrition) with `Severe (severity modifier)` used.
- No concepts for TB NAAT/Xpert result, urine LAM result, DST result or abnormal CXR with CAD.
- No "TB contact" situation; `Exposure to tuberculosis` exists only as an `event` (needs a datetime),
  so the exposure + organism form was used.

## Checker issues left in place

- None.

## Questions for a clinician

- Should a known TB patient (on treatment) with the red-box signs also be Urgent here? Only
  *suspected* TB (possible) is keyed; a recorded active TB diagnosis without new symptoms does not
  trigger the check.
- Is `Unable to complete a sentence in one breath` an acceptable reading of "breathless while
  talking"?
- Should PLHIV and recently treated DS-TB patients trigger a TB check at every visit, given the
  page's yearly schedule cannot be expressed?
