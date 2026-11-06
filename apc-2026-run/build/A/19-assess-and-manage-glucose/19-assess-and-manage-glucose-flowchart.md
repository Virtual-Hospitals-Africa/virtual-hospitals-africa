# Page 19 – Assess and manage glucose: flowchart

Source: `inputs/2026/p19.png` (APC 2026 e-book, page 19), with red boxes 1–3.

```mermaid
flowchart TD
    START["Interpret and manage random fingerprick glucose"]
    START --> LOW["Glucose &lt; 3 (&lt; 4 if diabetes)<br/>Patient has hypoglycaemia"]
    START --> MID["Glucose 3-6 (4-6 if known diabetes)"]
    START --> HIGHISH["Glucose 6.1-11"]
    START --> HIGH["Glucose ≥ 11.1"]

    LOW --> RB1["RED BOX 1: Give urgent attention<br/>Is patient alert? Yes: oral glucose / NGT. No: thiamine if alcohol/malnourished, dextrose 10% IV, if seizures → 20<br/>Recheck after 15 min: &lt; 3 (&lt; 4) → more glucose/dextrose, discuss/refer; ≥ 3 (≥ 4) → look for cause; on oral diabetic medication → refer same day"]

    MID --> MIDKD{"Known diabetes?"}
    MIDKD -- Yes --> RC1["Routine care → 145"]
    MIDKD -- No --> RISK{"Risk factors: BMI ≥ 25 / waist ≥ 94cm (man) or ≥ 80cm (woman)<br/>AND ≥ 1 of: inactivity, hypertension, parent/sibling with diabetes, PCOS,<br/>Indian ethnicity, CVD, diabetes in pregnancy, baby &gt; 4000g, previous IFG"}
    RISK -- No --> RECHECK["Recheck glucose 3-yearly once over 45; assess risk factors each visit"]
    RISK -- Yes --> FBG

    HIGHISH --> HKD{"Known diabetes?"}
    HKD -- Yes --> RC2["Routine care → 145"]
    HKD -- No --> FBG

    HIGH --> RB2{"RED BOX 2: needs urgent attention?<br/>Decreased consciousness, chest pain, seizures, drowsiness, confusion,<br/>nausea or vomiting, abdominal pain, rapid deep breathing, T ≥ 38°C, dehydration⁷"}
    RB2 -- Yes --> RB3["RED BOX 3: IV sodium chloride 0.9%, refer urgently,<br/>insulin only after discussion if referral delay &gt; 2 h"]
    RB2 -- No --> KET{"Check urine for ketones"}
    KET -- "Ketones present" --> RB3
    KET -- "No ketones" --> KKD{"Known diabetes?"}
    KKD -- Yes --> RC3["Routine care → 145"]
    KKD -- No --> SYM8{"Symptoms⁸ of diabetes?"}
    SYM8 -- Yes --> DX["Diagnose diabetes<br/>&lt; 35 years: type 1 diabetes likely, refer<br/>≥ 35 years: routine diabetes care → 145"]
    SYM8 -- No --> FBG

    FBG["Check fasting blood glucose after 8-hour overnight fast (or 2-h 75g OGTT)"]
    FBG --> F1["&lt; 6.1: repeat fasting fingerprick glucose after 3 years (yearly if multiple risk factors); assess CVD risk → 142"]
    FBG --> F2["6.1-6.9: patient has impaired fasting glucose; repeat FBG after 1 week"]
    F2 -- "&lt; 7" --> F4["Repeat fasting glucose after 1 year; assess CVD risk → 142"]
    F2 -- "≥ 7" --> F5
    FBG --> F3{"≥ 7: symptoms⁷ of diabetes?"}
    F3 -- Yes --> DX
    F3 -- No --> F5["Repeat FBG 1 week later"]
    F5 -- "&lt; 7" --> F4
    F5 -- "≥ 7" --> DX
```

⁷ Thirst, dry mouth, poor skin turgor, BP < 90/60, pulse ≥ 100.
⁸ Unexplained weight loss, tiredness, thirst (especially at night), passing excessive amounts of urine
often, periodic changes in vision, frequent infections (e.g. urinary, skin).

## Decision nodes → rules

| Node | Modelled as | Rule |
|---|---|---|
| Glucose < 3 (< 4 if diabetes) | `Blood glucose status` < 3, or < 4 **and** known diabetes | `Diagnose probable hypoglycaemia from fingerprick glucose`; `Urgent: low fingerprick glucose (hypoglycaemia)` |
| "if diabetes" (low branch) | Known diabetes asked when glucose < 4 | `Check for known diabetes when glucose is low` |
| RED BOX 1 (Is patient alert? and everything below it) | Management only; not modelled | — (management_step / flowchart_routing in provenance) |
| Glucose 3-6, risk factors, recheck | Not modelled: the branch's only outputs are a fasting glucose check or a recheck, and there is no fasting-glucose observable | — (see remaining-questions) |
| Glucose 6.1-11 | Not modelled: output is a fasting glucose check | — |
| Glucose ≥ 11.1 → RED BOX 2 items | `check_for` all ten items | `Check for urgent high glucose conditions` |
| RED BOX 2 = Yes, or ketones present → RED BOX 3 | Glucose ≥ 11.1 **and** any box 2 item (temperature as a measurement) or Ketonuria | `Urgent: high glucose with danger signs or ketones` |
| Check urine for ketones | Ketonuria in the same `check_for` | `Check for urgent high glucose conditions` |
| No ketones → not known diabetes → symptoms⁸ = Yes → Diagnose diabetes | Glucose ≥ 11.1 **and** `(no Ketonuria)` **and** `(no known diabetes)` **and** any footnote-8 symptom | `Diagnose probable diabetes from random glucose >= 11.1 with symptoms` |
| Diagnose diabetes: < 35 years → type 1 likely | Not modelled: the language has no age criterion | — |
| Fasting glucose branch (< 6.1, 6.1-6.9 impaired fasting glucose, ≥ 7, repeat after 1 week) | Not modelled: no observable distinguishes a fasting from a random glucose | — |

## Notes

- All glucose values are the routine vital `Blood glucose status` in mmol/L.
- The page's bands (3-6, 6.1-11, ≥ 11.1) leave gaps between 6 and 6.1 and between 11 and 11.1;
  the only band edges used in rules are the page's own (< 3, < 4, ≥ 11.1).
