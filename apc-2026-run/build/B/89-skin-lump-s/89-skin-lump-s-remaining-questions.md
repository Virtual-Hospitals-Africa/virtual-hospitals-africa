# Page 89 – Skin lump/s: remaining questions

## Decisions made

- **Red box "Refer same week" encoded as `Urgent`.** The language has only Emergency / Very urgent / Urgent. The red box is the page's triage logic, so it is a priority evaluation `(and mole (or features))` at the lowest level. Same-week referral is less urgent than "urgent attention" elsewhere in the book, so this over-triages.
- **Mole = `Melanocytic nevus` (disorder).** The feature concepts (Irregular outline / Mixed color / Changing shape / Changing color / Itching of pigmented skin lesion) are children of `Pigmented skin lesion`, which descends from `Melanocytic nevus`, so a recorded feature also matches the trigger.
- **Changed in size** uses the general `Change in skin lesion` (finding); no size-change concept exists for pigmented lesions.
- **> 6mm wide** is a `measure` task for `Lesion size, largest dimension` (mm) and `(> … 6)` in the priority rule (a measurement comparison, not an onset one, so `>` is kept as on the page).
- **Boil/abscess** is two probable rules on the same evidence (`Furuncle`; `Abscess of skin and/or subcutaneous tissue`), because Furuncle is not a descendant of the abscess concept. "Softens in the centre to discharge pus" = `(or Fluctuant, Skin discharge)`.
- **Painless** (Kaposi, lipoma) is a `Painless` qualifier on the lump finding. I first wrote `(no (Pain at Skin structure))`, but the checker can't match a `(no …)` with a finding_site (see below).
- **Lumps beneath skin** use `Mass of subcutaneous tissue`, which is not a descendant of `Mass of skin`, so the skin-lump task has both triggers.
- **Acne**: blackheads alone, or any 2 of papules/pustules/nodules. The page lists all four together, but also handles "blackheads only" acne.
- **Epidermoid cyst**: "May have central hole and discharge white substance" is optional on the page, so it is not required and not checked for (`Skin punctum` exists if wanted).

## Could not model

- Mole "Differs from surrounding moles" (no concept). The priority rule fires **less often** than the page intends.
- Molluscum "small, skin-coloured, pearly"; warts "round"; epidermoid "round", "smooth"; lipoma "doughy" and "moves easily" (no mobility qualifier). These rules fire **more often** than the page intends.
- Acne "red" papules and "usually on face", and the location notes under each "likely" box (hands/knees/elbows, face/trunk, trunk/upper limb), are descriptive, not required criteria.
- All management (reassure, treatments, HIV test, referral criteria in boxes, "If diagnosis uncertain, discuss/refer", footnotes) is out of scope.

## SNOMED gaps

- Mole as such: no `Mole`/`Nevus` disorder; used `Melanocytic nevus`.
- No "differs from surrounding moles" concept (`Atypical pigmented lesion` is broader, not used).
- No "Change in size of pigmented skin lesion"; used `Change in skin lesion`.
- No finding-category purulent discharge (`Purulent discharge` exists only as substance/morphologic abnormality); used `Skin discharge`.
- No mobility qualifier (`Mobile`, `Freely mobile` don't exist) for "moves easily".
- No "skin-coloured", "pearly", "umbilicated" or "doughy" concepts; `Skin dimple` used for central dimples.
- No plain `Molluscum contagiosum` disorder; used `Infection of skin caused by Molluscum contagiosum`. No plain `Wart` disorder; used `Viral wart of skin and/or mucous membrane caused by human papillomavirus`.

## Checker issues left in place

These four all come from the molluscum rule's `(no …)` evidence with a finding_site. The rendered `(no …)` puts the `"No"` qualifier before the finding_site attribute, so neither the gate's `NO_RE` nor VHA's `(no ${s})` lookup matches it to the checked-for form.

- `CHECKED FOR BUT NEVER USED AS EVIDENCE`: `(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Papule of skin" "disorder") (attribute (snomed_concept "Finding site" "attribute") (snomed_concept "Palm (region) structure" "body structure")))`
- `CHECKED FOR BUT NEVER USED AS EVIDENCE`: `(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Papule of skin" "disorder") (attribute (snomed_concept "Finding site" "attribute") (snomed_concept "Structure of sole of foot" "body structure")))`
- `PROBABLE DIAGNOSIS EVIDENCE NOT CHECKED FOR`: `(no (finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Papule of skin" "disorder") (snomed_concept "No" "qualifier value") (attribute (snomed_concept "Finding site" "attribute") (snomed_concept "Palm (region) structure" "body structure"))))`
- `PROBABLE DIAGNOSIS EVIDENCE NOT CHECKED FOR`: `(no (finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Papule of skin" "disorder") (snomed_concept "No" "qualifier value") (attribute (snomed_concept "Finding site" "attribute") (snomed_concept "Structure of sole of foot" "body structure"))))`

## Questions for a clinician

- Is `Urgent` acceptable for "refer same week", or should the mole box carry no queue priority at all?
- Is a "skin lump" ever recorded as such at intake (it is not a common symptom), so that these rules can fire?
- For acne, should blackheads alone be enough for "likely", or should the rule require the mixed picture?
- Boil vs abscess: is one diagnosis enough, given that both go to page 83?
