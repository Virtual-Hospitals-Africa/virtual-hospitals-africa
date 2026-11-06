# Page 78 – Back pain: remaining questions

## Decisions made

- **Trigger.** Every task and the Urgent rule are anchored to the common symptom
  `(clinical_finding (snomed_concept "Backache" "finding"))`.
- **Urine dipstick** is a separate task, triggered by back pain **and** flank pain, as in "If flank
  pain, check urine dipstick". It checks for leucocytes, nitrites and blood.
- **Complicated pyelonephritis.** No SNOMED concept exists, so the probable rule diagnoses
  `Acute pyelonephritis`. The Urgent rule writes out the page's criteria (flank pain, leucocytes or
  nitrites, any of vomiting/sepsis/diabetes/pregnant/post menopause) instead of using
  `(active_condition Acute pyelonephritis)`, because the uncomplicated rule (outside the red box)
  diagnoses the same concept and would otherwise be made urgent.
- **Male** (complicated pyelonephritis) is encoded as `(clinical_finding (snomed_concept "Male" "finding"))`
  in the check_for, the complicated rule and the Urgent rule. If VHA records sex only
  demographically it never matches, and those rules fire **less often** for men (see questions).
- **Pancreatitis and AAA** probable rules include `Backache`, since the red box states them for
  "the patient with back pain".
- **Sepsis (footnote 1)** is encoded as this page's own logic: SBP < 80, pulse ≥ 100,
  respiratory rate > 30, Acute confusion. No shared sepsis definition was built.
- **Pancreatitis** is diagnosed as `Acute pancreatitis` (the page describes sudden onset);
  plain `Pancreatitis` also exists.
- **Kidney stone**: blood in urine **and** flank pain qualified Sudden onset + Severe + Unilateral
  **and** Radiating pain with finding site Inguinal region structure.
- **Numbness of buttocks, perineum** → `Numbness of saddle area`; legs → `Numbness of lower limb`.
- **Recent injury** → `Traumatic injury` (descendants match).
- **Check for TB** (Q1 = Yes) is a `possible` Tuberculosis rule.
- **Mechanical back pain likely** (Q1, Q2 and Q3 all No) is a `probable` rule that needs each
  Q1–Q3 item explicitly recorded as No, plus back pain onset within the last 6 weeks (written
  `(<= (onset Backache) (time_ago 6 weeks))`, the No side of "for > 6 weeks"; only `>=`/`<=` are
  accepted). The concept is `Mechanical low back pain` because "Mechanical back pain" doesn't exist. It is narrower (low back only).
- **Osteoporosis and HIV** are checked for as plain disorders (no `Known present` qualifier), so that
  their `(no …)` form in the mechanical rule matches the check_for.
- **Uncomplicated pyelonephritis**: probable Acute pyelonephritis from flank pain and
  leucocytes/nitrites. It also fires whenever the complicated rule fires (same concept, harmless).
- **Mpox** (consider → `possible` Monkeypox): rash or skin lesion and ≥ 1 of the listed features.

## Could not model

- **Age** (> 50 years in Q2, < 40 years in Q3): the language has no age criterion. The mechanical
  rule therefore fires **more often** than intended (it can't exclude patients over 50).
  Inflammatory back pain isn't encoded at all (see SNOMED gaps).
- **"x-ray unavailable or abnormal"** and **"recent"** (injury): not representable. The Urgent rule
  fires **more often** (any recorded traumatic injury with back pain).
- **"Unexplained"** rash: not expressible, so the mpox rule fires more often (any rash/lesion).
  Anal lesions have no concept (genitals, rectum, mouth, eyes and skin are encoded), so it fires
  less often for anal lesions only.
- **"Sleep disturbed by pain"** → `Sleep pattern disturbance` (cause not expressible).
  **"Morning stiffness lasting > 30 minutes"** → `Stiff back` qualified `Morning`; the duration is not expressible.
- **"Pain better with exercise", "does not get better with rest"**: no concepts. They are not part of the
  mechanical rule's No-conditions, so that rule can fire for patients with these features.
- **Q2 = Yes → doctor back x-ray** and **Unsure** branches: management only, no diagnosis named.
- "May also have fatigue": descriptive note, not encoded.

## SNOMED gaps

- Complicated pyelonephritis / uncomplicated pyelonephritis → `Acute pyelonephritis` (disorder).
- Bowel retention: no fitting concept (constipation would be broader). Only urinary retention and both
  incontinences encoded.
- Numbness of buttock / perineum → `Numbness of saddle area`.
- Pain radiating to groin → `Radiating pain` + finding site `Inguinal region structure`.
- Mechanical back pain → `Mechanical low back pain` (finding).
- Inflammatory back pain: none found (`Axial spondyloarthritis` is a disease, not this finding).
  **The "Inflammatory back pain likely" rule is not encoded.**
- Oral steroid use → `Use of steroids` (not route-specific).
- Back surgery → `History of spinal surgery` (situation).
- Lesion of anus (disorder): not found; anal lesions not encoded.
- Weight loss → `Weight decreased`; body pain → `Generalized aches and pains`; mpox → `Monkeypox`.
- Pain better with exercise, not better with rest, pain disturbing sleep: none.

## Checker issues left in place

> **Note, 2026-11-05.** The gate's `(no X)` pattern was fixed on 2026-11-05: it now recognizes `(no X)` when X has a qualifier or finding site. The gate no longer reports the findings below. Will's PR #1310 test may still flag the `(no X)` forms, because it wants `(no X)` itself checked for; see `RUN-REPORT.md`, "What the test result means".

The checker doesn't match a qualified finding inside `(no …)`: the `no` form inserts
`(snomed_concept "No" "qualifier value")` before the qualifier. These items are used as evidence
(Q2/Q3 = No in "Diagnose probable mechanical back pain").

- `CHECKED FOR BUT NEVER USED AS EVIDENCE`: `(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Backache" "finding") (qualifier (snomed_concept "Progressive" "qualifier value")))`
- `CHECKED FOR BUT NEVER USED AS EVIDENCE`: `(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Stiff back" "finding") (qualifier (snomed_concept "Morning" "qualifier value")))`
- `PROBABLE DIAGNOSIS EVIDENCE NOT CHECKED FOR`: `(no (finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Stiff back" "finding") (snomed_concept "No" "qualifier value") (qualifier (snomed_concept "Morning" "qualifier value"))))`

## Questions for a clinician

- Should "Recent injury" be limited to back injury, or any injury?
- Is "Check for TB" right as a possible TB diagnosis, or only a pointer to page 102?
- Should mechanical back pain still be diagnosed when the health worker hasn't answered every Q1–Q3
  item (the rule currently needs an explicit No for each)?
- Is Acute pancreatitis acceptable for "pancreatitis", and Mechanical low back pain for "mechanical back pain"?
- Does VHA record the patient's sex as a `Male` (finding)? If sex is demographic only, the "male"
  factor for complicated pyelonephritis never matches and needs a different form.
- Is `Traumatic injury` alone acceptable for "recent injury and x-ray unavailable or abnormal",
  given that primary-care clinics usually cannot x-ray on the spot?
- Mechanical back pain cannot exclude patients over 50 or under 40, or pain better with exercise /
  not better with rest (no age criterion, no concepts), so it can also fire for patients the page
  would route to x-ray or to inflammatory back pain. Should the rule stay, or be dropped until
  these can be expressed?
