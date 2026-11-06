# Page 49 – Face symptoms: remaining questions

## Decisions made

- **Presenting complaint.** "Face symptoms" is not a recorded common symptom or warning sign, and
  SNOMED has no "face symptom" concept. The tasks and the urgent priority are anchored to an `or`
  of the face findings the page's tree branches on: Swelling (finding site Face structure), Pain in
  face, Weakness of face muscles, Numbness of face, plus Lip swelling and Swelling around eyes
  (the angioedema branch). None of these is a recorded common symptom yet.
- **Four tasks.** One for the red box (`Check for urgent face symptom conditions`) and one per branch
  of the non-urgent tree (face pain, facial weakness, facial swelling). Splitting by branch keeps a
  finding out of its own task's `due_to` (e.g. Pain in face is checked for when the patient
  presents with swelling).
- **Stroke/TIA bullet.** "consider stroke or TIA" → two `possible` rules (Cerebrovascular accident,
  Transient ischemic attack) with the same evidence, plus the items inline in the urgent priority.
  "New sudden" → `Sudden onset` qualifier only (sudden onset implies new). "with no/minimal
  forehead involvement" is modelled as `(no Upper facial weakness)` on the face-weakness arm.
  Difficulty speaking and visual disturbance carry no qualifier (the page puts them after a
  semicolon without "sudden").
- **Anaphylaxis bullet.** "check for anaphylaxis 28" is encoded as a `possible` Anaphylaxis rule (so
  that page 28's check task can fire) and inline in the urgent priority. "Exposure to possible
  allergen" uses footnote 1: exposure to Drug or medicament, exposure to Food, Insect bite - wound,
  Insect sting. BP < 90/60 is systolic < 90 or diastolic < 60.
- **Facial cellulitis / kidney disease.** `probable` rules; the urgent priority references them as
  `active_condition`, following Will's briefing. "Painful red facial swelling" = facial swelling
  **and** Pain in face **and** Redness of skin of face.
- **Orbital cellulitis** (in "Manage and refer urgently") is a "likely" statement, so it gets a
  `probable` rule that repeats the facial cellulitis evidence and adds eyelid swelling, eyelid
  erythema and eyelid pain. It gets no priority rule of its own; the patient is already Urgent via
  facial cellulitis.
- **Non-urgent tree.** Each "X likely" → `probable`; the evidence is the chain of boxes leading to it.
  No `(no …)` guards against the red-box items were added.
- "May have impaired taste or dry eye" (Bell's palsy) is optional on the page and is not encoded.
- Fever for mumps uses `(active_condition Fever)`; "body pain" = Generalized aches and pains **or**
  Muscle pain.

## Could not model

- "asymmetric" (stroke) and "one side of face" (Bell's palsy): no Unilateral qualifier on facial
  weakness, so both rules fire more often than the page intends. ("Pain on one side of face" does use
  the Unilateral qualifier.)
- "minimal" forehead involvement: a patient with recorded upper facial weakness who has only
  minimal forehead involvement would be excluded from the stroke face arm (fires less often).
- "progressive" (Bell's palsy), "superficial" (trigeminal neuralgia), "whole" eyelid (orbital
  cellulitis): not encoded, so those rules fire more often.
- "on same side of face" (post-herpetic neuralgia): not representable; fires more often.
- "headache worse on bending forward": no concept; plain Headache used (fires more often).
- Footnote 1 "within the past few hours": not modelled (same as page 20).
- Management lines (oxygen, furosemide, amlodipine, pulse > 100 / RR > 30 / BP > 150/100 thresholds,
  "If delay in transfer, discuss with doctor") are management steps.

## SNOMED gaps

- No "face symptom" concept: an `or` of face findings is used.
- "Postnasal drip" (finding) does not exist; `Posterior rhinorrhea` (disorder) used.
- "Post-herpetic neuralgia" does not exist; `Postherpetic neuralgia` (disorder) used.
- No concept for headache worse on bending forward; `Headache` used.
- No precoordinated eyelid pain concept; `Pain` with finding site `Eyelid structure` (verified).

## Checker issues left in place

- None.

## Questions for a clinician

- Sinusitis: should all features (tenderness, headache, thick nasal/postnasal discharge, recent
  common cold) be required, as encoded, or would two of them suffice? The page lists them as one
  description box.
- `(active_condition Kidney disease)` in the urgent priority also matches a patient with known
  kidney disease who presents with any face symptom. Is that acceptable, or should the priority use
  the page's evidence (new facial swelling and blood/protein in urine) directly?
- Is `(no Upper facial weakness)` an acceptable way to express "no/minimal forehead involvement"?
- Should "asymmetric" weakness require a recorded Unilateral qualifier (fewer false stroke alerts,
  but missed strokes if the qualifier is not recorded)?
