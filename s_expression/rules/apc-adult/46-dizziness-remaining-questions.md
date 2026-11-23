# Page 46 – Dizziness: remaining questions

## Decisions made

- **Trigger.** Every task and rule is anchored on `(clinical_finding Dizziness)`, a recorded
  common symptom.
- **Red box → `Urgent: dizziness with danger signs`.** The structure is `(and Dizziness (or …))`. The rule
  uses `Urgent` because the page says "give urgent attention". Chest pain and focal neurology
  carry their own higher warning-sign priority elsewhere.
- **Shock/SBP < 80** is encoded exactly as written on this page: `(or (clinical_finding Shock)
  (< SBP 80))`. The footnote ("If SBP < 80, pulse ≥ 100, respiratory rate > 30,
  confusion/restlessness, weakness, shock likely") is not encoded as a shared shock definition.
- **"New sudden severe dizziness with nausea/vomiting, abnormal eye movements/walk"** is read as
  dizziness (Sudden onset + Severe) **and** any of nausea, vomiting, abnormal eye movements or
  abnormal walk.
- **"Difficulty breathing, especially on lying flat with leg swelling"** is encoded as difficulty
  breathing alone, because "especially" is emphasis and not a requirement.
- **Glucose < 3 (or < 4 if diabetes)** is encoded as glucose < 3, **or** known diabetes and glucose < 4.
- **Unable to stand without support** → `Unable to stand alone` rather than `Unable to stand` (reconciler: "without support" is "alone"; `Unable to stand`, though in VHA's vocabulary, would miss a patient who can stand only with support).
- **"Breathing very … deeply"** → `Excessively deep breathing` rather than `Deep breathing` (reconciler: the page's "very" makes the breathing excessive; `Deep breathing` is in VHA's vocabulary and is a sibling under `Finding of depth of respiration`).
- **"Consider stroke or TIA"** → two `possible` rules (stroke = `Cerebrovascular accident`, and
  `Transient ischemic attack`). Each needs dizziness and any sudden-onset focal sign.
- **Hyperventilation likely** is diagnosed (probable) from dizziness **and** collapse **and**
  (tachypnoea **or** excessively deep breathing). The question asks about breathing "before or
  during the collapse", so a collapse is required.
- **The No branch of the hyperventilation question** is written as `(or (no Collapse) (and (no
  Tachypnea) (no Excessively deep breathing)))`. VHA's evidence code throws "Not supported not"
  on a `(not …)`, so the exclusion uses De Morgan's law.
- **Hearing loss/tinnitus → Refer** produces no diagnosis. Both are used as `(no …)` exclusions in
  the two vertigo rules.
- **Positional vertigo likely:** the evidence is the sudden-onset `Positional vertigo` finding,
  plus the exclusions above. The diagnosis concept is also `Positional vertigo` (finding), the
  page's own term, not `Benign paroxysmal positional vertigo`.
- **Vestibular neuronitis likely:** the evidence is sudden-onset dizziness with onset at least 1 hour
  ago, nausea or vomiting, and the exclusions. "May have preceding flu-like illness" is supportive
  and not required, so it is not encoded. The diagnosis concept is `Vestibular neuronitis of inner
  ear`.
- **Measure task:** lying and standing systolic/diastolic BP (mmHg), as the page instructs.
- **No `manage` tasks.** Fluids for shock, ORS, Epley, referrals and TSH are management.

## Could not model

- **Orthostatic hypotension likely** ("Does systolic BP drop by ≥ 20 or diastolic BP drop by ≥
  10?"): the language cannot compare two measurements, so there is no probable rule. The lying
  and standing BPs are measured but no rule uses them. As a result, the hyperventilation,
  positional vertigo and vestibular neuronitis rules do not exclude patients with an orthostatic
  drop, so they **fire more often** than the page intends.
- **Anaemia likely (Hb < 12 woman / < 13 man):** haemoglobin has no observable or unit in the
  language. There is no rule (page 44 covers anaemia).
- **Check BP ≥ 140/90 → 148:** a cross-reference to the hypertension page. Not encoded here.
- **"Asymmetric"** (focal signs): no laterality is encoded, so the stroke/TIA and urgent rules may
  **fire more often** (e.g. bilateral numbness).
- **"Immediately before or during the collapse"** (timing of fast breathing): not modelled.
- **"Lasting seconds"** (positional vertigo): episode duration cannot be expressed.
- **"Lasting hours/days"** (vestibular neuronitis): approximated as onset at least 1 hour ago, written
  as `>=` per the time-comparison rule. This is an approximation of episode length.
- **Ask about ear symptoms (→ 50), fainting/collapse (ECG), substance use (→ 165), medication
  review (fluoxetine, antihypertensives, antiseizure drugs, furosemide, efavirenz), TSH:** these
  are history and management steps with no diagnostic rule on this page.

## SNOMED gaps

- **Dizziness precipitated by head movements:** there is no precoordinated concept, and there is no
  "head movement" concept to use with the `Provoked by` attribute. The substitute is `Positional
  vertigo` (finding).
- **Asymmetric / one-sided weakness or numbness:** `Unilateral` (qualifier value) exists but is not
  used. A second qualifier would have to be recorded with each sign.
- **Orthostatic BP drop:** there is no finding for a measured postural drop.

- `Vestibular neuronitis` (disorder) has no FSN; `Vestibular neuronitis of inner ear` (disorder) is used.
- `Hyperventilation` and `Positional vertigo` exist only as findings; they are used as the diagnosis concepts.
- `Asymmetry` (qualifier value) also exists and is not applied.

## Checker issues left in place

- None.

## Questions for a clinician

1. Is it acceptable that the vertigo/hyperventilation rules cannot exclude an orthostatic BP drop
   (Q1)? Or should a recorded "Orthostatic hypotension" finding be checked for and used as a
   `(no …)` exclusion?
2. Should positional vertigo be diagnosed as `Benign paroxysmal positional vertigo` (the page
   recommends the Epley manoeuvre, which treats BPPV)?
3. Is "onset at least 1 hour ago" a reasonable cut-off between "seconds" (positional vertigo) and
   "hours/days" (vestibular neuronitis)?
4. Should the hyperventilation rule require a collapse, or does fast/deep breathing with dizziness
   alone count?
5. Should the stroke/TIA findings carry a `Unilateral` qualifier to reflect "asymmetric"?
6. Should vestibular neuronitis explicitly exclude positional vertigo (`(no Positional vertigo)`), since the page separates them by episode duration, which the system cannot record?
7. (Reconciler) Builders disagreed on whether hyperventilation needs a recorded collapse; the final build requires one, following the question's wording "during the collapse". Confirm.
8. (Reconciler) Builders disagreed on approximating "lasting hours/days" as onset at least 1 hour ago; the final build keeps it. Confirm, or drop the time condition.
