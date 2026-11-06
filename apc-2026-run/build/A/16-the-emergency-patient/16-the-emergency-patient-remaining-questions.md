# Page 16 – The emergency patient: remaining questions

## Decisions made

- **Trigger.** "The emergency patient" is not a recorded complaint. The `check_for` task fires on an `or`
  of the page's entry points: `Unresponsive` (AVPU), the `Cardiac arrest` and `Respiratory obstruction`
  warning signs, `Dyspnea` (common symptom, for the tension pneumothorax questions), and the vital
  thresholds the page acts on (SBP < 80, pulse < 50, pulse ≥ 100, RR < 9, RR > 30, SpO₂ < 94%). This is
  a broad trigger; it will ask the questions for many non-emergency patients with dyspnoea or tachycardia.
- **Priority level: Emergency** for both priority rules (page is "The emergency patient", with CPR and
  airway management), rather than Urgent from the header wording "Give urgent attention".
- **Two priority rules.** `Emergency: emergency patient unresponsive, pulseless or not breathing` covers
  the flowchart's top branches (no response, no pulse, gasping/not breathing). `Emergency: emergency
  patient with airway, breathing, circulation or consciousness compromise` covers the "If …" conditions
  in the Airway / Breathing / Circulation / Level of consciousness columns.
- **Difficulty breathing alone is not an Emergency criterion.** On the page it only triggers oxygen, and
  since `Dyspnea` is a descendant of `Difficulty breathing`, including it would make every patient who
  records dyspnoea an Emergency. SpO₂ < 94% from the same sentence is included.
- **Shock (decision for all pages).** "shock³/SBP < 80" is encoded as an `or` of `(active_condition Shock)`
  and SBP < 80, on this page only. "pulse ≥ 100" and "heavy bleeding" in the same list are separate `or`
  items (any-of reading).
- **Shock likely (footnote 3, second).** The page spells out "If SBP < 80, pulse ≥ 100, respiratory rate
  > 30, confusion/restlessness, weakness, shock likely". Encoded as `Diagnose probable shock (emergency
  patient)` requiring **all** of them (confusion or restlessness counting once). Fires less often than an
  any-of reading would; the priority rule still fires on SBP < 80 alone.
- **Tension pneumothorax likely.** Sudden-onset dyspnoea **and** (hyperresonance, decreased breath sounds
  or chest pain, each with `Unilateral`) **and** `Trachea displaced`.
- **Pulse < 50 and unstable.** pulse < 50 **and** any of SBP < 90 or DBP < 60, decreased consciousness,
  chest pain, acute heart failure.
- **BP < 90/60** read as systolic < 90 or diastolic < 60 (Will's convention).
- **GCS ≤ 8** enumerated as the findings `Glasgow coma scale, 3` … `Glasgow coma scale, 8`.
- The page numbers two footnotes "3" (acute heart failure; shock). Both are read as written.
- All CPR, airway, oxygen, drug, fluid, intubation, decompression, bleeding-control and referral steps are
  management and are not encoded. The pointer line (18, 30, 20, 31, 29, 38, 82, 28) is cross-reference only.

## Could not model

- **GCS as a measurement.** The language has no unit for a score, so there is no `measure` task for GCS
  and no `(<= GCS 8)` comparison. The enumeration of GCS 3–8 findings only fires if the app records a
  GCS total as one of those findings; summing the component scores (motor/verbal/eye) is not expressible.
  If nothing records these findings, the rule fires less often than the page intends.
- "No pulse felt **or unsure**": uncertainty cannot be recorded; only `Absent pulse` is encoded.
- Footnote 3 (first): acute heart failure as "leg swelling, difficulty breathing which worsens on lying
  down/with effort" is not encoded as a rule; the rule checks for `Acute heart failure` directly.
- Footnote 1 (life-limiting illness: consider whether to proceed with CPR) is a management decision.

## SNOMED gaps

- "Confusion" (finding) does not exist; used `Clouded consciousness` (the recorded AVPU "Confused" form).
- "Weakness" (finding) does not exist; used `Asthenia` (general weakness). `Generalized muscle weakness`
  was considered.
- No precoordinated "unilateral chest pain", "cyanosis of lips/tongue" or "heavy bleeding": used
  `Chest pain` + `Unilateral`, `Blue lips`, `Blue tongue`, and `Bleeding` + `Severe (severity modifier)`.

## Checker issues left in place

- None.

## Questions for a clinician

1. Should every SpO₂ < 94%, pulse ≥ 100 or RR < 9 alone make the patient an Emergency, or are these only
   treatment triggers within a patient already identified as an emergency?
2. Is "shock³/SBP < 80, pulse ≥ 100 or heavy bleeding" an any-of list, or does pulse ≥ 100 qualify SBP < 80?
3. Does the shock footnote mean all of the listed signs, or any (or a number) of them?
4. Tension pneumothorax: must all of sudden breathlessness, one-sided chest signs and deviated trachea be
   present, and does "on 1 side" apply to resonance and breath sounds as well as pain?
5. Should the emergency page's questions be asked of every patient with dyspnoea or tachycardia, or only
   of patients already flagged as emergencies?
