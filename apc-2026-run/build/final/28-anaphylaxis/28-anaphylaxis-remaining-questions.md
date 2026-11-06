# Page 28 – Anaphylaxis (APC 2026): remaining questions

## Decisions made

- **Red box follows the gold standard (2023 page 20).** The 2026 red-box algorithm has the same
  questions and branches. Q1 = Yes is exposure to substance X **and** an allergy to X (fish, milk,
  egg, peanut, tree nut, drug), or insect bite/sting **and** an insect venom allergy. Q2 = Yes → Q3
  is any exposure **and** `any2` of the four symptom groups. Q2 = No → Q4 is a sudden-onset skin
  sign **and** any of difficulty breathing, BP < 90/60, dizziness/collapse. Abdominal pain and vomiting
  are left out of Q4 because the page leaves them out.
- **BP < 90/60** is read as systolic < 90 **or** diastolic < 60 (Will's convention). The page has no
  "Shock/SBP < 80" wording.
- **Priority.** `Urgent: anaphylaxis` fires on `(active_condition Anaphylaxis)`, which means the
  flowchart has reached "Treat as anaphylaxis". The header says "Give urgent attention to the
  patient with *possible* anaphylaxis". The `possible` pre-screen is used only to trigger
  `Check for anaphylaxis`, as in the gold standard. See the questions for a clinician.
- **Pre-screen** (`Diagnose possible anaphylaxis`) is copied from the gold standard.
- **Lower half of the page.** The "Other allergy" row of "Assess the patient with previous
  anaphylaxis" has "X likely" and "exclude X" logic, so (per the builder brief's scope) it is
  encoded. A check task is triggered by `History of anaphylaxis` (situation). It feeds one
  `possible` rule (asthma, from "exclude asthma") and four `probable` rules (eczema, urticaria,
  allergic rhinitis and allergic conjunctivitis). Each rule also requires `History of anaphylaxis`,
  because the row applies to the patient with previous anaphylaxis at first visit. The gold
  standard left the 2023 lower half unencoded.
- "Recurrent" in the asthma bullet is applied to all four items: cough, wheeze, tight chest and
  difficulty breathing.
- "> 4 weeks" (allergic rhinitis) is `(>= (onset X) (time_ago 4 weeks))`. The build wrote `>`; a script
  changed it to `>=` after the checkers read it (2026-11-04; this note added 2026-11-05), because VHA's database accepts only
  `>=` and `<=`. So exactly 4 weeks now counts.
- Rule descriptions are named for this page's topic; the lower-half rules carry "in previous anaphylaxis".
- **Reconciled build.** This final build is Builder A's. Builder B agreed on every red-box condition
  but left the "Other allergy" row unencoded, as cross-references to pages 138, 84, 51 and 48. A's
  encoding is kept because the brief's scope makes each "X likely" a probable rule. See `reconcile.json`.

## Could not model

- "In the few hours before symptoms started": exposures recorded in the current encounter count
  as recent. The rule fires more often than the page intends if an old exposure is on record.
- "Generalised" itch/rash: there is no generalised qualifier, as in the gold standard. Itch or rash
  anywhere counts, so the rule fires more often.
- "Sudden onset" governs all four groups in Q3 ("sudden onset of ≥ 2 of"). As in the gold standard,
  it is encoded only on the skin group, so difficulty breathing, BP, dizziness/collapse and
  abdominal pain/vomiting carry no onset qualifier. The rule fires somewhat more often than the page intends.
- Urticaria: "usually disappear within 24 hours" is descriptive and is not encoded. "Red" and
  "raised" are taken as inherent to a wheal.
- Allergic rhinitis: "most days" is not representable. The rule fires more often.
- Eczema: "patches" is not encoded. Scaly skin is site-specific, but dry skin and itchy skin are
  recorded without a site, so the rule may fire more often.
- Management ("Manage anaphylaxis and refer urgently", the advice section and the specialist
  review of trigger/s) is not encoded, because there are no `manage` tasks in this pass.

## SNOMED gaps

- "Dry skin" (finding): not found. `Xeroderma` (disorder) is used instead.
- "Itching of nose" (finding): not found. `Itching` (finding) is used with finding_site
  `Nasal structure`.
- "Blocked nose" / "Nasal obstruction" (finding): not found. `Nasal congestion` (finding) is used
  instead.
- Bilateral watery eye: not found, and there is no "Bilateral" qualifier value. `Watery eye` is
  used unqualified, with `Itching of bilateral eyes` for "both eyes … itchy".
- "Antecubital fossa structure": not found. `Structure of cubital fossa` is used for "inside elbows".
- "Generalised" (British spelling) does not exist. `Generalized` (qualifier value), `Generalized
  pruritus` (finding) and `Generalized rash` (disorder) do exist, but are not used (see Could not model).
- "Chest tightness": not found. `Tight chest` (finding) is used instead.

## Checker issues left in place

All four are CHECKED FOR BUT NEVER USED AS EVIDENCE. These findings are used only inside
`(>= (onset …) (time_ago 4 weeks))` (originally `>`) in `Diagnose probable allergic rhinitis in previous
anaphylaxis`, and the checker does not count findings inside an onset comparison. (Note 2026-11-05: since the
2026-11-04 shakedown fixes the gate counts onset subjects, so these four no longer match any gate finding;
Will's PR #1310 test still flags Sneezing.)

- `(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Sneezing" "finding") (qualifier (snomed_concept "Recurrent" "qualifier value")))`
- `(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Itching" "finding") (attribute (snomed_concept "Finding site" "attribute") (snomed_concept "Nasal structure" "body structure")))`
- `(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Nasal discharge" "finding"))`
- `(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Nasal congestion" "finding"))`

## Questions for a clinician

1. Should urgency be given to *possible* anaphylaxis, as the header literally says, rather than only
   once the questions conclude "Treat as anaphylaxis"?
2. Should the eczema, urticaria, rhinitis, conjunctivitis and asthma rules apply only to patients
   with previous anaphylaxis, as encoded, or to any patient?
3. In "recurrent cough, wheeze, tight chest or difficulty breathing", does "recurrent" qualify every
   item?
4. Is recording an allergy to substance X a fair stand-in for "has caused anaphylaxis before"? An
   allergy without previous anaphylaxis would also make Q1 = Yes.
5. Should "generalised" be enforced with `Generalized pruritus` / `Generalized rash`? That would make
   the rule miss records entered as plain itch or rash.
6. Should a specific recorded drug allergy (e.g. penicillin), together with exposure to that drug,
   satisfy Q1? The `Drug or medicament` pair matches only if both are recorded under that hierarchy.
7. Should the "Other allergy" bullets (eczema, urticaria, rhinitis, conjunctivitis, asthma) have rules
   on this page, as encoded here, or stay only with the pages they point to? (The two builders differed on this.)
8. "Exclude asthma" is encoded as a *possible* asthma diagnosis. Is that the right reading of "exclude"?
   (unsettled)
9. In "recurrent sneezing or itchy/runny/blocked nose most days for > 4 weeks", does "> 4 weeks"
   also qualify recurrent sneezing, as encoded, or only the nose symptoms? (unsettled)
