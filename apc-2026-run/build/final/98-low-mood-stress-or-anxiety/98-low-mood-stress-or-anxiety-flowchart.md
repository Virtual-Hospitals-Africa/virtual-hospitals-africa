# Page 98 – Low mood, stress or anxiety: flowchart

Source: APC 2026 e-book page 98 (red box plus the "Assess" table). The page is a table, not a drawn
flowchart; its "If … likely" rows are multi-step conditions, so they are drawn here.

```mermaid
flowchart TD
    P["Patient with low mood, stress or anxiety"]
    P --> RB{"Suicidal thoughts or behaviour?"}
    RB -- Yes --> URG["Give urgent attention ↻ 34"]
    P --> GAD{"Excessive worry causing impaired function/distress<br/>for at least 6 months, with ≥ 3 of: muscle tension,<br/>restlessness, irritability, difficulty sleeping,<br/>poor concentration, tiredness?"}
    GAD -- Yes --> GADL["Generalised anxiety disorder likely ↻ 160"]
    P --> PTSD{"Anxiety &gt; 1 month linked to a bad experience, with ≥ 3 of:<br/>nightmares/flashbacks, avoids situations/people,<br/>constantly on guard/easily startled,<br/>feels numb/detached from others/surroundings?"}
    PTSD -- Yes --> PTSDL["PTSD likely. Discuss/refer"]
    P --> PH{"Anxiety induced by a situation/object (phobia)<br/>or repeated sudden fear with physical symptoms (panic)?"}
    PH -- Yes --> DR["Discuss/refer"]
    P --> DEP{"Past month: down/depressed/hopeless<br/>or little interest/pleasure?"}
    DEP -- Yes --> P159["→ 159"]
    P --> SUB{"Past year: ≥ 4 drinks/session, illegal drugs,<br/>misused medication?"}
    SUB -- Yes --> P165["↻ 165"]
```

## Decision nodes → rules

| Node | Modelled as | Rule |
|---|---|---|
| Trigger | Depressed mood, Stress or Anxiety (finding) | `Check for urgent low mood, stress or anxiety conditions`, `Check for generalised anxiety disorder and PTSD features` |
| Red box | Complaint **and** (suicidal thoughts or suicidal behaviour) | `Urgent: low mood, stress or anxiety with suicidal thoughts or behaviour` |
| GAD | Excessive worry with onset ≥ 6 months ago **and** distress **and** ≥ 3 of the six symptoms | `Diagnose probable generalised anxiety disorder (low mood, stress or anxiety page)` |
| PTSD | Anxiety onset ≥ 1 month ago **and** victim of psychological trauma **and** ≥ 3 of the four groups | `Diagnose probable post-traumatic stress disorder (low mood, stress or anxiety page)` |
| Phobia / panic | Not modelled: the page says "discuss/refer", not "likely" or "consider" | none |
| Depression, substance use, abuse, stressors, women's health, medication | Routing to other pages or management | none |

## Notes

- "≥ 3 of" is written with `any2` nested in `or`/`and` (the language has only `any2`): the first
  present item plus at least two of the items after it. This is exactly equivalent to "at least 3".
