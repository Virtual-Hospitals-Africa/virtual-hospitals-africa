# Page 34 – Self-harm or suicide: remaining questions

## Decisions made

- **Trigger.** The presenting complaint ("attempted/considered self-harm or suicide") is not a recorded
  common symptom or warning sign. The `check_for` task fires on any of `Suicide attempt` (event),
  `Intentionally harming self` (event), `Suicidal thoughts` or `Thoughts of self harm`.
- **Urgent only for attempted or high risk.** Q1 = Yes → `Urgent: attempted self-harm or suicide`.
  The high-risk outcome (Q2 = Yes, or Q3 = Yes and Q4 = Yes) → probable `High suicide risk` →
  `Urgent: high risk of self-harm or suicide`. Both lead to "Refer urgently" on the page. Nothing
  on the page escalates to Emergency/Very urgent. Low risk ("Manage below") gets no priority and no rule.
- **Current vs past.** Q2 "current thoughts or plans" uses the `Current` qualifier. Q3's past acts
  use the `In the past` qualifier so that they are not read as the current attempt of Q1.
- **Time windows.** "in past month" → `(<= (onset X) (time_ago 1 months))`; "in past year" →
  `(<= (onset X) (time_ago 1 years))`, following the brief's convention that "within" uses `<=`.
- **Violent** → `Aggressive behavior` (the warning-sign concept, described "Violent or aggressive
  behavior"). **Uncommunicative** → `Does not communicate`. **Distressed** → `Distress`.
- Management (ABC 18, overdose 27, carbon monoxide oxygen, safety, sedation 35, referral,
  involuntary admission 158) and the low-risk assess/advise sections are not modelled (no `manage` tasks).

## Could not model

- **Low risk of self-harm or suicide** is not a rule. Writing it would need `(no …)` answers
  for every high-risk criterion. It has no triage priority on the page.
- **Onset of past events.** The past-month and past-year branches only work if the health worker
  records the onset of the thought or act when it happened, not when it was recorded. If onset
  is always the recording time, these branches fire for any recorded past ideation or act. That
  over-calls high risk (the rule fires more often than the page intends) for acts older than one year.
- The current attempt (Q1) uses the unqualified `Suicide attempt`/`Intentionally harming self`. If
  unqualified evidence matches records qualified `In the past`, a past act would also make the
  patient Urgent through Q1 (more often than the page intends).

## SNOMED gaps

- No "Violent behavior", "Violence" or "Uncommunicative" finding. Used `Aggressive behavior`
  and `Does not communicate` instead.
- No high-risk *self-harm* concept. `High suicide risk` (finding) is used for "High risk of
  self-harm or suicide".

## Checker issues left in place

- None.

## Questions for a clinician

- Should every patient who has *considered* self-harm or suicide be Urgent, as the box header says,
  even when the flowchart ends at low risk?
- Should a self-harm act more than a year ago, or ideation more than a month ago, still raise the
  patient's priority in any way?
- How should staff record a past attempt so that it is not read as a current one: the `In the past`
  qualifier, or a history record?
