# Page 80 – Leg symptoms: flowchart

Source: APC 2026 e-book, page 80 (`inputs/2026/p80.png`). Red box, top screening bullets, and the
"Approach to the patient with leg symptoms not needing urgent attention" flowchart.

```mermaid
flowchart TD
    START["Patient with leg symptoms"]
    START --> SCREEN["Screen for joint problem: check joints; walk, sit, stand up with arms folded"]
    SCREEN -- "Joint warm/tender/swollen or unable to do all actions comfortably" --> JOINT["Joint problem likely → 77"]
    START --> FOOT["Problem only in the foot → 81"]
    START --> RB{"Red box: any of?"}
    RB -- "Unable to bear weight following injury" --> FX["Fracture likely → 30"]
    RB -- "Swelling and pain in one calf" --> DVT["Deep venous thrombosis likely<br/>(especially if BMI > 30, smoker, immobile, pregnant,<br/>on oestrogen, leg trauma, recent hospitalisation, TB or cancer)"]
    RB -- "Sudden severe leg pain at rest + numbness/weakness/pallor/no pulse in the leg" --> ALI["Acute limb ischaemia likely"]
    RB -- "Muscle pain in legs/buttocks on exercise + pain at rest, ulcer or gangrene" --> CLI["Critical limb ischaemia likely"]
    FX --> URG["Give urgent attention. Refer urgently."]
    DVT --> URG
    ALI --> URG
    CLI --> URG
    RB -- None --> STATIN["If on simvastatin/atorvastatin/rosuvastatin and muscle pain/cramps or weakness: discuss with doctor/specialist"]
    STATIN --> SW{"Is there leg swelling?"}
    SW -- No --> PAIN["Ask about leg pain/discomfort"]
    PAIN -- "Pain in buttock radiating down back of lower leg" --> SCI["Irritation of sciatic nerve likely"]
    PAIN -- "Muscle pain in legs or buttocks on exercise that is relieved by rest" --> PVD["Peripheral vascular disease likely → 154"]
    SW -- "Yes: both legs swollen" --> ORTH{"Is there difficulty breathing worse on lying flat?"}
    ORTH -- Yes --> HF["Heart failure likely → 151"]
    ORTH -- No --> PREG["Check for pregnancy 174; urine dipstick for kidney disease (blood/protein → BP 148, refer);<br/>none of the above/unsure → refer same week"]
    SW -- "Yes: swelling over one joint" --> INJ{"Has there been a recent injury?"}
    INJ -- Yes --> SPR["Sprain/strain likely"]
    INJ -- No --> SKIN{"Check skin: painful areas, ulcer/s, lump/s or changes in skin colour?"}
    SKIN -- Yes --> P82["→ 82"]
    SKIN -- No --> REF["Refer."]
```

## Decision nodes → rules

| Node | Modelled as | Rule |
|---|---|---|
| Patient with leg symptoms | `(or (clinical_finding Finding of lower limb) (clinical_finding Muscle pain))`; descendants match | trigger of `Check for urgent leg symptom conditions` and `Check for causes of leg symptoms not needing urgent attention` |
| Joint screen → joint problem likely | `or` of Joint warm, Tenderness of joint, Joint swelling, Difficulty walking, Difficulty sitting down, Difficulty standing up | `Diagnose probable joint problem from leg symptom screen` |
| Problem only in the foot → 81 | routing only | not encoded |
| Unable to bear weight following injury | Unable to weight-bear **and** Injury of lower limb | `Diagnose probable fracture of lower limb (leg symptoms)` |
| Swelling and pain in one calf | Swollen calf (Unilateral) **and** Pain in calf | `Diagnose probable deep venous thrombosis (leg symptoms)` |
| Sudden severe leg pain at rest + any of numbness, weakness, pallor, no pulse in the leg | Pain in lower limb with Sudden onset + Severe + At rest **and** `or` of the four leg signs | `Diagnose probable acute limb ischaemia (leg symptoms)` |
| Muscle pain on exercise + pain at rest, ulcer or gangrene | Intermittent claudication **and** `or` of leg pain At rest, Ulcer of lower extremity, Gangrene in lower limb | `Diagnose probable critical limb ischaemia (leg symptoms)` |
| Give urgent attention | leg-symptom trigger **and** `or` of the four `active_condition`s | `Urgent: leg symptoms with fracture, DVT or limb ischaemia` |
| Statin + muscle pain/cramps/weakness | management (discuss) | not encoded |
| Leg swelling = No → pain in buttock radiating down back of lower leg | Pain in buttock **and** pain radiating to left or right leg | `Diagnose probable sciatic nerve irritation (leg symptoms)` |
| Leg swelling = No → muscle pain on exercise relieved by rest | Intermittent claudication (SNOMED: muscle pain, provoked by exertion, relieved by rest) | `Diagnose probable peripheral vascular disease (leg symptoms)` |
| Both legs swollen → orthopnoea = Yes | Swelling of bilateral lower limbs **and** Orthopnea | `Diagnose probable heart failure (bilateral leg swelling)` |
| Both legs swollen → orthopnoea = No | pregnancy check, urine dipstick, refer: management/routing | not encoded |
| Swelling over one joint → recent injury = Yes | Joint swelling **and** Injury of lower limb | `Diagnose probable sprain of lower limb (swollen joint after injury)`, `Diagnose probable strain of lower limb (swollen joint after injury)` |
| Recent injury = No → skin check → 82 / Refer | routing only | not encoded |

## Notes

- The "Is there leg swelling? = No" gate before the sciatica and PVD branches is not required as
  `(no …)` evidence; see remaining questions.
- "Recent" (injury) has no number on the page, so no time comparison is used.
