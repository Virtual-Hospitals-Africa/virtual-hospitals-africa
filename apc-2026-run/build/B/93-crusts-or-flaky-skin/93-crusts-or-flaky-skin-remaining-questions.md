# Page 93 – Crusts or flaky skin: remaining questions

## Decisions made

- **Red box is a pointer** ("Check if the patient needs urgent attention ⮌ 82"): no priority evaluation; element accounted as `cross_reference_only`. The page does have diagnostic logic below the box, so a `check_for` task and four `probable` diagnosis rules are written.
- **"Flaky skin" → `Scaly skin` (finding).** There is no exact "flaky skin" finding; every flaky-skin branch on the page describes scales.
- **Impetigo requires both blisters and yellow crusts** ("Blisters which dry to form yellow crusts"). This fires less often than a crusts-only reading if the blister stage was not seen.
- **Eczema requires one of the four listed sites** (wrists, ankles, inside elbows, behind knees), because the page lists them without "usually"/"often". Sites are put on `Scaly skin` via `finding_site`.
- **"Usually"/"often"/"may" descriptors not encoded**: seborrhoeic dermatitis sites, psoriasis sites, pitted nails, impetigo "around mouth or nose" and "may complicate insect bites, scabies or skin trauma".
- Management text (antibiotics, creams, HIV test, urine dipstick, referral) is out of scope.

## Could not model

- "Fine" scales (seborrhoeic dermatitis) and "well-defined" plaques (psoriasis): no qualifier; dropped, so the rules fire somewhat more often than the page intends.
- The "Crusts" vs "Flaky skin" split is implicit: impetigo is not tied to the absence of scaly skin.

## SNOMED gaps

- "Flaky skin": no concept; used `Scaly skin` (finding).
- "Dry skin" (finding) does not exist; used `Xeroderma` (disorder), whose synonym is "dry skin".
- "Greasy scale" / "silvery scale": no precoordinated concepts; used `Greasy skin` (finding) and `Scaly skin` + `Silver color` qualifier.
- "Yellow crust": no precoordinated concept; used `Crust on skin` + `Yellow color` qualifier.

## Checker issues left in place

- None.

## Questions for a clinician

- Impetigo: should yellow crusts alone (without a recorded blister) be enough for "Impetigo likely"?
- Eczema: is restricting to the four listed sites right, or are they typical sites only?
- Should "may have pitted nails" raise psoriasis to probable when present with scaly skin?
