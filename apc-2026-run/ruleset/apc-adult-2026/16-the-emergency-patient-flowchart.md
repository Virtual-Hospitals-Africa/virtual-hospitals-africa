# Page 16 – The emergency patient: flowchart

Source: APC 2026 e-book page 16 (one red box, "Give urgent attention to the emergency patient").

```mermaid
flowchart TD
    Q1["Does the patient respond to voice or physical stimulation?"]
    Q1 -- Yes --> ABC
    Q1 -- No --> HELP["Call for help and an AED or defibrillator.<br/>Feel for carotid pulse for maximum of 10 seconds."]
    HELP --> Q2{"Pulse?"}
    Q2 -- "No pulse felt or unsure" --> CPR["Start CPR¹ → 17"]
    Q2 -- "Pulse felt" --> Q3["Check breathing"]
    Q3 -- "Breathing well" --> ABC
    Q3 -- "Gasping or not breathing" --> BVM["Check airway clear. 1 breath with bag-valve-mask on 100% O₂ every 6 s.<br/>Recheck pulse every 2 min; if no pulse, start CPR¹ → 17"]
    BVM --> ABC
    ABC["Assess and manage airway, breathing, circulation and level of consciousness"]
    ABC --> AIR["Airway: obstructed (snoring, gurgling, noisy breathing) → open airway;<br/>unconscious → oropharyngeal airway; intubate if airway not maintained"]
    ABC --> BR["Breathing: difficulty breathing or SpO₂ &lt; 94% → oxygen;<br/>RR &lt; 9 or blue lips/tongue → bag-valve-mask;<br/>sudden breathlessness, more resonant/decreased breath sounds/pain on 1 side,<br/>deviated trachea → <b>tension pneumothorax likely</b>"]
    ABC --> CIRC["Circulation: pulse &lt; 50 and unstable (BP &lt; 90/60, decreased consciousness,<br/>chest pain or acute heart failure³) → atropine;<br/>shock³/SBP &lt; 80, pulse ≥ 100 or heavy bleeding → IV fluids; stop bleeding"]
    ABC --> LOC["Level of consciousness: GCS; if GCS ≤ 8, intubate"]
    AIR & BR & CIRC & LOC --> REF["Manage further and refer urgently<br/>(pointers: decreased consciousness 18, injured 30, seizures 20, burns 31,<br/>bite/sting 29, fever 38, rash 82, anaphylaxis 28; other symptom → symptom page)"]
```

¹ Life-limiting illness: consider whether to proceed. ³ (first) Acute heart failure: leg swelling, difficulty
breathing which worsens on lying down/with effort. ³ (second) If SBP < 80, pulse ≥ 100, respiratory rate > 30,
confusion/restlessness, weakness, **shock likely**. (The page numbers both footnotes "3".)

## Decision nodes → rules

| Node | Modelled as | Rule |
|---|---|---|
| Q1 = No (does not respond to voice or physical stimulation) | `Unresponsive` | trigger of `Check for emergency patient airway, breathing and circulation signs`; `Emergency: emergency patient unresponsive, pulseless or not breathing` |
| Q2 = No pulse felt or unsure | `Absent pulse`, or `Cardiac arrest` (warning sign) | `Emergency: emergency patient unresponsive, pulseless or not breathing` |
| Q3 = Gasping or not breathing | `Gasping for breath`, `Agonal respiration`, `Apnea` | `Emergency: emergency patient unresponsive, pulseless or not breathing` |
| Q3 = Breathing well / Q1 = Yes | No rule of its own; the patient goes on to the ABC assessment, whose findings drive the second priority rule | — |
| Airway obstructed (snoring, gurgling, noisy breathing) | `Respiratory obstruction` (warning sign) or `Snoring`, `Gurgling`, `Noisy respiration` | `Emergency: emergency patient with airway, breathing, circulation or consciousness compromise` |
| Difficulty breathing or SpO₂ < 94% | `Difficulty breathing`, SpO₂ < 94 | same |
| RR < 9 or blue lips/tongue | RR < 9, `Blue lips`, `Blue tongue` | same |
| Tension pneumothorax likely | Sudden-onset dyspnoea **and** (hyperresonance, decreased breath sounds or chest pain, each unilateral) **and** `Trachea displaced` | `Diagnose probable tension pneumothorax (emergency patient)`, then `(active_condition Tension pneumothorax)` in the second priority rule |
| Pulse < 50 and unstable | pulse < 50 **and** (SBP < 90 or DBP < 60, decreased consciousness, chest pain, `Acute heart failure`, or leg swelling **and** orthopnoea/dyspnoea on exertion from footnote 3) | second priority rule |
| Shock³/SBP < 80, pulse ≥ 100 or heavy bleeding | `(active_condition Shock)` or SBP < 80, pulse ≥ 100, severe bleeding | second priority rule |
| Shock likely (footnote) | SBP < 80 **and** pulse ≥ 100 **and** RR > 30 **and** (confusion [`Clouded consciousness` or `Acute confusion`] or restlessness) **and** weakness | `Diagnose probable shock (emergency patient)` |
| GCS ≤ 8 | `Glasgow coma scale, 3` … `Glasgow coma scale, 8` findings | second priority rule |
| Manage further and refer urgently | Management and cross-references only | not encoded |

## Notes

- Every action (CPR, AED, bag-valve-mask, airway manoeuvres, oxygen, atropine, fluids, intubation,
  chest decompression, tourniquet, recovery position) is management and is not modelled.
- Difficulty breathing is an Emergency criterion with SpO₂ < 94%, because the page lists them in one sentence (reconciler decision, unsettled; see remaining questions).
