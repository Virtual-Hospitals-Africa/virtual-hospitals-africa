# Page 151 – Heart failure: routine care: remaining questions

## Decisions made

- **Trigger.** Heart failure is written as `(clinical_finding (snomed_concept "Heart failure" "disorder"))`
  in both the `check_for` task and the priority rule. No rule on this page diagnoses heart failure at
  `probable` (the page says a doctor must confirm the diagnosis), so `active_condition` would not be
  recognised as checked for.
- **Red box → one `Urgent` priority evaluation**: heart failure AND any of chest pain, rapid
  worsening of symptoms, respiratory rate ≥ 30, difficulty breathing, BP < 90/60, new wheeze.
  The page doesn't escalate past "urgent", so the level is `Urgent`.
- **BP < 90/60** is encoded as systolic < 90 or diastolic < 60, following Will's convention.
- **Rapid worsening of symptoms** is encoded as heart failure qualified `Worsening` with a nested
  `Rapid` qualifier. SNOMED has no precoordinated concept for this (see SNOMED gaps).
- **Measure task for body weight** (kg). The Assess table says to check weight at every visit. Body
  weight isn't a routine vital, so it gets a `measure` task. No rule consumes it (see Could not model).
- **Not encoded:**
  - The red box's management lines (oxygen, furosemide, isosorbide dinitrate, enalapril).
  - The Advise and Treat sections.
  - The Assess table's referral steps ("If fainting/blackouts, refer same day", "If new irregular
    pulse, refer same day", the pregnancy referral, the substance-use pointer to page 165, and the
    BP pointers to pages 148/149).
  These are management, referral or cross-reference content, which this pass leaves out.
- **No shock definition imported.** Footnote 3 ("If SBP < 80, pulse ≥ 100, respiratory rate > 30,
  confusion/restlessness, weakness, shock likely") belongs to the carvedilol contraindication
  "cardiogenic shock". It was not encoded (see Could not model and Questions).

## Could not model

- **Comparing weight.** "Assess changes in fluid balance by comparing with weight when patient least
  symptomatic" and "If patient gains ≥ 2kg in 2 days" both compare two weights. The language has
  no way to compare a measurement with an earlier one, so weight is only measured.
- **Lab values.** Creatinine/eGFR, potassium, Hb and TSH thresholds (eGFR < 60 / ≥ 60 / < 30,
  creatinine increase > 20%, potassium > 5.0) have no unit or observable in the language
  (`not_representable`). They are all management or monitoring steps anyway, so no rule fires more
  or less often because of this.
- **Footnote 3, "shock likely".** The footnote lists SBP < 80, pulse ≥ 100, respiratory rate > 30,
  confusion/restlessness and weakness, separated by commas. It doesn't say whether one sign is
  enough or several are needed. Encoding either reading would add logic the page doesn't state.
  The footnote also only serves a medication contraindication. If it were encoded with `or`, a
  probable cardiogenic shock rule would fire on weakness alone, which is far more often than the
  page intends.

## SNOMED gaps

- **"Rapid worsening of symptoms":** searches for "rapidly worsening", "symptom worsening",
  "worsening heart failure" and the qualifier "Rapidly progressive" found nothing.
  - Substitute: `Heart failure` + `(qualifier Worsening (qualifier Rapid))`.
  - `Decompensated cardiac failure` (disorder) exists but was not used, because it names a
    diagnosis rather than the page's symptom wording.

## Reconciliation

- Builders A and B agreed on every condition except the form of "Rapid worsening of symptoms":
  A gave heart failure two sibling qualifiers (`Worsening`, `Rapid`); B nested `Rapid` inside
  `Worsening`. The final build keeps B's nested form, because the page's "Rapid" modifies
  "worsening", not heart failure (the grammar's qualifier allows nested qualifiers).

## Checker issues left in place

- None.

## Questions for a clinician

- Footnote 3: does "shock likely" need all of the listed signs, any one of them, or SBP < 80 plus
  one other? Should heart-failure patients with cardiogenic shock be escalated above `Urgent`?
- Should "rapid worsening of symptoms" be recorded as worsening heart failure, as here, as
  `Decompensated cardiac failure` (disorder), or as worsening of each symptom (for example dyspnoea
  or leg swelling)?
- Should "fainting/blackouts" and "new irregular pulse" (refer same day) get their own priority
  evaluation, at a level below `Urgent`?
- The red box says "difficulty breathing", but the page's definition of heart failure also includes
  breathlessness that worsens on lying down or with effort. Should any difficulty breathing in a
  known heart-failure patient make them urgent? That is what the page says, and it is encoded that way.
