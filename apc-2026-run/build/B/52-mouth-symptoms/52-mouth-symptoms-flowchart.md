# Page 52 – Mouth symptoms: flowchart

Source: `inputs/2026/p52.png` (APC 2026 e-book, page 52). The page is a red box followed by a
column layout: "Approach to the patient with mouth symptoms not needing urgent attention", then one
column per examination finding, each ending in an "X likely" heading.

```mermaid
flowchart TD
    MS["Mouth symptoms"] --> RB{"Red box: any of<br/>• Unable to open mouth<br/>• Sudden face/tongue swelling AND any of: wheeze, difficulty breathing,<br/>BP &lt; 90/60, dizziness/collapse, abdominal pain, vomiting, exposure to possible allergen¹"}
    RB -- Yes --> URG["Urgent. Refer urgently.<br/>(swelling branch: check for anaphylaxis ↻ 28)"]
    RB -- No --> APP["Approach: abacavir → AHR ↻131; lip swelling → 49; gum/tooth → 54.<br/>Ask about dry mouth; examine for redness, white patches, blisters, ulcers, cracks"]
    APP --> WP["White patches on cheeks, gums, tongue, palate"]
    APP --> BL["Painful blisters on lips/mouth"]
    APP --> UL["Painful ulcer/s with central white patch"]
    APP --> RC["Red, cracked corners of mouth"]
    APP --> DM["Dry mouth"]
    WP --> OC["Oral thrush/candida likely"]
    WP --> SW{"Difficulty or pain on swallowing?"}
    SW -- Yes --> EC["Oesophageal candida likely"]
    BL --> HS["Herpes simplex likely"]
    UL --> AU["Aphthous ulcer/s likely"]
    RC --> AC["Angular cheilitis/stomatitis likely"]
    RC --> IMP{"Crusts and blisters around mouth?"}
    IMP -- Yes --> IM["Impetigo likely ↻ 93"]
    RC --> ITC{"Very itchy?"}
    ITC -- Yes --> CD["Contact dermatitis likely"]
    RC --> HB{"No better / uncertain cause: Hb &lt; 12 (woman) / &lt; 13 g/dL (man)?"}
    HB -- Yes --> AN["Anaemia likely ↻ 44"]
    DM --> DMX["Management and cross-references only (diabetes 19, nose 51, candida, medication review)"]
```

¹ Common allergens include medication, food or insect bite/sting within the past few hours.

## Decision nodes → rules

| Node | Modelled as | Rule |
|---|---|---|
| Mouth symptoms (presenting complaint) | `(clinical_finding Mouth symptoms)` as task trigger | `Check for urgent mouth symptom conditions`, `Check for causes of mouth symptoms` |
| Red box, bullet 1 | Unable to open mouth | `Urgent: mouth symptoms with danger signs` |
| Red box, bullet 2 | Sudden-onset face or tongue swelling AND any of wheeze, difficulty breathing, SBP < 90, DBP < 60, dizziness, collapse, abdominal pain, vomiting, exposure to drug/food, insect bite/sting | `Urgent: mouth symptoms with danger signs`; also `Mouth symptoms: possible anaphylaxis` (the "check for anaphylaxis" pointer) |
| White patches → oral thrush/candida likely | White patches on oral mucosa | `Diagnose probable oral candidiasis (mouth symptoms)` |
| White patches + difficulty/pain on swallowing → oesophageal candida likely | White patches AND (difficulty swallowing OR swallowing painful) | `Diagnose probable oesophageal candidiasis (mouth symptoms)` |
| Painful blisters on lips/mouth → herpes simplex likely | Blister on lip or in oral cavity | `Diagnose probable herpes simplex (mouth symptoms)` |
| Painful ulcer/s with central white patch → aphthous ulcer/s likely | Ulcer of mouth | `Diagnose probable aphthous ulcer (mouth symptoms)` |
| Red, cracked corners → angular cheilitis likely | Fissure at angle of mouth | `Diagnose probable angular cheilitis (mouth symptoms)` |
| + crusts and blisters around mouth → impetigo likely | Fissure at angle of mouth AND crust AND blister on perioral skin | `Diagnose probable impetigo (mouth symptoms)` |
| + very itchy → contact dermatitis likely | Fissure at angle of mouth AND severe itching at angle of mouth | `Diagnose probable contact dermatitis (mouth symptoms)` |
| Hb low → anaemia likely | Not modelled (Hb has no unit in the language) | none |
| Dry mouth column | Management and pointers only | none |
