# Page 20 – Anaphylaxis: flowchart

Source: `static/medical-resources/za/primary-care/adult/thumbnails/full-size/20.png` (red box).

```mermaid
flowchart TD
    Q1["In the few hours before symptoms started, was patient exposed to any<br/>medication, food¹ or insect bite/sting which has caused anaphylaxis before?"]
    Q1 -- Yes --> TREAT1["Treat for anaphylaxis"]
    Q1 -- No --> Q2["In the few hours before symptoms started, was patient exposed to any<br/>medication, food¹ or insect bite/sting?"]
    Q2 -- Yes --> Q3["Is there sudden onset of ≥ 2 of:<br/>1) Generalised itch/rash or face/tongue swelling<br/>2) Difficulty breathing<br/>3) BP &lt; 90/60 or dizziness/collapse<br/>4) Abdominal pain or vomiting"]
    Q2 -- No --> Q4["Is there sudden onset generalised itch/rash or face/tongue swelling<br/><b>and</b> any of: difficulty breathing, BP &lt; 90/60 or dizziness/collapse?"]
    Q3 -- Yes --> TREAT2["Treat for anaphylaxis"]
    Q3 -- No --> UNLIKELY["Anaphylaxis unlikely. Treat symptoms as on symptom pages. If unsure, discuss."]
    Q4 -- No --> UNLIKELY
    Q4 -- Yes --> TREAT3["Treat for anaphylaxis"]
```

¹ Common foods causing anaphylaxis: peanuts, tree nuts, egg, milk and fish.

## Decision nodes → rules

| Node | Modelled as | Rule |
|---|---|---|
| Q1 = Yes | Exposure to a substance **and** a recorded allergy to the same substance (fish, milk, egg, peanut, tree nut, drug) or insect bite/sting **and** allergy to insect venom | `Diagnose probable anaphylaxis`, first `or` branches |
| Q2 = Yes → Q3 = Yes | Any exposure (food, drug, insect bite/sting) **and** `any2` of the four symptom groups. Sudden-onset qualifier applied to the skin group | `Diagnose probable anaphylaxis`, `(and (or exposures) (any2 …))` branch |
| Q2 = No → Q4 = Yes | Sudden-onset skin group **and** any of difficulty breathing, BP < 90/60, dizziness, collapse. The page's Q4 text omits abdominal pain/vomiting; the rule keeps them out too | `Diagnose probable anaphylaxis`, last `and` branch |
| Pre-screen (what makes us ask the questions at all) | Any sudden-onset skin sign alone, or `any2` of insect bite/sting, itch, rash, face/tongue swelling, difficulty breathing, dizziness, collapse, low BP | `Diagnose possible anaphylaxis` → triggers `Check for Anaphylaxis` |
| Treat for anaphylaxis | `(active_condition Anaphylaxis)` → Urgent + management tasks | `Urgent: Anaphylaxis`, `Raise legs`, `Administer …` |

## Notes

- "In the few hours before" is not modelled as a time comparison; exposures are recorded in the
  current encounter, which is taken to mean recent.
- BP < 90/60 is read as systolic < 90 **or** diastolic < 60.
- The lower half of the page (assess/advise the patient with previous anaphylaxis) is routine care
  and is not modelled.
