# Page 130 – HIV: Routine care (cont. 5): remaining questions

## Decisions made

- **Trigger is HIV infection.** The page is Step 4 of HIV routine care (checking for a reason to
  delay ART). Both `check_for` tasks and the priority rule are anchored on
  `(clinical_finding (snomed_concept "Human immunodeficiency virus infection" "disorder"))`, the
  `clinical_finding` form in both places, since no rule on this page diagnoses HIV at `probable`.
  Being about to start ART (ART-naive) can't be expressed, so the rules also fire for patients
  already on ART.
- **Red box → `Urgent`.** The page says "delay starting ART and refer same day". It doesn't
  escalate further, so seizure, hemoptysis and aggression stay at `Urgent` here even though their
  global warning signs carry a higher level.
- **Split items.** "Breathlessness at rest or while talking" → `Dyspnea at rest` or `Unable to
  complete a sentence in one breath`. "Unable to walk unaided" → `Unable to walk` (the concept VHA
  vitals record) or `Dependent for walking`. "Drowsy/confused" → `Drowsy` or `Clouded consciousness`.
  "Aggressive or agitated" → `Aggressive behavior` or `Feeling agitated`. "New sudden
  weakness/numbness or visual disturbance" → `Muscle weakness`, `Numbness` and `Visual disturbance`,
  each with the `Sudden onset` qualifier.
- **RR ≥ 30 and pulse ≥ 120** use the routine vitals (`Respiratory rate`, `Pulse, function`), so
  they need no `measure` task.
- **"Exclude TB" → `possible` Tuberculosis** when HIV, not known with TB, and any of: cough, weight
  loss (`Weight decreased`), night sweats, fever, chest pain or blood-stained sputum.
- Every other flowchart outcome (ART timing, LP referral, ALT/bilirubin, treat acute illness first)
  is management and isn't encoded.

## Could not model

- **"Coughs up ≥ 1 tablespoon of fresh blood"**: the quantity and "fresh" can't be expressed. Plain
  `Hemoptysis` is used, so the rule **fires more often** than the page intends.
- **CD4 < 200, CD4 < 50, CD4 ≥ 200, CrAg result**: these are lab values with no observable or unit
  in the language. The CrAg branch, the "Is CD4 result available?" node and the known-TB "CD4 < 50 /
  RR-TB / pregnant" node aren't encoded. They only decide ART timing or referral.
- **Q5 "jaundice, signs of meningitis (severe headache with neck stiffness/vomiting), or signs of
  other acute illness (pneumonia or PJP)"**: you only reach it through the CD4/CrAg path. Its
  outcomes are management ("refer urgently", "treat 1-2 weeks"), so it isn't encoded.
- **Known cryptococcal meningitis, TB meningitis or brain tuberculoma**: these only set ART timing.
- **ART-naive status**: there's no concept for it (see Decisions made).

## SNOMED gaps

- "Confusion" (finding) doesn't exist. Used `Clouded consciousness` (synonym "confused"; VHA's
  ACVPU "Confused" form).
- "Agitation" (finding) doesn't exist. Used `Feeling agitated`.
- "Weight loss" (finding) doesn't exist. Used `Weight decreased`.
- "Neck stiffness" (finding) doesn't exist. Used `Stiff neck`.
- There's no concept for "breathless while talking". Used `Unable to complete a sentence in one breath`.

## Checker issues left in place

- `CHECKED FOR BUT NEVER USED AS EVIDENCE`:
  `(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Tuberculosis" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))`.
  It **is** used, as `(no …)` in `Diagnose possible TB before starting ART`. VHA renders the `(no …)`
  form as `… "Tuberculosis" "disorder") (snomed_concept "No" "qualifier value") (qualifier …Known
  present…)`, which puts the "No" before the existing qualifier. The gate's `NO_RE` only matches
  when "No" comes last, so it misses this case.

## Questions for a clinician

- Should the "signs of meningitis … refer urgently" node (Q5) also become an `Urgent` priority for a
  patient with HIV, whatever the CD4/CrAg result?
- Should "New sudden" also add the `New` qualifier, or is `Sudden onset` alone enough?
- Should the danger-sign check be limited to patients not yet on ART? If so, which recorded concept
  would mark that?
- Is `Clouded consciousness` the right concept for "confused", or would `Acute confusion` be better?
