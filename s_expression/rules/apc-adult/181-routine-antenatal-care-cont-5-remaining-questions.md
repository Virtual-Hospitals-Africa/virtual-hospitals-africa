# Page 181 – Routine Antenatal Care (cont. 5): remaining questions

## Decisions made

- **Comment-only rules file.** The page's only red box, "Treat the HIV positive patient in labour",
  is a treatment box, not a "give urgent attention" box. Every line in it is a management step
  (continue/start ART, single-dose NVP + TLD, timing of doses, viral load request, infant
  prophylaxis via page 186) or a note (lab-form code, abbreviation key). Under the shared scope
  decision (no `manage` tasks, no medicines, doses or referral steps), nothing in it becomes a rule.
  All 8 red-box elements are accounted for in provenance as `management_step` or `figure_or_note`.
- **Outside sections not encoded.** "Advise the pregnant patient", "Treat the pregnant patient",
  the review schedule and the postnatal pointer (182) are education, medicines, vaccines and
  visit scheduling. The page has no "X likely" or "consider X" statement.
- The gestational-hypertension line "If proteinuria/new symptoms, refer urgently" is a referral step
  that points back to page 179's review; it was left as management, not turned into a priority rule.

## Could not model

- "Check viral load, regardless of when last done": viral load has no unit or observable in the
  language, so no `measure` task could be written even if lab ordering were in scope.
- Branching on "on ART" vs "not on ART" only selects medicines, so it has no triage effect to encode.

## SNOMED gaps

- None (no concepts used).

## Checker issues left in place

- None.

## Questions for a clinician

- Should "HIV positive patient in labour" raise a priority (e.g. so the intrapartum NVP + TLD is not
  missed when the patient is not on ART and delivery is imminent)? The page says "urgently if
  delivery is imminent" about giving the medicines, not about patient priority, so no priority rule
  was written.
- (From builder B.) Should the review schedule (20, 26, 30, 34, 36, 38, 40, 41 weeks) or "Educate about signs of
  early labour and pregnancy emergency" become triage rules elsewhere? This page gives them only as advice, so
  they were not encoded here.

## Reconciliation

- Builders A and B independently produced the same comment-only build with 0 conditions and accounted for all 8 red-box elements with the same reason categories. The final build takes A's files and adds B's clinician question.
