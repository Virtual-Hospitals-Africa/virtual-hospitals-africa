# Page 177 – Routine antenatal care: remaining questions

Final build, reconciled from two independent builds (base: B).

## Decisions made

- **Trigger** is `(clinical_finding (snomed_concept "Pregnancy" "finding"))`, used in both tasks, the diagnosis rules and the priority rule. No rule diagnoses pregnancy at probable, so the `clinical_finding` form is used, per Will's briefing. Pregnancy is not a common symptom or warning sign; VHA's warning signs use `(active_condition Pregnancy)` only as a prompt condition.
- **One Urgent priority rule** covers all twelve red-box items: `(and Pregnancy (or …))`. The page escalates none of them past "urgent attention". VHA's warning signs already rate Seizure as Emergency and "Pregnancy and abdominal pain" as Very urgent, so those patients will rank higher anyway.
- **Shock/SBP < 80** is encoded as this page's own `or` of `Shock` (disorder) and systolic BP < 80 (decision for all pages). Footnote 1 is not used to build a shock definition.
- **BP pairs** (≥ 140/90, ≥ 160/110): systolic or diastolic at or above the threshold, following Will's convention for BP pairs.
- **"Treat as severe pre-eclampsia"** (two red-box lines) is a probable `Severe pre-eclampsia` rule, referenced from the priority rule with `active_condition`.
- **"Treat as severe hypertension"**: no SNOMED concept, so the criterion (BP ≥ 160/110 and Proteinuria recorded No) is written out in the priority rule.
- **"Treat for eclampsia"** (Seizures column) is **not** encoded as a diagnosis. The page applies it only "between 20 weeks and 1 week postpartum" and sends seizures < 20 weeks to page 20, so a pregnancy + seizure rule would assert eclampsia where the page says otherwise. Seizures still make the patient Urgent. (Unsettled; see Questions.)
- **Preterm labour likely** is a probable `Premature labor` rule (the page says "likely"), referenced from the priority rule with `active_condition`. "< 37 weeks" can't be expressed (see Could not model). (Unsettled; see Questions.)
- **PROM likely**: probable `Premature rupture of membranes` (disorder). Evidence: `Watery vaginal discharge` with `Sudden onset` (the gush of clear/pale fluid) and contractions recorded as No (`Uterine contractions present`).
- **Swollen painful calf** = `Swollen calf` **and** `Pain in calf`.
- **Decreased/no fetal movements**: `Reduced fetal movement` (finding) or `Fetal movements absent` (situation, the only concept available). The ⮌ 179 pointer is not followed.
- **Vaginal bleeding branch.** A second `check_for` task asks the cervical-os question when a pregnant patient has vaginal bleeding: `Cervical os open`, `Cervix dilated` (the page's "open/dilated"), and products of conception at the os or in the vagina.
  - **Q = No** (all four recorded No): possible `Threatened abortion` and possible `Complete miscarriage`; "Refer to exclude ectopic pregnancy" adds possible `Ectopic pregnancy`.
  - **Q = Yes** (any one present): possible `Incomplete miscarriage` and possible `Inevitable abortion`.
  - These are "X or Y likely" pairs; each member is `possible`, since asserting both alternatives at probable would be wrong.
- **Chorioamnionitis** (footnote 4) is not encoded as a diagnosis: the page uses it only to gate antibiotics and gives no "likely"/"consider" wording.
- No `measure` task: temperature, BP and pulse are routine vitals; proteinuria (dipstick) has no unit.

## Could not model

- **Gestational age** (< 37 weeks for preterm labour; < 22 / ≥ 22 weeks for the bleeding branches; < 20 weeks and 20 weeks to 1 week postpartum for seizures; < 26, 26–33+, ≥ 34, ≥ 37, ≥ 13 weeks in management). `Gestational age` exists as an observable, but the language has no weeks unit.
  - Preterm labour fires on any painful contractions, including at term (**more often**).
  - The miscarriage/ectopic rules fire for vaginal bleeding in late pregnancy too (**more often**). The late-pregnancy column has no diagnostic content to encode.
  - Eclampsia is not diagnosed at all (**less often** than the page's "treat for eclampsia"); the seizure itself still makes the patient Urgent.
- **"Persistent"** headache/blurred vision/abdominal pain: no SNOMED qualifier for persistent; plain findings used. The pre-eclampsia rule fires **more often**.
- **"≥ 1+" proteinuria**: the dipstick grade has no unit; `Proteinuria` stands for ≥ 1+ (trace recorded as Proteinuria would count: **more often**). "Without proteinuria" needs proteinuria recorded as No, so an untested patient with BP ≥ 160/110 is not caught by that branch unless headache/blurred vision/abdominal pain makes it pre-eclampsia (**less often**).
- Footnote 3 (unknown gestation → late pregnancy if uterus palpable above umbilicus): depends on gestation routing, not modelled.

## SNOMED gaps

- "Severe hypertension" (disorder): not found → criterion written out in the priority rule.
- "Persistent" (qualifier value): not found → no qualifier.
- "Threatened miscarriage", "Inevitable miscarriage": not found → `Threatened abortion`, `Inevitable abortion` (same meaning).
- "Decreased fetal movements", "Fetal movements absent" (finding): not found → `Reduced fetal movement` (finding), `Fetal movements absent` (situation).
- "Uterine contractions" (finding): not found → `Painful uterine contractions`, `Uterine contractions present`.
- Sudden gush of clear/pale fluid: no precoordinated concept → `Watery vaginal discharge` + `Sudden onset`. `Amniotic fluid leaking` was rejected because it presumes the source.

## Checker issues left in place

- None. One non-blocking warning: the trigger `Bleeding from vagina` of the cervical-os task cites the "Vaginal bleeding" column header (`p177-0f0a004d`), which the element extractor classes as `other`, not as a header.

## Questions for a clinician

- **Eclampsia (reconciler, unsettled):** should seizures in a pregnant patient give probable `Eclampsia`, even though the page sends seizures < 20 weeks to page 20 and the language can't check gestation? Builder B encoded it; the final build leaves it out.
- **Preterm labour (reconciler, unsettled):** probable (the page's "likely") or possible, given it will also fire for painful contractions at term? Should "painful contractions" be Urgent at term at all, or should the item wait until gestational age can be recorded?
- Should the bleeding rules (miscarriage, ectopic) wait until gestational age can be recorded, given they currently fire in late pregnancy too?
- Should "threatened or complete" / "incomplete or inevitable" be probable for both members, or possible as encoded? Or should a common parent (e.g. `Miscarriage`) be diagnosed for incomplete/inevitable?
- Should footnote 1's shock criteria be a page-local probable Shock rule? If so, any one of the criteria, or all of them?
- Should "without proteinuria" also apply when no dipstick result is recorded?
- Should chorioamnionitis (footnote 4: temperature ≥ 38 °C, painful abdomen or foul-smelling amniotic fluid, in PROM) become its own diagnosis rule?
- Is `Watery vaginal discharge` + `Sudden onset` the right record for "sudden gush of clear/pale fluid", or should the app record `Amniotic fluid leaking`?
