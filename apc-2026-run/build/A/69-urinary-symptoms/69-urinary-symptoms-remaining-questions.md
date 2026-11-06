# Page 69 – Urinary symptoms: remaining questions

## Decisions made

- **Trigger.** Both `check_for` tasks and the priority rule are anchored on
  `(clinical_finding (snomed_concept "Urinary symptoms" "finding"))`. It is not a recorded common
  symptom or warning sign, and it has no SNOMED children, so it fires only when "Urinary symptoms"
  is recorded explicitly.
- **Priority evidence written inline.** The Urgent rule repeats each red-box item's evidence instead
  of referencing `(active_condition Kidney disease / Kidney stone / Acute pyelonephritis)`. With
  `active_condition`, a *history* of kidney disease or stones, or an uncomplicated pyelonephritis
  (same SNOMED concept), would also make the patient Urgent, which the page does not say. All inline
  evidence is in the first `check_for`.
- **Complicated and uncomplicated pyelonephritis share one rule.** SNOMED has no complicated/
  uncomplicated split, so both "likely" statements become `probable Acute pyelonephritis` with
  evidence flank pain + leucocytes/nitrites. The complicating features (vomiting, BP < 90/60,
  pulse ≥ 100, diabetes, male, pregnant, post menopause) appear only in the Urgent rule.
- **BP pairs.** BP < 90/60 = SBP < 90 or DBP < 60; BP ≥ 140/90 = SBP ≥ 140 or DBP ≥ 90.
- **One-sided flank/groin pain** = Left/Right flank pain or Left/Right inguinal pain, each with
  `Sudden onset` and `Severe (severity modifier)` qualifiers.
- **Lower abdominal discomfort/distension** = `Abdominal discomfort` / `Distension of abdomen` with
  `finding_site` Lower abdomen structure (both resolve).
- **New swelling of face/feet** = `Swelling` + `finding_site` Face structure / Foot structure +
  `New` qualifier.
- **Diabetes and urinary tract problem** are plain `clinical_finding` forms (no `Known present`
  qualifier). With the qualifier, the `(no …)` form in the simple-UTI rule did not match the
  `check_for` form and the gate reported it unchecked.
- **Algorithm "No" branches** use `(no …)`, which needs a recorded "No": simple UTI (no catheter,
  diabetes, pregnancy, urinary tract problem); man's "No" to perineal/body pain and prostate
  tenderness; MUS with no frequency/urgency; no leucocytes/nitrites for the "exclude" rules.
- **Concept choices:** simple UTI = `Acute cystitis`; complicated UTI = `Urinary tract infectious
  disease`; MUS = `Urethritis`; "exclude diabetes" = possible `Diabetes mellitus`; "exclude pregnancy"
  = possible `Pregnancy`; burning = `Dysuria`; frequency = `Increased frequency of urination`;
  urgency = `Urgent desire to urinate`; glucose on dipstick = `Glycosuria`; passing little urine =
  `Oliguria`.
- No `measure` task: dipstick results are recorded as findings, and BP and pulse are routine vitals.
- Management elements (catheter, medicines, fluids, referral, notification, advice) are not encoded.

## Could not model

- **Sex.** The language has no demographic sex form. "Male" (red box, Man column) and "Woman" are
  encoded as the findings `Male` / `Female`. If VHA never records these as findings, the Woman/Man
  rules and the "male" item of complicated pyelonephritis will never fire (they would fire **less
  often** than the page intends).
- **Schistosomiasis likely** (blood on dipstick → microscopy → Schistosoma positive) is not encoded.
  There is no SNOMED finding for Schistosoma ova in urine, and "at risk of bilharzia" (washed/swam in
  endemic areas, footnote 6) has no form either. The footnote's "treat as schistosomiasis if
  microscopy not available and lives in endemic area" is also not modelled.
- "Not needing urgent attention": the non-urgent rules do not exclude the red-box features, so a
  patient can be both Urgent and, e.g., probable UTI.
- The column entry condition "Burning/frequency/urgency or leucocytes/nitrites on dipstick" is
  written explicitly only where the branch does not already imply it (prostatitis, exclude-diabetes
  rules). For the leucocytes/nitrites branches it is implied.
- Flow problems (leakage of urine, poor stream/difficulty passing urine) lead only to management, so
  they are not checked for.

## SNOMED gaps

- "Complicated pyelonephritis" / "Uncomplicated pyelonephritis": not found → `Acute pyelonephritis`.
- "Complicated urinary tract infection" / uncomplicated UTI: not found → `Urinary tract infectious
  disease` / `Acute cystitis`.
- "Male urethritis syndrome": not found → `Urethritis`.
- "Schistosoma ova in urine" (finding): not found (only organism concepts such as `Egg of genus
  Schistosoma`). Schistosomiasis would be `Infection caused by Schistosoma`; not used.
- "Groin pain": not found → `Inguinal pain` (Left/Right).
- "Glucose in urine": not found → `Glycosuria`.

## Checker issues left in place

- None.

## Questions for a clinician

- Does "perineal/body pain" in the Man column mean generalised body aches (encoded as `Generalized
  aches and pains`), or is it a misprint (e.g. back or bony pain)?
- Is mapping simple UTI → acute cystitis and complicated UTI → urinary tract infectious disease
  acceptable, or should both be one concept?
- Should the non-urgent diagnoses be suppressed when a red-box feature is present?
- How should patient sex be represented so that the Woman/Man branches can fire?
