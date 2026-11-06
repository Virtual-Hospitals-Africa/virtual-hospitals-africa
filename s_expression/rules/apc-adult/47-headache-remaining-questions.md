# Page 47 – Headache: remaining questions

Final build, reconciled from builders A and B (base: A). Every difference and its reason is in
`reconcile.json`.

## Decisions made

- **Two `check_for` tasks**, both triggered by the common symptom Headache: one for the red box
  (`Check for urgent headache conditions`), one for the flowchart "Approach to the patient with
  headache not needing urgent attention" (`Check for causes of headache not needing urgent attention`).
- **One Urgent priority rule** `(and Headache (or …red-box items…))`. The meningitis item uses
  `(active_condition Meningitis)`, diagnosed at `probable`. Stroke/TIA ("consider") are `possible`
  rules, so the priority rule lists their findings directly.
- **BP pairs** follow Will's convention: BP ≥ 140/90 is systolic ≥ 140 **or** diastolic ≥ 90; BP ≥
  180/110 is systolic ≥ 180 **or** diastolic ≥ 110.
- **"BP ≥ 180/110 and not pregnant"** is encoded without the "not pregnant" clause. VHA's evidence
  code rejects `not`, and `(no Pregnancy)` needs an explicit "not pregnant" record, so it would miss
  men and anyone whose pregnancy status wasn't recorded. A pregnant patient with BP ≥ 180/110 already
  meets the "pregnant and BP ≥ 140/90" line, so inside the red-box `or` the urgent result is the
  same. The clause only chooses page 148 over 177.
- **"1 week postpartum"** is `(<= (onset (clinical_finding Postpartum state)) (time_ago 1 weeks))`,
  using `<=` as the team requires.
- **Meningitis likely** is `probable`: headache and any of stiff neck, drowsy, clouded consciousness
  or acute confusion (both for "confused"), purpuric rash ("purple/red rash").
- **Consider stroke or TIA** is two `possible` rules. "New sudden" is the Sudden onset qualifier on the
  six weakness/numbness findings. Difficulty speaking, after the semicolon, has no qualifier.
- **Sudden severe dizziness**: "sudden severe" is read as covering dizziness too.
- **"Getting worse and more frequent"** is a Worsening headache **and** a Frequent headache.
- **"Headache that wakes patient"** is approximated by Wakes up during night (inside the headache
  `and`).
- **"Persistent headache since starting ART"** is a Chronic persistent headache **and** a recorded
  Highly active antiretroviral therapy procedure finding.
- **Sinusitis** "thick nasal/postnasal discharge" is Nasal discharge + Thick and Posterior rhinorrhea +
  Thick.
- **Tick bite fever** is encoded as African tick bite fever (the page's words; see questions).
- **Muscular neck pain** uses "Myofascial neck pain" (finding). There is no "muscular neck pain" concept.
- **"If none of above, treat as acute viral infection"** is a `possible` Acute viral disease: Q0 = Yes,
  the sinusitis branch recorded as absent (no recent cold, or none of its features), and no tick bite.
- Except for acute viral infection, the flowchart's "No" answers are not required as negative
  evidence (as in the gold standard). See the flowchart notes.
- No `measure` task: BP is a routine vital; CRP has no unit in the language. No `manage` tasks.

## Could not model

- **Patient > 50 years** (giant cell arteritis). No age criterion in the language, so the GCA rule
  fires on temporal headache at any adult age, **more often** than the page intends.
- **Migraine: "disabling" and "resolve completely within 72 hours."** Not modelled; the rule fires
  **more often**.
- **"Since starting ART."** The temporal order isn't modelled. The rule needs a persistent headache
  and a recorded HAART procedure finding (fires **more often** for headache that predates ART, and
  never if ART isn't recorded as that procedure).
- **"More frequent"** (increasing frequency) has no concept; Frequent headache is used.
- **"Headache that wakes patient"**: Wakes up during night isn't headache-specific (it sits inside the
  headache `and`), so it may fire **more often**.
- **"Asymmetric"** weakness/numbness isn't encoded (slightly **more often**).
- **"Following a first seizure"** is not timed.
- **Malaria likely** (red box and flowchart): needs "in a malaria area in past 3 months"; not
  encoded (page 39). The acute-viral-infection "none of above" therefore can't exclude malaria
  (fires slightly **more often**).
- **Tension headache**: the "pressure-like" quality has no concept; any generalized headache counts
  (**more often**).
- **Sinusitis**: "headache worse on bending forward" has no concept; fires slightly **less often**.
- **Persistent nausea**: only Persistent vomiting is encoded (**less often**).
- **CRP > 5** (GCA review) is a lab value and management.

## SNOMED gaps

- Exposure to / having been in a malaria area in the past 3 months — none.
- On antiretroviral therapy / since starting ART (finding) — none; only `Highly active antiretroviral
  therapy` (procedure).
- "Persistent" (qualifier value) — none; "Chronic persistent" used. No Persistent nausea concept.
- Headache that wakes the patient from sleep — none; Wakes up during night used.
- Headache worse on bending forward — none.
- Tick present (attached tick) — none; Tick bite used.
- Muscular neck pain — none; Myofascial neck pain used.
- Pressure-like headache — none; Generalized headache used.
- "Difficulty speaking" has no FSN; "Difficulty talking" used.
- Asymmetrical (qualifier value) — none fitting.

## Checker issues left in place

- None.

## Questions for a clinician

- Is probable giant cell arteritis on temporal headache alone acceptable until age can be expressed,
  or should it be `possible` / held back?
- Should "persistent headache since starting ART" fire for any patient on ART with a persistent
  headache? Does the app record ART as a Procedure finding of "Highly active antiretroviral therapy"?
  If not, that urgent criterion never fires.
- Is "sudden severe headache or dizziness" meant as sudden severe dizziness, or any dizziness?
- Does "new sudden" also apply to "difficulty speaking" (encoded without Sudden onset)?
- "Tick bite fever": African tick bite fever only, or the broader Spotted fever group rickettsial
  disease (which also covers Boutonneuse/Mediterranean spotted fever)?
- Should "treat as acute viral infection" be a diagnosis at all, or only management?
- Is Abnormal vision + New the right reading of "new vision problems", or should Visual disturbance
  be used?
- Should "purple/red rash" also include a non-purpuric red rash (e.g. petechial or erythematous)?
