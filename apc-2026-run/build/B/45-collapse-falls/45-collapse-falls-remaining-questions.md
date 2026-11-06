# Page 45 – Collapse/Falls: remaining questions

## Decisions made

- **Trigger.** All tasks and the priority evaluation are triggered by `Collapse` (finding), the
  concept VHA's rules already use. The red box and the approach box both address "the patient who
  has collapsed". `Falls` (finding) exists but is not used as a trigger (see questions).
- **Shock/SBP < 80** is encoded exactly as the page writes it: `(or (clinical_finding Shock)
  (< SBP 80))`. Footnote 2 ("If SBP < 80, pulse ≥ 100, respiratory rate > 30,
  confusion/restlessness, weakness, shock likely") is not turned into a shock rule, per the
  all-pages decision not to build a shared shock definition.
- **Stroke/TIA bullet.** Each sign (face weakness, limb weakness, face numbness, limb numbness,
  difficulty talking, visual disturbance) carries `Sudden onset` for "new sudden". "Consider stroke
  or TIA" becomes two `possible` rules (CVA and TIA), each requiring collapse.
- **Sudden collapse + allergy signs.** Encoded as one red-box branch, `(and (Collapse + Sudden
  onset) (or …))`, and as a `possible` anaphylaxis rule so that page 28's anaphylaxis check can run.
  "Exposure to possible allergen" uses footnote 1 (medication, food, insect bite/sting): exposure to
  `Drug or medicament`, exposure to `Food`, `Insect bite - wound`, `Insect sting`.
- **Glucose < 3 (or < 4 if diabetes)**: `(< glucose 3)` or `(and known diabetes (< glucose 4))`.
- **Pregnant or missed/overdue period with abdominal pain and vaginal bleeding**: `(and (or
  Pregnancy, Missed period, Menstrual period late) Abdominal pain, Abnormal vaginal bleeding)`.
- **Blood in stool** covers both `Hematochezia` and `Melena`.
- **Orthostatic hypotension.** The page's lying/standing BP instruction is a `measure` task (lying
  and standing systolic and diastolic, plus the observable "Level of reduction in systolic blood
  pressure on standing"). Q1 = Yes is `(>= systolic reduction 20)`.
- **Flowchart No-branches** are encoded where expressible: hyperventilation and common faint
  require the systolic reduction < 20; common faint also requires an explicit No for tachypnoea and
  hyperpnoea.
- **Diagnosis concepts**: "Hyperventilation likely" → `Hyperventilation` (finding); "Common faint
  likely" → `Vasovagal syncope` (finding).
- Priority is `Urgent`, as the page says. Items that are also warning signs (seizure, chest pain)
  keep their own higher warning-sign priorities.

## Could not model

- **Diastolic BP drop ≥ 10** (Q1): there is no observable for a diastolic postural drop, and the
  language cannot subtract the lying and standing measurements. Orthostatic hypotension therefore
  fires **less often** than the page intends, and hyperventilation/common faint can fire for a
  patient whose diastolic drop alone should have routed them to orthostatic hypotension.
- **Hb < 12 (woman) or < 13 (man): anaemia likely 44.** Haemoglobin has no unit or observable in
  the language. No rule was written; the referral to page 44 is lost.
- **Asymmetry** of weakness/numbness is not expressed. The stroke/TIA and priority branches fire
  **more often** (for symmetric weakness too).
- **Timing**: "recent" injury, "immediately before or during" the collapse, "before the collapse",
  "following" vaccination, "within the past few hours" (footnote 1). Findings recorded in the current
  encounter are taken as related to this collapse.
- **"Not needing urgent attention"**: the flowchart diagnoses cannot require the absence of the
  urgent priority, so they can fire alongside it.
- **ECG**: "Do an ECG" has no measurable unit. The result is captured as the finding
  `Electrocardiogram abnormal` in the urgent check.
- Substance-use screen (165), BP ≥ 140/90 (148), Q3 = No branch (coughing/swallowing/head turning:
  refer; known diabetes 145), and the final "if none of the above" box are referrals or
  cross-references. They are not encoded.

## SNOMED gaps

- "Family history of collapse": no concept. Used `Family history of syncope` (situation).
- "Difficulty speaking": no concept with that name. Used `Difficulty talking` (finding).
- "Weakness" (finding) does not exist. Used `Asthenia` (finding) for the prodromal weakness.
- "Common faint": no concept. Used `Vasovagal syncope` (finding).
- "Collapse following vaccination": no precoordinated concept. Used `Vaccination given` (situation)
  inside the collapse-conditioned priority.
- Diastolic postural drop: no observable (see Could not model).
- Body sites used (`Face structure`, `Tongue structure`) were confirmed with `snomed exists`.

## Checker issues left in place

- None.

## Questions for a clinician

- Should `Falls` (without collapse) also trigger this page's checks and urgent evaluation? The page
  title is "Collapse/Falls", but the red box only names "the patient who has collapsed".
- Is `Vaccination given` (no time limit) acceptable for "collapse following vaccination", or should
  it be limited to the same day?
- Is `Vasovagal syncope` the right concept for "common faint", and `Hyperventilation` (rather than
  `Psychogenic hyperventilation`) for "hyperventilation likely"?
- Should hyperventilation and common faint also require that the patient did not need urgent
  attention, if a future language feature allows it?
