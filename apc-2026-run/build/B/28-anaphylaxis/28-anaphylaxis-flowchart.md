# Page 28 – Anaphylaxis: flowchart (APC 2026)

Source: `inputs/2026/p28.png`, red box "Give urgent attention to the patient with possible anaphylaxis".

```mermaid
flowchart TD
    Q1["In the few hours before symptoms started, was patient exposed to any<br/>medication, food¹ or insect bite/sting which has caused anaphylaxis before?"]
    Q1 -- Yes --> TREAT1["Treat as anaphylaxis"]
    Q1 -- No --> Q2["In the few hours before symptoms started, was patient exposed to any<br/>medication, food¹ or insect bite/sting?"]
    Q2 -- Yes --> Q3["Is there sudden onset of ≥ 2 of:<br/>1) Generalised itch/rash or face/tongue swelling<br/>2) Difficulty breathing<br/>3) BP &lt; 90/60 or dizziness/collapse<br/>4) Abdominal pain or vomiting"]
    Q2 -- No --> Q4["Is there sudden onset generalised itch/rash or face/tongue swelling<br/><i>and</i> any of: difficulty breathing, BP &lt; 90/60 or dizziness/collapse?"]
    Q3 -- Yes --> TREAT2["Treat as anaphylaxis"]
    Q3 -- No --> UNLIKELY["Anaphylaxis unlikely. Treat symptoms as on symptom pages. If unsure, discuss."]
    Q4 -- No --> UNLIKELY
    Q4 -- Yes --> TREAT3["Treat as anaphylaxis"]
    TREAT1 --> MANAGE["Manage anaphylaxis and refer urgently (management, not encoded)"]
    TREAT2 --> MANAGE
    TREAT3 --> MANAGE
```

¹ Common foods causing anaphylaxis include peanuts, tree nuts, egg, milk and fish.

## Decision nodes → rules

| Node | Modelled as | Rule |
|---|---|---|
| Entry ("patient with possible anaphylaxis") | Broad pre-screen: any sudden-onset skin sign alone, or `any2` of insect bite/sting, itch, rash, face/tongue swelling, difficulty breathing, dizziness, collapse, BP < 90/60 | `Diagnose possible anaphylaxis` → triggers `Check for Anaphylaxis` |
| Q1 = Yes | Exposure to a substance **and** a recorded allergy to the same substance (fish, milk, egg, peanut, tree nut, drug), or insect bite/sting **and** allergy to insect venom | `Diagnose probable anaphylaxis`, first seven `or` branches |
| Q1 = No → Q2 = Yes → Q3 = Yes | Any exposure (five foods, drug, insect bite/sting) **and** `any2` of the four symptom groups; sudden-onset qualifier on the skin group | `Diagnose probable anaphylaxis`, `(and (or exposures) (any2 …))` branch |
| Q2 = No → Q4 = Yes | Sudden-onset skin group **and** any of difficulty breathing, systolic < 90, diastolic < 60, dizziness, collapse (no abdominal pain/vomiting, as on the page) | `Diagnose probable anaphylaxis`, last `and` branch |
| Q3 = No / Q4 = No | "Anaphylaxis unlikely": no rule fires; no diagnosis is made | none (flowchart routing) |
| Treat as anaphylaxis | `(active_condition Anaphylaxis)` → Urgent | `Urgent: Anaphylaxis` |
| Manage anaphylaxis and refer urgently | Medicines, oxygen, fluids, referral | not encoded (no `manage` tasks in this pass) |

## Notes

- "In the few hours before symptoms started" is not modelled as a time comparison.
- BP < 90/60 is read as systolic < 90 **or** diastolic < 60.
- The lower half of the page (assess and advise the patient with previous anaphylaxis) is not modelled; see the remaining-questions file.
