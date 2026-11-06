# Page 85 – Localised itchy rash: remaining questions

## Decisions made

- **Pointer-only red box.** The red box says only "Check if the patient needs urgent attention ↻ 82".
  No priority evaluation is written here; the urgent criteria belong to page 82. The page's own
  diagnostic logic (the bullets and the flowchart) is encoded as one `check_for` task and ten
  `probable` diagnosis rules.
- **Trigger.** `Pruritic rash` (disorder) is the trigger for `Check for localised itchy rash
  conditions`. It is not a recorded common symptom or warning sign, so the task fires only when
  someone records it (for example from page 82). "Localised" has no qualifier and is left to the page
  context. The trigger cites the page title, because the only red-box element is the pointer.
- **"Itchy"** in the eczema ("dry, scaly, itchy skin") and insect-bite ("red itchy bumps") criteria is
  carried by the trigger (`Pruritic rash`) rather than a separate `Itching` finding. "Very itchy" for
  scabies is `Itching` + `Severe (severity modifier)`.
- **Papular urticaria and impetigo** sit inside the insect-bites box, so both require the insect-bite
  evidence (itchy rash + red papules) plus their own feature (blister or hyperpigmentation; yellow
  crust).
- **No branch of the question.** Psoriasis, pityriasis rosea and the tinea rules do not require the
  absence of red itchy bumps, following the gold standard (whose Q4 branch does not require "no
  exposure"). The "Head, face, trunk or limbs" / "Feet" split is carried by each description's own
  sites (tinea pedis findings are all on the foot).
- **Optional features not encoded:** "often on knees, elbows, lower back, scalp" and "may have pitted
  nails" (psoriasis); "typically followed within 2 weeks" and "may have Christmas tree pattern on
  back" (pityriasis rosea); "usually occurs in crops" (insect bites); "often start as itchy patches
  with red edges" (fixed drug eruption); "slow-growing" (tinea corporis). The page does not make them
  required.
- **Shapes and colours as qualifiers** on general skin findings: `Annular shape` (ring, clear in
  centre), `Silver color`, `Dark color`, `Round shape`, `Thickened`, `Dry`, `Large`, `Small`,
  `Multiple`, `Well defined`, `Raised`, `Red color`, `Yellow color`.
- **Diagnosis concepts:** scabies = `Infestation caused by Sarcoptes scabiei var hominis` (there is no
  "Scabies" FSN); papular urticaria = `Prurigo simplex` (SNOMED synonym); insect bites = `Insect bite
  - wound`.
- **Fixed drug eruption** pairs dark round macules with `Exposure to … Drug or medicament`, as in the
  gold standard. The time order ("after ingestion") is not modelled.

## Could not model

- **"Rash on scalp → 95"**: routing only. Not encoded, so there is no rule that sends scalp rashes
  to page 95.
- **Time order and course:** "after ingestion of a medication", "typically followed within 2 weeks",
  "slow-growing", "heals with darkened skin" (the sequence). Each is either encoded without its time
  element or left out.
- **"Oval"** (pityriasis rosea patches): no qualifier exists; `Small` + `Multiple` scaly skin used.
  Matches more often than the page intends.
- **"Fine scale in centre"** of the herald patch is not encoded separately; the herald patch is a
  large annular skin lesion on the chest or back.
- **"Small" red bumps (scabies):** `Papule of skin` is small by definition; "small" is not a
  separate qualifier.
- **Site of the bumps (scabies):** the page puts bumps and burrows in the listed sites; the site is
  attached to the burrow only.
- Management (advice, calamine, chlorphenamine, cetirizine, hydrocortisone, LPC, betamethasone,
  clotrimazole, HIV/diabetes tests, referral, → 84, → 88, → 93, → 97, "If diagnosis uncertain,
  discuss/refer") is out of scope.

## SNOMED gaps

- `Scabies` (disorder): not an FSN → `Infestation caused by Sarcoptes scabiei var hominis`.
- `Papular urticaria` (disorder): not an FSN → `Prurigo simplex` (synonym).
- `Rash` (finding), `Itchy rash`: none → `Pruritic rash` (disorder).
- `Dry skin` (finding): none (`Xeroderma` exists) → `Scaly skin` + `Dry` qualifier.
- Herald patch, silvery scale, ring of scale, raised edge, oval: no concepts → qualifiers on
  `Skin lesion` / `Scaly skin`.
- `Thickened skin` (finding): none (`Thick skin` exists) → `Scaly skin` + `Thickened` qualifier.
- `Fissure of skin`, `Cracked skin`: none → `Fissure` (morphologic abnormality) at the toe webs.
- `Patch` (morphologic abnormality): none.
- `Nail structure` (body structure): none (`Nail unit structure` exists); not used, since pitted
  nails is not encoded.
- Body sites all confirmed with `exists`: Skin structure of interdigital web of hand/foot, Axillary
  region structure, Structure of waist region of trunk, Genital structure, Wrist region structure,
  Ankle region structure, Antecubital region structure, Popliteal fossa structure, Anterior chest wall
  structure, Structure of posterior region of trunk, Skin structure of sole of foot, Heel structure,
  Skin structure of border of foot.

## Checker issues left in place

- None.

## Questions for a clinician

- Should the psoriasis rule also accept pitted nails (the page says "check nails" but "may have
  pitted nails")? As written, pitted nails are not checked for.
- Should the No-branch diagnoses (psoriasis, pityriasis rosea, tinea) require the absence of red
  itchy bumps, as the flowchart order implies?
- Is "red itchy bumps" (itchy rash + red papules) too broad for "insect bites likely"? It overlaps
  scabies, which also has red papules; both diagnoses can fire together.
- Should impetigo be diagnosed from yellow crusts alone, outside the insect-bite context? The tinea
  box also mentions yellow crusts (→ 93) but does not say "impetigo likely".
- Is `Prurigo simplex` the concept VHA wants for papular urticaria?
- Is `Pruritic rash` the right recorded complaint for this page, and will page 82 record it?
