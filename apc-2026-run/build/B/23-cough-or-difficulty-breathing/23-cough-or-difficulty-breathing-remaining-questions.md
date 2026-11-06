# Page 23 – Cough or difficulty breathing: remaining questions

## Decisions made

- **Presenting complaint** is `(or Cough, Difficulty breathing)` in both tasks and the priority rule.
  Dyspnea (the recorded common symptom "Shortness of breath") is a descendant of Difficulty
  breathing, so it matches.
- **Shock/SBP < 80** is encoded as written: `(or (clinical_finding Shock) (< SBP 80))`. Footnote 1
  ("If SBP < 80, pulse ≥ 100, respiratory rate > 30, confusion/restlessness, weakness, shock likely")
  is not turned into a shock rule (shared decision: no shared shock definition).
- **Heart failure likely** = Orthopnea AND Leg swelling symptom, as a `probable` rule; the priority
  rule references `(active_condition Heart failure)`.
- **Tension pneumothorax likely** = sudden-onset dyspnoea AND (hyperresonance OR decreased breath
  sounds OR unilateral chest pain) AND trachea displaced AND BP < 90/60 (systolic < 90 or diastolic
  < 60). The priority rule references `(active_condition Tension pneumothorax)`. Commas read as AND,
  slashes as OR.
- **Swelling and pain in one calf** = Swollen calf AND Pain in calf.
- **Confused** = Clouded consciousness (SNOMED synonym "Confusion"); **agitated** = Feeling agitated.
- **Breathless while talking** = Unable to complete a sentence in one breath.
- **Cough < 2 weeks** is written `(<= (onset Cough) (time_ago 2 weeks))` because the database rejects
  `<`; the ≥ 2 weeks branch uses `>=`, so a cough of exactly 2 weeks matches both branches.
- **"Not recurrent"** and the **No** answer to the crackles question are explicit `(no …)` records.
- **Acute viral infection** = Viral respiratory infection (no "Acute viral infection" concept).
- **Post-infectious cough** = Persistent cough after viral respiratory infection; its branch uses cough
  ≥ 2 weeks or recurrent cough (difficulty breathing is excluded by the rule itself).
- **Asthma and COPD** are `possible` on any ≥ 2 weeks/recurrent cough or difficulty breathing
  ("Also consider asthma and COPD").
- Smoker "or recently stopped" = Smoker or Ex-smoker; "recently" is not modelled.
- No `measure` task: the only measurements (SpO₂, pulse, RR, BP) are routine vitals.

## Could not model

- **SpO₂ drops to < 87% on exertion (walking 15-20m)**: no observable distinguishes exertional
  saturation. Only SpO₂ < 92% is encoded (fires less often than the page intends for patients who
  desaturate only on exertion).
- **"≥ 1 tablespoon fresh blood"**: volume is not representable; any Hemoptysis matches (fires more
  often). Hemoptysis is also a Very urgent warning sign.
- **"on 1 side"** for breath sounds/resonance, and **"one" calf**: laterality not modelled except
  Chest pain + Unilateral.
- **CD4 < 200** (lab value): omitted from the PJP rule, which therefore fires more often than the
  page intends (any known HIV with long-standing dry cough and shortness of breath).
- **"Most days of 3 months for ≥ 2 years"**: encoded only as cough onset ≥ 2 years ago (fires more
  often).
- **"Persistent" snoring**, **"recent" cold**, **"recent" URTI**: no qualifier/time used.
- **Severe pneumonia (2 or more of: confusion, BP < 90/60, RR ≥ 30, age > 65)**: inside the
  management list; it selects ceftriaxone only. Age > 65 has no form in the language.
- Pneumonia risk-factor question (HIV, > 65 years, comorbidities) selects the antibiotic only.
- "Usually sudden onset fever, chills or body pain" describes viral infection; it is not a criterion.

## SNOMED gaps

- "Crackles" (finding) → used Respiratory crackles.
- "Acute viral infection" → used Viral respiratory infection.
- "Pneumocystis pneumonia" → used Pneumocystosis jirovecii pneumonia.
- "Post-infectious cough" → used Persistent cough after viral respiratory infection.
- "Weight loss" (finding) → used Weight decreased.
- "Agitation" (finding) → used Feeling agitated.
- "Unilateral chest pain" → Chest pain + Unilateral qualifier.
- "Sore chest" → Chest pain.
- Itchy nose → Itching with finding_site Nasal structure; blocked nose → Nasal congestion.
- **Frequent throat clearing**: only "Throat clearing" (observable entity) exists; no finding. Not
  encoded; the nose-problem rule uses itchy/blocked nose only.
- "Persistent" (qualifier value): none found.
- "Disorder of nose" → used Disorder of nose AND/OR nasopharynx.

## Checker issues left in place

- None.

## Questions for a clinician

- Tension pneumothorax: should "likely" need all the listed features (current encoding), or sudden
  breathlessness plus any one sign? With all features required, partial presentations are not
  flagged urgent by this item.
- Should PJP stay `probable` without CD4, or be `possible` until a CD4 form exists?
- Is "Clouded consciousness" the right concept for "confused", or "Acute confusion"?
- Is Viral respiratory infection an acceptable diagnosis for "Acute viral infection likely"?
