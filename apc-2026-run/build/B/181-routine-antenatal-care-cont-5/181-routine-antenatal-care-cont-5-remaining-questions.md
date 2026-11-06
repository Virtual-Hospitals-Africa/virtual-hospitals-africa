# Page 181 – Routine antenatal care (cont. 5): remaining questions

## Decisions made

- **There are no rules on this page.** The only red box, "Treat the HIV positive patient in labour", holds only
  management steps: continuing ART, checking viral load, single-dose NVP + TLD, timing, starting ART
  the next day (126) and infant prophylaxis (186). Medicines, doses and referral steps are out of scope
  (no `manage` tasks), so each element is accounted for as `management_step`, with the form-code note and the
  abbreviation legend as `figure_or_note`.
- The rest of the page (Advise / Treat the pregnant patient, the review schedule, the postnatal pointer to 182)
  is advice and treatment, with no "X likely", "consider X" or urgent-attention criteria. So no
  diagnosis or priority rules were written. The `.lisp` file contains only the `;; Page 181` comment.
- I considered and rejected a `check_for` task for ART status in an HIV-positive patient in labour: nothing on the page
  would use it as evidence, and it would be a management prompt rather than triage.

## Could not model

- "Check viral load": a lab test, with no unit or observable in the language, and a management
  action. Not encoded.
- Labour, ART status and timing ("early labour", "delivery imminent") drive only management choices here.

## SNOMED gaps

- None. No concepts were needed.

## Checker issues left in place

- None.

## Questions for a clinician

- Should the review schedule (20, 26, 30, 34, 36, 38, 40, 41 weeks) or "Educate about signs of …
  pregnancy emergency" become triage rules elsewhere? This page gives them only as advice, so they were not
  encoded here.
