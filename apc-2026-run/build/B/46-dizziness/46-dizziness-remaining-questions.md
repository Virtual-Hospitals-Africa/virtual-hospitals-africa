# Page 46 – Dizziness: remaining questions

## Decisions made

- **Trigger.** All tasks are triggered by `(clinical_finding Dizziness)`, a recorded common symptom.
- **Red box → `Urgent: dizziness with danger signs`**, `(and Dizziness (or …))`, at `Urgent` as the
  page says (the stroke items are not escalated to Very urgent).
- **Shock/SBP < 80** encoded as this page's own `(or (clinical_finding Shock) (< SBP 80))`. The
  footnote's shock definition is not imported.
- **"New sudden"** is encoded as the `Sudden onset` qualifier (no separate `New` qualifier), applied to
  every item of the stroke bullet (weakness/numbness of face, arm, leg; difficulty speaking; visual
  disturbance) and to the severe-dizziness item. "Asymmetric" is not encoded.
- **"New sudden severe dizziness with nausea/vomiting, abnormal eye movements/walk"** read as sudden
  severe dizziness **and any of** nausea, vomiting, abnormal eye movements, abnormal gait.
- **"Difficulty breathing, especially on lying flat with leg swelling"**: "especially" is emphasis;
  Difficulty breathing alone triggers. Orthopnoea and leg swelling are not separate criteria.
- **Glucose < 3 (or < 4 if diabetes)**: `(or (< glucose 3) (and known diabetes (< glucose 4)))`.
- **"consider stroke or TIA"** → two `possible` rules (Cerebrovascular accident; Transient ischemic
  attack), each from dizziness and any of the sudden neuro items.
- **Flowchart diagnoses** (`probable`): hyperventilation (tachypnoea or deep breathing); positional
  vertigo (sudden-onset positional vertigo, no hearing loss/tinnitus, no tachypnoea/deep breathing);
  vestibular neuronitis (sudden-onset dizziness with nausea or vomiting, no hearing loss/tinnitus, no
  tachypnoea/deep breathing). The `(no …)` conditions follow the flowchart's "No" branches.
- **Lying and standing BP** are requested by a `measure` task, because the page tells the health worker
  to measure them.

## Could not model

- **Orthostatic hypotension likely** (systolic drop ≥ 20 or diastolic drop ≥ 10 from lying to
  standing): the language cannot compare two measurements. No diagnosis rule; the lying/standing BP
  measurements are taken but no rule consumes them. Consequently the downstream rules cannot require
  "no postural drop", so hyperventilation, positional vertigo and vestibular neuronitis can fire
  in a patient with orthostatic hypotension (fire more often than the page intends).
- **Anaemia likely if Hb < 12 (woman) / < 13 (man)**: Hb has no unit/observable in the language;
  not encoded (the page points to page 44).
- **Episode duration** ("lasting seconds", "lasting hours/days"): only onset comparisons exist.
  Positional vertigo and vestibular neuronitis therefore fire more often (a positional-vertigo
  patient with nausea can meet both).
- **"immediately before or during the collapse"**: timing relative to a collapse not encoded; the
  hyperventilation rule does not require a collapse (fires more often).
- Approach bullets (ear symptoms → 50, fainting/collapse → ECG, substance use → 165, medication
  review, BP ≥ 140/90 → 148, TSH, refer) are management or cross-references.
- "May have preceding flu-like illness" is optional ("may") and not a criterion.

## SNOMED gaps

- `Vestibular neuronitis` (disorder) has no FSN; used `Vestibular neuronitis of inner ear` (disorder).
- `Hyperventilation` exists only as a finding; used as the diagnosis concept.
- `Positional vertigo` exists only as a finding; used as the diagnosis concept and, with Sudden onset,
  as the evidence for "sudden dizziness precipitated by head movements" (no head-movement-precipitated
  dizziness concept found).
- `Shock` exists only as a disorder; `Hearing loss` only as a disorder.
- No "asymmetric" qualifier used (`Asymmetry` exists but was not applied).

## Checker issues left in place

- None.

## Questions for a clinician

- Should the hyperventilation rule require a recorded collapse/faint, as the question's wording
  ("during the collapse") suggests?
- Should vestibular neuronitis exclude positional vertigo explicitly (`(no Positional vertigo)`),
  since the page separates them by episode duration, which the system cannot record?
- Is diagnosing `Positional vertigo` (finding) right, or should it be `Benign paroxysmal positional
  vertigo` (the Epley manoeuvre suggests BPPV)?
- Should "asymmetric" weakness/numbness be required (e.g. via the `Asymmetry` qualifier)?
