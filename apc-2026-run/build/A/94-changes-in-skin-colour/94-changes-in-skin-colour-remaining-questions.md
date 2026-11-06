# Page 94 – Changes in skin colour: remaining questions

## Decisions made

- **Two tasks.** `Check for causes of changes in skin colour` (trigger `Discoloration of skin`)
  checks the findings that steer the page's top-level question to each "likely" diagnosis.
  `Check for urgent jaundice conditions (changes in skin colour)` (trigger: jaundice) checks the red
  box.
- **Jaundice is diagnosed at `probable` from `Yellow skin`** ("Yellow skin: jaundice likely"). The
  red-box task and the priority rule accept either a recorded `Jaundice` finding or that probable
  diagnosis (`or` of `clinical_finding` and `active_condition`).
- **Shock/BP < 80** is encoded as `Shock` (disorder) **or** systolic BP < 80, as the page writes it
  (shared decision). Footnote 1 (SBP < 80, pulse ≥ 100, RR > 30, confusion/restlessness, weakness →
  shock likely) is not turned into a shock definition.
- **Severe abdominal pain** = `Abdominal pain` + `Severe (severity modifier)` (no precoordinated
  concept).
- **Drowsy or confused** = `Drowsy` or `Acute confusion` (the Confusion warning sign's form).
- **Easy bruising or bleeding** = `Easy bruising` or `Bleeds easily`.
- **Using any medication** = exposure to `Drug or medicament` (page 20's exposure pattern), since
  `Taking medication` exists only as an observable entity.
- **Dark patches by site** = `Hyperpigmentation of skin` with `finding_site` lower leg (`Structure
  of lower limb from knee to ankle`), `Face structure` or `Trunk structure`. The descriptions under
  each site (red-brown discolouration, ulcers, spidery veins; flat brown patches on cheeks, forehead
  and upper lip) are not required, because the page branches on the site.
- **Tinea versicolor** = `Scaly skin` and (dark patch on trunk, or `Hypopigmentation of skin`
  anywhere). "Usually on trunk, neck and upper arms" is descriptive, not a requirement.
- **Absence of colour** = `Achromia of skin`; patchy (`Patchy` qualifier) → vitiligo; generalised
  (`Generalized` + `Congenital` qualifiers) with `White hair` and `Iris hypopigmentation` → albinism.
- Diagnosis concepts: `Jaundice` (finding), `Venous stasis syndrome`, `Chloasma` (SNOMED's FSN for
  melasma), `Pityriasis versicolor` (FSN for tinea versicolor), `Vitiligo`, `Albinism`.
- No `measure` task: temperature and BP are routine vitals; the bloods are lab tests.

## Could not model

- **Hb < 12 (woman) or < 13 (man)**: no haemoglobin observable or unit. Left out of the priority
  rule, which therefore fires **less often** than the page intends.
- **≥ 4 drinks/session** and "recent" for the alcohol binge: any recorded `Drinking binge` counts,
  so this fires **more often** than the page intends.
- The jaundice work-up: bloods (ALT, ALP, bilirubin, FBC, INR, hepatitis A IgM, HBsAg), the 2-day
  review thresholds (ALT ≥ 200, INR ≥ 1.5, ALP out of proportion, Hb, plts < 150), and the hepatitis A
  IgM / HBsAg result branches ("Patient has acute hepatitis A infection"). Lab values and results
  have no representation; these are also referral/management steps.
- All management (advice, sunscreen, selenium sulphide, compression, referral, notification).

## SNOMED gaps

- `Melasma` (disorder): not an FSN; used `Chloasma`.
- `Tinea versicolor`: synonym only; used `Pityriasis versicolor`.
- `Severe abdominal pain`: none; used `Abdominal pain` + `Severe (severity modifier)`.
- `Confusion` (finding): none; used `Acute confusion`.
- `Lower leg structure` (body structure): none; used `Structure of lower limb from knee to ankle`.
- "Fine scale": used `Scaly skin`. "Absence of colour": used `Achromia of skin`.
- "Hair involved" in albinism: used `White hair`; "eyes involved": used `Iris hypopigmentation`.
- "Using any medication": `Taking medication` is an observable entity only; used drug exposure.
- `Venous stasis` exists only as a finding; used `Venous stasis syndrome` (disorder).

## Checker issues left in place

- None.

## Questions for a clinician

- Albinism requires generalised congenital achromia **and** white hair **and** iris
  hypopigmentation. Is that too strict for a health worker to record, or is generalised
  depigmentation from birth enough?
- Should light patches without scale (no tinea versicolor) lead anywhere? The page routes them
  only to tinea versicolor.
- Is `Exposure to … Drug or medicament` the right way to record "using any medication" (the
  footnote singles out atazanavir)?
- Does `Discoloration of skin` suit as the recorded complaint, given that hyper/hypopigmentation
  and achromia are not its descendants in SNOMED?
