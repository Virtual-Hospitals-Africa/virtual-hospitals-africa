# Page 47 – Headache: remaining questions

## Decisions made

- **Two `check_for` tasks**, both triggered by the common symptom Headache: one for the red box, one
  for the flowchart questions.
- **BP pairs** follow Will's convention: BP ≥ 140/90 is systolic ≥ 140 **or** diastolic ≥ 90; BP ≥
  180/110 is systolic ≥ 180 **or** diastolic ≥ 110.
- **"BP ≥ 180/110 and not pregnant"** is encoded without the "not pregnant" clause. VHA's evidence
  code rejects `not`, and `(no Pregnancy)` would need an explicit "not pregnant" record (it would
  miss men). A pregnant patient with BP ≥ 180/110 already meets the "pregnant and BP ≥ 140/90" line,
  so inside the red-box `or` the urgent result is the same. The clause only chooses page 148 over 177.
- **"1 week postpartum"** is `(<= (onset (clinical_finding Postpartum state)) (time_ago 1 weeks))`,
  using `<=` as the team requires.
- **Meningitis likely** is a `probable` rule (headache and any of stiff neck, drowsy, acute confusion,
  purpuric rash), and the urgent rule uses `(active_condition Meningitis)`.
- **Consider stroke or TIA** is two `possible` rules. "New sudden" is the Sudden onset qualifier on the
  six weakness/numbness findings. Difficulty speaking has no qualifier.
- **Sudden severe dizziness**: "sudden severe" is read as covering dizziness too.
- **Tick bite fever** uses "Spotted fever group rickettsial disease", the parent of African tick bite
  fever and Boutonneuse fever (both are tick bite fever in South Africa).
- **Muscular neck pain** uses "Myofascial neck pain" (finding). There is no "muscular neck pain" concept.
- The flowchart's "No" answers are not required as negative evidence. See the flowchart notes.

## Could not model

- **Patient > 50 years** (giant cell arteritis). There is no age criterion in the language, so the
  GCA rule fires on temporal headache at any age, **more often** than the page intends.
- **Migraine: "disabling" and "resolve completely within 72 hours."** Neither is modelled, so the rule
  fires **more often**.
- **"Since starting ART."** The temporal order isn't modelled. The rule needs a persistent headache and
  a recorded HAART procedure finding.
- **"Headache that is getting worse and more frequent."** Encoded as a Worsening headache **and** a
  Frequent headache. "Increasing frequency" itself has no concept.
- **"Headache that wakes patient"** is approximated by Wakes up during night inside the headache
  `and`.
- **"Asymmetric"** weakness/numbness isn't encoded (slightly broader).
- **CRP > 5** (GCA review) is a lab value and management.

## SNOMED gaps

- **Exposure to a malaria area in the past 3 months.** No concept, so neither "malaria likely" rule
  (red box and flowchart) is encoded. Page 39 covers malaria.
- **Tick present** (vs tick bite). No concept; only Tick bite is used.
- **Headache worse on bending forward.** No concept; that sinusitis criterion is dropped, so the rule
  fires **less often**.
- **Persistent nausea.** No concept; only Persistent vomiting is used (fires less often).
- **"Persistent"** as a qualifier doesn't exist; "Chronic persistent" is used.
- **Pressure-like pain quality.** No concept; Generalized headache is used.
- **"Difficulty speaking"** has no FSN; "Difficulty talking" is used.

## Checker issues left in place

- None.

## Questions for a clinician

- Is probable giant cell arteritis on temporal headache alone acceptable until age can be expressed,
  or should it be `possible`?
- Should "persistent headache since starting ART" fire for any patient on ART with a persistent
  headache?
- Should "purple/red rash" also include a non-purpuric red rash (e.g. petechial or erythematous)?
- Does the app record ART as a Procedure finding of "Highly active antiretroviral therapy"? If not,
  that urgent criterion will never fire.
