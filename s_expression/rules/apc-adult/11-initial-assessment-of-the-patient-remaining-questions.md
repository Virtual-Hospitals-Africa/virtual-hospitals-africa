# Page 11 – Initial assessment of the patient: remaining questions

Final build reconciled from two independent builds (A and B). Base: A. See `reconcile.json`.

## Decisions made

- **Trigger for the red-box questions.** This page has no presenting complaint: the red box applies
  to every patient. The language has no "every patient" anchor, so the `check_for` task is due to
  the root concept `(clinical_finding (snomed_concept "Clinical finding" "finding"))`. Descendants
  match in `due_to`, so the questions are asked once anything at all is recorded for the patient.
  The other build anchored on the list of common symptoms (plus active Fever). That would skip a
  patient with no common symptom recorded, so the reconciler kept the root concept.
- **One Urgent priority evaluation** (`Urgent: initial assessment danger signs`): a plain `or` of the
  red-box items with no complaint wrapper, because the header says "the patient with any of". All
  items are `Urgent` because the page says "urgent attention". Several items are also warning signs
  with higher levels (Seizure = Emergency; chest pain, aggression, eye injury and coughing blood =
  Very urgent). Those warning-sign rules keep their own levels and were not escalated here.
- **"Headache *and* vomiting"** is `(and Headache Finding of vomiting)`. Neither one alone counts.
- **"Pregnant *with* abdominal pain/vaginal bleeding"** is `(and Pregnancy (or Abdominal pain,
  Bleeding from vagina))`. Pregnancy uses the `clinical_finding` form everywhere, including the
  booking-visit measure task, because no rule diagnoses pregnancy at `probable`.
- **"Recent sudden onset weakness, numbness or visual disturbance"**: each of Muscle weakness,
  Numbness and Visual disturbance carries both the `Sudden onset` and `Recent` qualifiers. The
  Cerebrovascular accident warning sign was not added, because the page does not name it.
- **"Aggressive, confused or agitated"**: Aggressive behavior (a warning sign); Clouded consciousness
  (the AVPU "Confused" form, a parent of Acute confusion, chosen because the page does not say
  acute); Feeling agitated (`Agitation` does not exist).
- **"Overdose of drugs/medication"** = `Overdose` (disorder), a child of Poisoning. No "Drug
  overdose" concept exists.
- **"Recent sexual assault"** = `Victim of sexual aggression` (finding; SNOMED synonym "sexual
  assault") with the `Recent` qualifier. It was chosen over `Alleged victim of sexual assault`
  (situation) because the page does not say "alleged". No time window is given, so there is no
  onset comparison.
- **"Suspected fracture or joint dislocation"** = Fracture of bone or Dislocation of joint. There is
  no "suspected" qualifier; the health worker's "yes" stands for the suspicion.
- **Eye injury** = `Injury of eye region` (general; the warning sign `Injury of globe of eye` is a
  descendant). **Vomiting blood** = `Hematemesis` (general; the warning sign `Vomiting blood - fresh`
  is a descendant).
- **"Purple/red rash that does not disappear with gentle pressure"** = Non-blanching rash *or*
  Purpuric rash. The page's words describe both. The two are not related in SNOMED, and Purpuric
  rash is the concept VHA's rules already use for this sign.
- **"Known diabetic"** is asked in the `check_for` in Will's known-chronic-condition form
  (`Diabetes mellitus` + `Known present`). The glucose tasks fire on that form or on
  `(active_condition Diabetes mellitus)` from the patient's record.
- **Measure tasks for conditional "routine" vitals.** The page makes two of them conditional:
  - glucose (red-box management line: "If decreased consciousness, seizures, confused, unable to
    sit up or known diabetic, also check glucose");
  - respiratory rate and SpO₂ ("If coughing/difficulty breathing"). The trigger is Cough, Dyspnea
    (the recorded common-symptom form) or Difficulty breathing.

  Weight, BP, pulse and temperature are routine for every patient and get no task. Unable to sit up,
  Cough, Headache and vomiting are in the `check_for` so the tasks and the priority can fire.
- **Pregnant / hypertension / diabetes branches** are `measure` tasks:
  - pregnancy → MUAC and height (for BMI);
  - hypertension → height (BMI), waist circumference and glucose;
  - diabetes → glucose, height (BMI), and waist and hip circumference (waist-hip ratio).

  Weight and BP are routine. The other build left these branches out because visit frequency
  cannot be expressed. The reconciler kept them because the page lists them as checks. They are
  marked unsettled (see Questions). There are no `manage` tasks.
- There are no "X likely" / "consider X" statements on this page, so there are no diagnosis rules.
- The page has no "Shock/SBP < 80" or "BP < 90/60" wording in the red box.

## Could not model

- **"Ensure the patient with any of the following is seen promptly by nurse or doctor"**:
  - BP ≥ 180/110 or systolic BP < 80;
  - pregnant with BP ≥ 140/90;
  - pulse irregular, ≥ 100 or < 50;
  - temperature ≥ 38°C;
  - respiratory rate ≥ 30;
  - glucose < 3 (or < 4 if diabetic) or ≥ 11.1;
  - SpO₂ < 92% at rest;
  - SpO₂ drop to < 87% on exertion.

  VHA's priorities are Emergency / Very urgent / Urgent only, and the page ranks "seen promptly"
  below the red box's "urgent attention". Encoding these items as `Urgent` would over-triage, so
  they are not encoded. The page's rules therefore fire less often than it intends: these patients
  get no priority from this page. RR ≥ 30 is also in the red box and is encoded there. "SpO₂ drop on
  exertion (walking 15-20 m)" and "pulse irregular" would also need forms the language lacks.
- **Visit timing**: "at booking visit", "every visit", "once a year", "3-6 monthly if trying to lose
  weight", "at 26 weeks", "at 30 and 36 weeks". Measure tasks fire whenever the condition is
  present, which is more often than the page intends for the booking-visit and yearly items.
- **Hb, urine dipstick, rapid rhesus, syphilis, HIV tests and visual acuity**: there is no
  observable or unit for them in the language. The conditional rules built on them ("urine dipstick
  only if fingerprick glucose ≥ 11.1", "fingerprick glucose only if glucose on urine dipstick on ≥ 2
  occasions") are not encoded.
- **"Fingerprick glucose only if risk factor²"** in pregnancy (booking visit and 26 weeks): the
  footnote-2 risk factors include:
  - glycosuria;
  - BMI ≥ 35;
  - age ≥ 40;
  - obstetric history;
  - SFH large for gestational age;
  - ethnicity.

  They are not encoded, because they need dipstick, gestational-age and history items. Glucose for
  pregnant patients is therefore not requested by this page's rules, so they fire less often than
  the page intends.
- **BMI and waist-hip ratio** are derived values; only their inputs (height, and waist and hip
  circumference) are requested.
- "Ensure patient is urgently seen by nurse or doctor" is the Urgent priority itself, not a task.

## SNOMED gaps

- `Confusion` (finding) was not found, so Clouded consciousness (finding) is used.
- `Agitation` (finding) was not found, so Feeling agitated (finding) is used.
- `Drug overdose` (disorder) was not found, so Overdose (disorder) is used.
- "Breathless while talking" has no exact concept, so Unable to complete a sentence in one breath is
  used.
- There is no concept for "suspected fracture", so Fracture of bone is used.
- All `finding_site` values (Face structure) were confirmed to exist.

## Checker issues left in place

- None.

## Questions for a clinician

- Is anchoring the red-box questions on "any recorded clinical finding" acceptable, or should VHA
  add a true "initial assessment" trigger for every patient?
- Should the "seen promptly" vital-sign thresholds get a priority at all? VHA has nothing below
  Urgent. Would you rather they were Urgent (over-triage) than unencoded?
- **Unsettled (reconciler):** should the pregnant / hypertension / diabetes branch checks (MUAC,
  height, waist and hip circumference, yearly glucose) be measure tasks that fire at every visit,
  or be left out until VHA can express visit frequency?
- "Difficulty breathing" is not a descendant of the recorded common symptom Dyspnea. Should every
  patient presenting with shortness of breath be Urgent from this page, i.e. should Dyspnea be added
  to the red-box `or`? Dyspnea currently triggers only the RR/SpO₂ measure task.
- Decreased consciousness: VHA's AVPU records "Reacts to voice", "Reacts to pain" and "Unresponsive"
  as `Impairment of mental alertness`, `Responds to pain` and `Unresponsive`. These are not
  descendants of `Decreased level of consciousness`. Should the priority rule also accept them?
- Confused: is `Clouded consciousness` (the AVPU form) correct here, or `Acute confusion`?
- Purple/red non-blanching rash: are both `Non-blanching rash` and `Purpuric rash` right, or only one?
- Is requiring both "Sudden onset" and "Recent" on weakness/numbness/visual disturbance right, or
  should "Sudden onset" alone suffice?
- Should plain "Bleeding" (any bleeding, including minor) make the patient Urgent, as the page
  literally says?
