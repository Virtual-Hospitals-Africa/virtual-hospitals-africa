# Page 82 – Skin symptoms: remaining questions

## Decisions made

- **Trigger.** "Skin symptoms" is not a recorded common symptom or warning sign. Both tasks are
  triggered by `(or (clinical_finding Skin finding) (clinical_finding Itching))`, relying on
  descendant matching. `Itching` is added because SNOMED does not file it under `Skin finding`,
  while the page lists Itch among the skin symptoms. Face/tongue swelling is not a skin finding, so
  a patient presenting only with face swelling will not trigger the task from this page.
- **Priority rules do not repeat the trigger.** Every red-box group already starts with a skin sign
  (itch/rash/swelling, purple/red rash, diffuse rash), so the Urgent rules are not wrapped in
  `(and <Skin finding> …)`.
- **Anaphylaxis bullet ("check for anaphylaxis 28").** Encoded as a `possible` Anaphylaxis rule
  (which raises page 28's check task) and an Urgent priority rule on the same evidence, written out
  in full rather than via `(active_condition Anaphylaxis)`, so it does not depend on page 28.
  "Sudden" is the `Sudden onset` qualifier on itch, rash and face/tongue swelling, as on page 20.
- **Exposure to possible allergen** expanded per footnote 1 into exposure to Drug or medicament,
  exposure to Food, Insect bite - wound and Insect sting. "Within the past few hours" not modelled.
- **BP < 90/60** = systolic < 90 or diastolic < 60.
- **Shock/SBP < 80** (drug reaction) = `(or (clinical_finding Shock) (< SBP 80))`, as the page's own
  logic. Footnote 2 ("If SBP < 80, pulse ≥ 100, RR > 30, decreased LOC, weakness, shock likely") is
  not built into a shock definition (shared decision; also unclear whether any-of or all-of).
- **Purple/red rash** = Purpuric rash or Erythematous rash (literal reading; unsettled, see questions).
- **Within 3 months of starting a new medication** = `(<= (onset (clinical_finding New medication
  commenced)) (time_ago 3 months))` (only `<=`/`>=` allowed in onset comparisons).
- **Serious drug reaction** = `Adverse reaction caused by drug` (disorder), diagnosed `probable`.
- **Involves mouth, eyes or genitals** (the diffuse rash involves them) = `Eruption` (morphologic
  abnormality) with finding_site Oral cavity structure / Structure of eye proper / Genital structure.
  The mpox "lesion/s of … genitals/anus/rectum/mouth/eyes" use `Lesion` with the same sites plus
  Anal structure and Rectum structure, checked in the mpox task.
- **Unwell, malaise** are encoded separately: `Generally unwell` and `Malaise`.
- **Consider mpox** → `possible` Monkeypox rule; its extra findings are in a second check task.

## Could not model

- "**Unexplained** rash or lesion/s" (mpox): no way to express "unexplained". The rule fires on any
  rash plus one systemic feature, i.e. **more often** than the page intends (it is only `possible`).
- "Diffuse rash appearing within 3 months **of starting** a new medication": the language cannot
  compare the rash onset with the medication start. The rule checks that a new medication was
  started within the last 3 months and that a generalised rash is present now. A rash that appeared
  within 3 months of a medication started longer ago (e.g. 4 months ago, rash 2 months later) is
  missed (**less often**).
  Conversely, a rash that began before the medication was started still matches (**more often**).
- "**Serious**" in "serious drug reaction" has no place on the diagnosis concept; the Urgent
  priority rule carries the seriousness.
- "Within the past few hours" for allergen exposure (footnote 1).
- "If rash is extensive, recurrent or difficult to treat, test for HIV 124": a test instruction,
  not a diagnosis; not modelled.
- The routing tree (pain 83, itch 84–86, non-itchy rash 87, lumps 89, ulcers 90, crusts/flaky 93,
  colour 94, scalp 95): routing to other pages, not modelled.
- All management (fluids, ceftriaxone, notification, contact prophylaxis, stop medication, burns).

## SNOMED gaps

- No "Mpox" FSN: used `Monkeypox` (disorder).
- No "serious/severe drug reaction" concept: used `Adverse reaction caused by drug` (disorder).
- No "Confusion" (finding): used `Acute confusion`.
- "Unwell": `Generally unwell` (finding).
- "Raw areas": `Denuded skin` (disorder), matched via the synonym "raw skin".
- "Body pain": no exact concept; `Generalized aches and pains` is used.
- "Skin symptoms": no concept; `Skin finding` or `Itching` is used.
- No "allergen" substance: used the footnote's medication/food/insect items.
- No "Shock" finding: used `Shock` (disorder).
- No precoordinated "rash of mouth/eye" or "lesion of anus/rectum": `Lesion` + finding_site.

## Checker issues left in place

- None.

## Questions for a clinician

- Should "purple/red rash" include any erythematous rash (literal reading, used now), or only
  purpuric / petechial rash? The literal reading makes any red rash with headache or fever
  "meningococcal disease likely" and Urgent.
- Is `Adverse reaction caused by drug` acceptable as the diagnosis for "serious drug reaction", or
  should the diagnosis be a specific entity (SJS/TEN, DRESS)?
- Should "Involves mouth, eyes or genitals" be read as mucosal involvement (for example,
  conjunctivitis or oral ulcers) rather than the rash itself extending to those sites? And should
  "eyes" include the eyelids and periorbital skin (`Eye region structure`) or only the eye itself?
- Does "sudden" apply to face/tongue swelling as well as to the generalised itch/rash?
- Should a patient with sudden face/tongue swelling but no skin finding still reach the urgent
  anaphylaxis rule from this page (it will, via the priority rule, if those findings are recorded
  elsewhere; but this page's check task will not be raised)?
- For mpox, how should "unexplained" be recorded by the health worker?
