# Page 84 – Generalised itchy rash: remaining questions

## Decisions made

- **Red box is pointer-only** ("Check if the patient needs urgent attention ↻ 82"): no priority
  evaluation; the element is `cross_reference_only`. The page's six "X likely" boxes are encoded as
  `probable` diagnosis rules, all triggered by the complaint.
- **Complaint concept:** `Pruritic rash` (disorder). It is not a recorded common symptom or warning
  sign, so the task only fires once the rash itself is recorded.
- **Insect bites:** only "red itchy crops of bumps" is required (`Papule of skin`); blistering,
  darkening and scratch marks are "may have" items. Diagnosis concept `Insect bite - wound`.
- **Scabies:** burrows **and** red bumps at one of the listed sites (finger webspaces, axillae,
  waist, genitals). "Very itchy, especially at night" is covered by the complaint; "especially at
  night" is not required.
- **PPE:** hyperpigmentation is recorded as a separate finding (`Hyperpigmentation of skin`) with
  papules on limbs/trunk/face; diagnosis concept is the HIV-specific PPE concept (the only one).
- **Eczema:** dry (`Xeroderma`) **and** scaly skin at wrist, ankle, antecubital or popliteal region.
- **Urticaria:** `Wheal` with `Sudden onset`. "Usually disappear within 24 hours" is not required.
- **Drug rash:** diffuse erythematous rash **and** a new medication commenced within the last 3
  months, written `(<= (onset …) (time_ago 3 months))` per the time-comparator rule.
- Management boxes (all treatment, advice, referral, "test for HIV", cross-references to 48, 51,
  85, 88, 93, 98, 124, 138) are management, not modelled.

## Could not model

- "Crops" of bumps: no SNOMED concept; plain `Papule of skin` used, so the insect-bites rule fires
  for any itchy papular rash (more often than the page intends), overlapping scabies and PPE.
- "Appeared within 3 months of starting a new medication" relates two event times; the language can
  only compare one onset with now. Approximated as medication started within the last 3 months —
  fires less often when a rash began soon after a medication started more than 3 months ago. Also
  depends on the onset of `New medication commenced` being recorded as the start date, not the
  date it was entered.
- "Usually disappear within 24 hours" (lesion duration) and "especially at night" (timing of itch).
- "Mainly on trunk, arms and legs" for drug rash: descriptive; not required.

## SNOMED gaps

- "Scabies" (disorder) does not exist → `Infestation caused by Sarcoptes scabiei var hominis`.
- "Dry skin" (finding) does not exist → `Xeroderma` (disorder).
- No "Hyperpigmented" qualifier → separate `Hyperpigmentation of skin` finding.
- No PPE concept without HIV cause → `Papular pruritic eruption of skin due to human immunodeficiency virus infection`.
- All `finding_site` body structures confirmed with `snomed exists`.

## Checker issues left in place

- None.

## Questions for a clinician

- Should the insect-bites rule require one of the "may have" features (blisters, dark healed
  lesions, scratch marks) to avoid firing alongside scabies/PPE?
- For scabies, should burrows alone or site-specific papules alone suffice (burrows are often not
  seen)?
- Is diagnosing the HIV-specific PPE concept acceptable before HIV status is known?
- Is "medication started within the last 3 months" an acceptable stand-in for "rash appeared
  within 3 months of starting a new medication"?
