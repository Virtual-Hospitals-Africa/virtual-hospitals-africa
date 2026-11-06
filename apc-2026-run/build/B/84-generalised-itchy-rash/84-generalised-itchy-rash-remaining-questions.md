# Page 84 – Generalised itchy rash: remaining questions

## Decisions made

- **Red box is a pointer only** ("Check if the patient needs urgent attention ↻ 82"). No priority
  evaluation is written on this page; the element is accounted for as `cross_reference_only`.
- **Trigger**: `(or Pruritic rash, Generalized rash, Generalized pruritus)`. None of these is a
  recorded common symptom or warning sign, so the task fires only if one of them is recorded.
- **Six "X likely" panels → six `probable` rules**, each using only the discriminating findings of
  its panel. The probable rules are not additionally gated on the itchy-rash trigger.
- **Scabies** uses `Infestation caused by Sarcoptes scabiei var hominis` (no `Scabies` FSN exists).
  Encoded as burrows **and** papules at one of the four named sites.
- **PPE** uses the generic `Papular eruption` (disorder), not the HIV-specific concept, so that a
  probable PPE does not imply HIV disease before the HIV test the page asks for.
- **Drug rash timing**: "appeared within 3 months of starting a new medication" is written as
  `New medication commenced` with `(<= (onset …) (time_ago 3 months))` (shared convention: only
  `>=`/`<=` in onset comparisons; "within" → `<=`).
- **Insect bites**: "crops of bumps" → `Papule of skin` with qualifier `Grouped`. Diagnosis is
  `Insect bite - wound`; the page then points to page 85.

## Could not model

- Colour of the bumps ("red", "small red") — no erythematous-papule concept; omitted (fires more often).
- Optional insect-bite features ("may have blistered or healed with darkening of skin, may have
  scratch marks") — hedged on the page; not required.
- Scabies "very itchy, especially at night" — no nocturnal-itch concept found; not required (fires more often).
- Urticaria "usually disappear within 24 hours" — hedged and not assessable at one visit; omitted.
- Drug rash "diffuse" and "mainly on trunk, arms and legs" — omitted (fires more often). The timing
  is measured from today, not from rash onset.
- All management bullets (benzyl benzoate, permethrin, emollients, steroids, antihistamines,
  antibiotics, referral, HIV test, footnotes) are management and not encoded.

## SNOMED gaps

- `Scabies` (disorder): not an FSN; used `Infestation caused by Sarcoptes scabiei var hominis`.
- `Dry skin` (finding): not an FSN; used `Xeroderma` (disorder).
- No precoordinated red/erythematous papule, hyperpigmented papule, or nocturnal pruritus concept.
- PPE: only `Papular pruritic eruption of skin due to human immunodeficiency virus infection` exists;
  used the parent `Papular eruption` instead (see Decisions).

## Checker issues left in place

- None.

## Questions for a clinician

- Should PPE be diagnosed with the HIV-specific SNOMED concept (it is HIV-associated by definition),
  or stay generic until HIV is confirmed?
- Is `Papule of skin` + `Grouped` an acceptable proxy for "crops of bumps", given grouped papules
  could also be scabies or PPE (several probable rules may fire together)?
- Should every probable rule also require the itchy-rash complaint, to keep them to this page's context?
