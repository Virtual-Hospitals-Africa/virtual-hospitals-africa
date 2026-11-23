# Page 158 – The mentally ill patient needing treatment or admission: remaining questions

## Decisions made

- **Risk findings, not events.** The red box gives urgent attention when "a delay in referral *may
  lead to*" harm, so its items are encoded as risk findings: `At increased risk of self-injurious
  behavior`, `At increased risk for suicide`, `High risk of harm to others`, `At increased risk for
  destructive behavior to property`. Suicide risk is listed separately because SNOMED does not put
  it under self-injury risk.
- **"Serious" harm to others → `High risk of harm to others`** rather than the broader parent
  `At increased risk for other-directed violence`.
- **Trigger** is `(clinical_finding (snomed_concept "Mental disorder" "disorder"))`, used in the
  task and as the first conjunct of the Urgent rule. No rule diagnoses mental disorder at
  `probable`, so `clinical_finding` is used, not `active_condition`. Mental disorder is not a
  recorded common symptom or warning sign, so the task fires only when one is recorded.
- **Priority is Urgent**, as written ("Give urgent attention"). Actual aggression is already a
  Very urgent warning sign (`Aggressive behavior`) and is not duplicated here.
- **No diagnosis rules**: the page has no "likely" / "consider" logic.
- **The MHCA flowchart** (consent, voluntary/assisted/involuntary user, MHCA 01/04/05/07/22/48
  forms, Court/MHRB orders) is legal routing and management. Documented in the flowchart file,
  not encoded.

## Could not model

- **Death** (red box): no SNOMED finding for risk of death from mental illness. Partly covered by
  suicide risk. The Urgent rule fires **less often** than the page intends (e.g. death through
  self-neglect or refusing food).
- **Irreversible health problem/s** (red box): no concept, and too open-ended to map to specific
  findings without clinical inference. The rule fires **less often** than the page intends.
- **"Loss of property"**: only destructive behaviour towards property has a concept, so other
  losses (e.g. money) are not covered.
- **"If a delay in referral may lead to …"** is a judgement of the health worker. It is expressed
  only by choosing risk findings.

## SNOMED gaps

- Risk of death / risk to life / danger to self: no results.
- Risk of irreversible health problem: none.
- Property loss (other than destructive behaviour): none.
- `High risk of harm to self` does not exist (only `Low risk of harm to self`). Used `At increased
  risk of self-injurious behavior` and `At increased risk for suicide` instead.

## Checker issues left in place

- None.

## Questions for a clinician

- Should the red box also fire on *actual* behaviour (self-injury, physical aggression, destroying
  property), or is the risk assessment enough? Actual aggression already triggers the Very urgent
  `Aggressive behavior` warning sign.
- Is suicide risk an acceptable proxy for "death", or should a self-neglect finding be added?
- Is `High risk of harm to others` too narrow for "serious harm to others"? The alternative is
  `At increased risk for other-directed violence`.
- Is "Mental disorder" the right trigger, or should the task also fire from a mental-health
  complaint recorded on the mental-health symptom pages?
- Should the trigger also accept specific disorders (psychosis, mania)? They are descendants of
  Mental disorder and match automatically; please confirm that is intended. (from build A)
- Is `Aggressive behavior` (a warning sign) meant to trigger this page's Urgent rule? The page only
  points aggression to page 35 as management. (from build A)

## Reconciliation

- Final build is build B. The only difference between the builds was B's extra
  `At increased risk for suicide` in the task and the Urgent rule; it was kept because suicide is
  the most serious form of "serious harm to self" and partly covers "Death", and SNOMED does not
  file it under self-injury risk.
