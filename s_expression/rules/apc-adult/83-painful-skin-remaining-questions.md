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
- **"Band along one side"** is encoded as `Blister of skin` with qualifiers `Zosteriform` and
  `Unilateral`. Builder B used finding site `Dermatome` + `Unilateral` instead; both read "band" as
  dermatomal, and the page doesn't settle which form (unsettled).
- **Boil/abscess** is one rule diagnosing `Abscess of skin and/or subcutaneous tissue`. `Furuncle`
  exists, but SNOMED does not place it under that concept.
- **Fluctuance and pus** are not required, because the page says "may".
- **"Painful"** is required (as `Pain of skin`, which exists as a precoordinated finding) in all five
  diagnosis rules. The cellulitis/erysipelas stem ("Red, warm, swollen skin") does not say it, but the
  panel sits under the page complaint "PAINFUL SKIN" (unsettled; builder B left it out there).
- **Redness in cellulitis/erysipelas** is carried by the qualified `Erythema` (border) finding only; a
  separate plain `Erythema` condition (builder A) would be redundant.
- **Hidradenitis suppurativa** uses `Recurrent abscess of skin` with a finding site (axilla, inguinal
  region, perineum). This carries both "recurrent boils or abscesses" and the site.
- **Not encoded (management):** incision and drainage, all medicines, hygiene advice, HIV/diabetes
  testing, limb elevation, and every "Refer same day if" list (BP < 90/60, pulse > 100, confused,
  hand/face/scalp involvement, eye/ear/nose involvement, suspected meningitis, and the rest).

## Could not model

- The page's columns are alternative presentations, but the rules don't exclude one another (e.g. a
  red, warm, swollen patch with a lump can fire both the abscess and the cellulitis/erysipelas rule).
  The page gives no exclusion criteria, so none were added.
- "May be fluctuant in the centre" and "May discharge pus" are optional descriptors with no logic of
  their own. `Fluctuant mass` (morphologic abnormality) exists if a clinician wants them added.

## SNOMED gaps

- No concept for "painful blister" or "blisters in a band". Used `Blister of skin` + `Zosteriform` +
  `Unilateral` qualifiers instead.
- No concept for skin-lesion border definition. Used qualifiers on `Erythema` instead.
- No precoordinated "boil/abscess" concept. Used `Abscess of skin and/or subcutaneous tissue`.

## Checker issues left in place

- None.

## Questions for a clinician

- The cellulitis and erysipelas rules require `Pain of skin` because of the page title, although their
  panel says only "Red, warm, swollen skin". Should pain be required there?
- "Blisters in a band along one side": is `Zosteriform` + `Unilateral` (final) or finding site
  `Dermatome` + `Unilateral` the form nurses will record?
- Is `Abscess of skin and/or subcutaneous tissue` the right single concept for "Boil/abscess", or
  should `Furuncle` be diagnosed as well?
- Is recording the border character on `Erythema` workable for nurses, or should it sit on
  `Swelling of skin`? If it can't be recorded, the cellulitis and erysipelas rules can't fire.
- Should the hidradenitis rule fire on a single painful abscess in the axilla, groin or perineum
  without a recorded recurrence? The page nests it under "recurrent boils or abscesses", so the
  rule requires recurrence.
