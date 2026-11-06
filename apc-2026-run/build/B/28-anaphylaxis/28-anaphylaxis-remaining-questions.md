# Page 28 – Anaphylaxis (APC 2026): remaining questions

## Decisions made

- **Same structure as the 2023 gold page (p20).** The 2026 red box keeps the same four questions,
  so the rules follow `20-anaphylaxis.lisp`: a broad `possible` pre-screen triggers
  `Check for Anaphylaxis`; `Diagnose probable anaphylaxis` encodes Q1 = Yes, Q2 = Yes → Q3 = Yes
  and Q2 = No → Q4 = Yes; `Urgent: Anaphylaxis` hangs on `(active_condition Anaphylaxis)`.
- **No `manage` tasks.** The gold page's management tasks are left out. The whole "Manage
  anaphylaxis and refer urgently" list is accounted for as `management_step`.
- **Q1 "which has caused anaphylaxis before"** is modelled as exposure to a substance plus a
  recorded allergy to the same substance (five footnote foods, `Drug or medicament`), or insect
  bite/sting plus allergy to `Insect venom`.
- **Q4 excludes abdominal pain/vomiting**, as the page does. They count only in the Q3 `any2`.
- **BP < 90/60** is read as systolic < 90 **or** diastolic < 60. The page has no "Shock/SBP < 80".
- **Urgency:** `Urgent`, on the probable diagnosis. The header says "Give urgent attention to the
  patient with *possible* anaphylaxis". We didn't make the pre-screen itself Urgent, because its
  evidence is our construct (the gold pattern) rather than page logic.
- **Age:** `adult` on every rule, including the priority evaluation (the gold uses `all_ages`).
- **Lower half of page not encoded.** "Assess the patient with previous anaphylaxis" (trigger
  review, "Other allergy" bullets) and "Advise the patient with previous anaphylaxis" are follow-up
  care at first visit. Its "eczema likely", "urticaria likely", "allergic rhinitis likely",
  "allergic conjunctivitis likely" and "exclude asthma" bullets point to pages 84, 51, 48 and 138,
  which own those rules. These are outside elements, so they need no coverage accounting.

## Could not model

- "In the few hours before symptoms started": no time comparison. Exposures recorded in the
  current encounter are taken as recent, so the rule can fire for exposures that are not recent.
- "Generalised" itch/rash: the rules use `Itching` / `Eruption` with `Sudden onset`, so they fire
  for localised itch or rash too, which is more often than the page intends.
- "Sudden onset" applies to all groups in Q3 ("sudden onset of ≥ 2 of"). It is encoded only on the
  skin group, as in the gold. Difficulty breathing, BP, dizziness/collapse and abdominal
  pain/vomiting carry no onset qualifier, so the rule fires somewhat more often than the page
  intends.
- Management details (repeat adrenaline every 5 minutes, "if BP still < 90/60 after adrenaline",
  "systolic BP > 90", nebuliser for persistent wheeze) are not representable without manage tasks.

## SNOMED gaps

- None. Every concept was confirmed with `snomed exists`. `Generalised` (British spelling) does not
  exist; `Generalized` (qualifier value), `Generalized pruritus` (finding) and `Generalized rash`
  (disorder) do, but they were not used (see Decisions made / Could not model).

## Checker issues left in place

- None.

## Questions for a clinician

- Should the patient with *possible* anaphylaxis (pre-screen only) already be flagged Urgent, as
  the box header literally says, or only once the flowchart reaches "Treat as anaphylaxis"?
- Should "generalised" be enforced, using `Generalized pruritus` / `Generalized rash`? That would
  make the rule miss records entered as plain itch or rash.
- Should a specific recorded drug allergy (e.g. penicillin) together with exposure to that drug
  satisfy Q1? The `Drug or medicament` pair matches only if both are recorded under that hierarchy.
- Should the "Other allergy" assessment bullets (eczema, urticaria, rhinitis, conjunctivitis,
  asthma) get rules on this page, or stay with the pages they point to?
