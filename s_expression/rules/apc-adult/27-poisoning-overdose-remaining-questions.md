# Page 27 – Poisoning/Overdose: remaining questions

Final build reconciled from builders A and B (base A; pupil and drooling concepts from B).

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
  or diastolic < 60). The page lists the features with commas and no "and"/"or"; the "any of"
  reading follows the page's identical list style in footnote 1.
- **Confused** is encoded as Acute confusion or Clouded consciousness (whose synonym is
  "Confused", the AVPU "Confused" vital), so either recording fires.
- **Having/just had a seizure** → Seizure or Post-ictal state ("just had").
- **Pinpoint** → `Pin point pupils` (finding), the exact page word.
- **Excessive drooling** → `Dribbling from mouth` (synonym "Drooling"); "excessive" is not
  expressed separately.
- **Attempted self-harm/suicide** → Suicide attempt (event) or Intentionally harming self (event).
- **Weakness** → Muscle weakness (paired with muscle twitching). **Slow breathing** → Slow respiration.
- **Opioid overdose suspected** is not encoded as a diagnosis: the page gives it only as a
  treatment condition with no evidence for the suspicion, and there is no `Opioid overdose` concept.
  Shallow breathing and RR < 12 are still urgent criteria.
- Pulse "> 100" is encoded strictly (`>`), as written; this differs from footnote 1's "pulse ≥ 100".
- No `measure` task: RR, pulse and BP are routine vitals.

## Could not model

- Toxic-dose logic (toxic / unknown / non-toxic dose, "in the past hour", paracetamol > 10g or
  200mg/kg): requires PIH/AfriTox judgment and units the language lacks; management routing.
- **"Excessive secretions"** in the organophosphate list: left out (see SNOMED gaps). The rule
  fires slightly **less often** than the page intends (only when secretions are the sole sign).
- All management steps (oxygen, fluids, decontamination, activated charcoal, atropine, naloxone,
  N-acetylcysteine, carbon monoxide, notification): out of scope (no manage tasks).

## SNOMED gaps

- `Pinpoint pupils` / `Miosis` (finding): not FSNs. Used `Pin point pupils` (finding).
- `Mydriasis` (finding): used `Dilated pupil`.
- `Drooling` (finding): not an FSN; used `Dribbling from mouth`. `Excessive salivation` (disorder)
  is the alternative.
- `Excessive secretions`: no generic concept. `Excessive bronchial secretion` / `Bronchorrhea`
  exist but cover only bronchial secretions. Not encoded.
- `Opioid overdose` (disorder): no FSN. `Morphinan opioid overdose` and `Intentional overdose of
  opioid receptor agonist` are narrower.
- `Attempted suicide` (event): used `Suicide attempt`.
- `Confusion` (finding): used `Acute confusion` and `Clouded consciousness`.

## Checker issues left in place

- None.

## Questions for a clinician

1. In the organophosphate bullet, should **any one** feature, with suspected poisoning, make
   organophosphate poisoning "likely" (as encoded), or should it need several (e.g. pinpoint pupils
   plus secretions)? With the any-one reading, a poisoned patient with only diarrhoea, only
   vomiting or only a low BP is labelled probable organophosphate poisoning.
2. Should "excessive secretions" be read as bronchial secretions (`Excessive bronchial secretion`)?
3. Is "Weakness" muscle weakness or general weakness (`Asthenia`)?
4. Should "opioid overdose suspected" be inferred from anything recordable, such as a known opioid
   user, an opioid exposure or pinpoint pupils?
5. Is `Dribbling from mouth` (drooling) the right concept for "excessive drooling", or should
   `Excessive salivation` (hypersalivation) be used, or both?
