# Page 40 – Mpox: diagnosis and management: remaining questions

## Decisions made

- **Suspected mpox is the anchor.** `Diagnose possible mpox` encodes the "Suspect mpox if…" bullet
  and triggers both `check_for` tasks. Every probable rule and the priority rule also require
  `(active_condition Monkeypox possible)`, because the page applies the red box and the differential
  only to the patient with suspected mpox. Without it, e.g. chest pain alone would give probable
  myocarditis for any patient.
- **"A, B, C, X likely" lines** (dehydration, myocarditis) are read as *any* of the signs (`or`).
  The page does not say how many are needed.
- **Shock/SBP < 80** is encoded as the page's own `or` of Shock (disorder) and systolic BP < 80
  (decision for all pages). Footnote 1 ("If SBP < 80, pulse ≥ 100, respiratory rate > 30,
  confusion/restlessness, weakness, shock likely") is not built into a shock rule.
- **BP < 90/60** is systolic < 90 or diastolic < 60.
- **Proctitis:** one probable rule with two branches: severe anal bleeding, pain or discharge (red
  box), or anal sex plus any anal bleeding, pain or discharge (approach section). The priority rule
  uses the severe findings directly, so the non-urgent branch does not make the patient urgent.
- **Persistent nausea and vomiting** = Nausea and Persistent vomiting.
- **Tick bite fever** = Spotted fever group rickettsial disease (parent of South African tick-bite
  fever and African tick bite fever).
- **Hand-foot and mouth disease** = Enteroviral vesicular stomatitis with exanthem (the FSN).
- **"New medication in past 3 months"** = `(<= (onset New medication commenced) (time_ago 3 months))`,
  written with `<=` because the database accepts only `<=`/`>=`.
- **Itchy / non-itchy** branches are `Itching of skin` and `(no Itching of skin)`. Generalised and
  localised are `Generalized rash` and `Localized eruption of skin`.
- **"Painful"** in the differential is a general `Pain` finding (there is no "painful" qualifier).

## Could not model

- **Age > 65**: the language has no age comparison. The at-risk branch fires less often than intended.
- **HIV not on ART / virologically unsuppressed**: ART status is a procedure and viral load is a lab
  value. Not encoded, so fires less often. `Patient immunocompromised` still covers it if recorded.
- **"Contact … in the 21 days before symptom onset"**: the window is relative to symptom onset, so
  not modelled. Any recorded exposure counts, so this fires more often.
- **"Temperature > 38.5°C in the last 2 days"**: only the current measurement (> 38.5) is used. A
  reported fever in the past 2 days is not captured, so this fires less often.
- **"Unexplained"** lesions and the lesion site list (face, palms/soles, genitals, anus, rectum,
  mouth, eyes) are not encoded. Any new skin lesion counts.
- **"Mpox is more likely" if all lesions look similar and progress at a similar pace**: no concept
  for this, so there is no probable mpox rule.
- **Spreading patterns** (measles: face to body; tick bite fever: extremities to body), "in a band"
  (shingles), "grouped" (herpes simplex), "crops at different stages of healing" (chickenpox),
  "honey-coloured" (impetigo), "red" (measles rash), "itch worse at night" and "in web spaces or
  skin folds" (scabies): no concepts. Each rule fires more often without them.
- **Advanced HIV disease** is approximated by known HIV infection (broader, so it fires more often).
- **Palms/soles** are approximated by Hand structure / Foot structure (no palm/sole structure
  resolves).
- Tests (HIV, syphilis serology), PPE/isolation, NICD hotline and all management lines are
  management or routing.

## SNOMED gaps

- "Unable to pass stool": no concept. Used `Difficulty in ability to defecate` (broader).
- "Difficulty breathing while talking": used `Unable to complete a sentence in one breath` (stricter).
- "Thirst": no plain finding. Used `Thirst due to water deprivation` (VHA vocabulary).
- "Organ transplant": used `Transplant present` (finding).
- "Persistent" qualifier: does not exist. Used `Persistent vomiting` (disorder).
- "Scabies": FSN is `Infestation caused by Sarcoptes scabiei var hominis`.
- Palm / sole / web space / skin fold body structures: `Palm structure`, `Sole of foot structure`,
  `Skin fold structure` and `Web space of hand` do not resolve.
- "Mpox is more likely" (monomorphic lesions at the same stage), "honey-coloured", "grouped",
  "in a band", "rash spreading", "itch worse at night", "advanced HIV disease": no concepts found.

## Checker issues left in place

- None.

## Questions for a clinician

- Should the dehydration and myocarditis lines need one sign, or all the signs (or two or more)?
- Is "Severe" meant to apply to anal pain and discharge as well as bleeding?
- Is known HIV infection an acceptable stand-in for "advanced HIV disease", or should the papular
  pruritic eruption rule wait for a CD4/WHO-stage representation?
- Is "Patient immunocompromised" enough to cover "HIV not on ART/virologically unsuppressed" until
  ART status can be represented?
- Should the differential rules (chickenpox, measles, …) fire only in suspected mpox (as encoded),
  or should they be shared with the dedicated rash pages (84, 88, 89, 83, 93)?
- The mpox trigger depends on a new skin lesion being recorded; a skin lesion is not a VHA common
  symptom or warning sign, so the pre-screen only fires if a lesion is recorded through another page.
