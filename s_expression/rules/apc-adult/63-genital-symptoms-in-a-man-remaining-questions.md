# Page 63 – Genital symptoms in a man: remaining questions

## Decisions made

- **Complaint anchor.** "Man with genital symptoms" is not a recorded common symptom or warning sign.
  The check_for task and the urgent rule use `(or Male genitalia finding, Urethral discharge)`.
  `Male genitalia finding` matches scrotal, testicular, penile, foreskin and erection findings by
  descendant; `Urethral discharge` is not under it in SNOMED, so it is added explicitly.
- **Red box → probable diagnoses + one Urgent rule.** Each "X likely" in the red box is a `probable`
  rule (torsion of testis, paraphimosis, priapism). The urgent rule is `(and complaint (or
  active_condition …))`. Level is `Urgent`: the page says "Give urgent attention" and "refer urgently",
  not "Emergency".
- **Torsion.** `(and (or scrotal swelling, scrotal pain) (or sudden-onset severe scrotal pain, testicle
  out of place, transverse lie, traumatic injury, injury of scrotum, injury of testis,
  overexertion/strenuous movements))`. Injury of scrotum and Injury of testis are not descendants of
  Traumatic injury in SNOMED, so all three are listed (reconciler merge of builds A and B).
- **Paraphimosis.** All three of: fixed retracted foreskin, swollen glans, very painful (severe) glans,
  following the page's "with".
- **Priapism.** "> 4 hours" written as `(>= (onset (clinical_finding "Prolonged erection of penis"))
  (time_ago 4 hours))`, because the database rejects `>` in onset comparisons. `>=` includes exactly
  4 hours; the page says "> 4".
- **"Treat for" boxes.** "Treat for male urethritis syndrome" is encoded as probable `Urethritis`
  from urethral discharge. "Treat for balanitis/balanoposthitis" is encoded as probable `Balanitis`
  from inflamed glans. `Balanoposthitis` is a descendant of Balanitis. This follows Will's reading
  of "Treat for anaphylaxis" on page 20. "Treat for scrotal swelling (SSW)" is not encoded (see
  SNOMED gaps).
- **Urethral discharge** is in the trigger and the urgent rule's complaint, not in `check_for`:
  the page's "Check for urethral discharge" would make the check_for item identical to the trigger,
  which Will's constraint rejects as self-referential.
- **"Exclude testicular cancer"** for a painless lump: `possible` Malignant neoplasm of testis, from a
  painless mass of scrotum or of testicle.
- No `manage` or `measure` tasks. The urine dipstick for glucose in the BAL box is a management step
  with no unit in the language.

## Could not model

- "Not needing urgent attention": the gate before the three approach columns. The MUS, BAL and
  cancer rules don't require that the urgent rule did not fire, so they fire more often than the
  page intends. This matters only when a red-box condition coexists.
- "Preceding" trauma/strenuous activity: the timing is not modelled. Any recorded traumatic injury
  or strenuous-movement event counts.
- "If glans blue/black": this changes only the paraphimosis referral. It is management.
- "Ceftriaxone treatment failure likely" (symptoms persisting at 7 days after treatment): the
  language cannot express "after treatment". Not encoded.
- "If no urethral discharge and urinary symptoms → 69", "ulcer/s present → 65" and "unable to
  retract foreskin, refer" are routing and management only.

## SNOMED gaps

- Scrotal swelling syndrome (SSW) and male urethritis syndrome: no syndromic concepts.
  `Urethritis` is used for MUS. SSW is not encoded.
- High-riding testicle: no concept. `Testicle out of place` is used (broader).
- Rotated testicle: `Testes - transverse lie` is used.
- Swollen glans, painful glans, inflamed glans: no precoordinated concepts. `Swelling`, `Pain` and
  `Inflammatory morphology` are used, each with finding_site `Glans penis structure` (verified).
- Strenuous activity: the only match is the event `Overexertion and strenuous movements`.

## Checker issues left in place

- None.

## Questions for a clinician

- "Preceding trauma" for torsion: should any recorded traumatic injury count, or only injury of the
  scrotum or testis? Both are encoded.
- "Preceding … strenuous activity" uses the SNOMED **event** `Overexertion and strenuous movements`.
  Can a health worker record this event in VHA, or should the criterion be left out (as builder A did)?
- Should "sudden severe pain" in the torsion criterion be restricted to scrotal pain, as encoded?

- Should "Treat for MUS / BAL" be diagnoses at all, or management only? And is `Urethritis` an
  acceptable stand-in for male urethritis syndrome?
- Is `Testicle out of place` an acceptable stand-in for "affected testicle higher"?
- Should a painless testicular lump also raise priority (the page only says "exclude testicular
  cancer" and "Refer")?
- Should the scrotal "painless lump" be limited to testicular masses for "Exclude testicular cancer"?
