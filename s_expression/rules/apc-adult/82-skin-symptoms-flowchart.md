# Page 82 – Skin symptoms: flowchart

Source: APC 2026 e-book page 82 (red box, the "approach" section and the routing tree below it).

```mermaid
flowchart TD
    S["Patient with skin symptoms"] --> RB{"Red box: any of the urgent groups?"}
    RB -- "Sudden generalised itch/rash or face/tongue swelling<br/>AND any of wheeze, difficulty breathing, BP &lt; 90/60,<br/>dizziness/collapse, abdominal pain, vomiting, exposure to allergen¹" --> ANA["Urgent. Check for anaphylaxis (p28)"]
    RB -- "Purple/red rash AND any of neck stiffness,<br/>drowsy/confused, T ≥ 38°C, headache" --> MEN["Urgent. Meningococcal disease likely"]
    RB -- "Diffuse rash within 3 months of a new medication<br/>AND any of the 9 listed features" --> DRG["Urgent. Serious drug reaction likely"]
    RB -- "None" --> AP{"Unexplained rash/lesions of skin, genitals, anus,<br/>rectum, mouth or eyes AND ≥ 1 of headache/backache/body pain,<br/>swollen lymph nodes, T &gt; 38.5°C, fatigue,<br/>sore throat/nasal congestion/cough?"}
    AP -- Yes --> MPX["Consider mpox (p40)"]
    AP -- "No / also" --> ROUTE["Manage according to skin symptom: pain 83, itch with generalised rash 84,<br/>localised rash 85, no rash 86, generalised non-itchy rash 87,<br/>lumps/pimples 89, ulcers/wounds 90, crusts/flaky skin 93,<br/>colour change 94, scalp 95"]
```

## Decision nodes → rules

| Node | Modelled as | Rule |
|---|---|---|
| Patient with skin symptoms | `(or (clinical_finding Skin finding) (clinical_finding Itching))` trigger (descendants match) | `Check for urgent skin symptom conditions`, `Check for mpox features with skin symptoms` |
| Anaphylaxis group | `(and (or sudden-onset itch/rash/face swelling/tongue swelling) (or wheeze, difficulty breathing, SBP<90, DBP<60, dizziness, collapse, abdominal pain, vomiting, exposure to drug/food, insect bite/sting))` | `Diagnose possible anaphylaxis from skin symptoms`; `Urgent: skin symptoms with features of anaphylaxis` |
| Meningococcal group | `(and (or Purpuric rash, Erythematous rash) (or Stiff neck, Drowsy, Acute confusion, T ≥ 38, Headache))` | `Diagnose probable meningococcal disease from purple/red rash`; `Urgent: skin symptoms with meningococcal disease likely` |
| Serious drug reaction group | `(and Generalized rash (<= (onset New medication commenced) (time_ago 3 months)) (or …9 features…))` | `Diagnose probable serious drug reaction with diffuse rash`; `Urgent: skin symptoms with serious drug reaction likely` |
| Consider mpox | `(and (or rash/lesion sites) (or ≥1 systemic feature))` | `Diagnose possible mpox from skin symptoms` |
| Routing tree to pages 83–95 | Not modelled: routing to other pages' own rules | — |
