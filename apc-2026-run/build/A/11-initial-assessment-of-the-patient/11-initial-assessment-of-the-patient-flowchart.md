# Page 11 – Initial assessment of the patient: flowchart

Source: `inputs/2026/p11.png` (APC 2026 e-book, page 11). The page is a top-to-bottom sequence of
boxes joined by connectors, ending in three parallel branches (pregnant / hypertension / diabetes).

```mermaid
flowchart TD
    RB["<b>Give urgent attention to the patient with any of:</b><br/>decreased consciousness; seizures; difficulty breathing or breathless while talking;<br/>RR ≥ 30; chest pain; headache <i>and</i> vomiting; aggressive, confused or agitated;<br/>overdose of drugs/medication; recent sexual assault; vomiting or coughing blood;<br/>bleeding; burn; eye injury; severe pain; unable to pass urine; sudden facial swelling;<br/>suspected fracture or joint dislocation; recent sudden onset weakness, numbness or<br/>visual disturbance; pregnant <i>with</i> abdominal pain/vaginal bleeding;<br/>purple/red rash that does not disappear with gentle pressure"]
    RB -- Yes --> URG["Urgent. Check and record BP, pulse, RR, temperature;<br/>ensure urgently seen by nurse or doctor"]
    URG --> GLU{"Decreased consciousness, seizures, confused,<br/>unable to sit up or known diabetic?"}
    GLU -- Yes --> GLUM["Also check glucose"]
    RB -- No --> ROUT["Do routine tests: weight, BP, pulse, temperature"]
    ROUT --> COUGH{"Coughing / difficulty breathing?"}
    COUGH -- Yes --> RRSAT["Also check respiratory rate and SpO₂ if available"]
    ROUT --> PROMPT["Ensure seen promptly by nurse or doctor if any of:<br/>BP ≥ 180/110 or systolic BP &lt; 80; pregnant with BP ≥ 140/90;<br/>pulse irregular, ≥ 100 or &lt; 50; temperature ≥ 38°C; RR ≥ 30;<br/>glucose &lt; 3 (or &lt; 4 if diabetic) or ≥ 11.1;<br/>SpO₂ &lt; 92% at rest; SpO₂ drop to &lt; 87% on exertion"]
    PROMPT --> CONT["Continue to assess the pregnant patient and the patient<br/>with hypertension and/or diabetes"]
    CONT --> PREG["Patient is pregnant:<br/>booking visit MUAC, weight and height (BMI), glucose if risk factor, Hb,<br/>rhesus, syphilis, urine dipstick; every visit BP, dipstick, glucose if<br/>glycosuria ≥ 2 occasions, HIV, syphilis; 26 wk glucose if risk factor; 30/36 wk Hb"]
    CONT --> HTN["Patient has hypertension:<br/>every visit weight, BP; once a year BMI, waist circumference,<br/>urine dipstick, fingerprick glucose"]
    CONT --> DM["Patient has diabetes:<br/>every visit BP, fingerprick glucose, dipstick only if glucose ≥ 11.1;<br/>once a year BMI, waist circumference, waist-hip ratio, dipstick, visual acuity"]
```

## Decision nodes → rules

| Node | Modelled as | Rule |
|---|---|---|
| Red box (any of the 20 items) | Asked of every patient with any recorded clinical finding; any one item → Urgent | `Check for urgent signs at initial assessment of the patient` → `Urgent: initial assessment danger signs` |
| Headache *and* vomiting | `(and Headache Finding of vomiting)`; neither alone | `Urgent: initial assessment danger signs` |
| Pregnant *with* abdominal pain/vaginal bleeding | `(and Pregnancy (or Abdominal pain, Bleeding from vagina))` | `Urgent: initial assessment danger signs` |
| GLU = Yes | `measure` blood glucose due to decreased consciousness, seizure, clouded consciousness (confused), unable to sit up or `(active_condition Diabetes mellitus)` | `Initial assessment: measure glucose if decreased consciousness, seizures, confused, unable to sit up or diabetic` |
| ROUT (weight, BP, pulse, temperature) | Routine vitals: no task needed | — |
| COUGH = Yes | `measure` respiratory rate and SpO₂ due to cough or difficulty breathing | `Initial assessment: measure respiratory rate and oxygen saturation if coughing or difficulty breathing` |
| PROMPT ("seen promptly") | **Not modelled**: VHA's lowest priority is `Urgent`, which the page reserves for the red box (see remaining questions) | — |
| PREG | `measure` MUAC and height, due to `(active_condition Pregnancy)` | `Initial assessment: measure MUAC and height in the pregnant patient` |
| HTN | `measure` height, waist circumference, glucose, due to `(active_condition Hypertensive disorder, systemic arterial)` | `Initial assessment: measure BMI inputs, waist circumference and glucose in the patient with hypertension` |
| DM | `measure` glucose, height, waist and hip circumference, due to `(active_condition Diabetes mellitus)` | `Initial assessment: measure glucose, BMI inputs, waist and hip circumference in the patient with diabetes` |

## Notes

- Visit timing ("at booking visit", "every visit", "once a year", "3-6 monthly", "at 26 / 30 / 36
  weeks") cannot be expressed; each measure task fires whenever its condition is active.
- Hb, urine dipstick, rapid rhesus, syphilis, HIV tests and visual acuity have no observable/unit
  in the language and are not modelled.
