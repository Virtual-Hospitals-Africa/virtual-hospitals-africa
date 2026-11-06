# Page 60 – Constipation: remaining questions

No flowchart file: the page has no flowchart or Yes/No branches.

## Decisions made

- **Red box → `Urgent`.** "No stools or flatus/wind in the past 24 hours with abdominal pain/distension"
  is read as *neither* stools *nor* flatus for 24 hours, plus abdominal pain **or** distension:
  `(and (>= (onset Constipation) (time_ago 24 hours)) (>= (onset Unable to break wind) (time_ago 24 hours)) (or Abdominal pain, Distension of abdomen))`.
  "Within/past 24 hours" uses `>=` as the brief requires. Constipation onset ≥ 24 hours stands in for
  "no stools in the past 24 hours".
- **Faecal impaction → `probable`** ("impaction likely"): constipation **and** (bed-bound, or receiving
  palliative care, or overflow diarrhoea) **and** solid stool in the rectum (`Hard stool` with
  finding site `Rectum structure`).
- **Colorectal cancer section not encoded.** The page says "assess" and "if any of above symptoms,
  discuss/refer". It never says "likely" or "consider", "> 50 years" can't be expressed, and
  constipation itself is one of the listed symptoms, so a `possible` rule would fire for every
  patient with constipation.
- **No `manage` tasks.** Laxatives, referrals, behaviour advice, antenatal and palliative-care pointers
  are management.

## Could not model

- **"Check Hb. If < 12 (woman) or < 13 (man), anaemia likely"**: Hb has no observable or unit in the
  language, and the sex split can't be expressed. No anaemia rule is written.
- **"> 65 years"** in the impaction gate: there is no age-in-years comparison. It is left out, so the
  impaction rule fires **less often** than the page intends (an over-65, ambulant patient with no
  overflow diarrhoea and a rectal stool mass is not diagnosed).
- **"> 50 years"** and the colorectal cancer risk factors: there's no age comparison, and the section
  has no diagnosis wording (see above).
- **TSH check** for weakness, weight gain, low mood, dry skin or cold intolerance: TSH is a lab value
  with no unit, and the page names no diagnosis.
- "Solid **immobile** bulk": only "hard stool in the rectum" is expressed.

## SNOMED gaps

- "No stools or flatus" (absolute constipation): no concept. I used `Unable to break wind` (finding)
  plus the constipation onset. `Obstipation` (disorder) was the alternative I considered.
- "Receiving palliative care" as a finding: none. I used `Seen by palliative care service` (finding).
- A rectal faecal mass or "solid immobile bulk of stool in rectum": none. I used `Hard stool` with
  `finding_site` `Rectum structure`. `Feces in rectum` (finding) was the alternative I considered.
- Finding sites checked: `Rectum structure` (body structure) exists.

## Checker issues left in place

- None.

## Questions for a clinician

- Does "No stools or flatus/wind" mean neither (absolute constipation, as encoded) or either one?
- Is constipation onset ≥ 24 hours ago an acceptable stand-in for "no stools in the past 24 hours"?
- Should faecal impaction be diagnosed on the rectal finding alone, given that the age gate is lost?
- Should the colorectal cancer symptoms (rectal bleeding, tenesmus, weight loss) produce a `possible`
  colorectal cancer diagnosis, or a referral flag, once management tasks are in scope?
