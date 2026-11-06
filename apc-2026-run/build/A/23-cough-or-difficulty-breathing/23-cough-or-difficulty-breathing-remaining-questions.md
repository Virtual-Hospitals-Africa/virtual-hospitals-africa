# Page 23 – Cough or difficulty breathing: remaining questions

## Decisions made

- **Trigger.** `Cough` or `Difficulty breathing`. `Dyspnea` (the recorded "Shortness of breath"
  common symptom) is a descendant of `Difficulty breathing`, so both recorded complaints fire the tasks.
- **Shock/SBP < 80** is encoded as this page's own `or` of `(clinical_finding Shock)` and systolic
  BP < 80. Footnote 1 (pulse ≥ 100, RR > 30, …, "shock likely") is not built into a shock rule.
- **BP < 90/60** (tension pneumothorax) is systolic < 90 **or** diastolic < 60.
- **Heart failure likely** = orthopnoea **and** swelling of lower limb (the general concept, so the
  `Leg swelling symptom` descendant also matches). The priority rule references
  `(active_condition Heart failure)`.
- **Tension pneumothorax likely** is read as one clinical picture: sudden-onset dyspnoea **and** a
  one-sided sign (hyperresonance, decreased breath sounds or chest pain, each with `Unilateral`)
  **and** displaced trachea **and** BP < 90/60. The priority rule references
  `(active_condition Tension pneumothorax)`.
- **Confused** = `Clouded consciousness` (VHA's ACVPU "Confused" finding); agitated = `Feeling agitated`;
  reduced consciousness = `Decreased level of consciousness`.
- **Breathless while talking** = `Unable to complete a sentence in one breath`.
- **Swelling and pain in one calf** = `Swollen calf` and `Pain in calf`, both with `Unilateral`.
- **Rapid deep breathing** = `Kussmaul's respiration`. It triggers a measure task for fingerprick
  glucose. Glucose is a routine vital, but the page links the measurement to this sign. "If > 11.1 → 19"
  is a cross-reference and is not modelled.
- **Duration and recurrence.** "Cough < 2 weeks" is `(<= (onset Cough) (time_ago 2 weeks))`, and
  "≥ 2 weeks" is `(>= (onset …) (time_ago 2 weeks))`. The database accepts only `>=`/`<=` in onset
  comparisons, so a cough of exactly 2 weeks matches both branches. "Recurrent" is the finding with the
  `Recurrent` qualifier. "Not recurrent" is an explicit `(no Cough + Recurrent)`.
- **Crackles/bronchial breathing = No** is an explicit `(no …)` for both findings.
- **Acute bronchitis** is read as "recent cold **and** (tight chest, sore chest or coughing sputum)",
  inside the short-cough, no-crackles branch.
- **Long branch.** Every right-hand rule except probable COPD carries the "≥ 2 weeks or recurrent"
  gate. Probable COPD has its own ≥ 2-year onset. Post-infectious cough uses only the cough part of
  the gate, because the page requires no difficulty breathing.
- **"Consider"** items (nose problems, asthma, COPD, lung cancer) are `possible` rules. The **"likely"**
  items (acute viral infection, acute bronchitis, pneumonia, PJP, OSA, post-infectious cough, COPD)
  are `probable` rules.
- **Severe pneumonia** (red box, management list) only selects ceftriaxone, so it is accounted for as
  `management_step`. Its age > 65 criterion could not be expressed anyway.

## Could not model

- **SpO₂ "drops to < 87% on exertion (walking 15–20 m)"**: a measurement has no exertion context.
  Only SpO₂ < 92% at rest is encoded, so the rule fires **less often** than the page intends.
- **"Coughs ≥ 1 tablespoon fresh blood"**: the amount and "fresh" are not expressible. Any
  `Hemoptysis` matches, so the rule fires **more often**. (Hemoptysis is also a Very urgent warning sign.)
- **CD4 < 200** (PJP): a lab value with no unit or observable in the language. PJP is diagnosed from known
  HIV + dry cough + dyspnoea + the long gate, so it fires **more often** than the page intends.
- **COPD "most days of 3 months for ≥ 2 years"**: only "cough onset ≥ 2 years ago" is encoded. The
  rule fires **more often** (any long-standing cough in a smoker) and can also miss a cough recorded
  without an onset date.
- **"Recent"** cold, URTI or stopping smoking: no time comparison. Any recorded common cold, URTI or
  ex-smoker status matches (fires **more often**).
- **Frequent** throat clearing: frequency not encoded.
- **Severe pneumonia's** age > 65: no age comparison in the language (management only, see above).
- **Treatment-selection question** for pneumonia (HIV, > 65 years, comorbidities, alcohol): management.

## SNOMED gaps

- **Sore chest**: no concept found; `Chest pain` is used.
- **Post-infectious cough**: no direct concept; `Persistent cough after viral respiratory infection`
  (disorder) is used.
- **Itchy nose**: no precoordinated concept; `Itching` with finding site `Nasal structure` (resolves) is used.
- **Persistent snoring**: `Habitual snoring` is used.
- **Weight loss** (finding) does not exist; `Weight decreased` is used.
- `Chest structure` (body structure) does not resolve, so no chest finding site is used.

## Checker issues left in place

- None.

## Questions for a clinician

- Tension pneumothorax: should the urgent rule need the whole picture (as encoded), or should sudden
  breathlessness plus any one-sided sign be enough to make the patient urgent?
- `(active_condition Heart failure)` makes any patient with known heart failure and a cough urgent. Is
  that acceptable, or should the urgent rule use only the orthopnoea + leg swelling findings?
- Is `Clouded consciousness` the right concept for "confused"? And should the ACVPU findings
  (responds to voice/pain, unresponsive) also count as "reduced consciousness"?
- Are "Acute viral infection" → `Acute viral disease` and "post-infectious cough" →
  `Persistent cough after viral respiratory infection` acceptable SNOMED choices?
- Should a cough of exactly 2 weeks count as short or long (the encoding currently allows both)?
