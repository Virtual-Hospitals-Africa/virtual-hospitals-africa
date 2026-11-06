# Page 98 – Low mood, stress or anxiety: remaining questions

## Decisions made

- **Red box as a priority rule.** "Give urgent attention to the patient with suicidal thoughts or
  behaviour ↻ 34" states its own urgency criterion, so it is encoded as `Urgent` on
  (low mood/stress/anxiety **and** (Suicidal thoughts **or** Suicidal behavior)), with a `check_for`
  task. It is not treated as a pointer-only box. Page 34's own logic is not imported.
- **Trigger** = `Depressed mood`, `Stress` or `Anxiety` (finding). There is no "Low mood" concept;
  `Depressed mood` is used. None of the three is a recorded common symptom or warning sign, so the
  tasks only fire if one of these is recorded (for example from another page's `check_for`).
- **"≥ 3 of"** is not in the language (only `any2`). It is expanded exactly: the first present
  item plus `any2` of the items after it, e.g. for four groups `(or (and a (any2 b c d)) (and b c d))`.
- **GAD**: "excessive worry … for at least 6 months" → `(>= (onset Worried+Excessive) (time_ago 6 months))`;
  "impaired function/distress" → `Distress`; tiredness → `Fatigue` (common-symptom form).
- **PTSD**: "anxiety > 1 month" → `(>= (onset Anxiety) (time_ago 1 months))` (`>` is rejected by the
  database); "linked to a bad experience" → `Victim of psychological trauma`; each of the four
  slash-groups is an `or` counted once.
- **Not encoded**: phobia/panic ("discuss/refer", neither "likely" nor "consider"); the depression,
  substance-use, abuse, stressors, women's health and medication rows (pointers to 159, 165, 33,
  74, 191, 182, 187 or management); all advice; the review interval; the drink-size footnote.
- **"If patient known with depression, give routine depression care instead → 160"** is routing and
  is not modelled as an exclusion on the triggers.

## Could not model

- **"Impaired function"** (GAD): no SNOMED concept for impaired daily functioning. Only `Distress`
  is required, so the GAD rule fires **less often** than the page intends (impaired function without
  recorded distress is missed).
- **"Linked to" a bad experience** (PTSD): the causal link cannot be expressed; the rule requires
  anxiety and trauma together, so it may fire **more often** (unrelated trauma).
- **"Feels numb"**: only the physical `Numbness` exists; covered by `Emotionally detached` /
  `Derealization`.
- **"> 1 month"** encoded as `>=` (boundary case at exactly 1 month fires).
- Depression screening questions (past month low mood / anhedonia) route to page 159 and are not
  diagnosis rules on this page.

## SNOMED gaps

- "Low mood" → `Depressed mood` (finding).
- "Excessive worry" → `Worried` (finding) + `Excessive` (qualifier value).
- "Irritability" → `Feeling irritable` (finding); `Hyperirritability` is neonatal/neurological.
- "Easily startled" → `Predisposed to startle` (finding); no "exaggerated startle response".
- "Constantly on guard" → `Hypervigilant behavior` (finding).
- "Flashbacks" → `Flashback due to and following trauma` (finding).
- "Impaired function" → none found (searched "Impaired function", "Functional impairment",
  "functioning", "psychosocial functioning").
- "Feels numb" (emotional) → none found.

## Checker issues left in place

- None.

## Questions for a clinician

- Should the urgent rule fire on suicidal thoughts/behaviour alone, regardless of the presenting
  complaint? The page scopes the box to this page's patients, so the complaint is required.
- Is `Victim of psychological trauma` an acceptable reading of "a bad experience"?
- Is `Predisposed to startle` (a character-trait finding) acceptable for "easily startled"?
- Should "known with depression" suppress this page's tasks?
- Should phobia and panic get `possible` diagnoses, even though the page only says "discuss/refer"?
