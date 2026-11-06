# Page 14 – Observation post vaccination: remaining questions

## Decisions made

- **Pointer-only red box, but the page has its own logic.** The red box is only "Treat as
  anaphylaxis → 28" (accounted as `cross_reference_only`). The algorithm that leads to it sits
  outside the box, so it is encoded: a `check_for` task, a probable anaphylaxis rule and a probable
  pseudoallergic-rash rule. **No priority evaluation** is written here: urgency and treatment of
  anaphylaxis belong to page 28, which the red box points to. `(diagnosis Anaphylaxis probable)` from
  this page should feed page 28's anaphylaxis rules.
- **Trigger.** "Post vaccination" is not a recorded common symptom or warning sign. The task fires on
  `(clinical_finding (snomed_concept "Vaccination given" "situation"))`. Alternative: the procedure
  `Administration of vaccine to produce active immunity`, if VHA records vaccinations as procedures.
- **"Treat as anaphylaxis" → `probable` Anaphylaxis** (rule "Diagnose probable anaphylaxis after
  vaccination"), with the page's three Yes branches: (1) `any2` of the four body-system groups, each an
  `or` so it counts once; (2) generalised urticaria (Urticaria + `Generalized`); (3) serious single-system
  signs: hypotension (`Low blood pressure`), respiratory distress, significant (`Severe`) swelling of
  tongue or lips. Oxygen sats < 92% is in the respiratory group, strict `<` as written.
- **Hypotension has no threshold on this page**, so no BP number is imported (not "BP < 90/60", not
  the shock definition).
- **"Pseudoallergic self-limiting rash likely" → `probable` Non-allergic hypersensitivity reaction**
  (rule "Diagnose probable pseudoallergic rash after vaccination"): vaccination given, urticaria
  ("raised, red rash"), and recorded absence (`no`) of every other sign the page checks, including
  generalised urticaria and "Generally unwell" (for "otherwise well / remains well").
- **Faint/unwell group** holds exactly the page's bullets; the header "Feeling faint/unwell symptoms"
  names the group and is not encoded as a symptom of its own (reconciler: builder A had added
  `Feeling faint`). "Feeling warm or cold" is split into `Sensation of being warm` and
  `Sensation of being cold`. "Reduced hearing" is `Decreased hearing`; GI "Cramps" is `Abdominal colic`.
- **Collapse → 15** is a cross-reference to page 15 and is not encoded here.

## Could not model

- **"Do symptom/s improve quickly (minutes)?"** The language cannot express the course of a symptom.
  Faint/unwell symptoms count as a body system in the `any2` whether or not they improved, so the
  anaphylaxis rule **fires more often** than the page intends (e.g. a vasovagal reaction plus nausea).
- **"Observe for at least 15 minutes / 30 minutes if known severe allergies"** and "monitor for at
  least 30 minutes" before calling the rash pseudoallergic: no duration of observation can be
  expressed. The pseudoallergic rule can fire before 30 minutes of monitoring, so it **fires earlier
  (more often)** than the page intends.
- **"If in doubt, treat as anaphylaxis"**: clinical judgment, not representable.
- Oxygen sats < 92% is not in the `no` list of the pseudoallergic rule: a measurement cannot be
  wrapped in `no`, and writing sats ≥ 92 would add a criterion the page does not state.
- Management (lean forward / lie flat, loosen clothing, cool cloth, reassure, oral antihistamines,
  safety-net advice, discuss with doctor, AEFI reporting) is out of scope.

## SNOMED gaps

- "Pseudoallergic self-limiting rash": no concept. Used `Non-allergic hypersensitivity reaction`
  (disorder), whose synonym is "pseudoallergic reaction"; broader than a rash.
- "Hypotension" (disorder) does not exist; FSN is `Low blood pressure` (disorder).
- "Pallor" (finding) does not exist; used `Pale complexion` (finding).
- "Abdominal cramps" (finding) does not exist; used `Abdominal colic` (finding), which is_a
  Abdominal pain (`Stomach cramps` exists but sits only under `Cramp`).
- "Feeling warm"/"Feeling cold" do not exist; used `Sensation of being warm` / `Sensation of being cold`.
- "Reduced hearing": used `Decreased hearing` (the vocabulary's `Hearing difficulty` is a narrower child).
- "Generalised urticaria" has no precoordinated concept; used `Urticaria` + qualifier `Generalized`.
- All finding_site body structures resolve (`Eye region structure`, `Lip structure`,
  `Tongue structure`, `Face structure`, `Hand structure`, `Foot structure`); "Eye structure" does not.

## Checker issues left in place

> **Note, 2026-11-05.** The gate's `(no X)` pattern was fixed on 2026-11-05: it now recognizes `(no X)` when X has a qualifier or finding site. The gate no longer reports the findings below. Will's PR #1310 test may still flag the `(no X)` forms, because it wants `(no X)` itself checked for; see `RUN-REPORT.md`, "What the test result means".

All nine are `PROBABLE DIAGNOSIS EVIDENCE NOT CHECKED FOR` on "Diagnose probable pseudoallergic rash
after vaccination". Each is the `(no …)` form of a finding with a finding_site or qualifier whose
positive form **is** in this file's `check_for`. The checker matches `(no X)` to X only for
unqualified findings, so these are a checker limitation, not missing checks:

- `(no (finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Urticaria" "disorder") (snomed_concept "No" "qualifier value") (qualifier (snomed_concept "Generalized" "qualifier value"))))`
- `(no (finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Swelling" "finding") (snomed_concept "No" "qualifier value") (attribute (snomed_concept "Finding site" "attribute") (snomed_concept "Eye region structure" "body structure"))))`
- `(no (finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Swelling" "finding") (snomed_concept "No" "qualifier value") (attribute (snomed_concept "Finding site" "attribute") (snomed_concept "Lip structure" "body structure"))))`
- `(no (finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Swelling" "finding") (snomed_concept "No" "qualifier value") (attribute (snomed_concept "Finding site" "attribute") (snomed_concept "Tongue structure" "body structure"))))`
- `(no (finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Swelling" "finding") (snomed_concept "No" "qualifier value") (attribute (snomed_concept "Finding site" "attribute") (snomed_concept "Face structure" "body structure"))))`
- `(no (finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Swelling" "finding") (snomed_concept "No" "qualifier value") (attribute (snomed_concept "Finding site" "attribute") (snomed_concept "Hand structure" "body structure"))))`
- `(no (finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Swelling" "finding") (snomed_concept "No" "qualifier value") (attribute (snomed_concept "Finding site" "attribute") (snomed_concept "Foot structure" "body structure"))))`
- `(no (finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Swelling" "finding") (snomed_concept "No" "qualifier value") (attribute (snomed_concept "Finding site" "attribute") (snomed_concept "Tongue structure" "body structure")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value"))))`
- `(no (finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Swelling" "finding") (snomed_concept "No" "qualifier value") (attribute (snomed_concept "Finding site" "attribute") (snomed_concept "Lip structure" "body structure")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value"))))`

## Questions for a clinician

- Should a patient who simply reports "feeling faint" (without one of the listed bullets) count as the
  faint/unwell body system? The header is not encoded as a symptom of its own.

- Should the itch that usually comes with hives disqualify an "isolated rash"? The page says
  "without other symptoms", so the rule currently requires no itching.
- Is "Treat as anaphylaxis" here the same as anaphylaxis *probable*, or should this page only raise
  it as *possible* and let page 28 decide?
- Should faint/unwell symptoms that resolve within minutes be excluded from the body-system count?
  The rules cannot see the improvement; a clinician-entered "vasovagal reaction" might be a way.
- How does VHA record that a vaccine was just given (situation finding vs procedure)? The task's
  trigger depends on it.
