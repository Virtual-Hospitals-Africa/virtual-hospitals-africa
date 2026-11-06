# Page 176 – Manage the patient requesting a termination of pregnancy (TOP): remaining questions

## Decisions made

- **Scope.** Only the lower part of the page ("Review the patient who had a TOP within the past 14
  days") has triage or diagnostic logic. The upper part (comorbidities → refer, gestation routing,
  medical/surgical TOP regimens, pain relief, return advice, follow-up) is management and routing and
  is not encoded. No `manage` or `measure` tasks: temperature, SBP, pulse and respiratory rate are
  routine vitals.
- **Trigger.** "Had a TOP within the past 14 days" is
  `(<= (onset (clinical_finding (snomed_concept "Induced termination of pregnancy" "disorder"))) (time_ago 14 days))`,
  using `<=` per the brief's rule for "within N". It is the trigger of the `check_for` task and the
  first conjunct of every rule.
- **Red box → Urgent.** "Yes" to any item of the review question → "Manage urgently 182" is encoded
  as `Urgent` (the page does not escalate further).
- **Adnexal mass criterion.** "adnexal mass (closed cervix and small uterus)" is encoded as adnexal
  mass AND closed cervix AND small uterus, in the Urgent rule and in the probable ectopic pregnancy
  rule ("If adnexal mass, ectopic pregnancy likely").
- **guarding/rebound abdominal tenderness** is split into `Abdominal guarding` OR `Rebound tenderness`.
- **SBP < 80** is encoded alone, as written (no shock finding on this page).
- **Incomplete TOP likely.** "enlarged uterus or open cervical os with bleeding/products of
  conception visible" is read as enlarged uterus OR (open os AND (bleeding OR products of conception
  at the os OR in the vagina)).
- The `due_to` of the probable incomplete TOP rule does not require "No" to the urgent question
  (the flowchart only reaches it after "No"). Both can fire together; the Urgent priority still applies.

## Could not model

- **Hb < 6**: no haemoglobin observable/unit in the language. Dropped from the Urgent `or`, so the
  Urgent rule fires **less often** than the page intends (a patient whose only finding is Hb < 6 is missed).
- The "No" precondition of the incomplete-TOP question (see above): the probable rule fires
  **more often** than the page intends (also when an urgent item is present).
- The pre-TOP comorbidity question and gestation thresholds lead only to referral/booking, not to a
  diagnosis; nothing to encode at triage level.

## SNOMED gaps

- "foul-smelling discharge": no exact concept; used `Offensive vaginal discharge` (finding), a child
  of `Finding of odor of vaginal discharge`.
- "bleeding" at the open cervical os: `Bleeding from cervix` does not exist; used `Bleeding from vagina` (finding).
- "adnexal mass": `Adnexal mass` does not exist as a name; used `Mass of uterine adnexa` (finding).

## Checker issues left in place

- None.

## Questions for a clinician

- Is "(closed cervix and small uterus)" part of the adnexal-mass criterion (as encoded), or just a
  description, so that an adnexal mass alone should make the patient urgent and ectopic pregnancy likely?
- Is a recent TOP recorded in the app as a finding with an onset date? If not, none of these rules
  fire. The complaint is not a common symptom or warning sign.
- Should "foul-smelling discharge" include non-vaginal discharge (e.g. wound), or is vaginal right?
