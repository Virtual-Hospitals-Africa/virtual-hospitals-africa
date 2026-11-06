# Page 94 – Changes in skin colour: flowchart

Source: APC 2026 e-book page 94 (APC 2026 e-book, page 94).

```mermaid
flowchart TD
    Q0["Is the skin yellow, too dark, too light or absent of colour?"]
    Q0 --> Y["Yellow skin: jaundice likely"]
    Q0 --> D["Dark patches"]
    Q0 --> L["Light patches"]
    Q0 --> A["Absence of colour"]

    Y --> RB["Refer urgently the patient with jaundice and any of:<br/>Temp ≥ 38°C · Hb &lt; 12 (woman) / &lt; 13 (man) · Shock/BP &lt; 80 ·<br/>Severe abdominal pain · Drowsy or confused · Easy bruising or bleeding ·<br/>Pregnant · Alcohol dependent or recent binge (≥ 4 drinks/session) ·<br/>Using any medication or illegal drugs"]
    Y --> BLOODS["Send blood (ALT, ALP, bilirubin, FBC, INR, hep A IgM, HBsAg); advise to return if worsens"]
    BLOODS --> REV["Review with results within 2 days: refer if ALT ≥ 200, INR ≥ 1.5,<br/>ALP raised out of proportion to ALT, Hb &lt; 12/13 or plts &lt; 150"]
    REV --> HAV["Check hepatitis A IgM result"]
    HAV -- positive --> HAVPOS["Patient has acute hepatitis A infection (manage, notify)"]
    HAV -- negative --> HBS["Check HBsAg result; if positive, refer"]

    D --> WHERE["Where are patches on body?"]
    WHERE -- Lower legs --> LL["Red-brown discolouration. May have breaks in skin or ulcers, spidery veins"]
    LL --> VS["Venous stasis likely"]
    WHERE -- Face --> FACE["Flat, brown patches on cheeks, forehead and upper lip"]
    FACE --> MEL["Melasma likely"]
    WHERE -- Trunk --> TR["Light or dark patches with fine scale. Usually on trunk, neck and upper arms"]
    L --> TR
    TR --> TV["Tinea versicolor likely"]

    A --> PG["Is absence of colour patchy or generalised?"]
    PG -- Patchy --> VIT["Vitiligo likely"]
    PG -- Generalised --> GEN["Present from birth. Involves skin, hair and eyes"]
    GEN --> ALB["Albinism likely"]

    UNC["If diagnosis uncertain, discuss/refer"]
```

## Decision nodes → rules

| Node | Modelled as | Rule |
|---|---|---|
| Presenting complaint (skin colour change) | `Discoloration of skin` | `Check for causes of changes in skin colour` (task) |
| Yellow skin → jaundice likely | `Yellow skin` | `Diagnose probable jaundice (changes in skin colour)` |
| Red box | `Jaundice` (finding or probable diagnosis) **and** any red-box item | `Check for urgent jaundice conditions (changes in skin colour)` (task), `Urgent: jaundice with danger signs (changes in skin colour)` |
| Dark patches → lower legs → venous stasis likely | `Hyperpigmentation of skin` at `Structure of lower limb from knee to ankle` | `Diagnose probable venous stasis (changes in skin colour)` |
| Dark patches → face → melasma likely | `Hyperpigmentation of skin` at `Face structure` | `Diagnose probable melasma (changes in skin colour)` |
| Dark patches on trunk, or light patches, with fine scale → tinea versicolor likely | `Scaly skin` **and** (`Hyperpigmentation of skin` at `Trunk structure` **or** `Hypopigmentation of skin`) | `Diagnose probable tinea versicolor (changes in skin colour)` |
| Absence of colour, patchy → vitiligo likely | `Achromia of skin` + `Patchy` | `Diagnose probable vitiligo (changes in skin colour)` |
| Absence of colour, generalised, from birth, skin + hair + eyes → albinism likely | `Achromia of skin` + `Generalized` + `Congenital`, **and** `White hair`, **and** `Iris hypopigmentation` | `Diagnose probable albinism (changes in skin colour)` |
| Bloods, 2-day review, hepatitis A IgM / HBsAg | Lab values and results: not representable | none (see remaining questions) |

## Notes

- The descriptive sentences under "Lower legs" and "Face" ("May have breaks in skin or ulcers,
  spidery veins"; "flat, brown … cheeks, forehead and upper lip") describe what the dark patches
  look like; the branch itself is decided by the site, so only the site is encoded.
- "Usually on trunk, neck and upper arms" is a description, not a requirement, so the light-patch
  route to tinea versicolor carries no site.
