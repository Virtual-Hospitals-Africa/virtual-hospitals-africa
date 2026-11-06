# Page 34 – Self-harm or suicide: remaining questions

## Decisions made

- **Trigger.** The box header ("attempted/considered self-harm or suicide") is the trigger:
  `Suicide attempt` (event), `Intentionally harming self` (event) or `Thoughts of self harm`
  (finding; its descendants include `Suicidal thoughts`, `Planning suicide` and
  `Thoughts of deliberate self harm`). None of these is a recorded common symptom or warning sign.
- **Urgent for everyone in the box.** The header says to give urgent attention to every patient who
  has attempted or considered self-harm or suicide, so `Urgent: attempted/considered self-harm or
  suicide` fires on the trigger itself, and also on `(active_condition High suicide risk)`. The page
  does not escalate further ("Refer urgently"). `Aggressive behavior` is already a Very urgent
  warning sign on its own.
- **Q1 = Yes is modelled as high risk.** On the page, the Yes branch passes the ABC/overdose box and
  joins the same management box as "High risk of self-harm or suicide".
- **Current vs past.** Q2 ("current thoughts or plans to attempt suicide") uses `Suicidal thoughts`
  and `Planning suicide` with the `Current` qualifier. Q3 uses the onset of `Thoughts of self harm`
  within 1 month, and the onset of `History of attempted suicide` / `History of deliberate self
  harm` (situations) within 1 year. Following the brief, "within" is written with `<=`.
- **Past acts are situations, not events.** `Previous known suicide attempt` (event) is a
  descendant of `Suicide attempt`, so it would also match Q1 ("has attempted"). The history
  situations avoid that.
- **"Violent"** = `Aggressive behavior`, the VHA warning sign described as "Violent or agressive
  behavior". There is no `Violent behavior` concept.
- **High / low risk outcomes** are `probable` diagnoses of `High suicide risk` and `At low risk for
  suicide`. The page's wording is "self-harm or suicide"; SNOMED has no combined concept.
- No `manage` tasks. ABC, overdose (page 27), carbon monoxide oxygen, safety, sedation and referral
  are accounted for as management steps or cross-references.

## Could not model

- **Q3 = No → Low risk** (no thoughts/plans in the past month and no act in the past year). The
  language cannot express a time-limited negative such as "no thoughts in the past month". The
  low-risk rule therefore covers only Q1 = No, Q2 = No and Q4 = No, with each answer recorded
  explicitly as No. The result: `At low risk for suicide` is diagnosed **less often** than the
  page intends. A patient on the Q3 = No path gets no risk diagnosis, but is still Urgent through
  the trigger.
- **Onset of a history situation.** The past-year rule assumes the onset recorded on
  `History of attempted suicide` / `History of deliberate self harm` is the date of the act. If the
  app records the date of entry instead, the rule fires more often than the page intends.
- The "Assess / Advise the patient whose risk is low" sections are every-visit screening and
  advice that point to other pages (159, 165, 166, 98, 32, 33, 76, 191, 200). They are not modelled.

## SNOMED gaps

- "Violent": no `Violent behavior` (finding); used `Aggressive behavior`.
- "Uncommunicative": no exact concept; used `Does not communicate` (finding).
- "High/Low risk of self-harm or suicide": used `High suicide risk` / `At low risk for suicide`.
  Alternatives: `At increased risk for deliberate self harm`, `At increased risk of
  self-injurious behavior`.

## Checker issues left in place

- `PROBABLE DIAGNOSIS EVIDENCE NOT CHECKED FOR`:
  `(no (finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Suicidal thoughts" "finding") (snomed_concept "No" "qualifier value") (qualifier (snomed_concept "Current" "qualifier value"))))`.
  The positive Current-qualified form is in the `check_for`, but the gate does not match the `(no …)`
  form of a qualified finding to it. Dropping the qualifier would change the meaning of "current".
- `PROBABLE DIAGNOSIS EVIDENCE NOT CHECKED FOR`:
  `(no (finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Planning suicide" "finding") (snomed_concept "No" "qualifier value") (qualifier (snomed_concept "Current" "qualifier value"))))`.
  Same reason.

## Questions for a clinician

- Should a patient with no thoughts or plans in the past month and no act in the past year (the
  Q3 = No path) be recorded as low risk only after an explicit screen? The app cannot infer this
  path today.
- Does `Distress` (general) capture "distressed", or should it be `Mental distress`?
- Should high risk raise the priority above Urgent (e.g. Very urgent), given "Refer urgently" and
  "avoid leaving patient alone"?
