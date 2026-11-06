# Page 18 – Decreased consciousness: remaining questions

## Decisions made

- **Trigger.** "Decreased consciousness" is not an adult common symptom or warning sign. The
  trigger is an `or` of `Decreased level of consciousness` and the three AVPU levels below Alert
  that triage records (`Impairment of mental alertness` = reacts to voice, `Responds to pain`,
  `Unresponsive`). None of these three is a SNOMED descendant of `Decreased level of
  consciousness`, so they are listed explicitly. AVPU "Confused" (`Clouded consciousness`) is left
  out because confusion is its own presentation.
- **Priority.** One `Urgent` rule for any decreased consciousness ("Give urgent attention to the
  patient with decreased consciousness"). The page does not escalate further.
- **Anaphylaxis line → `possible` Anaphylaxis.** "If sudden decreased consciousness and any of …,
  check for anaphylaxis 28" is a consider-statement: sudden-onset decreased consciousness AND any of
  generalised itch, generalised rash, face/tongue swelling, wheeze, difficulty breathing, abdominal
  pain, vomiting, or exposure to a possible allergen. The allergens come from footnote 1
  (medication, food, insect bite/sting) and use the gold standard's exposure form, with the general
  `Food` substance because this page names no specific food.
- **Shock (glucose ≥ 11.1 column).** As decided for all pages, the page's own logic is encoded and no
  shared shock definition is used: probable `Shock` = decreased consciousness AND glucose ≥ 11.1 AND
  any of SBP < 80, pulse ≥ 100, respiratory rate > 30, weakness. The comma list is read as "any of".
- **Meningitis.** "Give ceftriaxone … for possible meningitis" in the ≥ 38°C column → `possible`
  Meningitis = decreased consciousness AND temperature ≥ 38.
- **Pupils → poisoning.** Pinpoint AND (illegal drug use, RR < 12, excessive secretions or muscle
  twitching) → probable `Poisoning`. Both equally dilated → probable `Overdose` ("stimulant or other
  drug overdose likely") and, since that box also feeds "Poisoning likely", probable `Poisoning` too.
  The poisoning rule repeats the pupil evidence instead of using `(active_condition Overdose)`, so its
  evidence stays checked for in this file.
- **Branches that name no diagnosis are not encoded:** glucose < 3 (< 4 if diabetes) or unable to
  measure, temperature ≤ 35°C, and unequal/poorly reactive pupils lead only to management. Their
  findings are not checked for, following Will's rule that a finding nothing consumes should not be
  in a `check_for`.
- Glucose and temperature are routine vitals, so there is no `measure` task.
- No time comparisons are used.

## Could not model

- **Hypoglycaemia branch** ("< 3 (< 4 if diabetes) or unable to measure"): the page gives only
  management. "Unable to measure" has no representation. No rule fires, so the low-glucose path is
  silent in the rules (dextrose management not in scope).
- **Hypothermia branch** (≤ 35°C, ≤ 32°C) and **hyperthermia** (> 40°C): management only.
- **Unequal pupils / poor light response**: management only (head up, discuss urgently). Because
  nothing consumes them, the task does not prompt the health worker to look for them, although the
  page says to check pupils. If a later pass wants them prompted, a diagnosis (e.g. raised
  intracranial pressure) would need to come from the page, and this page names none.
- **Malaria area in past 3 months → manage 39**: cross-reference only.
- **Monitoring while awaiting transport** (BP < 90/60, pulse > 100 or < 50, RR > 20 or < 9,
  SpO₂ < 94%, drop in GCS → reassess ↻ 16): monitoring/management. Not encoded as triage.
- "Within the past few hours" (footnote 1) for allergen exposure: as on the gold page, exposures
  recorded in the encounter are taken as recent.
- "Both **equally** dilated": encoded as dilated pupils of both eyes; equality is not expressed.

## SNOMED gaps

- "Pinpoint" → `Pin point pupils` (finding) exists. ✔
- "Excessive secretions": no single concept. Substituted `Excessive salivation` (disorder) OR
  `Bronchorrhea` (finding).
- "Muscle twitching" → `Muscle twitch` (finding). `Muscle fasciculation` is not a descendant and is
  not added.
- "Both equally dilated": no bilateral precoordinated concept. Used `Dilated pupil` with finding_site
  `Structure of pupil of both eyes` (body structure, verified).
- "Weakness": no plain `Weakness` finding. Used `Muscle weakness` (general; `Generalized muscle
  weakness` is a descendant). `Asthenia` was the alternative.
- "Stimulant or other drug overdose": `Drug overdose` does not exist. Used `Overdose` (disorder).
- "Generalised itch/rash" → `Generalized pruritus` (finding) and `Generalized rash` (disorder), both
  in the VHA vocabulary.

## Checker issues left in place

- None.

## Questions for a clinician

1. Shock line: does "SBP < 80, pulse ≥ 100, respiratory rate > 30, weakness" mean any one of these,
   or all together? And should it apply only within the glucose ≥ 11.1 column (as encoded)?
2. Should AVPU "Reacts to voice" count as decreased consciousness for this page's trigger? And should
   "Confused" also trigger it?
3. Should probable poisoning with decreased consciousness be `Very urgent` (as the adult Poisoning
   warning sign is), rather than `Urgent`?
4. Is "excessive secretions" well captured by excessive salivation or bronchorrhoea, or should
   lacrimation and sweating also count?
5. Should the low-glucose branch produce a hypoglycaemia diagnosis, even though the page names none?
