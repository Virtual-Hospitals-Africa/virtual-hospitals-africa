# Page 11 – Initial assessment of the patient: remaining questions

## Decisions made

- **One Urgent priority rule for the whole red box.** The box reads "Give urgent attention to the
  patient with any of:", with no presenting complaint, so the rule is a plain `or` of the 21 items
  (`Urgent: initial assessment red-box signs`). Two items are compound: "Headache *and* vomiting"
  is an `and`; "Pregnant *with* abdominal pain/vaginal bleeding" is `(and Pregnancy (or Abdominal
  pain, Bleeding from vagina))`. Urgent only: the page does not escalate any item (several items are
  also warning signs that carry their own higher levels in `warning_signs.ts`).
- **Trigger for the check_for task.** The page applies to every patient, and there is no complaint
  to anchor to. The task fires on any recorded common symptom (or active Fever). A patient with no
  common symptom recorded is not asked. Low confidence; see questions.
- **Headache, vomiting and Dyspnea are not in the check_for**, because they are in the task's own
  `due_to` (constraint 3). They are common symptoms, so the priority rule may use them.
- **Confused** = `Clouded consciousness`, the concept VHA records for AVPU "Confused".
- **Breathless while talking** = `Unable to complete a sentence in one breath`.
- **Overdose of drugs/medication** = `Overdose` (disorder), a child of Poisoning. No "Drug overdose" concept exists.
- **Recent sexual assault** = `Victim of sexual aggression` (synonym "sexual assault") with the
  `Recent` qualifier. No time window is given, so no onset comparison.
- **Recent sudden onset weakness, numbness or visual disturbance**: each of `Muscle weakness`,
  `Numbness`, `Visual disturbance` with both `Recent` and `Sudden onset` qualifiers.
- **Suspected fracture or joint dislocation** = `Fracture of bone` or `Dislocation of joint`. The
  health worker's "yes" stands for "suspected".
- **Eye injury** = `Injury of eye region` (general; the warning sign `Injury of globe of eye` is a descendant).
- **Vomiting blood** = `Hematemesis` (general; the warning sign `Vomiting blood - fresh` is a descendant).
- **Purple/red rash that does not disappear with gentle pressure** = `Non-blanching rash`.
  `Purpuric rash` (warning sign, common in VHA's rules) is not related to it in SNOMED.
- **Pregnancy** as `clinical_finding` in both the check_for and the priority rule (no rule
  diagnoses Pregnancy at probable).
- **Measure tasks**: glucose when there is decreased consciousness, seizures, confusion, inability to sit up or
  known diabetes (red-box management line; also the diabetes box "Check at every visit:
  Fingerprick glucose"). Respiratory rate and SpO₂ when there is coughing or difficulty breathing (routine-tests
  box). These are routine vitals in VHA, but the page makes them conditional, so they are written
  as tasks. `Unable to sit up` and known diabetes are asked in the check_for so the glucose task can fire.
- Shock / BP < 90/60: not on this page.

## Could not model

- **"Ensure the patient with any of the following is seen promptly by nurse or doctor"** (BP ≥
  180/110 or systolic BP < 80, pregnant with BP ≥ 140/90, pulse irregular, ≥ 100 or < 50,
  temperature ≥ 38°C, RR ≥ 30, glucose < 3 (< 4 if diabetic) or ≥ 11.1, SpO₂ < 92% at rest, drop to <
  87% on exertion). This is a lower tier than "urgent attention", and the language's lowest priority
  is Urgent. It is not encoded. Encoding it as Urgent would fire more often than the page intends.
  "Pulse irregular" and "drop on exertion (walking 15-20m)" would also need concepts or
  measurements that the language lacks.
- **Visit-frequency checks** in the pregnant / hypertension / diabetes boxes ("at booking visit",
  "once a year", "at 26 weeks", "at 30 and 36 weeks", "3-6 monthly"). The language has no visit
  frequency. Encoding MUAC, BMI, waist or hip circumference as every-visit measure tasks would fire more often than the
  page intends, so they are not encoded.
- **Lab tests**: Hb, rapid rhesus, syphilis, HIV, urine dipstick (and "only if fingerprick glucose ≥
  11.1", "only if glucose on urine dipstick on ≥ 2 occasions") have no observable or unit in the language.
- **Visual acuity** (diabetes, once a year): there is no unit, and no frequency.
- Gestational-diabetes risk factors (footnote 2) gate "fingerprick glucose only if risk factor".
  These are not encoded because of the frequency gap above.
- "Ensure patient is urgently seen by nurse or doctor" is the Urgent priority itself. It is not a task.

## SNOMED gaps

- No concept for "suspected fracture". `Fracture of bone` is used instead.
- No "Drug overdose". `Overdose` is used instead.
- No "Breathless while talking". `Unable to complete a sentence in one breath` is used instead.
- All `finding_site` values used (`Face structure`) resolve.

## Checker issues left in place

- None.

## Questions for a clinician

- Decreased consciousness: VHA's AVPU records "Reacts to voice", "Reacts to pain" and "Unresponsive"
  as `Impairment of mental alertness`, `Responds to pain` and `Unresponsive`, which are not descendants of
  `Decreased level of consciousness`. Should the priority rule also accept these AVPU values?
- What should trigger the red-box check for a patient whose complaint is not a recorded common
  symptom? Should it fire for every patient at first contact?
- Should the "seen promptly" tier map to Urgent, or stay unencoded until a lower priority level exists?
- Confused: is `Clouded consciousness` (the AVPU form) correct here, or `Acute confusion`?
- Is `Non-blanching rash` correct here, or should `Purpuric rash` be used (or both)?
