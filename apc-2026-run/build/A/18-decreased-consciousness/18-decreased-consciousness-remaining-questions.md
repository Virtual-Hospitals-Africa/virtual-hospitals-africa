# Page 18 – Decreased consciousness: remaining questions

## Decisions made

- **Whole page is one red box.** Every patient with decreased consciousness gets
  `Urgent: decreased consciousness`. The page says "urgent attention" and does not escalate, so
  `Urgent` is used, although the (child) warning sign for the same finding carries `Very urgent`.
- **Trigger** is `Decreased level of consciousness` (finding), the recorded warning-sign form. The
  AVPU vitals (Reacts to voice / pain, Unresponsive) are not descendants of it in SNOMED and were
  not added (see questions).
- **Shock likely** (glucose ≥ 11.1 column): decreased consciousness **and** glucose ≥ 11.1 mmol/L
  **and any of** SBP < 80, pulse ≥ 100, respiratory rate > 30, weakness. The page lists these with
  commas; read as "any of". This page does not write "Shock/SBP < 80"; nothing imported from the
  general shock definition.
- **Possible meningitis**: decreased consciousness and temperature ≥ 38°C (page: "for possible
  meningitis").
- **Stimulant or other drug overdose likely**: decreased consciousness and both pupils dilated →
  probable `Overdose` (general concept, covering "stimulant or other drug").
- **Poisoning likely**: decreased consciousness and either pinpoint pupils with any of illegal drug
  use, respiratory rate < 12, excessive secretions or muscle twitching; or both pupils dilated (the
  image joins the overdose box to the "Poisoning likely" bar).
- **Check for anaphylaxis** ("If sudden decreased consciousness and any of …") encoded as a
  `possible` Anaphylaxis rule. "Exposure to possible allergen" expanded by footnote 1 to medication,
  food, insect bite and insect sting.
- **Branches leading only to management** (glucose < 3 / < 4 if diabetes / unable to measure;
  temperature ≤ 35°C; unequal or poorly reactive pupils) are not encoded: the page names no
  diagnosis there, and a `check_for` for unequal pupils would be unused evidence.
- No `measure` tasks: glucose and temperature are routine vitals; pupils are findings.

## Could not model

- "Both **equally** dilated": encoded as dilated pupil with finding site both pupils; "equally"
  cannot be expressed.
- "Pinpoint": no concept; `Constricted pupil` is broader, so the poisoning rule may fire more often
  than the page intends.
- "Exposure … within the past few hours" (footnote 1): no time constraint; exposures in the
  current encounter treated as recent.
- "Unable to measure" glucose: not representable (branch is management only anyway).
- All management: dextrose, thiamine, fluids, insulin, ceftriaxone, rewarming, cooling, head
  positioning, referral and the monitoring thresholds while awaiting transport.

## SNOMED gaps

- "Pinpoint pupils" / "Miosis" (finding): not found → `Constricted pupil` (finding).
- "Bilateral dilated pupils": not found → `Dilated pupil` + finding_site `Structure of pupil of both eyes`.
- "Weakness" (finding): not found → `Asthenia` (finding).
- "Excessive secretions": no general concept → `Excessive salivation` (disorder) or `Excessive bronchial secretion` (finding).
- "Stimulant overdose": not found → general `Overdose` (disorder) (`Psychostimulant overdose` exists but is narrower than "stimulant or other drug").
- "Unequal pupils": only `Anisocoria` (disorder); not used (branch not encoded).

## Checker issues left in place

- None.

## Questions for a clinician

- Should "SBP < 80, pulse ≥ 100, respiratory rate > 30, weakness" require any one, or all, of these for "shock likely"?
- Is "shock likely" meant only in the glucose ≥ 11.1 column (dehydration from hyperglycaemia), or for any patient with decreased consciousness?
- Should a recorded AVPU of "Reacts to voice", "Reacts to pain" or "Unresponsive" trigger this page, as well as a recorded decreased level of consciousness?
- Is excessive salivation / bronchial secretion the intended reading of "excessive secretions" (organophosphate picture)?
- Should unequal or poorly reactive pupils raise the priority above Urgent (e.g. raised intracranial pressure), given the page says "discuss urgently"?
