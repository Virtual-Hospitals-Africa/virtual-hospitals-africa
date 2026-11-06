# Page 16 – The emergency patient: remaining questions

## Decisions made

- **Scope.** The page is almost entirely resuscitation and management (CPR, bag-valve-mask,
  airway adjuncts, atropine, IV fluids, decompression, tourniquet, recovery position, intubation).
  None of that is encoded (no `manage` tasks this pass). What is encoded: one `check_for` task, two
  `probable` diagnosis rules (tension pneumothorax, shock) and one `Emergency` priority evaluation.
- **"The emergency patient" has no definition on this page.** The task and the priority are gated
  on the page's own entry features that VHA records: `Unresponsive` (Q1 = No; an AVPU vital
  option), `Cardiac arrest` and `Respiratory obstruction` (adult Emergency warning signs),
  `Difficulty breathing`, SpO₂ < 94, RR < 9, SBP < 80, pulse < 50. The priority is
  `(and <entry features> (or <all red-box criteria>))`, following Will's "(and complaint (or …))".
- **Priority level `Emergency`**, because the page is titled "The emergency patient" (Will's
  briefing names "Emergency patient" as an explicit escalation), although the header says
  "Give urgent attention".
- **Shock (all-pages decision).** "Shock³/SBP < 80" is encoded on this page as
  `(or (active_condition Shock) (< SBP 80))`, together with the line's other items "pulse ≥ 100 or
  heavy bleeding". This page's own footnote 3 (second) spells out "shock likely", so it becomes
  `Diagnose probable shock (emergency patient)`, read as **any of** SBP < 80, pulse ≥ 100,
  RR > 30, confusion/restlessness, weakness. No shared shock definition was built.
- **BP < 90/60** (pulse < 50 instability) = systolic < 90 or diastolic < 60 (Will's convention).
- **Tension pneumothorax likely** read as sudden breathlessness **and** (more resonant / decreased
  breath sounds / pain, on one side) **and** deviated trachea. "On 1 side" is the `Unilateral`
  qualifier on all three middle findings.
- **Acute heart failure³** (instability criterion for pulse < 50) is expanded into its footnote
  features, any of: leg swelling (`Swelling of lower limb`), dyspnoea worse lying down
  (`Orthopnea`), dyspnoea worse with effort (`Dyspnea on exertion`).
- **Gasping or not breathing** → `Apnea`, `Agonal respiration`, `Gasping for breath`.
  **No pulse felt** → `Absent pulse` (and `Cardiac arrest` in the gate).
- **Heavy bleeding** → `Bleeding` + `Severe (severity modifier)`, not the warning sign's
  `Uncontrolled` qualifier (the page says heavy, not uncontrolled).
- The page prints **two footnotes numbered 3**; the first belongs to "acute heart failure³", the
  second to "shock³" (and is the "shock likely" definition).

## Could not model

- **GCS (assess, add to a score out of 15, "If GCS ≤ 8, intubate").** A GCS score has no unit in
  the language, so it can neither be measured nor compared. Without it the priority rule fires
  less often than intended only for a patient with GCS ≤ 8 who has none of the other criteria
  (most such patients are also `Unresponsive` or have decreased consciousness).
- "Unsure" in "No pulse felt or unsure": no finding records an uncertain pulse check.
- "If known heart problem or severe infection suspected" changes only the fluid regimen
  (management); not encoded.
- "If neck injury suspected, use jaw-thrust" and footnote 1 (life-limiting illness, consider
  whether to proceed) are management.
- Routing line (→ 18, 30, 20, 31, 29, 38, 82, 28) and "If other symptom, manage as on symptom page":
  cross-references only.

## SNOMED gaps

- "Gurgling" breathing: no gurgling-respiration concept; used `Gurgling` (finding), whose parent is
  `Finding of pharynx`.
- "Weakness": no `Weakness` finding FSN; used `Asthenia` (finding).
- "Confusion": no `Confusion` finding; used `Acute confusion` (finding), as in VHA's vocabulary.
- "Deviated trachea": no `Tracheal deviation` finding; used `Trachea displaced` (disorder).
- "Blue lips/tongue": used `Blue lips` and `Blue tongue` (both findings; no cyanosis-of-lip concept).
- "More resonant": used `Hyperresonance` (finding).

## Checker issues left in place

- None.

## Questions for a clinician

1. Footnote 3 "If SBP < 80, pulse ≥ 100, respiratory rate > 30, confusion/restlessness, weakness,
   shock likely": any one of these, or several together? The "any of" reading makes pulse ≥ 100
   or RR > 30 alone a probable shock.
2. Tension pneumothorax: must all the listed features be present (as encoded), or is any enough?
3. Who is "the emergency patient"? The gate used here (unresponsive, cardiac arrest, obstructed
   airway, difficulty breathing, SpO₂ < 94, RR < 9, SBP < 80, pulse < 50) means difficulty
   breathing or SpO₂ < 94 alone is enough for `Emergency`. Is that intended, or should the
   emergency level need e.g. TEWS ≥ 7 or a warning sign?
4. "Shock/SBP < 80, pulse ≥ 100 or heavy bleeding": is pulse ≥ 100 an independent criterion, or a
   qualifier of shock?
5. Acute heart failure: is any one footnote feature enough, or leg swelling plus worsening dyspnoea?
