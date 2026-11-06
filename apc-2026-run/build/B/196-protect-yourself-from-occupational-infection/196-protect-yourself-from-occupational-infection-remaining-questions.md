# Page 196 – Protect yourself from occupational infection: remaining questions

## Decisions made

- **Red box → one `check_for` task and one Urgent priority evaluation.** The task fires on a recorded
  `Sharps injury` (this also matches its child `Accidental needle stick injury`) and asks about exposure
  to each listed fluid. The priority evaluation is `(and Sharps injury (or <exposure to any listed fluid>))`.
  The page's "Give urgent attention" maps to `Urgent`; nothing on the page escalates it further.
- **Exposure form.** Each fluid is written as `(finding "Exposure to (contextual qualifier)" <substance>)`,
  the pattern page 20 uses for food and drug exposure.
- **Combined line split.** "Pleural/pericardial/peritoneal/amniotic/synovial/cerebrospinal fluid" became
  six substances, each of which exists exactly.
- **Possible TB.** "Identify patients with possible TB promptly: The patient has TB symptoms¹" is encoded as a
  `possible` Tuberculosis rule. The evidence is footnote 1: cough, fever ≥ 2 weeks, unexplained weight loss
  or night sweats. I read "≥ 2 weeks" as applying to fever only, and wrote it as
  `(>= (onset (active_condition Fever)) (time_ago 2 weeks))`.
- No flowchart file: the page has no Yes/No branches or algorithm.
- Everything else on the page (standard precautions, protective gear, vaccination, HIV testing, facility
  cleaning/ventilation/waiting areas, sharps bins, TB self-screening every 6 months, respiratory hygiene)
  is prevention or management advice for the health worker or facility. It is outside the box, so it needs
  no accounting, and it is not encoded.

## Could not model

- **"Splash to eye/mouth/nose/broken skin."** No SNOMED finding exists for a splash or mucocutaneous
  exposure. The rule fires only after a sharps injury, so a splash exposure alone does **not** become
  Urgent (**fires less often** than the page intends). The closest concept is the event
  `Exposure to blood and/or body fluid` (event). It isn't a clinical finding, and it isn't clear the app can
  record it.
- **"Health worker."** The language has no occupation criterion. The rules apply to any adult with a
  sharps injury and exposure (**fires more often**). In practice this is harmless.
- **"Blood-stained … tissue".** There's no substance concept for tissue (only `Body tissue material`, a
  surgical material), so this isn't encoded (**fires less often**).
- **"Drenching" night sweats.** There's no severity qualifier for drenching, so plain `Night sweats` is used
  (**fires more often**).

## SNOMED gaps

- `Semen` (substance) doesn't exist. I used `Seminal fluid` (substance). Its parent is `Semen component`, and
  `Male genital fluid` would be broader.
- Wound secretions: there's no wound exudate or secretion substance. I used `Exudate` (substance), which is
  broader (exudate from any site). `Wound discharge` exists only as a finding on the patient.
- Blood-stained fluid: there's no such substance. I used `Serosanguinous fluid` (substance). `Bloody discharge`
  (substance) was the alternative.
- Splash or mucosal exposure: none found (searched splash, contamination, mucosal, body fluid exposure).
- Drenching night sweats: none found.

## Checker issues left in place

- None.

## Questions for a clinician

1. Should a splash exposure without a sharps injury also be Urgent? If so, we need a way to record it. One
   option is to treat any recorded exposure to one of these fluids as Urgent on its own.
2. Are `Exudate`, `Serosanguinous fluid` and `Seminal fluid` acceptable stand-ins for "wound secretions",
   "blood-stained fluid" and "semen"?
3. In "cough, fever ≥ 2 weeks", does "≥ 2 weeks" apply to cough as well? Here it applies to fever only.
4. Should the TB-symptom screen on this infection-control page be its own `possible` TB rule, or left to the
   TB pages?
