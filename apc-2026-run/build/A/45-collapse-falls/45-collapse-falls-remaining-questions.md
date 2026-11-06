# Page 45 – Collapse/Falls: remaining questions

## Decisions made

- **Complaint = Collapse or Falls.** The red-box header says "the patient who has collapsed", but the
  page title (and the bottom box: "collapses/falls repeatedly") treats collapse and falls as one
  complaint. Triggers and the Urgent rule use `(or Collapse Falls)`. Neither is a recorded common
  symptom or warning sign; `Collapse` (finding) is the concept the briefing names for collapse.
- **Shock/SBP < 80** is encoded as this page's own `(or (clinical_finding Shock) (< SBP 80))`.
  Footnote 2 ("If SBP < 80, pulse ≥ 100, respiratory rate > 30, confusion/restlessness, weakness,
  shock likely") is not turned into a shock rule: the all-pages decision says not to build a shared
  shock definition, and the footnote does not say whether it means any one or all of these.
- **Stroke/TIA:** "consider stroke or TIA" becomes two `possible` rules (Cerebrovascular accident,
  Transient ischemic attack). The `Sudden onset` qualifier expresses "new sudden" on the
  weakness/numbness items only. "Difficulty speaking or visual disturbance" follow the semicolon
  and are left unqualified. "Asymmetric" is not encoded separately.
- **Sudden collapse with anaphylaxis features** is one branch of the Urgent rule. It is also a
  `possible` Anaphylaxis rule, so that the anaphylaxis page's `check_for` runs ("check for
  anaphylaxis 28"). The allergens come from footnote 1: medication, food, insect bite/sting.
  "Within the past few hours" is not modelled. Itch and rash are unqualified, as in the gold.
- **Collapse with exercise** = `Collapse` qualified `During exercise`. **Collapse following
  vaccination** = `Vaccination given` (situation) under the complaint anchor.
- **Family history of collapse** uses `Family history of syncope`.
- **Vomited blood or blood in stool** = Hematemesis, Hematochezia or Melena.
- **Glucose < 3 (or < 4 if diabetes)** = glucose < 3, or known diabetes and glucose < 4 (mmol/L).
- **Pregnant or missed/overdue period with abdominal pain and vaginal bleeding** =
  `(and (or Pregnancy, Missed period) Abdominal pain, Abnormal vaginal bleeding)`.
- **Flowchart:** orthostatic hypotension, hyperventilation and common faint are `probable` rules.
  The earlier "No" answers are not required, as in the gold standard. All three can fire together,
  so the rules fire more often than the page's sequence intends. Timing words ("immediately before
  or during", "before the collapse") are not modelled.
- Common faint = `Vasovagal syncope` (finding). Hyperventilation likely = `Hyperventilation`
  (finding). "Weakness" in the faint prodrome = `Asthenia`. "Vision changes" = `Visual
  disturbance`, the same concept as the stroke item.
- Priority stays `Urgent` throughout, as the page says, even where an item (Seizure, Chest pain) is
  a warning sign that carries a higher level of its own.

## Could not model

- **Diastolic BP drop ≥ 10 on standing.** SNOMED has only `Level of reduction in systolic blood
  pressure on standing` (observable entity). Only the systolic arm (≥ 20 mmHg) is encoded, with a
  `measure` task for it. The orthostatic hypotension rule therefore fires **less often** than the
  page intends. `Postural drop in blood pressure` (finding) exists but has no threshold.
- **Hb < 12 (woman) / < 13 (man) → anaemia likely.** Haemoglobin has no observable or unit in
  the language, so no anaemia rule is written here (page 44 covers anaemia).
- "Do an ECG. If abnormal, refer same day": the ECG result is captured as `Electrocardiogram
  abnormal` in the red box; the referral is management.
- Substance-use screening (→165), BP ≥ 140/90 (→148), "if known diabetes 145", "collapse
  associated with coughing, swallowing, head turning, refer" and the bottom box are routing or
  referral. They are not encoded.
- Management inside the "likely" boxes (medication review, fluids, advice, referral criteria) and
  the IV fluid line in the red box are management steps.

## SNOMED gaps

- "Difficulty speaking": no FSN. Used `Difficulty talking` (finding).
- "Vaginal bleeding": no exact FSN as a finding. Used `Abnormal vaginal bleeding` (finding), the
  vocabulary concept. `Bleeding from vagina` also exists.
- "Family history of collapse": none. Used `Family history of syncope` (situation).
- "Collapse following vaccination": no precoordinated concept. Used `Vaccination given` (situation).
- "Asymmetrical" qualifier: none (only `Asymmetry`). Not used.
- Diastolic postural reduction observable: none (see Could not model).

## Checker issues left in place

- None.

## Questions for a clinician

- Should a fall without collapse trigger the urgent screen, or only collapse?
- Footnote 2: does "shock likely" need any one of SBP < 80, pulse ≥ 100, RR > 30,
  confusion/restlessness or weakness, or all of them?
- Is `Family history of syncope` an acceptable stand-in for "family history of collapse"?
- Should "collapse with exercise" also cover collapse straight after exercise (`After exercise`)?
- Without a diastolic observable, should a recorded `Postural drop in blood pressure` finding also
  count as orthostatic hypotension?
