# Page 152 – Stroke: routine care: remaining questions

## Decisions made

- **Possible, not probable.** The page says sudden onset of one or more of the listed symptoms "suggests a stroke". This is read as "suspect", so it becomes a `possible` diagnosis of `Cerebrovascular accident` (disorder). A `probable` reading would let the priority rule use `(active_condition …)`. A clinician should confirm which reading is right.
- **The red box ("Give urgent attention to the patient with a new stroke/TIA") becomes `Urgent: new stroke/TIA`.** Every bullet in the box is a management step (oxygen, nil by mouth, glucose, BP handling, referral, aspirin), so there is no "and any of" list. A new stroke/TIA counts as any one of the 15 sudden-onset symptoms, which the check task records. The rule is `Urgent`, not `Emergency`, because the page says "urgent".
- **Trigger.** `Check for new stroke/TIA` fires on any of the symptoms recorded without an onset qualifier, and asks whether each one started suddenly. Of these symptoms, only Dizziness is a recorded common symptom. The others fire only if another page or the intake records them.
- **Symptom mapping.** "Weakness or numbness of face/arm/leg" becomes six concepts: weakness and numbness, each for the face, the upper limb and the lower limb. "Blurred or decreased vision … or double vision" becomes Blurring of visual image, Reduced visual acuity and Diplopia. "Difficulty speaking or understanding" becomes Difficulty talking and Difficulty understanding verbal language. "Difficulty walking, dizziness, loss of balance or co-ordination" becomes Difficulty walking, Dizziness, Poor balance and Decreased coordination.
- **"Especially on one side of the body"** is not required. The page gives it as emphasis, not as a criterion.
- **Lower half of the page not modelled.** The sections assessing, advising and treating the patient with a previous stroke/TIA are routine care, as on gold page 20.
- **Shock and BP < 90/60** do not appear on this page.

## Could not model

- **TIA vs stroke.** "TIA if symptoms lasted < 24 hours and resolved completely" needs both how long the symptoms lasted and whether they resolved. Neither can be expressed: `onset` gives only when a symptom started. No separate TIA diagnosis is written. The possible-stroke rule fires for TIAs too, which matches the page's "stroke/TIA" grouping in the red box.
- **"Within 3 hours of onset of symptoms"** only decides the referral route, which is management. It is not encoded.
- **Red-box thresholds** (SpO₂ < 94% or RR ≥ 30; glucose < 3, or < 4 with diabetes; BP ≥ 140/90 and ≥ 220/120) only control management steps, so none are encoded as criteria.

## SNOMED gaps

- "Weakness of arm", "Weakness of leg": no FSN. Used `Muscle weakness of upper limb` and `Weakness of muscle of lower limb`.
- "Facial weakness": no FSN. Used `Weakness of face muscles`.
- "Numbness of arm": no FSN. Used `Numbness of upper limb`.
- "Blurred vision" is only a synonym. Used `Blurring of visual image`.
- "Decreased vision": no FSN. Used `Reduced visual acuity` (alternative: `Sight deteriorating`).
- "Difficulty speaking": no FSN. Used `Difficulty talking`.
- "Difficulty understanding": no FSN. Used `Difficulty understanding verbal language`.
- "Loss of balance": no FSN. Used `Poor balance`.
- "Loss of co-ordination": used `Decreased coordination`, the term already in the vocabulary (`Incoordination` also exists).

## Checker issues left in place

- None.

## Questions for a clinician

- Should "suggests a stroke" be `probable` rather than `possible`?
- Is any single sudden-onset symptom on its own (e.g. sudden dizziness) enough to make the patient Urgent, as the page reads? Sudden dizziness alone may over-trigger.
- Should "decreased vision" be `Reduced visual acuity` or `Sight deteriorating`?
- Should the routine-care table (fasting cholesterol and triglycerides at diagnosis, ECG, HIV) become `measure` tasks in a later pass?
