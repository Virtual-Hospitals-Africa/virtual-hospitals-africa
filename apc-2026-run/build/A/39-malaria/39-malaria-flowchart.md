# Page 39 – Malaria: flowchart

Source: `inputs/2026/p39.png` (APC 2026, page 39). The page has one red box and a lower
"approach to the patient not needing urgent attention" algorithm with a Yes/No branch.

```mermaid
flowchart TD
    S["Suspect malaria if patient in a malaria area¹ in the past 3 months and now presents with<br/>temperature ≥ 38°C, severe headache, fatigue, shivering episodes, joint/muscle pain,<br/>flu-like symptoms, dry cough, nausea and vomiting or diarrhoea"]
    S --> RB{"Red box: suspected malaria and any of:<br/>decreased consciousness/drowsy/confused, RR &gt; 30 or difficulty breathing,<br/>seizure or just had a seizure, severe general body weakness,<br/>glucose &lt; 3 (&lt; 4 if diabetes), shock²/SBP &lt; 80, jaundice,<br/>easy bleeding or bruising, Hb &lt; 7, black urine or no urine in past 12 h,<br/>persistent vomiting"}
    RB -- Yes --> SEV["Manage as suspected severe malaria; refer urgently<br/>(fluids if shock/SBP &lt; 80, rapid test, artesunate, notify)"]
    RB -- No --> APP["Approach to the patient not needing urgent attention:<br/>rapid test³ if available; else / if negative, lab microscopy"]
    APP --> POS["Malaria test positive: notify⁴ within 24 h;<br/>if treatment not available, refer same day"]
    APP --> NEG["Rapid test not available/negative: paracetamol, metoclopramide,<br/>hydration, return advice"]
    POS --> RISK{"Any of: &gt; 65 years, pregnant/postpartum, long-term health conditions<br/>(PLHIV, diabetes, TB), impaired immunity⁵, previous splenectomy?"}
    RISK -- Yes --> HR["Artemether/lumefantrine first dose; refer same day"]
    RISK -- No --> LR["Artemether/lumefantrine 6 doses; review in 2 days"]
    NEG --> REV["Review in 2 days and check laboratory test results"]
    REV -- positive --> POS
    REV -- negative --> OTH["Assess for other causes of fever → 38"]
```

## Decision nodes → rules

| Node | Modelled as | Rule |
|---|---|---|
| Who to ask about malaria exposure | Any of the page's suspicion symptoms that the app records (fever, temperature ≥ 38, headache, fatigue, muscle pain, cough, nausea, vomiting, diarrhoea) → ask about recent travel to a malaria area and the remaining symptoms | `Check for malaria exposure and symptoms` |
| S: suspect malaria | Travel with high risk of exposure, recorded within the past 3 months, **and** any of the listed symptoms | `Diagnose possible malaria` |
| RB: red box items | `check_for` of every red-box item the language can express | `Check for urgent signs of suspected malaria` |
| RB = Yes | `(and (diagnosis Malaria possible) (or …red box…))` | `Urgent: suspected malaria with danger signs` |
| RB = No → approach, tests, risk question, treatment | Malaria test results are laboratory results; branches lead only to management (medicines, referral, notification, review) | Not modelled (management / lab) |
| "Other causes of fever → 38" | Cross-reference | Not modelled |

## Notes

- "Shock²/systolic BP < 80" is encoded on this page only, as `(or Shock SBP < 80)`. Footnote 2
  ("If systolic BP < 80, pulse ≥ 100, respiratory rate > 30, confusion/restlessness, weakness, shock
  likely") is not turned into a shared shock rule.
- Hb < 7 has no unit/observable in the language and is not modelled.
- The risk question (> 65 years, pregnancy, chronic conditions, splenectomy) only chooses between two
  treatment regimens, so it carries no triage or diagnostic logic.
