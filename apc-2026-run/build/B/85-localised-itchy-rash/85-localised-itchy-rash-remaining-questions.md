# Page 85 – Localised itchy rash: remaining questions

## Decisions made

- **Red box is a pointer only** ("Check if the patient needs urgent attention ↻ 82"). No priority
  evaluation on this page; the element is recorded as `cross_reference_only`. The page's own
  diagnostic logic (bullets and the Yes/No algorithm) is encoded as one `check_for` task and ten
  `probable` diagnosis rules.
- **Presenting complaint** = `(clinical_finding (snomed_concept "Pruritic rash" "disorder"))`. It is
  not a recorded common symptom or warning sign, so the task fires only when a pruritic rash is
  recorded. "Localised" has no separate concept; a generalised itchy rash would also trigger it.
- **Q1 = No branch** (psoriasis, pityriasis rosea, tinea corporis, tinea pedis) does not require an
  explicit "No" to the red-itchy-bumps question; each description is distinctive. The site split
  (head/face/trunk/limbs vs feet) is carried by the findings' own sites (tinea pedis uses foot sites;
  the others are not site-restricted).
- **Insect bites likely** = itchy rash + skin papules. "May have blistered or healed with darkening"
  is optional on the page; blister/darkening is used only for papular urticaria.
- **Papular urticaria** is encoded as `Prurigo simplex` (its SNOMED synonym "papular urticaria").
- **Scabies** is encoded as `Infestation caused by Sarcoptes scabiei var hominis` (no "Scabies"
  disorder FSN in this release). "Very itchy" = Itching + Severe qualifier; the site list
  (webspaces of fingers, axillae, waist, genitals) is attached to the burrows.
- **Eczema** = itchy rash + dry skin (`Xeroderma`) + scaly skin at wrist, ankle, antecubital region
  ("inside elbows") or popliteal region ("behind knees").
- **Fixed drug eruption** = round skin macules + skin hyperpigmentation ("dark coloured") + exposure
  to a drug (gold-standard exposure form). "Often start as itchy patches with red edges" is a
  "often" feature and is not required.
- **Psoriasis** = well-defined raised skin plaque + silver-coloured scaly skin. "Often on knees,
  elbows, lower back, scalp" and "may have pitted nails" are optional features, not encoded.
- **Tinea pedis**: cracks/peeling/scaly skin of the interdigital web of foot, or thickened **and**
  scaly skin at the same site (sole, heel or lateral border of foot).

## Could not model

- **Pityriasis rosea "typically followed within 2 weeks by smaller, oval, scaly patches"**: the
  language cannot compare the onsets of two findings. The rule requires the herald patch and
  multiple oval lesions with no time relation (fires somewhat more often than intended). "Large",
  "fine scale in centre", "smaller", "scaly" (for the oval patches) and the Christmas-tree pattern
  are not encoded.
- **Tinea corporis "slow-growing", "clear in centre"**: no concepts; omitted (fires more often).
  "Raised edges" is approximated by a raised annular lesion.
- **"Small red bumps" / "red itchy bumps"**: "small" and "red" are not encoded on the papule, so
  one papule finding serves both scabies and insect bites; any recorded papule in an itchy rash
  yields probable insect bites, including scabies patients (the page's own overlap).
- **"Usually occurs in crops"** (insect bites): descriptive; not encoded.
- **"After ingestion of a medication"**: exposure is recorded without route or timing.
- **"Ask where rash started and how it progressed. Look at distribution…"**: examination
  instructions; their content is carried by the site-specific findings.
- Pointers (rash on scalp ↻ 95, nails ↻ 97, surrounding skin red/warm/swollen ↻ 93, impetigo → 93,
  scabies/eczema → 84, fixed drug eruption → 88) and all management (advice, medicines, HIV and
  diabetes tests, referral, "If diagnosis uncertain, discuss/refer") are not encoded.

## SNOMED gaps

- "Scabies" (disorder): not an FSN; used `Infestation caused by Sarcoptes scabiei var hominis`.
- "Papular urticaria" (disorder): not an FSN; used `Prurigo simplex`.
- "Herald patch": no concept; used annular `Skin lesion` on chest or back skin.
- "Raised edge", "central clearing / clear in centre", "silvery scale": no concepts; used
  `Raised`, nothing, and `Scaly skin` + `Silver color` respectively.
- "Dry skin" (finding): no FSN; used `Xeroderma` (disorder), whose synonym is "Dry skin".
- "Red papule" / "erythematous papule": none; used `Papule of skin`.
- "Back structure": no FSN; used `Skin structure of back`.

## Checker issues left in place

- None.

## Questions for a clinician

- Should probable insect bites require something beyond an itchy rash with papules (e.g. no
  burrows), given that scabies also presents with red bumps?
- Is it acceptable that the No-branch diagnoses fire without the health worker answering "No" to
  the red-itchy-bumps question?
- Should the pityriasis rosea rule fire on multiple oval lesions with a herald patch alone, without
  the 2-week sequence?
- Is `Xeroderma` the right concept for "dry skin" in eczema?
