# Page 40 – Mpox: diagnosis and management: flowchart

Source: APC 2026 e-book, page 40 (top band, red box, and the lower "Approach to the patient with
suspected mpox not needing urgent attention" algorithm).

```mermaid
flowchart TD
    S["Suspect mpox if: contact of probable/confirmed case in the 21 days before symptom onset,<br/>or new unexplained lesion/s (face, palms/soles, genitals, anus, rectum, mouth, eyes)<br/>and any of: headache, T &gt; 38.5°C, sore throat/nasal congestion/cough, swollen lymph nodes,<br/>body pain/muscle aches, backache, severe weakness/tiredness"]
    S --> RB{"Any red-box sign?<br/>(shock/SBP &lt; 80, dehydration, unable to pass urine/stool, RR ≥ 30 / SpO2 &lt; 90%,<br/>severe anal symptoms, paraphimosis, unable to swallow, persistent N&amp;V,<br/>myocarditis, corneal infection, immunocompromised/at risk,<br/>decreased consciousness/confusion, extensive lesions, severe pain)"}
    RB -- Yes --> URG["Urgent: manage and refer urgently"]
    RB -- No --> AP["Approach: HIV test, syphilis serology, ask about anal/genital symptoms"]
    AP --> PR["Anal sex and anal bleeding/pain/discharge → proctitis likely"]
    AP --> DIST{"Distribution of rash/lesions"}
    DIST -- Generalised --> GI{"Itchy?"}
    DIST -- Localised --> LI{"Itchy?"}
    GI -- Itchy --> G1["Crops of vesicles, no swollen nodes → chickenpox<br/>Advanced HIV + hyperpigmented papules → papular pruritic eruption<br/>Burrows + itch worse at night → scabies<br/>New medication in past 3 months → drug-induced rash"]
    GI -- Non-itchy --> G2["Conjunctivitis + cough + runny nose + flat red rash → measles<br/>Tick bite or eschar + rash → tick bite fever"]
    LI -- Non-itchy --> L1["Dome papules with central dimple → molluscum<br/>Painful grouped vesicles → herpes simplex<br/>Painful vesicles mouth + palms + soles → hand-foot and mouth<br/>Painful blisters in a band on one side → shingles"]
    LI -- Itchy --> L2["Honey-coloured crusts → impetigo"]
    G1 --> NICD["If unsure, discuss with NICD; continue to manage suspected mpox (page 41)"]
    G2 --> NICD
    L1 --> NICD
    L2 --> NICD
```

## Decision nodes → rules

| Node | Modelled as | Rule |
|---|---|---|
| What prompts the questions | A recorded skin lesion, eruption, or face/genital/rectal/oral/eye lesion | `Check for mpox exposure, lesion sites and associated symptoms` |
| Suspect mpox (S) | Exposure to monkeypox virus within 21 days, **or** (new lesion at a listed site **and** any listed symptom) | `Diagnose possible mpox (contact or new lesions with systemic symptoms)` |
| Red box (RB) questions | Checked when mpox is possible | `Check for urgent mpox danger signs` |
| RB = Yes | Possible mpox **and** any red-box item; "X likely" items through their probable rules | `Urgent: suspected mpox with danger signs`, plus `Diagnose probable dehydration/proctitis/paraphimosis/myocarditis/corneal infection in suspected mpox` |
| Approach questions | Checked when mpox is possible | `Check for proctitis and other causes of rash/lesions in suspected mpox` |
| Proctitis (PR) | Anal penetration **and** anal bleeding/pain/discharge (or a severe red-box anal symptom) | `Diagnose probable proctitis in suspected mpox` |
| Generalised + itchy (G1) | Generalized rash **and** Itching **and** the specific signs | `… chickenpox …`, `… papular pruritic eruption …`, `… scabies …`, `… drug-induced rash …` |
| Generalised + non-itchy (G2) | Generalized rash **and** (no Itching) **and** the specific signs | `… measles …`, `… tick bite fever …` |
| Localised + non-itchy (L1) | Localized skin lesion **and** (no Itching) **and** the specific signs | `… herpes simplex …`, `… hand-foot and mouth disease …`, `… shingles …`; molluscum not encoded (no concept for a central dimple) |
| Localised + itchy (L2) | Localized skin lesion **and** Itching **and** crust on skin | `Diagnose probable impetigo in suspected mpox` |
| NICD / page 41 | Management and cross-reference | not encoded |

## Notes

- Every probable rule is and-ed with `(diagnosis Monkeypox possible)`, which is this page's context.
- "If rash or lesions all look similar … mpox is more likely" is a relative statement, not "mpox likely"; it is not encoded.
