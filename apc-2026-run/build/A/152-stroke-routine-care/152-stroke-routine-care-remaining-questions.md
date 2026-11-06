# Page 152 – Stroke: routine care: remaining questions

## Decisions made

- **"Sudden onset of one or more of the following suggests a stroke"** → `possible` Cerebrovascular
  accident (`Diagnose possible stroke from sudden-onset neurological symptoms`), an `or` of the
  15 symptom concepts, each with the `Sudden onset` qualifier. "Suggests" is read as possible,
  not probable; the page gives no confirming logic for a probable rule.
- **Red box → `Urgent: new stroke/TIA`** at `Urgent`, the page's own word. Evidence: a recorded
  stroke (the `Focal neurology` warning-sign form, `Cerebrovascular accident`), a `New` TIA, or the
  possible-stroke diagnosis. The warning sign itself already carries `Very urgent`, so a recorded
  stroke still reaches Very urgent through the warning sign; this rule does not lower it.
- **Every red-box bullet is management** (oxygen, nil by mouth, glucose check → 19, BP advice,
  referral by time since onset, aspirin). None is a triage criterion, so all are
  `management_step`. The box header is used as the trigger/priority citation.
- **Trigger of the check task:** `Dizziness` (a recorded common symptom and one of the page's
  stroke symptoms), the stroke warning sign, or the possible-stroke diagnosis (gold pre-screen
  pattern).
- **No `measure` task:** SpO₂, RR, glucose and BP are routine vitals.
- **"especially on one side of the body"** is an emphasis, not a requirement; laterality is not encoded.
- **Weakness/numbness of face/arm/leg** split into six precoordinated concepts (face / upper limb /
  lower limb × weakness / numbness).
- The "Assess / Advise / Treat the patient with previous stroke/TIA" sections are routine care,
  education and medicines; not encoded.

## Could not model

- **TIA vs stroke:** "(or a transient ischaemic attack (TIA) if symptoms lasted < 24 hours and
  resolved completely)". The language cannot express that a finding has resolved, so no TIA
  diagnosis rule is written. The same symptoms give possible stroke; a TIA is caught only if the
  health worker records a `New` TIA. Effect: a TIA patient is labelled possible stroke (fires more
  often for stroke than the page intends, never less often for urgency).
- **"within 3 hours of onset of symptoms"** decides the referral route only (management), so it is
  not encoded as a time comparison.
- **Cholesterol > 7.5 / triglycerides > 10** (routine-care table) lead only to TSH and referral;
  not encoded.

## SNOMED gaps

- "Difficulty speaking" (finding) does not exist → `Difficulty talking` (finding).
- "Difficulty understanding speech" does not exist → `Difficulty comprehending speech` (finding).
- "Loss of balance" (finding) is not an FSN → `Unable to balance` (finding), which has it as a synonym.
- "Lack of coordination" / "Poor coordination" do not exist → `Incoordination` (finding).
- "Decreased vision" (finding) does not exist → `Reduced visual acuity` (finding).
- "Hemiparesis" exists only as a disorder; not used.

## Checker issues left in place

- None.

## Questions for a clinician

- Should the red box be `Very urgent` (matching the Focal neurology warning sign) rather than the
  page's "urgent"?
- Is triggering the stroke symptom check on any dizziness acceptable, or too broad?
- Should "difficulty speaking" also cover `Dysarthria` / `Aphasia` explicitly? (The SNOMED tool
  says neither is a descendant of `Difficulty talking`, so neither matches the current rule.)
- Is `Incoordination` the right reading of "loss of … co-ordination", or should `Ataxia` be used?
