# Page 39 – Malaria: remaining questions

Final build reconciled from two independent builds (base: builder B). See `reconcile.json`.

## Decisions made

- **Suspected malaria is a `possible` diagnosis** ("Suspect malaria if patient in a malaria area in
  the past 3 months and now presents with …"): travel/exposure within 3 months **and** any one of
  the listed symptoms. The list is read as "any of".
- **"Nausea and vomiting or diarrhoea"** is read as (nausea **and** vomiting) **or** diarrhoea,
  literally. The alternative reading (each alone) would fire more often.
- **"Temperature ≥ 38°C"** uses the measured temperature only, not the self-reported Fever symptom,
  in both the diagnosis rule and the exposure task's trigger, because the page gives a number.
- **Exposure question.** A pre-screen task, `Check for exposure to a malaria area`, fires on any of
  the page's symptoms that the app records (temperature ≥ 38, headache, fatigue, muscle pain,
  cough, nausea, vomiting, diarrhoea) and asks about being in a high-risk area, plus the page's
  symptoms that are not common symptoms (severe headache, shivering, joint pain, flu-like illness,
  dry cough). Without it nothing would ever record the exposure. This fires widely (every headache
  or cough patient is asked about travel). Plain Headache and Cough are triggers only; the
  diagnosis rule uses the page's "severe headache" and "dry cough".
- **"In the past 3 months"** is `(<= (onset …) (time_ago 3 months))`, the brief's form for "within".
- **Red box → `Urgent`**, `(and (diagnosis Malaria possible) (or …red-box items…))`. The page says
  "give urgent attention" and does not escalate further. Seizure, confusion and persistent vomiting
  are also warning signs at their own levels.
- **"Manage as suspected severe malaria"** → `possible` Complicated malaria with the same evidence
  as the urgent rule. SNOMED has no "Severe malaria"; Complicated malaria is a child of Malaria.
- **Shock:** per the shared decision, "Shock²/systolic BP < 80" is `(or Shock (disorder), SBP < 80)`
  on this page only. Footnote 2 ("If systolic BP < 80, pulse ≥ 100, respiratory rate > 30,
  confusion/restlessness, weakness, shock likely") is not turned into a shock diagnosis rule.
- **Glucose < 3 (< 4 if diabetes):** glucose < 3, or known diabetes and glucose < 4 (mmol/L).
  Known diabetes uses the `Known present` form in both the `check_for` and the rules.
- **"No urine passed in past 12 hours":** Anuria with onset at least 12 hours ago,
  `(>= (onset Anuria) (time_ago 12 hours))`.
- **"Decreased consciousness, drowsy/confused":** Decreased level of consciousness, Drowsy, and for
  "confused" both Clouded consciousness (the app's "Confused" AVPU level) and Acute confusion (the
  "Confusion" warning sign), so either way the app records confusion counts.
- **"Just had a seizure"** → Post-ictal state.
- **"Severe general body weakness"** → Asthenia with Severe qualifier.
- The lower algorithm (test positive / negative, the risk question, treatment regimens, review)
  only routes between management options and laboratory results, so it is not modelled. No
  `manage` tasks. Measured items are routine vitals, so there is no `measure` task.

## Could not model

- **Hb < 7:** no haemoglobin observable or unit. The urgent rule (and the complicated-malaria
  rule) fires **less often** than the page intends: a patient whose only danger sign is Hb < 7 is
  not flagged.
- **Malaria test results** (rapid test positive/negative, laboratory microscopy): no observable for
  lab results, so "Malaria test positive" cannot become a probable/definite malaria rule, and
  "If negative, assess for other causes of fever" cannot be routed.
- **Risk-group question** (> 65, pregnant/postpartum, long-term conditions, impaired immunity,
  splenectomy) only chooses between two management branches; not modelled (no manage tasks).
- **"In a malaria area":** the travel concept is broader than a malaria area and does not cover
  people who live in one. The onset of a "history of travel" finding may be when it is recorded,
  not when the travel happened, so the 3-month window is approximate.
- **Onset of anuria:** if the onset is not recorded as a past time, the 12-hour criterion will not
  fire (fires less often).

## SNOMED gaps

- **Being in / living in a malaria area:** no concept (searched "travel malaria", "malarial area",
  "endemic area", "exposure to malaria"). Substitute: `History of travel with high risk of exposure
  to communicable disease` (situation), already in VHA's vocabulary.
- **Severe malaria:** no concept; `Complicated malaria` (disorder) used.
- **"Shivering"** (finding) does not exist; used `Shivering or rigors` (finding).
- **"Confusion"** (finding) does not exist; used `Acute confusion` and `Clouded consciousness`.
- **"Weakness" / "Generalized weakness"** (finding) do not exist; used `Asthenia` (finding) with
  `Severe (severity modifier)`.
- **"Shock" (finding)** does not exist; used `Shock` (disorder).
- No `finding_site` values are used on this page.

## Checker issues left in place

- None.

## Questions for a clinician

- Should residence in a malaria area (Limpopo, Mpumalanga, northern KwaZulu-Natal) count as well
  as travel? If so, a separate concept or a VHA-local finding is needed.
- Should a self-reported fever (no measured temperature) trigger the exposure question, or count
  towards suspecting malaria? The page says "temperature ≥ 38°C", so currently it does neither.
  (Builder A also triggered the exposure question on reported Fever; the final build does not.)
- Is it acceptable that every patient with a recorded headache, cough, fatigue, muscle pain, nausea,
  vomiting or diarrhoea is asked about travel to a malaria area, or should the exposure question be
  triggered by temperature ≥ 38 only?
- Is "nausea and vomiting or diarrhoea" meant as nausea and vomiting together, or each of the
  three alone?
- Is Asthenia with Severe the right reading of "severe general body weakness", or should it be
  Generalized muscle weakness?
- "No urine passed in past 12 hours": is recording anuria with an onset the expected workflow, or
  should anuria alone count?
