# Page 56 – Abdominal pain: remaining questions (APC 2026)

## Decisions made

- **Trigger.** Both `check_for` tasks fire on `(clinical_finding Abdominal pain)`, which is a
  recorded warning sign (Urgent, or Very urgent with pregnancy). The page's Urgent priority rule is
  therefore partly redundant with the warning sign at triage, but it is kept because it is the page's
  own logic and records *why* the patient is urgent.
- **Red box → one Urgent priority**, `(and Abdominal pain (or …))`. The five "X likely" items (AAA,
  appendicitis, peritonitis, cholecystitis, pancreatitis) and "infection likely" are `probable`
  diagnosis rules referenced from the priority by `active_condition`.
- **Diagnosis concepts.** Acute appendicitis / Acute cholecystitis / Acute pancreatitis from the
  shared vocabulary, rather than the unqualified page words (which also exist in SNOMED).
- **"Infection likely"** encoded as `Female pelvic inflammatory disease`. The page says only
  "infection"; `Infectious disease` would make `(active_condition …)` in the priority match any active
  infection in any body system. Low confidence.
- **Anaphylaxis item.** "If sudden abdominal pain and any of: … check for anaphylaxis 28" is encoded
  twice: a `possible` Anaphylaxis diagnosis (which triggers the anaphylaxis check task on the
  anaphylaxis page) and a branch of the Urgent priority, because it is listed under "any of". The
  "possible allergen" is spelled out from footnote 1 (medication, food, insect bite/sting) as
  exposure findings, as on the gold page.
- **"No stools or flatus/wind for past 24 hours"** read as *neither* stools nor flatus:
  `Obstipation` and `Unable to break wind`, each with `(>= (onset …) (time_ago 24 hours))`.
- **Recent delivery/miscarriage/termination**: `Postpartum state`; `Miscarriage` and `Induced
  termination of pregnancy` with the `Recent` qualifier.
- **BP < 90/60** (anaphylaxis item) is systolic < 90 or diastolic < 60.
- **Non-urgent approach.** Gastroenteritis, dysmenorrhoea, dyspepsia, GORD and IBS "likely" items are
  `probable` rules with their findings in a second `check_for` task. GORD repeats the dyspepsia
  evidence inline rather than referencing the dyspepsia diagnosis, so all its evidence is checked for.
- **Measure task** for waist circumference and BMI, triggered by probable dyspepsia (BMI is not a
  routine vital for the checker).
- Management lines (IV fluids, antibiotics, morphine, omeprazole, lifestyle advice, referral
  criteria) are not encoded (`management_step`).

## Could not model

- **"during peri-umbilical percussion"**: the elicitation manoeuvre is not modelled; plain
  `Abdominal guarding` / `Abdominal rigidity` are used (fires at least as often as the page intends).
- **"Is patient a woman?"** and the sex-specific waist cut-offs (≥ 80 cm woman, ≥ 94 cm man): there is
  no sex predicate. The flowchart's Yes/No routing is not enforced, and GORD uses waist ≥ 80 cm for
  everyone, so it fires more often than intended for men with waist 80–93 cm.
- **"recent onset"** vomiting etc. (gastroenteritis) has no number; not modelled (fires more often).
- **"only during periods"** (dysmenorrhoea): "only" not modelled.
- **"pain relieved with passing stool"** (IBS): no SNOMED concept; the `any2` runs over the other three
  items, so IBS fires less often than intended.
- **Treat for lower abdominal pain (LAP) syndrome 64** (abnormal vaginal discharge or cervical
  excitation): no SNOMED concept for LAP syndrome; it is routing to page 64 and is not encoded.
- **"within past few hours"** for allergen exposure (footnote 1): exposures in the current encounter
  are taken as recent.
- Urinary symptoms → 69, ART → 131, weight loss → 37, constipation → 60, diarrhoea → 58, and the
  dyspepsia "discuss/refer if" list (Hb thresholds have no unit) are cross-references or referral
  steps.

## SNOMED gaps

- `Abnormal vaginal discharge` (finding): not found; used `Vaginal discharge problem`.
- `Pain radiating to back`: not found; used `Pain radiating to lumbar region of back`.
- `Gastroenteritis` (disorder): FSN is `Inflammation of stomach and intestine`.
- `Dyspepsia` (finding): FSN is `Indigestion`.
- `Body pain`: not found; used `Generalized aches and pains`.
- Cramping abdominal pain: used `Abdominal colic`.
- Epigastric pain worse with eating / lying down / bending: no precoordinated concepts; used
  `Epigastric pain` + `Postprandial` qualifier, `Hunger pain`, `Pain aggravated by position`.
- "Pain relieved by passing stool": none found (not encoded).
- Lower abdominal pain (LAP) syndrome: none found (not encoded).
- Pelvic infection: `Pelvic infection` not found and `Infection of pelvis` is bone infection; used
  `Female pelvic inflammatory disease`.

## Checker issues left in place

- None.

## Questions for a clinician

- Is "infection likely" (guarding/rigidity + T ≥ 38 °C + abnormal vaginal discharge) meant as pelvic
  inflammatory disease / pelvic peritonitis, or should it be a general infection?
- Should "No stools or flatus" require both (obstipation) or either one?
- Should the anaphylaxis item make the patient Urgent on this page, or only route to the anaphylaxis
  page (which has its own priority)?
- Is `Postpartum state` the right reading of "recent delivery", or should a time window apply?
