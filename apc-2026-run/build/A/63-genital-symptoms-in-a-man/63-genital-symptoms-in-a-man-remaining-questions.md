# Page 63 – Genital symptoms in a man: remaining questions

## Decisions made

- **Presenting complaint.** "Man with genital symptoms" is `(clinical_finding "Male genitalia finding")`.
  It is not a recorded common symptom or warning sign. Its descendants (scrotal swelling and pain,
  fixed retracted foreskin, prolonged erection, testicular and scrotal mass, and scrotal injury)
  match the trigger automatically. Urethral discharge is **not** a descendant, so a man who records
  only urethral discharge does not get the check task. The urethritis rule still fires directly.
- **Red box → one `Urgent` priority rule** referencing the three `probable` diagnoses (torsion of
  testis, paraphimosis, priapism) as `active_condition`. The page says "Give urgent attention", so it
  does not escalate to Very urgent or Emergency.
- **Torsion.** (Scrotal swelling **or** scrotal pain) **and** (sudden-onset severe scrotal pain **or**
  injury of scrotum **or** injury of testis). Injury of testis is not a descendant of Injury of
  scrotum, so both are listed.
- **Paraphimosis.** Fixed, retracted foreskin **and** swelling of the glans **and** severe pain of the
  glans. "Very painful" is the Severe qualifier.
- **Priapism.** The page says "> 4 hours". I wrote `(>= (onset Prolonged erection of penis) (time_ago 4 hours))`
  because the database rejects `>` in onset comparisons. The rule therefore also fires at exactly
  4 hours.
- **"Treat for MUS" and "Treat for BAL" as `probable` diagnoses.** I followed the gold page 20, where
  "Treat for anaphylaxis" became the probable diagnosis. MUS → `Urethritis` (disorder) from
  urethral discharge. BAL → `Balanitis` (disorder; Balanoposthitis is its descendant) from inflamed
  glans. The reconciler may prefer to treat these as management instead.
- **"Exclude testicular cancer" → `possible`** Malignant neoplasm of testis, from a painless mass of
  the testicle or the scrotum. The page says only "lump", and Mass of testicle is not under Mass of
  scrotum.

## Could not model

- **"Affected testicle higher/rotated"** (torsion): no SNOMED finding exists for it. The torsion rule
  fires less often than the page intends.
- **"Preceding … strenuous activity"** (torsion): only `Overexertion` / `Overexertion and strenuous
  movements` (event) exist. They are events, not clinical findings, so I left the criterion out.
  The rule fires less often than the page intends.
- **"Preceding"** trauma is not a time comparison. Any recorded scrotal or testicular injury counts.
- **"Ceftriaxone treatment failure likely"** (symptoms persist 7 days after MUS treatment): the
  language cannot express treatment history. Not encoded.
- **Treat for scrotal swelling (SSW):** see SNOMED gaps.
- Management (referral, manual reduction, blue/black glans → refer, medicines, partner
  notification) is out of scope.

## SNOMED gaps

- Testicle higher/rotated: nothing found (searched "testis high", "horizontal lie", "abnormal
  position testis"). Only `Position of testicle` (observable entity) exists.
- Strenuous activity: only event concepts (`Overexertion` "event"). No finding.
- Scrotal swelling syndrome (SSW) and male urethritis syndrome (MUS): no syndromic concepts.
  MUS uses `Urethritis`. SSW is not encoded.
- "Glans inflamed": no precoordinated finding. I used `Inflammatory morphology` (morphologic
  abnormality) with finding_site `Glans penis structure`.

## Checker issues left in place

- None.

## Questions for a clinician

- Should the syndromic "Treat for MUS / SSW / BAL" steps produce diagnoses, as encoded here for MUS
  and BAL? Or should they stay as management only?
- Should "sudden severe pain" in the torsion criterion be restricted to scrotal pain, as encoded?
- Should the scrotal "painless lump" be limited to testicular masses for "Exclude testicular cancer"?
