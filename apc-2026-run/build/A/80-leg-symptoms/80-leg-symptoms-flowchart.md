# Page 80 – Leg symptoms: flowchart

Source: `inputs/2026/p80.png` (APC 2026, page 80). Screening bullets, red box, then the approach
to the patient not needing urgent attention.

```mermaid
flowchart TD
    START["Leg symptoms"] --> SCREEN["Screen for joint problem: check joints; ask patient to walk,<br/>sit and stand up with arms folded"]
    SCREEN -- "joint warm/tender/swollen or unable to do all actions comfortably" --> JOINT["Joint problem likely → 77"]
    START --> FOOT["Problem only in the foot → 81"]
    START --> RB{"Red box: any of"}
    RB --> FX["Unable to bear weight following injury:<br/>fracture likely → 30"]
    RB --> DVT["Swelling and pain in one calf:<br/>deep venous thrombosis likely"]
    RB --> ALI["Sudden severe leg pain at rest with numbness, weakness,<br/>pallor or no pulse in the leg: acute limb ischaemia likely"]
    RB --> CLI["Muscle pain in legs/buttocks on exercise with pain at rest,<br/>ulcer or gangrene: critical limb ischaemia likely"]
    FX & DVT & ALI & CLI --> URG["Urgent: refer urgently"]
    START --> STATIN["On simvastatin/atorvastatin/rosuvastatin with muscle pain/cramps<br/>or weakness: discuss with doctor/specialist"]
    START --> Q1{"Is there leg swelling?"}
    Q1 -- No --> PAIN["Ask about leg pain/discomfort"]
    PAIN --> SCI["Pain in buttock radiating down back of lower leg:<br/>irritation of sciatic nerve likely"]
    PAIN --> PVD["Muscle pain in legs or buttocks on exercise relieved by rest:<br/>peripheral vascular disease likely → 154"]
    Q1 -- Yes --> BOTH["Both legs swollen"]
    Q1 -- Yes --> ONE["Swelling over one joint"]
    BOTH --> Q2{"Difficulty breathing worse on lying flat?"}
    Q2 -- Yes --> HF["Heart failure likely → 151"]
    Q2 -- No --> OTHER["Check for pregnancy 174; urine dipstick for kidney disease;<br/>if none or unsure, refer same week"]
    ONE --> Q3{"Recent injury?"}
    Q3 -- Yes --> SPR["Sprain/strain likely"]
    Q3 -- No --> Q4{"Painful areas, ulcer/s, lump/s or<br/>changes in skin colour?"}
    Q4 -- Yes --> SKIN["→ 82"]
    Q4 -- No --> REF["Refer"]
```

## Decision nodes → rules

| Node | Modelled as | Rule |
|---|---|---|
| Leg symptoms (presenting complaint) | `Finding of lower limb` (descendants match: leg pain, leg/calf swelling, leg numbness/weakness) | due_to of both `check_for` tasks; first term of the priority rule |
| Red box, fracture | Unable to weight-bear **and** injury of lower limb | `Diagnose probable fracture of leg (leg symptoms)` |
| Red box, DVT | Unilateral calf swelling **and** calf pain. Risk factors ("especially if …") not required | `Diagnose probable DVT (leg symptoms)` |
| Red box, acute limb ischaemia | Sudden, severe leg pain at rest **and** any of leg numbness, leg weakness, pallor of leg skin, absent pulse in leg | `Diagnose probable acute limb ischaemia (leg symptoms)` |
| Red box, critical limb ischaemia | Intermittent claudication **and** any of leg pain at rest, leg ulcer, gangrene of leg | `Diagnose probable critical limb ischaemia (leg symptoms)` |
| Red box → Urgent | Complaint **and** any of the four diagnoses above | `Urgent: leg symptoms with fracture, DVT or limb ischaemia` |
| Joint screen | Any of joint warm, joint tender, joint swelling, difficulty walking, difficulty standing up | `Diagnose probable joint problem (leg symptoms)` |
| Q1 = No → buttock pain radiating down leg | No leg swelling **and** buttock pain **and** pain radiating to left/right leg | `Diagnose probable sciatic nerve irritation (leg symptoms)` |
| Q1 = No → exercise pain relieved by rest | No leg swelling **and** intermittent claudication | `Diagnose probable peripheral vascular disease (leg symptoms)` |
| Q1 = Yes → both legs → Q2 = Yes | Bilateral leg swelling **and** orthopnoea | `Diagnose probable heart failure (leg symptoms)` |
| Q1 = Yes → one joint → Q3 = Yes | Joint swelling **and** injury of lower limb | `Diagnose probable sprain (leg symptoms)` |
| Q2 = No, Q3 = No → Q4, foot only, statin | Routing and management (check pregnancy, dipstick, refer, → 82, → 81, discuss) | Not modelled (see provenance) |
