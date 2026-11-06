# Page 39 – Malaria: flowchart

Source: APC 2026 e-book, page 39 (page image `inputs/2026/p39.png`).

```mermaid
flowchart TD
    S["Suspect malaria if patient in a malaria area¹ in the past 3 months and now presents with<br/>temperature ≥ 38°C, severe headache, fatigue, shivering episodes, joint/muscle pain,<br/>flu-like symptoms, dry cough, nausea and vomiting or diarrhoea"]
    S --> RB{"Red box: suspected malaria and any of:<br/>decreased consciousness, drowsy/confused · RR &gt; 30 or difficulty breathing ·<br/>seizure or just had a seizure · severe general body weakness ·<br/>glucose &lt; 3 (&lt; 4 if diabetes) · shock²/SBP &lt; 80 · jaundice ·<br/>easy bleeding or bruising · Hb &lt; 7 · black urine or no urine in past 12 hours ·<br/>persistent vomiting"}
    RB -- Yes --> SEV["Give urgent attention.<br/>Manage as suspected severe malaria and refer urgently<br/>(fluids, rapid test, artesunate, notify)"]
    RB -- No --> APP["Approach to the patient with suspected malaria not needing urgent attention:<br/>rapid test³ if available; if not available or negative, laboratory microscopy"]
    APP --> POS["Malaria test positive: notify⁴ within 24 hours;<br/>if treatment not available, refer same day"]
    APP --> NEG["Rapid test not available/negative:<br/>symptomatic treatment, advice"]
    POS --> RISK{"Any of: &gt; 65 years, pregnant/postpartum, long-term health conditions<br/>(e.g. PLHIV, diabetes, TB), impaired immunity⁵, previous splenectomy?"}
    RISK -- Yes --> TREATY["Artemether/lumefantrine first dose(s), hydration, refer same day"]
    RISK -- No --> TREATN["Artemether/lumefantrine full course, paracetamol, advice, review in 2 days"]
    NEG --> REV["Review patient in 2 days and check laboratory test results"]
    REV --> REVR["If positive, manage in adjacent column.<br/>If negative, assess for other causes of fever → 38"]
    REVR -.positive.-> POS
```

## Decision nodes → rules

| Node | Modelled as | Rule |
|---|---|---|
| S (what makes us ask) | Any of the page's presenting symptoms that the app records (temperature ≥ 38, headache, fatigue, muscle pain, cough, nausea, vomiting, diarrhoea) → ask about being in a malaria area, and about the symptoms the app does not record by default (severe headache, shivering, joint pain, flu-like illness, dry cough) | `Check for exposure to a malaria area` |
| S = suspect malaria | History of travel with high risk of exposure to communicable disease, onset within the past 3 months, **and** any of the listed symptoms | `Diagnose possible malaria` |
| Suspected malaria → red box questions | `(diagnosis Malaria possible)` triggers the check for the red-box items | `Check for urgent signs in suspected malaria` |
| RB = Yes | Suspected malaria **and** any red-box item (Hb < 7 not representable) | `Urgent: suspected malaria with danger signs` |
| RB = Yes → "Manage as suspected severe malaria" | Same evidence as the priority rule, at `possible` certainty, as Complicated malaria | `Diagnose possible complicated (severe) malaria` |
| Malaria test positive / negative | Laboratory and rapid-test results have no observable in the language | not modelled (see remaining questions) |
| RISK | Routes between two management branches only | not modelled (management) |
| Treatment boxes, review, notify | Management | not modelled (no `manage` tasks) |

## Notes

- "In the past 3 months" is written as `(<= (onset …) (time_ago 3 months))` on the travel
  finding, following the brief's convention that `<=` means "within".
- Footnote 2 ("If systolic BP < 80, pulse ≥ 100, respiratory rate > 30, confusion/restlessness,
  weakness, shock likely") is not turned into a shock diagnosis rule; per the shared decision on
  shock, only the red box's own "Shock/systolic BP < 80" is encoded.
