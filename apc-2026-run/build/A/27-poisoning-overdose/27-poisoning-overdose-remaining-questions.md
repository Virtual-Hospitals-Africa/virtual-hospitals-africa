# Page 27 – Poisoning/Overdose: remaining questions

## Decisions made

- **Trigger** is `(clinical_finding (snomed_concept "Poisoning" "disorder"))`, the "Poisoning or
  overdose" warning sign. Overdose is a descendant of Poisoning, so it matches.
- **Priority level is `Urgent`**, as the red box says ("Give urgent attention"). The Poisoning
  warning sign itself already carries "Very urgent"; this page does not escalate further.
- **Shock:** "Shock¹/systolic BP < 80" is encoded as `(or Shock (< SBP 80))` on this page. Footnote 1
  ("If SBP < 80, pulse ≥ 100, respiratory rate > 30, confusion/restlessness, weakness, shock
  likely") is not turned into a shock diagnosis rule, per the all-pages decision not to build a
  shared shock definition.
- **Organophosphate poisoning likely** → `probable` rule: suspected poisoning AND any of pinpoint
  pupils, excessive drooling/sweating, vomiting/diarrhoea, pulse < 60, BP < 90/60 (systolic < 90
  or diastolic < 60). The "any of" reading follows the page's identical list style in footnote 1.
- **Confused** is encoded as Acute confusion (warning sign) or Clouded consciousness (the AVPU
  "Confused" vital), so either recording fires.
- **Having/just had a seizure** → Seizure or Post-ictal state.
- **Attempted self-harm/suicide** → Suicide attempt (event) or Intentionally harming self (event).
- **Opioid overdose suspected** is not encoded as a diagnosis: the page gives it only as a
  treatment condition with no evidence for the suspicion.
- Pulse "> 100" is encoded strictly (`>`), as written; this differs from footnote 1's "pulse ≥ 100".
- No `measure` task: RR, pulse and BP are routine vitals.

## Could not model

- Toxic-dose logic (toxic / unknown / non-toxic dose, "in the past hour", paracetamol > 10g or
  200mg/kg): requires PIH/AfriTox judgment and units the language lacks; management routing.
- All management steps (oxygen, fluids, decontamination, activated charcoal, atropine, naloxone,
  N-acetylcysteine, notification): out of scope (no manage tasks).

## SNOMED gaps

- **Pinpoint pupils**: no pinpoint concept; used `Constricted pupil` (finding), which is broader,
  so the urgent and organophosphate rules may fire slightly more often.
- **Excessive secretions** (organophosphate list): no general concept found. `Bronchorrhea`
  (finding) exists but covers only bronchial secretions; not encoded. The organophosphate rule
  fires slightly less often than the page intends (only when secretions are the sole sign).
- **Excessive drooling**: used `Excessive salivation` (disorder) rather than `Dribbling from mouth`.
- **Opioid overdose** (disorder): does not exist.

## Checker issues left in place

- None.

## Questions for a clinician

- Organophosphate list: should it be "any of" (as encoded), "all of", or "two or more of"? With
  "any of", vomiting alone in a poisoned patient gives probable organophosphate poisoning.
- Should "Weakness" be general weakness rather than muscle weakness?
- Is Constricted pupil acceptable for "pinpoint"?
