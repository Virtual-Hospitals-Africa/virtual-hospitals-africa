# Page 24 – Chest pain: remaining questions

## Decisions made

- **Trigger.** Every task and rule hangs off `Chest pain` (finding), the VHA warning sign. The
  page also says "chest pain/discomfort"; `Chest discomfort` is not used as a trigger because the
  red box header says "chest pain".
- **Red box → `Urgent: chest pain with danger signs`**, `(and Chest pain (or …))` over every item.
  BP ≥ 180/110 = systolic ≥ 180 or diastolic ≥ 110; BP < 90/60 = systolic < 90 or diastolic < 60.
  "Severe pain" = chest pain qualified Severe. "Shoulder/s" and "arm/s" are split into left and
  right radiation concepts.
- **Known CVD risk > 20%** is a `%` measurement of `Risk of cardiovascular disease`, with a
  `measure` task so it is checked for.
- **ECG.** "Do an ECG (doctor to review)" is a `check_for` task for ST segment elevation, ST segment
  depression and Electrocardiographic left bundle branch block. Any of them with chest pain →
  probable acute coronary syndrome.
- **ACS "No" routes.** The page reaches "ACS likely" when the pain is not positional and either has
  any listed feature, or has none and the patient is not known with stable angina. Encoded as
  POS = No **and** (any feature **or** known stable angina recorded No). Logically identical.
- **Positional question = No** requires all three positional findings recorded as No.
- **Stable angina** (page: "Patient has stable angina") is encoded as a `probable` diagnosis that
  needs: no abnormal ECG finding, POS = No, each encodable feature recorded No, onset within 10
  minutes, and known stable angina.
- **Positional "Yes" box** ("Manage and refer urgently") is its own Urgent priority, because it
  is reached without passing through a "likely" diagnosis.
- **Tension pneumothorax** = all of: sudden dyspnoea; a one-sided sign (unilateral hyperresonance,
  unilateral decreased breath sounds, or left/right sided chest pain); trachea displaced; within
  the positional Yes box.
- **Pneumonia** = chest pain on breathing **and** productive cough **and** temperature ≥ 38 °C.
- **Shock / SBP < 80** appears only as a management step (fluids) in the right-hand box. It is not
  a criterion for anything, so it is not encoded (no shock definition built).
- Management (oxygen thresholds, aspirin, IV access, nitrates, morphine, streptokinase and its
  contraindications, chest drain, fluids, amlodipine, ceftriaxone) is not encoded.

## Could not model

- **"ECG unavailable or uncertain"** for the stable angina outcome: VHA's evidence code rejects
  `not`, so the rule needs each abnormal ECG finding recorded as No. With no ECG done, the
  stable angina rule does not fire (fires less often than the page intends).
- **"Lasts ≥ 10 minutes"** is approximated as chest pain onset ≥ 10 minutes ago. For pain that
  has stopped this over-counts (ACS fires more often). Its negation in the stable angina rule is
  onset ≤ 10 minutes ago (the database accepts only `>=` and `<=`), so exactly 10 minutes satisfies both.
- **Not relieved by rest or sublingual nitrates** and **occurs more often than usual**: no concept
  (see SNOMED gaps). The ACS rule therefore fires less often for known stable angina patients
  with only these features; the stable angina rule fires more often (it cannot check that they are absent).
- **"Or with minimal effort"**: only "Chest pain at rest" is encoded. Same direction as above.
- **"Discomfort"** in "new pain or discomfort in centre or left side of chest": no site-specific
  concept; only central and left sided chest pain (New) are encoded (fires less often).

## SNOMED gaps

- Chest pain worse on lying down: no concept; used `Pain aggravated by position` (broader).
- Chest pain on minimal exertion: none (`Chest pain on exertion` is not "minimal").
- Chest pain not relieved by rest / by nitrates: none.
- Chest pain more often than usual: none ("Frequent" and "Increasing" qualifiers do not say "than usual").
- "Lasts longer than usual": used qualifier `Prolonged` (not relative to the usual episode).
- Central/left chest discomfort: none.
- Plain `Pallor` (finding) does not exist; used `Pallor of skin of face`, as VHA's rules already do.

## Checker issues left in place

- `PROBABLE DIAGNOSIS EVIDENCE NOT CHECKED FOR`:
  `(no (finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Stable angina" "disorder") (snomed_concept "No" "qualifier value") (qualifier (snomed_concept "Known present" "qualifier value"))))`
  in `Diagnose probable acute coronary syndrome in chest pain`. The same finding is in the
  `check_for` of `Check chest pain character for acute coronary syndrome`. The checker does not
  match this `(no X)`, nested in an `or`, to that check_for. The `(no X)` forms at the top level of
  the stable angina rule pass. Kept, because the page routes "not known with stable angina" to ACS.

## Questions for a clinician

- Tension pneumothorax: are the listed signs all required, or is any one enough? Should the rule
  require the pain to be positional, since the page puts it inside that box?
- Is "Pain aggravated by position" an acceptable stand-in for "worse on lying down"?
- Should the stable angina outcome fire when no ECG was done? The page allows it; the current rule doesn't.
- Should "Patient has stable angina" be a diagnosis at all, given the patient is already known with it?
- "Family history" in the at-risk list: is family history of ischaemic heart disease the right reading?
