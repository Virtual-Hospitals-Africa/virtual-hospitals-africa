# Page 51 – Nose symptoms: flowchart

Source: `inputs/2026/p51.png` (APC 2026, page 51).

```mermaid
flowchart TD
    START["Patient with nose symptoms"] --> RB{"Head injury with clear watery<br/>discharge from nose?"}
    RB -- Yes --> URG["Give urgent attention. Refer urgently (→30)"]
    RB -- No --> APP["Approach to the patient not needing urgent attention"]
    APP --> DIPH{"Sore throat, mild fever and thick grey layer<br/>in nose/throat (pseudomembrane)?"}
    DIPH -- Yes --> DIPHX["Consider diphtheria (→53)"]
    APP --> SYM["Manage according to nose symptom/s"]
    SYM --> BR["Blocked/runny nose: ask about duration and associated symptoms"]
    SYM --> BL["Bleeding nose"]
    BR --> A["Sore throat or fever for less than 3 days"]
    A --> AQ{"Any of: temperature ≥ 38°C, chills,<br/>nausea, sore muscles?"}
    AQ -- No --> CC["Common cold likely"]
    AQ -- Yes --> AVI["Acute viral infection likely"]
    BR --> S["Pain when pushing on forehead/cheeks, headache worse<br/>on bending forward, recent common cold"]
    S --> SIN["Sinusitis likely"]
    BR --> AR["Recurrent sneezing or itchy/runny/blocked nose<br/>most days for > 4 weeks"]
    AR --> ARX["Allergic rhinitis likely"]
    BR --> U["Runny nose with persistent cough and/or<br/>frequent throat clearing"]
    U --> UX["Upper airway cough syndrome (postnasal drip) likely"]
    BL --> BLR{"Continually rubbing or itchy nose?"}
    BLR -- Yes --> ARP["Consider allergic rhinitis"]
```

## Decision nodes → rules

| Node | Modelled as | Rule |
|---|---|---|
| Nose symptoms (entry) | `or` of Nasal discharge, Nasal congestion, Bleeding from nose | due_to of `Check for urgent nose symptom conditions` and `Check for causes of nose symptoms` |
| Red box: head injury with clear watery discharge | Injury of head **and** Nasal discharge qualified Clear + Watery | `Urgent: nose symptoms with head injury and clear watery nasal discharge` |
| Consider diphtheria | Sore throat **and** Fever (Mild) **and** Pseudomembrane in nose or pharynx | `Diagnose possible diphtheria from nose symptoms` |
| < 3 days, AQ = No | Blocked/runny nose **and** sore throat or fever with onset within 3 days **and** temperature < 38 and no chill, nausea, muscle pain | `Diagnose probable common cold from nose symptoms` |
| < 3 days, AQ = Yes | Same first two parts **and** any of temperature ≥ 38, chill, nausea, muscle pain | `Diagnose probable acute viral infection from nose symptoms` |
| Sinusitis likely | Blocked/runny nose **and** frontal or maxillary sinus tenderness **and** headache **and** recent common cold | `Diagnose probable sinusitis from nose symptoms` |
| Allergic rhinitis likely | Any of recurrent sneezing / itchy nose / runny nose / blocked nose with onset at least 4 weeks ago | `Diagnose probable allergic rhinitis from nose symptoms` |
| Upper airway cough syndrome likely | Nasal discharge **and** (persistent cough **or** frequent throat clearing) | `Diagnose probable postnasal drip from nose symptoms` |
| Bleeding nose → consider allergic rhinitis | Bleeding from nose **and** (repetitive rubbing of nose **or** itchy nose) | `Diagnose possible allergic rhinitis from nosebleed` |

## Notes

- The flowchart under "Blocked/runny nose" has four parallel columns with no Yes/No between them; each is
  modelled as its own diagnosis rule.
- Everything inside the "likely" boxes (medicines, referral, checks of BP and throat, follow-up) is
  management and is not modelled.
