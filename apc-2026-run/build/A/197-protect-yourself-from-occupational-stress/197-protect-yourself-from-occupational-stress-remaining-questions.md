# Page 197 – Protect yourself from occupational stress: remaining questions

## Decisions made

- **The patient is the health worker.** The trigger is `Stress at work` (finding), the page's
  "occupational stress". It is not a recorded common symptom or warning sign, so the task fires
  only when a health worker records it.
- **Red box → `Urgent`** priority: `(and Stress at work (or …4 red-box items…))`, following
  "Arrange urgent assessment". `Aggressive behavior` is also VHA's Very urgent warning sign. That
  warning sign still applies on its own. This page's rule stays Urgent.
- "Alcohol or drug intoxication" is encoded as `Intoxication caused by psychoactive substance` (one
  concept; `Alcohol intoxication` is a descendant). "Aggressive or violent behaviour" is encoded as
  `Aggressive behavior` or `Physical aggression`. "Suicidal thoughts or plans" is encoded as
  `Suicidal thoughts` or `Planning suicide`.
- **"The health worker with any of the above may have substance misuse, stress,
  depression/anxiety or burnout"** is encoded as four `possible` rules (substance misuse,
  depression, anxiety, burnout). Each one fires on any item in the "Identify occupational stress"
  panel, and each is anchored on `Stress at work`. The anchor stands in for "health worker", which
  the language cannot express. Without it, `Fatigue` alone would suggest burnout or depression in
  any patient.
- **No separate possible "stress" rule.** All the rules already require a recorded `Stress at work`,
  so such a rule would be redundant.
- "Any of the above" is read as the Identify panel only, not the red-box items. Red-box items lead
  to urgent assessment instead.
- No flowchart file: the page has no Yes/No branches.
- All "Adopt measures …" advice and the footnote are outside the red box. They are management or
  self-care advice, so they are not encoded.

## Could not model

- **"at work"** in every red-box item: the setting can't be expressed. The rule fires on the
  finding wherever it happened, so it fires **more often** than the page intends.
- **"In the past year"** and **"in the past month"**: onset records when a finding started, not
  when it last happened, so a time comparison would be wrong. These windows are dropped, so the
  rules fire **more often**.
- **"drunk ≥ 4 drinks/session"**: there is no unit or count for drinks. Not encoded, so the
  substance-misuse rule fires **less often**. `Drinking binge` exists, but its definition doesn't
  match ≥ 4 drinks, so I didn't use it.
- **"Recent"** (distressing event) and **"Frequent"** (absenteeism) are not encoded.

## SNOMED gaps

- **"Diagnosis of long-term condition"** (recent): there is no concept for a new diagnosis of any
  chronic condition. `Chronic disease` means having one, not being newly diagnosed. Not encoded.
- **"Frequent lateness"**: no concept found. Not encoded.
- **"Violent behaviour"**: no FSN found. `Physical aggression` was used instead.
- **"Burnout"**: `Physical AND emotional exhaustion state` (burnout is a synonym; its parent is
  Anxiety disorder).
- **Prescription/OTC misuse**: `Misuses drugs` (broader). `Misuse of prescription only drugs`
  would leave out OTC medicines.
- **"Substance misuse"** as a diagnosis: `Substance misuse behavior` (finding).
  `Harmful pattern of substance use` (disorder) is an alternative.

## Checker issues left in place

- None.

## Questions for a clinician

- Should red-box findings (e.g. intoxication, suicidal thoughts) also raise the possible
  substance-misuse and depression diagnoses?
- Is `Stress at work` the right anchor, or should a health-worker occupation flag gate these rules?
- Should aggression at work in a staff member keep VHA's Very urgent warning-sign level, or is the
  page's "urgent assessment" the intended level?
- Does `Traumatic event` (event) capture psychological trauma as the page means it, or should it
  be `Victim of psychological trauma`?
