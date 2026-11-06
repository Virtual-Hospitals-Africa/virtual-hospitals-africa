# Page 197 – Protect yourself from occupational stress: remaining questions

## Decisions made

- **No flowchart file.** The page has a red box, advice lists and an identification table, but no
  Yes/No branches or multi-step algorithm.
- **Red box → one `check_for` task and one `Urgent` priority evaluation.** "Arrange urgent
  assessment for the health worker with occupational stress and any of:" is encoded as
  `(and Stress-at-work (or …4 items…))` at `Urgent`. The page does not escalate further, so no
  `Emergency`/`"Very urgent"`.
- **Occupational stress = `Stress at work` (finding).** It is not a common symptom or warning sign,
  so it is the natural `clinical_finding` for the complaint. The urgent task also fires on
  `(diagnosis Stress at work possible)`, which the identification signs produce.
- **"Alcohol or drug intoxication"** = `Intoxication caused by psychoactive substance` (its children
  include Alcohol intoxication and drug intoxications), one concept for both.
- **"Aggressive or violent behaviour"** = `Aggressive behavior` (a VHA warning sign) or
  `Physical aggression` (its child; SNOMED has no "Violent behavior" finding).
- **"Suicidal thoughts or plans"** = `Suicidal thoughts` or `Planning suicide`.
- **Identification section → possible diagnoses.** "The health worker with any of the above may have
  substance misuse, stress, depression/anxiety or burnout" is encoded as five `possible` rules, each
  on `(or …all identification signs…)`: Stress at work, Harmful pattern of substance use, Depressive
  disorder, Anxiety disorder, Physical AND emotional exhaustion state (synonym: burnout). A second
  `check_for` task ("Check for signs of occupational stress in a health worker"), anchored on Stress
  at work, asks for those signs.
- Management advice (all "Adopt measures …" lists, referral for assessment and follow-up, page
  pointers 198/200) is not encoded (no `manage` tasks in this pass).

## Could not model

- **"Health worker"**: the language cannot restrict a rule to staff. The possible rules therefore
  fire for **any** adult with one sign, including Fatigue (a common symptom), Bereavement or Poor
  concentration. They fire much **more often** than the page intends.
- **"at work"** (intoxication, inappropriate/aggressive behaviour at work): no work-setting
  qualifier. The urgent rule fires slightly more often (the behaviour need not be at work), though it
  still requires Stress at work.
- **"drunk ≥ 4 drinks/session"**: the drink count is not expressible; approximated by
  `Heavy drinking session`. The footnote's drink definition is not encoded.
- **"In the past year" / "In the past month"**: not expressible as an onset comparison (onset
  within a month means *started* recently, which is different). Dropped; rules fire more often.
- **"Diagnosis of long-term condition"** (recent): `Chronic disease` exists, but "recent diagnosis"
  is not expressible; encoding the bare concept would fire on every chronically ill patient. Not
  encoded (fires less often).
- **"Frequent"** absenteeism/lateness: frequency not expressible beyond the concepts used.
- **"Recent"** distressing event: recency not expressible.

## SNOMED gaps

- **Frequent lateness**: no concept found ("lateness", "late for work", "timekeeping" searched;
  only `Late for appointment`, which is not the same). Not encoded.
- **Violent behaviour**: no current-behaviour finding; `Physical aggression` used.
- **Needlestick injury**: no site-less `Needle stick injury`; `Accidental needle stick injury`
  (disorder) used.
- **Traumatic event**: exists only as an `event` concept; the finding `Victim of psychological
  trauma` used.
- **Smells of alcohol**: `Smell of alcohol on breath` used (page does not say breath).

## Checker issues left in place

- None.

## Questions for a clinician

- Should the five possible diagnoses be encoded at all, given they will fire for any adult patient
  with, say, fatigue or bereavement? Alternatives: drop them, or gate them on Stress at work.
- Is `Physical AND emotional exhaustion state` acceptable for "burnout", and `Harmful pattern of
  substance use` for "substance misuse"?
- Should suicidal plans in a health worker be `"Very urgent"` rather than `Urgent`? The page says
  only "urgent assessment".
- Should "Diagnosis of long-term condition" be encoded as `Chronic disease` despite the lack of a
  recency constraint?
