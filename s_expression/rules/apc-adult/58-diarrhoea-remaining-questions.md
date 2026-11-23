# Page 58 – Diarrhoea: remaining questions

Final build, reconciled from two independent builds (base: builder A).

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
  "In past 5 days" is not a time comparison: as on the gold page 20, exposure findings record no
  onset (Will's briefing: the subject of `onset` is a `clinical_finding` or `active_condition`).
- **Durations.** "≤ 2 weeks" is `(<= (onset Diarrhea) (time_ago 2 weeks))`. The "> 2 weeks" branch
  has no "likely" or "consider" diagnosis, so its duration is not encoded.
- **Blood in stool = No** and **cholera area = No** use `(no …)`, so they need the health worker to
  answer No explicitly.
- **"Treat for giardiasis"** (> 2 weeks, HIV negative or unknown) is read as a treatment
  instruction, not "giardiasis likely"/"consider giardiasis"; it is not encoded.
- **Faecal impaction**: a second `check_for` task asks for the rectal finding when the patient with
  diarrhoea is bed-ridden or under palliative care; `probable` Fecal impaction when it is present.
- **Dehydration** and **faecal impaction** rules include the Diarrhea finding as page context.
- **Gastroenteritis** uses `Inflammation of stomach and intestine` (SNOMED synonym
  "gastroenteritis"), not the narrower `Infectious gastroenteritis`.
- No `measure` task: SBP is a routine vital; the stool and HIV tests are laboratory tests.

## Could not model

- "Confirm patient has diarrhoea: ≥ 3 loose stools/day": stool frequency has no unit or
  observable.
- "In past 5 days" for the cholera outbreak area: exposure findings record no onset; treated as
  recent (as on page 20). Cholera fires more often than the page (an older exposure also counts),
  and gastroenteritis less often (an older exposure blocks it unless recorded as No).
- "> 65 years" for the impaction check: no age comparison in the language. The rectal-check task
  and the impaction rule fire less often than the page (only bed-ridden or palliative patients).
- "Prolonged constipation **followed by** watery stool": the order in time is not modelled; both
  findings must be present.
- The "> 2 weeks" branch: stool tests, HIV test, HIV-status routing, *Isospora belli* /
  *Cryptosporidium* stool results and "Treat for giardiasis" lead only to treatment; not modelled.
  "LPVr can cause ongoing loose stools" is a note.
- "Solid immobile bulk of stool": `Fullness of rectum due to feces` does not carry "solid
  immobile". Fires more often than the page intends.
- All management: ORS, IV fluids, medicines, referral, stool tests, HIV test, advice.

## SNOMED gaps

- No `Dysentery` concept: used `Dysenteric diarrhea` (disorder).
- No `Gastroenteritis` FSN: used `Inflammation of stomach and intestine` (disorder).
- No `Blood in stool` FSN: used `Hematochezia` (finding).
- No `Watery diarrhea`: used `Diarrhea` with the `Watery` qualifier.
- No `Thirst` finding: used `Increased thirst`. The vocabulary's `Thirst due to water deprivation`
  presumes a cause.
- "Dry mouth": FSN is `Xerostomia` (finding).
- No "overflow diarrhoea": used `Chronic constipation with overflow`.
- No "receiving palliative care" finding: used `Seen by palliative care service` (low confidence;
  `Under care of palliative care physician` is narrower).
- No cholera-outbreak-area situation: used exposure to `Vibrio cholerae`.
- No "solid immobile bulk of stool in rectum": used `Fullness of rectum due to feces`.

## Checker issues left in place

- None.

## Questions for a clinician

- Should the flowchart's cholera branch (non-watery diarrhoea ≤ 2 weeks, no blood, outbreak area)
  make the patient Urgent, as it does now through `(active_condition Cholera)`?
- Is exposure to *Vibrio cholerae* an acceptable stand-in for "has been in a cholera outbreak area
  in the past 5 days", or should VHA record travel/residence in an outbreak area separately (with
  a date, so the 5-day window can be checked)?
- Should "Treat for giardiasis" (diarrhoea > 2 weeks, HIV negative or unknown) be a `possible`
  giardiasis diagnosis? (The builders disagreed; the final build leaves it out.)
- Is `Seen by palliative care service` an acceptable record of "receiving palliative care"?
- Should impaction also fire for patients > 65 once age can be expressed, and is `Fullness of
  rectum due to feces` the right finding for "solid immobile bulk of stool"?
- Is `Increased thirst` right for "thirst", or should the book use `Thirst due to water deprivation`
  consistently?
- Is `Dysenteric diarrhea` the intended concept for "dysentery" on this page?
