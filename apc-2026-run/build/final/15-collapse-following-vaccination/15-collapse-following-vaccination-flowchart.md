# Page 15 – Collapse following vaccination: flowchart

Source: APC 2026 e-book page 15 (APC 2026 e-book, page 15). The only red box is the pointer
"Treat as anaphylaxis →28".

```mermaid
flowchart TD
    START["Collapse following vaccination<br/>Call for help. Lie flat, raise legs.<br/>Check response; if unresponsive check circulation, airway, breathing"]
    START --> PULSE{"No pulse / not breathing?"}
    PULSE -- Yes --> CPR["Start CPR ↻16"]
    PULSE -- "No (breathing and pulse present)" --> ASSESS["Assess timing of collapse, duration of loss of consciousness;<br/>check breathing, pulse and BP"]
    ASSESS --> SUDDEN["Sudden collapse<br/>• at time of vaccination<br/>• LOC 20 s–1 min, relieved by lying down + legs raised<br/>• BP briefly low, rapidly normal<br/>• pulse may be slow<br/>• breathing normal or hyperventilation<br/>• no other signs or symptoms"]
    ASSESS --> DELAYED["Delayed collapse<br/>• 5–10 min after vaccination (up to 1 h)<br/>• LOC &gt; 1 min, not relieved by lying down + legs raised<br/>• BP &lt; 90/60 and remains low<br/>• Pulse &gt; 120<br/>• may have wheeze, stridor, cough<br/>• other signs (swelling, rash) present"]
    SUDDEN --> FAINT["Fainting episode likely<br/>→ Management; Refer if: head injury, heart condition/serious illness, unusual symptoms"]
    DELAYED --> ANA["RED BOX: Treat as anaphylaxis →28"]
```

## Decision nodes → rules

| Node | Modelled as | Rule |
|---|---|---|
| Presenting complaint (collapse) | `(clinical_finding Collapse)` triggers the check; vaccination recorded as `Vaccination given` (situation) | `Check for collapse following vaccination features` |
| No pulse / not breathing → CPR ↻16 | Not modelled here: cross-reference to page 16; cardiac arrest / obstructed airway are existing Emergency warning signs | — |
| Sudden collapse → Fainting episode likely | Collapse **and** vaccination given **and** no wheeze/stridor/cough/swelling/rash **and** SBP ≥ 90 **and** DBP ≥ 60 **and** pulse ≤ 120 (the complement of the delayed column's BP < 90/60 and pulse > 120) | `Diagnose probable fainting episode following vaccination` |
| Delayed collapse → Treat as anaphylaxis 28 | Collapse **and** vaccination given **and** any of: SBP < 90, DBP < 60, pulse > 120, wheeze, stridor, cough, swelling, rash | `Diagnose probable anaphylaxis after collapse following vaccination` (page 28's rules then give the urgency) |
| Timing (at time vs 5–10 min / up to 1 h) and LOC duration (20 s–1 min vs > 1 min, relieved or not) | Not representable: no time relative to another event, no event duration | — |
| Refer if … | Management / referral, out of scope | — |

## Notes

- BP < 90/60 is read as systolic < 90 **or** diastolic < 60.
- The two rules are written to be mutually exclusive: any one delayed-collapse feature routes away
  from "fainting" towards anaphylaxis.
