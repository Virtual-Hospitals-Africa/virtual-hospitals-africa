# Page 42 – Lump/swelling in neck, axilla or groin: flowchart

Source: APC 2026 e-book page 42. Red box at top; the "not needing urgent
attention" approach and lymphadenopathy work-up below it.

```mermaid
flowchart TD
    START["Lump/swelling in neck, axilla or groin"]
    START --> RB{"Lump/swelling in groin and any of the red-box items?"}
    RB -- "Gets bigger when standing/coughing/passing stool AND any of:<br/>severe pain, vomiting, no stools or flatus for past 24 h, lump cannot be reduced" --> HERNIA_URG["Incarcerated/strangulated inguinal hernia likely<br/>Refer urgently"]
    RB -- "Pulsating lump" --> ANEU["Aneurysm likely<br/>Refer urgently"]
    RB -- No --> SKIN{"Lump on the skin?"}
    SKIN -- Yes --> P89["→ page 89"]
    SKIN -- "No (beneath skin): examine neck, inguinal area, axillae, perineum" --> THY{"Lump in neck that moves up on swallowing?"}
    THY -- Yes --> THYM["Thyroid mass likely<br/>TSH, refer same week"]
    THY -- No --> IH{"Lump in groin that gets bigger when standing/coughing/passing stools?"}
    IH -- Yes --> IHL["Inguinal hernia likely: refer"]
    IH -- No --> HS{"Recurrent, painful abscesses in axilla, groin or perineum?"}
    HS -- Yes --> HSL["Hidradenitis suppurativa likely<br/>discuss/refer"]
    HS -- No --> LAD["None of above: lymphadenopathy likely"]
    LAD --> MED["Review medication (drug hypersensitivity)"]
    MED --> LOC{"Localised or generalised (≥ 2 areas)?"}
    LOC -- Generalised --> W["Work-up (No branch)"]
    LOC -- Localised --> SITE["Neck / Axilla / Groin: look for cause"]
    SITE --> GROIN{"Groin: node hot and tender?"}
    GROIN -- Yes --> BUBO["Treat for bubo → page 65"]
    GROIN -- No --> CAUSE{"Is medication or infective cause likely?"}
    SITE --> CAUSE
    CAUSE -- Yes --> SYMP["Manage as on symptom page;<br/>if node persists > 4 weeks, manage as No branch"]
    CAUSE -- No --> W
    W["Test HIV, TB, syphilis, FBC;<br/>cough/weight loss/night sweats/fever → aspirate node for TB;<br/>mpox contact + rash/lesion + ≥ 1 symptom → consider mpox;<br/>cancer symptoms/screening"]
    W --> DEC{"Generalised, unwell or node getting bigger quickly?"}
    DEC -- Yes --> RSW["Refer same week"]
    DEC -- "No (localised and well)" --> REAS["Reassure; return if symptoms;<br/>refer if > 4 weeks"]
```

## Decision nodes → rules

| Node | Modelled as | Rule |
|---|---|---|
| Presenting complaint | `Mass of body region` (the recorded common symptom "Lump"); site recorded as `Mass of neck` / `Mass of axilla` / `Groin mass` | `Check for causes of lump/swelling in neck, axilla or groin` |
| Red box, lump in groin | `Groin mass` triggers the red-box check | `Check for urgent lump/swelling in groin conditions` |
| RB hernia branch | `Groin mass` **and** `Cough impulse of mass present` **and** any of `Severe pain`, vomiting, (constipation **and** unable to break wind, both onset ≥ 24 h), groin mass with `Irreducible` qualifier | `Diagnose probable incarcerated (irreducible) inguinal hernia, lump in groin`, `Diagnose probable strangulated inguinal hernia, lump in groin` |
| RB pulsating lump | `Groin mass` with `Pulsatile` qualifier | `Diagnose probable aneurysm, pulsating lump in groin` |
| Refer urgently | `Urgent` priority: groin mass **and** either hernia diagnosis or aneurysm | `Urgent: lump/swelling in groin with incarcerated/strangulated hernia or aneurysm` |
| Lump on the skin | `Mass of skin`: cross-reference only (page 89); used as an exclusion for lymphadenopathy | `Diagnose probable lymphadenopathy, lump in neck, axilla or groin` (as `(no …)`) |
| Thyroid mass | `Mass of neck` **and** `Thyroid gland moves with swallowing` | `Diagnose probable thyroid mass, lump in neck moving on swallowing` |
| Inguinal hernia | `Groin mass` **and** `Cough impulse of mass present` | `Diagnose probable inguinal hernia, lump in groin` |
| Hidradenitis suppurativa | recurrent abscess of axilla/groin/perineum, each paired with pain at that site | `Diagnose probable hidradenitis suppurativa, recurrent painful abscesses` |
| None of above → lymphadenopathy | lump in neck/axilla/groin **and** explicit absence of: skin mass, thyroid moving with swallowing, cough impulse, recurrent abscess at each of the three sites | `Diagnose probable lymphadenopathy, lump in neck, axilla or groin` |
| Consider mpox | `Lymphadenopathy` active **and** exposure to monkeypox virus **and** rash/lesion **and** ≥ 1 of the listed symptoms or temperature > 38.5 °C | `Diagnose possible mpox in lymphadenopathy (lump in neck, axilla or groin)`, fed by `Check for mpox features in lymphadenopathy (lump in neck, axilla or groin)` |
| Localised / generalised, hot and tender groin node (bubo), medication/infective cause, TB symptoms, refer same week / reassure | Routing and management; not modelled (see remaining questions) | — |
