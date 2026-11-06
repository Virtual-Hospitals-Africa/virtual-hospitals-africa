# Page 84 – Generalised itchy rash: flowchart

Source: APC 2026 e-book page 84 (image `inputs/2026/p84.png`). The page has no Yes/No arrows. It is
a pointer red box followed by a picture-matching differential: each panel's description leads to an
"X likely" box.

```mermaid
flowchart TD
    C["Generalised itchy rash"] --> RB["Check if the patient needs urgent attention ↻ 82<br/>(pointer only)"]
    C --> IB["Red itchy crops of bumps<br/>(may blister / heal dark / scratch marks)"] --> IBL["Insect bites likely → 85"]
    C --> SC["Small red bumps and burrows in webspaces of fingers,<br/>axillae, waist and genitals; very itchy esp. at night"] --> SCL["Scabies likely"]
    C --> PP["Hyperpigmented, itchy bumps on limbs, trunk or face"] --> PPL["Papular pruritic eruption (PPE) likely"]
    C --> EC["Patches of dry, scaly, itchy skin on wrists, ankles,<br/>inside elbows or behind knees"] --> ECL["Eczema likely"]
    C --> UR["Very itchy, red, raised wheals that appear suddenly<br/>and usually disappear within 24 hours"] --> URL["Urticaria likely"]
    C --> DR["Diffuse red rash mainly on trunk, arms and legs,<br/>within 3 months of starting a new medication"] --> DRL["Drug rash likely → 88"]
```

## Decision nodes → rules

| Node | Modelled as | Rule |
|---|---|---|
| Presenting complaint | Pruritic rash or Generalized rash or Generalized pruritus | `Check for causes of generalised itchy rash` (trigger) |
| Red box (pointer to 82) | Not modelled here (cross-reference only) | none |
| Insect bites likely | Papule of skin, Grouped | `Diagnose probable insect bites (generalised itchy rash)` |
| Scabies likely | Burrows in skin **and** papule at finger webspace / axilla / waist / genitals | `Diagnose probable scabies (generalised itchy rash)` |
| PPE likely | Hyperpigmentation of skin **and** papule on limb / trunk / face | `Diagnose probable papular pruritic eruption (generalised itchy rash)` |
| Eczema likely | Xeroderma **and** scaly skin at wrist / ankle / cubital fossa / popliteal fossa | `Diagnose probable eczema (generalised itchy rash)` |
| Urticaria likely | Wheal, Sudden onset | `Diagnose probable urticaria (generalised itchy rash)` |
| Drug rash likely | Erythematous rash **and** New medication commenced within the last 3 months | `Diagnose probable drug rash (generalised itchy rash)` |
