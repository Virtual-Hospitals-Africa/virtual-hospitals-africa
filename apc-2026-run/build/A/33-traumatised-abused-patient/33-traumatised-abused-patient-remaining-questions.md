# Page 33 – Traumatised/abused patient: remaining questions

No flowchart file: the page is a red box plus an Assess table of if-then statements, with no
Yes/No branching.

## Decisions made

- **Presenting complaint.** "Traumatised/abused patient" is not a recorded common symptom or warning
  sign. The `check_for` task is triggered by `Victim of abuse` (finding) or `Victim of psychological
  trauma` (finding), or by the page's own possible diagnosis of `Victim of abuse` ("Suspect abuse").
  Descendants match, so `Victim of rape`, `Victim of physical assault` etc. also trigger it.
- **Red box → Urgent**, as `(and complaint (or …))`:
  - "Sexual assault/rape within last 5 days" → `(<= (onset (clinical_finding Sexual assault)) (time_ago 5 days))`.
    `Rape` (event) is-a `Sexual assault` (event).
  - "Injuries needing attention" → `Traumatic injury` (disorder), a recorded warning sign.
  - "Suicidal thoughts/plans, overdose or self harm" → `Suicidal thoughts`, `Planning suicide`,
    `Overdose` (is-a `Poisoning`), `Self-injurious behavior`.
- **"X likely" → probable rules:**
  - Sexual assault/rape likely → `Victim of sexual aggression` (parent of `Victim of rape`) from
    `Sexual assault` (event) ("forced to do any form of sexual act without consent").
  - Physical abuse likely → `Victim of physical abuse` from a history of physical assault (`Victim of
    physical assault`) alone, or scars / multiple bruising **in the traumatised/abused patient**.
  - Emotional/verbal/psychological abuse likely → `Victim of emotional abuse` from `Intimidation` or
    `Victim of threats` alone, or severe withdrawn / fearful mood / anxiety **in the
    traumatised/abused patient**. "Excessively" is written as the `Severe (severity modifier)` qualifier.
  - Context gate: findings that are abuse in themselves stand alone. Non-specific signs (scars,
    bruising, anxiety) are gated on the complaint, because the Assess table applies only to the
    traumatised/abused patient.
- **"Suspect abuse if …" → possible rule** `Victim of abuse` from `Strange and inexplicable behavior`
  (the only representable limb).
- Cross-references (injuries 30, genital symptoms 62, sleep 99, mood 98, substance use 165,
  pregnancy 175/170) and all advise/treat/reporting content are not encoded. They are routing or
  management.

## Could not model

- **Patient sex.** The language has no patient sex. Page: 5 days for a woman, 3 days for a man. The
  rule uses 5 days for everyone, so for men it **fires more often** than the page intends (assault
  3–5 days ago).
- **"Injuries needing attention".** No qualifier expresses "needing attention". Any traumatic
  injury counts, so the rule **fires more often**.
- **"Examination contradicts history", "abuse clear on examination"** (Suspect abuse). There is no
  concept for either, so they are not encoded. Disclosure is the complaint itself.
- **"Consider other types of abuse"** (unwelcomed behaviour, manipulation or violation). There is no
  fitting finding, so no rule is written. It **fires less often** (never).
- **Substance use** "≥ 4 drinks/session in the past year". This is routing to page 165, so it is not
  encoded.
- **Pregnancy test.** It has no measurement unit, and it is routing to pages 175/170.

## SNOMED gaps

- **"Unusual wounds".** SNOMED has no "unusual" qualifier, and a plain `Wound` would fire on any
  wound, so this is not encoded. The physical-abuse rule **fires less often** for this limb.
- **"Bruises of different ages".** `Multiple bruising` (finding) is used, and the "different ages"
  part is lost.
- **Harassment, being ridiculed/controlled, insulted.** There is no general concept (only `Sexual
  harassment` and `Harassment by landlord`), so these are not encoded. The emotional-abuse rule
  **fires less often**.
- **"Traumatised".** `Victim of psychological trauma` is used.

## Checker issues left in place

- None.

## Questions for a clinician

- Should "sexual assault/rape within 3 days if man" be enforced once patient sex is available to
  rules? The rule currently uses 5 days for all.
- Is `Victim of sexual aggression` the right label for "sexual assault/rape likely", or would
  `Victim of sexual abuse` / `Victim of rape` be preferred?
- One label (`Victim of emotional abuse`) stands for emotional/verbal/psychological. Should verbal
  and psychological abuse be separate diagnoses?
- Should scars and bruising count only in a patient already recorded as abused (the current gate),
  or on their own?
