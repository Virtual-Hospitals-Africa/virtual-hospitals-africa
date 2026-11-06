# Page 145 – Diabetes: routine care: flowchart

Source: APC 2026 page 145 (red box). The red box has a short glucose algorithm; the rest of the
page is a routine-care table.

```mermaid
flowchart TD
    DM["Patient with diabetes"] --> RB{"Any of: chest pain, seizures, decreased consciousness/drowsiness,<br/>confusion/unusual behaviour, weakness/dizziness, shaking, sweating,<br/>palpitations, rapid deep breathing, nausea/vomiting, abdominal pain,<br/>thirst/hunger, temperature ≥ 38°C, dehydration (dry mouth, poor skin turgor,<br/>BP &lt; 90/60, pulse ≥ 100)?"}
    RB -- Yes --> URG["Give urgent attention"]
    DM --> G{"Random fingerprick glucose"}
    G -- "&lt; 4 (with/without symptoms)" --> P19a["→ 19 (urgent)"]
    G -- "≥ 11.1 with symptoms" --> P19b["→ 19"]
    G -- "≥ 11.1 without symptoms" --> K{"Urine dipstick: ketones?"}
    K -- Present --> P19c["→ 19 (urgent)"]
    K -- None --> ROUT["Routine diabetes care (table below)"]
    G -- "4 to &lt; 11.1" --> ROUT
```

## Decision nodes → rules

| Node | Modelled as | Rule |
|---|---|---|
| Red-box symptom list | Diabetes **and** `or` of every listed finding/measurement | `Check for urgent signs in the patient with diabetes`; `Urgent: diabetes with danger signs or abnormal glucose` |
| Glucose < 4 | Diabetes **and** Blood glucose status < 4 mmol/L | `Urgent: diabetes with danger signs or abnormal glucose` |
| Glucose ≥ 11.1 with symptoms | Not separately encoded: the symptoms already make the patient Urgent | (covered by the symptom branch) |
| Glucose ≥ 11.1 → ketones? | Diabetes **and** glucose ≥ 11.1 triggers a ketone check | `Check urine dipstick for ketones: diabetes with glucose >= 11.1` |
| Ketones present | glucose ≥ 11.1 **and** Ketonuria | `Urgent: diabetes with danger signs or abnormal glucose` |
| Routine care: weight, BMI, WC | Measure task for the patient with diabetes | `Measure weight, BMI and waist circumference in diabetes routine care` |
