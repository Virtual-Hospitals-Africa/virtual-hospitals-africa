# Page 88 – Drug rash: remaining questions

## Decisions made

- **Presenting complaint.** "Drug rash" is `Eruption caused by drug` (disorder). It is not a recorded
  common symptom or warning sign. The check task and the urgent rule fire on either a recorded drug
  rash finding or the `possible` diagnosis from the page's "Suspect a drug rash" sentence:
  `(or (clinical_finding Eruption caused by drug) (diagnosis Eruption caused by drug possible))`.
- **Suspect drug rash** (`possible`): `Generalized rash` **and** `(<= (onset (clinical_finding New medication
  commenced)) (time_ago 3 months))`. The time comparison uses `<=`, per the decision for all pages
  ("within" → `<=`). A small task, `Check for new medication in generalised rash`, asks about new
  medication whenever a generalised rash is recorded, so that the finding exists for the rule to use.
- **Shock/SBP < 80** is encoded as the page writes it: `Shock` (disorder) **or** systolic BP < 80.
  Footnote 1 ("If SBP < 80, pulse ≥ 100, respiratory rate > 30, confusion/restlessness, weakness,
  shock likely") is **not** built as a probable shock rule. That would be a shared definition of
  shock, and the footnote does not say whether any one sign or all of them are needed.
- **BP < 90/60 added to the urgent rule.** The red box doesn't list it, but footnote 2 (markers of
  severity) does, and box 2 ("Patient unwell or markers of severity² → Stop all medication. Give
  urgent attention as above") sends those patients to the same urgent care. Encoded as systolic < 90
  **or** diastolic < 60 (Will's convention).
- **Involves mouth, eyes or genitals** is encoded as `Eruption caused by drug` with `finding_site`
  `Mouth region structure`, `Eye region structure` and `Genital structure`. All three were confirmed to resolve.
- **Blisters, peeling or raw areas** are `Blister of skin`, `Peeling of skin` and `Denuded skin` (for raw areas).
- **Unwell, malaise, fatigue, body pain** are `Generally unwell`, `Malaise`, `Fatigue` and `Generalized aches and pains`.
- **Fixed drug eruption likely** (`probable`): drug rash (finding or possible diagnosis) **and**
  `Hyperpigmentation of skin` **and** `Macule of skin` ("dark coloured … flat spots").
- The "Yes" branch box says "markers of severity¹"; footnote 1 is the shock definition, so this is
  read as footnote 2 (markers of severity), as used in the review step.
- No `measure` tasks: the only measurements the page asks for are ALT and eosinophil count (labs).

## Could not model

- **ALT and eosinophil count** ("Check ALT and eosinophil count"; "ALT or eosinophil count raised"):
  the language has no lab-value unit or observable, so these are `not_representable`. The branch only routes to
  management (discuss with MIC hotline/specialist), so no rule is lost.
- **Rash onset relative to medication start**: the page says the rash "appeared within 3 months of
  starting a new medication". The rule checks that the medication was started within the last 3
  months. It therefore misses a rash that appeared within 3 months of starting a drug begun more
  than 3 months ago, so it fires **less often** than the page intends, and it does not check that the rash
  came after the drug.
- **Fixed drug eruption details**: "round", "anywhere on body" and the "often start as itchy
  patches with red edges" are not encoded. The page reaches this diagnosis only on the "No" branch
  (not on ART, TB medication, co-trimoxazole or TPT). The rule does not apply that condition, so it
  fires **more often** than the page intends.
- **"Is patient on ART, TB medication, co-trimoxazole or TPT?"**: this routes management only, so it isn't modelled.
- **"Abacavir hypersensitivity reaction (AHR) likely 131"** is a cross-reference to page 131 and isn't modelled here.
- **"Review patient and result within 24 hours"** and the advice to return are follow-up/management.

## SNOMED gaps

- "Drug rash": `Drug eruption` (disorder) does not exist; used `Eruption caused by drug` (disorder).
- "Raw areas": no `Raw skin`; used `Denuded skin` (disorder).
- "Body pain": no `Body pain` (finding); used `Generalized aches and pains` (finding).
- "Unwell": no `Feeling unwell`; used `Generally unwell` (finding).
- "Shock" exists only as a disorder: `Shock` (disorder).
- "Dark coloured round flat spots": there is no single concept; used `Hyperpigmentation of skin` (disorder) plus
  `Macule of skin` (disorder).

## Checker issues left in place

- None.

## Questions for a clinician

- Should BP < 90/60 (footnote 2, reached through the review step) make a drug-rash patient Urgent at
  first presentation, or only the red-box list (Shock/SBP < 80)?
- Is `Eye region structure` the right site for "involves eyes" (eyelids and conjunctiva), or should only the eye
  proper/conjunctiva count?
- Is it acceptable that "fixed drug eruption likely" fires for patients on ART/TB medication/co-trimoxazole/TPT,
  for whom the page instead routes to the doctor/MIC hotline?
- Footnote 1 "shock likely": does it mean any one of the signs, or all of them? This page encodes only
  Shock/SBP < 80.
