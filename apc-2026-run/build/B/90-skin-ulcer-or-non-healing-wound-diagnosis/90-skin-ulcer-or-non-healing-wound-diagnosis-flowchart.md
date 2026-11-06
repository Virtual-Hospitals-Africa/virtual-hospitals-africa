# Page 90 – Skin ulcer or non-healing wound: diagnosis: flowchart

Source: APC 2026 e-book, page 90 (page image `p90.png`; red box `p90-box1.png`).

## Red box (urgent attention)

```mermaid
flowchart TD
    C["Skin ulcer or non-healing wound"]
    C --> RB1["Infection (surrounding skin red/warm/swollen)<br/>with any of: systolic BP &lt; 80, pulse &gt; 100,<br/>temperature ≥ 38°C, confused, blisters, crepitus¹ or severe pain"]
    C --> RB2["Muscle pain in legs or buttocks on exercise<br/>associated with pain at rest or gangrene"]
    RB2 --> CLI["Critical limb ischaemia likely"]
    RB1 --> URG["Give urgent attention · Manage and refer urgently"]
    CLI --> URG
```

## Identify cause

```mermaid
flowchart TD
    START["Identify cause of skin ulcer or non-healing wound"]
    START --> G["If genital ulcer → 62"]
    START --> Q1{"Is patient bedridden/in wheelchair and is ulcer<br/>in common pressure ulcer site (see below)?"}
    Q1 -- Yes --> PU["Pressure ulcer likely"]
    Q1 -- No --> Q2{"Is ulcer on the lower leg or foot?"}
    Q2 -- Yes --> Q3{"Does patient have muscle pain in legs/buttocks<br/>on exercise or reduced/absent foot pulses?"}
    Q2 -- No --> UNC["Ask about previous trauma, surgery, skin rash, burn, cancer or radiation therapy.<br/>Test for diabetes 19 · Test for HIV 124 · TB symptoms → test for TB 102"]
    Q3 -- Yes --> ART["Arterial (ischaemic) ulcer likely"]
    Q3 -- No --> Q4{"Is there darkening of skin around ulcer,<br/>varicose veins or chronic swelling of the leg?"}
    Q4 -- Yes --> VEN["Venous ulcer likely"]
    Q4 -- No --> Q5{"Is patient known with diabetes?"}
    Q5 -- Yes --> DIA["Diabetic ulcer likely"]
    Q5 -- No --> UNC
    PU --> CARE["Routine care 91 · pressure ulcer: doctor review ·<br/>arterial/venous/diabetic or uncertain: refer to district hospital"]
    ART --> CARE
    VEN --> CARE
    DIA --> CARE
    UNC --> CARE
```

¹ Crepitus is a crackling, popping or grating sound or feeling under the skin.

## Decision nodes → rules

| Node | Modelled as | Rule |
|---|---|---|
| Presenting complaint | `Skin ulcer` (disorder) or `Chronic wound` (disorder) | trigger of `Check for skin ulcer or non-healing wound danger signs and cause` |
| RB1 | (any infection sign: infected ulcer of skin, local wound infection, erythema, warm skin, swelling) **and** (any of SBP < 80, pulse > 100, temperature ≥ 38, acute confusion, blister of skin, subcutaneous crepitus, severe pain) | `Urgent: skin ulcer or non-healing wound with infection or critical limb ischaemia` |
| RB2 → critical limb ischaemia likely | ulcer/wound **and** intermittent claudication **and** (pain provoked by rest or gangrenous disorder) | `Diagnose probable critical limb ischaemia in skin ulcer or non-healing wound`; its `active_condition` feeds the urgent rule |
| Q1 = Yes → pressure ulcer likely | ulcer/wound **and** (bed-ridden or dependence on wheelchair). The "common pressure ulcer site" half is not modelled (the sites are only shown in a picture) | `Diagnose probable pressure ulcer` |
| Q1 = No | Not modelled as a condition on the later branches (see remaining questions) | — |
| Q2 = Yes | ulcer/wound with `finding_site` lower leg (`Structure of lower limb from knee to ankle`) or `Foot structure` | used in the arterial, venous and diabetic rules |
| Q3 = Yes → arterial ulcer likely | leg/foot ulcer **and** (intermittent claudication, foot pulse absent or abnormal foot pulse) | `Diagnose probable arterial (ischaemic) ulcer` |
| Q3 = No → Q4 = Yes → venous ulcer likely | leg/foot ulcer **and** `(no …)` of each Q3 item **and** (hyperpigmentation of skin, varicose veins of lower extremity, or chronic leg swelling) | `Diagnose probable venous ulcer` |
| Q4 = No → Q5 = Yes → diabetic ulcer likely | leg/foot ulcer **and** `(no …)` of each Q3 and Q4 item **and** known diabetes | `Diagnose probable diabetic ulcer` |
| Q5 = No / Q2 = No → cause uncertain | No diagnosis; the box is history-taking, tests and cross-references | — |
| Genital ulcer → 62 | Cross-reference only | — |
| Bottom box (routine care, review, referral) | Management | — |
