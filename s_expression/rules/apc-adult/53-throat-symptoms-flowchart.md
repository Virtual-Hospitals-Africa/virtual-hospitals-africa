# Page 53 – Throat symptoms: flowchart

Source: APC 2026 e-book page 53 (`inputs/2026/p53.png`): red box, the "Assess" box and the
Yes/No flowchart below it.

```mermaid
flowchart TD
    RB["Give urgent attention to the patient with throat symptoms and any of:<br/>• Unable to open mouth<br/>• Unable to swallow at all<br/>• Red swelling blocking airway (assess airway 16)<br/>• Sudden face/tongue swelling and any of: generalised itch/rash, wheeze,<br/>difficulty breathing, BP &lt; 90/60, dizziness/collapse, abdominal pain,<br/>vomiting or exposure to possible allergen¹ → check for anaphylaxis 28"]
    RB -- Yes --> URG["Refer urgently"]
    RB -- No --> ASSESS["Assess the patient with throat symptoms not needing urgent attention<br/>• Ask about swallowing problems (food/liquid stuck → refer)<br/>• Difficulty or pain on swallowing + white patches on cheeks/gums/tongue/palate<br/>→ oesophageal candida likely 52<br/>• Check for redness, grey membrane, bleeding and white patches"]
    ASSESS --> Q1["Is there sore throat and a thick grey layer (pseudomembrane)<br/>in throat/nose, with or without mild fever?"]
    Q1 -- Yes --> DIPH["Consider diphtheria"]
    Q1 -- No --> Q2["Are there swollen tonsils and any of: pus/white patches on tonsils<br/>or no cough or no runny nose?"]
    Q2 -- Yes --> BACT["Bacterial tonsillopharyngitis likely"]
    Q2 -- No --> VDESC["Red throat and/or swollen tonsils, tender neck lymph nodes,<br/>cough, runny nose"]
    VDESC --> VIRAL["Viral tonsillopharyngitis likely"]
    BACT --> SYMPT["Symptomatic care (paracetamol, salt-water gargle, soft food)"]
    VIRAL --> SYMPT
```

¹ Common allergens include medication, food or insect bite/sting within the past few hours.

## Decision nodes → rules

| Node | Modelled as | Rule |
|---|---|---|
| Throat symptoms (trigger) | `(or Sore throat, Difficulty swallowing, Swallowing painful)` for the red box; `Sore throat` for the Assess box (which checks for difficulty / pain on swallowing) | due_to of `Check for urgent throat symptom conditions`; due_to of `Assess throat symptoms not needing urgent attention` |
| Red box | `(and throat symptoms (or unable to open mouth, unable to swallow, (and pharyngeal swelling, upper respiratory tract obstruction), (and sudden face/tongue swelling (or …anaphylaxis features…))))` | `Urgent: throat symptoms with danger signs` |
| Red box, anaphylaxis bullet ("check for anaphylaxis 28") | `possible` anaphylaxis: throat symptoms **and** sudden face/tongue swelling **and** any of the listed features; this hands over to page 28's check | `Diagnose possible anaphylaxis from throat symptoms with sudden face/tongue swelling` |
| Assess, bullet 2 | `(and (or Difficulty swallowing, Swallowing painful) White patches on oral mucosa)` → probable Candidiasis of esophagus | `Diagnose probable oesophageal candida from painful or difficult swallowing` |
| Q1 = Yes | `(and Sore throat (or pseudomembrane in pharynx, pseudomembrane in nose))`; mild fever is "with or without" so not required | `Diagnose possible diphtheria from throat/nose pseudomembrane` |
| Q1 = No → Q2 = Yes | `(and Sore throat (no pseudomembrane pharynx) (no pseudomembrane nose) Swelling of tonsil (or Exudate on tonsils, (no Cough), (no Nasal discharge)))` | `Diagnose probable bacterial tonsillopharyngitis` |
| Q1 = No → Q2 = No | `(and Sore throat (or Redness of throat, Swelling of tonsil) (no pseudomembranes) (or (no Swelling of tonsil) (and (no Exudate on tonsils) Cough Nasal discharge)))`. The descriptive box is used only for its first line as the positive anchor | `Diagnose probable viral tonsillopharyngitis` |
| Consider diphtheria management, antibiotics, symptomatic care | Management, not modelled | – |

## Notes

- Q2 = No is the logical negation of Q2: no swollen tonsils, **or** swollen tonsils with no
  pus/white patches **and** cough **and** runny nose.
- Q1 = No is encoded as "no pseudomembrane in throat or nose" rather than the full negation
  (which would also include "no sore throat"), because every patient on this flow already has a
  throat symptom.
- BP < 90/60 is read as systolic < 90 **or** diastolic < 60.
- "Within the past few hours" (footnote 1) is not modelled as a time comparison: the page gives
  no number.
