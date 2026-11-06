# Page 154 – Peripheral vascular disease (PVD): remaining questions

No flowchart file: the page has no flowchart, Yes/No branches or multi-step algorithm. The red box
is a flat "any of" list with three "X likely" criteria.

## Decisions made

- **Trigger.** The red box applies to "the patient with peripheral vascular disease", so the
  `check_for` task is triggered by `(clinical_finding Peripheral vascular disease)`. PVD is not a
  recorded common symptom or warning sign; the task fires only when PVD is recorded.
- **Three probable diagnoses**, one per "X likely" in the red box: Acute lower limb ischemia,
  Critical lower limb ischemia and Ruptured abdominal aortic aneurysm. Each also requires recorded
  PVD, because the box frames every criterion within the PVD patient. One `Urgent` priority
  evaluation: PVD **and** any of the three as `active_condition`. The page says "urgent
  attention", so nothing is escalated to Very urgent or Emergency.
- **Acute limb ischaemia**: `Pain in lower limb` with all three qualifiers Sudden onset, Severe
  and At rest, **and** any of numbness, weakness, pallor or absent pulse in the leg.
- **Critical limb ischaemia**: any of leg pain at rest (`Pain in lower limb` + At rest), ulcer of
  the leg, or gangrene of the leg. A sudden severe rest pain alone (without the ALI signs) also
  matches this rule, which follows the page's wording ("Leg pain occurring at rest").
- **Ruptured AAA**: pulsatile abdominal mass **and** any of abdominal pain, backache, or BP < 90/60
  (systolic < 90 or diastolic < 60, following Will's convention for this pair).
- **Possible AAA**: the assessment table's "If pulsatile mass felt, refer for assessment for
  possible abdominal aortic aneurysm" became a `possible` rule (PVD and pulsatile abdominal mass).
- No `measure` tasks: BP is a routine vital; the page asks for nothing else measurable.

## Could not model

- "Document the walking distance before onset of claudication": no distance unit in the language.
- The page's description of PVD (claudication, reduced pulses, cool/shiny/hairless skin) is
  descriptive, not a "likely/consider" statement, so no rule diagnoses PVD itself.
- The assessment table's other rows (chest pain, stroke/TIA, mental health, cancer, BP, feet,
  glucose) are cross-references or routine follow-up and are not modelled.
- Management (urgent referral, avoid IV fluids in ruptured AAA, statin, aspirin, advice) is not
  encoded (no `manage` tasks in this pass).

## SNOMED gaps

- **Pallor of the leg**: no pallor concept for a limb or for skin generally (only face, optic disc,
  organs; "Pale discoloration of entire skin of body" is whole-body). Substitute: `Discoloration
  of skin` (finding) with `finding_site` `Lower limb structure`. This is broader than pallor, so the
  ALI rule can fire more often than intended (but still needs sudden severe rest pain).
- **Gangrene of the leg**: only side-specific or atherosclerosis-specific concepts. Substitute:
  `Gangrenous disorder` with `finding_site` `Lower limb structure`.
- **Ulcer of lower limb** does not exist; `Ulcer of lower extremity` (disorder) used.
- **No pulse in the leg**: no sideless "lower limb pulse absent"; `Peripheral pulse absent` with
  `finding_site` `Lower limb structure` used. All `finding_site` structures were checked with
  `snomed exists`.

## Checker issues left in place

- None.

## Questions for a clinician

- Should acute limb ischaemia, critical limb ischaemia and ruptured AAA be diagnosed (and made
  Urgent) even when PVD has not been recorded? As encoded, they require recorded PVD.
- Is "Discoloration of skin" of the leg an acceptable stand-in for pallor, or should pallor be left
  out until a better concept exists?
- Should a ruptured AAA be escalated beyond `Urgent` (e.g. Emergency when BP < 90/60)? The page
  says only "urgent attention".
