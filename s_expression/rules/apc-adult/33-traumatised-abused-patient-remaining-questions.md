# Page 33 – Traumatised/abused patient: remaining questions

## Decisions made

- **Presenting complaint.** Recorded as `Victim of abuse` (finding) or `Victim of psychological
  trauma` (finding). Descendants of `Victim of abuse` include victims of sexual abuse (so
  `Victim of forced sexual activity`), physical assault, and physical, emotional, psychological and
  verbal abuse, so recording any of these also counts. `Victim of trauma` was rejected because it
  also covers vehicle, sports and aircraft accident victims. Neither concept is a recorded common
  symptom or warning sign yet.
- **"Suspect abuse if …"** becomes a `possible` diagnosis of `Victim of abuse` from `Abnormal
  behavior` ("behaviour seems strange"). As on page 20, it pre-screens and also triggers the
  `check_for` task. Disclosure is the trigger finding itself.
- **Red box** → `Urgent`, structured as `(and <abuse context> (or …))`.
  - Sexual assault/rape within 5 days (woman) or 3 days (man): `Victim of forced sexual activity`
    with `(<= (onset …) (time_ago 5 days))` paired with `Female`, and 3 days paired with `Male`.
    `<=` is used, as the brief requires for time comparisons.
  - Injuries needing attention: `Traumatic injury` (the warning-sign concept).
  - Suicidal thoughts/plans, overdose or self harm: `Suicidal thoughts`, `Planning suicide`,
    `Overdose`, `Self-injurious behavior`.
- **"X likely" → probable rules.**
  - Sexual assault/rape: `Victim of forced sexual activity` → `Victim of sexual aggression`
    (parent of `Victim of rape` and the sexual-assault findings).
  - Physical abuse: abuse context AND any of physical assault, scars, multiple bruising →
    `Victim of physical abuse`.
  - Emotional/verbal/psychological abuse: abuse context AND any of intimidation, threats,
    or severe withdrawn behaviour / fearful mood / anxiety → `Victim of emotional abuse`. One rule,
    not three. "Excessively" is written as the `Severe (severity modifier)` qualifier.
  - The physical and emotional rules require the abuse context because the page applies them only
    to the traumatised/abused patient. Without it, a scar or anxiety alone would diagnose abuse in
    any patient.
- No `measure` tasks. The pregnancy test has no unit, and the drinks-per-session question routes
  to page 165.

## Could not model

- **Patient sex.** The language has no patient-sex predicate. Sex is checked for as the SNOMED
  findings `Female` / `Male`. If neither is recorded, the recent-sexual-assault branch never
  fires, so it fires *less* often than the page intends.
- **"Needing attention"** (injuries): any recorded traumatic injury counts, so the rule fires
  *more* often than the page intends.
- **"Excessively"** withdrawn/fearful/anxious: written as `Severe (severity modifier)`. If the
  clinician records these without a severity, the emotional-abuse rule fires *less* often.
- **"Bruises of different ages"**: approximated by `Multiple bruising` (fires *more* often, since
  same-age bruises also count).
- **"Examination contradicts history"** and **"abuse clear on examination"** (suspect abuse): not
  representable as findings. Not encoded, so the possible rule fires *less* often.
- **Management, routing and advice** (J88 form, reporting to police, Thuthuzela referral,
  mandatory reporting, pregnancy test, contraception, paracetamol, review in 1 month): out of
  scope as management steps.
- Pointers to other pages (injuries 30, genital symptoms 62, sleep 99, mental health 98,
  substance use 165, pregnancy 175, contraception 170) are cross-references only.

## SNOMED gaps

- "Unusual wounds": no concept. Not encoded (`Wound` would match any wound).
- "Harassment" (non-sexual): only `Sexual harassment` exists. Not encoded.
- "Being ridiculed/controlled", "insulted": no concept. Not encoded. `Victim of verbal abuse`
  was not used as evidence because it is itself one of the diagnoses the page names.
- "Bruises of different ages": no concept. `Multiple bruising` used instead.
- "Any other unwelcomed behaviour, manipulation or violation" → "consider other types of abuse":
  no concepts. The `possible` abuse rule from strange behaviour covers it only partly.

## Checker issues left in place

- None.

## Questions for a clinician

- Does the app record patient sex in a way that `Female` / `Male` findings would match? If not,
  should the recent-assault window use 5 days for everyone (over-triaging men on days 4–5)?
- Should any recorded traumatic injury make an abused patient Urgent, or only injuries that meet
  page 30's urgent criteria?
- Is `Victim of sexual aggression` the right diagnosis concept for "sexual assault/rape", or
  should it be `Victim of rape`?
- Should emotional, verbal and psychological abuse be three separate diagnoses?
- Is `Severe (severity modifier)` the right reading of "excessively" withdrawn/fearful/anxious?
- `Intimidation` (finding) sits under `Aggressive behavior` in SNOMED, so it may describe the
  patient intimidating others rather than being intimidated. Is it acceptable evidence for
  "history of … intimidation", or should `Victim of bullying` / `Victim of threats` alone be used?
- Should scars and bruising count only in a patient already recorded as abused (the current gate),
  or on their own?
