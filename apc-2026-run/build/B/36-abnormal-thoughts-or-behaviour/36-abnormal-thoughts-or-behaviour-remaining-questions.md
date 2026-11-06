# Page 36 – Abnormal thoughts or behaviour: remaining questions

## Decisions made

- **Presenting complaint** is `Abnormal behavior` (finding) **or** `Disturbance in thinking` (finding), used as the
  trigger of the check task and as the first conjunct of every rule. It is not a recorded common symptom or
  warning sign, so the task fires only if one of these is recorded.
- **Recent onset** is the `Recent` qualifier value on the complaint. SNOMED has no "Recent onset" qualifier, and
  the page gives no time window that would allow an onset comparison. **Sudden onset** uses `Sudden onset`.
- **Priority:** only the two red-box items (sudden or recent onset) set `Urgent`. The "likely" boxes under
  "Manage urgently" do not add priorities of their own. (`Poisoning` is already a Very urgent warning sign.)
- **Every "likely" box is a `probable` rule conjoined with the complaint**, because the boxes sit inside the red
  box for patients with abnormal thoughts or behaviour.
- **Lists with no quantifier** (mania, stimulant intoxication, alcohol intoxication boxes) are read as "any of".
  Only the psychosis box says "≥ 1 of" explicitly.
- **Delirium** needs fluctuating consciousness **and** temperature ≥ 38 °C, as the box writes "and".
- **BP ≥ 140/90** is read as systolic ≥ 140 **or** diastolic ≥ 90, following Will's convention for BP pairs.
- **Withdrawal:** one rule for `Substance withdrawal syndrome` (`Alcohol withdrawal syndrome` is a descendant).
  "Known alcohol/drug user who has stopped/reduced intake" is `Stopped drinking alcohol`, `Decreased alcohol
  consumption` or `Abstinent from drug misuse`. "Severe" is applied to both restlessness and agitation.
- **Poisoning:** exposure to `Drug or medicament` or, for "unknown substance", to the generic `Substance`.
- **"Consider stroke or TIA"** and **"consider dementia"** are encoded as `possible` rules. "New sudden" is the
  `Sudden onset` qualifier. "For at least 6 months" is `(>= (onset …) (time_ago 6 months))`.
- No `measure` task: pulse, BP, temperature and glucose are routine vitals.

## Could not model

- **"asymmetric"** weakness/numbness (stroke/TIA bullet): the language has no laterality comparison, so any
  sudden-onset weakness or numbness counts. The possible rules may fire **more often** than the page intends.
- **Route of exposure** (ingestion/inhalation/absorption) is not modelled: any exposure counts.
- **"Unknown substance"** as the generic `Substance`: descendant matching makes it match exposure to *any*
  substance (e.g. a food recorded for page 20), so the poisoning rule may fire **more often** than intended.
- **"over hours/days"** (delirium) is taken as implied by `Fluctuation of level of consciousness`; no time comparison.
- **"Known" user** is not a separate condition: having stopped or reduced intake is taken to imply it.
- **Manage urgently** steps (oxygen, fluids, glucose → 19, involuntary admission, LP referral), drug doses in
  the boxes, "Check for head injury", ECG advice and the "Refer urgently unless" exceptions are management.

## SNOMED gaps

- **"reckless"** (mania box): only `Reckless character` / `Reckless driving` exist (traits or specific
  behaviours). Not encoded, so the mania rule may fire **less often**.
- **"talkative"**: no concept; `Pressure of speech` used (narrower). `Logorrhea` was the alternative.
- **"Disorganised speech"**: no concept; `Incoherent speech` used. **"Disorganised behaviour"**: no concept;
  not encoded (`Bizarre behavior` was considered and rejected as a different idea).
- **Reduced (not stopped) drug intake**: no concept; only `Abstinent from drug misuse` is encoded.
- **"less able to cope with daily activities and work/social function"**: no direct concept; `Difficulty coping`
  used.
- **"Recent onset"** qualifier: none; `Recent` used.

## Checker issues left in place

- None.

## Questions for a clinician

- Should the stimulant box need more than one feature? With "any of", nausea or sweating alone in a patient
  with abnormal behaviour gives probable stimulant intoxication.
- Should delirium really need fever? The box joins fluctuating consciousness and temperature ≥ 38 °C with "and".
- Should a probable delirium, psychosis, mania, intoxication or withdrawal diagnosis by itself make the patient
  Urgent, even without a recorded sudden or recent onset?
- Is `Recent` an acceptable recording of "recent onset", or should a time window (e.g. onset within 2 weeks) be set?
