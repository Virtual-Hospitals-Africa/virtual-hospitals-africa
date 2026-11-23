# Page 85 – Localised itchy rash: remaining questions

Final build, reconciled from two independent builds (A and B); see `reconcile.json` for each
difference and why it was resolved that way.

## Decisions made

- **The red box is a pointer only** ("Check if the patient needs urgent attention ↻ 82"). There is
  no priority evaluation on this page, and the element is recorded as `cross_reference_only`. The
  page's own diagnostic logic (the bullets and the Yes/No algorithm) is encoded as one `check_for`
  task and ten `probable` diagnosis rules.
- **The trigger** is `Pruritic rash` (disorder), citing the page title. It isn't a recorded common
  symptom or warning sign, so the task fires only when someone records it. "Localised" has no
  concept, so a generalised itchy rash would also trigger the task.
- **"Itchy"** in the eczema ("dry, scaly, itchy skin") and insect-bite ("red itchy bumps") criteria
  comes from the trigger (`Pruritic rash`). "Very itchy" for scabies is `Itching` + `Severe
  (severity modifier)`.
- **Red bumps** are encoded as `Papule of skin` + `Red color`. The same finding serves scabies
  ("small red bumps") and insect bites ("red itchy bumps").
- **Scabies** is encoded as `Infestation caused by Sarcoptes scabiei var hominis`, because no
  "Scabies" FSN exists. The site list (webspaces of fingers, axillae, waist, genitals) is attached
  to `Burrows in skin`.
- **Eczema** is itchy rash + `Scaly skin` with a `Dry` qualifier at the wrist, ankle, antecubital
  region ("inside elbows") or popliteal fossa ("behind knees"). Dryness and scaliness sit on one
  finding at one site, as in "patches of dry, scaly … skin on …".
- **Fixed drug eruption** is `Macule of skin` with `Dark color` and `Round shape` qualifiers +
  `Exposure to … Drug or medicament` (the gold-standard exposure form). The time order ("after
  ingestion") isn't modelled.
- **Insect bites likely** is itchy rash + red papules. Blistering and darkening are optional ("may
  have") and are used only for papular urticaria.
- **Papular urticaria and impetigo** sit inside the insect-bites box, so both require the insect-bite
  evidence plus their own feature. For papular urticaria that is a blister of skin or
  `Post-inflammatory hyperpigmentation` ("heals with darkened skin"); for impetigo it is a yellow
  crust. Papular urticaria is encoded as `Prurigo simplex`, its SNOMED synonym.
- **No-branch diagnoses** (psoriasis, pityriasis rosea, tinea) don't require an explicit "No" to the
  red-itchy-bumps question, following the gold standard. The head/face/trunk/limbs vs feet split is
  carried by each finding's own sites.
- **Pityriasis rosea** is a herald patch (`Skin lesion` + `Large` + `Annular shape` on the skin of
  the chest or back) **and** `Oval shaped lesion` + `Multiple` + `Small`.
- **Tinea pedis** is a fissure in skin, peeling or scaly skin of the interdigital web of the foot,
  **or** `Scaly skin` + `Thickened` on the sole, heel or border of the foot ("sides of feet" means
  both borders).
- **Optional features aren't encoded:** "often on knees, elbows, lower back, scalp" and "may have
  pitted nails" (psoriasis); "typically followed within 2 weeks" and "may have Christmas tree
  pattern on back" (pityriasis rosea); "usually occurs in crops" (insect bites); "often start as
  itchy patches with red edges" (fixed drug eruption); "slow-growing" (tinea corporis).

## Could not model

- **"Rash on scalp → 95"**: routing only. Nothing sends scalp rashes to page 95.
- **Pityriasis rosea timing.** "Typically followed within 2 weeks by smaller, oval, scaly patches"
  can't be encoded, because the language can't compare the onsets of two findings. The rule
  therefore fires somewhat more often than the page intends. "Fine scale in centre", "scaly" (for
  the oval patches) and the Christmas-tree pattern aren't encoded either.
- **Tinea corporis.** "Slow-growing" and "clear in centre" have no concepts, so the rule fires more
  often than intended. "Raised edges" is approximated by a raised annular lesion.
- **Time order and course:** "after ingestion of a medication" and "heals with darkened skin" are
  encoded without their time element.
- **"Small" red bumps (scabies):** a papule is small by definition, so "small" has no separate
  qualifier. The site is attached to the burrows only, not to the bumps.
- **"Ask where rash started and how it progressed. Look at distribution…"** is an examination
  instruction. Its content is carried by the site-specific findings.
- **Pointers and management aren't encoded:** nails ↻ 97, surrounding skin red/warm/swollen or
  yellow crusts ↻ 93, → 84, → 88, → 93, advice, medicines, HIV and diabetes tests, referral, and
  "If diagnosis uncertain, discuss/refer".

## SNOMED gaps

- `Scabies` (disorder) isn't an FSN; used `Infestation caused by Sarcoptes scabiei var hominis`.
- `Papular urticaria` (disorder) isn't an FSN; used `Prurigo simplex`, which has it as a synonym.
- `Rash` (finding) and `Itchy rash` don't exist; used `Pruritic rash` (disorder).
- `Dry skin` (finding) doesn't exist, though `Xeroderma` (disorder) does; used `Scaly skin` + `Dry`.
- Herald patch, silvery scale, ring of scale, raised edge and central clearing have no concepts;
  used qualifiers on `Skin lesion` / `Scaly skin`.
- `Thickened skin` (finding) doesn't exist; used `Scaly skin` + `Thickened`.
- `Patch` (morphologic abnormality) doesn't exist.
- `Back structure` doesn't exist; used `Skin structure of back`.
- Every body site was confirmed with `exists`: Structure of interdigital web of hand/foot, Axillary
  region structure, Structure of waist region of trunk, Genital structure, Wrist region structure,
  Ankle region structure, Antecubital region structure, Popliteal fossa structure, Skin structure of
  chest, Skin structure of back, Skin structure of sole of foot, Skin structure of heel and Skin
  structure of border of foot.

## Checker issues left in place

- None.

## Questions for a clinician

- Is "red itchy bumps" (itchy rash + red papules) too broad for "insect bites likely"? It overlaps
  scabies, which also has red papules, so both diagnoses can fire together. Should insect bites
  require something more, such as no burrows?
- Should the No-branch diagnoses (psoriasis, pityriasis rosea, tinea) require the absence of red
  itchy bumps, as the flowchart order implies? As written, they fire without the health worker
  answering "No".
- Should the pityriasis rosea rule fire on a herald patch plus multiple small oval lesions alone,
  without the 2-week sequence?
- Should the psoriasis rule also accept pitted nails? The page says "check nails" but also "may have
  pitted nails". As written, pitted nails aren't checked for.
- Should impetigo be diagnosed from yellow crusts alone, outside the insect-bite context? The tinea
  box also mentions yellow crusts (→ 93) but doesn't say "impetigo likely".
- Is `Prurigo simplex` the concept VHA wants for papular urticaria?
- Is `Pruritic rash` the right recorded complaint for this page, and will page 82 record it?
- "Healed with darkening of skin" is encoded as `Post-inflammatory hyperpigmentation`; the other
  build used the broader `Hyperpigmentation of skin`. Is the specific concept right for papular
  urticaria?
