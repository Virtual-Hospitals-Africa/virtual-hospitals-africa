# Page 176 – Manage the patient requesting a termination of pregnancy (TOP): remaining questions

## Decisions made

- **Scope.** Only the lower section, "Review the patient who had a TOP within the past 14 days",
  carries triage/diagnostic logic: the red box (Manage urgently; ectopic pregnancy likely) and
  "incomplete TOP likely". The upper half (comorbidity screen → referral, gestation and facility
  routing, medical/surgical TOP regimens, pain relief, return advice, follow-up) is management and
  referral and is not encoded.
- **Trigger.** `(<= (onset (clinical_finding (snomed_concept "Induced termination of pregnancy" "disorder"))) (time_ago 14 days))`
  is the task trigger and the first conjunct of all three rules. "Within the past 14 days" uses
  `<=` (onset comparisons only accept `>=`/`<=`).
- **Red box → `Urgent: complications after recent termination of pregnancy`**: recent TOP AND any of
  mass of uterine adnexa, abdominal guarding, rebound tenderness, offensive vaginal discharge,
  temperature ≥ 38 °C, SBP < 80, pulse ≥ 100, respiratory rate ≥ 30. "Manage urgently → 182" is
  `Urgent` (no escalation wording on the page). The page's "SBP < 80" stands alone here (no shock
  finding is named), so only systolic BP < 80 is encoded.
- **"If adnexal mass, ectopic pregnancy likely"** → probable Ectopic pregnancy from recent TOP AND
  adnexal mass. The parenthetical "(closed cervix and small uterus)" is read as describing the
  presentation, not as extra required criteria.
- **"Enlarged uterus or open cervical os with bleeding/products of conception visible? Yes to
  either, incomplete TOP likely"** → probable Incomplete induced termination of pregnancy from
  recent TOP AND (enlarged uterus OR (cervical os open AND (bleeding from vagina OR products of
  conception at uterine os cervix))). The "No" precondition (none of the danger signs) is not
  required; those patients are already Urgent.
- "guarding/rebound abdominal tenderness" is split into Abdominal guarding and Rebound tenderness.

## Could not model

- **Hb < 6**: there is no haemoglobin observable or unit in the language. The Urgent rule fires
  **less often** than the page intends (a recent-TOP patient whose only danger sign is Hb < 6 is not
  flagged).
- The 14-day window depends on the TOP finding being recorded with the date of the TOP as its onset.
  If onset is the date of recording, a TOP done earlier but recorded today would still match.

## SNOMED gaps

- "Foul-smelling discharge": no FSN with "foul"; used `Offensive vaginal discharge` (finding).
- "Bleeding" through an open cervical os: no `Bleeding from cervix` / `Cervical bleeding` FSN; used
  `Bleeding from vagina` (finding).
- "Small uterus": no FSN found (`Uterus small` does not exist); not needed for the chosen encoding.
- "Adnexal mass": used `Mass of uterine adnexa` (finding).

## Checker issues left in place

- None.

## Questions for a clinician

1. Should ectopic pregnancy be "likely" only when the adnexal mass comes with a closed cervix and a
   small uterus (the parenthetical), or for any adnexal mass after a TOP?
2. Does "enlarged uterus or open cervical os with bleeding/products of conception visible" mean
   enlarged uterus **or** (open os with bleeding/POC), as encoded, or (enlarged uterus or open os)
   **with** bleeding/POC visible?
3. Is "foul-smelling discharge" always vaginal in this context?
4. How is a past TOP recorded in VHA (disorder vs procedure, and with which onset date)? The rules
   only fire if it is recorded as `Induced termination of pregnancy` (disorder) with onset within 14 days.
5. Should Hb < 6 be added once a haemoglobin observable exists?
