# Page 21 – Seizures/fits (cont. 2): remaining questions

## Decisions made

- **Trigger.** Every rule on the "Yes" side hangs off the recorded warning sign
  `(clinical_finding (snomed_concept "Seizure" "finding"))`. The red box sits under "Confirm that
  patient indeed had a seizure/fit: Yes", so the priority rule is `(and Seizure (or …red box…))`.
- **Priority level.** "Refer patient same day" is encoded as `Urgent`. The page does not escalate.
  (The Seizure warning sign has its own Emergency level, but that applies to active fitting.)
- **Meningitis likely.** I read "Temperature ≥ 38°C, headache, neck stiffness or purple/red rash,
  meningitis likely" as Seizure **and** any one of the four → `probable` Meningitis, which the
  priority rule uses through `(active_condition Meningitis)`. Seizure is kept in the rule so that a
  headache alone does not diagnose meningitis anywhere else in the book. "Purple/red rash" →
  `Purpuric rash`.
- **New/different or worsening/more frequent headache** → Headache + `New`, Headache + `Worsening`,
  `Frequent headache`.
- **HIV and no known epilepsy** → `(and (HIV + Known present) (no Epilepsy))`. The check_for asks
  about plain `Epilepsy`, because the gate did not match `(no …)` around a finding that carries the
  `Known present` qualifier.
- **Time criteria.** "Decreased consciousness > 1 hour after fit" and "BP ≥ 180/130 more than 1 hour
  after fit has stopped" each use `(>= (onset Seizure) (time_ago 1 hours))`. "Up to 1 week
  postpartum" is `Postpartum state` plus `(<= (onset Postpartum state) (time_ago 1 weeks))`. Per the
  brief, only `>=` and `<=` are used.
- **BP ≥ 180/130** → systolic ≥ 180 **or** diastolic ≥ 130.
- **Glucose** uses the routine vital `Blood glucose status` (mmol/L): < 3; known diabetes and < 4;
  ≥ 11.1. No measure task, because glucose is routine.
- **Focal signs** ("New sudden asymmetric weakness or numbness, difficulty speaking or visual
  disturbance"): `Muscle weakness` and `Numbness` with `Sudden onset` + `Asymmetry`, and
  `Difficulty talking` and `Visual disturbance` with `Sudden onset`. The same four findings are a
  red-box criterion (Yes branch) and the evidence for "Stroke or TIA likely" (No branch).
- **Stroke or TIA likely** → two `probable` rules (Cerebrovascular accident, Transient ischemic
  attack) with the same evidence.
- **Common faint likely** → `probable` `Vasovagal syncope` (finding) when there is Collapse and
  Muscle twitch and any of Flushing, Dizziness, Nausea or Sweating.
- **The No branch** (fit not confirmed) isn't expressed as `(no Seizure)`. The trigger is the
  recorded seizure, so the stroke/TIA and faint rules rest on their own evidence. The seizure task
  asks for their findings.
- **The malaria bullet** ("If patient was in malaria area … malaria test positive, also give
  artesunate") is a treatment add-on for a patient already being referred, so it is accounted for as
  `management_step`.
- **The lower flowchart** (known epilepsy → routine care; the doctor's work-up; "≥ 2 definite
  seizures … consider epilepsy") is management or lab work and is not modelled.
- **Shock and BP < 90/60** don't appear on this page.

## Could not model

- **Glucose "unable to measure"** has no representation, so that part of the rule fires less often
  than the page intends.
- **Collapse "lasting < 15 seconds" and "with rapid recovery"** have no representation, so the faint
  rule fires more often.
- **"New" on the focal signs** is carried only by `Sudden onset`, not by a separate `New` qualifier.
- **"≥ 20 weeks pregnant and just had fit → 177"**: gestational age isn't modelled. It is a
  cross-reference to page 177, and the pregnancy bullet already refers the patient.
- **Malaria area in the past 3 months plus a positive malaria test**: not encoded (management).
- **"Doctor to consider epilepsy" after ≥ 2 definite seizures with no identifiable cause**: the
  language can't count episodes or express "no identifiable cause", so there is no `possible`
  epilepsy rule.
- **Onset timing.** Both onset comparisons depend on the Seizure and Postpartum state findings
  carrying the real time of the event. If onset defaults to the time of recording, the "> 1 hour"
  criteria never fire, and the postpartum criterion always fires.

## SNOMED gaps

- **"Twitching"** (finding) doesn't exist. I used `Muscle twitch` (finding).
- **"Flushing"** exists only as a disorder, so I used `Flushing` (disorder).
- **"Difficulty speaking"** (finding) doesn't exist. I used `Difficulty talking` (finding), which is
  in the vocabulary.
- **"Drug withdrawal" / "Drug overdose"** (disorder) don't exist. I used
  `Substance withdrawal syndrome` (disorder) and `Overdose` (disorder).
- **Common faint**: there is no "Simple faint". `Vasovagal syncope` exists only as a finding.
- **"Asymmetrical"** (qualifier) doesn't exist. I used `Asymmetry` (qualifier value).
- **No qualifier for "different"** (headache). `New` covers it.

## Checker issues left in place

- None.

## Questions for a clinician

1. Meningitis likely: is any single item (for example, headache alone after a fit) enough, or does
   the page mean fever plus a meningeal sign?
2. Should "Stroke or TIA likely" give two probable diagnoses, or one?
3. Is twitching required for "common faint likely", or is it just the reason the faint was mistaken
   for a fit?
4. Should a positive malaria test after travel to a malaria area be a referral criterion in its own
   right (cerebral malaria)?
5. Is the `Asymmetry` qualifier practical to record, or should plain sudden-onset weakness/numbness
   be enough?
