# Page 82 – Skin symptoms: remaining questions

## Decisions made

- **Presenting complaint.** "Skin symptoms" has no single SNOMED concept and is not a recorded
  common symptom. Both tasks and the priority rule are anchored to an `or` of `Skin finding`,
  `Disorder of skin`, `Eruption` (morphologic abnormality) and, for the urgent task, `Itching`.
  `Itching` is included because SNOMED does not file it under `Skin finding`.
- **Anaphylaxis bullet** ("check for anaphylaxis 28"). The bullet gives its own criteria, so it is
  more than a pointer. It is encoded two ways: a `possible` Anaphylaxis rule, which hands off to the
  anaphylaxis page's check task, and the same criteria inside the Urgent priority rule, because the
  red box asks for urgent attention.
  - "Sudden generalised itch/rash" is encoded as `Generalized pruritus` / `Generalized rash`, each
    with the `Sudden onset` qualifier.
  - Face/tongue swelling also carries `Sudden onset`, as on the gold page 20.
  - "Exposure to possible allergen" is encoded from footnote 1 as exposure to `Drug or medicament`,
    exposure to `Food`, `Insect bite - wound` and `Insect sting`.
- **BP < 90/60** is encoded as systolic < 90 or diastolic < 60.
- **Meningococcal disease likely** → `probable` `Meningococcal infectious disease`.
  - "Purple/red rash" is encoded as `Purpuric rash` OR `Erythematous rash`.
  - "Confused" is encoded as `Acute confusion`.
- **Serious drug reaction likely** → `probable` `Adverse reaction caused by drug`.
  - "Diffuse rash" is encoded as `Generalized rash`.
  - "Appearing within 3 months of starting a new medication" is encoded as `New medication commenced`
    plus `(<= (onset …) (time_ago 3 months))`, written with `<=` because the database rejects `<`.
- **Shock/SBP < 80** is encoded on this page exactly as written: `Shock` (disorder) OR systolic BP
  < 80. Footnote 2's definition of shock is not imported, and no shared shock definition is built.
- **One Urgent priority rule:** `(and <skin complaint> (or <anaphylaxis criteria>
  (active_condition meningococcal) (active_condition drug reaction)))`.
- **Mpox** ("consider mpox 40", outside the red box) → `possible` `Monkeypox`. A separate check task
  collects lesions at the named sites, swollen lymph nodes and nasal congestion.
- **Management elements are not encoded:** fluids, ceftriaxone/ciprofloxacin, notification,
  isolation, contact prophylaxis, stopping medication, burns care, and HIV testing.

## Could not model

- **"Unexplained" rash or lesion (mpox):** the language cannot express "unexplained". The possible
  mpox rule therefore fires **more often** than the page intends: any rash with headache or cough
  triggers it.
- **The time from starting the medication to the rash's appearance:** this is approximated as "new
  medication commenced within the last 3 months". It depends on the health worker recording the
  medication start with an onset. If the rash began much later than the start, the rule can still
  fire, so it fires slightly **more often** than the page intends.
- **"Within the past few hours" for allergen exposure (footnote 1)** has no numeric limit and is not
  encoded. The anaphylaxis criteria fire **more often** than the page intends.
- **"Serious"** in "serious drug reaction" has no place on the diagnosis concept. The Urgent priority
  rule carries the seriousness.
- **"If rash is extensive, recurrent or difficult to treat, test for HIV 124"** is a management and
  test step, not a diagnosis.
- **The routing chart** (pain → 83, itch → 84/85/86, etc.) is navigation only. See the flowchart file.

## SNOMED gaps

- "Skin symptoms": no concept. An `or` of broader concepts is used instead (see above).
- "Mpox": the active FSN is `Monkeypox` (disorder). `Mpox` is a synonym only.
- "Raw areas": `Denuded skin` (disorder) is used; it was matched via the synonym "raw skin".
- "Body pain": no exact concept. `Generalized aches and pains` is used.
- "Unwell": `Generally unwell` (finding) is used.
- "Serious drug reaction": no concept for a severe or serious cutaneous adverse reaction was found
  (`Severe cutaneous adverse reaction` does not exist). `Adverse reaction caused by drug` is used.

## Checker issues left in place

- None.

## Questions for a clinician

1. Does "Purple/red rash" mean a purpuric (non-blanching) rash only, or does any red rash with
   headache or fever make meningococcal disease likely? The current encoding accepts any
   erythematous rash, which will make many febrile rashes Urgent.
2. Does "sudden" apply to face/tongue swelling as well as to the generalised itch/rash?
3. Should "Involves mouth, eyes or genitals" be read as mucosal involvement (for example,
   conjunctivitis or oral ulcers) rather than the rash itself extending to those sites?
4. For mpox, how should "unexplained" be recorded by the health worker?
