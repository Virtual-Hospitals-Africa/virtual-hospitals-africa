# Page 196 – Protect yourself from occupational infection: remaining questions

Reconciled final build (base: builder A; builder B's blood-stained fluid substance and possible-TB rule added).

## Decisions made

- **Red box → one `check_for` task and one `Urgent` priority evaluation.** The trigger is
  `(or Sharps injury, Exposure to blood and/or body fluid)`; the priority evaluation is
  `(and (or sharps injury, splash stand-in) (or …exposure to each listed fluid…))`. "Give urgent
  attention" maps to `Urgent`; nothing on the page escalates it further.
- **Splash to eye/mouth/nose/broken skin** is represented by the event
  `Exposure to blood and/or body fluid` (broader than the page; see SNOMED gaps). Without it, a
  splash exposure alone would never become Urgent.
- **Exposure form.** Each fluid is written as `(finding "Exposure to (contextual qualifier)" <substance>)`,
  the pattern page 20 uses. The combined line "Pleural/pericardial/peritoneal/amniotic/synovial/cerebrospinal
  fluid" became six substances, each of which exists exactly.
- **Possible TB.** "Identify patients with possible TB promptly: The patient has TB symptoms¹" is encoded
  as a `possible` Tuberculosis rule. The evidence is footnote 1: cough, fever ≥ 2 weeks, unexplained
  weight loss or night sweats, with "≥ 2 weeks" read as applying to fever only, written as
  `(>= (onset (active_condition Fever)) (time_ago 2 weeks))`.
- **Management** (cleaning, irrigation, PEP pointer to page 135) is not encoded (no `manage` tasks).
- Everything else outside the box (standard precautions, protective gear, vaccination, HIV testing,
  facility cleaning/ventilation/waiting areas, sharps bins, TB self-screening every 6 months, respiratory
  hygiene) is prevention advice for the health worker or facility and is not encoded.
- No flowchart file: the page has no Yes/No branches or algorithm.

## Could not model

- **"Health worker."** The language has no occupation criterion. The rules apply to any adult with a
  sharps injury/body-fluid exposure and an exposure to a listed fluid (**fires more often**).
- **Route specificity of the splash** (eye, mouth, nose, broken skin): not expressible with the stand-in
  event; it fires for any recorded blood/body-fluid exposure event (**fires more often**). It is also not
  clear whether the app can record this event concept.
- **"Blood-stained … tissue".** No substance concept for tissue (only `Body tissue material`, a surgical
  material), so the "/tissue" part is not encoded (**fires less often**).
- **"Drenching" night sweats.** No severity qualifier; plain `Night sweats` is used (**fires more often**).

## SNOMED gaps

- **Splash to eye/mouth/nose/broken skin**: no splash, mucous-membrane or non-intact-skin exposure concept
  (searched splash, contamination, mucosal, body fluid exposure). Substitute: `Exposure to blood and/or body fluid` (event).
- **Semen** (substance): not found; `Seminal fluid` (substance) used.
- **Wound secretions**: no wound exudate/secretion substance; `Exudate` (substance) used (broader).
  `Wound discharge` exists only as a patient finding.
- **Blood-stained fluid**: no such substance; `Serosanguinous fluid` (substance) used. `Bloody discharge`
  (substance) was the alternative.
- **Drenching night sweats**: none found.

## Checker issues left in place

- None.

## Questions for a clinician

1. Is `Exposure to blood and/or body fluid` (event) an acceptable stand-in for a splash exposure, and can the
   app record it? If not, should VHA add a local concept for mucous-membrane/non-intact-skin splash, or should
   any recorded exposure to one of the listed fluids be Urgent on its own?
2. Are `Exudate`, `Serosanguinous fluid` and `Seminal fluid` acceptable stand-ins for "wound secretions",
   "blood-stained fluid" and "semen"? Should exposure to blood-stained tissue be recorded as exposure to Blood?
3. In "cough, fever ≥ 2 weeks", does "≥ 2 weeks" apply to cough as well? Here it applies to fever only.
4. Should the TB-symptom screen on this infection-control page be its own `possible` TB rule (as encoded), or
   left to the TB pages?
5. Should this page be restricted to staff (health worker) once the language can express occupation?
