# Page 24 – Chest pain: remaining questions

## Decisions made

- **Red box → `Urgent: chest pain with danger signs or heart attack risk`**: `(and Chest pain (or …))` over every
  red-box item. BP ≥ 180/110 = systolic ≥ 180 or diastolic ≥ 110; BP < 90/60 = systolic < 90 or diastolic
  < 60 (Will's convention). Pulse > 100 / < 50 and RR ≥ 30 are routine vitals.
- **Priority level is `Urgent`**, as the page says. The Chest pain warning sign already carries `Very urgent`
  in `warning_signs.ts`, so in practice this rule never raises the level; it records the page's logic.
- **"Severe pain"** = Chest pain with `Severe (severity modifier)`. **"New pain or discomfort in centre or left
  side of chest"** = Central chest pain / Left sided chest pain / Chest discomfort, each with `New`.
- **"Pain radiates to … shoulder/s or arm/s"**: left and right concepts both listed (no sideless concept).
- **"At risk of heart attack"**: known diabetes, hypertension, high cholesterol (`Known present`), Smoker,
  Family history of ischemic heart disease, and `Risk of cardiovascular disease` (%) > 20, recorded by a
  `measure` task (`Record known cardiovascular risk in chest pain`) so the comparison is checked for.
- **Flowchart routing follows the 2026 image**: ECG abnormal feeds the "Is chest pain/discomfort any of" box,
  as does Q1 = No. ACS likely = chest pain AND (ST elevation OR ST depression OR LBBB OR (no chest wall
  tenderness AND no pain on breathing)) AND (any encoded feature OR explicit No to "known with stable angina").
- **Q1 "worse on lying down, palpation or breathing deeply"** = Tenderness of chest wall / Chest pain on
  breathing. The Yes branch triggers `Check for tension pneumothorax and pneumonia in chest pain worse on
  palpation or breathing`.
- **Tension pneumothorax likely** read as a conjunction: sudden-onset dyspnoea AND (hyperresonance OR
  decreased breath sounds OR left/right-sided chest pain) AND trachea displaced, gated on Q1 = Yes.
- **Pneumonia likely** = Chest pain on breathing AND Productive cough AND temperature ≥ 38 °C.
- **Shock** (`If shock⁵/systolic BP < 80`) only conditions a management step (saline) here, so it is not encoded;
  no shock diagnosis was built from footnote 5.
- **Diagnosed conditions → Urgent** via `(active_condition …)`, as in the gold standard ("Manage and refer
  urgently").
- "Patient has stable angina" is not a diagnosis rule (its only evidence is the known diagnosis); routine care
  → 153 is a cross-reference.

## Could not model

- **Diagnosis rules are not gated on the red-box criteria**, although the flowchart sits inside the red box.
  They fire more often than the page intends (for chest pain with no red-box item).
- **ECG normal/unavailable precondition** of the Q1 branch (and the tension pneumothorax/pneumonia box) is not
  modelled; those rules fire regardless of ECG result (more often).
- **"Worse on lying down"**: no SNOMED concept. A No on palpation and breathing alone counts as Q1 = No
  (ACS rule fires more often); lying down cannot trigger the Yes branch (fires less often).
- **"with minimal effort"**, **"not relieved by rest or sublingual nitrates"**, **"occurs more often than
  usual"**: no concept; not encoded. The ACS rule then depends on the other features or on the stable-angina
  No (fires less often).
- **"Lasts ≥ 10 minutes"** approximated as onset ≥ 10 minutes ago; an episode that has already stopped is
  not captured.
- **"Lasts longer than usual"** approximated with the `Prolonged` qualifier ("than usual" is lost).
- **"on one side"** is not applied to hyperresonance / decreased breath sounds.
- All management (oxygen, aspirin, IV access, nitrates, morphine, streptokinase and its contraindications,
  saline for shock, amlodipine, ceftriaxone, chest drain) is out of scope.

## SNOMED gaps

- "Pallor": no `Pallor` finding; used `Pale complexion` (vocabulary).
- "Chest pain worse on lying down": none found (searched lying, supine, posture, positional, decubitus).
- "Not relieved by rest or sublingual nitrates": none found (relieved, unrelieved, nitrate).
- "Occurs more often than usual": none; `Frequent` / `Increasing` qualifiers judged not equivalent.
- "Minimal effort": none.
- "Deviated trachea": used `Trachea displaced` (disorder; synonym tracheal deviation).
- "Family history" (of heart attack): used `Family history of ischemic heart disease` (situation).
- "Known CVD risk > 20%": used `Risk of cardiovascular disease` (observable entity) with `%`.

## Checker issues left in place

- `CHECKED FOR BUT NEVER USED AS EVIDENCE`: `(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Stable angina" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))`
- `PROBABLE DIAGNOSIS EVIDENCE NOT CHECKED FOR`: `(no (finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Stable angina" "disorder") (snomed_concept "No" "qualifier value") (qualifier (snomed_concept "Known present" "qualifier value"))))`

  Both come from one faithful condition: Q3 = No ("Is patient known with stable angina?" → No → ACS likely),
  encoded as `(no (clinical_finding Stable angina (qualifier Known present)))`. The finding is checked for and
  used. The gate's `(no X)` matcher expects the `"No"` value concept last, but with a qualifier it renders
  before the qualifier, so the use is not recognised. Tool limitation.

## Questions for a clinician

- Should the ACS / pneumothorax / pneumonia rules require at least one red-box item, since the flowchart is
  inside the red box?
- Tension pneumothorax: are the listed signs all required, or is any one enough?
- Does "Severe pain" mean severe chest pain, or severe pain anywhere?
- Is `Risk of cardiovascular disease` (%) something the app can record, or should "known CVD risk > 20%" be
  a yes/no finding?
- Should a patient with chest pain and an explicit No to "known stable angina" but no other features really be
  diagnosed probable ACS (the page's Q2 = No → Q3 = No path)?
