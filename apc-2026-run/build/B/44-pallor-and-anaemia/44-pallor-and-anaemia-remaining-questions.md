# Page 44 – Pallor and anaemia: remaining questions

## Decisions made

- **Presenting complaint** is an `or` of four `clinical_finding` forms: Pale conjunctiva (the page's
  definition), Pale complexion (VHA vocabulary), Pale discoloration of entire skin of body (SNOMED
  synonym "Pallor") and Anemia. Anemia uses the `clinical_finding` form because no rule diagnoses
  it at `probable` (the Hb thresholds are not representable). Pallor is not a recorded common
  symptom or warning sign, so the trigger relies on the health worker recording one of these.
- **Shock:** "Shock¹/SBP < 80" is encoded exactly as an `or` of `Shock` (disorder) and systolic BP
  < 80 mmHg. Footnote 1's definition of shock is not built.
- **Dizzy/faint** → Dizziness or Feeling faint. **Swollen legs** → Leg swelling symptom.
  **Widespread/easy bruising** → Multiple bruising or Easy bruising. **Black or bloody stools** →
  Melena or Hematochezia. **Purple/red rash that does not disappear with pressure** → Purpuric rash.
- **Malaria likely** → `probable` Malaria: pallor/anaemia **and** active Fever **and** high-risk
  travel with onset within the last 3 months. The travel finding is checked by a separate task
  triggered by pallor/anaemia with fever.
- The "not needing urgent attention" condition of the approach box is not encoded as a negation.

## Could not model

- **Hb < 6** (red box): no haemoglobin observable or unit. The urgent rule therefore fires **less
  often** than the page intends (Hb < 6 with no other sign is missed).
- **Anaemia definition** (Hb < 12 non-pregnant woman, < 11 pregnant woman, < 13 man): not
  representable; anaemia is taken from a recorded Anemia finding.
- **MCV branches** (iron deficiency anaemia likely, systemic disease or long-term condition likely,
  macrocytic anaemia likely, folate deficiency likely, investigate for B12 deficiency): every branch
  depends on the MCV result, which has no observable. Writing them without MCV would fire them on
  every anaemic patient (far **more often**), so none was written.
- **"Fever … in past 3 days"**: only a current (active) fever is matched; a fever that resolved in
  the last 3 days is missed (fires **less often**).
- Footnote 2 (black stools from iron tablets: only refer if black stools started before iron) is
  not modelled; Melena counts regardless (fires **more often**).
- HIV test, TB check, pregnancy check, abnormal vaginal bleeding, zidovudine/antiseizure medication,
  and all treatment, advice and referral steps are pointers or management.

## SNOMED gaps

- "Pale palms": no concept; `Palm (region) structure` exists but there is no general "pale skin"
  finding to attach it to. Pale complexion / Pale discoloration of entire skin of body used instead.
- "In a malaria area": no concept for residence in or travel to a malaria-endemic area. Substitute:
  `History of travel with high risk of exposure to communicable disease` (situation), which misses
  residents of malaria areas.
- "Black stools": `Dark stools` (finding) exists; `Melena` (disorder, VHA vocabulary) chosen.

## Checker issues left in place

- `CHECKED FOR BUT NEVER USED AS EVIDENCE`:
  `(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "History of travel with high risk of exposure to communicable disease" "situation"))`
  — it is used as evidence, wrapped in `(< (onset …) (time_ago 3 months))` in "Diagnose probable
  malaria in pallor/anaemia"; the usage check matches only the bare string. Dropping the time
  criterion would contradict the page's "in past 3 months".

## Questions for a clinician

- Is the high-risk-travel situation acceptable for "in a malaria area", or should residents of
  malaria areas (e.g. parts of Limpopo, Mpumalanga, KZN) be captured another way?
- Should "faint" also match Syncope (finding), i.e. an actual faint rather than feeling faint?
- Should black stools count for urgency when the patient is already on iron (footnote 2)?
