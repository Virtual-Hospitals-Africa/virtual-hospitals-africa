# Page 59 – Cholera: flowchart

Source: `inputs/2026/p59.png` (APC 2026, page 59; four red boxes, all management boxes).

```mermaid
flowchart TD
    C0["Watery diarrhoea (± vomiting) <b>and</b> in cholera outbreak area in past 5 days"]
    C0 --> CL["Cholera likely. Discuss all suspected cases with doctor.<br/>Isolate; gloves/apron; disinfect. Check fingerprick glucose (&lt; 3, &lt; 4 if diabetes → p19).<br/>Record each episode of diarrhoea and vomiting."]
    CL --> Q1["Does patient have any of: drowsy/decreased consciousness, confused,<br/>difficulty breathing, weak pulse<br/><i>or</i> ≥ 2 of: unable to drink (or drinking poorly), poor skin turgor, sunken eyes?"]
    Q1 -- Yes --> SEV["RED BOX 2: Manage as severe dehydration and refer urgently<br/>(IV Ringer's lactate / NaCl 0.9%, ORS/NGT alternatives, ongoing-loss top-ups)"]
    SEV --> RE15["RED BOX 3: Reassess every 15-30 minutes.<br/>No better/worse → discuss with referral centre.<br/>Awake, able to drink and pulse &lt; 100 → also manage as some dehydration"]
    RE15 --> CIP1["Single dose ciprofloxacin; stool for MCS and cholera"]
    Q1 -- No --> Q2["Does patient have ≥ 2 of: restless, thirsty, dry mouth, pulse ≥ 100?"]
    Q2 -- Yes --> SOME["RED BOX 1: Some dehydration likely<br/>ORS 75mL/kg (or at least 2-4L) over 4 hours + ORS after each episode"]
    Q2 -- No --> NONE["Dehydration unlikely. ORS at least 2L over 4 hours"]
    SOME --> STOOL["Send stool specimen for MCS and cholera"]
    NONE --> STOOL
    STOOL --> RH["Reassess hourly. Either of:<br/>• signs of dehydration (unable to drink/drinking poorly, poor skin turgor, sunken eyes,<br/>weak pulse/pulse ≥ 100, not passing urine, unable to walk unaided)<br/>• ongoing diarrhoea or vomiting?"]
    RH -- Yes --> SEV2["RED BOX 4: Manage as severe dehydration and refer urgently (see adjacent)"]
    RH -- No --> TR["Reliable transport to return if worse?"]
    TR -- No --> DR["Discuss/refer; keep reassessing hourly;<br/>ciprofloxacin if some dehydration, pregnant, ≥ 60 y or long-term condition"]
    TR -- Yes --> DC["Discharge to carer; return advice; ORS after each stool; hygiene advice"]
    CIP1 --> NOT["Notify as suspected cholera"]
    SEV2 --> NOT
    DR --> NOT
    DC --> NOT
```

## Decision nodes → rules

| Node | Modelled as | Rule |
|---|---|---|
| Entry (what makes us ask) | Diarrhoea (common symptom) triggers the check for watery diarrhoea and exposure to *Vibrio cholerae* | `Check for cholera` |
| C0 → Cholera likely | Watery diarrhoea **and** exposure to *Vibrio cholerae* recorded within the past 5 days (`<=` onset comparison) | `Diagnose probable cholera` |
| After "cholera likely": assess dehydration | `(active_condition Cholera)` triggers the dehydration checklist | `Check for dehydration in cholera` |
| Q1 = Yes | Cholera **and** (any of drowsy/decreased LOC, confused, difficulty breathing, weak pulse **or** `any2` of unable to drink/drinking poorly, poor skin turgor, sunken eyes) | `Diagnose probable severe dehydration in cholera` |
| Q1 = Yes → refer urgently | `(active_condition Severe dehydration)` → `Urgent` | `Urgent: severe dehydration in cholera` |
| Q1 = No → Q2 = Yes | Cholera **and** `(not <Q1 criteria>)` **and** `any2` of restless, thirsty, dry mouth, pulse ≥ 100 | `Diagnose probable some dehydration in cholera` |
| Q2 = No (dehydration unlikely) | Not modelled (an "unlikely" outcome, management only) | — |
| Red box 3 (reassess every 15-30 min) | Not modelled: reassessment after treatment has started; management | — |
| Reassess hourly → Yes → red box 4 | Not modelled: the language cannot express "on reassessment after ORS" (see remaining questions) | — |
| Transport / discharge / ciprofloxacin / notify | Management, not modelled | — |
