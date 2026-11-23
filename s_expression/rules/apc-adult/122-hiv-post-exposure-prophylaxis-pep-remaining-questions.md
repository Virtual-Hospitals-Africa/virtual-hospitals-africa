# Page 122 – HIV: post-exposure prophylaxis (PEP): remaining questions

## Decisions made

- **One check task and one Urgent priority rule.** The page has no "X likely" or "consider X"
  wording, so there are no diagnosis rules. Everything after the "either of" question (first aid,
  HIV status, PEP, bloods, hepatitis B PEP, follow-up) is management and is accounted for as
  `management_step` or `flowchart_routing`.
- **Urgency comes from the header alone.** "Give urgent attention to the patient exposed to
  infectious fluid" with "either of" the two bullets → Urgent when any listed fluid exposure, or a
  human bite with bleeding, is recorded. The follow-on question (sexual contact, sharps injury,
  splash) is not required for urgency; it only chooses between management branches, so it is not
  checked for (it would otherwise be a checked-for finding that no rule uses).
- **Trigger.** Exposure to `Body fluid` (substance) is the presenting complaint; `Human bite - wound`
  is a second trigger so the bite bullet can open the check. Exposure findings use the gold page 20
  pattern `(finding (snomed_concept "Exposure to (contextual qualifier)" …) <substance>)`.
- **"Human bite severe enough to cause bleeding"** = `(and Human bite - wound, Bleeding)`.
- **Semen** encoded as `Seminal fluid` (substance); there is no "Semen" substance concept.

## Could not model

- **"≤ 72 hours since exposure (ideally within 1 hour)"**, the 7 and 14 day hepatitis B windows,
  and "within 3 days" review: they time management steps, not triage, so they are out of scope.
- **Route of exposure** (sexual contact, sharps injury, splash to eye/open wound/mouth/nose):
  management routing only; SNOMED has `Sexual exposure` (finding) and `Sharps injury` (disorder) if
  a later pass models PEP eligibility.
- **HIV status branches, source testing, lab tests** (HIV ELISA, HBsAb titre ≥ 10 / < 10, eGFR,
  FBC): lab values have no unit/observable in the language, and these steps are management.
- **Non-infectious fluids** (tears, non-bloodstained saliva, sweat, urine, stool): the trigger uses
  the general `Body fluid`, so exposure to those fluids still opens the check task; it does not make
  the patient Urgent, because the priority rule lists only the infectious fluids.

## SNOMED gaps

- **Blood-stained fluid/tissue**: no substance concept. `Serosanguinous fluid` (substance) exists but
  is a specific serum/blood mixture, so it was not used. This bullet item is not encoded; the rule
  fires less often than the page intends for an exposure recorded only as blood-stained fluid or
  tissue (exposure to `Blood` is still covered).
- **Semen**: no "Semen" substance; `Seminal fluid` used.
- No bite-specific bleeding concept; generic `Bleeding` (finding) used with the bite.

## Checker issues left in place

- None.

## Questions for a clinician

- Should urgency depend on the route question (sexual contact, sharps injury, splash), or, as
  encoded, on any exposure to a listed fluid?
- Should exposure to blood-stained fluid/tissue be recorded as exposure to `Blood`?
- Is exposure to infectious fluid going to be a recorded complaint in the app? It is not among the
  common symptoms or warning signs, so the check task only fires if someone records the exposure.
- Should a bleeding human bite be Urgent even though the page says no HIV PEP is needed for it
  (hepatitis B prevention only)? Encoded as Urgent, because it is one of the "either of" items
  under "Give urgent attention".
- Should the 72-hour PEP window (and the 7/14-day hepatitis B windows) affect triage priority?
  Not encoded; the page uses them only to time management.

## Reconciliation note

- Builder A also required, in the Urgent rule, a separately recorded exposure to `Body fluid` or a
  human bite wound (the trigger) as an `and` gate. The final build follows builder B: the page's
  "either of" makes either bullet sufficient on its own.
