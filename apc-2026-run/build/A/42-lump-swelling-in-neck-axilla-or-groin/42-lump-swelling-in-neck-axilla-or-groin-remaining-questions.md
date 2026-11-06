# Page 42 – Lump/swelling in neck, axilla or groin: remaining questions

## Decisions made

- **Trigger.** The complaint is the common symptom "Lump" (`Mass of body region`). A first task asks
  where the lump is (`Mass of neck`, `Mass of axilla`, `Groin mass`, `Mass of skin`) and per-site
  tasks then check the discriminating findings.
- **Red box.** One `probable` rule for incarcerated/strangulated inguinal hernia, on
  `Irreducible inguinal hernia` (whose synonym is "incarcerated inguinal hernia"). `Strangulated
  inguinal hernia` is not a descendant of it, so a recorded strangulated hernia would not satisfy
  the priority rule; only one concept can be diagnosed per rule. The priority rule is
  `(and Groin mass (or (active_condition Irreducible inguinal hernia) (active_condition Aneurysm)))`, Urgent.
- **"Gets bigger when standing/coughing/passing stool"** is `Cough impulse in inguinal canal`.
  Standing and passing stool aren't coded separately.
- **"Lump cannot be reduced"** is `Groin mass` with the `Irreducible` qualifier, not the
  diagnosis concept, to avoid circular evidence.
- **"No stools or flatus/wind for past 24 hours"** is `(>= (onset Obstipation) (time_ago 24 hours))`.
- **"Severe pain"** uses the generic `Severe pain` finding (the page does not say where).
- **Pulsating lump**: `Groin mass` qualified `Pulsatile` (the box header restricts the box to groin
  lumps). The diagnosis is the generic `Aneurysm` disorder.
- **Hidradenitis suppurativa**: `Recurrent abscess` with a finding site (axillary region, inguinal
  region, perineal structure). A first draft used `Abscess of axilla/groin` + `Recurrent`, which the
  always-true check flags because `Abscess of axilla` is a `Mass of axilla`.
- **"If none of above" → lymphadenopathy** is a lump in neck/axilla/groin with no skin lump and none
  of: thyroid moves with swallowing, cough impulse, recurrent abscess at the three sites.
- **Mpox ("consider mpox")** is a `possible` rule gated on active Lymphadenopathy, as on the page's
  lymphadenopathy branch. Contact with a case is `Exposure to … Monkeypox virus`.
- **Shock / BP < 90/60** do not appear on this page.

## Could not model

- **Bubo** ("Is the groin lymph node hot and tender? Yes: treat for bubo"). There is no SNOMED disorder
  for bubo (only a morphology and a qualifier), so this isn't encoded. The hot/tender node is not
  checked for.
- **"Painful"** abscesses (HS) isn't coded separately, so the HS rule fires slightly more often than
  the page intends.
- **"Unexplained"** rash or lesions, and **"in the 21 days before symptom onset"** (mpox). Neither is
  representable, so the mpox rule fires more often.
- **"Is medication or infective cause likely?"** is a clinical judgment. The mpox rule isn't gated on
  "No", so it fires more often.
- **Drug hypersensitivity** (atenolol, allopurinol, co-trimoxazole, phenytoin, antibiotics): the page
  says "Review medication … Discuss with doctor", which is management, not a diagnosis. Not encoded.
- **Localised vs generalised lymphadenopathy, unwell, growing quickly, persisting > 4 weeks.** These
  are referral routing only and aren't encoded.
- **TB aspiration triggers** (cough, weight loss, night sweats, fever) are a referral step only and
  aren't encoded.

## SNOMED gaps

- Bubo (disorder): none. Only `Bubo` (morphologic abnormality) and `Inguinal bubo` (qualifier value) exist.
- Lesion of anus (disorder): none. Used `Skin lesion` with finding_site `Anal structure`.
- "Painful" (qualifier value): none.
- Lump enlarging on standing or straining: none. Used `Cough impulse in inguinal canal`.

## Checker issues left in place

All three are false positives of the same kind. Each finding is checked for in its positive form,
but the gate's `(no …)` normal form puts a `No` qualifier before the finding_site attribute, so the
strings don't match exactly. Plain `(no X)` forms on this page pass.

- `PROBABLE DIAGNOSIS EVIDENCE NOT CHECKED FOR`: `(no (finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Recurrent abscess" "disorder") (snomed_concept "No" "qualifier value") (attribute (snomed_concept "Finding site" "attribute") (snomed_concept "Axillary region structure" "body structure"))))`
- `PROBABLE DIAGNOSIS EVIDENCE NOT CHECKED FOR`: `(no (finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Recurrent abscess" "disorder") (snomed_concept "No" "qualifier value") (attribute (snomed_concept "Finding site" "attribute") (snomed_concept "Inguinal region structure" "body structure"))))`
- `PROBABLE DIAGNOSIS EVIDENCE NOT CHECKED FOR`: `(no (finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Recurrent abscess" "disorder") (snomed_concept "No" "qualifier value") (attribute (snomed_concept "Finding site" "attribute") (snomed_concept "Perineal structure" "body structure"))))`

## Questions for a clinician

- Should strangulated inguinal hernia get its own probable rule alongside incarcerated (irreducible)?
- Is "cough impulse" an acceptable stand-in for "gets bigger when standing/coughing/passing stool"?
- Should a hot, tender groin node be encoded once a bubo concept is available (e.g. via the STI page 65)?
- Should the mpox rule on this page be gated on lymphadenopathy, or left to page 40?
