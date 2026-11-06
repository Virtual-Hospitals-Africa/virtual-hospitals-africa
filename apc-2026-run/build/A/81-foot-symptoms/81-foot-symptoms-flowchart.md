# Page 81 – Foot symptoms: flowchart

Source: `inputs/2026/p81.png` (red box, then "Approach to the patient with foot symptoms not
needing urgent attention").

```mermaid
flowchart TD
    START["Patient with foot symptoms"]
    START --> JOINT{"Unable to walk, sit and stand comfortably<br/>and problem specifically in the joint?"}
    JOINT -- Yes --> P77["Joint symptoms, page 77"]
    JOINT -- No --> RB{"Red box: any of"}
    RB --> FX["Unable to bear weight following injury:<br/><b>fracture</b> likely → 30"]
    RB --> ALI["Sudden severe foot pain at rest with any in the leg:<br/>numbness, weakness, pallor, no pulse:<br/><b>acute limb ischaemia</b> likely"]
    RB --> CLI["Muscle pain in legs/buttocks on exercise with<br/>foot pain at rest, ulcer or gangrene on foot:<br/><b>critical limb ischaemia</b> likely"]
    FX --> URG["Give urgent attention. Refer urgently."]
    ALI --> URG
    CLI --> URG
    RB -- none --> APP["Approach: not needing urgent attention"]
    APP --> TP["Cracks/peeling/scaly lesions between toes, or thickened scaly skin<br/>on soles/heels/sides of feet: <b>tinea pedis</b> likely"]
    APP --> GEN["Generalised foot pain"]
    APP --> LOC["Localised pain<br/>(ensure shoes fit properly)"]
    GEN --> NEU["Constant burning pain, pins/needles or numbness of feet worse at night"]
    NEU --> PN["<b>Peripheral neuropathy</b> likely"]
    GEN --> FPM["Foot pain with muscle pain in legs or buttocks"]
    FPM --> PVD["<b>Peripheral vascular disease</b> likely → 154"]
    LOC --> HEEL["Heel pain, worse on starting walking"]
    HEEL --> PF["<b>Plantar fasciitis</b> likely"]
    LOC --> DEF["Foot deformity: bony lump at base of big toe;<br/>may have callus, redness or ulcer"]
    DEF --> BUN["<b>Bunion</b> likely"]
```

## Decision nodes → rules

| Node | Modelled as | Rule |
|---|---|---|
| Patient with foot symptoms | `(clinical_finding "Finding of foot region")` (descendants match: foot pain, numbness of foot, ulcer of foot, …) | trigger of `Check for urgent foot symptom conditions`; first `and` arm of `Urgent: foot symptoms with fracture or limb ischaemia` |
| Joint check → 77 | Not modelled (routing to another page; the walk/sit/stand test has no finding of its own) | — |
| Fracture likely | Unable to weight-bear **and** traumatic injury | `Diagnose probable fracture from foot symptoms` |
| Acute limb ischaemia likely | Foot pain with Sudden onset + Severe + At rest qualifiers **and** any of numbness of lower limb, weakness of lower limb muscle, white discoloration of lower limb skin, peripheral pulse absent | `Diagnose probable acute lower limb ischaemia from foot symptoms` |
| Critical limb ischaemia likely | Intermittent claudication **and** any of foot pain at rest, ulcer of foot, gangrene of foot | `Diagnose probable critical lower limb ischaemia from foot symptoms` |
| Give urgent attention | Foot symptom **and** any of the three red-box diagnoses (`active_condition`) | `Urgent: foot symptoms with fracture or limb ischaemia` |
| Tinea pedis likely | Fissure / peeling / scaly skin at the interdigital space of the foot, **or** thick **and** scaly skin at the same site (sole, heel, border of foot) | `Diagnose probable tinea pedis from foot symptoms` |
| Peripheral neuropathy likely | Foot pain **and** any of burning feet, paresthesia of foot, numbness of foot | `Diagnose probable peripheral neuropathy from foot symptoms` |
| Peripheral vascular disease likely | Foot pain **and** any of muscle pain at lower limb, muscle pain at buttock, intermittent claudication | `Diagnose probable peripheral vascular disease from foot symptoms` |
| Plantar fasciitis likely | Heel pain **and** pain aggravated by walking | `Diagnose probable plantar fasciitis from foot symptoms` |
| Bunion likely | Foot pain **and** deformity of foot **and** lump (mass of body region) at the first metatarsophalangeal joint | `Diagnose probable bunion from foot symptoms` |

## Notes

- "Generalised" vs "localised" foot pain is routing; it is not modelled as a qualifier. The
  findings under each branch carry the distinction.
- "Constant" and "worse at night" (neuropathy) and "on starting" walking (plantar fasciitis) are not
  modelled; see the remaining-questions file.
- The diabetes/PVD "foot at risk" box and the daily foot-care advice are review/management content
  and are not modelled.
