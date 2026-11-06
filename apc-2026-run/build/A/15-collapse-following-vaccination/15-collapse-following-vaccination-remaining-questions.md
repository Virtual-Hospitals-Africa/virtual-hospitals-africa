# Page 15 – Collapse following vaccination: remaining questions

## Decisions made

- **The red box is a pointer** ("Treat as anaphylaxis →28"), but the page has its own triage logic
  outside it: a sudden-collapse column ending in "**Fainting episode** likely" and a
  delayed-collapse column ending in the red box. Both are encoded; the red-box element is cited by
  the anaphylaxis diagnosis rather than listed as `cross_reference_only`.
- **Trigger:** `(clinical_finding Collapse)`, quoted from the page title (there is no box header).
  Vaccination is recorded by checking for `Vaccination given` (situation).
- **"Fainting episode likely" → probable `Syncope` (finding)**; "Fainting" is a synonym of that
  concept. `Vasovagal syncope` was considered but the page does not name the mechanism.
- **"Treat as anaphylaxis" → probable `Anaphylaxis`**, so that page 28's anaphylaxis rules
  (urgency, management) take over. No priority evaluation is written on this page.
- **Any one delayed-column feature** (BP < 90/60, pulse > 120, wheeze, stridor, cough, swelling,
  rash) with collapse after vaccination gives probable anaphylaxis. The page lists the features as a
  picture without a count; the sudden column explicitly has "no other signs or symptoms".
- **The two rules are mutually exclusive.** Fainting requires recorded absence of wheeze, stridor,
  cough, swelling and rash, and SBP ≥ 90, DBP ≥ 60 and pulse ≤ 120. VHA's evidence code does not
  support `not` (the gate failed with `Not supported not`), so the complement is written as explicit
  `>=` / `<=` measurements.
- BP < 90/60 is systolic < 90 **or** diastolic < 60 (Will's convention).
- "If no pulse/not breathing, start CPR ↻16" is not encoded here: cardiac arrest and obstructed
  airway are already Emergency warning signs, and page 16 holds the CPR logic.

## Could not model

- **Timing relative to vaccination**: "at the time of vaccination (before, during or immediately
  after)" vs "5-10 minutes after vaccination (up to 1 hour)". The language has no comparison between
  two events' times. Both rules fire on any recorded vaccination, so they fire **more often** than the
  page intends (e.g. a collapse long after vaccination).
- **Duration of loss of consciousness** (20 s–1 min vs > 1 min) and whether it is **relieved by lying
  down and raising legs**: no event duration or response-to-manoeuvre form. Not encoded; loss of
  consciousness is therefore not checked for (it would be unused evidence).
- **"BP … remains low" / "briefly low but rapidly normal again"**: persistence over repeated readings
  is not representable; a single reading is used. A low reading taken during a brief vasovagal dip
  would route to anaphylaxis instead of fainting (fainting fires **less often**, anaphylaxis
  **more often**).
- "Pulse may be slow" and "breathing … may be rapid and deep (hyperventilation)" are non-discriminating
  ("may") and are not encoded.
- Management, "Refer if …" (head injury, heart condition, unusual symptoms) and AEFI reporting are
  management/referral steps, out of scope.

## SNOMED gaps

- None. All concepts confirmed with `snomed exists`: Collapse, Vaccination given (situation),
  Wheezing, Stridor, Cough, Swelling, Eruption (morphologic abnormality), Syncope, Anaphylaxis,
  Systolic/Diastolic blood pressure, Pulse, function.

## Checker issues left in place

- None.

## Questions for a clinician

- Should a single delayed-column feature (e.g. cough alone, or pulse > 120 alone) after a
  post-vaccination collapse be enough to treat as anaphylaxis, or should several be required?
- A BP taken during the brief vasovagal dip may be < 90/60. Should the fainting diagnosis tolerate a
  low first reading if it normalises, and how should repeat BP be recorded?
- Is the collapse trigger acceptable, given it will also fire this check for collapses unrelated to
  vaccination (the vaccination question is then answered "No" and neither rule fires)?
