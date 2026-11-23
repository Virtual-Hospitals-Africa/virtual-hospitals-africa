# Page 197 – Protect yourself from occupational stress: remaining questions

Final build, reconciled from two independent builds (base: builder A).

## Decisions made

- **The patient is the health worker.** The trigger is `Stress at work` (finding), the page's
  "occupational stress". It is not a recorded common symptom or warning sign, so the task fires
  only when someone records it.
- **One `check_for` task** asks for the four red-box items and every sign in the "Identify
  occupational stress" panel.
- **Red box → `Urgent`** priority: `(and Stress at work (or …4 red-box items…))`, following
  "Arrange urgent assessment". `Aggressive behavior` is also VHA's Very urgent warning sign. That
  warning sign still applies on its own. This page's rule stays Urgent.
- "Alcohol or drug intoxication" is encoded as `Intoxication caused by psychoactive substance` (its
  children include Alcohol intoxication). "Aggressive or violent behaviour" is encoded as
  `Aggressive behavior` or `Physical aggression`, because SNOMED has no "Violent behavior" finding.
  "Suicidal thoughts or plans" is encoded as `Suicidal thoughts` or `Planning suicide`.
- **"The health worker with any of the above may have substance misuse, stress,
  depression/anxiety or burnout"** is encoded as four `possible` rules: substance misuse,
  depression, anxiety and burnout. Each fires on any item in the Identify panel and is gated on
  `Stress at work`, which stands in for "health worker". The language cannot express "health
  worker". Without the gate, `Fatigue` or `Bereavement` alone would suggest depression or burnout
  in any adult. *(Unsettled. See the questions.)*
- **No separate possible "stress" rule.** Every rule is already gated on a recorded `Stress at
  work`, so such a rule would only re-derive its own gate. Builder B had one, plus a task triggered
  by it; neither was kept.
- "Any of the above" is read as the Identify panel only. Red-box items lead to urgent assessment
  instead.
- "Little interest/pleasure" is encoded as both `Loss of interest` and `Anhedonia`.
- "Misused prescription or over-the-counter medications" is encoded as `Misuse of medication`.
- "Drunk ≥ 4 drinks/session" is encoded as `Heavy drinking session`, without the count.
- "Traumatic event" is encoded as the exactly named `Traumatic event` (event).
- No flowchart file: the page has no Yes/No branches.
- All "Adopt measures …" advice, the referral sentence, the page pointers (198, 200) and the
  footnote are management or self-care advice, so they are not encoded.

## Could not model

- **"Health worker"**: the language can't restrict a rule to staff. It is approximated by the
  `Stress at work` gate.
- **"at work"** in the red-box items: the setting can't be expressed. The rule fires **more often**
  than the page intends.
- **"In the past year"** and **"in the past month"**: onset records when a finding started, not
  when it last happened. These windows are dropped, so the rules fire **more often**.
- **"≥ 4 drinks/session"**: there is no unit or count for drinks. `Heavy drinking session` is used
  without the threshold, and the footnote's definition of one drink is not encoded.
- **"Recent"** (distressing event) and **"Frequent"** (absenteeism) are not expressible.
- **"Diagnosis of long-term condition"** (recent): `Chronic disease` exists, but recency can't be
  expressed. The bare concept would fire on every chronically ill patient. Not encoded, so the
  rules fire **less often**.

## SNOMED gaps

- **"Frequent lateness"**: no concept found (only `Late for appointment`, which means something
  else). Not encoded.
- **"Violent behaviour"**: no FSN found. `Physical aggression` is used instead.
- **"Burnout"**: `Physical AND emotional exhaustion state` (burnout is a synonym).
- **"Substance misuse"** as a diagnosis: `Substance misuse behavior` (finding).
  `Harmful pattern of substance use` (disorder) is the alternative.
- **Needlestick injury**: there is no site-less `Needle stick injury`, so
  `Accidental needle stick injury` (disorder) is used.
- **"Smells of alcohol"**: `Smell of alcohol on breath` (the page does not say breath).

## Checker issues left in place

- None.

## Questions for a clinician

- Should the possible diagnoses be gated on `Stress at work` (as here), or fire on any
  Identify-panel sign in any adult (builder B)? Or should they be dropped, because the page is
  addressed to health workers?
- Is `Stress at work` the right anchor, or should a health-worker occupation flag gate these rules?
- Should red-box findings (e.g. intoxication, suicidal thoughts) also raise the possible
  substance-misuse and depression diagnoses?
- Should aggression at work, or suicidal plans, in a staff member be `"Very urgent"`? The page says
  only "urgent assessment".
- Is `Heavy drinking session` acceptable for "drunk ≥ 4 drinks/session"?
- Does `Traumatic event` (event) capture the page's meaning, or should it be
  `Victim of psychological trauma` (finding)?
- Is `Substance misuse behavior` (finding) or `Harmful pattern of substance use` (disorder) the
  right concept for "substance misuse"?
- Should "Diagnosis of long-term condition" be encoded as `Chronic disease`, even though recency
  can't be expressed?
