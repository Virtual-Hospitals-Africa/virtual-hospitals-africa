# Page 20 – Seizures/fits: remaining questions

Final (reconciled) build. Base: builder A. Both builders agreed on every condition; they differed
only on the priority level (A Emergency, B Urgent). See `reconcile.json`.

## Decisions made

- **One task and one priority rule.** The red box header ("Give urgent attention to the patient who
  is unconscious and fitting") is the only triage logic on the page. `Seizure` (finding), the
  recorded warning sign for "fitting", triggers `Check for unconsciousness in the fitting patient`,
  which checks for `Unconscious` (finding). The priority rule is `(and Seizure Unconscious)`.
- **Emergency, not Urgent (reconciled; unsettled).** The page says "urgent attention". Will's
  briefing allows Emergency where the corresponding warning sign already carries that level, and the
  `Seizure` warning sign is Emergency, so the rule `Emergency: unconscious and fitting
  (seizures/fits)` is Emergency. An Urgent rule would rank below the warning sign and change nothing.
  Builder B kept the page's "Urgent"; this is listed for a clinician below.
- **`Unconscious` rather than `Decreased level of consciousness`.** The page says "unconscious";
  the broader concept also covers drowsiness.
- **No diagnosis rules.** The page has no "X likely" or "consider X", and names no diagnosis
  (e.g. status epilepticus), so none was invented.
- **No measure task.** Fingerprick glucose is a routine vital; its thresholds (< 3, < 4 if
  diabetes, unable to measure) only route to page 19.
- **Pointer items not checked for.** Head injury (→ 30), low glucose (→ 19) and pregnancy ≥ 20
  weeks up to 1 week postpartum (→ 177) only route to other pages; they are `cross_reference_only`.
- All medication, airway, oxygen, positioning and referral steps are `management_step`.

## Could not model

- **"If fit has lasted ≥ 5 minutes"**: the language has no seizure-duration observable, and
  `(onset Seizure)` records when the finding was entered, not how long the fit has lasted. It is
  also only a medication/referral threshold (management). Not encoded.
- The timed medication sequence ("expect a response within 5 minutes", "if still fitting after 5
  minutes", "patient stops fitting") is treatment-response routing, outside scope.

## SNOMED gaps

- None. `Seizure` (finding) and `Unconscious` (finding) confirmed with `snomed exists`.

## Checker issues left in place

- None.

## Questions for a clinician

- Is Emergency right, or should this page's rule be Urgent as worded ("give urgent attention")?
  The two builders split on this. (The Seizure warning sign makes any fitting patient Emergency
  anyway.)
- Should "unconscious" also match a reduced level of consciousness, e.g. AVPU `Reacts to pain` or
  `Unresponsive`? These are recorded as different concepts and won't satisfy the rule unless they
  are descendants of `Unconscious`. A fitting patient is often not assessable for consciousness
  separately.
- Should a fit lasting ≥ 5 minutes be recorded as status epilepticus (`Status epilepticus` finding
  exists in VHA's vocabulary)? The page doesn't name it and does not escalate the triage level for
  it ("refer urgently" only).
