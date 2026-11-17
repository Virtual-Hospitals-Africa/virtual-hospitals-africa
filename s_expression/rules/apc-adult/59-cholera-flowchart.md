# Page 59 – Cholera: flowchart

Source: `inputs/2026/p59.png` (APC 2026 e-book, page 59; four red boxes).

```mermaid
flowchart TD
    C["Watery diarrhoea (± vomiting) and in cholera outbreak area in past 5 days<br/>→ cholera likely. Discuss all suspected cases with doctor.<br/>Isolate; glucose &lt; 3 (&lt; 4 if diabetes) ↻ 19; record each episode"]
    C --> Q1["Does patient have any of: drowsy/decreased consciousness, confused,<br/>difficulty breathing, weak pulse<br/><i>or</i> ≥ 2 of: unable to drink (or drinking poorly), poor skin turgor, sunken eyes?"]
    Q1 -- Yes --> SEV["RED BOX 2: Manage as severe dehydration and refer urgently<br/>(IV fluids / ORS / NGT, ongoing losses)"]
    SEV --> RE15["RED BOX 3: Reassess every 15-30 minutes.<br/>No better/worse → discuss with referral centre.<br/>Awake, able to drink and pulse &lt; 100 → also manage as some dehydration"]
    RE15 --> CIPRO1["Give single dose ciprofloxacin 1g. Send stool for MCS and cholera"]
    Q1 -- No --> Q2["Does patient have ≥ 2 of: restless, thirsty, dry mouth, pulse ≥ 100?"]
    Q2 -- Yes --> SOME["RED BOX 1: Some dehydration likely<br/>ORS 75mL/kg over 4 hours + after each episode"]
    Q2 -- No --> NONE["Dehydration unlikely. ORS at least 2L over 4 hours"]
    SOME --> STOOL["Send stool specimen for MCS and cholera"]
    NONE --> STOOL
    STOOL --> RH["Reassess hourly. Either of: signs of dehydration (unable to drink/drinking poorly,<br/>poor skin turgor, sunken eyes, weak pulse/pulse ≥ 100, not passing urine,<br/>unable to walk unaided) or ongoing diarrhoea or vomiting?"]
    RH -- Yes --> SEV2["RED BOX 4: Manage as severe dehydration and refer urgently (see adjacent)"]
    RH -- No --> TR["Reliable transport to return if worse?"]
    TR -- No --> DR["Discuss/refer; keep reassessing hourly;<br/>ciprofloxacin if some dehydration, pregnant, ≥ 60 y or long-term condition"]
    TR -- Yes --> DC["Discharge to reliable carer; advice; ORS after each stool; handwashing"]
    CIPRO1 --> N["Notify as suspected cholera"]
    DR --> N
    DC --> N
```

## Decision nodes → rules

| Node | Modelled as | Rule |
|---|---|---|
| Diarrhoea presents (entry) | `Diarrhea` (common symptom) triggers the questions for cholera | `Check for cholera (cholera page)` |
| C: cholera likely | Watery diarrhoea (Diarrhea + `Watery` qualifier) **and** exposure to *Vibrio cholerae* with onset within the past 5 days (`<=`). "With or without vomiting" adds no condition | `Diagnose probable cholera` |
| Cholera → dehydration questions | `(active_condition Cholera)` triggers the dehydration check | `Check for level of dehydration in cholera` |
| Q1 = Yes | Cholera **and** (any of drowsy / decreased consciousness / confused / difficulty breathing / weak pulse **or** `any2` of unable to drink-or-drinking-poorly, poor skin turgor, sunken eyes) | `Urgent: cholera with severe dehydration` |
| Q1 = No → Q2 = Yes | Cholera **and** `(not Q1)` **and** `any2` of restless, thirsty, dry mouth, pulse ≥ 100 | `Diagnose probable some dehydration in cholera` → `Urgent: cholera with some dehydration` (red box 1) |
| Q2 = No: dehydration unlikely | Not modelled ("unlikely" has no form) | — |
| Reassess every 15–30 min (red box 3) | Not modelled: reassessment after IV treatment; management | — |
| Reassess hourly → red box 4 | Not modelled: a re-evaluation after ORS, which the language cannot tell apart from the first assessment (see remaining questions) | — |
| Transport / discharge / ciprofloxacin / notify | Management | — |

## Notes

- "Pulse ≥ 100" is `(>= (measurement "Pulse, function" bpm) 100)`.
- "Confused" is either `Acute confusion` (checked for) or `Clouded consciousness` (the AVPU "Confused" vital).
- "Unable to drink (or drinking poorly)" is one group: `Unable to drink` or `Difficulty drinking`, counted once inside the `any2`.
