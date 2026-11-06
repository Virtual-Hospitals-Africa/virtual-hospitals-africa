# Page 21 – Seizures/fits (cont. 2): remaining questions

## Decisions made

- **Trigger.** The page is the approach to a patient who had a fit and is not fitting now. The
  `check_for` task and every rule tied to the red box are anchored to
  `(or Seizure Post-ictal state)`. Both are adult warning signs.
- **Red box → `Urgent`.** "Refer patient same day" is encoded as `Urgent`, structured as
  `(and <seizure/post-ictal> (or …bullets…))`. The Seizure warning sign already carries Emergency.
- **Meningitis bullet read as "any of".** "Temperature ≥ 38°C, headache, neck stiffness or
  purple/red rash, meningitis likely" is encoded literally: a fit plus any one of the four gives
  `probable` Meningitis. The priority rule references `(active_condition Meningitis)`.
  This is the least certain decision on the page (see questions).
- **Purple/red rash** → `Purpuric rash` (disorder). `Erythematous rash` was considered and left
  out as too broad.
- **New/different headache** → Headache + `New`. **Getting worse/more frequent** → Headache +
  `Worsening`. No qualifier for "different" or "more frequent" was used.
- **HIV and no known epilepsy** → `(and HIV infection+Known present (no Epilepsy+Known present))`.
- **"> 1 hour after fit"** (decreased consciousness; BP ≥ 180/130 "more than 1 hour after fit
  has stopped") → `(>= (onset (clinical_finding Seizure)) (time_ago 1 hours))`. `>` became `>=`
  because the database rejects strict time comparisons. Onset of the fit is used in place of "fit
  has stopped".
- **BP ≥ 180/130** → systolic ≥ 180 **or** diastolic ≥ 130, following the BP-pair convention.
- **Glucose < 3 (< 4 if diabetes)** → `< 3` or (known diabetes and `< 4`). **Glucose ≥ 11.1** as written.
- **New sudden asymmetric weakness or numbness** → weakness of face muscles / muscle weakness of
  limb / numbness of face / numbness of limbs, each with `Sudden onset` and `Unilateral`.
  Difficulty speaking → `Difficulty talking`. Visual disturbance → `Visual disturbance`
  (disorder). The same findings are used in the red box and in the No branch.
- **Alcohol/drug use: overdose or withdrawal** → `Overdose` (disorder) or
  `Substance withdrawal syndrome` (disorder). Alcohol withdrawal syndrome is a descendant.
- **Recent head injury** → `Injury of head` + `Recent`.
- **Pregnant or up to 1 week postpartum** → `Pregnancy`, or `Postpartum state` with
  `(<= (onset …) (time_ago 1 weeks))`.
- **No branch, "Stroke or TIA likely"** → one `probable` rule for `Cerebrovascular accident`
  (the Focal neurology warning sign concept). It is not conditioned on the seizure trigger, because
  this branch is for patients in whom a fit was not confirmed.
- **No branch, "Common faint likely"** → `probable` `Vasovagal syncope` (finding) from
  collapse + muscle twitch + any of flushing, dizziness, nausea, sweating.
- No `measure` task: glucose, BP and temperature are routine vitals.
- Medicines (ceftriaxone, analgesia, artesunate), notification and the lower "does not need
  same-day referral" flowchart are management steps and are not encoded.

## Could not model

- **"or unable to measure" (glucose).** No representation for a failed measurement. The
  priority rule fires **less often** than the page intends.
- **Common faint: "lasting < 15 seconds" and "with rapid recovery".** No duration of an
  episode and no recovery concept. The faint rule therefore fires **more often** than the page
  intends (any collapse with twitching after a prodrome).
- **The Yes/No confirmation of a seizure** (jerking movements usually < 3 minutes, tongue biting,
  incontinence, post-fit drowsiness and confusion). No rule. Recording "No" for Seizure would
  contradict the trigger. The No-branch rules are therefore not conditioned on the fit being
  ruled out.
- **"after fit has stopped".** Only the onset of the seizure finding is available, so the
  1-hour window runs from onset, not from the end of the fit. Seizures usually last < 3 minutes, so
  the difference is small.
- **"If ≥ 20 weeks pregnant and just had fit → 177".** This is a pointer to the eclampsia page.
  Pregnancy alone already triggers same-day referral here.
- **Lower flowchart, "If patient had ≥ 2 definite seizures with no identifiable cause, doctor to
  consider epilepsy".** No SNOMED concept for recurrent seizures was found, and the language has no
  seizure count or "no identifiable cause". No `possible` epilepsy rule was written.
- **"If focal seizures or new seizures after meningitis, stroke or head injury, discuss with
  specialist".** This is a management step and is not encoded.

## SNOMED gaps

- "Twitching" (finding): not found. Used `Muscle twitch` (finding).
- "Flushing" exists only as a disorder. Used `Flushing` (disorder).
- "Vasovagal syncope" exists only as a finding. Used `Vasovagal syncope` (finding) as the
  diagnosed concept.
- No joint "stroke or TIA" concept. Used `Cerebrovascular accident`. TIA is not diagnosed.
- "Drug withdrawal" / "Drug overdose" (disorder): not found. Used `Substance withdrawal syndrome`
  and `Overdose`.
- "Asymmetrical" (qualifier): not found (`Asymmetry` exists). Used `Unilateral`.
- No qualifier for "different" (headache) or for a failed glucose measurement.
- "Postpartum state, 1 week" not found (`Postpartum period, 7 days` means day 7). Used
  `Postpartum state` with an onset window.
- No concept for recurrent seizures (≥ 2 seizures).

## Checker issues left in place

These are gate false positives. The finding is used as `(no X)`, but the gate's `(no …)`
normaliser only recognises the No value when it is last. With a qualifier it is not last, so the
usage is missed.

- `CHECKED FOR BUT NEVER USED AS EVIDENCE`:
  `(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Epilepsy" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))`
- `PRIORITY EVALUATION EVIDENCE NOT CHECKED FOR`:
  `(no (finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Epilepsy" "disorder") (snomed_concept "No" "qualifier value") (qualifier (snomed_concept "Known present" "qualifier value"))))`

## Questions for a clinician

1. Does "Temperature ≥ 38°C, headache, neck stiffness or purple/red rash, meningitis likely" mean
   any one of these after a fit, or fever together with one of the others? As encoded, headache
   alone after a fit gives probable meningitis.
2. Should the common-faint rule exist at all, given that its key discriminators (< 15 seconds,
   rapid recovery) cannot be recorded?
3. Is `Urgent` the right level for same-day referral after a fit, given that the Seizure warning
   sign already sets Emergency?
4. Should "Stroke or TIA likely" also produce a `probable` TIA diagnosis?
5. Does "Recent head injury" need a time window (e.g. days)?
