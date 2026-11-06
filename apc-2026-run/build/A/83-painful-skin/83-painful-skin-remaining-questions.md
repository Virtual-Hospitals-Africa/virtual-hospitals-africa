# Page 83 – Painful skin: remaining questions

## Decisions made

- **Red box is pointer-only** ("Check if the patient needs urgent attention ↻ 82"). It is accounted
  for as `cross_reference_only`, and the page has no `system_priority_evaluation`. The page's
  "X likely" logic is still encoded, as the brief asks.
- **Trigger.** "Painful skin" is not a recorded common symptom or warning sign. The task is
  triggered by `(clinical_finding Pain (finding_site Skin structure))`, cited to the page title,
  because the box has no header. No precoordinated "pain of skin" finding exists. `Skin-ache
  syndrome` only matches as a synonym and means something else.
- **Five probable diagnosis rules**, one for each "likely" on the page: boil/abscess, hidradenitis
  suppurativa, cellulitis, erysipelas and herpes zoster. Each one includes the painful-skin trigger
  as evidence.
- **Borders of the redness** are qualifiers on `Erythema`: `Poorly defined` for cellulitis, and
  `Well defined` + `Raised` for erysipelas ("clearly-defined raised borders").
- **"Blisters in a band along one side"** is `Blister of skin` with the `Zosteriform` and
  `Unilateral` qualifiers.
- **"Boil/abscess"** is diagnosed as `Abscess of skin and/or subcutaneous tissue`. `Furuncle`
  (boil) is not a descendant of it in this SNOMED release. The broader concept was chosen because
  the page treats both as one diagnosis.
- **Hidradenitis suppurativa** requires `Recurrent abscess of skin` and an abscess in the axilla,
  groin or perineum, which follows the nesting on the page ("If recurrent boils or abscesses: If
  painful abscesses in axilla, groin or perineum").
- **"May be fluctuant" / "May discharge pus"** are optional descriptors. They are not required and
  not checked for.
- **Out of scope as management:** all "Refer same day if" lists, the antibiotic criteria (swollen
  tender lymph nodes, multiple lesions, temperature ≥ 38°C, HIV, diabetes, …) and the aciclovir
  criteria (≤ 3 days since onset, at risk of severe infection). These are management steps; their
  elements lie outside the red box and need no accounting.

## Could not model

- The page's columns are alternative presentations, but the rules don't exclude one another. For
  example, a red, warm, swollen patch that also has a lump can fire both the abscess rule and the
  cellulitis or erysipelas rule. The page gives no exclusion criteria, so none were added.

## SNOMED gaps

- No "poorly/clearly defined border" finding; qualifiers on `Erythema` were used instead.
- No "lump of skin"; `Mass of skin` was used.
- No "pain of skin" finding; `Pain` + `finding_site` `Skin structure` was used.
- No "Abscess of skin" (exact FSN); `Abscess of skin and/or subcutaneous tissue` was used.

## Checker issues left in place

- None.

## Questions for a clinician

- Is `Erythema` qualified by `Poorly defined` / `Well defined` + `Raised` something the intake
  form can actually record? If not, the cellulitis and erysipelas rules can't fire as written.
- Should the hidradenitis rule fire on a single painful abscess in the axilla, groin or perineum
  without a recorded recurrence? The page nests it under "recurrent boils or abscesses", so the
  rule requires recurrence.
