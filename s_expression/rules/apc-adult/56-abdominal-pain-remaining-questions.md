# Page 56 – Abdominal pain: remaining questions (APC 2026, final reconciled build)

Merged from two independent builds (A and B). Base: B. See `reconcile.json` for each difference.

## Decisions made

- **Trigger.** Both `check_for` tasks fire on `(clinical_finding Abdominal pain)`, a recorded warning
  sign. The page's Urgent priority rule is partly redundant with the warning sign at triage, but it
  is kept because it is the page's own logic and records *why* the patient is urgent.
- **Red box → one Urgent priority**, `(and Abdominal pain (or …))`. The five red-box "likely" items
  (abdominal aortic aneurysm, appendicitis, peritonitis, cholecystitis, pancreatitis) are probable
  diagnosis rules, referenced from the urgent rule by `active_condition`.
- **Diagnosis concepts** are the page's words: `Appendicitis`, `Cholecystitis`, `Pancreatitis`, not
  the "Acute …" children in the shared vocabulary. Because descendants match, the urgent rule's
  `active_condition` also fires on the Acute forms diagnosed elsewhere.
- **Infection likely** (guarding/rigidity + T ≥ 38 °C + abnormal vaginal discharge) is a probable
  `Infectious disease` rule, as the page words it; its evidence is inlined in the urgent rule
  instead of `(active_condition Infectious disease)`, which any infection in any body system would
  satisfy.
- **"Check for anaphylaxis 28"**: a `possible` anaphylaxis rule plus the same logic as one branch of
  the urgent rule, because it is listed under "any of". Allergen exposure follows footnote 1:
  medication (`Drug or medicament`), food (`Food`), insect bite/sting.
- **BP < 90/60** is systolic < 90 or diastolic < 60 (Will's convention).
- **"No stools or flatus/wind for past 24 hours"** read as *neither* stools nor flatus:
  `Obstipation` and `Unable to break wind`, each with `(>= (onset …) (time_ago 24 hours))`. "For past
  24 hours" is onset at least 24 hours ago, so `>=` is the page's own direction.
- **Recent delivery/miscarriage/termination**: `Postpartum state`; `Miscarriage` and `Induced
  termination of pregnancy` with the `Recent` qualifier.
- **Pancreatitis "spreading to back"**: no `Pain radiating to back` concept; an `or` of `Pain
  radiating to lumbar region of back` and the left/right thoracic radiation concepts.
- **Abnormal vaginal discharge**: `Vaginal discharge problem` (a child of `Vaginal discharge`).
- **Non-urgent approach.** Gastroenteritis (`Inflammation of stomach and intestine`), dysmenorrhoea
  (`Abdominal colic` at lower abdomen, `During menstruation`), dyspepsia (`Indigestion`), GORD and
  IBS "likely" items are probable rules with their findings in a second `check_for` task. Dyspepsia:
  postprandial epigastric pain, or epigastric pain with hunger pain or positional aggravation. GORD
  repeats the dyspepsia evidence inline, so all its evidence is checked for.
- **Measure task** for waist circumference and BMI, triggered by `(active_condition Indigestion)`
  (the gold standard's form for a task following a diagnosis; it also matches a definite diagnosis).
- The flowchart's branch conditions ("not needing urgent attention", "lower abdomen and a woman",
  the "No" to epigastric pain) are not encoded as negated preconditions; each likely rule fires on
  its own evidence.
- "Check for pregnancy in all women of child-bearing potential" is represented by `Pregnancy` in the
  urgent `check_for`. Pointers (24, 177, 182, 19, 69, 28, 57, 72, 64, 37, 60, 58, 131, 164, 156),
  management lines (IV fluids, antibiotics, morphine, omeprazole, lifestyle advice) and "discuss/
  refer" are not encoded.

## Could not model

- **"Recent"** delivery has no time window (`Postpartum state`); "recent onset" gastroenteritis
  symptoms not modelled → fire **more often** than the page intends.
- **"during peri-umbilical percussion"**: the elicitation manoeuvre is not modelled; plain guarding/
  rigidity → fires **more often**.
- **Sex** ("lower abdomen *and* is patient a woman", waist ≥ 80 cm woman / ≥ 94 cm man, Hb by sex):
  no sex predicate. GORD uses waist ≥ 80 cm for everyone → fires **more often** for men with waist
  80–93 cm.
- **"only during periods"** (dysmenorrhoea): "only" not modelled.
- **IBS "pain relieved with passing stool"**: no concept; dropped from the `any2` → IBS fires **less
  often**.
- **Dyspepsia "lying down/bending forward"**: `Pain aggravated by position` is broader (any position)
  → may fire **more often**. Whether the app records the `Postprandial` qualifier is unknown.
- **Treat for lower abdominal pain (LAP) syndrome 64** (abnormal discharge or pain on moving
  cervix): no SNOMED concept for LAP syndrome; routing to page 64, not encoded.
- **Discuss/refer list** (Hb < 12/13, melaena, dysphagia, persistent vomiting, weight loss, age > 50
  with recurrent symptoms, gastric surgery, family history of cancer): a referral step, not encoded
  (Hb has no unit in the language).
- "Within past few hours" for allergen exposure (footnote 1): exposures recorded in the encounter
  are taken as recent, as on page 20.

## SNOMED gaps

- `Pain radiating to back` (finding): none → lumbar + thoracic L/R radiation concepts.
- `Absence of flatus` / no-stool concepts: none → `Obstipation` (disorder) + `Unable to break wind`.
- `Abnormal vaginal discharge` (finding): none → `Vaginal discharge problem`.
- `Gastroenteritis` (disorder): FSN is `Inflammation of stomach and intestine`.
- `Dyspepsia`: FSN is `Indigestion` (finding).
- `Body pain`: none → `Generalized aches and pains`.
- `Cramping abdominal pain`, `Colicky abdominal pain`: none → `Abdominal colic`.
- Epigastric pain worse with eating / lying down / bending: no precoordinated concepts → `Epigastric
  pain` + `Postprandial`, `Hunger pain`, `Pain aggravated by position`.
- Pain relieved by passing stool: none, not encoded.
- `Lower abdominal pain syndrome`: none.
- `Pelvic infection`: not found (`Infection of pelvis` is bone infection); not needed now that the
  page's word `Infectious disease` is used.

## Checker issues left in place

- None.

## Questions for a clinician

- Is "infection likely" (guarding/rigidity + T ≥ 38 °C + abnormal vaginal discharge) meant as pelvic
  inflammatory disease / pelvic peritonitis, rather than the generic `Infectious disease`?
- Should "No stools or flatus" require both (as encoded) or either one? Is `Obstipation` an
  acceptable reading of "no stools"?
- Should the red-box diagnoses be the "Acute …" concepts used elsewhere in VHA's vocabulary?
- Should "recent" delivery/miscarriage/termination have a time window (e.g. 6 weeks), and is
  `Postpartum state` the right reading of "recent delivery"?
- Should the anaphylaxis item make the patient Urgent on this page, or only route to the anaphylaxis
  page (which has its own priority)?
- BMI: VHA computes BMI as a vital under its own concept; this page measures `Body mass index`
  (observable entity). Should the GORD rule read the computed vital instead?
- Should the non-urgent "likely" rules be gated on the absence of red-box findings and on the
  flowchart branch (lower abdomen/woman, epigastric pain)?
