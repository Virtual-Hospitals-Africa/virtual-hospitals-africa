# Page 182 – Routine postnatal care: remaining questions

## Decisions made

- **Trigger.** The red box applies to "the postnatal patient (within 6 weeks of delivery)". The task
  and the priority rule are triggered by `(clinical_finding (snomed_concept "Postpartum state" "finding"))`.
  This is not a recorded common symptom or warning sign, so the rules fire only if the postnatal
  state is recorded.
- **Timing.** "Within 6 weeks of delivery" is written as `(<= (onset Postpartum state) (time_ago 6 weeks))`
  and "up to 1 week postpartum" (for seizure) as `(<= … (time_ago 1 weeks))`. Following the brief, `<=` is used instead of `<`.
  This assumes the onset recorded for Postpartum state is the delivery date.
- **Shock/SBP < 80** is encoded as written on this page: `(or (clinical_finding Shock) (< SBP 80))`.
  Footnote 1 ("If SBP < 80, pulse ≥ 100, respiratory rate > 30, confusion/restlessness, weakness,
  shock likely") is not built into a probable shock rule, because the brief says not to build a shared shock
  definition. Its "any/all" reading is also unclear.
- **Heavy bleeding → postpartum haemorrhage likely** becomes a `probable` Postpartum hemorrhage
  rule (Postpartum state AND Heavy episode of vaginal bleeding). The priority rule refers to it through `active_condition`.
- **Perineal tear extending to anus or rectum** is an `or` of Third degree and Fourth degree perineal laceration.
- **Pallor** is "Pale complexion". It is and-ed with an `or` of respiratory rate ≥ 30, Dizziness, Feeling faint and Chest pain.
- **Unwell and temperature ≥ 38°C** is "Generally unwell" AND body temperature ≥ 38 °C.
- **Pulse ≥ 100** is `Pulse, function` ≥ 100 bpm.
- **"Treat as eclampsia 177"** is treated as a management pointer. No eclampsia diagnosis rule was written.
- **BMI row:** a `measure` task for Body mass index (kg/m²) at every postnatal visit. The "< 18.5,
  arrange nutritional support" step is management.
- The rest of the assessment table (TB, mental health, substance use, family planning, infant feeding,
  baby, psychosocial risk, abdomen/perineum, BP ≥ 140/90 recheck) consists of cross-references, management or
  referral steps. None of it says "X likely" or "consider X", so none of it was encoded.

## Could not model

- **Hb < 6:** the language has no haemoglobin observable or unit. Leaving it out means the priority rule fires **less often** than the page intends.
- **"(soaks pad in < 5 minutes)":** there is no way to express the time taken to soak a pad. "Heavy episode of vaginal
  bleeding" stands for it, so the PPH rule may fire **more often** than the page intends.
- "Recent" on seizure is captured only by the 1-week postpartum window.
- All "Manage and refer urgently" steps (fluids, oxytocin, tranexamic acid, ergometrine, misoprostol,
  balloon catheter, bimanual compression, ceftriaxone, metronidazole) are out of scope as management steps.

## SNOMED gaps

- "Pallor" (finding) does not exist. Substitute: "Pale complexion" (finding).
- "Feeling unwell" (finding) does not exist. Substitute: "Generally unwell" (finding).
- "Shock" exists only as a disorder, which is the form used.
- There is no concept for "perineal tear extending to anus or rectum". Substitute: Third/Fourth degree perineal laceration.

## Checker issues left in place

- None.

## Questions for a clinician

- Is the onset of "Postpartum state" recorded as the delivery date? If it isn't, the 6-week and 1-week windows don't work.
- Should a third-degree tear (anal sphincter) count, or only tears into the anal or rectal mucosa?
- Which skin or mucosal sign should "pallor" map to: conjunctival, facial or general pallor?
- Should postpartum seizure also produce a `possible` eclampsia diagnosis?
