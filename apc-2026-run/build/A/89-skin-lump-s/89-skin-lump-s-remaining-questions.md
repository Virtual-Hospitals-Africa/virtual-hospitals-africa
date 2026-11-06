# Page 89 – Skin lump/s: remaining questions

## Decisions made

- **"Refer same week" became `Urgent`.** The language has only `Emergency`, `"Very urgent"` and `Urgent`. Urgent is the lowest of these, but it still ranks a same-week referral above routine care.
- **Mole = `Pigmented skin lesion` (disorder).** This is a vocabulary term. It is the parent of `Melanocytic nevus` and of the pigmented-lesion change concepts used for the red-box items. The skin-lump task checks for it, and it triggers the mole task, the width measurement and the priority rule.
- **The lump task fires on `Mass of skin` or `Mass of subcutaneous tissue`.** SNOMED doesn't place lumps beneath the skin under `Mass of skin`.
- **"Changed in size, shape or colour"** is encoded as changing shape, changing colour and the general `Change in skin lesion`. SNOMED has no concept for a change in size, so the general concept stands in for it. That makes the rule fire for any recorded change.
- **"Is irregular in shape or colour"** is encoded as `Irregular outline of pigmented skin lesion` or `Mixed color of pigmented skin lesion`.
- **"Is > 6mm wide"** is encoded as `(> (measurement Diameter of lump mm) 6)`, measured by a `measure` task.
- **"Bleeds easily"** is encoded as `Bleeding skin`. The priority rule ANDs it with the mole finding, so a bleed must go with a mole. "Easily" is not expressed.
- **Boil/abscess** is one rule diagnosing `Abscess of skin and/or subcutaneous tissue`, with all six listed features ANDed. `Furuncle` is not a descendant of that concept.
- **Acne** uses an OR of red papules, pustules, nodules and blackheads. The page writes "and", but its management treats a "blackheads only" case.
- **Epidermoid cyst:** "May have central hole and discharge white substance" is optional on the page, so the rule doesn't require it.
- Location notes ("usually on face and trunk", "on hands, knees or elbows", "trunk or upper limb") describe where the lesions usually appear. They are not criteria and are not encoded.
- Management is not encoded: HIV testing, the treatments, referral criteria such as "> 3cm" and "persists > 1 month", and "If diagnosis uncertain, discuss/refer".

## Could not model

- **"Does not involve palms/soles" (molluscum).** Not encoded, so the molluscum rule fires more often than the page intends.
- **"Differs from surrounding moles".** No concept was found, so the red box fires less often than the page intends.
- **"Skin-coloured", "pearly" (molluscum), "doughy" and "moves easily" (lipoma).** No concepts were found. Those rules rest on the remaining features and fire more often than the page intends.
- **"Discharge pus".** Encoded as any `Skin discharge`, which is broader than pus.

## SNOMED gaps

- Mole that differs from the patient's other moles ("ugly duckling" sign): none found. Searched nevus, pigmented lesion, atypical, dysplastic.
- Change in size of a pigmented lesion: none found. `Change in skin lesion` was used instead.
- Bleeding of a pigmented lesion: none found. `Bleeding skin` was used instead.
- Skin-coloured or flesh-coloured qualifier, pearly, umbilicated: none found. `Skin dimple` was used for the central dimple.
- Doughy, mobile or movable qualifier: none found.
- Purulent discharge from skin as a finding: none found. `Purulent discharge` exists only as a substance or morphologic abnormality, and `Skin discharge` was used instead.
- Plain `Wart` (disorder): none found. `Viral wart of skin and/or mucous membrane caused by human papillomavirus` was used instead.

## Checker issues left in place

- None.

## Questions for a clinician

- Should a mole needing same-week referral raise triage priority to Urgent? Or should these findings only be recorded and flagged for referral?
- Is an OR of the lesion types right for acne? With it, a single pustule or nodule makes acne probable, and that overlaps with boil and Kaposi's sarcoma.
- Is `Diameter of lump` acceptable for the width of a flat mole?
