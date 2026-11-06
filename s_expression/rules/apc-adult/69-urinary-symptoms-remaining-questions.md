# Page 69 – Urinary symptoms: remaining questions

Final build reconciled from builders A and B (base: B; task split from A; see `reconcile.json`).

## Decisions made

- **Trigger.** Both `check_for` tasks and the priority rule are anchored on
  `(clinical_finding (snomed_concept "Urinary symptoms" "finding"))`. It isn't a recorded common
  symptom or warning sign and has no SNOMED children, so the rules fire only once intake records it.
- **Two tasks.** `Check for urgent urinary symptom conditions` holds the red-box findings;
  `Check for urinary infection features` holds the findings of the "not needing urgent attention"
  algorithm (burning/frequency/urgency, woman/man, glucose, the woman's and man's questions), as the
  page separates the two.
- **Priority rule.** Following Will's briefing, kidney disease and kidney stone are referenced as
  `(active_condition Kidney disease)` / `(active_condition Kidney stone)`. Complicated pyelonephritis
  is written out (flank pain, leucocytes or nitrites, and any of the seven factors), because the
  non-urgent "uncomplicated pyelonephritis likely" rule diagnoses the same `Acute pyelonephritis`
  concept, and `(active_condition Acute pyelonephritis)` would make every pyelonephritis Urgent.
- **Complicated and uncomplicated pyelonephritis** are two `probable Acute pyelonephritis` rules, one
  per "likely" statement on the page. The uncomplicated rule does not negate the complicating factors,
  so in complicated cases both fire; they diagnose the same concept.
- **BP pairs.** BP < 90/60 = systolic < 90 **or** diastolic < 60; BP ≥ 140/90 = systolic ≥ 140 **or**
  diastolic ≥ 90.
- **One-sided flank/groin pain** = `Flank pain` / `Inguinal pain` with qualifiers `Sudden onset`,
  `Severe (severity modifier)` and `Unilateral` (the page's "one-sided"), rather than left/right
  precoordinated concepts.
- **Lower abdominal discomfort/distension** = `Abdominal discomfort` / `Distension of abdomen` with
  `finding_site` Lower abdomen structure. **New swelling of face/feet** = `Swelling` +
  `finding_site` Face structure / Foot structure + `New`. All body structures resolve.
- **Diabetes and urinary tract problem** are plain `clinical_finding` forms, so the `(no …)` forms in
  the simple-UTI rule match the `check_for` forms.
- **"Leucocytes/nitrites"** = `Leukocytes in urine` **or** `Nitrite detected in urine`; "no
  leucocytes/nitrites" = `(no …)` of both. **Burning/frequency/urgency** = `Dysuria`, `Increased
  frequency of urination`, `Urgent desire to urinate`. Glucose on dipstick = `Glycosuria`; passing
  little urine = `Oliguria`.
- **Woman/man/male** are the findings `Female` and `Male`.
- **Diagnosis concepts:** simple UTI → `Lower urinary tract infectious disease`; complicated UTI →
  `Urinary tract infectious disease`; MUS (male urethritis syndrome) → `Urethritis`.
- **The man's rules and the flowchart gate.** The MUS-by-discharge and acute prostatitis rules require
  the column gate (burning/frequency/urgency or leucocytes/nitrites), because the Man box sits under it.
- **No branches** use `(no …)` and fire only when the negative is recorded (simple UTI's four
  factors; the man's "No" to perineal/body pain and prostate tenderness; MUS with no
  frequency/urgency; no leucocytes/nitrites for the "exclude" rules).
- **"Exclude diabetes" / "exclude pregnancy"** are `possible` diagnoses of `Diabetes mellitus` and
  `Pregnancy`.
- No `measure` task: dipstick results are findings, BP and pulse are routine vitals.
- Management elements (catheter, medicines, fluids, referral, notification, advice) are not encoded.

## Could not model

- **Sex.** The language has no demographic sex form. If VHA never records `Male` / `Female` as
  findings, the Woman/Man rules and the "male" factor of complicated pyelonephritis will never fire
  (they fire **less often** than the page intends).
- **Schistosomiasis likely** (blood on dipstick → microscopy → Schistosoma positive): no finding
  concept for a positive *Schistosoma* ova result, and "at risk of bilharzia" (footnote 6) has no
  form. Footnote 6's "treat as schistosomiasis if microscopy not available" is not modelled either.
- **"Not needing urgent attention":** the non-urgent rules do not exclude the red-box features, so a
  patient can be both Urgent and, e.g., probable UTI.
- **Blood on microscopy → refer same week**, the leakage-of-urine and poor-stream branches, all
  "discuss/refer" leaves and "recurrent UTI" → MCS are management or routing. Footnote 5 (repeat the
  dipstick after menstruation) is a management note.

## SNOMED gaps

- No complicated / uncomplicated pyelonephritis: `Acute pyelonephritis` used.
- No simple / complicated UTI: `Lower urinary tract infectious disease` / `Urinary tract infectious
  disease` used.
- No male urethritis syndrome: `Urethritis` used.
- No "burning micturition": `Dysuria` used. No "glucose in urine": `Glycosuria` used. No "groin
  pain": `Inguinal pain` used.
- No finding for *Schistosoma* ova in urine (only organism concepts such as `Egg of genus
  Schistosoma`): not encoded.
- No precoordinated new face or foot swelling: `Swelling` + `finding_site` + `New`.

## Checker issues left in place

- None.

## Questions for a clinician

- Does "perineal/body pain" in the Man column mean generalised body aches (encoded as `Generalized
  aches and pains`), perineal pain only, or something else (e.g. pubic, back or bony pain)?
- Is simple UTI → `Lower urinary tract infectious disease` (builder A proposed `Acute cystitis`) and
  complicated UTI → `Urinary tract infectious disease` acceptable, or should both be one concept?
- The priority rule uses `(active_condition Kidney disease)` and `(active_condition Kidney stone)` as
  Will's briefing asks. Any recorded kidney disease or kidney stone (including a known chronic one or
  a descendant concept) will then make a patient with urinary symptoms Urgent, which the page does not
  say. Should the red-box criteria be written out instead, as was done for complicated pyelonephritis?
- Should a man with urethral discharge be classed as MUS even without burning, frequency, urgency or
  leucocytes/nitrites? The rule currently requires one of them.
- Should the non-urgent diagnoses be suppressed when a red-box feature is present?
- How is the patient's sex recorded? If not as the `Male` / `Female` findings, the sex-dependent rules
  won't fire.
- Should "urinary tract problem" be any disorder of the urinary system, as encoded, or only
  structural abnormalities?
