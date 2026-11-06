# Page 89 – Skin lump/s: flowchart

Source: `inputs/2026/p89.png`. The page is a decision tree based on what the lesions look like. It has no Yes/No questions, but every branch ends in an "X likely" box.

```mermaid
flowchart TD
    RB["Red box: refer same week the patient with a mole that:<br/>is irregular in shape or colour · changed in size, shape or colour ·<br/>differs from surrounding moles · is &gt; 6mm wide · bleeds easily · itches"]
    TOP["Skin lump/s"]
    TOP --> BOIL["Painful, firm, red, warm lump which softens in the centre<br/>to discharge pus → boil/abscess likely (→ 83)"]
    TOP --> W["Round, raised papules with rough surfaces"] --> WL["Warts likely"]
    TOP --> MC["Small, skin-coloured pearly bumps with central dimples.<br/>Does not involve palms/soles"] --> MCL["Molluscum contagiosum likely"]
    TOP --> KS["Painless, purple/brown lumps on skin"] --> KSL["Kaposi's sarcoma likely"]
    TOP --> SUB["Smooth, well defined lump beneath skin"]
    SUB --> EC["Round, firm lump. May have central hole and discharge white substance"] --> ECL["Epidermoid cyst likely"]
    SUB --> LP["Soft, doughy lump which is painless and moves easily"] --> LPL["Lipoma likely"]
    TOP --> AC["Red papules, pustules, nodules and blackheads, usually on face"] --> ACL["Acne likely"]
    TOP -.-> UNC["If diagnosis uncertain, discuss/refer"]
```

## Decision nodes → rules

| Node | Modelled as | Rule |
|---|---|---|
| Red box (mole) | Pigmented skin lesion **and** any of: irregular outline, mixed colour, change in skin lesion, changing shape, changing colour, Diameter of lump > 6 mm, bleeding skin, itching of pigmented lesion. "Differs from surrounding moles" has no concept | `Check for mole features needing same-week referral (skin lump/s)`, `Measure width of mole (skin lump/s)`, `Urgent: mole needing same-week referral (skin lump/s)` |
| Boil/abscess | AND of pain of skin, firm skin mass, redness over lesion, warm skin, fluctuant, skin discharge | `Diagnose probable boil/abscess (skin lump/s)` |
| Warts | Round raised papule AND rough skin | `Diagnose probable warts (skin lump/s)` |
| Molluscum | Small papule AND skin dimple (palms/soles exclusion not modelled) | `Diagnose probable molluscum contagiosum (skin lump/s)` |
| Kaposi's sarcoma | Painless skin mass AND (purple OR brown skin mass) | `Diagnose probable Kaposi's sarcoma (skin lump/s)` |
| Epidermoid cyst | Smooth, well-defined subcutaneous mass AND round, firm subcutaneous mass | `Diagnose probable epidermoid cyst (skin lump/s)` |
| Lipoma | Smooth, well-defined subcutaneous mass AND soft, painless subcutaneous mass | `Diagnose probable lipoma (skin lump/s)` |
| Acne | OR of red papule, pustule, skin nodule, comedone | `Diagnose probable acne (skin lump/s)` |
| What triggers the questions | Mass of skin or Mass of subcutaneous tissue | `Check for skin lump/s features` |
| Diagnosis uncertain → discuss/refer | Management | not encoded |
