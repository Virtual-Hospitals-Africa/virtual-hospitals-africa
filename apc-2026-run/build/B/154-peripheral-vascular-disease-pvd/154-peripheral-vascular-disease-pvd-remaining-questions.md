# Page 154 – Peripheral vascular disease (PVD): remaining questions

## Decisions made

- **No flowchart file.** The page has a red box with three bullets and no Yes/No branches.
- **Trigger.** The check_for task fires on `(clinical_finding Peripheral vascular disease)`. PVD is a
  known chronic condition, not a recorded common symptom or warning sign. No rule on this page
  diagnoses PVD at `probable`, so the same `clinical_finding` form is used in the trigger, the
  diagnosis rules and the priority rule.
- **PVD is required in each "likely" rule.** The box header ("the patient with peripheral vascular
  disease and any of") scopes all three bullets, so acute limb ischaemia, critical limb ischaemia
  and ruptured AAA are each diagnosed only in a patient with PVD. This is narrower than diagnosing
  them from the leg or abdominal findings alone.
- **Priority level: Urgent**, following "Give urgent attention". The existing adult warning sign
  "Severe limb ischemia" is Very urgent, but the page does not escalate.
- **Bullet 1 (acute limb ischaemia):** the sudden, severe pain at rest is one finding (Pain in lower
  limb with the qualifiers Sudden onset, Severe and At rest, all of which are required), AND any one
  of numbness, weakness, pallor or no pulse in the leg.
- **Bullet 2 (critical limb ischaemia):** leg pain at rest OR an ulcer on the leg OR gangrene on the
  leg.
- **Bullet 3 (ruptured AAA):** a pulsatile abdominal mass AND (abdominal pain OR back pain OR
  BP < 90/60). BP < 90/60 means systolic < 90 or diastolic < 60.
- **Possible AAA:** the Abdomen row of the assessment table ("If pulsatile mass felt … possible
  abdominal aortic aneurysm") is encoded as a `possible` diagnosis rule: PVD and a pulsatile
  abdominal mass.
- The management lines ("Manage urgently", referral, avoiding IV fluids) are `management_step`s and
  are not encoded.

## Could not model

- "Document the walking distance before onset of claudication": there is no distance unit (metres)
  in the language, so no `measure` task.
- The description "characterised by claudication … pulses reduced, skin cool, shiny and hairless"
  is not phrased as "X likely" or "consider X", so no PVD diagnosis rule is written.
- The routine assessments (chest pain → 24, stroke/TIA → 152, mental health, cancer screening, BP,
  foot screen, glucose) are cross-references or routine care, not triage logic on this page.

## SNOMED gaps

- **Pallor of the leg:** `Pallor` (finding) and `Pallor of skin` (finding) do not exist. I used
  `White discoloration of skin` (finding) with finding_site `Skin structure of lower limb`.
- **Ulcer on the leg:** `Ulcer of lower limb` (disorder) does not exist. I used
  `Ulcer of lower extremity` (disorder).
- **Gangrene on the leg:** there is no general `Gangrene of lower limb` disorder, only lateralised
  and atherosclerosis-specific ones. I used `Gangrenous disorder` with finding_site
  `Lower limb structure`.
- **No pulse in the leg:** there is no lower-limb concept for an absent pulse. I used
  `Peripheral pulse absent` with finding_site `Lower limb structure`.
- I checked that every `finding_site` body structure resolves.

## Checker issues left in place

- None.

## Questions for a clinician

- Should the three emergencies be diagnosed even when PVD has not been recorded? A first
  presentation of acute limb ischaemia or a ruptured AAA would not fire these rules.
- Should acute and critical limb ischaemia be Very urgent, in line with the "Severe limb ischemia"
  warning sign?
- Is a white or pale discoloration of the leg skin the right way to record "pallor" here?
- Does "Leg pain occurring at rest" (critical limb ischaemia) also match a sudden, severe pain at
  rest? If qualifier matching is by subset, any acute limb ischaemia presentation also gives
  critical limb ischaemia. Both lead to Urgent.
