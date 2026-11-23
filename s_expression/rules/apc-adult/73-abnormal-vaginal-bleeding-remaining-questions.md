# Page 73 – Abnormal vaginal bleeding: remaining questions

Final build, reconciled from builders A and B (base B). See `reconcile.json`.

## Decisions made

- **Trigger** is `(clinical_finding "Bleeding from vagina")`, the parent of "Abnormal vaginal bleeding",
  so heavier/abnormal descendants also match. Vaginal bleeding is not a recorded common symptom or
  warning sign, so the task fires only when a health worker records it.
- **Shock/SBP < 80** is encoded exactly as the page writes it: `(or Shock (< SBP 80))`. Footnote 1
  ("If SBP < 80, pulse ≥ 100, respiratory rate > 30, confusion/restlessness, weakness, shock likely")
  was **not** turned into a probable Shock rule (decision for all pages: no shared definition of shock;
  the footnote also does not say whether one or all of the signs are needed).
- **Pallor group**: read as pallor **and** any of pulse ≥ 100, respiratory rate ≥ 30, dizziness,
  weakness or chest pain (the page says "Pallor with …"). The box says RR **≥ 30**; the footnote says
  **> 30**; the box is followed.
- **Pallor** is `Pallor of skin of face` (the form VHA's vocabulary uses most); builder A used
  `Pale complexion`, which also exists. Neither is an is-a relative of the other.
- **Recent delivery** = `Postpartum state`; **recent miscarriage / termination of pregnancy** = the
  disorder plus the `Recent` qualifier. The page gives no time window.
- **Sexual assault and/or rape** = `Victim of sexual aggression` (parent of the sexual-assault victim
  findings) and `Victim of rape` (its child, listed explicitly because the page names rape), both
  checked for and both evidence.
- **Priority** is `Urgent`, as the box says "Give urgent attention"; the pointers (→177, →182, →32)
  are not followed.
- **Flowchart file** kept (from builder A) to document the page's structure; the lower half
  (type of bleeding → treatment per contraceptive method) is a management tree with no
  "X likely"/"consider X" that the language can express, so no rule traces to it.
- **No diagnosis rules and no measure tasks.** The only "likely" on the page is "if Hb < 12, treat for
  likely anaemia", which needs haemoglobin. "Shock likely" sits in a footnote and is excluded by the
  shock decision.

## Could not model

- **Hb < 6** (red box): no haemoglobin observable/unit. Omitted from the Urgent `or`, so the rule fires
  **less often** than the page intends (a patient whose only danger sign is Hb < 6 is not flagged).
- **"If Hb < 12, treat for likely anaemia"** (heavy periods and spotting columns): same gap; no probable
  anaemia rule written (without Hb it would fire on every heavy-bleeding patient).
- **"Recent"** has no time window on the page; a qualifier is used rather than an onset comparison.
- Bleeding-type classification (heavy/prolonged, irregular cycle < 21 or > 35 days, spotting, bleeding
  after sex), contraceptive-method branches, "new bleeding > 1 year after final period", TSH and
  referral criteria: management/routing, not encoded.

## SNOMED gaps

- "Pregnant" (finding): does not exist → `Pregnancy` (finding).
- "Pallor" (finding): does not exist → `Pallor of skin of face` (finding). Alternatives:
  `Pale complexion`, `Pale conjunctiva`.
- "Weakness" (finding): does not exist → `Asthenia` (finding).
- "Sexual assault" and "Rape" exist only as `event`; "Victim of sexual assault" (finding) does not
  exist → `Victim of sexual aggression` and `Victim of rape` (findings).

## Checker issues left in place

- None.

## Questions for a clinician

- Is "Pallor with pulse ≥ 100, respiratory rate ≥ 30, dizziness/weakness or chest pain" meant as pallor
  plus any one of these (as encoded), or as separate criteria?
- Is facial-skin pallor the right recorded form for pallor, or complexion, conjunctival or palmar pallor?
- Should Hb < 6 be captured some other way (e.g. a recorded "Severe anaemia" finding) until lab values
  are representable?
- Is `Postpartum state` the right reading of "recent delivery", and how recent is "recent"
  delivery/miscarriage/termination (e.g. within 6 weeks)?
- Should vaginal bleeding in pregnancy be flagged urgent at any gestation, or escalated above Urgent
  (page 177 may say so)?
