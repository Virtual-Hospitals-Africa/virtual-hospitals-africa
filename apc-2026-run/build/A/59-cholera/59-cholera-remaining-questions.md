# Page 59 – Cholera: remaining questions

## Decisions made

- **Entry point.** `Check for cholera (cholera page)` fires on `Diarrhea` (a recorded common
  symptom) and asks about watery diarrhoea and exposure to cholera. "With or without vomiting" adds
  no condition.
- **Cholera likely → probable Cholera**: watery diarrhoea (`Diarrhea` + `Watery` qualifier) **and**
  exposure to *Vibrio cholerae* with onset within the past 5 days, written
  `(<= (onset …) (time_ago 5 days))`, as the brief requires for time comparisons.
- **The dehydration flowchart is anchored on `(active_condition Cholera)`**, because the page applies
  it to this patient ("Decide on further management according to level of dehydration"). A
  second task, `Check for level of dehydration in cholera`, asks for every Q1/Q2 sign.
- **Q1 = Yes → `Urgent: cholera with severe dehydration`** (red box 2, "refer urgently"). I wrote no
  probable *Severe dehydration* diagnosis, because the page says "manage as", not "likely".
- **Q1 = No → Q2 = Yes → probable `Moderate dehydration`** ("Some dehydration likely", red box 1),
  then `Urgent: cholera with some dehydration`. `Moderate dehydration` is the concept VHA uses for
  the "Some Dehydration" warning sign.
- **How "Q1 = No" is written.** It uses recorded "No" answers: `(no X)` for each of drowsy,
  decreased consciousness, confused, difficulty breathing and weak pulse, plus `any2` of "No" over
  the three "≥ 2 of" groups, which means at most one of them is present. I tried `(not …)` first,
  but VHA's evidence walker throws `Not supported not`, so the gate could not run. As a result, the
  rule fires only when the health worker has explicitly answered No.
- **"Confused"** is `Acute confusion` (checked for) **or** `Clouded consciousness` (the AVPU
  "Confused" vital) in the positive branch. The `(no …)` branch uses only `Acute confusion`,
  because the AVPU vital does not record a "No".
- **"Unable to drink (or drinking poorly)"** is one group, `Unable to drink` or `Reduced fluid intake`,
  and counts once inside the `any2`.
- **Priority:** Urgent for both red boxes. Weak pulse, confusion and decreased consciousness are also
  warning signs with their own (higher) priority.

## Could not model

- **Red box 4 and the hourly reassessment.** After ORS, the patient is reassessed hourly: signs of
  dehydration (including "not passing urine" and "unable to walk unaided") or ongoing diarrhoea or
  vomiting lead to "manage as severe dehydration and refer urgently". The language cannot tell this
  reassessment apart from the first assessment. Encoding it would make cholera with ongoing
  diarrhoea Urgent at presentation, which contradicts the Q1/Q2 logic. Not encoded, so the rules
  fire **less often** than the page intends for patients who do not improve.
- **Red box 3** (reassess every 15–30 minutes; "awake, able to drink and pulse < 100" → also ORS)
  is a response to treatment plus management. Not encoded.
- **"Dehydration unlikely"** has no form in the language.
- **Fingerprick glucose < 3 (< 4 if diabetes) ↻ 19** is left to page 19.
- **Transport/discharge, ciprofloxacin criteria (pregnant, ≥ 60 years, long-term condition), stool
  specimen, isolation and notification** are management.

## SNOMED gaps

- **"Watery diarrhoea":** no precoordinated concept. Used `Diarrhea` + qualifier `Watery`.
- **"In cholera outbreak area":** no concept for being in an outbreak area. Used
  `Exposure to (contextual qualifier)` + `Vibrio cholerae` (organism). `Exposure to Vibrio cholerae`
  is an *event* concept, and `History of travel with high risk of exposure to communicable disease`
  (situation) was the alternative.
- **"Drinking poorly":** no exact concept. Used `Reduced fluid intake`.
- **"Thirsty":** `Thirst finding` is a grouper that includes normal thirst. Used
  `Thirst due to water deprivation`, which is in VHA's vocabulary (`Increased thirst` was the
  alternative).
- **"Dry mouth":** the concept is named `Xerostomia`.
- **"Weak pulse":** used `Weak arterial pulse`. `Thready pulse` is not a descendant of it.

## Checker issues left in place

- None.

## Questions for a clinician

- Should "Q1 = No" need explicit "No" answers, as encoded? Or should some dehydration be diagnosed
  whenever Q2 is met, accepting that it also fires alongside severe dehydration?
- Is exposure to *Vibrio cholerae* an acceptable way to record "has been in a cholera outbreak area
  in the past 5 days"? Will the onset of that exposure be captured?
- Should severe dehydration in cholera be Urgent, as written, or Very urgent?
- How should the hourly reassessment (red box 4) be represented once the app can record
  reassessment after treatment?
