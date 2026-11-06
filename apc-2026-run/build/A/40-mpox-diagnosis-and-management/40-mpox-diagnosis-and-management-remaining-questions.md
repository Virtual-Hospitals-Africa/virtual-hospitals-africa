# Page 40 – Mpox: diagnosis and management: remaining questions

## Decisions made

- **Suspicion is a `possible` diagnosis.** "Suspect mpox if …" becomes `Diagnose possible mpox`, which
  then triggers the red-box task and the "approach" task, following the anaphylaxis pre-screen pattern.
- **What triggers the first task.** The page has no recorded complaint for "suspected mpox". The first
  `check_for` task fires on a recorded skin lesion, eruption, or lesion of the face, genitals, rectum,
  mouth or eye. Common symptoms were rejected as triggers because they would ask mpox questions of
  every patient with a cough or headache.
- **Lesion sites.** The parenthesis "(face, palms of hands/soles of feet, genitals, anus, rectum, mouth or
  eyes)" is read as the qualifying sites. Each is a separate finding with the `New` qualifier. A new
  lesion on, say, the trunk alone does not count.
- **Contact.** "Contact of a probable/confirmed mpox case" is written as exposure to monkeypox virus (the
  gold-standard exposure pattern), within the last 21 days: `(<= (onset …) (time_ago 21 days))`.
- **Every "likely" rule on the page is scoped to suspected mpox.** Each is and-ed with
  `(diagnosis Monkeypox possible)`, so this page does not, for example, make dehydration probable for any
  patient with BP < 90/60 or myocarditis probable for any patient with chest pain.
- **Comma lists ending in "X likely".** "Thirst, dry mouth, poor skin turgor, BP < 90/60, dehydration likely"
  and "Chest pain, irregular pulse, swollen legs, myocarditis likely" are read as *any one* sign. "Eye
  lesion/s **and** vision changes" and the paraphimosis description are read as *all* signs, because the
  page uses "and" or "with" there.
- **Severe anal symptoms.** "Severe" is applied to bleeding, pain and discharge alike. The priority rule
  uses these severe findings directly rather than `(active_condition Proctitis)`, because the proctitis rule
  also has a non-urgent route (anal sex and anal symptoms) from the lower half.
- **Shock.** Encoded exactly as the box writes it: the `Shock` finding or systolic BP < 80. Footnote 1
  ("If SBP < 80, pulse ≥ 100, respiratory rate > 30, confusion/restlessness, weakness, shock likely")
  is not built into a shared shock rule.
- **BP < 90/60** is written as systolic < 90 or diastolic < 60.
- **Time comparisons** use `<=` only: contact within 21 days, new medication within 3 months.
- **Non-itchy branches** are written as `(no (clinical_finding Itching))`, and the distribution branches as
  `Generalized rash` / `Localized skin lesion`.
- **"Especially around mouth or genitals"** (herpes simplex) and **"especially around mouth and nose"**
  (impetigo) are not restrictions, so no site is encoded for them.
- **"Persistent nausea and vomiting"** uses `Persistent vomiting`. Nausea is not required separately.
- **Tick bite fever** uses `Spotted fever group rickettsial disease`, the parent of African tick bite
  fever and Mediterranean spotted fever.

## Could not model

- **"Age > 65"** (red box, at-risk list): the language has no age comparison, so the priority rule fires
  less often than the page intends.
- **"HIV not on ART"**: there is no finding for "not on ART" (ART is a procedure). Only "virologically
  unsuppressed" (known HIV **and** HIV RNA above reference range) is encoded, so the rule fires less often.
- **"Temperature > 38.5°C in the last 2 days"**: only a temperature measured now (> 38.5) is used, so the
  rule fires less often.
- **"In the 21 days before symptom onset"** is measured back from now, not from symptom onset.
- **"Unexplained"** (lesions) is not representable, so the rule fires more often.
- **"Crops of vesicles at different stages of healing"** becomes a vesicular eruption, so chickenpox fires
  more often.
- **"Flat red rash spreading from face to body"** (measles) becomes a macular eruption. The colour and the
  spread are lost, so measles fires more often.
- **"Rash spreading from extremities to body"** (tick bite fever) is not representable. Only the generalised
  rash is required.
- **"Burrows in web spaces or skin folds"**: the sites are not encoded. **"Itch worse at night"** becomes
  itching with the `Night time` qualifier.
- **"On red base"** (herpes simplex), **"in a band"** (shingles) and **"honey-coloured"** (impetigo) are
  not representable, so these rules fire more often.
- **"Mpox is more likely if lesions look similar and progress at a similar pace"** is a relative statement
  and is not encoded.
- Management (oxygen, ORS/IV fluids, morphine, metoclopramide, paraphimosis reduction, catheter), the
  HIV/syphilis testing, the infection-control advice, the NICD hotline and the cross-references
  (18, 41, 61, 62, 66, 84, 88, 89, 38, 52, 65, 83, 93, 124) are not encoded.

## SNOMED gaps

- **Molluscum contagiosum** ("firm, dome-shaped papules with central dimple"): there is no concept for an
  umbilicated papule (searched "umbilicat", "dome"). The rule is not written. `Dome shape` exists as a
  qualifier, but without the dimple it is not specific enough.
- **"Unable to pass stool"**: no such concept. `Obstipation` (disorder) is used.
- **"Persistent" qualifier**: does not exist. `Persistent vomiting` (disorder) is used.
- **"Scabies"** is not a fully specified name. `Infestation caused by Sarcoptes scabiei var hominis` is used.
- **"Anal sex"**: no concept. `Anal penetration` (finding) is used.
- **"Painful" qualifier**: does not exist. Painful lesions are written as a separate `Pain of skin` finding.
- **"Hyperpigmented papule"**: no concept. It is written as `Papule of skin` and `Hyperpigmentation of skin`.
- **"Advanced HIV disease"**: no concept. `Acquired immune deficiency syndrome` is used.
- All `finding_site` body structures were confirmed with `snomed exists`: Entire skin of palmar area of
  hand, Entire skin of sole of foot, Anal structure, Glans penis structure, Mouth region structure.

## Checker issues left in place

- None.

## Questions for a clinician

- Should the comma lists ending in "dehydration likely" and "myocarditis likely" need one sign or several?
- Are the lesion sites in "Suspect mpox if" restrictive, or examples (any new skin lesion)?
- Should a recorded contact with mpox, without lesions, also start the mpox questions? At present the
  first task only fires on a recorded lesion or rash, so a contact with only fever or headache is not asked.
- Is `Spotted fever group rickettsial disease` the right target for "tick bite fever", or should it be
  African tick bite fever only?
- Is AIDS an acceptable stand-in for "advanced HIV disease" (WHO: CD4 < 200 or stage 3/4)?
