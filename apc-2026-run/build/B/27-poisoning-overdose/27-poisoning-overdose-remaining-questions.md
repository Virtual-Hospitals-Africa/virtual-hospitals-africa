# Page 27 – Poisoning/Overdose: remaining questions

## Decisions made

- **Anchor.** The task and priority rule are triggered by `(clinical_finding (snomed_concept "Poisoning" "disorder"))`, the recorded warning sign ("Poisoning" / "Poisoning or overdose"). `Overdose` (disorder) is a child of `Poisoning`, so overdose records match too.
- **Priority level `Urgent`**, as the red box says ("Give urgent attention"). The Poisoning warning sign already carries `Very urgent` on its own elsewhere in the app; this rule doesn't change that.
- **Shock/SBP < 80** encoded on this page as `(or Shock (disorder), systolic BP < 80)`, per the all-pages decision. Footnote 1 ("If SBP < 80, pulse ≥ 100, respiratory rate > 30, confusion/restlessness, weakness, shock likely") is not built into a shock rule: that would be a shared shock definition.
- **Organophosphate poisoning likely → probable**, requiring suspected poisoning plus **any one** of the listed features (pinpoint pupils, excessive drooling, sweating, vomiting, diarrhoea, pulse < 60, BP < 90/60). The page lists the features with commas and no "and"/"or". BP < 90/60 = systolic < 90 or diastolic < 60 (Will's convention).
- **"Attempted self-harm/suicide"** → two events: `Suicide attempt` and `Intentionally harming self`.
- **"Confused"** → `Acute confusion`. **"Weakness"** → `Muscle weakness` (it's paired with muscle twitching). **"Excessive drooling"** → `Dribbling from mouth` (synonym "Drooling"). **"Slow breathing"** → `Slow respiration`.
- **"Having/just had a seizure"** → `Seizure`; "just had" can't be expressed separately.
- No `measure` task: every measured item (RR, pulse, BP) is a routine vital.

## Could not model

- **Opioid overdose suspected** (naloxone bullet): the page gives no criteria for the suspicion, and there is no `Opioid overdose` concept, so there is no `possible` rule. Shallow breathing and RR < 12 are still urgent criteria.
- **"Excessive secretions"** in the organophosphate list: left out (see SNOMED gaps). The rule fires slightly **less often** than the page intends.
- **Toxic-dose routing** (toxic dose / unknown / non-toxic with or without symptoms): toxic dose is decided with PIH/AfriTox and can't be recorded. The outcomes are referral and management.
- Paracetamol > 10 g or 200 mg/kg, "taken in the past hour", poison on skin or in eyes, and carbon monoxide exposure are all management triggers (accounted for as `management_step`).

## SNOMED gaps

- `Pinpoint pupils` / `Miosis` (finding): not FSNs. Used `Pin point pupils` (finding).
- `Mydriasis` (finding): used `Dilated pupil`.
- `Drooling` (finding): used `Dribbling from mouth`. `Excessive salivation` (disorder) is the alternative.
- `Excessive secretions`: no generic concept. `Excessive bronchial secretion` (finding) exists but is more specific than the page. Not encoded.
- `Opioid overdose` (disorder): no FSN. `Morphinan opioid overdose` and `Intentional overdose of opioid receptor agonist` are narrower.
- `Attempted suicide` (event): used `Suicide attempt`.
- `Confusion` (finding): used `Acute confusion`.

## Checker issues left in place

- None.

## Questions for a clinician

1. In the organophosphate bullet, should **any one** feature, with suspected poisoning, make organophosphate poisoning "likely", or should it need several (e.g. pinpoint pupils plus secretions)? With the current any-one reading, a poisoned patient with only diarrhoea or only a low BP is labelled probable organophosphate poisoning.
2. Should "excessive secretions" be read as bronchial secretions (`Excessive bronchial secretion`)?
3. Is "Weakness" muscle weakness or general weakness (`Asthenia`)?
4. Should "opioid overdose suspected" be inferred from anything recordable, such as a known opioid user, an opioid exposure or pinpoint pupils?
