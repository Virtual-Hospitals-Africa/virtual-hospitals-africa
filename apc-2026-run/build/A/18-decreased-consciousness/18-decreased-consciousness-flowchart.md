# Page 18 – Decreased consciousness: flowchart

Source: APC 2026 e-book page 18 (the whole page is one red box). The branches below are the
"Check glucose, temperature and pupils" tree inside the box.

```mermaid
flowchart TD
    DC["Patient with decreased consciousness<br/>(give urgent attention)"]
    DC --> ABC["Assess/manage airway, breathing, circulation ↻16;<br/>identify injuries, undress, log-roll, keep warm"]
    DC --> PTR["Seizures ↻20 · injuries ↻30 · burns ↻31"]
    DC --> ANA{"Sudden decreased consciousness and any of: generalised itch/rash,<br/>face/tongue swelling, wheeze, difficulty breathing, abdominal pain,<br/>vomiting or exposure to possible allergen¹?"}
    ANA -- Yes --> ANA28["Check for anaphylaxis ↻28"]
    DC --> CHK["Check glucose, temperature and pupils"]
    CHK --> G["Glucose"]
    G --> GLO["&lt; 3 (&lt; 4 if diabetes) or unable to measure"] --> GLOM["Give dextrose (management)"]
    G --> GHI["≥ 11.1"] --> GHIQ{"SBP &lt; 80, pulse ≥ 100,<br/>respiratory rate &gt; 30, weakness?"}
    GHIQ -- Yes --> SHOCK["Shock likely"]
    GHI --> GHIM["Give fluids, insulin if delay (management)"]
    CHK --> T["Temperature"]
    T --> TLO["≤ 35°C"] --> TLOM["Rewarm (management)"]
    T --> THI["≥ 38°C"] --> MEN["Ceftriaxone for possible meningitis;<br/>malaria area in past 3 months ↻39"]
    CHK --> P["Pupils"]
    P --> PIN["Pinpoint"]
    PIN --> PIN1["Illegal drug use and/or respiratory rate &lt; 12"] --> POIS["Poisoning likely ↻27"]
    PIN --> PIN2["Excessive secretions or muscle twitching"] --> POIS
    P --> DIL["Both equally dilated"] --> OD["Stimulant or other drug overdose likely"] --> POIS
    P --> UNEQ["Unequal or respond poorly to light"] --> UNEQM["Raise head 30°, keep spine straight,<br/>discuss urgently (management)"]
    DC --> REF["Refer urgently; monitor while awaiting transport (management)"]
```

¹ Common allergens include medication, food or insect bite/sting within the past few hours.

## Decision nodes → rules

| Node | Modelled as | Rule |
|---|---|---|
| Patient with decreased consciousness | `Decreased level of consciousness` → Urgent | `Urgent: decreased consciousness` |
| Checks on the page (pupils, drug use, secretions, twitching, weakness, anaphylaxis features, exposures) | `check_for` triggered by decreased consciousness | `Check for causes of decreased consciousness` |
| ANA = Yes | Sudden-onset decreased consciousness **and** any of the listed features or exposure to drug / food / insect bite / sting | `Consider anaphylaxis in sudden decreased consciousness` (possible) |
| Glucose ≥ 11.1 → Shock likely | Decreased consciousness **and** glucose ≥ 11.1 **and** any of SBP < 80, pulse ≥ 100, RR > 30, weakness | `Diagnose probable shock in decreased consciousness with glucose ≥ 11.1` |
| Temperature ≥ 38°C → possible meningitis | Decreased consciousness **and** temperature ≥ 38 | `Diagnose possible meningitis in decreased consciousness with fever` (possible) |
| Both equally dilated → Stimulant or other drug overdose likely | Decreased consciousness **and** dilated pupils, both eyes | `Diagnose probable overdose in decreased consciousness with dilated pupils` |
| Pinpoint branches / overdose → Poisoning likely | Decreased consciousness **and** (constricted pupils **and** (illicit drug use or RR < 12 or excessive salivation / bronchial secretion or muscle twitch)) **or** both pupils dilated | `Diagnose probable poisoning in decreased consciousness` |
| Glucose < 3, temperature ≤ 35°C, unequal/poorly reactive pupils | Lead only to management; not modelled | — |
| Seizures / injuries / burns / malaria / ABC pointers | Cross-references to other pages; not modelled | — |
