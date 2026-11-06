# Page 17 – Cardiopulmonary resuscitation (CPR): remaining questions

## Decisions made

- **Entry condition.** "If patient has no pulse" is encoded as `(or Cardiac arrest, Absent pulse)`.
  Cardiac arrest is an adult Emergency warning sign; Absent pulse is the literal finding. Together they
  trigger `Check for reversible causes during CPR` and the `Emergency: no pulse, start CPR` priority.
  Emergency is used because the page is CPR (Will's briefing names CPR as explicit escalation).
- **Tension pneumothorax likely** → `probable`, from any of unilateral hyperresonance ("more
  resonant ... on 1 side"), unilateral decreased breath sounds, or displaced trachea, scoped to the
  arrest patient (the line sits under "While giving continuous CPR … look for possible cause").
- **Dehydration (footnote 2: "Thirst, dry mouth, poor skin turgor, BP < 90/60, dehydration likely")**
  → `probable` dehydration from any one of those signs, scoped to the arrest patient because the
  footnote marks "dehydration" in the CPR cause search. BP < 90/60 = systolic < 90 or diastolic < 60.
- **Rhythm branches (VF, pVT, asystole, PEA, pulse felt/unsure)** are not encoded: on this page they
  only choose between shock, no shock and stopping CPR, which is management.
- **No `manage` tasks**: compressions, ventilation, defibrillation, adrenaline, saline, intubation,
  needle decompression and stop-CPR decisions are accounted for as `management_step`.
- No shock / SBP < 80 wording on this page; nothing to decide there.

## Could not model

- "Record the time" of arrest and "asystole after 20 minutes of continuous CPR": these are
  stop-CPR management criteria; not modelled.
- "If glucose < 3 (< 4 if diabetes) or unable to measure", "temperature ≤ 35°C", "overdose/poisoning":
  pointers to pages 19, 18 and 200; no diagnosis is named on this page. Glucose and temperature are
  routine vitals, so no `measure` task.
- "Trauma, diarrhoea/vomiting" as causes: only trigger saline (management); not encoded.

## SNOMED gaps

- "Thirst": no active `Thirst` (finding); used `Increased thirst` (finding), child of `Thirst finding`.
  The grouper was rejected because it includes normal/reduced thirst.
- "Dry mouth": not an FSN; used `Xerostomia` (finding), as the Dry mouth warning sign does.
- "More resonant on 1 side": `Hyperresonance` (finding) + `Unilateral` (qualifier value); there is no
  precoordinated unilateral hyperresonance concept.

## Checker issues left in place

- None.

## Questions for a clinician

- Should the dehydration footnote need more than one sign (e.g. BP < 90/60 alone in an arrested
  patient is nearly always true, so this rule will fire for almost every arrest where BP is recorded)?
- Should the dehydration footnote instead be a page-independent rule (it is a general definition that
  may recur on other pages)?
- Is it useful to record the monitor rhythm (VF/pVT/asystole/PEA) as findings for later pages, even
  though this page uses them only for management?
