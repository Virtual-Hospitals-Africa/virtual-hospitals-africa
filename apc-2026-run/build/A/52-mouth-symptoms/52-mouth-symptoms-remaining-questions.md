# Page 52 – Mouth symptoms: remaining questions

## Decisions made

- **Presenting complaint** is `(clinical_finding (snomed_concept "Mouth symptoms" "finding"))`. It is
  not a recorded common symptom or warning sign, so the tasks only fire when it is recorded.
- **Red box bullet 2 (sudden face/tongue swelling and any of …, check for anaphylaxis 28)** is
  encoded twice: as an Urgent criterion, because it sits inside "Give urgent attention … any of" with
  "Refer urgently", and as a `possible` anaphylaxis rule, so that page 28's check is prompted. Swelling forms
  match page 20 exactly (Swelling + face/tongue site + Sudden onset).
- **BP < 90/60** is read as systolic < 90 or diastolic < 60 (Will's convention).
- **"Exposure to possible allergen¹"** uses footnote 1: exposure to Drug or medicament, exposure to
  Food (in general, as the footnote says), Insect bite - wound, Insect sting.
- **"X likely" columns → probable rules:** oral thrush (white patches on oral mucosa), herpes simplex
  (blister on lip or in oral cavity), aphthous ulcer (ulcer of mouth), angular cheilitis (fissure at
  angle of mouth).
- **Oesophageal candida** = white patches AND (difficulty swallowing OR painful swallowing), because the
  box hangs under the white-patches column.
- **Impetigo and contact dermatitis** (lines in the angular cheilitis column) require the cracked
  corners of the mouth plus crusts and blisters around the mouth (impetigo), or "very itchy" (contact dermatitis).
- **Dry mouth column:** "If thirst, urinary frequency, weight loss, check for diabetes 19" is a
  `possible` Diabetes mellitus rule: Xerostomia AND any one of increased thirst, increased frequency
  of urination, weight decreased.
- No flowchart file: the page has no Yes/No branches; each column is a single finding → "likely" step.
- No `measure` tasks (BP is a routine vital).

## Could not model

- **Anaemia likely** (Hb < 12 g/dL woman / < 13 g/dL man, when no better or cause uncertain): Hb has
  no unit or observable. No rule is written, so it fires less often than the page intends (never).
  "No better" (a treatment-response criterion) also can't be expressed.
- **"Painful"** on blisters and ulcers, and **"central white patch"** on ulcers: no qualifier is
  available, so the herpes simplex and aphthous ulcer rules fire more often than the page intends (any
  lip/oral blister; any mouth ulcer).
- **"Red"** in "red, cracked corners of mouth": only the fissure at the angle of the mouth is encoded.
- **"Within the past few hours"** (footnote 1) is not modelled; exposures recorded in the encounter
  count as recent, as on page 20.
- Pointers with no criteria (abacavir hypersensitivity 131, swelling of lips 49, gum or tooth problem 54,
  runny or blocked nose 51, palliative care 191) and all treatment, testing and advice text are not
  encoded.

## SNOMED gaps

- No pre-coordinated "blister of lip/mouth" concept: used `Blister` (morphologic abnormality) with a
  finding site of `Lip structure` / `Oral cavity structure`.
- No "fissure/crack at corner of mouth" finding: used `Fissure` (morphologic abnormality) + `Structure
  of angle of mouth`.
- "Weight loss" (finding) does not exist; used `Weight decreased`.
- "Painful" (qualifier value) does not exist.

## Checker issues left in place

- None.

## Questions for a clinician

- Should the anaphylaxis bullet in the red box make the patient Urgent on this page, or only redirect to
  page 28 (where anaphylaxis is already Urgent)?
- Is "very itchy" well expressed as Itching + Severe?
- Does "thirst, urinary frequency, weight loss" mean any one or all three?
- Should oesophageal candida need oral white patches, or is difficulty/pain on swallowing enough?
- VHA records Xerostomia as an Urgent "Dry mouth" warning sign (a dehydration sign). On this page, dry
  mouth is a non-urgent symptom. If the warning sign applies to adults, recording dry mouth here will
  make the patient Urgent.
