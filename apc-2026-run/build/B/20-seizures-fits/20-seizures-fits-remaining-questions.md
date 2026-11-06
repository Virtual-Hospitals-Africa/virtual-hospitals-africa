# Page 20 – Seizures/fits: remaining questions

## Decisions made

- **One task and one priority rule.** The red box header ("Give urgent attention to the patient who
  is unconscious and fitting") is the only triage logic on the page. `Seizure` (finding), the
  recorded warning sign, triggers `Check for urgent seizure/fit conditions`, which checks for
  `Unconscious`. `Urgent: unconscious and fitting` is `(and Seizure Unconscious)`.
- **Urgent, not Emergency.** The page says "urgent attention". The `Seizure` warning sign already
  carries Emergency on its own, so in practice the patient is already escalated; this rule keeps the
  page's own wording.
- **No diagnosis rules.** The page has no "X likely" or "consider X".
- **No measure task.** Fingerprick glucose is a routine vital; its thresholds (< 3, < 4 if
  diabetes, unable to measure) route to page 19 and are encoded there, not here.
- Head injury (→ 30) and pregnancy ≥ 20 weeks up to 1 week postpartum (→ 177) are pointers,
  accounted for as `cross_reference_only`.
- No shock or BP < 90/60 wording on this page.

## Could not model

- **"If fit has lasted ≥ 5 minutes"**: the language has no seizure-duration observable, and
  `(onset Seizure)` records when the finding was entered, not how long the fit has lasted. It is
  also a medication threshold (management). Not encoded.
- "Still fitting after 5 minutes" / "Patient stops fitting": treatment-response routing.
- All medicines (midazolam, diazepam, levetiracetam), oxygen, recovery position, IV access, airway
  support, intubation, referral and restarting antiseizure medication: management, excluded by scope.

## SNOMED gaps

- None. `Seizure` (finding) and `Unconscious` (finding) confirmed with `snomed exists`.

## Checker issues left in place

- None.

## Questions for a clinician

- Should "unconscious" here also accept a reduced level of consciousness (e.g. AVPU P/U), or only
  frank unconsciousness? A fitting patient is often not assessable for consciousness separately.
- Should a fit lasting ≥ 5 minutes (status epilepticus) raise the priority beyond Urgent? The page
  says "refer urgently" but does not escalate the triage level.
