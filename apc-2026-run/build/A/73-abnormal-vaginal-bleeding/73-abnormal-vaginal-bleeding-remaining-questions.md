# Page 73 – Abnormal vaginal bleeding: remaining questions

## Decisions made

- **Trigger**: `Bleeding from vagina` (finding), the general concept; its child `Abnormal vaginal bleeding` matches as a descendant. Vaginal bleeding is not a recorded common symptom or warning sign, so the check_for task's trigger is the most natural clinical finding.
- **Shock/SBP < 80** encoded exactly as written: an `or` of `Shock` (disorder) and systolic BP < 80. Footnote 1 ("If SBP < 80, pulse ≥ 100, respiratory rate > 30, confusion/restlessness, weakness, shock likely") is not built into a shock definition (all-pages decision).
- **Pallor** read as "Pallor **with** any of pulse ≥ 100, respiratory rate ≥ 30, dizziness/weakness or chest pain": `(and Pale complexion (or …))`.
- **Recent delivery** as `Postpartum state`; **recent miscarriage / termination** as the disorder with the `Recent` qualifier. The page gives no time window.
- **Sexual assault and/or rape** as `Victim of sexual aggression` (finding), the parent of `Victim of rape` and the sexual-assault-victim findings.
- **Priority level** `Urgent`, as the box says "Give urgent attention".
- **No diagnosis rules.** The only "likely" on the page is "Hb < 12, treat for likely anaemia" (needs Hb). "Shock likely" sits in a footnote and is excluded by the shock decision. The non-urgent approach (bleeding types, STI assessment, TSH, contraceptive management, referrals) is management or investigation only.

## Could not model

- **Hb < 6** (red box): no haemoglobin observable or unit. Left out of the Urgent `or`, so the rule fires **less often** than the page intends (a patient whose only urgent criterion is Hb < 6 is not flagged).
- **Hb < 12 → likely anaemia** (heavy periods and spotting branches): not encoded. Without Hb the rule would fire on every heavy-bleeding patient (**more often**), so it is omitted.
- **"Recent"** has no time window on the page; a qualifier is used rather than an onset comparison.
- Bleeding-pattern types (heavy/prolonged, irregular with cycle < 21 or > 35 days, intermenstrual spotting, postcoital) and the "> 1 year after final period" referral are management routing; not modelled.

## SNOMED gaps

- `Pallor` (finding) does not exist → `Pale complexion` (finding). Alternatives: `Pallor of skin of face`, `Pale conjunctiva`.
- `Pregnant` (finding) does not exist → `Pregnancy` (finding).
- `Weakness` (finding) does not exist → `Asthenia` (finding).
- `Sexual assault` exists only as an `event` and `Rape` only as an `event` → `Victim of sexual aggression` (finding). `Victim of sexual assault` (finding) does not exist.

## Checker issues left in place

- None.

## Questions for a clinician

- Is "Pallor with pulse ≥ 100, respiratory rate ≥ 30, dizziness/weakness or chest pain" meant as pallor plus any one of these (as encoded), or as separate criteria?
- Should "Pregnant" with vaginal bleeding be flagged urgent at any gestation (as encoded), and how recent is "recent" delivery/miscarriage/termination (e.g. within 6 weeks)?
- Is facial-skin pallor the right recorded form for pallor, or conjunctival/palmar pallor?
