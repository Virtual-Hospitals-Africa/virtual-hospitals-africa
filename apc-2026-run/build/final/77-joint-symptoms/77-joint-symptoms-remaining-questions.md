# Page 77 – Joint symptoms: remaining questions

## Decisions made

- **Presenting complaint.** "Joint symptom/s" is anchored on `Pain of joint` (finding). It is not a
  recorded common symptom (it is commented out in `common_symptoms.ts`), so the check task and the
  priority rule fire only once a health worker records joint pain. `Joint finding` was rejected as
  too broad (it includes `Joint normal` and `Arthropathy`).
- **Septic arthritis = `Infective arthritis` (disorder)**; there is no "Septic arthritis" FSN.
  "Extremely painful" = `Pain of joint` with the `Severe (severity modifier)` qualifier.
- **Fracture likely** = traumatic injury with onset ≤ 48 hours ago and any of severe joint pain,
  severe joint swelling ("severe pain/swelling" read as severe pain or severe swelling) or
  deformity. Deformity is the generic `Deformity` finding, since the deformity after injury may be
  of bone rather than joint. Diagnosis concept `Fracture of bone`.
- **Urgent priority** = joint pain and any of: probable septic arthritis, temperature ≥ 38 °C,
  probable fracture, unable to weight-bear, or the red box's known-gout criteria. The known-gout
  criteria are written inline rather than as `(active_condition Acute gout)`, because the
  non-urgent flowchart also reaches "Acute gout likely" and should not become urgent by that route.
- **Acute gout** has one probable rule with two branches: the red box's known-gout branch and the
  flowchart's Q5 branch.
- **Big toe / midfoot / ankle** are `finding_site`s on `Pain of joint`: `Structure of joint of
  hallux`, `Structure of midfoot region of foot` (no midfoot joint structure found), `Ankle joint
  structure`. All three resolve.
- **Q1 gate** ("joint warm/tender/swollen or unable to do all actions comfortably") = any of `Joint
  warm`, `Tenderness of joint`, `Joint swelling`, `Limitation of joint movement`. It is required in
  the sprain, chronic arthritis and gonococcal rules.
- **No-branches.** Q2 = No is `(no Traumatic injury)`; Q3 = No ("< 6 weeks") is `(<= (onset Pain of
  joint) (time_ago 6 weeks))` because only `>=`/`<=` are accepted in onset comparisons, so the
  6-week boundary falls in both branches. Q4 = No is required in the flowchart gout branch as no vaginal
  discharge, no urethral discharge and no painless rash.
- **"Recent" injury and "recent" genital discharge** are read as recorded in the current encounter.
- **Genital discharge** = `Vaginal discharge` or `Urethral discharge`; `Abnormal urogenital
  discharge` has no descendants, so it would not match either.
- **Painless non-itchy skin rash** = `Eruption` with the `Painless` qualifier and `(no Itching)`.
- **Sprain/strain** = `Sprain of ligament of joint` (one concept for both).
- **Red joint** = `Erythema` with `finding_site Joint structure` (SNOMED has only site-specific
  "X joint red" concepts).
- **Fever** is in the `check_for` so that "no fever" can be recorded as a negative.

## Could not model

- **Septic arthritis, "short history" and "single" joint**: no number for the window and no way to
  count joints. The rule fires more often than the page intends (any warm, swollen, severely
  painful joint with limited movement).
- **Acute gout (flowchart), "1-3" joints**: joint count not expressible; fires more often.
- **"Non-itchy" in the Q4 = No branch**: `(no …)` cannot negate "painless and not itchy" as a
  whole, so the No branch is written as "no painless rash". A patient with a painless but itchy
  rash does not reach acute gout (fires less often in that edge case).
- **"Unable to do all actions comfortably"** (the screening manoeuvres) is approximated by
  `Limitation of joint movement`.
- **"Often big toe or knee"**: descriptive, not a criterion; not encoded.
- **"Surgery or injection into joint"** (red-box gout exclusion): only procedure concepts exist
  (`Operation on joint`, `Intra-articular injection`), and no "History of joint surgery/injection"
  situation was found. Not encoded, so the red-box gout branch fires more often than the page
  intends.
- **"Joint problem unlikely"** and its pointers (75, 78, 79, 80, 81): routing only.
- **Management** (sprain care, analgesia, HIV test, review, referral, "Manage and refer urgently"
  including suspected secondary gout and known gout with CKD): out of scope.

## SNOMED gaps

- "Septic arthritis" (disorder): absent; `Infective arthritis` used.
- "Gonococcal arthritis" (disorder): absent; `Gonococcal infection of joint` used.
- "Sprain"/"Strain" (disorder): absent; `Sprain of ligament of joint` used.
- "Genital discharge" (finding): absent; vaginal or urethral discharge used.
- Midfoot joint body structure: absent; `Structure of midfoot region of foot` used.
- Joint redness (general): absent; `Erythema` + `Joint structure` used.
- Surgery or injection into a joint as a finding/situation: absent; not encoded.

## Checker issues left in place

> **Note, 2026-11-05.** The gate's `(no X)` pattern was fixed on 2026-11-05: it now recognizes `(no X)` when X has a qualifier or finding site. The gate no longer reports the findings below. Will's PR #1310 test may still flag the `(no X)` forms, because it wants `(no X)` itself checked for; see `RUN-REPORT.md`, "What the test result means".

- `PROBABLE DIAGNOSIS EVIDENCE NOT CHECKED FOR: (no (finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Eruption" "morphologic abnormality") (snomed_concept "No" "qualifier value") (qualifier (snomed_concept "Painless" "qualifier value"))))`
  (rule: Diagnose probable acute gout (joint symptoms)). The painless rash *is* checked for in
  `Check for urgent joint symptom conditions`; the checker does not match a `(no …)` of a
  **qualified** finding to its `check_for`, because the No value is inserted before the qualifier.

## Questions for a clinician

- Should the sprain/strain rule exclude patients who already meet the red-box fracture criteria?
  The language has no "not diagnosed" form, so both can be probable at once.
- Is "short history" for septic arthritis a defined window (e.g. days)? If so, it could be added as
  an onset comparison.
- Should "Unable to weight-bear" apply to any joint symptom (as written), or only to lower-limb joints?
- Should "joint symptom/s" (the presenting complaint) be joint pain only, as encoded, or also
  joint swelling or stiffness on their own? (Builder A used a possible-Arthropathy pre-screen on
  pain, swelling or stiffness.)
- `(active_condition Fracture of bone)` and `(active_condition Infective arthritis)` also match a
  fracture or septic arthritis in the patient's history. Should the priority use the current
  probable diagnosis only?
- Sprain/strain: is a single sprain diagnosis enough, or should muscle strain also be recorded?
- Is "no fever" in the known-gout item the patient's report (as encoded), or temperature < 38°C?
- Should a painless *itchy* rash count as a No to the gonococcal question (leading on to the acute
  gout question)?
- Does "wound" in the gout exclusion mean a wound over the affected joint only? It is encoded as any
  recorded wound.
