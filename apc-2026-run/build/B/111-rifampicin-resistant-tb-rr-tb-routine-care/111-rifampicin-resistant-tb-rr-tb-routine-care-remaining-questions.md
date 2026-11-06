# Page 111 – Rifampicin-resistant TB (RR-TB): routine care: remaining questions

## Decisions made

- **Trigger.** The page is routine care for a patient already known to have RR-TB, and the red-box
  header ("If any of the following, discuss or refer to hospital for admission") names no complaint.
  Every rule is anchored on `(clinical_finding (snomed_concept "Rifampicin resistant tuberculosis" "disorder"))`,
  cited to the page title. No rule on this page diagnoses RR-TB at `probable`, so the
  `clinical_finding` form is used in the task trigger and in both priority rules. RR-TB is not a
  recorded common symptom or warning sign; the rules fire only once RR-TB is recorded as a finding.
- **Two priority evaluations, both `Urgent`.**
  - `Urgent: RR-TB routine care with criteria for hospital admission` encodes the red box.
  - `Urgent: RR-TB with urgent symptoms at routine visit` encodes the Symptoms row
    ("If respiratory rate ≥ 30, breathless at rest or while talking, … give urgent attention and refer").
  The page does not escalate beyond "urgent attention", so neither rule uses `"Very urgent"` or `Emergency`.
- **"Unable to walk unaided"** = `Difficulty walking` OR `Unable to walk`: these are the two abnormal
  values of the adult mobility vital assessment ("Difficulty walking", "Stretcher/Immobile").
- **"Difficulty with adherence"** = `Noncompliance with treatment` (finding).
- **"Patient requests admission"** = `Patient requests a hospital referral` (situation). This is the closest concept.
- **BMI < 18** is encoded as `(< (measurement "Body mass index" kg/m²) 18)`, exactly as the red box
  writes it (the Weight and BMI row's "< 18.5, refer for nutritional support" is management and is not encoded).
  A `measure` task for BMI ("Weight and BMI, every visit") makes it checked for.
- **"Breathless while talking"** = `Unable to complete a sentence in one breath`. **"Prominent use of
  breathing muscles"** = `Accessory respiratory muscles used`. **"New weakness of arm/leg"** =
  `Muscle weakness of limb` + `New` qualifier.
- **No diagnosis rules.** The page has no "X likely" or "consider X" statements. Its other rows are
  management steps or cross-references (adherence 195, side effects 118, family planning 170/175,
  mental health 98, alcohol 165, palliative care 191, BP 148/149, HIV 124/126). None is encoded.
- No flowchart file: the page has no flowchart or Yes/No algorithm.

## Could not model

- **Hb < 8**: there is no haemoglobin observable or unit. Only the BMI half is encoded. The admission rule
  fires **less often** than the page intends.
- **"Any condition that would be better managed in an inpatient setting"**: open-ended clinical judgement.
  Not encoded, so the rule fires **less often**.
- **"Coughs up ≥ 1 tablespoon fresh blood"**: the volume can't be expressed, so it is encoded as plain
  `Hemoptysis`. The rule fires **more often** than the page intends (any haemoptysis).
- "Persistent episodes of coughing blood, consider referral for surgical review"; "if not improving …";
  "no clinical improvement at 3-4 months or month 3 culture positive"; "If losing weight on treatment":
  these are management or lab/culture-based. The page triggers no diagnosis from them. Not encoded.

## SNOMED gaps

- "Infection control challenges at home": nothing found (searched infection control, home environment,
  housing). Not encoded, so the rule fires less often.
- "Unstable social circumstances": nothing specific (searched social circumstances, social instability,
  unstable, housing). `Social problem not due to a mental disorder` is too broad. Not encoded.
- "Patient requests admission": no exact concept. The substitute is `Patient requests a hospital referral` (situation).
- "Difficulty with adherence": no exact concept. The substitute is `Noncompliance with treatment` (finding).
- "Breathless while talking": no "dyspnea on talking" concept. The substitute is
  `Unable to complete a sentence in one breath` (finding).

## Checker issues left in place

- None.

## Questions for a clinician

- Is `Patient requests a hospital referral` an acceptable stand-in for "patient requests admission"?
- Should any haemoptysis in an RR-TB patient be urgent (current encoding), or only ≥ 1 tablespoon,
  which can't be expressed?
- Should "Difficulty walking" (walks with help) count as "unable to walk unaided"? The current encoding counts it.
- Should the Symptoms-row criteria (breathless at rest/talking, haemoptysis, new limb weakness) be
  `"Very urgent"` rather than `Urgent`?
