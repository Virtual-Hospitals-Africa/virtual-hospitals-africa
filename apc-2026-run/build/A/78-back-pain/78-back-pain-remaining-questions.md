# Page 78 – Back pain: remaining questions

## Decisions made

- **Trigger.** The main `check_for` task is triggered by `Backache` (a common symptom). A second
  task, triggered by `Flank pain` (checked for in the first task), asks for the urine dipstick
  (leucocytes, nitrites, blood), the complicating factors for pyelonephritis and the kidney-stone
  pain features. `Flank pain` is not a SNOMED descendant of `Backache`, so the Urgent rule's
  complaint is `(or Backache Flank pain)`.
- **Pyelonephritis.** SNOMED has no complicated/uncomplicated pyelonephritis concept, and a
  diagnosis cannot carry a qualifier. One rule, `Diagnose probable pyelonephritis in back pain with
  flank pain` (Acute pyelonephritis, from the vocabulary), covers both the red box's "complicated
  pyelonephritis likely" and the approach box's "uncomplicated pyelonephritis likely". The red-box
  logic (flank pain, leucocytes/nitrites **and** any of vomiting, sepsis, diabetes, male, pregnant,
  post menopause) is written directly into the Urgent rule, so only complicated cases are urgent.
- **Sepsis (footnote 1)** is written inline on this page: SBP < 80, pulse ≥ 100 (`Pulse, function`),
  respiratory rate > 30, `Acute confusion`. No shared sepsis definition.
- **Kidney stone.** "Sudden, severe, one-sided pain" is `Flank pain` with `Sudden onset`,
  `Severe (severity modifier)` and `Unilateral` qualifiers; "radiating to groin" is `Inguinal pain`
  (no "pain radiating to groin" concept); plus `Blood in urine`.
- **Pancreatitis and AAA** probable rules include `Backache`, since the page states them for the
  patient with back pain.
- **Numbness of buttocks, perineum** → `Numbness of saddle area`; legs → `Numbness of lower limb`.
- **Check for TB** (flowchart Q1 = Yes) is read as "suspect TB" → `possible` Tuberculosis, evidence
  backache and any of cough, weight decreased, night sweats, fever.
- **Consider mpox** → `possible` Monkeypox: rash/lesion **and** any of the listed symptoms.
- **Known cancer** and **diabetes** use the `Known present` qualifier in both the check_for and the rule.
- The `active_condition` forms for kidney stone, AAA and pancreatitis in the Urgent rule also match
  a past recorded diagnosis, so a patient with back pain and a previous kidney stone would be
  flagged Urgent.

## Could not model

- **"Recent injury and x-ray unavailable or abnormal"**: neither "recent" (no time stated) nor the
  x-ray availability/result can be expressed. Encoded as `Traumatic injury` alone, so the Urgent
  rule fires **more often** than the page intends (any injury with back pain).
- **Bowel retention**: no SNOMED concept (`Retention of feces` does not exist; `Fecal impaction`
  is narrower). Only urinary retention and both incontinences are encoded, so the rule fires
  **less often** for bowel retention.
- **Flowchart Q2** ("> 50 years, pain progressive or for > 6 weeks, previous cancer or back
  surgery, osteoporosis, oral steroid use, HIV, IV drug use or deformity" → doctor x-ray): leads
  only to management, so there is no diagnosis to encode. Age has no form in the language.
- **Inflammatory back pain likely**: no SNOMED concept, and none of the Q3 criteria can be
  expressed (age < 40; sleep disturbed by pain; better with exercise; not better with rest;
  morning stiffness > 30 minutes). Not encoded.
- **Mechanical back pain likely**: needs "No" to Q3, which cannot be expressed, and "No" to
  "> 50 years". A rule on the remaining "No" answers would also label inflammatory back pain as
  mechanical, so it is not encoded. (`Mechanical low back pain` exists but is narrower than "back
  pain".)
- "Unexplained" rash (mpox) cannot be expressed; the rule fires for any rash/lesion.
- All management: IV fluids, ceftriaxone, morphine, referral, ibuprofen, paracetamol, x-ray,
  physiotherapy, BMI ≥ 25 → 156, low mood → 98, persists ≥ 3 months → 76.

## SNOMED gaps

- Complicated / Uncomplicated pyelonephritis (disorder): not found; used `Acute pyelonephritis`.
- Inflammatory back pain (finding): not found.
- Pain radiating to groin (finding): not found; used `Inguinal pain`.
- Numbness of buttock / Numbness of perineum (finding): not found; used `Numbness of saddle area`.
- Retention of feces (disorder): not found; not encoded.
- Lesion of anus (disorder): not found; anal lesions not encoded (rectum, genitals, mouth, eyes, skin are).
- Morning stiffness of the back, sleep disturbed by pain, pain relieved by exercise, pain not
  relieved by rest: not found.
- Weight loss (finding): not found; used `Weight decreased`.
- Mpox: SNOMED name is `Monkeypox`.

## Checker issues left in place

- None.

## Questions for a clinician

- Does VHA record the patient's sex as a `Male` (finding)? If sex is demographic only, the "male"
  factor for complicated pyelonephritis never matches and needs a different form.
- Is `Traumatic injury` alone acceptable for "recent injury and x-ray unavailable or abnormal",
  given that primary-care clinics usually cannot x-ray on the spot?
- Should "Check for TB" make TB a `possible` diagnosis, or stay a pointer to page 102?
- Is `Inguinal pain` acceptable for pain radiating to the groin?
