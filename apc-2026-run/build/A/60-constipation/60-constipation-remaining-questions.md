# Page 60 – Constipation: remaining questions

## Decisions made

- **Trigger.** Constipation is a recorded common symptom, so `(clinical_finding Constipation)` anchors
  all three tasks and the rules.
- **Red box: "No stools or flatus/wind in the past 24 hours with abdominal pain/distension".** I read
  this as *neither* stools *nor* flatus for at least 24 hours, **and** (abdominal pain **or**
  distension). "No stools" is encoded as `Obstipation` (disorder, a kind of Constipation). SNOMED has no
  "absent bowel movement" finding. "No flatus" is `Unable to break wind`. Each has
  `(>= (onset …) (time_ago 24 hours))`, using `>=` because the database rejects other comparators in
  onset comparisons. The priority is `Urgent` ("Give urgent attention … Refer same day"). The
  referral itself is a management step.
- **Faecal impaction.** The page says: "If > 65 years, bed-bound/receiving palliative care, or overflow
  diarrhoea, check for solid immobile bulk of stool in rectum. If present, impaction likely." This is
  encoded as a task that checks the rectum when the gate is met, plus a `probable` Fecal impaction
  rule: constipation, the gate, and hard stool with finding site rectum.
- **Colorectal cancer.** The page says "Assess the patient with constipation for colorectal cancer …
  If patient has any of above symptoms, discuss/refer". I read this as "consider colorectal cancer"
  and wrote a `possible` rule for `Malignant neoplasm of cecum and/or colon and/or rectum`, which fires
  on any listed symptom in a constipated patient.
- **Change in bowel habits.** I first used `Altered bowel function`. The gate flagged that
  Constipation is a kind of Altered bowel function, which made the rule true for every constipated
  patient. It is replaced by `Diarrhea` (the page's other example). Note that `Chronic constipation
  with overflow` is a kind of Diarrhea, so overflow diarrhoea also raises possible colorectal cancer.
  That fits the page's wording.

## Could not model

- **"> 65 years"** (impaction gate) has no age-in-years expression in the language. The impaction task
  and rule fire **less often** than the page intends: a patient over 65 who is not bed-bound, not
  receiving palliative care and has no overflow diarrhoea is not checked.
- **"Check Hb. If < 12 (woman) or < 13 (man), anaemia likely"**: Hb has no observable or unit in the
  language, and the rule has nothing left without it. Not encoded.
- **"If weakness/tiredness, weight gain, low mood, dry skin or cold intolerance, check TSH. If abnormal,
  refer"**: TSH is a lab value with no unit, and the page names no diagnosis. Not encoded.
- **Colorectal cancer risk ("> 50 years old and any of" previous colorectal cancer/polyps/UC/Crohn's,
  family history, Lynch syndrome)**: this is a risk statement, not a diagnosis, and age in years is
  not representable. Not encoded.
- **"Persistent"** abdominal discomfort and **"Unexplained"** weakness/fatigue: no qualifier for these.
  Unqualified concepts are used, so the possible rule fires **more often** than the page intends.
- **"Change in stool consistency"**: there is no concept that would not overlap with constipation
  itself. Not encoded.
- Medication review, pregnancy (175), palliative care (191), lifestyle advice, laxatives and the
  referral criteria in "Treat the patient with constipation" are management. They are not encoded.

## SNOMED gaps

- "No stools / absolute constipation": no concept found. `Obstipation` (disorder) was used instead.
- "Receiving palliative care": no situation or finding found. `Seen by palliative care service`
  (finding) was used instead (low confidence).
- "Solid immobile bulk of stool in rectum": no precoordinated concept. `Hard stool` was used with
  finding site `Rectum structure`. `Feces in rectum` was rejected because it does not say solid or
  immobile.
- "Tenesmus" alone is not a finding. `Tenesmus of anus and/or rectum` was used.

## Checker issues left in place

- None.

## Questions for a clinician

1. Does "No stools or flatus/wind" mean neither stools nor flatus (as encoded), or either one?
2. Is Obstipation an acceptable stand-in for "no stools in 24 hours"?
3. Should the colorectal cancer symptoms raise a possible colorectal cancer diagnosis for *every*
   constipated patient who has them, or only for patients with the risk factors (> 50 years plus
   history)?
4. Should the impaction rule fire on the rectal finding alone, without the gate?
