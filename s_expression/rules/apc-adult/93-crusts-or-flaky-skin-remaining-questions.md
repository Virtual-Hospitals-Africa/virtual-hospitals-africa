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
- **Impetigo requires both blisters and yellow crusts** ("Blisters which dry to form yellow
  crusts"; reconciler chose builder B's literal reading). This fires less often than a
  crusts-only reading if the blister stage was not seen.
- **Eczema sites** use the skin structures (`Skin structure of wrist region`, `… of ankle`,
  `… of antecubital fossa`, `… of popliteal fossa`), since the page puts the scaly patches on the
  skin there; builder B used the region structures.
- "Fine" (seborrhoeic scale) is not encoded separately.
- The "Crusts" vs "Flaky skin" split is implicit: impetigo is not tied to the absence of scaly skin.

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
- "Yellow crust": no precoordinated concept → `Crust on skin` + `Yellow color` qualifier.

## Checker issues left in place

- None.

## Questions for a clinician

- Impetigo: should yellow crusts alone (without a recorded blister, e.g. once blisters have dried) be enough for "Impetigo likely"? The final build requires both.
- Eczema: should the listed sites be required (as encoded), or are they typical only, like the
  other columns?
- Seborrhoeic dermatitis vs psoriasis: both are red scaly lesions; is erythema + greasy-looking
  skin + scale a fair discriminator from silvery-scaled raised plaques?
- Should psoriasis also be "likely" from pitted nails with scaly skin, without a recorded plaque?
