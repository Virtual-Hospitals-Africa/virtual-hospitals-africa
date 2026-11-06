# Page 24 – Chest pain: remaining questions

Final build, reconciled from builders A and B (base B; see `reconcile.json`).

## Decisions made

- **Trigger.** Every task and rule hangs off `Chest pain` (finding), the VHA warning sign. The
  red box header says "chest pain", so `Chest discomfort` is not a trigger.
- **Red box → `Urgent: chest pain with danger signs`**, `(and Chest pain (or …))` over every item.
  BP ≥ 180/110 = systolic ≥ 180 or diastolic ≥ 110; BP < 90/60 = systolic < 90 or diastolic < 60
  (Will's convention). Pulse > 100 / < 50 and RR ≥ 30 are routine vitals. "Severe pain" = chest
  pain qualified Severe. "Shoulder/s" and "arm/s" are split into left and right radiation concepts.
- **Priority level is `Urgent`**, as the page says. The Chest pain warning sign already carries
  `Very urgent` in `warning_signs.ts`, so in practice this rule may never raise the level; it
  records the page's logic.
- **"New pain or discomfort in centre or left side of chest"** = Central chest pain / Left sided
  chest pain / Chest discomfort, each with `New`.
- **Known CVD risk > 20%** is a `%` measurement of `Risk of cardiovascular disease`, with a
  `measure` task so it is checked for.
- **ECG.** "Do an ECG (doctor to review)" is a `check_for` task for ST segment elevation, ST segment
  depression and Electrocardiographic left bundle branch block.
- **Flowchart routing follows the image**: "ECG abnormal" feeds the "Is chest pain/discomfort any
  of" box, as does the positional question = No. Both ACS and stable angina need that entry.
- **ACS likely** = chest pain AND (abnormal ECG finding OR positional question = No) AND (any
  encoded feature OR known stable angina recorded No). Logically identical to the page's two routes.
- **Positional question = No** requires all three positional findings recorded as No.
- **Stable angina** (page: "Patient has stable angina") is a `probable` diagnosis: chest pain AND
  the same entry AND each encodable feature recorded No AND onset within 10 minutes AND known
  stable angina.
- **Positional "Yes" box** ("Manage and refer urgently") is its own Urgent priority, because it is
  reached without passing through a "likely" diagnosis. No separate priority on the tension
  pneumothorax or pneumonia diagnoses: both sit inside that box and need a positional finding.
- **Tension pneumothorax** = all of: sudden dyspnoea; a one-sided sign (unilateral hyperresonance,
  unilateral decreased breath sounds, or left/right sided chest pain); trachea displaced; within
  the positional Yes box.
- **Pneumonia** = chest pain on breathing **and** productive cough **and** temperature ≥ 38 °C.
- **Shock / SBP < 80** appears only as a management step (fluids) in the right-hand box. It is not
  a criterion for anything, so it is not encoded (no shock definition built).
- Management (oxygen thresholds, aspirin, IV access, nitrates, morphine, streptokinase and its
  contraindications, chest drain, fluids, amlodipine, ceftriaxone) is not encoded.

## Could not model

- **Diagnosis rules are not gated on the red-box criteria**, although the flowchart sits inside the
  red box. They fire more often than the page intends (for chest pain with no red-box item).
- **"ECG normal/other abnormalities or unavailable or uncertain"** is not a gate: it cannot be
  written as recorded absence without excluding "unavailable". The positional Yes branch (tension
  pneumothorax, pneumonia, its Urgent priority) therefore fires whatever the ECG shows (more often).
- **"Lasts ≥ 10 minutes"** is approximated as chest pain onset ≥ 10 minutes ago. For pain that
  has stopped this over-counts (ACS fires more often). Its negation in the stable angina rule is
  onset ≤ 10 minutes ago (the database accepts only `>=` and `<=`), so exactly 10 minutes satisfies both.
- **"Lasts longer than usual"** approximated with the `Prolonged` qualifier ("than usual" is lost).
- **Not relieved by rest or sublingual nitrates** and **occurs more often than usual**: no concept
  (see SNOMED gaps). The ACS rule therefore fires less often for known stable angina patients
  with only these features; the stable angina rule fires more often (it cannot check that they are absent).
- **"Or with minimal effort"**: only "Chest pain at rest" is encoded. Same direction as above.
- **"Discomfort in centre or left side of chest"**: no site-specific concept; `Chest discomfort`
  (New) is used, which is broader (fires more often, e.g. for right-sided discomfort).

## SNOMED gaps

- Chest pain worse on lying down: no concept; used `Pain aggravated by position` (broader).
- Chest pain on minimal exertion: none (`Chest pain on exertion` is not "minimal").
- Chest pain not relieved by rest / by nitrates: none.
- Chest pain more often than usual: none ("Frequent" and "Increasing" qualifiers do not say "than usual").
- "Lasts longer than usual": used qualifier `Prolonged` (not relative to the usual episode).
- Central/left chest discomfort: none; used `Chest discomfort`.
- Plain `Pallor` (finding) does not exist; used `Pallor of skin of face`, as VHA's rules already do
  (builder A used `Pale complexion`, also in the vocabulary).
- "Deviated trachea": used `Trachea displaced` (disorder; synonym tracheal deviation).
- "Family history" (of heart attack): used `Family history of ischemic heart disease` (situation).

## Checker issues left in place

- `PROBABLE DIAGNOSIS EVIDENCE NOT CHECKED FOR`:
  `(no (finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Stable angina" "disorder") (snomed_concept "No" "qualifier value") (qualifier (snomed_concept "Known present" "qualifier value"))))`
  in `Diagnose probable acute coronary syndrome in chest pain`. The same finding is in the
  `check_for` of `Check chest pain character for acute coronary syndrome`. The checker does not
  match this `(no X)`, nested in an `or`, to that check_for. Kept, because the page routes "not
  known with stable angina" to ACS.

## Questions for a clinician

- Should the ACS / stable angina / pneumothorax / pneumonia rules require at least one red-box
  item, since the flowchart is inside the red box?
- Tension pneumothorax: are the listed signs all required, or is any one enough?
- Is "Pain aggravated by position" an acceptable stand-in for "worse on lying down"?
- Is `Chest discomfort` (any site) acceptable for "discomfort in centre or left side of chest"?
- Does "Severe pain" mean severe chest pain, or severe pain anywhere?
- Should "Patient has stable angina" be a diagnosis at all, given the patient is already known with it?
- Is `Risk of cardiovascular disease` (%) something the app can record, or should "known CVD risk
  > 20%" be a yes/no finding?
- Should a patient with chest pain and an explicit No to "known stable angina" but no other
  features really be diagnosed probable ACS (the page's FEAT = No → SA = No path)?
- "Family history" in the at-risk list: is family history of ischaemic heart disease the right reading?
