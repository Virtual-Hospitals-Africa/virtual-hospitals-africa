# Page 47 – Headache: remaining questions

## Decisions made

- **Two `check_for` tasks**, both triggered by the common symptom Headache: one for the red box
  (`Check for urgent headache danger signs`), one for the flowchart "Approach to the patient with
  headache not needing urgent attention" (`Check for causes of headache not needing urgent attention`).
- **One Urgent priority rule** `(and Headache (or …red-box items…))`. The meningitis item references
  `(active_condition Meningitis)`, diagnosed at `probable` by `Diagnose probable meningitis in patient
  with headache`. Stroke/TIA ("consider") are `possible` rules, so the priority rule lists their
  findings directly.
- **BP pairs**: "BP ≥ 140/90" = systolic ≥ 140 **or** diastolic ≥ 90; "BP ≥ 180/110" = systolic ≥ 180
  **or** diastolic ≥ 110.
- **"1 week postpartum"**: `(<= (onset (clinical_finding Postpartum state)) (time_ago 1 weeks))`
  (only `<=`/`>=` are allowed in onset comparisons).
- **"Not pregnant"**: `(no (clinical_finding Pregnancy))`. VHA's evidence code throws
  `Not supported not` on a `not` form, so the recorded negative is used. Pregnancy is in the
  `check_for`, so the health worker records No for non-pregnant patients (including men). If No is
  not recorded, the BP ≥ 180/110 branch does not fire.
- **"Sudden severe headache or dizziness"**: Sudden onset + Severe applied to both headache and dizziness.
- **Stroke/TIA findings** carry `Sudden onset` (for "new sudden"); "asymmetric" is not encoded.
  Difficulty speaking also carries `Sudden onset`.
- **"Meningitis likely"** = Headache and any of stiff neck, drowsy, clouded consciousness ("confused"
  synonym), acute confusion (warning-sign form), purpuric rash ("purple/red rash").
- **Flowchart nodes** follow the gold standard: each "likely" rule uses its own node's criteria and
  does not require the upstream "No" answers. Tick bite fever requires Q0 = Yes (fever and body pain,
  or recent cold) because it sits only on that branch.
- **"Treat as acute viral infection"** is encoded as a `possible` Acute viral disease when Q0 = Yes
  and the sinusitis features (or a recent cold) and tick bite are recorded as absent ("none of above").
- **Tick bite fever** is encoded as African tick bite fever (the South African tick bite fever).
- **Muscular neck pain** is encoded as Myofascial neck pain (finding), the closest concept.
- No `measure` task: BP is a routine vital; CRP has no unit in the language.
- No `manage` tasks (ceftriaxone, analgesia, nose drops, referral) per the brief.

## Could not model

- **"Persistent headache since starting ART"**: no finding for being on ART; time ordering against
  ART start is not expressible. Not encoded, so this red-box item never fires (under-fires).
- **"Persistent nausea"**: only Persistent vomiting is encoded; persistent nausea under-fires.
- **"Headache that wakes patient"**: only Morning headache is encoded; under-fires.
- **"Malaria likely"** (red box and flowchart): needs "in a malaria area in past 3 months", which has
  no concept. Not encoded here (malaria is page 39). The acute-viral-infection "none of above" check
  therefore cannot exclude malaria (over-fires slightly).
- **"Fever now or in past 3 days"**: would use `(active_condition Fever)`; moot since the malaria rule
  is not encoded.
- **Migraine**: "disabling" and "resolve completely within 72 hours" are not modelled; the rule
  fires on any recurrent throbbing headache with nausea or light/noise sensitivity (over-fires).
- **Giant cell arteritis**: "Patient > 50 years" has no age expression in the language; the rule
  fires on temporal headache at any adult age (over-fires).
- **Tension headache**: "pressure-like" quality of the generalised pain has no concept; any
  generalized headache counts (over-fires).
- **Sinusitis**: "headache worse on bending forward" has no concept; under-fires slightly.
- **"Asymmetric"** weakness/numbness not encoded (over-fires slightly).
- "Following a first seizure" is not timed.

## SNOMED gaps

- On antiretroviral therapy / since starting ART (finding) — none; only `Highly active antiretroviral
  therapy` (procedure).
- "Persistent" (qualifier value) — none (only `Chronic persistent`); no Persistent nausea concept.
- Headache that wakes the patient from sleep — none.
- Having been in a malaria area — none.
- Headache worse on bending forward — none.
- Tick present (attached tick) — none; Tick bite used.
- Muscular neck pain — none; Myofascial neck pain used.
- Pressure-like headache — none; Generalized headache used.
- Asymmetrical (qualifier value) — none fitting.

## Checker issues left in place

- None.

## Questions for a clinician

- Is "sudden severe headache or dizziness" meant as sudden severe dizziness, or any dizziness?
- Is Abnormal vision + New the right reading of "new vision problems", or should Visual disturbance be used?
- Should "treat as acute viral infection" be a diagnosis at all, or only management?
- Should probable giant cell arteritis be held back until an age criterion can be expressed?
- Is "purple/red rash" adequately captured by purpuric rash, or should a generalized red rash count too?
