# Page 43 – Weakness or tiredness: remaining questions

## Decisions made

- **Presenting complaint** is `Fatigue` (a recorded common symptom; `Tired` is its child) or
  `Asthenia` (SNOMED has no plain "Weakness" finding; `Asthenia` is the suggested match). It is
  the `due_to` of the `check_for` task and the first conjunct of the urgent rule
  (`(and <complaint> (or …red box…))`). `Muscle weakness` was not added to the trigger because the
  red box's limb-weakness items are its descendants.
- **Stroke/TIA item** ("New sudden asymmetric weakness or numbness of face, arm or leg; difficulty
  speaking or visual disturbance: consider stroke or TIA"): six weakness/numbness findings (face,
  upper limb, lower limb) with `Sudden onset` + `Asymmetry` qualifiers; `Speech problem` and
  `Visual disturbance` with `Sudden onset`. "New" is taken as implied by sudden onset. These feed
  the urgent rule directly and two `possible` rules (Cerebrovascular accident, Transient ischemic
  attack), since the page says "consider".
- **Glucose**: `< 3`, or `< 4` **and** known diabetes (`Diabetes mellitus` + `Known present`, the
  same form checked for and used), or `≥ 11.1` mmol/L.
- **Heart failure likely**: `probable` Heart failure from `Orthopnea` **and** `Leg swelling symptom`;
  the urgent rule references `(active_condition Heart failure)`.
- **Dehydration likely**: `probable` Dehydration from **any** of increased thirst, xerostomia,
  decreased skin turgor, systolic < 90 or diastolic < 60 (BP < 90/60 per Will's convention); the
  urgent rule references `(active_condition Dehydration)`. See questions: the page's comma list
  could also mean all of them.
- **Worsening weakness of leg/s**: `Weakness of muscle of lower limb` + `Worsening` qualifier.
- **Temperature ≥ 38 °C now or in past 3 days**: body temperature ≥ 38, or
  `(active_condition Fever)`.
- **Vocabulary deviations**: `Increased thirst` instead of `Thirst due to water deprivation`, and
  `Xerostomia` instead of `Xerostomia due to dehydration`; both vocabulary terms assert a cause the
  page does not state. `Speech problem` and `Leg swelling symptom` were taken from the vocabulary.
- **Lower half of the page** (checks of symptoms, medications, mental health, long-term
  conditions; muscle weakness on examination Yes/No; duration < 1 / ≥ 1 month) ends only in
  investigations, referral, reassurance and cross-references, so it adds no rules. The flowchart
  file records it.
- No `measure` task: glucose, temperature, RR and BP are routine vitals. No `manage` tasks.

## Could not model

- **Hb < 6** (red box): no haemoglobin observable/unit in the language. The urgent rule therefore
  **fires less often** than the page intends (a tired patient whose only red-box finding is
  Hb < 6 is not flagged).
- **"Check Hb. If < 12 (woman) or < 13 (man), anaemia likely"** (outside the red box): not
  representable for the same reason; no probable anaemia rule.
- **"in past 3 days"** for fever: `(active_condition Fever)` has no 3-day window, so this branch can
  **fire more often** than the page intends (an older, still-active fever record counts). The
  alternative `(<= (onset …) (time_ago 3 days))` would miss a fever that began more than 3 days ago
  and persisted.
- "Muscle weakness on examination" and duration of tiredness are routing questions that lead only
  to management; not encoded.

## SNOMED gaps

- "Weakness" (finding): does not exist; used `Asthenia`.
- "Difficulty speaking" (finding): does not exist; used `Speech problem` (vocabulary; `Difficulty
  talking` also exists).
- "Thirst" (finding) and "Dry mouth" (finding): do not exist; used `Increased thirst` and
  `Xerostomia`.
- "Asymmetrical" (qualifier value): does not exist; used `Asymmetry`.

## Checker issues left in place

- None.

## Questions for a clinician

1. Dehydration: does "Thirst, dry mouth, poor skin turgor, BP < 90/60, dehydration likely" mean any
   one sign, all of them, or some combination? The build reads it as any one, so e.g. thirst alone
   makes dehydration probable and the patient urgent.
2. Should "new sudden" also govern "difficulty speaking or visual disturbance"? The build applies
   `Sudden onset` to both.
3. Is `Asymmetry` the right way to record one-sided weakness/numbness, or should laterality
   (left/right) be recorded instead?
4. Is a still-active fever older than 3 days meant to count as "temperature ≥ 38 °C in past 3 days"?
5. Weakness/tiredness is partly a recorded common symptom (Fatigue); weakness (Asthenia) is not.
   Should the app offer weakness as a common symptom so this page triggers on it?
