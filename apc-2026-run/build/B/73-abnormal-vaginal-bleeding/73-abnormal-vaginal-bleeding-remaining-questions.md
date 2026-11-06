# Page 73 – Abnormal vaginal bleeding: remaining questions

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
- **Recent delivery** = `Postpartum state`; **recent miscarriage / termination of pregnancy** = the
  disorder plus the `Recent` qualifier.
- **Sexual assault and/or rape** = `Victim of sexual aggression` (parent of the sexual-assault victim
  findings) and `Victim of rape`, both checked for and both evidence.
- **Priority** is `Urgent`, as on the page; the pointers (→177, →182, →32) are not followed.
- **No flowchart file.** The page's lower half (type of bleeding → treatment per contraceptive method)
  is a management tree with no "X likely"/"consider X" that the language can express, so no rule traces
  to it.
- **No diagnosis rules and no measure tasks.** The only "likely" on the page is "if Hb < 12, treat for
  likely anaemia", which needs haemoglobin.

## Could not model

- **Hb < 6** (red box): no haemoglobin observable/unit. Omitted from the Urgent `or`, so the rule fires
  **less often** than the page intends (a patient whose only danger sign is Hb < 6 is not flagged).
- **"If Hb < 12, treat for likely anaemia"** (heavy periods and spotting columns): same gap; no probable
  anaemia rule written.
- Bleeding-type classification (heavy/prolonged, irregular cycle < 21 or > 35 days, spotting, bleeding
  after sex), contraceptive-method branches, "new bleeding > 1 year after final period", TSH and
  referral criteria: management/routing, not encoded.

## SNOMED gaps

- "Pregnant" (finding): does not exist → `Pregnancy` (finding).
- "Pallor" (finding): does not exist → `Pallor of skin of face` (finding), the form already in VHA's
  vocabulary. `Pale complexion` also exists.
- "Weakness" (finding): does not exist → `Asthenia` (finding).

## Checker issues left in place

- None.

## Questions for a clinician

- Should Hb < 6 be captured some other way (e.g. a recorded "Severe anaemia" finding) until lab values
  are representable?
- Is `Postpartum state` the right reading of "recent delivery", and should "recent" be bounded (e.g.
  6 weeks)?
- Should vaginal bleeding in pregnancy be escalated above Urgent (page 177 may say so)?
