# Page 85 – Localised itchy rash: flowchart

Source: APC 2026 e-book, page 85 (`inputs/2026/p85.png`). The red box is a pointer only
("Check if the patient needs urgent attention ↻ 82"); the page's own logic is the bullet list and
the Yes/No algorithm below it.

```mermaid
flowchart TD
    START["Localised itchy rash<br/>(red box: check if the patient needs urgent attention ↻ 82)"]
    START --> PRE["Pre-checks (bullets)"]
    PRE --> SCALP["Rash on scalp → 95"]
    PRE --> SCAB["Very itchy, small red bumps and burrows in webspaces of fingers,<br/>axillae, waist or genitals → <b>scabies likely</b> → 84"]
    PRE --> ECZ["Patches of dry, scaly, itchy skin on wrists, ankles, inside elbows<br/>or behind knees → <b>eczema likely</b> → 84"]
    PRE --> FDE["Dark coloured round macules anywhere on body after ingestion of a medication<br/>(often start as itchy patches with red edges) → <b>fixed drug eruption likely</b> → 88"]
    START --> Q1{"Are there red itchy bumps that may have blistered<br/>or healed with darkening of skin?"}
    Q1 -- Yes --> IB["Usually occurs in crops<br/><b>Insect bites likely</b>"]
    IB --> PU["If blisters / heals with darkened skin:<br/><b>papular urticaria likely</b>"]
    IB --> IMP["If yellow crusts: <b>impetigo likely</b> → 93"]
    Q1 -- "No: check site of rash" --> SITE{"Site of rash"}
    SITE -- "Head, face, trunk or limbs" --> ASK["Ask where rash started and how it progressed.<br/>Look at distribution, check for raised edges, check nails"]
    ASK --> PSO["Well-defined, raised plaques covered with silvery scale<br/>(often knees, elbows, lower back, scalp; may have pitted nails)<br/><b>Psoriasis likely</b>"]
    ASK --> PR["Starts as one large ring on chest/back (herald patch) with fine scale in centre;<br/>typically followed within 2 weeks by smaller, oval, scaly patches<br/>(may have Christmas tree pattern on back)<br/><b>Pityriasis rosea likely</b>"]
    ASK --> TC["Slow-growing lesion/s with raised edges / ring of scale, clear in centre<br/><b>Tinea corporis (ringworm) likely</b>"]
    SITE -- Feet --> TP["Cracks, peeling or scaly lesions between toes, or thickened scaly skin<br/>on soles/heels/sides of feet<br/><b>Tinea pedis (athlete's foot) likely</b>"]
    TC --> NAILS["If involves nails ↻ 97 (tinea pedis box)"]
    TP --> NAILS
    START --> UNC["If diagnosis uncertain, discuss/refer"]
```

## Decision nodes → rules

| Node | Modelled as | Rule |
|---|---|---|
| Presenting complaint | `Pruritic rash` (disorder); "localised" has no separate concept | `Check for localised itchy rash conditions` (trigger) |
| Red box ↻ 82 | Pointer only; not encoded on this page | — |
| Rash on scalp → 95 | Pointer only | — |
| Scabies likely | Severe itching **and** papules **and** burrows at any of: finger web, axilla, waist, genitals | `Diagnose probable scabies (localised itchy rash)` |
| Eczema likely | Itchy rash **and** dry skin **and** scaly skin at any of: wrist, ankle, antecubital region, popliteal region | `Diagnose probable eczema (localised itchy rash)` |
| Fixed drug eruption likely | Round skin macules **and** skin hyperpigmentation **and** exposure to a drug | `Diagnose probable fixed drug eruption (localised itchy rash)` |
| Q1 = Yes → Insect bites likely | Itchy rash **and** skin papules (the "may have blistered or healed with darkening" part is optional on the page) | `Diagnose probable insect bites (localised itchy rash)` |
| Papular urticaria likely | Itchy rash **and** papules **and** (skin blister **or** post-inflammatory hyperpigmentation) | `Diagnose probable papular urticaria (localised itchy rash)` |
| Impetigo likely | Itchy rash **and** papules **and** yellow crust on skin | `Diagnose probable impetigo (localised itchy rash)` |
| Q1 = No, site head/face/trunk/limbs → Psoriasis likely | Well-defined raised skin plaque **and** silver-coloured scaly skin | `Diagnose probable psoriasis (localised itchy rash)` |
| → Pityriasis rosea likely | Annular skin lesion on chest or back skin (herald patch) **and** multiple oval-shaped lesions | `Diagnose probable pityriasis rosea (localised itchy rash)` |
| → Tinea corporis likely | Annular raised skin lesion **or** annular scaly skin | `Diagnose probable tinea corporis (localised itchy rash)` |
| Q1 = No, site feet → Tinea pedis likely | Fissure, peeling or scaly skin of the interdigital web of foot, **or** thickened and scaly skin of the sole, heel or lateral border of foot | `Diagnose probable tinea pedis (localised itchy rash)` |
| If involves nails ↻ 97; surrounding skin red/warm/swollen ↻ 93; extensive/recurrent → HIV/diabetes tests; refer | Management / pointers; not encoded | — |
| If diagnosis uncertain, discuss/refer | Management; not encoded | — |

## Notes

- The "No" answer to Q1 is not required as `(no …)` evidence for the No-branch diagnoses: each
  No-branch description is distinctive on its own, and requiring an explicit "No" would stop the
  rules firing when the health worker records only the positive findings (same approach as the
  gold standard's Q2 = No branch).
- The site split (head/face/trunk/limbs vs feet) is carried by the findings themselves: tinea pedis
  findings have foot sites; the head/face/trunk/limbs diagnoses are not restricted by site.
