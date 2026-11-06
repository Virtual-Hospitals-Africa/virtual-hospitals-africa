# Page 17 – Cardiopulmonary resuscitation (CPR): remaining questions

## Decisions made

- **Emergency priority for no pulse.** `(or Cardiac arrest, Absent pulse)` is the trigger and the
  `Emergency` priority. Cardiac arrest is the adult Emergency warning sign. Absent pulse is the
  page's literal "no pulse".
- **Tension pneumothorax likely → probable.** "on 1 side" is applied to both "more resonant" and
  "decreased breath sounds" (`Unilateral` qualifier). The rule is scoped to the no-pulse context,
  because the page lists it as a cause to look for during CPR.
- **Footnote 2, dehydration likely → probable.** Read as any one of thirst, dry mouth, poor skin
  turgor or BP < 90/60 (systolic < 90 or diastolic < 60). Scoped to the no-pulse context so that
  this page does not create a book-wide definition of dehydration.
- **Rhythms, shocks, adrenaline, pulse re-check, intubation, stop-CPR decisions** are management
  and flowchart routing. They are accounted for in provenance, not encoded.
- **The other causes** (trauma, diarrhoea/vomiting, glucose, temperature ≤ 35°C, overdose/poisoning,
  snake bite) lead only to management or to other pages (18, 19, 200). Checking for them here would
  give findings that no rule on this page consumes, so they are not in the `check_for`.
- No `Shock/SBP < 80` wording appears on this page.

## Could not model

- The cardiac rhythms (VF, pVT, asystole, PEA) and the 2-minute rhythm-check loop: these are
  management routing, and they are out of scope for this pass.
- "Record the time": there is no task form for a timestamp.
- "Asystole after 20 minutes of continuous CPR" (stopping CPR) is a management decision.

## SNOMED gaps

- "Dry mouth" (finding) does not exist; `Xerostomia` (finding) was used instead.
- "Thirst": `Thirst due to water deprivation` (finding) was used, as in VHA's vocabulary. The
  generic `Thirst finding` is the alternative.
- "More resonant": `Hyperresonance` (finding) with the `Unilateral` qualifier.

## Checker issues left in place

- None.

## Questions for a clinician

- Does footnote 2 mean any one sign, or a combination? With "any one", a single low BP during an
  arrest gives probable dehydration.
- Should tension pneumothorax and dehydration also be diagnosed outside cardiac arrest from this
  page, or only during CPR (as encoded here)?
