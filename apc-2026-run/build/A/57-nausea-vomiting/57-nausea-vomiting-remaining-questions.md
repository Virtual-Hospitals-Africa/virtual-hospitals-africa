# Page 57 – Nausea/vomiting: remaining questions

## Decisions made

- **Trigger.** Both check-for tasks fire on the common symptoms Nausea or Finding of vomiting.
- **Shock.** "Shock¹/SBP < 80" is encoded exactly as written: `(clinical_finding Shock)` or systolic
  BP < 80, as this page's own logic. Footnote 1's definition of shock is not imported.
- **BP < 90/60** (anaphylaxis item) = systolic < 90 or diastolic < 60.
- **Presenting complaint in likely-diagnosis rules.** Cholera, meningitis, peritonitis, appendicitis,
  pancreatitis, dehydration, dyspepsia and GORD rules require nausea or vomiting, because the page
  scopes them to the patient with nausea/vomiting. The gastroenteritis rule requires vomiting
  specifically ("recent onset vomiting with …").
- **Meningitis** fires on any one of neck stiffness, drowsy, acute confusion or purpuric rash, as
  the page's "or" reads. Drowsy and confused also count as separate urgent items.
- **Likely diagnoses in the red box** are referenced from the priority rule via
  `(active_condition X)`.
- **Anaphylaxis item** ("check for anaphylaxis 28") becomes a `possible` anaphylaxis rule (sudden
  nausea or vomiting and any listed feature or exposure), which triggers the anaphylaxis page. The
  same logic is repeated inline in the urgent priority rule, because the item is an urgent criterion
  and a `possible` diagnosis isn't counted as checked-for evidence.
- **Possible allergen** (footnote 2: medication, food or insect bite/sting) = exposure to Drug or
  medicament, exposure to Food, Insect bite - wound, Insect sting. "Within the past few hours" isn't
  modelled; exposures recorded at this encounter count as recent, as on gold page 20.
- **Cholera:** watery diarrhoea (Diarrhea + Watery qualifier) and exposure to *Vibrio cholerae* with
  `(<= (onset …) (time_ago 5 days))` for "in past 5 days".
- **Dyspepsia:** epigastric pain that is postprandial ("worse with eating"), or epigastric pain with
  hunger pain, or with pain aggravated by position ("lying down/bending forward").
- **Flowchart "No" branches** (Q1 = No before Q2) aren't modelled as negations, following the gold
  standard. The dyspepsia rule can therefore fire alongside gastroenteritis.
- **Measure task** for BMI and waist circumference fires once dyspepsia is likely, where the page
  places the GORD bullet. BMI isn't treated as a routine vital, because the checker requires it to
  be checked for.
- Glucose checking ("Check fingerprick glucose") needs no task, because glucose is a routine vital.
  Its thresholds point to page 19.

## Could not model

- **GORD waist threshold by sex:** "≥ 80cm (woman) or ≥ 94cm (man)". The language has no sex.
  Encoded as waist ≥ 94 cm for everyone, so the rule fires **less often** than the page intends
  (it misses women with a waist of 80–93 cm).
- **"Recent onset" vomiting** (gastroenteritis question) has no number. No time comparison is used,
  so the rule fires **more often** than the page intends (it includes long-standing vomiting).
- **"during peri-umbilical percussion"** (how guarding/rigidity is elicited) isn't modelled.
- **Footnote 2 timing** ("within the past few hours") isn't modelled. See above.
- **Dyspepsia's Discuss/refer criteria** (Hb < 12/13, melaena, dysphagia, persistent vomiting,
  weight loss, age > 50, etc.) are referral steps, so they're out of scope. Hb has no unit anyway.
- **"Nausea/vomiting persists > 2 weeks"** is a referral step, out of scope.

## SNOMED gaps

- No "Watery diarrhea" concept. Used `Diarrhea` (finding) + `Watery` (qualifier value).
- No "Dyspepsia" FSN. Used `Indigestion` (finding).
- No "Gastroenteritis" FSN. Used `Inflammation of stomach and intestine` (disorder).
- No concept for "pain spreading to back". Used `Pain radiating to lumbar region of back` (finding).
- No concept for "no stools or flatus". Used `Obstipation` (disorder).
- No "dry mouth" or "thirst" FSN. Used `Xerostomia` (finding) and `Increased thirst` (finding).
- No "cramping abdominal pain" FSN. Used `Abdominal colic` (finding).
- No concept for "pain worse lying down/bending forward". Used `Pain aggravated by position` (finding).
- No concept for "cholera outbreak area". Used exposure to `Vibrio cholerae` (organism).

## Checker issues left in place

- None.

## Questions for a clinician

- Should a single feature (e.g. drowsiness alone) with nausea/vomiting give probable meningitis, or
  should neck stiffness be required? The page's "or" was followed literally.
- Is "exposure to Vibrio cholerae" the right way to record "has been in cholera outbreak area"?
- Should the GORD waist threshold use 80 cm (more sensitive) until sex can be expressed?
- Should dyspepsia be suppressed when gastroenteritis is likely (flowchart Q1 = No)?
