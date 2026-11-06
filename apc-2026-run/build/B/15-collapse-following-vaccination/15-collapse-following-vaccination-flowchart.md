# Page 15 – Collapse following vaccination: flowchart

Source: `inputs/2026/p15.png` (APC 2026 e-book, page 15). Red box: "Treat as **anaphylaxis** → 28" (pointer only).

```mermaid
flowchart TD
    START["Collapse following vaccination<br/>Call for help. Lie flat, raise legs. Check response."]
    START --> RESP{"Unresponsive: no pulse / not breathing?"}
    RESP -- Yes --> CPR["Start CPR ↻ 16"]
    RESP -- "No (breathing and pulse present)" --> ASSESS["Assess timing of collapse, duration of loss of consciousness;<br/>check breathing, pulse and BP"]
    ASSESS --> SUDDEN["Sudden collapse<br/>• at the time of vaccination<br/>• LOC 20 s – 1 min, relieved by lying down / raising legs<br/>• BP briefly low, rapidly normal again<br/>• pulse may be slow<br/>• breathing usually normal (may hyperventilate)<br/>• no other signs or symptoms"]
    ASSESS --> DELAYED["Delayed collapse<br/>• 5–10 min after vaccination (up to 1 hour)<br/>• LOC &gt; 1 min, not relieved by lying down<br/>• BP &lt; 90/60 and remains low<br/>• pulse &gt; 120<br/>• may have wheeze, stridor, cough<br/>• other signs (swelling, rash)"]
    SUDDEN --> FAINT["Fainting episode likely<br/>→ Management; Refer if head injury, heart condition, unusual symptoms"]
    DELAYED --> ANA["RED BOX: Treat as anaphylaxis → 28"]
```

## Decision nodes → rules

| Node | Modelled as | Rule |
|---|---|---|
| Presenting complaint | Collapse **and** Vaccination given | `Check for features of delayed collapse following vaccination` (trigger) |
| Delayed-collapse signs | check_for wheeze, stridor, cough, swelling, rash (BP and pulse are routine vitals) | `Check for features of delayed collapse following vaccination` |
| Sudden collapse → Fainting episode likely | Collapse, Vaccination given, SBP ≥ 90, DBP ≥ 60, pulse ≤ 120, and none of wheeze, stridor, cough, swelling, rash | `Diagnose probable fainting episode following vaccination` → Syncope (probable) |
| Delayed collapse → Treat as anaphylaxis | Not encoded (pointer to page 28) | — (cross_reference_only) |
| No pulse / not breathing → CPR | Not encoded (management; cardiac arrest is already a warning sign) | — |

## Notes

- Timing (at vaccination vs 5–10 minutes after) and LOC duration cannot be expressed: the language compares an onset only with "time ago", not with another event.
- "Pulse may be slow" and "may hyperventilate" are not required by the rule (the page says "may").
- Management and "Refer if" items are management steps and are not encoded.
