# Page 19 – Assess and manage glucose: flowchart

Source: APC 2026 e-book, page 19. Three red boxes: box 1 "Give urgent
attention" (hypoglycaemia), box 2 "Check if patient needs urgent attention" (glucose ≥ 11.1), box 3
(management of the hyperglycaemic patient with urgent signs or ketones, no header).

```mermaid
flowchart TD
    G["Interpret and manage random fingerprick glucose"]
    G --> H["Glucose &lt; 3 (&lt; 4 if diabetes)<br/>Patient has hypoglycaemia"]
    G --> N["Glucose 3-6 (4-6 if known diabetes)"]
    G --> M["Glucose 6.1-11"]
    G --> HI["Glucose ≥ 11.1"]

    H --> B1["RED BOX 1: Give urgent attention<br/>Is patient alert?"]
    B1 -- Yes --> ORAL["Oral glucose / via NGT; recheck after 15 min<br/>&lt; 3 (&lt; 4): more glucose, discuss/refer<br/>≥ 3 (≥ 4): oral diabetic medication → refer same day; look for cause"]
    B1 -- No --> IV["Thiamine if alcohol user/malnourished; dextrose 10% IV;<br/>if seizures → 20; recheck after 15 min; &lt; 3 (&lt; 4): dextrose IV, refer"]

    N -- known diabetes --> RC1["Routine care → 145"]
    N -- not known diabetes --> RF["Risk factors? BMI ≥ 25 / waist ≥ 94 (m) / ≥ 80 (w) and ≥ 1 of the list"]
    RF -- No --> RECHECK["Recheck glucose 3-yearly over 45; assess risk factors each visit"]
    RF -- Yes --> FBG["Check fasting blood glucose after 8-hour fast (or 2-h OGTT)"]

    M -- known diabetes --> RC2["Routine care → 145"]
    M -- not known diabetes --> FBG

    HI --> B2["RED BOX 2: Check if patient needs urgent attention:<br/>decreased consciousness, chest pain, seizures, drowsiness, confusion,<br/>nausea or vomiting, abdominal pain, rapid deep breathing,<br/>temperature ≥ 38°C, dehydration"]
    B2 -- Yes --> B3["RED BOX 3: sodium chloride 0.9% IV, refer urgently,<br/>insulin only after discussion if referral delay &gt; 2 h"]
    B2 -- "No: check urine for ketones" --> K{"Ketones?"}
    K -- present --> B3
    K -- "No ketones" --> KD{"Known diabetes?"}
    KD -- Yes --> RC3["Routine care → 145"]
    KD -- No --> SYM{"Symptoms⁸ of diabetes?"}
    SYM -- Yes --> DX["Diagnose diabetes<br/>&lt; 35 y: type 1 diabetes likely, refer<br/>≥ 35 y: routine diabetes care → 145"]
    SYM -- No --> FBG

    FBG --> F1["&lt; 6.1: repeat fasting fingerprick glucose after 3 years (yearly if multiple risk factors) → assess CVD risk 142"]
    FBG --> F2["6.1-6.9: impaired fasting glucose; repeat FBG after 1 week<br/>&lt; 7: repeat after 1 year / assess CVD risk; ≥ 7 → Diagnose diabetes"]
    FBG --> F3["≥ 7: symptoms of diabetes?"]
    F3 -- Yes --> DX
    F3 -- No --> F4["Repeat FBG 1 week later<br/>≥ 7 → Diagnose diabetes; &lt; 7 → repeat after 1 year"]
```

⁸ Unexplained weight loss, tiredness, thirst (especially at night), passing excessive amounts of
urine often, periodic changes in vision, frequent infections (e.g. urinary, skin). The ≥ 7 node
on the page says "symptoms⁷", which points at the dehydration footnote; read here as a misprint for ⁸.

## Decision nodes → rules

| Node | Modelled as | Rule |
|---|---|---|
| Glucose < 3 (< 4 if diabetes): patient has hypoglycaemia | Random glucose < 3 mmol/L, **or** < 4 mmol/L with known diabetes | `Diagnose probable hypoglycaemia from fingerprick glucose` |
| Known diabetes (needed for the < 4 and ≥ 11.1 branches) | `check_for` Diabetes mellitus (Known present) when glucose < 4 or ≥ 11.1 | `Check for known diabetes when fingerprick glucose is low or high` |
| Red box 1: Give urgent attention | `(active_condition Hypoglycemia)` → Urgent | `Urgent: hypoglycaemia on fingerprick glucose` |
| Is patient alert? Yes/No and everything below it in box 1 | Management branching only (oral vs IV glucose, recheck, refer); not modelled | — |
| Glucose ≥ 11.1 → red box 2 items | `check_for` of the box-2 findings (temperature is a routine vital) | `Check for urgent signs when fingerprick glucose is 11.1 or more` |
| Red box 2 = Yes → red box 3 (refer urgently) | Glucose ≥ 11.1 **and** any box-2 item → Urgent | `Urgent: glucose 11.1 or more with danger signs` |
| No → check urine for ketones | `check_for` Ketonuria when glucose ≥ 11.1 | `Check urine for ketones when fingerprick glucose is 11.1 or more` |
| Ketones present → red box 3 (refer urgently) | Glucose ≥ 11.1 **and** Ketonuria → Urgent | `Urgent: glucose 11.1 or more with urine ketones` |
| No ketones, not known diabetes → symptoms⁸ of diabetes? | `check_for` the six footnote-8 symptoms, due to glucose ≥ 11.1 with no ketonuria and no known diabetes | `Check for symptoms of diabetes when glucose is 11.1 or more without ketones` |
| Symptoms = Yes → Diagnose diabetes | Glucose ≥ 11.1, no ketonuria, no known diabetes, any symptom⁸ → probable Diabetes mellitus | `Diagnose probable diabetes from random glucose 11.1 or more with symptoms` |
| < 35 years: type 1 diabetes likely | Not modelled: the language has no age-in-years comparison | — |
| Glucose 3-6 / 6.1-11, risk-factor screen, fasting glucose branches, impaired fasting glucose | Not modelled: SNOMED has no fasting-glucose observable entity, so a fasting result cannot be told apart from a random one; the screen only leads to that measurement | — (see remaining questions) |

## Notes

- "(< 4 if diabetes)" in the hypoglycaemia header and "(< 4)" / "(≥ 4)" in box 1 are read as the
  threshold for patients with known diabetes.
- Box 3 has no diagnosis named on the page (it does not say DKA or HHS), so no diagnosis rule is
  written for it; its "Refer urgently" is the basis for the two Urgent evaluations.
