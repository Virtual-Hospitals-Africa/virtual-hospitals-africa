# Page 18 – Decreased consciousness: flowchart

Source: `inputs/2026/p18.png` (APC 2026). The whole page is one red box: "Give urgent attention to
the patient with decreased consciousness". It holds a list of first steps and then a three-way
decision tree (glucose, temperature, pupils).

```mermaid
flowchart TD
    DLOC["Decreased consciousness<br/>(give urgent attention)"]
    DLOC --> ABC["Assess and manage ABC and level of consciousness ↻ 16<br/>Identify injuries, look for cause"]
    DLOC --> XREF["If seizures ↻ 20, injuries ↻ 30, burns ↻ 31"]
    DLOC --> ANA{"Sudden decreased consciousness and any of:<br/>generalised itch/rash, face/tongue swelling, wheeze,<br/>difficulty breathing, abdominal pain, vomiting,<br/>exposure to possible allergen¹?"}
    ANA -- Yes --> ANA28["Check for anaphylaxis ↻ 28"]
    DLOC --> CHECK["Check glucose, temperature and pupils"]

    CHECK --> GLU["Glucose"]
    GLU --> GLO["&lt; 3 (&lt; 4 if diabetes) or unable to measure"]
    GLO --> GLOM["Dextrose / thiamine (management only)"]
    GLU --> GHI["≥ 11.1"]
    GHI --> SHOCK{"SBP &lt; 80, pulse ≥ 100,<br/>respiratory rate &gt; 30, weakness?"}
    SHOCK -- Yes --> SHOCKL["Shock likely"]
    GHI --> GHIM["Fluids, insulin (management only)"]

    CHECK --> TEMP["Temperature"]
    TEMP --> TLO["≤ 35°C"]
    TLO --> TLOM["Warm patient (management only)"]
    TEMP --> THI["≥ 38°C"]
    THI --> MEN["Ceftriaxone for possible meningitis"]
    THI --> MAL["Malaria area in past 3 months → manage ↻ 39"]
    THI --> TCOOL["If &gt; 40°C cool patient (management only)"]

    CHECK --> PUP["Pupils"]
    PUP --> PIN["Pinpoint"]
    PIN --> PIN1["Illegal drug use and/or respiratory rate &lt; 12"]
    PIN --> PIN2["Excessive secretions or muscle twitching"]
    PUP --> DIL["Both equally dilated"]
    DIL --> OD["Stimulant or other drug overdose likely"]
    PIN1 --> POIS["Poisoning likely ↻ 27"]
    PIN2 --> POIS
    OD --> POIS
    PUP --> UNEQ["Unequal or respond poorly to light"]
    UNEQ --> UNEQM["Raise head 30°, keep spine straight if injured,<br/>discuss urgently (management only)"]

    DLOC --> REF["Refer urgently; monitor every 15 minutes<br/>(management only)"]
```

¹ Common allergens include medication, food or insect bite/sting within the past few hours.

## Decision nodes → rules

| Node | Modelled as | Rule |
|---|---|---|
| Decreased consciousness (box header) | Trigger: `or` of Decreased level of consciousness and the three recorded AVPU levels below Alert (reacts to voice, reacts to pain, unresponsive) | `Check for causes of decreased consciousness`; `Urgent: decreased consciousness` |
| Sudden decreased consciousness + any anaphylaxis feature → check for anaphylaxis ↻ 28 | `possible` Anaphylaxis: sudden-onset decreased consciousness **and** any of generalised itch, generalised rash, face swelling, tongue swelling, wheeze, difficulty breathing, abdominal pain, vomiting, exposure to drug/food, insect bite/sting | `Diagnose possible anaphylaxis with sudden decreased consciousness` (feeds page 28's anaphylaxis check) |
| Glucose < 3 (< 4 if diabetes) or unable to measure | Not modelled: the branch names no diagnosis, only dextrose/thiamine management | none |
| Glucose ≥ 11.1 → SBP < 80, pulse ≥ 100, RR > 30, weakness → shock likely | `probable` Shock: trigger **and** glucose ≥ 11.1 **and** any of SBP < 80, pulse ≥ 100, RR > 30, weakness (Asthenia) | `Diagnose probable shock with decreased consciousness and glucose ≥ 11.1` |
| Temperature ≤ 35°C | Not modelled: management only (warming) | none |
| Temperature ≥ 38°C → "for possible meningitis" | `possible` Meningitis: trigger **and** temperature ≥ 38 | `Diagnose possible meningitis with decreased consciousness and temperature ≥ 38` |
| Temperature ≥ 38°C, malaria area → manage ↻ 39 | Not modelled: cross-reference to page 39 | none |
| Pinpoint + (illegal drug use and/or RR < 12) → poisoning likely | `probable` Poisoning, first branch | `Diagnose probable poisoning with decreased consciousness` |
| Pinpoint + (excessive secretions or muscle twitching) → poisoning likely | `probable` Poisoning, same branch (`or` of the two boxes) | `Diagnose probable poisoning with decreased consciousness` |
| Both equally dilated → stimulant or other drug overdose likely | `probable` Overdose: trigger **and** dilated pupils of both eyes | `Diagnose probable drug overdose with decreased consciousness and dilated pupils` |
| Stimulant/drug overdose likely → poisoning likely | `probable` Poisoning, second branch: trigger **and** dilated pupils of both eyes (evidence repeated, not `active_condition Overdose`, so it stays checked for in this file) | `Diagnose probable poisoning with decreased consciousness` |
| Unequal or respond poorly to light | Not modelled: the page attaches only management (head up, discuss) and names no diagnosis | none |

## Notes

- Glucose and temperature are routine vitals, so no `measure` task is written for them. Pupils are
  findings and go in the `check_for`.
- The page's "Unequal or respond poorly to light", "≤ 35°C" and "< 3 … or unable to measure"
  branches lead only to management, so nothing in the language consumes them; per Will's rule
  ("If the page really does not use a finding for anything, remove it from the check_for") they are
  not checked for.
