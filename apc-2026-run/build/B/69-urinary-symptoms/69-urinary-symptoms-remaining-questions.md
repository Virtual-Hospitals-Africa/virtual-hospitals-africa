# Page 69 – Urinary symptoms: remaining questions

## Decisions made

- **Trigger.** The complaint "urinary symptoms" is encoded as `(clinical_finding Urinary symptoms)`.
  It isn't a recorded common symptom or warning sign, so the task fires only once intake records it.
- **Complicated pyelonephritis in the priority rule.** The red box says "complicated pyelonephritis
  likely", but SNOMED has no complicated/uncomplicated split. Both the urgent rule and the non-urgent
  "uncomplicated pyelonephritis likely" rule diagnose `Acute pyelonephritis`. Referencing
  `(active_condition Acute pyelonephritis)` from the priority rule would make every pyelonephritis
  Urgent. So the priority rule writes out the criteria instead: flank pain, leucocytes or nitrites,
  and any of the seven factors. Kidney disease and kidney stone are referenced by `active_condition`.
- **Uncomplicated pyelonephritis** is diagnosed from flank pain with leucocytes/nitrites alone. The
  complicating factors aren't negated, so in complicated cases it fires together with the
  complicated rule. Both diagnose the same concept, so the result is the same.
- **BP < 90/60** is systolic < 90 **or** diastolic < 60. **BP ≥ 140/90** is systolic ≥ 140 **or**
  diastolic ≥ 90.
- **"Leucocytes/nitrites"** is leucocytes **or** nitrites. "No leucocytes/nitrites" is `(no …)` of both.
- **Burning/frequency/urgency** is `Dysuria`, `Increased frequency of urination` and
  `Urgent desire to urinate`.
- **Woman/man/male** are the findings `Female` and `Male`.
- **Diagnosis concepts:**
  - Simple UTI → `Lower urinary tract infectious disease`.
  - Complicated UTI → `Urinary tract infectious disease`.
  - MUS (male urethritis syndrome) → `Urethritis`.
- **The man's rules and the gate.** The MUS-by-discharge and acute prostatitis rules require the
  flowchart gate (burning/frequency/urgency or leucocytes/nitrites), because the Man box sits under it.
- **No branches** are `(no …)`, so they fire only when the negative finding is recorded, e.g. the
  man's "No" to perineal/body pain or prostate tenderness, or the woman's "No" to
  catheter/diabetes/pregnancy/urinary tract problem.
- **"Exclude diabetes" / "exclude pregnancy"** are `possible` diagnoses of `Diabetes mellitus` and
  `Pregnancy`.
- No `measure` task: the dipstick results are findings, and the rest are routine vitals.

## Could not model

- **Schistosomiasis likely** (Schistosoma positive on urine microscopy): there is no finding concept
  for a positive *Schistosoma* ova result, so it isn't encoded. Risk of bilharzia (washing or
  swimming in an endemic area, footnote 6) isn't encoded either.
- **Blood on microscopy → refer same week**, the leakage-of-urine and poor-stream branches, and all
  "discuss/refer" leaves are management or routing.
- **"Recurrent UTI"** (complicated/recurrent UTI → MCS) is management.
- Footnote 5 (repeat the dipstick after menstruation) is a management note.

## SNOMED gaps

- No concept for complicated or uncomplicated pyelonephritis: `Acute pyelonephritis` used.
- No concept for simple or complicated UTI: `Lower urinary tract infectious disease` and
  `Urinary tract infectious disease` used.
- No concept for male urethritis syndrome: `Urethritis` used.
- No "burning micturition": `Dysuria` used.
- No finding for *Schistosoma* ova in urine: not encoded.
- No precoordinated new foot or face swelling: `Swelling` with `Foot structure` / `Face structure`
  plus `New`. Both body structures were confirmed with `exists`.

## Checker issues left in place

- None.

## Questions for a clinician

- Does "perineal/body pain" mean perineal pain or generalised body aches (as encoded), or something
  else, such as pain over the pubic area?
- Should a man with urethral discharge be classed as MUS even without burning, frequency, urgency or
  leucocytes/nitrites? The rule currently requires one of them.
- Does the app record the patient's sex as the `Male` / `Female` findings? If not, the sex-dependent
  rules, including "male" as a pyelonephritis risk factor, won't fire.
- Should "urinary tract problem" be any disorder of the urinary system, as encoded, or only
  structural abnormalities?
