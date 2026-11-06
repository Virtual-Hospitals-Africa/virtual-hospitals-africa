# Page 36 – Abnormal thoughts or behaviour: remaining questions

## Decisions made

- **Presenting complaint.** No single SNOMED concept means "abnormal thoughts or behaviour". It is
  written as `Abnormal behavior` (finding) OR `Disturbance in thinking` (finding), in the task
  trigger, in every diagnosis rule and in the priority rule. It is not a recorded common symptom or
  warning sign, so the task fires only when a health worker records one of these findings.
- **Urgent priority** = complaint AND (sudden onset OR recent onset), as the red box header says.
  "Sudden" uses the `Sudden onset` qualifier and "recent" uses the `Recent` qualifier; the page
  gives no time window for "recent".
- **The seven "look for" boxes** each became a `probable` diagnosis rule, conditioned on the complaint:
  - Delirium: fluctuating consciousness AND temperature ≥ 38 °C (the page says "and").
  - Mania: any of the five features (the page says "or").
  - Psychosis: lack of insight AND ≥ 1 of hallucinations, delusions, disorganised speech/behaviour.
  - Stimulant intoxication and alcohol intoxication: the page lists features separated by commas
    with no count. I encoded them as an OR (see Questions).
  - Alcohol/drug withdrawal: (stopped/reduced intake) AND any of tremor, sweating, nausea,
    severe restlessness, severe agitation, hallucinations.
  - Poisoning: exposure to a medication or a substance.
- **BP ≥ 140/90** is encoded as systolic ≥ 140 OR diastolic ≥ 90 (Will's pair convention).
- **Stroke/TIA.** "Consider stroke or TIA" in the Manage urgently list became two `possible` rules
  (one per diagnosis) with the same evidence. "New sudden" is written as the `Sudden onset` qualifier.
- **Dementia** ("not needing urgent attention"): a `possible` rule. "For at least 6 months" is
  written as `(>= (onset X) (time_ago 6 months))`, following the convention in Will's briefing
  ("`>=` … means onset was at least … ago").
- Shared features (sweating, nausea, restlessness, hallucinations) appear once in the `check_for`
  and are reused by several rules. Nausea is a common symptom, so it is not in the `check_for`.
- No `measure` task: temperature, pulse and BP are routine vitals.
- No new priority rules for the "likely" diagnoses: the page puts all of them inside the urgent
  box, which applies only when onset is sudden or recent.

## Could not model

- "Asymmetric" (weakness/numbness) and "new" (beyond sudden onset) for stroke/TIA. The rule fires
  more often than the page intends (on symmetric weakness too).
- "Over hours/days" for fluctuating consciousness: implicit in the concept, not checked by time.
- "Unknown substance" is modelled as exposure to any `Substance`. This matches any recorded
  substance exposure, so it fires more often than the page intends.
- "Reduced" drug intake: no concept found. Only stopped drug use (`Abstinent from drug misuse`)
  is encoded, so the rule fires less often than the page intends.
- "Known alcohol/drug user" is not checked separately. It is implied by the stopped/reduced findings.
- The routes "ingestion/inhalation/absorption" are not modelled; all routes count.
- The Manage urgently cross-references (seizure →20, aggressive →35, head injury →30, suicidal →34),
  the oxygen, glucose and fluid steps, involuntary admission, CrAg/LP, all drug doses and the
  "Refer urgently unless" exceptions are management or cross-references.
- "If unsure of diagnosis, refer for further assessment": management.

## SNOMED gaps

- "Abnormal thoughts or behaviour": no single concept. Used `Abnormal behavior` OR `Disturbance in thinking`.
- "Talkative": none found. Used `Pressure of speech` (narrower).
- "Reckless": none (`Reckless behavior` NO). Used `Disinhibited behavior`.
- "Disorganised speech": none (`Disorganized speech` NO). Used `Disorganized thinking`.
- "Disorganised behaviour": none (`Disorganized behavior` NO). Used `Bizarre behavior`.
- "Psychosis" (disorder): NO. Used `Psychotic disorder`.
- "Alcohol/drug withdrawal": used `Substance withdrawal syndrome` (the parent of `Alcohol withdrawal syndrome`).
- "Reduced drug intake": none found.
- "Unknown substance": none. Used `Substance` (root substance).
- "Less able to cope with daily activities and work/social function": used `Difficulty coping`.
- "Disorientation": FSN is `Disorientated`.
- Body site `Limb structure` (body structure) was checked: YES.

## Checker issues left in place

- None.

## Questions for a clinician

- Stimulant intoxication and alcohol intoxication: should any single feature (e.g. pulse ≥ 100,
  or nausea) with abnormal behaviour make the diagnosis probable, or should a minimum number of
  features be required? The current OR fires broadly.
- Is `Disinhibited behavior` an acceptable stand-in for "reckless", and `Bizarre behavior` for
  "disorganised behaviour"?
- Should "recent onset" have a time window (e.g. days or weeks), so it can be written as an onset
  comparison instead of the `Recent` qualifier?
- Should exposure to any substance count toward probable poisoning, or only medication and truly
  unknown substances?
