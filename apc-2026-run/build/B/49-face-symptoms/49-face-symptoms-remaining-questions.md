# Page 49 – Face symptoms: remaining questions

## Decisions made

- **Presenting complaint.** "Face symptoms" is not a recorded common symptom or warning sign. The
  task and the Urgent rule are anchored to an `or` of Pain in face, Swelling (finding site Face
  structure), Weakness of face muscles and Numbness of face.
- **Red box → one Urgent rule** `(and <face symptoms> (or <stroke items> <anaphylaxis branch>
  (active_condition Cellulitis of face) (active_condition Kidney disease)))`. Following Will's
  briefing, the two red-box "likely" diagnoses get `probable` rules and are referenced by
  `active_condition`.
- **"Consider stroke or TIA"** → two `possible` rules (Cerebrovascular accident; Transient ischemic
  attack). "New sudden asymmetric" → `Sudden onset` + `Unilateral` qualifiers on weakness/numbness of
  face or limb; `Sudden onset` on difficulty talking and visual disturbance.
- **"Check for anaphylaxis 28"** → `possible` Anaphylaxis (which is what triggers the anaphylaxis
  check task on the anaphylaxis page), plus the Urgent branch. BP < 90/60 = systolic < 90 or
  diastolic < 60. Footnote 1 allergens = exposure to Drug or medicament, exposure to Food, insect
  bite, insect sting.
- **Orbital cellulitis** (in the "Manage and refer urgently" box) → `probable` rule repeating the
  facial cellulitis evidence and adding eyelid swelling, eyelid erythema and eyelid pain. Not given
  its own priority: facial cellulitis already makes the patient Urgent.
- **Non-urgent "likely" boxes** → `probable` rules: trigeminal neuralgia, post-herpetic neuralgia,
  sinusitis, Bell's palsy, angioedema, mumps.
- **Sinusitis:** pain in face **and** tenderness of face (pain when pushing on forehead/cheeks)
  **and** any of headache, nasal discharge, posterior rhinorrhoea, common cold.
- **Mumps:** all of facial swelling, pain in face, fever, headache and generalised aches and pains.
- **Angioedema "painless"** → `(no (Pain at Lip structure))` / `(no (Pain at Eyelid structure))`,
  both checked for in the task, so the health worker is asked.
- Management (medicines, referral, the sinusitis antibiotic criteria, the kidney-disease oxygen/
  furosemide/amlodipine step) is not encoded. "Rash on face → 82" and "gum or tooth problem → 54"
  are cross-references only.

## Could not model

- **"With no/minimal forehead involvement"** (stroke): not encoded. The Urgent and possible-stroke
  rules fire **more often** than the page intends (they also fire for Bell's palsy, which has
  forehead involvement). `(no Upper facial weakness)` would need a recorded No and could miss strokes.
- **"Superficial"** (trigeminal neuralgia), **"progressive"** (Bell's palsy), **"whole"** eyelid
  (orbital cellulitis), **"thick"** discharge and **"headache worse on bending forward"**
  (sinusitis): not encoded; these rules fire more often.
- **"On same side of face"** (post-herpetic neuralgia): the language cannot tie the shingles
  history's side to the pain's side; the rule fires more often.
- **"Recent" common cold** and **"within the past few hours"** (allergen exposure): no time window.
- "May have impaired taste or dry eye" (Bell's palsy) is supporting, not required; not encoded.

## SNOMED gaps

- No "unable to wrinkle forehead" concept: `Upper facial weakness` (finding) used.
- No eyelid pain concept: `Pain` with finding site `Eyelid structure`. No lip pain other than
  `Sore lip`: `Pain` with finding site `Lip structure` used, to match the eyelid form.
- No "thick nasal discharge": `Nasal discharge` (and `Posterior rhinorrhea` for postnasal).
- "Body pain": `Generalized aches and pains`.

## Checker issues left in place

- `CHECKED FOR BUT NEVER USED AS EVIDENCE`:
  `(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Pain" "finding") (attribute (snomed_concept "Finding site" "attribute") (snomed_concept "Lip structure" "body structure")))`
  (it is used, as `(no …)` in the angioedema rule).
- `PROBABLE DIAGNOSIS EVIDENCE NOT CHECKED FOR`:
  `(no (finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Pain" "finding") (snomed_concept "No" "qualifier value") (attribute (snomed_concept "Finding site" "attribute") (snomed_concept "Lip structure" "body structure"))))`
- `PROBABLE DIAGNOSIS EVIDENCE NOT CHECKED FOR`:
  `(no (finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Pain" "finding") (snomed_concept "No" "qualifier value") (attribute (snomed_concept "Finding site" "attribute") (snomed_concept "Eyelid structure" "body structure"))))`

All three come from the same cause. The gate recognises `(no X)` only when the `No` qualifier is the
last element of the canonical form, and with a `finding_site` the attribute comes after it. The
positive forms are in the `check_for`.

## Questions for a clinician

- Sinusitis: does the box need all its features, or face pain plus tenderness plus any one of them?
- Mumps: should all of fever, headache and body pain be required?
- Should a patient with known kidney disease and any face symptom be Urgent? That is what
  `(active_condition Kidney disease)` in the Urgent rule does.
- Should Bell's palsy pattern weakness (forehead involved) still be Urgent through the stroke bullet?
