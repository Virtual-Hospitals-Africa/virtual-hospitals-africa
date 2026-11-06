# Page 83 – Painful skin: remaining questions

## Decisions made

- **Pointer-only red box.** The red box only points to page 82, so this page has no priority
  evaluation. The page's four "likely" panels and the "hidradenitis suppurativa likely" line are
  encoded as `probable` diagnosis rules, with one `check_for` task.
- **Trigger.** The task is triggered by `(clinical_finding (snomed_concept "Pain of skin" "finding"))`,
  from the page title. "Pain of skin" is not a recorded common symptom or warning sign, so the task
  fires only if that finding is recorded.
- **Border definition.** "Poorly-defined borders" / "Clearly-defined raised borders" are expressed as
  qualifiers on `Erythema`: `Poorly defined`, and `Well defined` + `Raised`. SNOMED has no skin-border
  concept.
- **"Band along one side"** is encoded as `Blister of skin` with finding site `Dermatome` and qualifier
  `Unilateral`. This reads "band" as dermatomal, an interpretation.
- **Boil/abscess** is one rule diagnosing `Abscess of skin and/or subcutaneous tissue`. `Furuncle`
  exists, but SNOMED does not place it under that concept.
- **Fluctuance and pus** are not required, because the page says "may".
- **"Painful"** is required (as `Pain of skin`) in the boil/abscess, herpes zoster and hidradenitis
  rules, whose text says "painful". The cellulitis/erysipelas stem ("Red, warm, swollen skin") does not
  say it, so it is not required there.
- **Hidradenitis suppurativa** uses `Recurrent abscess of skin` with a finding site (axilla, inguinal
  region, perineum). This carries both "recurrent boils or abscesses" and the site.
- **Not encoded (management):** incision and drainage, all medicines, hygiene advice, HIV/diabetes
  testing, limb elevation, and every "Refer same day if" list (BP < 90/60, pulse > 100, confused,
  hand/face/scalp involvement, eye/ear/nose involvement, suspected meningitis, and the rest).

## Could not model

- "May be fluctuant in the centre" and "May discharge pus" are optional descriptors with no logic of
  their own. `Fluctuant mass` (morphologic abnormality) exists if a clinician wants them added.

## SNOMED gaps

- No concept for "painful blister" or "dermatomal distribution". Used `Blister of skin` +
  finding site `Dermatome` + `Unilateral` instead.
- No concept for skin-lesion border definition. Used qualifiers on `Erythema` instead.
- No precoordinated "boil/abscess" concept. Used `Abscess of skin and/or subcutaneous tissue`.

## Checker issues left in place

- None.

## Questions for a clinician

- Should the cellulitis and erysipelas rules also require pain, as the page title implies?
- Is `Abscess of skin and/or subcutaneous tissue` the right single concept for "Boil/abscess", or
  should `Furuncle` be diagnosed as well?
- Is recording the border character on `Erythema` workable for nurses, or should it sit on
  `Swelling of skin`?
