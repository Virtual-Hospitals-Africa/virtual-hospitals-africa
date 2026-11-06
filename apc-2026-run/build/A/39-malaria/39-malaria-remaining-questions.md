# Page 39 – Malaria: remaining questions

## Decisions made

- **Suspicion → `possible` malaria.** "Suspect malaria if patient in a malaria area in the past 3
  months and now presents with …" becomes `Diagnose possible malaria`: recent exposure **and** any of
  the listed symptoms. "Nausea and vomiting" is read as both together; "or diarrhoea" as a separate
  option. "Temperature ≥ 38°C" uses the measured temperature only (not the self-reported Fever
  symptom), as the page gives a number.
- **Exposure trigger.** Exposure to a malaria area is not something the app records unprompted, so
  `Check for malaria exposure and symptoms` is triggered by any of the page's symptoms that the app
  does record (Fever, temperature ≥ 38, Headache, Fatigue, Muscle pain, Cough, Nausea, Vomiting,
  Diarrhoea) and asks about travel plus the unrecorded symptoms (severe headache, shivering, joint
  pain, flu-like illness, dry cough). This fires widely (every headache or cough patient is asked
  about travel).
- **"In the past 3 months"** is written `(<= (onset …travel…) (time_ago 3 months))`, following the
  house convention for "within" (only `>=`/`<=` allowed in onset comparisons).
- **Red box → `Urgent`**, as `(and (diagnosis Malaria possible) (or …red box…))`. The page says
  "urgent attention" and does not escalate further; warning signs in the list (decreased
  consciousness, seizure, confusion, persistent vomiting) keep their own triage levels anyway.
- **Shock:** "Shock²/systolic BP < 80" is encoded on this page only, as `(or (clinical_finding Shock)
  (< SBP 80))`. Footnote 2 ("If systolic BP < 80, pulse ≥ 100, respiratory rate > 30,
  confusion/restlessness, weakness, shock likely") is **not** made into a probable Shock rule, so no
  shared shock definition is built (brief decision). Its listed findings mostly already appear in the
  red box on their own.
- **Glucose < 3 (< 4 if diabetes):** `(or (< glucose 3) (and known diabetes (< glucose 4)))`,
  Blood glucose status in mmol/L. Known diabetes uses the `Known present` form in both the
  `check_for` and the priority rule.
- **"No urine passed in past 12 hours"**: `(>= (onset Anuria) (time_ago 12 hours))`.
- **"Seizure or just had a seizure"**: Seizure and Post-ictal state (both warning-sign concepts).
- **"Drowsy/confused"**: Drowsy and Acute confusion (the warning-sign concept for confusion).
- The lower algorithm (test positive / negative, the > 65 / pregnancy / chronic-condition question,
  artemether/lumefantrine regimens, review) only routes between management options and laboratory
  results, so it is not modelled. No `manage` tasks.
- Measured items (RR, SBP, glucose, temperature) are routine vitals, so there is no `measure` task.

## Could not model

- **Hb < 7**: haemoglobin has no unit or observable in the language. The criterion is dropped from
  the urgent rule, which therefore fires **less often** than the page intends (a patient with
  suspected malaria whose only danger sign is Hb < 7 is not flagged urgent).
- **Malaria test results** (rapid test, microscopy) are laboratory results; "Malaria test positive"
  and "If positive, manage in adjacent column" are not encoded.
- **The risk question** ("> 65 years, pregnant/postpartum, long-term health conditions, impaired
  immunity, previous splenectomy") selects a treatment regimen only; age in years is also not
  expressible. Not modelled.
- **Onset semantics**: if onset of anuria is not recorded as a past time, the 12-hour criterion will
  not fire (fires less often); if travel onset is taken as the time of recording, the 3-month window
  is always met (fires as intended for recently recorded travel).

## SNOMED gaps

- **"In a malaria area"**: no concept for residence in, or travel to, a malaria area. Substitute:
  `History of travel with high risk of exposure to communicable disease` (situation), already in
  VHA's vocabulary. It is broader (any communicable disease) and does not cover people who live in a
  malaria area.
- **"Shivering"** (finding) does not exist; used `Shivering or rigors` (finding).
- **"Confusion"** (finding) does not exist; used `Acute confusion` (finding).
- **"Weakness" / "Generalized weakness"** (finding) do not exist; used `Asthenia` (finding) with
  `Severe (severity modifier)`.
- **"Shock" (finding)** does not exist; used `Shock` (disorder).
- No `finding_site` values are used on this page.

## Checker issues left in place

- None.

## Questions for a clinician

- Should residents of malaria areas be covered? The substitute concept captures travel only.
- Is it acceptable that every patient with a recorded headache, cough, fatigue, muscle pain, nausea,
  vomiting, diarrhoea or fever is asked about travel to a malaria area, or should the exposure
  question be triggered by fever / temperature ≥ 38 only?
- "Severe general body weakness": is `Asthenia` + Severe the intended reading, or should
  `Generalized muscle weakness` also count?
- Should a self-reported fever (no measured temperature) count towards suspecting malaria? The page
  says "temperature ≥ 38°C", so it currently does not.
- "No urine passed in past 12 hours": is recording anuria with an onset the expected workflow, or
  should anuria alone count?
