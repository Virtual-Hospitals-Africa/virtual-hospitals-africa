# Page 54 – Gum/teeth symptoms: flowchart

Source: APC 2026 page 54 (red box, then the "not needing urgent attention" approach with three branches).

```mermaid
flowchart TD
    C["Gum/teeth symptoms"] --> RB{"Any of:<br/>Temperature ≥ 38°C and swelling of face/jaw/next to tooth<br/>Unable to eat or drink<br/>Tooth pain felt without touching tooth/gum or that wakes patient at night"}
    RB -- Yes --> URG["Give urgent attention. Refer urgently."]
    RB -- No --> AP["Is there tooth pain, red or bleeding/enlarged gums?<br/>Look in mouth: lift lips to look at teeth and gums"]
    AP --> B1["Brown/black staining of teeth at gumline, holes, pits or missing teeth.<br/>May have tooth pain with hot or cold food/drink"]
    AP --> B2["Gums red/bleeding or enlarged"]
    AP --> B3["Previous/current tooth pain with pus in mouth, swelling next to tooth"]
    B1 --> D1["Dental caries likely"]
    B2 --> D2["Gum problem likely"]
    B3 --> D3["Dental abscess likely"]
```

## Decision nodes → rules

| Node | Modelled as | Rule |
|---|---|---|
| Gum/teeth symptoms | Tooth finding or Gingivae finding | trigger of `Check for urgent and likely gum/teeth conditions`; first conjunct of `Urgent: gum/teeth symptoms with danger signs` |
| Red box | (temp ≥ 38 °C and (facial / jaw / next-to-tooth swelling)) or unable to eat or unable to drink or spontaneous toothache or night-time toothache | `Urgent: gum/teeth symptoms with danger signs` |
| B1 → Dental caries likely | Staining of tooth or cavity in tooth or tooth absent | `Diagnose probable dental caries (gum/teeth symptoms)` |
| B2 → Gum problem likely | Gingival erythema or bleeding gums or gingival enlargement | `Diagnose probable gum problem (gum/teeth symptoms)` |
| B3 → Dental abscess likely | Toothache and pus in mouth and swelling next to tooth | `Diagnose probable dental abscess (gum/teeth symptoms)` |
