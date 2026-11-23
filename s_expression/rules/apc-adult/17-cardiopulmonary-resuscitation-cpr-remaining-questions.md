# Page 17 – Cardiopulmonary resuscitation (CPR): remaining questions

## Decisions made

- **Emergency priority for no pulse.** `(or Cardiac arrest, Absent pulse)` is the trigger and the
  `Emergency` priority. Cardiac arrest is the adult Emergency warning sign. Absent pulse is the
  page's literal "no pulse". Emergency because the page is CPR (Will's briefing names CPR as explicit
  escalation).
- **Tension pneumothorax likely → probable.** "on 1 side" is applied to both "more resonant" and
  "decreased breath sounds" (`Unilateral` qualifier). The rule is scoped to the no-pulse context,
  because the page lists it under "While giving continuous CPR … look for possible cause".
- **Footnote 2, dehydration likely → probable.** Read as any one of thirst, dry mouth, poor skin
  turgor or BP < 90/60 (systolic < 90 or diastolic < 60). Scoped to the no-pulse context because the
  footnote marks "dehydration" in the CPR cause search, so this page does not create a book-wide
  definition of dehydration.
- **Rhythms, shocks, adrenaline, pulse re-check, intubation, stop-CPR decisions** are management
  and flowchart routing. They are accounted for in provenance, not encoded. No `manage` tasks.
- **The other causes** (trauma, diarrhoea/vomiting, glucose, temperature ≤ 35°C, overdose/poisoning,
  snake bite) lead only to management or to other pages (18, 19, 200). Checking for them here would
  give findings that no rule on this page consumes, so they are not in the `check_for`. Glucose and
  temperature are routine vitals, so no `measure` task.
- No `Shock/SBP < 80` wording appears on this page.
- **Reconciler:** the two builds differed only in the SNOMED concept for "Thirst"; the final build
  uses `Thirst due to water deprivation` (see SNOMED gaps and Questions).

## Could not model

- The cardiac rhythms (VF, pVT, asystole, PEA) and the 2-minute rhythm-check loop: these are
  management routing, and they are out of scope for this pass.
- "Record the time": there is no task form for a timestamp.
- "Asystole after 20 minutes of continuous CPR" (stopping CPR) is a management decision.

## SNOMED gaps

- "Dry mouth" (finding) does not exist; `Xerostomia` (finding) was used instead.
- "Thirst": there is no active `Thirst` (finding). `Thirst due to water deprivation` (finding) was
  used, as in VHA's vocabulary. Alternatives: its sibling `Increased thirst` (finding), which does not
  presume a cause, and the grouper `Thirst finding` (includes normal/reduced thirst).
- "More resonant": `Hyperresonance` (finding) with the `Unilateral` qualifier; there is no
  precoordinated unilateral hyperresonance concept.

## Checker issues left in place

- None.

## Questions for a clinician

- Does footnote 2 mean any one sign, or a combination? With "any one", a single low BP during an
  arrest (nearly always present when BP is recorded) gives probable dehydration.
- Should tension pneumothorax and dehydration also be diagnosed outside cardiac arrest from this
  page (footnote 2 may be a general definition that recurs on other pages), or only during CPR (as
  encoded here)?
- For "Thirst" as a dehydration sign, is `Thirst due to water deprivation` the right concept, or
  should it be `Increased thirst`?
- Is it useful to record the monitor rhythm (VF/pVT/asystole/PEA) as findings for later pages, even
  though this page uses them only for management?
