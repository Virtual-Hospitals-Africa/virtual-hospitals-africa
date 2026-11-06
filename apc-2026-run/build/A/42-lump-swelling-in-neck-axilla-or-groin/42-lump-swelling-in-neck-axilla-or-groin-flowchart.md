# Page 42 – Lump/swelling in neck, axilla or groin: flowchart

Source: `inputs/2026/p42.png` (APC 2026, page 42).

```mermaid
flowchart TD
    START["Lump/swelling in neck, axilla or groin"] --> RB{"Red box (groin):<br/>lump bigger on standing/coughing/passing stool AND any of severe pain, vomiting,<br/>no stools or flatus ≥ 24 h, irreducible → incarcerated/strangulated inguinal hernia likely<br/>Pulsating lump → aneurysm likely"}
    RB -- Yes --> URG["Urgent. Refer urgently."]
    RB -- No --> SKIN{"Lump on the skin?"}
    SKIN -- Yes --> P89["Page 89"]
    SKIN -- "No (beneath skin)" --> APP["Examine neck, inguinal area, axillae, perineum"]
    APP --> THY["Neck lump moves up on swallowing → thyroid mass likely"]
    APP --> ING["Groin lump bigger on standing/coughing/passing stools → inguinal hernia likely"]
    APP --> HS["Recurrent painful abscesses in axilla/groin/perineum → hidradenitis suppurativa likely"]
    APP --> LN["None of above → lymphadenopathy likely"]
    LN --> MED["Review medication (drug hypersensitivity)"]
    MED --> LOC{"Localised or generalised (≥ 2 areas)?"}
    LOC -- Generalised --> NOB
    LOC -- Localised --> SITE["Neck / axilla / groin: look for cause"]
    SITE --> BUBO{"Groin: node hot and tender?"}
    BUBO -- Yes --> TB65["Treat for bubo → 65"]
    BUBO -- No --> CAUSE
    SITE --> CAUSE{"Medication or infective cause likely?"}
    CAUSE -- Yes --> SYM["Manage as on symptom page; if > 4 weeks, manage in adjacent column"]
    CAUSE -- No --> NOB["Test HIV/TB/syphilis, FBC; TB aspirate if cough/weight loss/night sweats/fever;<br/>mpox contact + rash/lesion + ≥ 1 systemic symptom → consider mpox;<br/>cancer screening"]
    NOB --> WELL["Localised and well: reassure; refer if > 4 weeks"]
    NOB --> UNWELL["Generalised or unwell or growing quickly: refer same week"]
```

## Decision nodes → rules

| Node | Modelled as | Rule |
|---|---|---|
| Lump site | Mass of body region → check Mass of neck / Mass of axilla / Groin mass / Mass of skin | `Check for site of lump/swelling in neck, axilla or groin` |
| Red box, hernia | Groin mass + cough impulse + (severe pain, vomiting, obstipation ≥ 24 h, irreducible groin mass) | `Diagnose probable incarcerated/strangulated inguinal hernia from lump in groin` |
| Red box, aneurysm | Groin mass qualified Pulsatile | `Diagnose probable aneurysm from pulsating lump in groin` |
| Red box → Urgent | Groin mass and either active condition | `Urgent: lump/swelling in groin with incarcerated/strangulated hernia or aneurysm` |
| Thyroid mass likely | Mass of neck + Thyroid gland moves with swallowing | `Diagnose probable thyroid mass from lump in neck` |
| Inguinal hernia likely | Groin mass + Cough impulse in inguinal canal | `Diagnose probable inguinal hernia from lump in groin` |
| HS likely | Recurrent abscess at axillary / inguinal / perineal site | `Diagnose probable hidradenitis suppurativa from recurrent abscesses in axilla, groin or perineum` |
| None of above → lymphadenopathy | Lump in neck/axilla/groin, no skin lump, none of the three discriminating findings | `Diagnose probable lymphadenopathy from lump in neck, axilla or groin` |
| Consider mpox | Lymphadenopathy + exposure to monkeypox virus + lesion + ≥ 1 systemic symptom | `Check for mpox in patient with lymphadenopathy`, `Diagnose possible mpox in patient with lymphadenopathy` |
| Localised/generalised, medication/infective cause, bubo, referral boxes | Not modelled (routing/management; bubo has no SNOMED disorder) | — |
