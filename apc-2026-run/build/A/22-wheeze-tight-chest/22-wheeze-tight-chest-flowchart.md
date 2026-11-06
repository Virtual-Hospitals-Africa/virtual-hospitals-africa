# Page 22 – Wheeze/tight chest: flowchart

Source: `inputs/2026/p22.png` (APC 2026, page 22; one red box plus two pre-box bullets).

```mermaid
flowchart TD
    START["Wheeze/tight chest"] --> PRE1{"Sudden wheeze/tight chest and any of: generalised itch/rash,<br/>face/tongue swelling, BP &lt; 90/60, dizziness/collapse,<br/>abdominal pain, vomiting or exposure to possible allergen¹?"}
    PRE1 -- Yes --> ANA["Check for anaphylaxis ↻ 28"]
    START --> PRE2{"Difficulty breathing worse on lying flat and leg swelling<br/><i>or</i> patient ≥ 50 years with first episode of wheeze/tight chest?"}
    PRE2 -- Yes --> HF["Heart failure likely → 151"]
    START --> BOX["Give urgent attention to the patient with wheeze/tight chest"]
    BOX --> Q1{"Assess severity of episode:<br/>Any of: pulse &lt; 50, unable to talk, silent chest (tight chest but no wheeze),<br/>PEFR² &lt;33% of predicted, drowsy or confused?"}
    Q1 -- Yes --> LT["Life threatening: O₂, refer urgently, nebulise salbutamol + ipratropium,<br/>hydrocortisone; if no longer life threatening manage as severe"]
    Q1 -- No --> Q2{"Any of: oxygen saturation &lt; 90%, respiratory rate &gt; 30, pulse &gt; 120,<br/>unable to talk in full sentences, PEFR² &lt;60% of predicted, agitated?"}
    Q2 -- Yes --> SEV["Severe: O₂, refer urgently, nebulise salbutamol, prednisone/hydrocortisone → assess response"]
    LT --> SEV
    Q2 -- No --> MM["Mild or moderate: salbutamol; prednisone if known asthma/COPD; monitor"]
    MM --> Q3{"Assess after 1 hour of treatment:<br/>RR, PEFR², can patient talk normally?"}
    Q3 -- "Worsening: unable to talk normally or RR ≥ 20 or PEFR not improved" --> SEV
    Q3 -- "Improving/no change: talks normally and RR &lt; 20 or PEFR improved by &gt; 20%" --> Q4{"Wheeze/tight chest resolved?"}
    Q4 -- Resolved --> DIS["Discuss before discharge if risk factors; first episode → 138; routine care 140/141"]
    Q4 -- "Still present" --> Q5{"Repeat salbutamol 2-4 hourly.<br/>Still present after 3 hours?"}
    Q5 -- No --> DIS
    Q5 -- Yes --> REF["Continue salbutamol every 2-4 hours and refer"]
```

¹ Common allergens include medication, food or insect bite/sting within the past few hours.
² PEFR expressed as a percentage of the predicted normal value.

## Decision nodes → rules

| Node | Modelled as | Rule |
|---|---|---|
| START (presenting complaint) | `Wheezing` or `Tight chest` finding | trigger of `Check for wheeze/tight chest severity and causes`, `Measure PEFR for wheeze/tight chest` |
| Red-box header | Every patient with wheeze/tight chest is Urgent | `Urgent: wheeze/tight chest` |
| Q1 = Yes (life threatening) | complaint **and** any of pulse < 50, Unable to speak, (tight chest **and no** wheezing), PEFR % predicted < 33, Drowsy, Acute confusion | `Emergency: life-threatening wheeze/tight chest` |
| Q1 = No → Q2 = Yes (severe) | complaint **and** any of SpO₂ < 90, RR > 30, pulse > 120, Unable to complete a sentence in one breath, PEFR % predicted < 60, Feeling agitated | `Urgent: severe wheeze/tight chest episode` |
| Q2 = No (mild/moderate) | No rule beyond the header's Urgent | `Urgent: wheeze/tight chest` |
| Q3–Q5 (reassessment after 1 h / 3 h of treatment) | Not modelled: response to treatment over time is management follow-up | — |
| PRE1 = Yes | sudden-onset wheezing/tight chest **and** any listed feature or exposure → `possible` anaphylaxis, which triggers page 28's checks | `Diagnose possible anaphylaxis from sudden wheeze/tight chest` |
| PRE2 = Yes | complaint **and** Orthopnea **and** Leg swelling symptom (age ≥ 50 branch not representable) | `Diagnose probable heart failure from wheeze/tight chest` |
