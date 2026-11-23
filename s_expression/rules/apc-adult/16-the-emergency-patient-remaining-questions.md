# Page 16 – The emergency patient: remaining questions (final, reconciled)

## Decisions made

- **Base build.** Builder A's structure: one `check_for` task, two `probable` diagnosis rules
  (tension pneumothorax, shock) and two `Emergency` priority rules (unresponsive / pulseless / not
  breathing; ABC and consciousness compromise). Builder B's single priority rule repeated the
  trigger as an `and` gate. Nearly every gate item was also in the inner `or`, so the gate did
  almost nothing. It was dropped.
- **Trigger.** "The emergency patient" is not a recorded complaint. The task fires on an `or` of the
  page's entry points: `Unresponsive` (AVPU), the `Cardiac arrest` and `Respiratory obstruction`
  warning signs, `Difficulty breathing` (the page's wording; `Dyspnea` is a descendant of it), and the
  vital thresholds the page acts on (SBP < 80, pulse < 50, pulse ≥ 100, RR < 9, RR > 30,
  SpO₂ < 94%). This is a broad trigger.
- **Priority level: Emergency** (page title "The emergency patient"), rather than Urgent from the
  header wording "Give urgent attention".
- **Difficulty breathing is an Emergency criterion.** The page says "If difficulty breathing or
  oxygen saturation < 94%" in one sentence, so both are kept (unsettled, see questions).
- **Gasping or not breathing** → `Gasping for breath`, `Agonal respiration`, `Apnea`.
- **Shock (decision for all pages).** "shock³/SBP < 80" is an `or` of `(active_condition Shock)` and
  SBP < 80, on this page only. "pulse ≥ 100" and "heavy bleeding" in the same list are separate `or`
  items (any-of reading).
- **Shock likely (footnote 3, second).** "If SBP < 80, pulse ≥ 100, respiratory rate > 30,
  confusion/restlessness, weakness, shock likely" is read as **all of** them, the same way both
  builders read the tension pneumothorax list. Confusion is `Clouded consciousness` (AVPU "Confused")
  or `Acute confusion` (warning sign "Confusion"). This rule fires less often than an any-of reading;
  the priority rule still fires on SBP < 80 alone.
- **Tension pneumothorax likely.** Sudden-onset dyspnoea **and** (hyperresonance, decreased breath
  sounds or chest pain, each with `Unilateral`) **and** `Trachea displaced`.
- **Pulse < 50 and unstable.** pulse < 50 **and** any of: SBP < 90 or DBP < 60, decreased
  consciousness, chest pain, or acute heart failure. Acute heart failure is the `Acute heart failure`
  disorder **or** its footnote 3 (first) picture: leg swelling **and** breathlessness that is worse
  lying down (`Orthopnea`) or with effort (`Dyspnea on exertion`).
- **BP < 90/60** is read as systolic < 90 or diastolic < 60 (Will's convention).
- **GCS ≤ 8** is listed as the findings `Glasgow coma scale, 3` … `Glasgow coma scale, 8`.
- The page numbers two footnotes "3" (acute heart failure; shock). Both are read as written.
- All CPR, airway, oxygen, drug, fluid, intubation, decompression, bleeding-control and referral
  steps are management and are not encoded. The pointer line (18, 30, 20, 31, 29, 38, 82, 28) is a
  cross-reference only.

## Could not model

- **GCS as a measurement.** The language has no unit for a score, so there is no `measure` task for
  GCS and no `(<= GCS 8)` comparison. The GCS 3–8 findings fire only if the app records a GCS total
  as one of those findings. No anchor records them today, so for GCS this rule fires less often than
  the page intends. Summing the component scores (motor/verbal/eye) can't be expressed.
- "No pulse felt **or unsure**": uncertainty can't be recorded, so only `Absent pulse` is encoded.
- "If known heart problem or severe infection suspected" changes only the fluid regimen
  (management), so it is not encoded.
- "If neck injury suspected, use jaw-thrust" and footnote 1 (life-limiting illness: consider whether
  to proceed with CPR) are management decisions.

## SNOMED gaps

- There is no "Confusion" (finding). Used `Clouded consciousness` and `Acute confusion`.
- There is no "Weakness" (finding). Used `Asthenia`.
- There is no "Tracheal deviation" finding. Used `Trachea displaced` (disorder).
- There are no precoordinated concepts for "unilateral chest pain", "cyanosis of lips/tongue" or
  "heavy bleeding". Used `Chest pain` + `Unilateral`, `Blue lips`, `Blue tongue`, and
  `Bleeding` + `Severe (severity modifier)`.
- There is no "gurgling respiration" concept. Used `Gurgling` (finding).
- "More resonant": used `Hyperresonance`.

## Checker issues left in place

- None.

## Questions for a clinician

1. Should difficulty breathing, SpO₂ < 94%, pulse ≥ 100 or RR < 9 **alone** make a patient an
   Emergency, or are these only treatment triggers for a patient already identified as an emergency?
   Who counts as "the emergency patient"?
2. Is "shock³/SBP < 80, pulse ≥ 100 or heavy bleeding" an any-of list, or does pulse ≥ 100 qualify
   SBP < 80?
3. Does the shock footnote ("SBP < 80, pulse ≥ 100, respiratory rate > 30, confusion/restlessness,
   weakness, shock likely") mean all of the signs (as encoded), any one of them, or a number of them?
4. Tension pneumothorax: must sudden breathlessness, one-sided chest signs and a deviated trachea all
   be present, and does "on 1 side" apply to resonance and breath sounds as well as pain?
5. Acute heart failure (footnote 3): is leg swelling **plus** worsening breathlessness required (as
   encoded), or is any one feature enough?
6. Should this page's questions be asked of every patient with difficulty breathing or tachycardia,
   or only of patients already flagged as emergencies?
