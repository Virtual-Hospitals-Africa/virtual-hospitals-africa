# Page 56 – Abdominal pain: remaining questions

## Decisions made

- **Presenting complaint** is `Abdominal pain` (finding), a recorded warning sign, so both
  `check_for` tasks and the urgent rule are anchored to it.
- **Red box → `Urgent: abdominal pain with danger signs`**, `(and Abdominal pain (or …))`. The five
  red-box "likely" items (abdominal aortic aneurysm, appendicitis, peritonitis, cholecystitis,
  pancreatitis) are probable diagnosis rules, referenced from the urgent rule by
  `active_condition`. Plain disease concepts are used (`Appendicitis`, `Cholecystitis`,
  `Pancreatitis`), not the "Acute …" children, because the page names the plain disease.
- **Infection likely** (guarding/rigidity + T ≥ 38 °C + abnormal vaginal discharge) is a probable
  `Infectious disease` rule, and its evidence is inlined in the urgent rule instead of
  `(active_condition Infectious disease)`, which other pages' infections could satisfy.
- **"Check for anaphylaxis 28"**: a `possible` anaphylaxis rule (sudden-onset abdominal pain and any
  listed feature or allergen exposure), which routes to the anaphylaxis check, plus the same
  logic as one branch of the urgent rule, because it sits inside the red box. Allergen exposure
  follows footnote 1: medication (`Drug or medicament`), food (generic `Food`), insect bite/sting.
- **BP < 90/60** is systolic < 90 or diastolic < 60 (Will's convention). On this page it appears in
  the anaphylaxis item; the other mentions are management.
- **No stools or flatus for the past 24 hours** → `Obstipation` (disorder) with
  `(>= (onset …) (time_ago 24 hours))`. The page says "for past 24 hours", i.e. onset at least 24 hours ago,
  so `>=` is the page's own direction; no comparator change was needed.
- **Pancreatitis "spreading to back"**: no `Pain radiating to back` concept; an `or` of `Pain
  radiating to lumbar region of back` and the left/right thoracic radiation concepts.
- **Non-urgent approach**: each "likely" becomes a probable rule — gastroenteritis (`Inflammation of
  stomach and intestine`, the FSN), dysmenorrhoea (`Menstrual cramp`), IBS, dyspepsia
  (`Indigestion`, the FSN), GORD. A `measure` task for BMI and waist circumference fires once
  dyspepsia is probable.
- The flowchart's branch conditions ("not needing urgent attention", "lower abdomen and a woman",
  the "No" to epigastric pain) are not encoded as negated preconditions; each likely rule fires on
  its own evidence.
- "Treat for lower abdominal pain (LAP) syndrome 64" is not a "likely" diagnosis and has no SNOMED
  concept; it is a pointer to page 64 and is not encoded (its discharge/cervical-motion findings
  are therefore not checked for on this page, except vaginal discharge, which the infection rule uses).
- Pointers (24, 177, 182, 19, 69, 57, 72, 64, 37, 60, 58, 131, 164, 156) and "Discuss/refer" are
  cross-references or management and are not encoded. "Check for pregnancy in all women of
  child-bearing potential" is represented by `Pregnancy` in the urgent `check_for`.

## Could not model

- **"Recent"** delivery/miscarriage/termination and gastroenteritis "recent onset" symptoms: no
  window is given, so not modelled → those items fire **more often** than the page intends.
- **"during peri-umbilical percussion"**: an examination technique; plain guarding/rigidity used
  → fires **more often** (guarding elicited any way counts).
- **Sex** ("lower abdomen *and* is patient a woman", waist ≥ 80 cm woman / ≥ 94 cm man, Hb by
  sex): the language has no sex criterion. The waist criterion is kept as `(or ≥ 80 ≥ 94)`, which
  is ≥ 80 cm for everyone → GORD fires **more often** for men with waist 80–94 cm.
- **IBS "pain relieved with passing stool"**: no concept; dropped from the `any2` → IBS fires
  **less often**.
- **Dyspepsia "worse with lying down/bending forward"**: no concept → dyspepsia (and GORD) fire
  **less often**. "Worse with eating" is `Epigastric pain` + `Postprandial` qualifier, and "hunger"
  is `Hunger pain`; whether the app records the Postprandial qualifier is unknown.
- **Discuss/refer list** (Hb < 12/13, melaena, dysphagia, persistent vomiting, weight loss, age >
  50 with recurrent symptoms, gastric surgery, family history of cancer): a referral step, not
  encoded (Hb also has no unit in the language).
- "Within past few hours" for allergen exposure (footnote 1): exposures recorded in the encounter
  are taken as recent, as on page 20.

## SNOMED gaps

- `Pain radiating to back` (finding): none → lumbar + thoracic L/R radiation concepts.
- `Absence of flatus` / no-stool concepts: none → `Obstipation` (disorder).
- `Abnormal vaginal discharge` (finding): none → `Vaginal discharge` (finding).
- `Gastroenteritis` (disorder): none by that FSN → `Inflammation of stomach and intestine`.
- `Dyspepsia` (finding/disorder): none → `Indigestion` (finding).
- `Cramping abdominal pain`, `Colicky abdominal pain`: none → `Abdominal colic` (finding).
- `Dysmenorrhea` (finding): only the disorder exists → `Dysmenorrhea` (disorder) as the diagnosis.
- Pain relieved by defecation; epigastric pain worse lying down/bending forward: none, not encoded.
- `Lower abdominal pain syndrome`: none.

## Checker issues left in place

- None.

## Questions for a clinician

- Is "infection likely" here a pelvic infection (PID) that should be named as such, rather than the
  generic `Infectious disease`?
- Should "recent" delivery/miscarriage/termination have a time window (e.g. 6 weeks)?
- Is `Obstipation` an acceptable reading of "no stools or flatus/wind for past 24 hours"?
- BMI: VHA computes BMI as a vital under its own concept (`MEASUREMENT_OF_BODY_MASS_INDEX`); this
  page measures `Body mass index` (observable entity). Should the GORD rule read the computed
  vital instead, so no separate measurement is needed?
- Should the non-urgent "likely" rules be gated on the absence of red-box findings and on the
  flowchart branch (lower abdomen/woman, epigastric pain)?
