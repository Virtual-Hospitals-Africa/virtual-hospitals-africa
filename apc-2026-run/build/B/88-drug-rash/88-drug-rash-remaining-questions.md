# Page 88 – Drug rash: remaining questions

## Decisions made

- **Presenting complaint.** "Drug rash" is `Eruption caused by drug` (disorder). It is not a
  recorded common symptom or warning sign, so the `check_for` task and the Urgent rule fire on
  either a recorded drug eruption or the `possible` diagnosis made by `Diagnose possible drug rash`
  (the page's "Suspect a drug rash in a patient with a generalised rash which appeared within 3
  months of starting a new medication").
- **"Within 3 months of starting a new medication"** is approximated as
  `(<= (onset (finding Exposure to … Drug or medicament)) (time_ago 3 months))`: the drug exposure
  started within the last 3 months. The language cannot express the interval between drug start
  and rash onset. `<=` is used, as decided for all pages.
- **Shock/SBP < 80** is encoded as written: `Shock` (disorder) or systolic BP < 80. Footnote 1
  ("If SBP < 80, pulse ≥ 100, respiratory rate > 30, confusion/restlessness, weakness, shock
  likely") is not built into a shock rule.
- **BP < 90/60 added to the Urgent rule.** It is not in red box 1's list, but footnote 2 lists it
  as a marker of severity and red box 2 sends "Patient unwell or markers of severity²" to "Give
  urgent attention as above". Systolic < 90 or diastolic < 60 (Will's convention). This makes the
  SBP < 80 branch redundant in practice; it is kept because the page writes it.
- **"Unwell, malaise"** → `Malaise`; **"body pain"** → `Generalized aches and pains`. Red box 2's
  "Patient unwell" is covered by the same `Malaise` condition.
- **"Involves mouth, eyes or genitals"** → `Eruption caused by drug` with `finding_site` Mouth region
  structure / Eye region structure / Genital structure.
- **"Raw areas"** → `Denuded skin` (disorder).
- **Fixed drug eruption likely** → `probable` `Fixed drug eruption` when Hyperpigmentation of skin
  **and** Macule of skin **and** exposure to a drug or medicament are recorded.
- The flowchart's question "Is patient on ART, TB medication, co-trimoxazole or TPT?", the
  24-hour review and the ALT/eosinophil branches only route management, and are not encoded.
- No `measure` task: the only measurements (temperature, BP) are routine vitals.

## Could not model

- **ALT and eosinophil count raised / not raised** (lab values have no unit or observable): these
  only route management (discuss with MIC hotline vs advise), so no rule is affected.
- **"Rash persists ≥ 2 weeks: discuss/refer"**: management advice, not encoded.
- **Fixed drug eruption morphology**: "round" and "often start as itchy patches with red edges" are
  not represented; "dark coloured flat spots" is split into two findings. The rule is also not
  restricted to the "No" branch (not on ART/TB medication/co-trimoxazole/TPT), so it can fire
  **more often** than the page intends.
- **Drug start relative to rash onset** (see above): the possible rule can fire **more often**
  (a rash appearing long after a recent drug start would still match) or **less often** (if the
  drug exposure is recorded without an onset).
- "Abacavir hypersensitivity reaction (AHR) likely 131" is a cross-reference to page 131 and is
  not encoded here.

## SNOMED gaps

- "Body pain" (finding): not found → `Generalized aches and pains`.
- "Feeling unwell" (finding): not found → `Malaise`.
- "Raw skin" / "Skin erosion": not found → `Denuded skin` (disorder).
- "Hyperpigmented macule": not found → `Hyperpigmentation of skin` + `Macule of skin`.
- No precoordinated concept for mucosal involvement of a drug eruption → `finding_site` on
  `Eruption caused by drug`.

## Checker issues left in place

- None.

## Questions for a clinician

- Should BP < 90/60 (footnote 2) trigger urgent attention at first presentation, or only at the
  24-hour review (red box 2)? This build applies it at any time.
- Is `Eye region structure` the right site for "involves eyes" (it includes eyelid skin), or should
  it be conjunctival involvement only?
- Is Hyperpigmentation of skin + Macule of skin + drug exposure an acceptable stand-in for "dark
  coloured round flat spots … following ingestion of a medication"?
- Should a generalised rash with any current medication (not only one started within 3 months)
  prompt the drug-rash checks?
