# Page 177 – Routine antenatal care: remaining questions

## Decisions made

- **Trigger** is `(clinical_finding (snomed_concept "Pregnancy" "finding"))`, used in both tasks and in the priority rule (no rule diagnoses pregnancy at probable). Pregnancy is not a common symptom or warning sign; VHA's warning signs use `(active_condition Pregnancy)` only as a prompt condition.
- **Shock/SBP < 80** is encoded as this page's own `or` of `Shock` (disorder) and systolic BP < 80 (decision for all pages). Footnote 1 is not used to build a shock definition.
- **BP pairs** (≥ 140/90, ≥ 160/110): systolic or diastolic at or above the threshold, following Will's convention for BP pairs.
- **"Treat as severe pre-eclampsia"** (two red-box lines) is a probable `Severe pre-eclampsia` rule, referenced from the priority rule with `active_condition`.
- **"Treat as severe hypertension"**: no SNOMED concept, so the criterion (BP ≥ 160/110 and Proteinuria recorded No) is inlined in the priority rule.
- **"Treat for eclampsia"** (Seizures column) is a probable `Eclampsia` rule = pregnancy + seizure.
- **Miscarriage pairs** ("threatened or complete … likely", "incomplete or inevitable … likely"): each concept gets its own `possible` rule, since asserting both members of an either/or as probable would be wrong. "Refer to exclude ectopic pregnancy" → possible `Ectopic pregnancy`.
- **PROM**: `Premature rupture of membranes` (disorder) = rupture before labour. Evidence: `Watery vaginal discharge` with `Sudden onset` and contractions recorded as No (`Uterine contractions present`).
- **Decreased/no fetal movements**: `Reduced fetal movement` (finding) or `Fetal movements absent` (situation, the only concept available).
- **Chorioamnionitis** (footnote 4) is not encoded as a diagnosis: the page uses it only to gate antibiotics and gives no "likely"/"consider" wording.
- No `measure` task: temperature, BP and pulse are routine vitals; proteinuria (dipstick) has no unit.

## Could not model

- **Gestational age** (< 37 weeks for preterm labour; < 22 / ≥ 22 weeks for the bleeding branches; 20 weeks to 1 week postpartum for eclampsia; < 26, 26–33+, ≥ 34, ≥ 37, ≥ 13 weeks in management). The language has no weeks unit for a measurement. Effect: preterm labour fires on any painful contractions, including at term (**more often**); the miscarriage/ectopic rules fire in late-pregnancy bleeding too (**more often**); eclampsia fires on seizures before 20 weeks, where the page sends to page 20 (**more often**), and does not cover the postpartum week (the trigger is Pregnancy) (**less often**).
- **"Persistent"** headache/blurred vision/abdominal pain: no SNOMED qualifier for persistent; plain findings used (**more often**).
- **"≥ 1+" proteinuria**: dipstick grade has no unit; `Proteinuria` stands for ≥ 1+ (trace proteinuria recorded as Proteinuria would count: **more often**).
- Footnote 3 (unknown gestation → late pregnancy if uterus palpable above umbilicus): depends on gestation routing, not modelled.

## SNOMED gaps

- "Severe hypertension" (disorder): not found → criterion inlined in the priority rule.
- "Persistent" (qualifier value): not found → no qualifier.
- "Threatened miscarriage", "Inevitable miscarriage": not found → `Threatened abortion`, `Inevitable abortion` (same meaning).
- "Decreased fetal movements", "Fetal movements absent" (finding): not found → `Reduced fetal movement` (finding), `Fetal movements absent` (situation).
- "Uterine contractions" (finding): not found → `Painful uterine contractions`, `Uterine contractions present`.

## Checker issues left in place

- None.

## Questions for a clinician

- Should the bleeding rules (miscarriage, ectopic) and preterm labour wait until gestational age can be recorded, given they currently fire regardless of gestation?
- Is "probable eclampsia" for any seizure in pregnancy acceptable, given the page sends seizures < 20 weeks to page 20?
- Should "threatened or complete" / "incomplete or inevitable" be probable for both members, or possible as encoded?
- Should chorioamnionitis (footnote 4: temperature ≥ 38 °C, painful abdomen or foul-smelling amniotic fluid, in PROM) become its own diagnosis rule?
- Is `Watery vaginal discharge` + `Sudden onset` the right record for "sudden gush of clear/pale fluid", or should the app record `Amniotic fluid leaking`?
