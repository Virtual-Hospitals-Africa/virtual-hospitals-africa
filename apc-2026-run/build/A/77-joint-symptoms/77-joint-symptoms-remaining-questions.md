# Page 77 – Joint symptoms: remaining questions

## Decisions made

- **Presenting complaint.** "Joint symptom/s" is read as Pain of joint, Joint swelling or Joint
  stiffness. None is a recorded common symptom (Pain of joint is commented out in
  `common_symptoms.ts`), so a `possible` Arthropathy pre-screen (the anaphylaxis pattern) triggers
  the two check tasks, and the priority rule's complaint is the `or` of the three findings.
- **Two check tasks.** `Check for urgent joint symptom conditions` holds the red-box items;
  `Assess joint symptom not needing urgent attention` holds the extra flowchart discriminators.
- **Septic arthritis → Infective arthritis** (no "Septic arthritis" concept). Probable when the
  joint is warm, swollen, severely painful and has limited movement.
- **Fracture likely**: traumatic injury with onset within 48 hours (`<=`, per the onset rule) and
  any of severe joint pain, severe joint swelling or deformity. "Severe" is applied to both pain
  and swelling. Deformity is the generic finding.
- **Acute gout in the red box** is a probable rule, and its criteria are also written out inside the
  priority rule rather than referenced by `(active_condition Acute gout)`. Otherwise acute gout
  reached through the non-urgent flowchart would become Urgent.
- **Septic arthritis and fracture** are referenced from the priority rule as `active_condition`,
  following Will's briefing.
- **Flowchart No branches** are encoded on the later diagnoses: no traumatic injury; joint pain
  onset `<=` 6 weeks ago for "< 6 weeks" (only `>=`/`<=` are allowed, so exactly 6 weeks satisfies
  both branches); no vaginal/urethral discharge and no painless rash before acute gout.
- **Question A** (joint warm/tender/swollen or unable to do all actions comfortably) is an `or`
  at the start of the sprain, chronic arthritis and gonococcal rules. It is left out of the flowchart
  gout rule, which already requires a warm, swollen joint.
- **Sprain/strain likely → Sprain of ligament of joint.** Strain is not encoded as a separate diagnosis.
- **"Recent"** (injury, genital discharge) has no threshold and is taken as recorded in this encounter.
- The flowchart rules can fire alongside the urgent priority; "not needing urgent attention" is not
  modelled as a negation of the red box.

## Could not model

- **"Short history"** and **"single"** joint in the septic arthritis item: no duration threshold and
  no joint count. The rule fires more often than the page intends.
- **"No … surgery or injection into joint"** in the known-gout item: these are procedures and
  `(no …)` only wraps findings. The rule fires more often than the page intends.
- **"1-3"** joints in the sudden-onset gout question: no joint count. Fires more often.
- **"Non-itchy"** inside the No branch of the discharge/rash question: the No branch is written as
  "no painless rash", so a patient with a painless but itchy rash does not reach acute gout (fires
  less often in that edge case).
- "Unable to do all actions comfortably" (the screening manoeuvres) is approximated by Limitation
  of joint movement.
- Referral criteria (secondary gout from haematological malignancy, known gout with chronic kidney
  disease) are management, not encoded.

## SNOMED gaps

- "Septic arthritis" (disorder): not found; used Infective arthritis.
- "Gonococcal arthritis" (disorder): not found; used Gonococcal infection of joint.
- "Sprain" (disorder) / "Sprain of joint": not found; used Sprain of ligament of joint.
- Generic "genital discharge": not found; used Vaginal discharge or Urethral discharge
  (Abnormal urogenital discharge exists but neither is its descendant).
- Generic red joint ("Joint red", "Redness of joint"): not found, only site-specific concepts; used
  Erythema with finding_site Joint structure.
- "Midfoot structure": not found; used Structure of midfoot region of foot.
- "Deformity of joint": not found; used generic Deformity (Joint deformity exists but the deformity after injury may be of bone).

## Checker issues left in place

- `PROBABLE DIAGNOSIS EVIDENCE NOT CHECKED FOR: (no (finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Eruption" "morphologic abnormality") (snomed_concept "No" "qualifier value") (qualifier (snomed_concept "Painless" "qualifier value"))))`
  (rule: Diagnose probable acute gout (sudden hot swollen joint)). The qualified rash *is* checked
  for in `Assess joint symptom not needing urgent attention`. The checker does not match a `(no …)`
  of a **qualified** finding to its `check_for`, because the No value is inserted before the
  qualifier. Unqualified `(no X)` evidence on this page matches.

## Questions for a clinician

- Should "joint symptom/s" include stiffness, or only pain and swelling?
- `(active_condition Fracture of bone)` and `(active_condition Infective arthritis)` also match a
  fracture or septic arthritis in the patient's history. Should the priority use the current
  probable diagnosis only?
- Sprain/strain: is a single sprain diagnosis enough, or should muscle strain also be recorded?
- Is "no fever" in the known-gout item the patient's report (as encoded), or temperature < 38°C?
- Should a painless *itchy* rash count as a No to the gonococcal question (leading on to the acute gout question)?
