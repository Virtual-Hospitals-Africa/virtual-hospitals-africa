# Page 148 – Hypertension: diagnosis: remaining questions

## Decisions made

- **Trigger.** The red box's presenting complaint is a measurement: `(or (>= SBP 180) (>= DBP 110))`
  ("systolic BP ≥ 180 and/or diastolic BP ≥ 110"). "and/or" is read as `or` throughout. BP is a
  routine vital, so it needs no `measure` task.
- **Stroke likely.** The sudden-onset list becomes `Diagnose probable stroke with severely raised BP`
  (BP ≥ 180/110 and any of the seven sudden-onset findings). The description is page-specific so it
  does not clash with page 152's stroke rules. Every item carries the `Sudden onset` qualifier,
  following the line's lead-in "Sudden onset of:"; severe headache also carries `Severe`.
- **Hypertensive emergency** uses the page's own threshold (SBP ≥ 180 or DBP ≥ 130), **hypertensive
  urgency** uses SBP ≥ 180 or DBP ≥ 110. The rules are not made mutually exclusive: the page doesn't
  say so. A patient with severe headache and DBP ≥ 130 gets both diagnoses.
- **Heart failure likely** ("Difficulty breathing worse on lying flat or leg swelling") is a probable
  heart failure rule, limited to BP ≥ 180/110 because the statement sits inside the red box.
  Orthopnoea and leg swelling also count directly towards hypertensive urgency.
- **Shortness of breath/severe heart failure** = plain `Dyspnea` or `Heart failure` + `Severe`.
- **Chest pain/unstable angina** = `Chest pain` or `Preinfarction syndrome` (the FSN for unstable
  angina). The pointer to page 24 is not followed.
- **Priority.** One `Urgent` rule: BP ≥ 180/110 and any of the three red-box likely diagnoses
  (stroke, hypertensive emergency, hypertensive urgency). The header says "Give urgent attention".
  "Refer urgently" (emergency) vs "refer same day" (urgency) is a referral difference, so it isn't
  treated as an escalation to Very urgent.
- **Lower chart not encoded** (BP < 140/90, 140/90–179/109, ≥ 180/110 → mild / moderate / severe
  hypertension, CVD-risk follow-up). See Could not model.
- Management ("Manage and refer urgently/same day", amlodipine, enalapril, HCTZ, furosemide, oxygen)
  is accounted for as `management_step`.

## Could not model

- **eGFR < 15 / eGFR < 60.** No lab observable for eGFR. "Known kidney failure" and "Known kidney
  impairment" are encoded as `Renal failure syndrome` / `Renal impairment` + `Known present`, without
  the eGFR thresholds. Whether the rules then fire more or less often depends on how clinicians label
  kidney disease. A patient with eGFR 15–59 labelled "renal failure" would wrongly count towards
  emergency, so the emergency rule probably fires somewhat **more** often than the page intends.
  Because `Renal failure syndrome` is_a `Renal impairment`, known kidney failure also counts towards
  urgency, which is consistent with the page (eGFR < 15 is also < 60).
- **Diagnosing mild / moderate / severe hypertension.** These need repeated readings on 2 further
  occasions at least 2 days apart (or ≥ 3 readings after 1 hour's rest for ≥ 180/110), and averaging
  of the last 2 readings. The page says "Avoid diagnosing hypertension on one reading alone." The
  language compares single measurements only, so any rule would diagnose on one reading. Not encoded.
- **"Use the higher category if SBP and DBP differ"**, the averaging of readings and the third-reading
  rule: measurement technique, not representable.
- **CVD risk < 10% / ≥ 10%** (page 142) and the follow-up intervals (5 years / 1 year): not
  representable, and they are follow-up, not triage.
- **Age-based routine care** ("If < 30 years, refer…", "If > 65 years … start treatment only when BP >
  160/90"): management.

## SNOMED gaps

- "Unstable angina" (disorder) is not an FSN. Used `Preinfarction syndrome` (disorder), its FSN.
- "Difficulty speaking" (finding) is not an FSN. Used `Difficulty talking` (finding).
- "Weakness on 1 or both sides": no single concept. Used general `Muscle weakness` (finding);
  `Hemiparesis` covers one side only.
- "Kidney failure" has no plain FSN. Used `Renal failure syndrome` (disorder).

## Checker issues left in place

- None.

## Questions for a clinician

- Should hypertensive emergency be **Very urgent** rather than Urgent, given "Manage and refer
  urgently" vs "same day" for urgency?
- Should "Shortness of breath" in the emergency column mean any dyspnoea or only severe/acute
  dyspnoea? As encoded, any recorded dyspnoea with SBP ≥ 180 or DBP ≥ 130 makes hypertensive
  emergency probable.
- Seizure carries the `Sudden onset` qualifier here, so a plain recorded seizure doesn't match it.
  Should plain `Seizure` count?
- Should "heart failure likely" also be diagnosed when BP is below 180/110 (the statement is inside
  the red box, so it is limited to severely raised BP here)?
- Should a possible-hypertension rule from a single BP ≥ 140/90 reading prompt repeat readings,
  even though the page says not to diagnose on one reading?
