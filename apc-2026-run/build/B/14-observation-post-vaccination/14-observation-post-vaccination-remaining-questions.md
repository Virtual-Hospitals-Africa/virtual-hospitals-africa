# Page 14 – Observation post vaccination: remaining questions

## Decisions made

- **Trigger.** The page applies to every patient just vaccinated. The check_for task and both
  diagnosis rules are anchored to `(clinical_finding (snomed_concept "Vaccination given" "situation"))`.
  A `procedure` form (Administration of vaccine to produce active immunity) was tried first but is
  not supported as evidence. Vaccination is not a common symptom or warning sign, so the task fires
  only if the app records the vaccination as this situation.
- **Red box is a pointer** ("Treat as anaphylaxis → 28"). The three "Yes" routes into it are encoded
  as a `probable` Anaphylaxis rule (as gold page 20 does for "Treat for anaphylaxis"). No priority
  evaluation is written here; page 28 owns the urgency of anaphylaxis.
- **"2 or more body systems"** = `any2` of four `or` groups: feeling faint/unwell, skin/mucosal,
  respiratory, gastrointestinal, each with exactly the page's bullet list.
- **Generalised urticaria** = Urticaria with the Generalized qualifier.
- **Serious single-system signs**: hypotension → Low blood pressure (disorder), no BP threshold
  imported (the page gives none); respiratory distress → Respiratory distress; "significant swelling
  of the tongue or lips" → Swelling at Tongue / Lip structure with Severe (severity modifier).
- **Pseudoallergic self-limiting rash likely** → `probable` Non-allergic hypersensitivity reaction,
  when vaccinated, urticaria present, and every other sign on the page recorded absent (generalised
  urticaria included, itching not, because hives itch).
- Collapse → 15 is a cross-reference and not encoded here.
- Oxygen sats < 92% is a routine vital (strict `<`, as written), used in the respiratory group.

## Could not model

- **"Do symptom/s improve quickly (minutes)?"** for the faint/unwell group. The language cannot say
  that a symptom resolved within minutes. The faint group counts as a body system unconditionally,
  so the anaphylaxis rule **fires more often** than the page intends (e.g. a vasovagal faint with nausea).
- **"Observe for at least 15 minutes / 30 minutes if severe allergies"**: observation time, management.
- **"Monitor for other symptoms for at least 30 minutes"** before calling the rash pseudoallergic,
  and "patient remains well": not expressible. The pseudoallergic rule **fires earlier** (more often).
- "If other symptoms: discuss with doctor/specialist urgently", "If in doubt, treat as anaphylaxis",
  the vasovagal first-aid steps, advice, antihistamines and AEFI reporting are management.
- Timing of the reaction relative to the vaccination is not constrained (no onset comparison).

## SNOMED gaps

- No "Generalized urticaria" concept: Urticaria + Generalized qualifier.
- No "Hypotension" concept: Low blood pressure (disorder).
- No "Light-headedness" (hyphenated): Lightheadedness. No "Feeling warm/cold": Sensation of being warm / cold.
- No "Throat tightness": Tightness in throat. No "Drooling" FSN: Dribbling from mouth.
- No "Pallor" finding: Pale complexion. No "Abdominal cramps": Abdominal colic.
- No "Pseudoallergic rash": Non-allergic hypersensitivity reaction (broader).
- Swelling of eyes uses Eye region structure (verified body structure).

## Checker issues left in place

Each is a `(no X)` whose X carries a finding_site or qualifier. X is in the check_for; the checker's
string match does not pair the `(no …)` normal form (with the "No" value before the attribute) with it.
- `PROBABLE DIAGNOSIS EVIDENCE NOT CHECKED FOR`: `(no (finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Swelling" "finding") (snomed_concept "No" "qualifier value") (attribute (snomed_concept "Finding site" "attribute") (snomed_concept "Eye region structure" "body structure"))))`
- `PROBABLE DIAGNOSIS EVIDENCE NOT CHECKED FOR`: `(no (finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Swelling" "finding") (snomed_concept "No" "qualifier value") (attribute (snomed_concept "Finding site" "attribute") (snomed_concept "Lip structure" "body structure"))))`
- `PROBABLE DIAGNOSIS EVIDENCE NOT CHECKED FOR`: `(no (finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Swelling" "finding") (snomed_concept "No" "qualifier value") (attribute (snomed_concept "Finding site" "attribute") (snomed_concept "Tongue structure" "body structure"))))`
- `PROBABLE DIAGNOSIS EVIDENCE NOT CHECKED FOR`: `(no (finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Swelling" "finding") (snomed_concept "No" "qualifier value") (attribute (snomed_concept "Finding site" "attribute") (snomed_concept "Face structure" "body structure"))))`
- `PROBABLE DIAGNOSIS EVIDENCE NOT CHECKED FOR`: `(no (finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Swelling" "finding") (snomed_concept "No" "qualifier value") (attribute (snomed_concept "Finding site" "attribute") (snomed_concept "Hand structure" "body structure"))))`
- `PROBABLE DIAGNOSIS EVIDENCE NOT CHECKED FOR`: `(no (finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Swelling" "finding") (snomed_concept "No" "qualifier value") (attribute (snomed_concept "Finding site" "attribute") (snomed_concept "Foot structure" "body structure"))))`
- `PROBABLE DIAGNOSIS EVIDENCE NOT CHECKED FOR`: `(no (finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Urticaria" "disorder") (snomed_concept "No" "qualifier value") (qualifier (snomed_concept "Generalized" "qualifier value"))))`
- `PROBABLE DIAGNOSIS EVIDENCE NOT CHECKED FOR`: `(no (finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Swelling" "finding") (snomed_concept "No" "qualifier value") (attribute (snomed_concept "Finding site" "attribute") (snomed_concept "Tongue structure" "body structure")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value"))))`
- `PROBABLE DIAGNOSIS EVIDENCE NOT CHECKED FOR`: `(no (finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Swelling" "finding") (snomed_concept "No" "qualifier value") (attribute (snomed_concept "Finding site" "attribute") (snomed_concept "Lip structure" "body structure")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value"))))`

## Questions for a clinician

- Should feeling faint/unwell symptoms that improve within minutes still count as a body system?
  (The rule cannot tell.) Would you rather exclude the faint group from the count?
- Is "significant swelling" well captured by a Severe qualifier on tongue/lip swelling?
- For the pseudoallergic rash, should itching count as an "other symptom"?
- How will the app record that the patient has just been vaccinated? This page's rules depend on it.
