# Page 93 – Crusts or flaky skin: remaining questions

## Decisions made

- **Red box is a pointer only** ("Check if the patient needs urgent attention ↻ 82"). No priority
  evaluation on this page; the element is accounted for as `cross_reference_only`.
- **Trigger:** `Crust on skin` (finding) or `Scaly skin` (finding). Neither is a recorded common
  symptom or warning sign, so the check task fires only when one of them is recorded.
- **Four probable diagnoses** from the four "X likely" boxes: impetigo, seborrhoeic dermatitis,
  psoriasis, eczema. Management text under each (including the Eczema "Manage ↻ 84" pointer and
  all medicines, HIV tests, urine dipstick, referral criteria) is not encoded.
- **Hedged descriptors are not criteria.** "often around mouth or nose", "May complicate insect
  bites, scabies or skin trauma", "Usually on scalp, between eyebrows, …", "Often on knees, elbows,
  lower back, scalp" and "May have pitted nails" describe typical presentations; requiring them
  would make the rules fire less often than the page intends, and making them alternatives would
  add logic the page doesn't state.
- **Eczema sites are required**, because the page states them without a hedge ("on wrists,
  ankles, inside elbows or behind knees"). The site is placed on the scaly finding.
- **Impetigo:** yellow crust, **or** crust together with blister of skin (blisters "dry to form"
  crusts, so either stage may be seen).
- "Fine" (seborrhoeic scale) is not encoded separately.

## Could not model

- "Greasy scales": no concept; `Greasy skin` (finding) used as the nearest.
- "Patches" as a morphology: no `Patch` morphologic abnormality concept; not encoded.
- The descriptive photographs carry no rule content.

## SNOMED gaps

- `Dry skin` (finding): does not exist → `Xeroderma` (disorder).
- `Skin structure of wrist` (body structure): does not exist → `Skin structure of wrist region`.
- `Greasy` / `Silvery` (qualifier value): do not exist → `Greasy skin` (finding); `Silver color`
  (qualifier value).
- No concept for "flaky skin" → `Scaly skin` (finding).

## Checker issues left in place

- None.

## Questions for a clinician

- Impetigo: is a yellow crust alone enough for "likely", or should blisters also be required?
- Eczema: should the listed sites be required (as encoded), or are they typical only, like the
  other columns?
- Seborrhoeic dermatitis vs psoriasis: both are red scaly lesions; is erythema + greasy-looking
  skin + scale a fair discriminator from silvery-scaled raised plaques?
- Should psoriasis also be "likely" from pitted nails with scaly skin, without a recorded plaque?
