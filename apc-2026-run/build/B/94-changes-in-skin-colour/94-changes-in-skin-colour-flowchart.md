# Page 94 – Changes in skin colour: flowchart

Source: `inputs/2026/p94.png` (APC 2026, page 94).

```mermaid
flowchart TD
    Q0["Is the skin yellow, too dark, too light or absent of colour?"]
    Q0 --> Y["Yellow skin: jaundice likely"]
    Q0 --> D["Dark patches"]
    Q0 --> L["Light patches"]
    Q0 --> A["Absence of colour"]
    Y --> RB["RED BOX: Refer urgently the patient with jaundice and any of:<br/>Temp ≥ 38°C · Hb &lt; 12 (woman) / &lt; 13 (man) · Shock/BP &lt; 80 ·<br/>Severe abdominal pain · Drowsy or confused · Easy bruising or bleeding ·<br/>Pregnant · Alcohol dependent or recent binge (≥ 4 drinks/session) ·<br/>Using any medication or illegal drugs"]
    RB --> BL["Send bloods (ALT, ALP, bilirubin, FBC, INR, Hep A IgM, HBsAg); advise to return if worsens"]
    BL --> RV["Review with results within 2 days: refer if ALT ≥ 200, INR ≥ 1.5, ALP out of proportion, Hb low, plts &lt; 150"]
    RV --> HA["Check Hepatitis A IgM result"]
    HA -- positive --> HAP["Patient has acute hepatitis A infection"]
    HA -- negative --> HAN["Check HBsAg result. If positive, refer."]
    D --> W["Where are patches on body?"]
    W -- Lower legs --> VS["Red-brown discolouration…<br/>Venous stasis likely"]
    W -- Face --> ME["Flat brown patches on cheeks, forehead, upper lip<br/>Melasma likely"]
    W -- Trunk --> TV["Light or dark patches with fine scale<br/>Tinea versicolor likely"]
    L --> TV
    A --> PG["Is absence of colour patchy or generalised?"]
    PG -- Patchy --> VI["Vitiligo likely"]
    PG -- Generalised --> AL["Present from birth; skin, hair and eyes<br/>Albinism likely"]
```

## Decision nodes → rules

| Node | Modelled as | Rule |
|---|---|---|
| Q0 (colour type) | `check_for` of yellow skin, hyperpigmentation by site, hypopigmentation, achromia patchy/generalised | `Check for type of skin colour change (changes in skin colour)` |
| Yellow skin → jaundice likely | Yellow skin | `Diagnose probable jaundice (changes in skin colour)` |
| Red box | Jaundice (finding or active condition) **and** any red-box item (Hb omitted: not representable) | `Check for urgent jaundice conditions (changes in skin colour)`, `Urgent: jaundice with danger signs (changes in skin colour)` |
| Bloods, review, Hep A IgM / HBsAg | Lab results: not representable; management | not encoded |
| Dark → Lower legs | Hyperpigmentation of skin at lower limb (knee to ankle) | `Diagnose probable venous stasis (changes in skin colour)` |
| Dark → Face | Hyperpigmentation of skin at face | `Diagnose probable melasma (changes in skin colour)` |
| Dark → Trunk, or Light patches | Hyperpigmentation at trunk, or hypopigmentation of skin | `Diagnose probable tinea versicolor (changes in skin colour)` |
| Absence → Patchy | Achromia of skin, Patchy | `Diagnose probable vitiligo (changes in skin colour)` |
| Absence → Generalised | Achromia of skin, Generalized | `Diagnose probable albinism (changes in skin colour)` |

## Notes

- The descriptive text in each diagnosis box is treated as a picture of the condition, not as an extra
  criterion; the rules follow the routing.
- Footnote 1 (shock definition) is not imported.
