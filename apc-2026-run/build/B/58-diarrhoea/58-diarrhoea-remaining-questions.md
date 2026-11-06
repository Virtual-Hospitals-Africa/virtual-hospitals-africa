# Page 58 – Diarrhoea: remaining questions

## Decisions made

- **Shock:** the red box's "Shock¹ or SBP < 80" is encoded as written, as an `or` of the `Shock`
  finding and systolic BP < 80, on this page only. Footnote 1 ("If SBP < 80, pulse ≥ 100,
  respiratory rate > 30, confusion/restlessness, weakness, shock likely") is not encoded as a
  shock rule, following the all-pages shock decision.
- **Cholera likely** has one `probable` rule with two branches: the red box (watery diarrhoea and
  in a cholera outbreak area in the past 5 days) and the flowchart (diarrhoea ≤ 2 weeks, no blood
  in the stool, in a cholera outbreak area in the past 5 days). The urgent priority rule references
  `(active_condition Cholera)`, as Will's briefing says to do when the red box names a likely
  diagnosis.
- **Cholera outbreak area** is modelled as `Exposure to (contextual qualifier)` + `Vibrio cholerae`
  (organism), the pattern VHA's vocabulary already uses. "Past 5 days" is
  `(<= (onset exposure) (time_ago 5 days))`.
- **Gastroenteritis** needs a "No" to the cholera question. That is `(no exposure)` **or** an
  exposure whose onset was at least 5 days ago. The page's "not in the past 5 days" is strictly
  "more than 5 days"; it is written `>=` because the database accepts only `>=`/`<=` in onset
  comparisons, so the 5-day boundary overlaps the cholera rule.
- **Durations:** "≤ 2 weeks" is `(<= (onset Diarrhea) (time_ago 2 weeks))`. The "> 2 weeks" branch
  has no "likely" or "consider" diagnosis, so its duration is not encoded.
- **"No" branches for blood in the stool** use `(no (clinical_finding Hematochezia))`, so the
  health worker must record "No" before cholera (flowchart branch) or gastroenteritis can fire.
- **Watery stool / watery diarrhoea** both use `Diarrhea` with the `Watery` qualifier.
- **"Treat for giardiasis"** (> 2 weeks, HIV negative or unknown) is read as a treatment instruction,
  not as "giardiasis likely". It is not encoded.
- No `measure` tasks: the page's tests (stool for ova, cysts and parasites; HIV test) are lab tests.

## Could not model

- **Impaction:** "> 65 years" cannot be expressed (the language has no numeric age), and "receiving
  palliative care" has no matching finding concept. The rule keeps only bed-bound + rectal fullness,
  so it **fires less often** than the page intends (patients > 65 or on palliative care who are not
  bed-ridden are missed).
- **"Solid immobile bulk of stool"** is approximated by `Fullness of rectum due to feces`; the
  solid/immobile character cannot be expressed. Fires more often than the page intends.
- **Overflow diarrhoea:** "prolonged constipation *followed by* watery stool". The order of events is
  not modelled; any chronic constipation with watery diarrhoea fires.
- **"Confirm patient has diarrhoea: ≥ 3 loose stools/day"**: stool frequency has no unit or
  observable; not encoded (the rules trust the recorded `Diarrhea` finding).
- The > 2 weeks branch (stool results Isospora belli / Cryptosporidium / negative / positive, HIV
  status routing, "LPVr can cause ongoing loose stools") is management and lab-result routing.

## SNOMED gaps

- "Dysentery" (disorder): no active FSN; used `Dysenteric diarrhea` (disorder).
- "Gastroenteritis" (disorder): no FSN; used `Inflammation of stomach and intestine` (disorder).
- "Blood in feces"/"Blood in stool": no FSN; used `Hematochezia` (finding).
- "Overflow diarrhea": no FSN; used `Chronic constipation with overflow` (disorder).
- "Thirst" (finding): no FSN; used `Thirst due to water deprivation` (in VHA's vocabulary).
- "Dry mouth": FSN is `Xerostomia` (finding).
- "In cholera outbreak area": no concept; used exposure to `Vibrio cholerae`.
- "Receiving palliative care" (finding): none; not encoded (closest: `Under care of palliative care
  physician`, narrower).
- "Solid immobile bulk of stool in rectum": none; used `Fullness of rectum due to feces`.

## Checker issues left in place

- None.

## Questions for a clinician

- Is exposure to *Vibrio cholerae* an acceptable stand-in for "has been in a cholera outbreak area
  in the past 5 days", or should VHA record travel/residence in an outbreak area separately?
- Should impaction also fire for patients > 65 or on palliative care with rectal faecal loading once
  age can be expressed, and is `Fullness of rectum due to feces` the right finding for "solid
  immobile bulk of stool"?
- Should "Treat for giardiasis" (diarrhoea > 2 weeks, HIV negative or unknown) be a `possible`
  giardiasis diagnosis?
- Is `Dysenteric diarrhea` the intended concept for "dysentery" on this page?
