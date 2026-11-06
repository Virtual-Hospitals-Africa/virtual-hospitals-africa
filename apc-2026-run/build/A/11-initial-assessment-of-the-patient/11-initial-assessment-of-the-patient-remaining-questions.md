# Page 11 – Initial assessment of the patient: remaining questions

## Decisions made

- **Trigger for the red-box questions.** This page has no presenting complaint: the red box applies
  to every patient. The language has no "every patient" anchor, so the `check_for` task is due to
  the root concept `(clinical_finding (snomed_concept "Clinical finding" "finding"))`. Descendants
  match in `due_to`, so the questions are asked once anything at all is recorded for the patient.
  Alternatives considered: an `or` of every common symptom and warning sign (a proxy list), or a
  vital-sign measurement (but the page puts the red box *before* routine vitals).
- **One Urgent priority evaluation** (`Urgent: initial assessment danger signs`), a plain `or` of the
  20 red-box items with no complaint wrapper, because the page's header is "the patient with any
  of". All items are `Urgent` as the page says "urgent attention". Several items are also warning
  signs with higher levels (Seizure = Emergency; chest pain, aggression, eye injury, coughing blood
  = Very urgent); those warning-sign rules keep their own levels. They were not escalated here.
- **"Headache *and* vomiting"** is `(and Headache Finding of vomiting)`; neither alone.
- **"Pregnant *with* abdominal pain/vaginal bleeding"** is `(and Pregnancy (or Abdominal pain,
  Bleeding from vagina))`. Pregnancy uses the `clinical_finding` form in both the `check_for` and
  the priority rule, since no rule on this page diagnoses pregnancy at `probable`.
- **"Recent sudden onset weakness, numbness or visual disturbance"**: each of Muscle weakness,
  Numbness, Visual disturbance carries both `Sudden onset` and `Recent` qualifiers (both must be
  recorded). The Cerebrovascular accident warning sign was not added, as the page does not name it.
- **"Aggressive, confused or agitated"**: Aggressive behavior (warning sign), Clouded consciousness
  (SNOMED synonym "confused"; parent of Acute confusion, chosen because the page does not say
  acute), Feeling agitated (`Agitation` does not exist).
- **"Suspected fracture or joint dislocation"**: Fracture of bone, Dislocation of joint. There is no
  "suspected" qualifier; recording the finding is taken as the suspicion.
- **"Purple/red rash that does not disappear with gentle pressure"**: Non-blanching rash *or*
  Purpuric rash (the latter is what VHA's rules already use for the same sign).
- **Measure tasks for conditional "routine" vitals.** Will's briefing says routine vitals need no
  task, but this page makes two of them conditional: glucose (red-box management: "If decreased
  consciousness, seizures, confused, unable to sit up or known diabetic, also check glucose") and
  respiratory rate + SpO₂ ("If coughing/difficulty breathing"). Both are encoded as `measure` tasks
  with those triggers. Weight, BP, pulse and temperature are routine for every patient and get no
  task. "Unable to sit up" and "Cough" are in the `check_for` only so those measure tasks can fire.
- **Pregnant / hypertension / diabetes branches** are `measure` tasks due to `(active_condition …)`:
  pregnancy → MUAC, height (for BMI); hypertension → height (BMI), waist circumference, glucose;
  diabetes → glucose, height (BMI), waist and hip circumference (waist-hip ratio). Weight and BP
  are routine. No `manage` tasks.
- No "X likely" / "consider X" statements on this page, so no diagnosis rules.
- The page has no "Shock/SBP < 80" or "BP < 90/60" wording in the red box.

## Could not model

- **"Ensure the patient with any of the following is seen promptly by nurse or doctor"**: BP ≥
  180/110 or systolic BP < 80; pregnant with BP ≥ 140/90; pulse irregular, ≥ 100 or < 50;
  temperature ≥ 38°C; respiratory rate ≥ 30; glucose < 3 (or < 4 if diabetic) or ≥ 11.1; SpO₂ <
  92% at rest; SpO₂ drop to < 87% on exertion. VHA's priorities are Emergency / Very urgent /
  Urgent only; the page clearly ranks "seen promptly" below the red box's "urgent attention", so
  encoding these as `Urgent` would over-triage. Not encoded (fires less often than the page
  intends: these patients get no priority from this page). RR ≥ 30 is also in the red box and is
  encoded there. "SpO₂ drop on exertion (walking 15-20 m)" and "pulse irregular" would also need
  forms the language lacks.
- **Visit timing**: "at booking visit", "every visit", "once a year", "3-6 monthly if trying to lose
  weight", "at 26 weeks", "at 30 and 36 weeks". Measure tasks fire whenever the condition is
  active (more often than the page intends for the yearly items).
- **Hb, urine dipstick, rapid rhesus, syphilis, HIV tests, visual acuity**: no observable or unit in
  the language. Conditional rules built on them ("urine dipstick only if fingerprick glucose ≥
  11.1", "fingerprick glucose only if glucose on urine dipstick on ≥ 2 occasions") are not encoded.
- **"Fingerprick glucose only if risk factor²"** in pregnancy (booking and 26 weeks): the risk
  factors (footnote 2) include glycosuria, BMI ≥ 35, age ≥ 40, obstetric history, SFH, ethnicity;
  not encoded (needs dipstick, gestational age and history items; glucose for pregnant patients is
  therefore not requested by this page's rules: fires less often).
- **BMI and waist-hip ratio** are derived values; only their inputs (height; waist and hip
  circumference) are requested.
- "Ensure patient is urgently seen by nurse or doctor" is the Urgent priority itself; no task.

## SNOMED gaps

- `Confusion` (finding): not found → Clouded consciousness (finding).
- `Agitation` (finding): not found → Feeling agitated (finding).
- `Drug overdose` (disorder): not found → Overdose (disorder), a child of Poisoning.
- `Victim of sexual assault` (finding): not found → Alleged victim of sexual assault (situation)
  with the Recent qualifier.
- "Breathless while talking": no exact concept → Unable to complete a sentence in one breath.
- All `finding_site` values (Face structure) confirmed to exist.

## Checker issues left in place

- None.

## Questions for a clinician

- Is anchoring the red-box questions on "any recorded clinical finding" acceptable, or should VHA
  add a true "initial assessment" trigger for every patient?
- Should the "seen promptly" vital-sign thresholds get a priority at all? VHA has nothing below
  Urgent; would you rather they were Urgent (over-triage) than unencoded?
- "Difficulty breathing" is not a descendant of the recorded common symptom Dyspnea (shortness of
  breath). Should every patient presenting with shortness of breath be Urgent from this page, i.e.
  add Dyspnea to the red-box `or`?
- Is requiring both "Sudden onset" and "Recent" on weakness/numbness/visual disturbance right, or
  should "Sudden onset" alone suffice?
- Should plain "Bleeding" (any bleeding, including minor) make the patient Urgent, as the page
  literally says?
