# Page 177 – Routine antenatal care: remaining questions

## Decisions made

- **Trigger.** The red box is for "the pregnant patient", so both `check_for` tasks and every rule
  are anchored on `(active_condition (snomed_concept "Pregnancy" "finding"))`. VHA's warning signs
  already use this to prompt for pregnancy-specific signs. Pregnancy is not a common symptom, so
  these rules fire only when the patient's pregnancy has been recorded.
- **One Urgent priority rule** covers all twelve items: `(and Pregnancy (or …))`. The page escalates
  none of them past "urgent attention". Note that VHA's warning signs already rate Seizure as
  Emergency and "Pregnancy and abdominal pain" as Very urgent, so those patients will rank higher
  than this page's Urgent anyway.
- **"Treat as severe pre-eclampsia"** is written as a `probable` Severe pre-eclampsia rule with both
  of the page's branches (BP ≥ 140/90 and headache/blurred vision/abdominal pain; BP ≥ 160/110 and
  proteinuria). The priority rule references it through `active_condition`.
- **BP pairs.** "BP ≥ 140/90" is read as systolic ≥ 140 **or** diastolic ≥ 90, and "BP ≥ 160/110" as
  systolic ≥ 160 **or** diastolic ≥ 110. This follows Will's or-convention for 90/60.
- **Shock/systolic BP < 80** is encoded as written on this page: an `or` of `Shock` (disorder) and
  systolic BP < 80. Footnote 1 ("If SBP < 80, pulse ≥ 100, respiratory rate > 30,
  confusion/restlessness, weakness, shock likely") is not encoded as a separate shock rule.
- **Swollen painful calf** = `Swollen calf` **and** `Pain in calf`.
- **Decreased/no fetal movements** = `Reduced fetal movement` or `Fetal movements absent`
  (situation). The ⮌ 179 pointer is not followed.
- **PROM likely** is a `probable` rule. Its evidence is `Watery vaginal discharge` with `Sudden onset`
  (the gush of clear/pale fluid) **and** `(no Uterine contractions present)` (no contractions).
- **Preterm labour likely** is only a `possible` rule (`Premature labor`), because "< 37 weeks" can't
  be expressed. A `probable` rule would label every patient in term labour with probable preterm
  labour. The priority rule uses `Painful uterine contractions` directly.
- **Vaginal bleeding branch.** A second `check_for` task asks about the cervical-os question when a
  pregnant patient has vaginal bleeding.
  - **Q = No** (all four parts recorded No): `possible` threatened miscarriage (`Threatened abortion`)
    and `possible` complete miscarriage. "Refer to exclude ectopic pregnancy" adds a `possible`
    Ectopic pregnancy.
  - **Q = Yes** (any part present): `possible` Incomplete miscarriage and `possible` Inevitable
    abortion.
  - These are "X or Y likely" pairs. I wrote each member as `possible` rather than asserting two
    alternatives both at `probable`.

## Could not model

- **Gestational age.** "< 37 weeks", "early pregnancy < 22 weeks / late ≥ 22 weeks", "< 20 weeks",
  "between 20 weeks and 1 week postpartum" and footnote 3 can't be written: `Gestational age`
  exists as an observable, but the language has no weeks unit.
  - Painful contractions make a patient Urgent and possible preterm labour at any gestation. This
    fires **more often** than the page intends (term labour too).
  - The miscarriage and ectopic rules fire for vaginal bleeding at any gestation, also in late
    pregnancy. This fires **more often**. The late-pregnancy column has no diagnostic content to
    encode.
- **"Persistent" headache.** There is no persistent qualifier, so plain `Headache` is used. The
  pre-eclampsia rule fires **more often**.
- **"≥ 1+ proteinuria".** The dipstick grade has no unit; it is read as `Proteinuria` present.
  "Without proteinuria" needs proteinuria recorded as No, so an untested patient with BP ≥ 160/110
  is not caught by that branch unless headache/blurred vision/abdominal pain makes it
  pre-eclampsia. It fires **less often**.
- **Chorioamnionitis (footnote 4)** and the eclampsia instruction are management context, not
  encoded.

## SNOMED gaps

- **Severe hypertension:** no concept (`Severe hypertension` disorder: NO). Its criteria are
  written straight into the priority rule.
- **Threatened / inevitable miscarriage:** only `Threatened abortion` and `Inevitable abortion`
  exist, so those are used.
- **"Persistent":** no qualifier value. See Could not model.
- **Sudden gush of clear/pale fluid:** no precoordinated concept. `Watery vaginal discharge` +
  `Sudden onset` is used. `Amniotic fluid leaking` was rejected because it presumes the source.

## Checker issues left in place

- None. One non-blocking warning: the trigger `Bleeding from vagina` of the cervical-os task cites
  the "Vaginal bleeding" column header (`p177-0f0a004d`), which the element extractor classes as
  `other`, not as a header.

## Questions for a clinician

- Should "painful contractions" be Urgent at term too, since the language can't check < 37 weeks?
  The alternative is to drop the item.
- Should the miscarriage pair diagnoses be `probable`, as the page's "likely" suggests? Or should a
  common parent (e.g. `Miscarriage`) be diagnosed for incomplete/inevitable?
- Should footnote 1's shock criteria be a page-local `probable` Shock rule? And if so, any one of the
  criteria, or all of them?
- Should "without proteinuria" also apply when no dipstick result is recorded?
