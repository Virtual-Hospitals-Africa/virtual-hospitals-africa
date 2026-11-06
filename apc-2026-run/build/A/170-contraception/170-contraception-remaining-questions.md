# Page 170 – Contraception: remaining questions

## Decisions made

- **The red box is management only.** "Give emergency contraception if patient had unprotected sex
  in past 5 days and does not want pregnancy" is the indication for a medicine/device (Copper IUD or
  levonorgestrel), followed by doses, method changes for weight/BMI/interacting drugs, a pregnancy
  test and a PEP pointer (119). It is not a "give urgent attention" box and states no priority or
  diagnosis, so no `check_for` task or priority evaluation is built from it. All seven red-box
  elements are accounted for as `management_step`.
- **Pregnancy suspicion encoded as a `possible` diagnosis.** The Pregnancy row says "if pregnancy
  suspected (nausea/breast tenderness/missed period when using combined oral contraceptive), check
  for pregnancy 174". This becomes `Diagnose possible pregnancy on combined oral contraceptive`:
  `(and Uses combined oral contraception (or Nausea, Tenderness of breast, Missed period))`, with a
  `check_for` task triggered by COC use that asks for the three signs.
- "When using combined oral contraceptive" is applied to all three signs.
- Diagnosis concept is `Pregnancy` (finding), as used elsewhere in VHA's rules, rather than the
  narrower `Pregnancy on oral contraceptive` (finding).
- Not encoded (cross-references or management): STI symptoms → 62, suitability → 172, missed
  pills/side effects → 171, BMI ≥ 25 → 156, BP ≥ 140/90 → 148 and COC/injectable avoidance,
  breast lumps → 55, axillary lumps → 42, menopause → 187, HIV → 124/126/119, cervical screening → 70,
  and the advice section. BP, weight and height are routine vitals, so no `measure` task.
- No shock, BP < 90/60 or time-comparison logic on this page.

## Could not model

- "Unprotected sex in past 5 days and does not want pregnancy" as the trigger for emergency
  contraception: management (no `manage` tasks this pass). A time window could be written as
  `(<= (onset X) (time_ago 5 days))` if a manage task is added later.
- "Advise patient to return for pregnancy test if next period is more than 7 days late": follow-up
  advice, not representable as a rule.
- Pregnancy test result (lab value): no observable in the language; not needed for the encoded rule.

## SNOMED gaps

- None. Confirmed with `snomed exists`: `Uses combined oral contraception` (finding), `Nausea`
  (finding), `Tenderness of breast` (finding), `Missed period` (finding), `Pregnancy` (finding).
- Not searched further because not encoded: unprotected sexual intercourse, does not want pregnancy.

## Checker issues left in place

- None.

## Questions for a clinician

- Should nausea or breast tenderness alone raise suspicion of pregnancy in a patient on injectable
  or implant contraception, or only on the combined pill as the page's parenthesis reads?
- Should the emergency-contraception box carry a triage priority (time-critical within 5 days)?
  The page gives none, so none is encoded.
- Should the STI symptom row (vaginal discharge, ulcers, lower abdominal pain) produce a
  `possible` STI diagnosis here, or is page 62's own logic enough?
