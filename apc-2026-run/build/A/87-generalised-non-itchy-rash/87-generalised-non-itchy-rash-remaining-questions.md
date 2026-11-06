# Page 87 – Generalised non-itchy rash: remaining questions

## Decisions made

- **Red box is pointer-only** ("Check if the patient needs urgent attention → 82"). No priority
  evaluation is written on this page; the urgent criteria belong to page 82. The page's own logic
  outside the red box is encoded as one `check_for` task and six diagnosis rules.
- **Trigger** is `(clinical_finding (snomed_concept "Generalized rash" "disorder"))`. "Non-itchy" is
  not part of the trigger: requiring `(no Itching)` would stop the task firing whenever itch was not
  explicitly asked. Generalised rash is not a recorded common symptom or warning sign.
- **Each diagnosis rule includes the generalised rash** as page context (the bullets are written for
  a patient with this rash).
- **Tick bite fever likely** → `probable` "African tick bite fever": rash **and** tick bite **and**
  (headache **or** temperature ≥ 38 °C **or** generalised aches and pains).
- **Consider mpox** → `possible` "Monkeypox": (rash or lesion of skin/genitals/anus/rectum/mouth/eyes)
  **and** ≥ 1 of headache, backache, body pain, lymphadenopathy, temperature > 38.5 °C, fatigue, sore
  throat, nasal congestion, cough. Lesion sites are not in the `check_for` (the patient already has
  the rash, so they cannot change the outcome here); they stay in the rule for fidelity.
- **Consider drug rash** → `possible` "Eruption caused by drug": rash **and** onset of "New medication
  commenced" within 3 months, written `(<= (onset …) (time_ago 3 months))` per the time convention.
  The listed drug classes are examples ("such as"), so any new medication counts.
- **Syphilis reactive** → `probable` "Secondary syphilis" via "Syphilis titer detected".
- **HIV positive → routine HIV care** is management; not encoded. "Human immunodeficiency virus
  detected" was therefore removed from the `check_for` (no rule consumes it).
- **Syphilis and HIV negative**: HIV risk is "exposure to HIV", using the gold standard's exposure
  pattern `(finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value")
  (snomed_concept "Human immunodeficiency virus" "organism"))`.
  - Yes (onset within 6 weeks, `<=`) → `possible` "Acute human immunodeficiency virus infection"
    ("Rash may be part of HIV seroconversion illness").
  - No (`(no exposure)` **or** exposure onset at least 6 weeks ago, `>=`) → `probable` "Viral
    exanthem" (non-specific viral rash likely).
- Temperature is a routine vital; no `measure` task.

## Could not model

- **"Unexplained" rash** (mpox): not representable. The mpox rule fires more often than the page
  intends (for any generalised rash plus one systemic feature).
- **"Tick present"** (as distinct from a tick bite): no concept; only tick bite is encoded. Fires less
  often than intended for a tick seen without a recognised bite.
- **Exactly 6 weeks**: the `<=` and `>=` onset comparisons overlap at the boundary instant; negligible.
- The descriptive lines (secondary syphilis: palms/soles, wart-like lesions, patchy hair loss;
  viral rash: "patient may have temperature ≥ 38 °C, headache, lymphadenopathy, muscle pain") are
  descriptions, not criteria, and are not encoded.
- Management (treat syphilis → 67, routine HIV care → 126, repeat HIV test, safe sex, paracetamol,
  discuss/refer if rash ≥ 2 weeks or diagnosis uncertain) is out of scope.

## SNOMED gaps

- "Syphilis reactive" / "negative": no reactive-test finding; used "Syphilis titer detected" /
  "Syphilis titer not detected".
- "At risk of HIV": no "At increased risk of exposure to human immunodeficiency virus" finding;
  "Exposure to Human immunodeficiency virus" exists only as an `event`. Used the exposure
  qualifier + organism form.
- "Tick present": none found ("Infestation caused by Ixodidae" is an infestation, not the same).
- Lesion of anus: no precoordinated concept; used "Lesion" (morphologic abnormality) with
  finding_site "Anal structure" (body structure, verified).
- "Body pain": used "Generalized aches and pains".
- "Non-specific viral rash": used "Viral exanthem".

## Checker issues left in place

None.

## Questions for a clinician

1. Is "African tick bite fever" the right concept for the page's "tick bite fever", or should it be
   "South African tick-bite fever" (or both, via a common parent)?
2. Is "Syphilis titer detected" an acceptable recording of a reactive syphilis test (RPR/rapid test)?
3. Should "HIV positive" produce a diagnosis (e.g. probable HIV infection) here, or is routine HIV
   care on page 126 enough?
4. Is the "No" branch (no HIV risk) correctly read as "no exposure, or exposure more than 6 weeks
   ago"?
5. Should the rule set be triggered by any rash, given "non-itchy" cannot be expressed?
