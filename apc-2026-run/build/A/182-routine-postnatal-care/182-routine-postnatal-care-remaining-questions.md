# Page 182 – Routine postnatal care: remaining questions

## Decisions made

- **Scope.** Only the red box carries triage logic. The "Assess the patient and her baby" table is a
  schedule of routine checks with cross-references (100, 159, 98, 165, 170, 55, 185, 148, 183) and no
  "X likely"/"consider X" statements, so it is not encoded. No flowchart file: the page has no
  Yes/No branches.
- **Anchor.** The presenting complaint is `(clinical_finding (snomed_concept "Postpartum state" "finding"))`.
  It is not a recorded common symptom or warning sign; something upstream must record it.
- **Time windows.** "Within 6 weeks of delivery" (priority rule, PPH rule) and "up to 1 week
  postpartum" (eclampsia rule) are `(<= (onset Postpartum state) (time_ago N weeks))`, following the
  brief's convention that "within" is written with `<=`.
- **Heavy bleeding → postpartum haemorrhage likely**: probable `Postpartum hemorrhage` from postpartum
  state + `Heavy episode of vaginal bleeding`, referenced from the priority rule via `active_condition`.
- **Recent seizure, up to 1 week postpartum, treat as eclampsia**: probable `Eclampsia` (postpartum
  state + Seizure + ≤ 1 week), referenced via `active_condition`. "Treat as" read as probable.
- **Perineal tear extending to anus or rectum**: `Third degree perineal laceration` or `Fourth degree
  perineal laceration`.
- **Shock**: page-local `(or Shock (disorder), SBP < 80)`, as the page writes "Shock¹/systolic BP < 80".
  Footnote 1 ("If SBP < 80, pulse ≥ 100, respiratory rate > 30, confusion/restlessness, weakness,
  shock likely") is not turned into a shock rule; pulse ≥ 100 is its own red-box item anyway.
- **Pallor with RR ≥ 30, dizzy, faint or chest pain**: `(and Pallor of skin of face (or RR ≥ 30,
  Dizziness, Feeling faint, Chest pain))`.
- **Unwell and temperature ≥ 38°C**: `(and Generally unwell (>= Body temperature 38))`.
- **Priority level** is `Urgent`, as the box header says.

## Could not model

- **Hb < 6**: haemoglobin has no unit or observable in the language. Left out of the priority rule,
  which therefore fires **less often** than the page intends (a patient with Hb < 6 and no other sign
  is not flagged).
- **"Soaks pad in < 5 minutes"**: the definition of heavy bleeding cannot be expressed; the rule relies
  on the health worker recording `Heavy episode of vaginal bleeding`.
- **"Recent"** seizure: treated as a seizure recorded in this encounter; no time limit on the seizure itself.
- All "Manage and refer urgently" content (fluids, oxytocin, TXA, ergometrine, misoprostol, uterine
  massage, balloon tamponade, bimanual compression, ceftriaxone, metronidazole) is management.

## SNOMED gaps

- No `Pallor` (finding); used `Pallor of skin of face` (finding), as other VHA rules do.
- No `Heavy bleeding` (finding); used `Heavy episode of vaginal bleeding` (finding).
- No `Feeling unwell`; used `Generally unwell` (finding).
- `Shock` exists only as a disorder; used `Shock` (disorder).

## Checker issues left in place

- None.

## Questions for a clinician

- Does the onset of a recorded `Postpartum state` reliably equal the delivery date? If onset is the
  time of recording, the 6-week and 1-week windows are always met at intake and do not filter.
- Should "perineal tear extending to anus" include third-degree tears (anal sphincter), or only
  fourth-degree tears (anal/rectal mucosa)?
- Should "faint" also match `Syncope` (actually fainted), not only `Feeling faint`?
- Should postpartum haemorrhage be `Emergency` rather than `Urgent`, given the page calls it
  "life-threatening … requires immediate management"?
- Should a seizure more than 1 week postpartum (but within 6 weeks) still be urgent here? As
  encoded it is not urgent on this page (only through the general Seizure warning sign).
