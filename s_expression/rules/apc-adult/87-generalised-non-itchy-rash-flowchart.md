# Page 87 – Generalised non-itchy rash: flowchart

Source: `inputs/2026/p87.png` (APC 2026). The red box is a pointer only ("Check if the patient
needs urgent attention ⮌ 82"); the page's own logic is the bullet list and the test-result
flowchart below it.

```mermaid
flowchart TD
    START["Generalised non-itchy rash"] --> RB["Red box: Check if the patient needs urgent attention ⮌ 82<br/>(pointer only, no rule here)"]
    START --> TICK{"Tick bite or tick present<br/>and headache, temperature ≥ 38°C or body pain?"}
    TICK -- Yes --> TBF["Tick bite fever likely → 38"]
    START --> MPOX{"Unexplained rash or lesion/s of skin/genitals/anus/rectum/mouth/eyes<br/>and ≥ 1 of: headache/backache/body pain, swollen lymph nodes,<br/>temperature &gt; 38.5°C, fatigue, sore throat/nasal congestion/cough?"}
    MPOX -- Yes --> MP["Consider mpox → 40"]
    START --> DRUG{"Started any medication in the past 3 months?"}
    DRUG -- Yes --> DR["Consider drug rash ⮌ 88"]
    START --> TEST["Test for syphilis ⮌ 66 and HIV ⮌ 124"]
    TEST --> SR["Syphilis reactive"]
    TEST --> HP["HIV positive"]
    TEST --> NEG["Syphilis and HIV negative"]
    SR --> SS["Secondary syphilis likely<br/>Treat syphilis ⮌ 67"]
    HP --> HC["Give routine HIV care ⮌ 126"]
    NEG --> RISK{"Was patient at risk¹ of HIV in the past 6 weeks?"}
    RISK -- Yes --> SERO["Rash may be part of HIV seroconversion illness.<br/>Repeat HIV test after 6 weeks. Encourage safe sex."]
    RISK -- No --> VIR["Non-specific viral rash likely"]
    START -.-> REF["If rash persists ≥ 2 weeks or diagnosis uncertain, discuss/refer"]
```

¹ HIV can be transmitted via exposure to infectious body fluids, through sexual contact, occupational
or non-occupational exposure, sharing needles, contact with used condom and exposure to blood.

## Decision nodes → rules

| Node | Modelled as | Rule |
|---|---|---|
| Presenting complaint | `Generalized rash` (disorder) as the trigger | `Check for causes of generalised non-itchy rash` |
| Red box (pointer to 82) | Not modelled here; page 82 owns the urgent-attention logic | – |
| TICK = Yes | `(and Generalized rash (or Tick bite, Ixodidae infestation, Argasidae infestation) (or Headache, temperature ≥ 38, Generalized aches and pains))` | `Diagnose probable tick bite fever (generalised rash page)` |
| MPOX = Yes | `(and (or Skin lesion, lesion of genitalia/anus/rectum/mouth/eye) (or Headache, Backache, Generalized aches and pains, Lymphadenopathy, temperature > 38.5, Fatigue, Sore throat, Nasal congestion, Cough))` | `Diagnose possible mpox (generalised rash page)` |
| DRUG = Yes | Rash **and** exposure to `Drug or medicament` with onset within 3 months | `Diagnose possible drug rash (generalised rash page)` |
| Syphilis reactive | Rash **and** `Syphilis titer detected` | `Diagnose probable secondary syphilis (generalised rash page)` |
| HIV positive | Management only (routine HIV care) | – |
| Syphilis and HIV negative → RISK = Yes | Rash **and** `Syphilis titer not detected` **and** `Human immunodeficiency virus not detected` **and** HIV exposure with onset within 6 weeks | `Diagnose possible HIV seroconversion illness (generalised rash page)` |
| Syphilis and HIV negative → RISK = No | Same negatives **and** (HIV exposure recorded as No, **or** exposure onset at least 6 weeks ago) | `Diagnose probable non-specific viral rash (generalised rash page)` |
| Persists ≥ 2 weeks / uncertain | Referral step, not modelled | – |
