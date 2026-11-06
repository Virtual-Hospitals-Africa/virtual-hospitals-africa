# Page 58 – Diarrhoea: remaining questions

## Decisions made

- **Shock / SBP < 80** encoded as written on this page: `(or Shock (< SBP 80))`. The footnote's
  shock definition (SBP < 80, pulse ≥ 100, RR > 30, confusion/restlessness, weakness) is not built
  as a shock rule (decision for all pages).
- **Red box cholera.** Following Will's briefing, the red box's "cholera likely" is a `probable`
  rule (`Diagnose probable cholera in diarrhoea`) and the priority rule uses
  `(active_condition Cholera)`. The cholera rule has two branches: the red box (watery diarrhoea and
  outbreak area) and the flowchart (diarrhoea ≤ 2 weeks, no blood, outbreak area). So the
  flowchart branch also makes the patient Urgent, which is wider than the red box itself.
- **Cholera outbreak area** is recorded as exposure to *Vibrio cholerae*
  (`Exposure to (contextual qualifier)` + `Vibrio cholerae` organism, both in the vocabulary).
- **Durations.** "≤ 2 weeks" is `(<= (onset Diarrhea) (time_ago 2 weeks))`; "> 2 weeks" is
  `(>= … (time_ago 2 weeks))` because VHA rejects `>` in onset comparisons. At exactly 2 weeks both
  branches match.
- **Blood in stool = No** and **cholera area = No** use `(no …)`, so they need the health worker to
  answer No explicitly.
- **Giardiasis** ("Treat for giardiasis", > 2 weeks, HIV negative or unknown) is a `possible`
  diagnosis: a presumptive treatment read as a suspected diagnosis.
- **Faecal impaction**: a second `check_for` task asks for the rectal finding when the patient with
  diarrhoea is bed-ridden or under palliative care; `probable` Fecal impaction when it is present.
- **Dehydration** and **faecal impaction** rules include the Diarrhea finding as page context.
- **Gastroenteritis** uses `Inflammation of stomach and intestine` (SNOMED synonym
  "gastroenteritis"), not the narrower `Infectious gastroenteritis`.
- No `measure` task: SBP is a routine vital.

## Could not model

- "Confirm patient has diarrhoea: ≥ 3 loose stools/day": stool frequency has no unit or
  observable.
- "In past 5 days" for the cholera outbreak area: exposure findings record no onset; treated as
  recent (as on page 20). Fires more often than the page (an older exposure also counts).
- "> 65 years" for the impaction check: no age comparison in the language. The rectal-check task
  and the impaction rule fire less often than the page (only bed-ridden or palliative patients).
- "HIV negative **or unknown**": `(no HIV)` needs an explicit negative, so patients with unknown
  status are missed. The giardiasis rule fires less often than the page.
- "Prolonged constipation **followed by** watery stool": the order in time is not modelled; both
  findings must be present.
- HIV-positive branch: *Isospora belli* / *Cryptosporidium* come from a stool laboratory result
  and lead only to treatment; not modelled. "LPVr can cause ongoing loose stools" is a note.
- "Solid immobile bulk of stool": `Fullness of rectum due to feces` does not carry "solid
  immobile".
- All management: ORS, IV fluids, medicines, referral, stool tests, HIV test, advice.

## SNOMED gaps

- No `Dysentery` concept: used `Dysenteric diarrhea` (disorder).
- No `Watery diarrhea`: used `Diarrhea` with the `Watery` qualifier.
- No `Thirst` finding: used `Increased thirst`. The vocabulary's `Thirst due to water deprivation`
  presumes a cause.
- No "overflow diarrhoea": used `Chronic constipation with overflow`.
- No "receiving palliative care" finding: used `Seen by palliative care service` (low confidence).
- No cholera-outbreak-area situation: used exposure to `Vibrio cholerae`.
- No "solid immobile bulk of stool in rectum": used `Fullness of rectum due to feces`.

## Checker issues left in place

- None.

## Questions for a clinician

- Should the flowchart's cholera branch (non-watery diarrhoea ≤ 2 weeks, no blood, outbreak area)
  make the patient Urgent, as it does now through `(active_condition Cholera)`?
- Is "Treat for giardiasis" meant as a presumptive diagnosis (`possible` giardiasis), or only a
  treatment step?
- Is `Seen by palliative care service` an acceptable record of "receiving palliative care"?
- Is `Increased thirst` right for "thirst", or should the book use `Thirst due to water deprivation`
  consistently?
