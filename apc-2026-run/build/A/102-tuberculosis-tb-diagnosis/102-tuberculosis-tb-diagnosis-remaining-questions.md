# Page 102 – Tuberculosis (TB): Diagnosis: remaining questions

## Decisions made

- **"Suspected TB" is a `possible` TB diagnosis.** The page's opening line ("Check for TB if the
  patient has any TB symptoms: current cough, weight loss, drenching night sweats or fever. Also
  test for TB … if … TB contact, abnormal findings on digital CXR + CAD screening") is encoded as
  `Diagnose possible TB from TB symptoms, TB contact or abnormal screening CXR`. The red-box check
  task and the Urgent priority rule both key off `(diagnosis Tuberculosis possible)`.
- **Red box → Urgent**, as `(and (diagnosis Tuberculosis possible) (or …all 12 items…))`. The page
  does not escalate beyond "urgent attention", so `Urgent` throughout, even where an item's own
  warning sign carries a higher level (Acute confusion, Hemoptysis).
- Vitals (RR ≥ 30, pulse > 120, temperature > 39 °C) are routine and get no measure task; the page's
  comparison directions are kept exactly (≥ 30, > 120, > 39).
- "Breathlessness at rest or while talking" = `Dyspnea at rest` or `Unable to complete a sentence in
  one breath`. "Drowsy/confused" = `Drowsy` or `Acute confusion`. "Severe malnutrition or wasted" =
  `Malnutrition (calorie)` + Severe, or `Nutritional wasting`. "Unable to walk unaided" = `Unable to
  walk` (the app's mobility-assessment form).
- No `probable` diagnosis rules: every "diagnose" on this page (TB on urine LAM, MTB detected,
  INH-resistant TB, RR-TB) rests on a lab result.
- No shock / BP < 90/60 criteria appear on this page.

## Could not model

- **PLHIV screening** (at diagnosis, at re-engagement if ART interrupted > 90 days, yearly when viral
  load checked, at first antenatal visit) and **DS-TB in last 2 years** (yearly for 2 years after
  treatment): the schedule cannot be expressed. Encoding the bare condition would make possible TB
  fire at every visit of every PLHIV, so they are left out; the possible-TB rule fires **less often**
  than the page intends for asymptomatic people in these groups.
- **Lab-based workup and diagnoses**: TB NAAT (positive / trace / unsuccessful), urine LAM, CD4 ≤ 200,
  WHO stage 3/4, DST (rifampicin/INH), culture. No observables or units exist for these, and SNOMED
  has no "MTB detected" result finding (only a "not detected" PCR finding). Diagnose INH-resistant TB,
  Diagnose RR-TB and "diagnose TB on urine LAM" are therefore not encoded.
- "Coughs up ≥ 1 tablespoon of fresh blood": volume and "fresh" not expressible; plain `Hemoptysis`
  is used, which fires **more often** than the page intends.
- "Drenching" night sweats: plain `Night sweats` (slightly broader).
- TB contact definition (footnote 1: enclosed space, ≥ 1 night, 3-month window) is not expressible;
  any recorded `Exposure to Mycobacterium tuberculosis` counts.
- "Digital CXR + CAD": only an abnormal screening chest X-ray finding is expressible.
- Management box (oxygen to keep saturation ≥ 92 %, ceftriaxone, refer) and the whole workup /
  treatment section: management steps, not modelled in this pass.

## SNOMED gaps

- `Weight loss` (finding): not an active FSN; used `Weight decreased` (finding).
- `Drenching sweats`: none; used `Night sweats`.
- `Confusion` (finding): none; used `Acute confusion` (the warning-sign form).
- `Severe malnutrition` (disorder): none; used `Malnutrition (calorie)` + `Severe (severity modifier)`.
- Dyspnoea while talking: none; used `Unable to complete a sentence in one breath` (narrower).
- "Unable to walk unaided": used `Unable to walk`.
- `Contact with tuberculosis` (event): none; used `Exposure to Mycobacterium tuberculosis` (event).
- "MTB detected" / LAM positive result findings: none found.

## Checker issues left in place

- None.

## Questions for a clinician

- Is "suspected TB" from any single symptom (e.g. cough alone) the right trigger for the urgent
  check, given that cough is a very common complaint?
- Should PLHIV and patients treated for DS-TB in the last 2 years trigger possible TB at all, given
  the schedule cannot be modelled?
- Is any haemoptysis acceptable as the urgent criterion in place of "≥ 1 tablespoon of fresh blood"?
- Is `Unable to complete a sentence in one breath` an acceptable stand-in for "breathless while
  talking"?
- How will TB contact and an abnormal screening CXR be recorded, since no task on this page asks
  for them?
