# Page 53 – Throat symptoms: remaining questions

## Decisions made

- **Trigger (reconciled).** "Throat symptoms" has no SNOMED concept. The red-box task
  (`Check for urgent throat symptom conditions`), the Urgent rule and the possible-anaphylaxis
  rule use `(or Sore throat, Difficulty swallowing, Swallowing painful)`, so a patient whose throat
  symptom is a swallowing problem still gets the red-box check. The Assess task and the bacterial /
  viral tonsillopharyngitis rules use `Sore throat`. This lets the Assess task check for
  difficulty and pain on swallowing ("Ask about swallowing problems"), which constraint 3 would
  forbid if they were in its own `due_to`. Side effect: a patient presenting only with a
  swallowing problem is not walked through the Assess box (white patches, pseudomembrane, tonsils).
- **Red box → `Urgent: throat symptoms with danger signs`.** "Refer urgently" means `Urgent`, not
  Emergency. This page doesn't escalate further. A recorded `Upper respiratory tract obstruction`
  also matches the existing Emergency warning sign `Respiratory obstruction` by descent.
- **"Red swelling blocking airway"** is encoded as `(and Pharyngeal swelling, Upper respiratory
  tract obstruction)`. "Red" isn't coded separately.
- **The anaphylaxis bullet** is not treated as a pointer only, because it lists its own criteria.
  It is encoded twice: as part of the Urgent rule, and as a `possible` anaphylaxis diagnosis
  (throat symptom AND sudden face/tongue swelling AND any of the listed features), so that page
  28's anaphylaxis check is triggered ("check for anaphylaxis 28").
- **"Generalised itch/rash"** → `Generalized pruritus` or `Generalized rash`. **BP < 90/60** →
  systolic < 90 or diastolic < 60.
- **"Exposure to possible allergen¹"**: footnote 1 lists medication, food or insect bite/sting.
  These are encoded as exposure to `Drug or medicament`, exposure to `Food`, `Insect bite - wound`
  and `Insect sting`.
- **Oesophageal candida likely** → probable `Candidiasis of esophagus` from (difficulty or pain on
  swallowing) AND white patches on oral mucosa.
- **Q1 = Yes** → possible `Diphtheria caused by Corynebacterium diphtheriae` from sore throat AND
  a pseudomembrane in the pharynx or nose. Mild fever is "with or without", so it is not required.
- **Q1 = No** is encoded as "no pseudomembrane in throat and none in nose". The full negation would
  also allow "no sore throat". That was left out because every patient on this flow already has a
  throat symptom.
- **Q2 = Yes** → probable `Bacterial tonsillitis`: swollen tonsils AND (exudate on tonsils OR no
  cough OR no runny nose), plus Q1 = No.
- **Q2 = No** → probable `Viral tonsillitis`: (no swollen tonsils) OR (swollen tonsils without
  exudate, with cough and runny nose), plus Q1 = No. A positive anchor (red throat or swollen
  tonsils) comes from the descriptive box on that branch, so the rule doesn't fire on absences
  alone.
- **"Tonsillopharyngitis"** has no SNOMED concept. `Bacterial tonsillitis` (is-a Infective
  pharyngitis) and `Viral tonsillitis` (is-a Viral pharyngitis) were used.
- **"Check for … bleeding"** isn't in any `check_for`, because no decision on the page uses it
  (Will's constraint 2).
- **No `measure` task.** Pulse, BP and oxygen saturation for diphtheria are routine vitals and
  part of management.

## Could not model

- "Unable to swallow **at all**": no qualifier for completeness; `Unable to swallow` is used.
- "**Thick grey** layer": colour/thickness of the pseudomembrane is not encoded.

- "If food/liquid gets stuck with swallowing, refer": this is a referral (management) with no
  diagnosis, so it isn't encoded.
- "Within the past few hours" (footnote 1): the page gives no number, so it has no time
  comparison. Exposures recorded in the current encounter count as recent. This fires more
  often than the page intends.
- The supporting features of bacterial tonsillopharyngitis (rash, red spots, strawberry tongue)
  are "may also have". They are not diagnostic criteria, so they aren't encoded.
- "Tender neck lymph nodes" in the viral descriptive box isn't required, so the viral rule
  fires more often than a reading that needs every listed feature.
- Age split (≤ 21 / > 21 years), antibiotics, recurrent episodes (≥ 6 per year): these are
  management.

## SNOMED gaps

- No "Throat symptom" finding. The substitute is the three-finding `or` above.
- No "tonsillopharyngitis" concepts (bacterial or viral). The substitutes are Bacterial
  tonsillitis and Viral tonsillitis.
- No "Diphtheria" disorder by that exact name. The substitute is `Diphtheria caused by
  Corynebacterium diphtheriae`.
- No precoordinated "pharyngeal/nasal pseudomembrane". The substitute is `Pseudomembrane`
  (morphologic abnormality) with finding site `Pharyngeal structure` / `Nasal structure`, both
  verified.
- No "Allergen" substance. The substitute is the footnote's allergen classes.

## Checker issues left in place

> **Note, 2026-11-05.** The gate's `(no X)` pattern was fixed on 2026-11-05: it now recognizes `(no X)` when X has a qualifier or finding site. The gate no longer reports the findings below. Will's PR #1310 test may still flag the `(no X)` forms, because it wants `(no X)` itself checked for; see `RUN-REPORT.md`, "What the test result means".

- `PROBABLE DIAGNOSIS EVIDENCE NOT CHECKED FOR`:
  `(no (finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Pseudomembrane" "morphologic abnormality") (snomed_concept "No" "qualifier value") (attribute (snomed_concept "Finding site" "attribute") (snomed_concept "Pharyngeal structure" "body structure"))))`
- `PROBABLE DIAGNOSIS EVIDENCE NOT CHECKED FOR`:
  `(no (finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Pseudomembrane" "morphologic abnormality") (snomed_concept "No" "qualifier value") (attribute (snomed_concept "Finding site" "attribute") (snomed_concept "Nasal structure" "body structure"))))`

  Reason (both): the gate's `NO_RE` expects the `No` qualifier last. When the finding has a
  finding site, the canonical form puts `No` before the attribute, so `(no X)` isn't mapped back
  to X. Both pseudomembranes are checked for in `Assess throat symptoms not needing urgent
  attention`. This is a tool problem, not a missing check.

## Questions for a clinician

- Viral rule: is "no swollen tonsils and red throat" the right reading of the No branch, or should
  any sore throat without the bacterial features count as viral?
- Bacterial/viral rules need an explicit "No" for pseudomembrane at both pharynx and nose. Is that
  workable at the point of care, or should a single pseudomembrane finding be used?
- Is "Food" (in general) the intended allergen exposure, or the anaphylaxis page's list of specific foods?

- Should "throat symptoms" include anything beyond sore throat and difficult or painful
  swallowing (e.g. hoarseness, throat irritation)? And should a patient presenting only with
  difficult or painful swallowing go through the Assess box and flowchart (the final build sends
  them through the red-box check only)?
- Is "Red swelling blocking airway" better recorded as airway obstruction alone? If so, the
  `and` with pharyngeal swelling makes the rule fire less often.
- On the viral branch, is the descriptive box ("Red throat and/or swollen tonsils, tender neck
  lymph nodes, cough, runny nose") a requirement or only a description? We required only red
  throat or swollen tonsils.
- Does the "Check for … white patches" step refer to tonsillar exudate (as encoded) or to oral
  white patches (candida)?
