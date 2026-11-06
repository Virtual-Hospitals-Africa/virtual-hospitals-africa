# Page 196 – Protect yourself from occupational infection: remaining questions

## Decisions made

- **Scope.** The page's only triage logic is the red box. It becomes one `check_for` task
  ("Check for occupational sharps/splash exposure to body fluids") and one `Urgent` priority
  evaluation, structured as `(and (or sharps injury, splash) (or …exposure to each fluid…))`.
  No flowchart, no "X likely", so no diagnosis rules and no flowchart file.
- **Exposure to a fluid** is written as on page 20: `(finding "Exposure to (contextual qualifier)" <substance>)`.
  Substances: Blood, Vaginal secretion, Seminal fluid (for "Semen"), Exudate (for "Wound
  secretions"), Breast milk, Pleural/Pericardial/Peritoneal/Amniotic/Synovial/Cerebrospinal fluid.
- **Splash to eye/mouth/nose/broken skin** is represented by the event
  `Exposure to blood and/or body fluid` (broader than the page; see SNOMED gaps).
- **TB/respiratory infection sections** (outside the red box) are infection-control advice for the
  facility and the health worker. "Identify patients with possible TB promptly: the patient has TB
  symptoms" was not encoded as a `possible` TB rule here; TB diagnosis belongs to the TB pages.
- **Management** (cleaning, irrigation, PEP pointer to page 135) is not encoded (no `manage` tasks).
- Priority is `Urgent` ("Give urgent attention").

## Could not model

- **"Health worker."** The language has no occupation criterion as evidence. The rule therefore
  applies to any adult with a sharps injury/body-fluid exposure plus an exposure to a listed fluid
  (fires more often than the page intends, in non-health-workers).
- **Route specificity of the splash** (eye, mouth, nose, broken skin): not expressible with the
  stand-in event; the stand-in fires for any recorded blood/body-fluid exposure event.

## SNOMED gaps

- **Splash to eye/mouth/nose/broken skin**: no splash, mucous-membrane exposure or non-intact-skin
  exposure concept (`snomed search splash`, `mucous membrane exposure`, `body fluid exposure`).
  Substitute: `Exposure to blood and/or body fluid` (event).
- **Semen** (substance): not found; `Seminal fluid` (substance) used.
- **Wound secretions**: no `Wound exudate`/`Wound secretion` substance; `Exudate` (substance) used (broader).
- **Blood-stained fluid/tissue**: no substance concept (only site-specific findings such as
  `Pleural fluid bloodstained`). Not encoded; the urgent rule fires less often than the page
  intends unless Blood is recorded.

## Checker issues left in place

- None.

## Questions for a clinician

- Is `Exposure to blood and/or body fluid` an acceptable stand-in for a splash exposure, or should
  VHA add a local concept for mucous-membrane/non-intact-skin splash?
- Should exposure to blood-stained fluid/tissue be recorded as exposure to Blood?
- Should this page be restricted to staff (health worker) once the language can express occupation?
