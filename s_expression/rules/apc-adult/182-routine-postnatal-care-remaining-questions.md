# Page 182 – Routine postnatal care: remaining questions

Final build, reconciled from builders A and B (base: B). See `reconcile.json`.

## Decisions made

- **Trigger.** The red box applies to "the postnatal patient (within 6 weeks of delivery)". The
  `check_for` task, the BMI `measure` task and the priority rule are triggered by
  `(clinical_finding (snomed_concept "Postpartum state" "finding"))`. This is not a recorded common
  symptom or warning sign, so the rules fire only if something upstream records the postnatal state.
- **Timing.** "Within 6 weeks of delivery" (priority rule and the PPH rule) is
  `(<= (onset Postpartum state) (time_ago 6 weeks))`; "up to 1 week postpartum" (seizure) is
  `(<= … (time_ago 1 weeks))`. `<=` is used, per the time-comparison convention. This assumes the
  onset recorded for Postpartum state is the delivery date.
- **Heavy bleeding → postpartum haemorrhage likely**: `probable` Postpartum hemorrhage from
  Postpartum state (within 6 weeks) AND `Heavy episode of vaginal bleeding`; the priority rule refers
  to it through `active_condition`.
- **Recent seizure, up to 1 week postpartum, treat as eclampsia 177**: encoded directly in the
  priority rule as Seizure AND postpartum ≤ 1 week. "Treat as eclampsia 177" is read as a management
  pointer, not an "X likely" statement, so there is no eclampsia diagnosis rule (builder A wrote a
  probable one; see Questions).
- **Perineal tear extending to anus or rectum**: an `or` of Third degree and Fourth degree perineal
  laceration.
- **Shock/SBP < 80** is encoded as written on this page: `(or (clinical_finding Shock) (< SBP 80))`.
  Footnote 1 ("If SBP < 80, pulse ≥ 100, respiratory rate > 30, confusion/restlessness, weakness,
  shock likely") is not built into a shock rule; pulse ≥ 100 is its own red-box item anyway.
- **Pallor with RR ≥ 30, dizzy, faint or chest pain**: `(and Pallor of skin of face (or RR ≥ 30,
  Dizziness, Feeling faint, Chest pain))`.
- **Unwell and temperature ≥ 38°C**: `Generally unwell` AND body temperature ≥ 38 °C.
- **Pulse ≥ 100**: `Pulse, function` ≥ 100 bpm.
- **Priority level** is `Urgent`, as the box header says.
- **BMI row:** a `measure` task for Body mass index (kg/m²) at every postnatal visit (BMI is not a
  routine vital). "< 18.5, arrange nutritional support" is management.
- The rest of the assessment table (TB, mental health, substance use, family planning, infant
  feeding, baby, psychosocial risk, abdomen/perineum, BP ≥ 140/90 recheck) consists of
  cross-references, management or referral steps, with no "X likely" or "consider X", so it is not
  encoded. No flowchart file: the page has no Yes/No branches.

## Could not model

- **Hb < 6:** the language has no haemoglobin observable or unit. Leaving it out means the priority
  rule fires **less often** than the page intends (a patient with Hb < 6 and no other sign is not flagged).
- **"(soaks pad in < 5 minutes)":** the time to soak a pad cannot be expressed. "Heavy episode of
  vaginal bleeding" stands for it, so the PPH rule may fire **more often** than the page intends.
- **"Recent" seizure:** captured only by the 1-week postpartum window; no time limit on the seizure itself.
- All "Manage and refer urgently" steps (fluids, oxytocin, tranexamic acid, ergometrine,
  misoprostol, uterine massage, balloon catheter, bimanual compression, ceftriaxone, metronidazole)
  are management steps and out of scope.

## SNOMED gaps

- No `Pallor` (finding); used `Pallor of skin of face` (finding), as other VHA rules do. (`Pale
  complexion` was the alternative.)
- No `Heavy bleeding` (finding); used `Heavy episode of vaginal bleeding` (finding).
- No `Feeling unwell` (finding); used `Generally unwell` (finding).
- `Shock` exists only as a disorder, which is the form used.
- No concept for "perineal tear extending to anus or rectum"; used Third/Fourth degree perineal laceration.

## Checker issues left in place

- None.

## Questions for a clinician

- Is the onset of a recorded `Postpartum state` the delivery date? If onset is the time of
  recording, the 6-week and 1-week windows are always met at intake and do not filter.
- Should "perineal tear extending to anus" include third-degree tears (anal sphincter), or only
  fourth-degree tears (anal/rectal mucosa)?
- Which sign should "pallor" map to: facial pallor (used), pale complexion, conjunctival pallor or
  generalised pallor of the skin?
- "Treat as eclampsia": should a seizure up to 1 week postpartum also produce a `probable` (or
  `possible`) Eclampsia diagnosis? (Builder A encoded probable; the final build does not.)
- Should "faint" also match `Syncope` (actually fainted), not only `Feeling faint`?
- Should postpartum haemorrhage be `Emergency` rather than `Urgent`, given the page calls it
  "life-threatening … requires immediate management"?
- Should a seizure more than 1 week postpartum (but within 6 weeks) still be urgent here? As
  encoded it is not urgent on this page (only through the general Seizure warning sign).
