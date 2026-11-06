# Page 53 – Throat symptoms: remaining questions

## Decisions made

- **Presenting complaint.** "Throat symptoms" is anchored to the common symptom `Sore throat`
  for both tasks, the urgent priority rule and the possible-anaphylaxis rule. A patient whose only
  throat symptom is difficulty swallowing will not trigger the red box.
- **Red box.** `Urgent: throat symptoms with danger signs` = sore throat **and** any of: unable to
  open mouth; unable to swallow; pharyngeal swelling **with** upper respiratory tract obstruction
  ("red swelling blocking airway"); sudden face/tongue swelling **with** any of generalised itch,
  rash, wheeze, difficulty breathing, BP < 90/60 (systolic < 90 or diastolic < 60), dizziness,
  collapse, abdominal pain, vomiting, or exposure to a possible allergen (medication, food, insect
  bite/sting, from footnote 1).
- **"Check for anaphylaxis 28"** is also encoded as `Consider anaphylaxis with throat symptoms`
  (`possible` anaphylaxis), so the anaphylaxis page's check task is triggered.
- **Diphtheria** ("Consider") is `possible`, on sore throat and pseudomembrane in pharynx or nose.
  "With or without mild fever" does not change the branch, so fever is not used. No priority rule:
  the page does not place diphtheria in the red box.
- **Bacterial tonsillopharyngitis likely** → `probable` Bacterial tonsillitis: sore throat, recorded
  *no* pseudomembrane (pharynx and nose), tonsil swelling, and any of exudate on tonsils, *no*
  cough, *no* nasal discharge.
- **Viral tonsillopharyngitis likely** → `probable` Viral tonsillitis: the "No" branch of the tonsil
  question, i.e. (*no* tonsil swelling **and** red throat) or (tonsil swelling **and** *no* exudate
  **and** cough **and** nasal discharge), after recorded *no* pseudomembrane. Red throat is required
  when tonsils are not swollen because the viral box says "red throat and/or swollen tonsils".
- **Oesophageal candida likely** → `probable` Candidiasis of esophagus on (difficulty swallowing or
  painful swallowing) and white patches on oral mucosa. Sore throat is not required in this rule.
- Age group `adult` throughout, including the priority rule.

## Could not model

- "Unable to swallow **at all**": no qualifier for completeness; `Unable to swallow` is used.
- "**Red** swelling": redness of the swelling is not encoded.
- "**Thick grey** layer": colour/thickness of the pseudomembrane is not encoded.
- "Generalised" itch is precoordinated (Generalized pruritus) but "generalised" rash is plain Eruption,
  so a local rash also counts (fires more often than the page intends).
- "Exposure to possible allergen ... within the past few hours" (footnote 1): the time window is not
  modelled; any recorded exposure counts.
- "If food/liquid gets stuck with swallowing, refer": a referral instruction (management); no finding
  is checked for it.
- "Bleeding" in the throat examination list leads to no decision on this page, so it is not checked
  for (a check_for item must be used as evidence).
- "Tender neck lymph nodes" in the viral box is descriptive and not required by the viral rule.
- "If ≤ 21 / > 21 years old", "≥ 6 episodes per year": management branches; not modelled.

## SNOMED gaps

- No "tonsillopharyngitis" concept: used `Bacterial tonsillitis` (child of Infective pharyngitis)
  and `Viral tonsillitis` (child of Viral pharyngitis).
- No plain "Diphtheria" disorder: used `Diphtheria caused by Corynebacterium diphtheriae`.
- No "Swollen tonsils" finding: used `Swelling` with finding site `Palatine tonsillar structure`
  (`Large tonsils` and `Hypertrophy of tonsils` exist but describe size, not acute swelling).
- No generic "Airway obstruction": used `Upper respiratory tract obstruction` (disorder).
- No "Oesophageal candidiasis": used `Candidiasis of esophagus`.
- "Pain on swallowing" → `Swallowing painful`; "Red throat" → `Redness of throat`; pus/white patches on
  tonsils → `Exudate on tonsils`.

## Checker issues left in place

- `(no (finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Pseudomembrane" "morphologic abnormality") (snomed_concept "No" "qualifier value") (attribute (snomed_concept "Finding site" "attribute") (snomed_concept "Pharyngeal structure" "body structure"))))`. The positive finding is checked for in 'Assess throat symptoms not needing urgent attention'. The gate appears not to match a (no X) whose X carries a finding_site (it does match (no Cough) etc.). Faithful encoding kept.
- `(no (finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Pseudomembrane" "morphologic abnormality") (snomed_concept "No" "qualifier value") (attribute (snomed_concept "Finding site" "attribute") (snomed_concept "Nasal structure" "body structure"))))`. The positive finding is checked for in 'Assess throat symptoms not needing urgent attention'. The gate appears not to match a (no X) whose X carries a finding_site (it does match (no Cough) etc.). Faithful encoding kept.
- `(no (finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Swelling" "finding") (snomed_concept "No" "qualifier value") (attribute (snomed_concept "Finding site" "attribute") (snomed_concept "Palatine tonsillar structure" "body structure"))))`. The positive finding is checked for in 'Assess throat symptoms not needing urgent attention'. The gate appears not to match a (no X) whose X carries a finding_site (it does match (no Cough) etc.). Faithful encoding kept.

## Questions for a clinician

- Should the red box also fire for throat complaints other than sore throat (e.g. difficulty or
  painful swallowing with inability to open the mouth)?
- Viral rule: is "no swollen tonsils and red throat" the right reading of the No branch, or should
  any sore throat without the bacterial features count as viral?
- Bacterial/viral rules need an explicit "No" for pseudomembrane at both pharynx and nose. Is that
  workable at the point of care, or should a single pseudomembrane finding be used?
- Is "Food" (in general) the intended allergen exposure, or the page-20 list of specific foods?
