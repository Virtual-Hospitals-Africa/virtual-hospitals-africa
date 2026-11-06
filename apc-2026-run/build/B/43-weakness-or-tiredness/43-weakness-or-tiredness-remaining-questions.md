# Page 43 – Weakness or tiredness: remaining questions

## Decisions made

- **Presenting complaint.** Tiredness is `Fatigue` (a recorded common symptom). Weakness is
  `Asthenia`, because SNOMED has no "Weakness" finding. Every rule on the page requires one of them,
  because the red box applies only to "the patient with weakness or tiredness".
- **Stroke/TIA signs.** "New sudden asymmetric weakness or numbness of face, arm or leg" is encoded as
  six findings (weakness or numbness of face, upper limb, lower limb), each qualified `Sudden onset`.
  "Difficulty speaking" (`Difficulty talking`) and "visual disturbance" are not qualified, because
  "New sudden" grammatically governs only the clause before the semicolon. "consider stroke or TIA"
  becomes two `possible` rules (`Cerebrovascular accident`, `Transient ischemic attack`).
- **Glucose.** `< 3`, or `< 4` together with known diabetes (`Diabetes mellitus` + `Known present`,
  same form in the `check_for` and the priority rule), or `>= 11.1` mmol/L.
- **Heart failure likely** → `probable` heart failure from orthopnea **and** leg swelling; the
  priority rule references `(active_condition Heart failure)`.
- **Dehydration likely** → `probable` dehydration from **any one** of thirst, dry mouth, decreased skin
  turgor, systolic < 90 or diastolic < 60 (BP < 90/60 per Will's convention); the priority rule
  references `(active_condition Dehydration)`.
- **Temperature ≥ 38 °C now or in past 3 days** → measured temperature ≥ 38 or `(active_condition
  Fever)`. No onset window was added, because a fever that began more than 3 days ago and is still
  present is also a fever "in the past 3 days".
- **Priority level** is `Urgent` throughout, as the red box says "give urgent attention". Chest pain
  carries its own Very urgent warning sign elsewhere.
- **No shock wording** on this page, so the shared shock decision does not apply.
- The lower half of the page (approach for patients not needing urgent attention, muscle weakness
  on examination, duration < 1 month / ≥ 1 month) only routes to investigations, cross-references and
  referral. It reaches no "likely" or "consider" diagnosis that the language can express, so it is
  not modelled (see flowchart file).

## Could not model

- **Hb < 6** (red box): there is no haemoglobin observable or unit. Omitted, so the priority rule
  fires **less often** than the page intends (a weak patient with Hb < 6 and no other sign is not
  flagged).
- **"Check Hb. If < 12 (woman) or < 13 (man), anaemia likely"** (outside the box): same gap, and it
  also needs sex. Not encoded; page 44 covers anaemia.
- **"asymmetric"** and **"New"** are not added as qualifiers on the stroke signs, so the rules fire
  **more often** (for example for sudden bilateral weakness).
- **"in past 3 days"** is approximated by any recorded fever, so the rule fires **more often**
  (a fever recorded long ago in history also counts).
- `(active_condition Heart failure)` also matches known heart failure from history, so the priority
  rule fires **more often** than "heart failure likely" from today's findings alone.

## SNOMED gaps

- "Weakness" (finding): not found; `Asthenia` used.
- "Difficulty speaking" (finding): not found; `Difficulty talking` used.
- "Thirst" (finding): not found; `Thirst due to water deprivation` (VHA vocabulary) used. `Increased
  thirst` is an alternative.
- "Dry mouth" (finding): not found as a name; `Xerostomia` used.

## Checker issues left in place

- None.

## Questions for a clinician

- Dehydration: should **any one** of thirst, dry mouth, poor skin turgor or BP < 90/60 make
  dehydration likely, or does the page mean the combination (all, or at least two)?
- Do "difficulty speaking" and "visual disturbance" need to be new and sudden to count, as the
  weakness and numbness must?
- Blood glucose is only on VHA's vitals form for patients with diabetes. Should weakness or
  tiredness trigger a glucose measurement for everyone, so the glucose criteria can fire? (No
  `measure` task was added, following Will's rule that glucose is a routine vital.)
- Is `Asthenia` the right recorded concept for the complaint "weakness"?
