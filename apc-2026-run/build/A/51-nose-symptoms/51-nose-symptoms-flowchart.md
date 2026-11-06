# Page 51 – Nose symptoms: flowchart

Source: APC 2026 e-book page 51 (`inputs/2026/p51.png`).

```mermaid
flowchart TD
    START["Patient with nose symptoms"]
    START --> RB{"Head injury with clear watery<br/>discharge from nose?"}
    RB -- Yes --> URG["Urgent attention. Refer urgently (→30)"]
    RB -- No --> APP["Approach to the patient not needing urgent attention"]
    APP --> DIPH{"Sore throat, mild fever and thick grey layer<br/>in nose/throat (pseudomembrane)?"}
    DIPH -- Yes --> DIPHX["Consider diphtheria (→53)"]
    APP --> SYM["Manage according to nose symptom/s"]
    SYM --> BR["Blocked/runny nose:<br/>ask about duration and associated symptoms"]
    SYM --> BL["Bleeding nose"]
    BR --> ST["Sore throat or fever for less than 3 days"]
    ST --> ANY{"Any of: temperature ≥ 38°C,<br/>chills, nausea, sore muscles?"}
    ANY -- No --> CC["Common cold likely"]
    ANY -- Yes --> AVI["Acute viral infection likely"]
    BR --> SIN["Pain when pushing on forehead/cheeks,<br/>headache worse on bending forward,<br/>recent common cold"]
    SIN --> SINX["Sinusitis likely"]
    BR --> AR["Recurrent sneezing or itchy/runny/blocked nose<br/>most days for > 4 weeks"]
    AR --> ARX["Allergic rhinitis likely"]
    BR --> UA["Runny nose with persistent cough<br/>and/or frequent throat clearing"]
    UA --> UAX["Upper airway cough syndrome (postnasal drip) likely"]
    BL --> BLM["Pinch nostrils, check BP, BIPP etc. (management)"]
    BL --> RUB{"Continually rubbing or itchy nose?"}
    RUB -- Yes --> ARP["Consider allergic rhinitis"]
```

## Decision nodes → rules

| Node | Modelled as | Rule |
|---|---|---|
| Nose symptoms (trigger) | `(clinical_finding "Nose finding")`; Nasal discharge, Nasal obstruction and Bleeding from nose are all descendants | `Check for urgent nose symptom conditions` |
| Red box | Nose finding **and** Injury of head **and** Nasal discharge qualified Clear + Watery | `Urgent: nose symptoms with head injury and clear watery discharge` |
| Diphtheria | Sore throat **and** Fever **and** pseudomembrane in nose or pharynx | `Diagnose possible diphtheria from nose symptoms` |
| Blocked/runny nose | `(or Nasal discharge, Nasal obstruction)` | `Check for causes of blocked or runny nose`, and the first clause of each blocked/runny diagnosis rule |
| Sore throat or fever < 3 days, Any of = No | blocked/runny **and** sore throat or fever with onset within 3 days **and** temperature < 38 **and** no chill, no muscle pain, no nausea | `Diagnose probable common cold from nose symptoms` |
| Sore throat or fever < 3 days, Any of = Yes | blocked/runny **and** sore throat or fever with onset within 3 days **and** (temperature ≥ 38 or chill or muscle pain or nausea) | `Diagnose probable acute viral infection from nose symptoms` |
| Sinusitis | blocked/runny **and** tenderness over frontal or maxillary sinus **and** recent common cold (headache worse on bending: SNOMED gap) | `Diagnose probable sinusitis from nose symptoms` |
| Allergic rhinitis | sneezing, itchy nose, runny nose or blocked nose with onset ≥ 4 weeks ago | `Diagnose probable allergic rhinitis from nose symptoms` |
| Upper airway cough syndrome | runny nose **and** (persistent cough or frequent throat clearing) | `Diagnose probable postnasal drip from nose symptoms` |
| Bleeding nose → rubbing/itchy | bleeding from nose **and** itchy nose (rubbing: SNOMED gap) | `Diagnose possible allergic rhinitis from nosebleed` |
| Bleeding nose management, BP check | Management; BP is a routine vital | not encoded |
