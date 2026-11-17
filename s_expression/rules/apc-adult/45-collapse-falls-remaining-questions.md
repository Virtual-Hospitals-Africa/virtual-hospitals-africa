# Page 45 – Collapse/Falls: remaining questions

Final build, reconciled from builders A and B (see `reconcile.json`).

## Decisions made

- **Complaint = Collapse or Falls.** Every task, diagnosis rule and the Urgent rule are anchored on
  `(or Collapse Falls)`. The page title is "COLLAPSE/FALLS" and the bottom box says "collapses/falls
  repeatedly", but both box headers say "the patient who has collapsed". This is unsettled (see
  questions).
- **Shock/SBP < 80** is encoded as the page writes it: `(or (clinical_finding Shock) (< SBP 80))`.
  Footnote 2 ("If SBP < 80, pulse ≥ 100, respiratory rate > 30, confusion/restlessness, weakness,
  shock likely") is not turned into a shock rule, per the all-pages decision not to build a shared
  shock definition.
- **Stroke/TIA bullet.** Face, arm and leg are encoded separately (`Weakness of face muscles`,
  `Muscle weakness of upper limb`, `Weakness of muscle of lower limb`, `Numbness of face`,
  `Numbness of upper limb`, `Numbness of lower limb`), all with `Sudden onset` for "new sudden".
  `Difficulty talking` and `Visual disturbance` also carry `Sudden onset`. Without it, any vision
  change would make the collapse urgent, which contradicts the page's own non-urgent faint
  prodrome ("vision changes before the collapse"). "Consider stroke or TIA" becomes two `possible`
  rules (CVA and TIA), each requiring the complaint.
- **Sudden collapse + allergy signs.** This is one red-box branch, `(and (Collapse + Sudden onset)
  (or …))`, and a `possible` anaphylaxis rule so that page 28's anaphylaxis check can run.
  "Generalised itch/rash" = `Generalized pruritus`, `Generalized rash`. "Exposure to possible
  allergen" uses footnote 1 (medication, food, insect bite/sting).
- **Recent injury** = `Traumatic injury` with the `Recent` qualifier.
- **Collapse with exercise** = `Collapse` qualified `During exercise`. **Collapse following
  vaccination** = `Vaccination given` (situation) under the complaint anchor.
- **Vomited blood or blood in stool** = Hematemesis, Hematochezia or Melena.
- **Glucose < 3 (or < 4 if diabetes)**: `(< glucose 3)` or `(and known diabetes (< glucose 4))`.
- **Pregnant or missed/overdue period with abdominal pain and vaginal bleeding**: `(and (or
  Pregnancy, Missed period, Menstrual period late) Abdominal pain, Abnormal vaginal bleeding)`.
- **Orthostatic hypotension.** The page's lying/standing BP instruction is a `measure` task (lying
  and standing systolic and diastolic, plus the observable "Level of reduction in systolic blood
  pressure on standing"). Q1 = Yes is `(>= systolic reduction 20)`.
- **Flowchart No branches** are encoded where the language can express them. Hyperventilation and
  common faint require a systolic reduction < 20. Common faint also requires an explicit No for
  `Tachypnea` and for `Excessively deep breathing` ("breathing very quickly or deeply").
- **Diagnosis concepts**: "Hyperventilation likely" = `Hyperventilation` (finding); "Common faint
  likely" = `Vasovagal syncope` (finding). Prodromal "weakness" = `Asthenia`; "vision changes" =
  `Visual disturbance`.
- Priority is `Urgent`, as the page says. Items that are also warning signs (seizure, chest pain)
  keep their own higher warning-sign priorities.

## Could not model

- **Diastolic BP drop ≥ 10** (Q1): there is no observable for a diastolic postural drop, and the
  language cannot subtract lying from standing values. Orthostatic hypotension therefore fires
  **less often** than the page intends. Hyperventilation and common faint can fire for a patient
  whose diastolic drop alone should have sent them to orthostatic hypotension.
- **Sequential preconditions**: because hyperventilation and common faint need a recorded systolic
  reduction, and common faint needs explicit Nos for fast or deep breathing, these rules fire
  **less often** when those items were not recorded.
- **Hb < 12 (woman) or < 13 (man): anaemia likely 44.** Haemoglobin has no unit or observable in
  the language. No rule was written, so the referral to page 44 is lost.
- **Asymmetry** of weakness/numbness is not expressed. The stroke/TIA and priority branches fire
  **more often** (for symmetric weakness too).
- **Timing**: "immediately before or during" the collapse, "before the collapse", "following"
  vaccination and "within the past few hours" (footnote 1) are not modelled. Findings recorded in
  the current encounter are taken as related to this collapse. "Recent" injury is carried only as
  a qualifier.
- **"Not needing urgent attention"**: the flowchart diagnoses cannot require the absence of the
  urgent priority, so they can fire alongside it.
- **ECG**: "Do an ECG" has no measurable unit. The result is captured as the finding
  `Electrocardiogram abnormal` in the urgent check, and the same-day referral is management.
- Not encoded, because they are referrals or cross-references: the substance-use screen (165),
  BP ≥ 140/90 (148), the Q3 = No branch (refer if coughing/swallowing/head turning; known
  diabetes 145), the final "if none of the above" box, management inside the "likely" boxes and
  the IV fluid line in the red box.

## SNOMED gaps

- "Family history of collapse": no concept. Used `Family history of syncope` (situation).
- "Difficulty speaking": no concept with that name. Used `Difficulty talking` (finding).
- "Weakness" (finding) does not exist. Used `Asthenia` (finding) for the prodromal weakness.
- "Common faint": no concept. Used `Vasovagal syncope` (finding).
- "Collapse following vaccination": no precoordinated concept. Used `Vaccination given` (situation)
  inside the complaint-conditioned rules.
- "Vaginal bleeding": used `Abnormal vaginal bleeding` (finding), the vocabulary concept.
- "Asymmetrical" qualifier: none (only `Asymmetry`). Not used.
- Diastolic postural drop: no observable (see Could not model).

## Checker issues left in place

- None.

## Questions for a clinician

- Should `Falls` without collapse also trigger this page's checks and urgent evaluation? The page
  title is "Collapse/Falls", but both boxes address "the patient who has collapsed".
- Does "new sudden" in the stroke/TIA bullet also apply to "difficulty speaking or visual
  disturbance" after the semicolon? The final build applies it to both.
- Footnote 2: does "shock likely" need any one of SBP < 80, pulse ≥ 100, RR > 30,
  confusion/restlessness or weakness, or all of them?
- Is `Family history of syncope` an acceptable stand-in for "family history of collapse"?
- Is `Vaccination given` (no time limit) acceptable for "collapse following vaccination", or
  should it be limited to the same day?
- Should "collapse with exercise" also cover collapse straight after exercise (`After exercise`)?
- Is `Vasovagal syncope` the right concept for "common faint", and `Hyperventilation` (rather
  than `Psychogenic hyperventilation`) for "hyperventilation likely"?
- Without a diastolic observable, should a recorded `Postural drop in blood pressure` finding also
  count as orthostatic hypotension?
- Should hyperventilation and common faint fire without a recorded BP drop or a recorded No for
  fast or deep breathing? The final build follows the page's arrows and requires them.
