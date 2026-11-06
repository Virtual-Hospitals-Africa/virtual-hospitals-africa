# Page 84 – Generalised itchy rash: flowchart

Source: `inputs/2026/p84.png`. The red box is a pointer only ("Check if the patient needs urgent
attention ↻ 82"). The page is a pattern-recognition grid: a top line (insect bites) and five
picture boxes, each leading to an "X likely" management box.

```mermaid
flowchart TD
    START["Generalised itchy rash"] --> URG["Check if the patient needs urgent attention ↻ 82"]
    URG --> IB{"Red itchy crops of bumps (may have blistered / healed dark / scratch marks)?"}
    IB -- Yes --> IBL["Insect bites likely → 85"]
    URG --> SC{"Small red bumps and burrows in webspaces of fingers, axillae, waist, genitals; very itchy esp. at night"}
    SC --> SCL["Scabies likely"]
    URG --> PPE{"Hyperpigmented, itchy bumps on limbs, trunk or face"}
    PPE --> PPEL["Papular pruritic eruption (PPE) likely"]
    URG --> EC{"Patches of dry, scaly, itchy skin on wrists, ankles, inside elbows or behind knees"}
    EC --> ECL["Eczema likely"]
    URG --> UR{"Very itchy, red, raised wheals that appear suddenly, usually gone within 24 h"}
    UR --> URL["Urticaria likely"]
    URG --> DR{"Diffuse red rash mainly on trunk, arms, legs, within 3 months of starting a new medication"}
    DR --> DRL["Drug rash likely → 88"]
    SCL --> NR["If no response to treatment, discuss/refer"]
    PPEL --> NR
```

## Decision nodes → rules

| Node | Modelled as | Rule |
|---|---|---|
| Generalised itchy rash | `Pruritic rash` (disorder) as trigger | `Check for causes of generalised itchy rash` |
| Check urgent attention ↻ 82 | Pointer only; not modelled here | — |
| Insect bites | Pruritic rash + Papule of skin | `Diagnose probable insect bites (generalised itchy rash)` |
| Scabies | Pruritic rash + Burrows in skin + papule at finger web / axilla / waist / genitals | `Diagnose probable scabies (generalised itchy rash)` |
| PPE | Pruritic rash + Hyperpigmentation of skin + papule at limb / trunk / face | `Diagnose probable papular pruritic eruption (generalised itchy rash)` |
| Eczema | Pruritic rash + Xeroderma + scaly skin at wrist / ankle / antecubital / popliteal | `Diagnose probable eczema (generalised itchy rash)` |
| Urticaria | Pruritic rash + Wheal (Sudden onset) | `Diagnose probable urticaria (generalised itchy rash)` |
| Drug rash | Pruritic rash + Erythematous rash (Diffuse) + New medication commenced within 3 months | `Diagnose probable drug rash (generalised itchy rash)` |
| No response → discuss/refer | Management; not modelled | — |
