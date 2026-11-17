# Page 152 – Stroke: routine care: remaining questions

Reconciled from two independent builds (A and B); base B. See `reconcile.json` for every difference.

## Decisions made

- **Possible, not probable.** "Sudden onset of one or more of the following suggests a stroke" →
  `possible` Cerebrovascular accident (`Diagnose possible stroke from sudden-onset neurological
  symptoms`), an `or` of 15 symptom concepts, each with the `Sudden onset` qualifier. The page gives
  no confirming logic for a probable rule.
- **Red box → `Urgent: new stroke/TIA`** at `Urgent`, the page's word. Every bullet in the box is a
  management step (oxygen, nil by mouth, glucose → 19, BP handling, referral by time since onset,
  aspirin), so there is no "and any of" list. A new stroke/TIA is any one of the 15 sudden-onset
  symptoms, a recorded stroke (the `Focal neurology` warning-sign form, `Cerebrovascular
  accident`), or a `New` TIA. The warning sign itself already carries `Very urgent`; this rule does
  not lower it.
- **Trigger.** `Check for new stroke/TIA` fires on any of the symptoms recorded without an onset
  qualifier, or on the recorded stroke warning sign, and asks whether each symptom started
  suddenly and whether there is a new TIA. Of the symptoms, only Dizziness is a recorded common
  symptom; the others fire only if another page or the intake records them. The possible-stroke
  diagnosis is not used as a trigger: it only fires from findings this task records.
- **Symptom mapping.** "Weakness or numbness of face/arm/leg" → six concepts (weakness and
  numbness × face, upper limb, lower limb). "Blurred or decreased vision … or double vision" →
  Blurring of visual image, Reduced visual acuity, Diplopia. "Difficulty speaking or
  understanding" → Difficulty talking, Difficulty understanding verbal language. "Difficulty
  walking, dizziness, loss of balance or co-ordination" → Difficulty walking, Dizziness, Impairment
  of balance, Decreased coordination.
- **"Especially on one side of the body"** is emphasis, not a criterion; laterality is not encoded.
- **No `measure` task:** SpO₂, RR, glucose and BP are routine vitals.
- **Lower half of the page not modelled.** Assess / advise / treat the patient with previous
  stroke/TIA is routine care, education and medicines, as on gold page 20.
- **Shock and BP < 90/60** do not appear on this page.

## Could not model

- **TIA vs stroke.** "TIA if symptoms lasted < 24 hours and resolved completely" needs how long
  the symptoms lasted and whether they resolved; `onset` gives only when a symptom started. No
  separate TIA diagnosis is written. The possible-stroke rule also fires for TIAs (fires more often
  for stroke than the page intends; never less often for urgency). A TIA is caught directly only
  if the health worker records a `New` TIA.
- **"Within 3 hours of onset of symptoms"** only decides the referral route (management); not encoded.
- **Red-box thresholds** (SpO₂ < 94% or RR ≥ 30; glucose < 3, or < 4 with diabetes; BP ≥ 140/90
  and ≥ 220/120) only control management steps, so none are encoded as criteria.
- **Cholesterol > 7.5 / triglycerides > 10** (routine-care table) lead only to TSH and referral; not encoded.

## SNOMED gaps

- "Weakness of arm", "Weakness of leg", "Facial weakness": no FSN → `Muscle weakness of upper
  limb`, `Weakness of muscle of lower limb`, `Weakness of face muscles`.
- "Numbness of arm": no FSN → `Numbness of upper limb`.
- "Blurred vision" is only a synonym → `Blurring of visual image`.
- "Decreased vision": no FSN → `Reduced visual acuity` (alternative: `Sight deteriorating`).
- "Difficulty speaking": no FSN → `Difficulty talking`.
- "Difficulty understanding": no FSN → `Difficulty understanding verbal language` (alternative:
  `Difficulty comprehending speech`; the two are siblings, neither is-a the other).
- "Loss of balance": no FSN → `Impairment of balance`, the parent of `Poor balance` and `Unable to
  balance` (which has "loss of balance" as a synonym).
- "Loss of co-ordination": → `Decreased coordination`, the term already in the vocabulary
  (`Incoordination` also exists; siblings).
- "Hemiparesis" exists only as a disorder; not used.

## Checker issues left in place

- None.

## Questions for a clinician

- Should "suggests a stroke" be `probable` rather than `possible`?
- Should the red box be `Very urgent` (matching the Focal neurology warning sign) rather than the page's "urgent"?
- Is any single sudden-onset symptom on its own (e.g. sudden dizziness) enough to make the patient
  Urgent, as the page reads? Sudden dizziness alone may over-trigger.
- Should "difficulty speaking" also cover `Dysarthria` / `Aphasia` explicitly? (Neither is a
  descendant of `Difficulty talking`, so neither matches the current rule.)
- Is `Decreased coordination` the right reading of "loss of … co-ordination", or should
  `Incoordination` or `Ataxia` be used?
- Should "decreased vision" be `Reduced visual acuity` or `Sight deteriorating`?
- Should the routine-care table (fasting cholesterol and triglycerides at diagnosis, ECG, HIV)
  become `measure` tasks in a later pass?
