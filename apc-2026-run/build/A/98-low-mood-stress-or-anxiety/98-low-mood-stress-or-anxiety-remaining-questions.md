# Page 98 – Low mood, stress or anxiety: remaining questions

## Decisions made

- **Red box encoded, not treated as pointer-only.** "Give urgent attention to the patient with
  suicidal thoughts or behaviour ↻ 34" names its own criterion. It is encoded as `check_for`
  Suicidal thoughts / Suicidal behavior and as `Urgent: low mood, stress or anxiety with suicidal
  thoughts or behaviour` = (complaint) AND (suicidal thoughts OR suicidal behaviour). The page-34
  cross-reference itself is not modelled.
- **Presenting complaint** = Depressed mood (for "low mood") OR Stress OR Anxiety (all `finding`).
  None of them is a recorded common symptom or warning sign, so the task fires only when one of
  these findings has been recorded.
- **"≥ 3 of"**: the language has only `any2`. "At least 3 of a…f" is written exactly as
  `(or (and a (any2 b…f)) (and b (any2 c…f)) (and c (any2 d e f)) (and d (any2 e f)))`, and for
  PTSD's four groups as `(or (and g1 (any2 g2 g3 g4)) (and g2 g3 g4))`.
- **GAD likely → probable** Generalized anxiety disorder: excessive worry (Worried + Excessive
  qualifier) with onset ≥ 6 months ago, and ≥ 3 of muscle tension, restlessness, irritability
  (Feeling irritable), difficulty sleeping, poor concentration, tiredness (Fatigue).
- **PTSD likely → probable** Post-traumatic stress disorder: anxiety with onset ≥ 1 month ago
  (the page says "> 1 month"; the database accepts only `>=`/`<=`), Victim of psychological trauma
  ("linked to a bad experience"), and ≥ 3 of: nightmares OR flashbacks; avoidance behaviour;
  hypervigilant behaviour; emotionally detached OR derealization.
- **Not encoded (no "likely"/"consider" wording):** phobia/panic ("discuss/refer"); the depression
  screening questions (→ 159); substance use (→ 165); abuse (→ 33); stressors, palliative care,
  older-person loneliness; women's health (postnatal care, menopause); medication review; the whole
  "Advise" section and the review interval. These are routing or management.

## Could not model

- **GAD "causes impaired function/distress"**: no SNOMED concept for impaired function and no way
  to express causation. Left out, so the GAD rule fires **more often** than the page intends.
  (Requiring Distress alone would make it fire less often, by excluding impaired function only.)
- **"Linked to a bad experience"** (PTSD): the link between the anxiety and the trauma cannot be
  expressed; the rule requires both to be recorded.
- **"> 1 month"** written as `>=` 1 month (one-day difference at the boundary).
- **"Excessive" worry** depends on the health worker recording the Excessive qualifier.

## SNOMED gaps

- "Low mood": no concept; Depressed mood (finding) used.
- "Excessive worry": no precoordinated concept; Worried (finding) + Excessive (qualifier value).
- "Irritability": no exact FSN; Feeling irritable (finding).
- "Tiredness": no exact FSN; Fatigue (finding).
- "Easily startled": no suitable concept (Predisposed to startle is a character trait); only
  Hypervigilant behavior encodes "constantly on guard/easily startled".
- "Feels numb": no emotional-numbness concept; Emotionally detached covers it.
- "Impaired function": no general concept.

## Checker issues left in place

- None.

## Questions for a clinician

- Should the red box be urgent for any patient with suicidal thoughts/behaviour, regardless of
  whether low mood, stress or anxiety is recorded? (Encoded within the page's complaint.)
- GAD: should "impaired function/distress" be required (e.g. as Distress), accepting that the rule
  will then miss patients recorded only with impaired function?
- Should "easily startled" be recorded with a separate concept (e.g. Predisposed to startle)?
- Should phobia/panic ("discuss/refer") produce a `possible` Phobia / Panic disorder diagnosis?
