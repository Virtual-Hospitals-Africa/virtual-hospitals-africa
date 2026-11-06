# Page 89 – Skin lump/s: remaining questions

Final build, reconciled from builders A and B (see `reconcile.json`).

## Decisions made

- **"Refer same week" became `Urgent`.** The language has only `Emergency`, `"Very urgent"` and `Urgent`. Urgent is the lowest, but it still ranks a same-week referral above routine care, so this over-triages somewhat.
- **Mole = `Melanocytic nevus` (disorder)**, the page's word. The red-box feature concepts (Irregular outline / Mixed color / Changing shape / Changing color / Itching of pigmented skin lesion) are children of `Pigmented skin lesion`, which is *not* a descendant of `Melanocytic nevus`, so a recorded feature does not by itself satisfy the mole condition. (Both builders' notes on this hierarchy were wrong and have been corrected.) The skin-lump task checks for the mole, which triggers the mole task, the width measurement and the priority rule.
- **The lump task fires on `Mass of skin` or `Mass of subcutaneous tissue`.** SNOMED doesn't place lumps beneath the skin under `Mass of skin`.
- **"Changed in size, shape or colour"** is changing shape, changing colour and the general `Change in skin lesion`. SNOMED has no change-in-size concept, so the general concept stands in; the rule fires for any recorded change.
- **"Is irregular in shape or colour"** is `Irregular outline of pigmented skin lesion` or `Mixed color of pigmented skin lesion`.
- **"Is > 6mm wide"** is `(> (measurement Lesion size, largest dimension mm) 6)`, measured by a `measure` task. This is a measurement comparison, not an onset one, so the page's `>` is kept.
- **"Bleeds easily"** is the exact concept `Bleeds easily` (finding); it relies on the rule's mole condition for its site.
- **Boil/abscess** is two probable rules on identical evidence (`Furuncle`; `Abscess of skin and/or subcutaneous tissue`), because the page names both and Furuncle is not a descendant of the abscess concept. All six listed features are ANDed: painful (`Pain of skin`), firm, red (`Redness of skin over lesion`), warm (`Temperature of skin over lesion warm`), softens (`Fluctuant`) and discharges pus (`Skin discharge`).
- **Warts:** round, raised papule (qualifiers kept) and rough skin.
- **Molluscum:** small papule, skin dimple, and no papule on the palm or sole ("Does not involve palms/soles").
- **Kaposi's sarcoma:** painless skin mass and (purple or brown skin mass). Diagnosis is the general `Kaposi's sarcoma`, as the page names it and notes lesions in the mouth and on the genitals too.
- **Epidermoid cyst / lipoma:** both need the smooth, well-defined subcutaneous mass; then round and firm (cyst) or soft and painless (lipoma). "May have central hole and discharge white substance" is optional on the page, so it is not required.
- **Acne** uses an OR of red papules, pustules, nodules and blackheads. The page writes "and", but its management treats a "blackheads only" case.
- Location notes ("usually on face and trunk", "on hands, knees or elbows", "trunk or upper limb", "usually on face") describe where lesions usually appear. They are not criteria and are not encoded.
- Management is not encoded: HIV testing, the treatments, referral criteria such as "> 3cm" and "persists > 1 month", and "If diagnosis uncertain, discuss/refer".

## Could not model

- **"Differs from surrounding moles".** No concept; the priority rule fires **less often** than the page intends.
- **"Skin-coloured", "pearly" (molluscum), "doughy" and "moves easily" (lipoma).** No concepts. Those rules rest on the remaining features and fire **more often** than the page intends.
- **"Discharge pus".** Encoded as any `Skin discharge`, which is broader than pus (fires more often).

## SNOMED gaps

- Mole as such: no `Mole`/`Nevus` disorder; used `Melanocytic nevus`.
- Mole that differs from the patient's other moles ("ugly duckling" sign): none found. Searched nevus, pigmented lesion, atypical, dysplastic; `Atypical pigmented lesion` is broader, not used.
- Change in size of a pigmented lesion: none found. `Change in skin lesion` was used instead.
- Skin-coloured or flesh-coloured qualifier, pearly, umbilicated: none found. `Skin dimple` was used for the central dimple.
- Doughy, mobile or movable qualifier (`Mobile`, `Freely mobile` don't exist): none found.
- Purulent discharge from skin as a finding: none found. `Purulent discharge` exists only as a substance or morphologic abnormality; `Skin discharge` was used instead.
- Plain `Wart` (disorder): none found; used `Viral wart of skin and/or mucous membrane caused by human papillomavirus`. No plain `Molluscum contagiosum` disorder; used `Infection of skin caused by Molluscum contagiosum`.

## Checker issues left in place

These four all come from the molluscum rule's `(no …)` evidence with a finding_site. The rendered `(no …)` puts the `"No"` qualifier before the finding_site attribute, so neither the gate's `NO_RE` nor VHA's `(no ${s})` lookup matches it to the checked-for form. The findings are checked for and used.

- `CHECKED FOR BUT NEVER USED AS EVIDENCE`: `(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Papule of skin" "disorder") (attribute (snomed_concept "Finding site" "attribute") (snomed_concept "Palm (region) structure" "body structure")))`
- `CHECKED FOR BUT NEVER USED AS EVIDENCE`: `(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Papule of skin" "disorder") (attribute (snomed_concept "Finding site" "attribute") (snomed_concept "Structure of sole of foot" "body structure")))`
- `PROBABLE DIAGNOSIS EVIDENCE NOT CHECKED FOR`: `(no (finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Papule of skin" "disorder") (snomed_concept "No" "qualifier value") (attribute (snomed_concept "Finding site" "attribute") (snomed_concept "Palm (region) structure" "body structure"))))`
- `PROBABLE DIAGNOSIS EVIDENCE NOT CHECKED FOR`: `(no (finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Papule of skin" "disorder") (snomed_concept "No" "qualifier value") (attribute (snomed_concept "Finding site" "attribute") (snomed_concept "Structure of sole of foot" "body structure"))))`

## Questions for a clinician

- Should a mole needing same-week referral raise triage priority to `Urgent`, or should these findings only be recorded and flagged for referral?
- Is `Melanocytic nevus` the right concept for "mole", or should the broader `Pigmented skin lesion` be used so that a lesion the patient calls a mole (which may be a melanoma) is caught?
- "Softens in the centre to discharge pus": should boil/abscess require both fluctuance and discharge (as encoded), or either one?
- Boil vs abscess: is one diagnosis enough, given that both go to page 83?
- Acne: is an OR of the lesion types right? With it, a single pustule or nodule makes acne probable, which overlaps with boil and Kaposi's sarcoma. Or should blackheads alone, or a mixed picture, be required?
- Is a "skin lump" ever recorded as such at intake (it is not a common symptom), so that these rules can fire?
