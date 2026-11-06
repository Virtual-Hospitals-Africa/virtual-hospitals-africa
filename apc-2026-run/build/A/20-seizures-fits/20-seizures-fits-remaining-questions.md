# Page 20 – Seizures/fits: remaining questions

## Decisions made

- **Emergency, not Urgent.** The red box says "Give urgent attention to the patient who is
  unconscious and fitting". The recorded adult warning sign `Seizure` already carries
  Emergency, and Will's briefing allows Emergency where the warning sign carries that level, so the
  priority rule `Emergency: unconscious and fitting (seizures/fits)` is Emergency. An Urgent rule
  would rank below the warning sign and change nothing.
- **Trigger is `Seizure` (finding)**, the recorded warning sign for "fitting". It needs no
  `check_for`. The task checks for `Unconscious` (finding).
- **`Unconscious` rather than `Decreased level of consciousness`.** The page says "unconscious";
  the broader warning-sign concept also covers drowsiness.
- **Pointer items not checked for.** Head injury (→ 30), glucose < 3 / < 4 if diabetes / unable to
  measure (→ 19) and pregnancy ≥ 20 weeks up to 1 week postpartum (→ 177) only route to other
  pages. No rule on this page would consume them, so they are `cross_reference_only`. Glucose is a
  routine vital, so it gets no `measure` task.
- **"Fit has lasted ≥ 5 minutes" not encoded.** It only gates medication and urgent referral
  (management/referral, out of scope). The page names no diagnosis (e.g. status epilepticus), so no
  rule was invented.
- All medication, airway, oxygen and positioning steps are `management_step`.

## Could not model

- The timed medication sequence ("expect a response within 5 minutes", "if still fitting after 5
  minutes") is management, outside the rule language's scope here.

## SNOMED gaps

- None. `Seizure` (finding) and `Unconscious` (finding) confirmed with `snomed exists`.

## Checker issues left in place

- None.

## Questions for a clinician

- Is Emergency right, or should this page's rule be Urgent as worded? (The Seizure warning sign
  makes any fitting patient Emergency anyway.)
- Should "unconscious" also match an AVPU score of `Unresponsive` or `Reacts to pain`? These are
  recorded as different concepts and won't satisfy the rule unless they are descendants of
  `Unconscious`.
- Should a fit lasting ≥ 5 minutes be recorded as status epilepticus (`Status epilepticus`
  finding exists in VHA's vocabulary)? The page doesn't name it.
