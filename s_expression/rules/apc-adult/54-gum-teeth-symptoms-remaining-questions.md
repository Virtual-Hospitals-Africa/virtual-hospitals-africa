# Page 54 – Gum/teeth symptoms: remaining questions

## Decisions made

- **Presenting complaint.** "Gum/teeth symptoms" is not a recorded common symptom or warning sign. It is
  modelled as `(or (clinical_finding "Tooth finding") (clinical_finding "Gingivae finding"))`; descendants
  (Toothache, Bleeding gums, Swollen gums, Mobile tooth …) match.
- **Red box.** `Urgent`, as `(and complaint (or …))`. "Temperature ≥ 38°C and swelling of face/jaw/next to
  tooth" is `(and (>= Body temperature 38 °C) (or Facial swelling, Swelling@Jaw region structure,
  Swelling@Tooth, gum, and/or supporting structure))`. "Unable to eat or drink" is either one.
  "Tooth pain felt without touching" is Toothache + `Spontaneous`; "wakes patient at night" is Toothache +
  `Night time`.
- **Dental caries likely:** any one of staining, holes/pits, missing teeth (or).
- **Gum problem likely:** any one of red, bleeding or enlarged gums (or). Diagnosis concept `Gingival disease`.
- **Dental abscess likely:** the page lists "previous/current tooth pain with pus in mouth, swelling next to
  tooth" as one picture; encoded as an AND of all three.
- "May have tooth pain with hot or cold food/drink" is optional ("may have") and is not used as caries
  evidence.
- No `measure` task: temperature is a routine vital. No management (paracetamol, antibiotics, mouthwash,
  referral criteria, mouth-care advice) per scope.

## Could not model

- "Previous" tooth pain: a recorded Toothache stands for previous or current; no time comparison on the page.
- "Wakes patient at night": `Night time` qualifier says the pain is at night, not that it wakes the patient.
- "Brown/black" colour and "at gumline" for staining are not expressed.
- Refer-to-dentist criteria for gum problems (no better after 5 days, foul breath, swollen gums, temperature
  ≥ 38°C, mobile teeth, loss of gum/bone, HIV or diabetes) and same-day referral criteria for abscess
  (> 65 years, alcohol/drug misuse, HIV, diabetes) are referral/management steps, not encoded.

## SNOMED gaps

- No concept for "swelling of jaw" (only `Swelling of lower jaw region`): used `Swelling` + finding_site
  `Jaw region structure`.
- No concept for holes/pits in teeth: used `Cavity` (morphologic abnormality) + finding_site `Tooth structure`.
- No concept for "pus in mouth": used `Pus` (morphologic abnormality) + finding_site `Oral cavity structure`.
- No finding-level "red gums": used `Gingival erythema` (disorder).
- No "toothache waking from sleep": used Toothache + `Night time`.
- No "gum problem" concept: used `Gingival disease` (disorder).

## Checker issues left in place

- None.

## Questions for a clinician

- Dental abscess: should pus in mouth **or** swelling next to tooth (with tooth pain) be enough, rather than
  requiring both? The AND fires less often than an OR reading.
- Is `Gingival disease` the right target for "gum problem", or should it be `Gingivitis` / `Periodontal disease`?
- Should "missing teeth" alone make dental caries likely (teeth may be missing for other reasons)? Encoded as
  the page lists it.
- Should "tooth pain with hot or cold food/drink" (e.g. `Sensitive dentin`) count towards dental caries?
- (From builder B) For the red box, is swelling next to a tooth (gum/supporting-structure swelling) plus
  temperature ≥ 38 °C enough for urgent referral, or only facial/jaw swelling? Encoded as the page reads:
  any of the three.

## Reconciler notes

- Final build is builder A's. Builder B read "swelling next to tooth" as `Swollen gums`, "swelling of face"
  as `Swelling` at `Face structure`, "missing teeth" as `Tooth loss`, and dental abscess as toothache AND
  (pus OR swelling). The reconciler kept A's encodings; see `reconcile.json`.
- The dental abscess AND/OR reading is unsettled (question above).
