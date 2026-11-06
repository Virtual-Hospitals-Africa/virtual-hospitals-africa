# Page 57 – Nausea/vomiting: remaining questions

## Decisions made

- **Trigger.** Both tasks fire on `Nausea` or `Finding of vomiting` (both recorded common symptoms).
  The urgent `check_for` covers every red-box item; a second task covers the "not needing urgent
  attention" approach and the Q1/Q2 algorithm.
- **Red-box "likely" diagnoses** (meningitis, peritonitis, appendicitis, pancreatitis) are
  `probable` rules that require nausea or vomiting, because the box is for "the patient with
  nausea/vomiting". The urgent rule refers to them via `active_condition`. Cholera also requires nausea or
  vomiting: the box is scoped to the patient with nausea/vomiting, and nausea alone satisfies
  "(with or without vomiting)". Appendicitis and pancreatitis use `Acute appendicitis` and
  `Acute pancreatitis`, the concepts in VHA's vocabulary.
- **Shock/SBP < 80** is encoded on this page as `Shock` (disorder) **or** systolic BP < 80, per the
  shared decision. Footnote 1 (the definition of shock) is not imported.
- **Anaphylaxis item.** "If sudden nausea/vomiting and any of … check for anaphylaxis ↻28" is
  encoded as `Diagnose possible anaphylaxis in nausea/vomiting` (to trigger the anaphylaxis page's
  checks) **and** as a branch of the urgent rule, because it is listed among the urgent items.
  "Possible allergen" uses footnote 2 (medication, food, insect bite/sting); "within the past few
  hours" is not modelled, as on the gold page 20.
- **Cholera outbreak area** is recorded as exposure to *Vibrio cholerae*, with "in past 5 days"
  written as `(<= (onset …) (time_ago 5 days))`, following the shared decision on time comparisons.
- **No stools or flatus/wind**: `Obstipation`, or `Constipation` together with a recorded No for
  `Passing flatus`.
- **Rapid deep breathing**: `Kussmaul's respiration`.
- **Spreading to back** (pancreatitis): `Pain radiating to lumbar region of back`. Back pain alone
  (`Backache`) is not used, because the page requires the abdominal pain to spread to the back.
- **Dyspepsia (heartburn)**: diagnosis concept `Indigestion` (the SNOMED name for dyspepsia);
  "worse with eating, hunger or lying down/bending forward" as `Pain provoked by eating`, `Hunger pain`
  or `Pain aggravated by position`.
- **Gastroenteritis**: diagnosis concept `Inflammation of stomach and intestine` (the SNOMED name
  for gastroenteritis).
- **Exclude pregnancy** → `possible` Pregnancy (Will's briefing: "exclude X" → possible).
- **BMI and waist circumference** are measured once dyspepsia is likely (`measure` task), because the
  GORD rule needs them.
- Glucose (routine vital) and all medicines, fluids and referral steps are management and are not
  encoded.

## Could not model

- **"Not needing urgent attention"**: the lower-half rules fire whether or not a red-box item
  applies. The flowchart's "Q1 = No" precondition for dyspepsia is not modelled either, so dyspepsia
  can be diagnosed alongside gastroenteritis (fires **more often** than the page intends).
- **"During peri-umbilical percussion"**: how guarding/rigidity is elicited is not representable;
  any recorded guarding or rigidity counts (fires **more often**).
- **"Recent onset" vomiting**: no span is given, so a `Recent` qualifier is used instead of an onset
  comparison. If the app cannot record that qualifier on vomiting, the gastroenteritis rule never
  fires (**less often**).
- **Sex-specific waist circumference** (≥ 80 cm woman, ≥ 94 cm man): sex is not representable. The
  rule uses ≥ 80 cm for everyone, so it fires **more often** than the page intends for men with a
  waist of 80–93 cm.
- **Pregnancy** in men: the possible pregnancy rule cannot be limited to women (fires **more often**).
- **Medication review, alcohol/drug screening, stress/anxiety, palliative care** and the
  "discuss/refer" lists (including Hb < 12/< 13, which has no unit in the language) are management
  or referral and are not modelled.
- Footnote 2's time window ("within the past few hours") for allergen exposure.

## SNOMED gaps

- No `Watery diarrhea` concept: `Diarrhea` with the `Watery` qualifier.
- No `Thirst` finding: `Thirst due to water deprivation` (in VHA vocabulary).
- No `Dry mouth` finding: `Xerostomia`.
- No concept for a cholera outbreak area: exposure to `Vibrio cholerae` (organism).
- No `Abdominal pain radiating to back` / `Pain radiating to back`:
  `Pain radiating to lumbar region of back` (narrower: lumbar only).
- No `Recent onset` qualifier: `Recent`.
- No `Gastroenteritis` or `Dyspepsia` FSN: `Inflammation of stomach and intestine` and `Indigestion`.
- `Shock` and `Hematemesis` exist only as disorders, used as such.

## Checker issues left in place

- None.

## Questions for a clinician

- Should the anaphylaxis item make the patient Urgent on this page (as encoded), or only prompt the
  anaphylaxis check on page 28?
- Is recording exposure to *Vibrio cholerae* an acceptable way to capture "has been in a cholera
  outbreak area"? An alternative is `History of travel with high risk of exposure to communicable disease`.
- For the waist threshold without sex: is ≥ 80 cm for everyone acceptable, or should the GORD rule
  drop the waist criterion until sex can be expressed?
- Should dyspepsia be suppressed when gastroenteritis is likely (flowchart Q1 = No)?
- Is `Acute appendicitis` / `Acute pancreatitis` right for "appendicitis/pancreatitis likely", or
  should the general concepts be used?
- Should drowsiness or confusion alone in a patient with nausea/vomiting give probable meningitis,
  as the box literally says, or should it also require another meningitis sign?
