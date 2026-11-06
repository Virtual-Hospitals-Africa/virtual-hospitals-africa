# Page 102 – Tuberculosis (TB): diagnosis: flowchart

Source: `inputs/2026/p102.png` (APC 2026, page 102).

```mermaid
flowchart TD
    S["TB symptoms: current cough, weight loss, drenching night sweats or fever<br/>(also test without symptoms: DS-TB in last 2 years, PLHIV at set times,<br/>TB contact¹, abnormal digital CXR + CAD)"]
    S --> SUSP["Suspected TB"]
    SUSP --> RB{"Any of: RR ≥ 30, pulse &gt; 120, temp &gt; 39°C,<br/>breathlessness at rest/while talking, prominent use of breathing muscles,<br/>coughs up ≥ 1 tablespoon fresh blood, drowsy/confused, neck stiffness,<br/>persistent vomiting, new weakness of arm/leg, unable to walk unaided,<br/>severe malnutrition or wasted?"}
    RB -- Yes --> URG["Give urgent attention. Manage and refer urgently<br/>(oxygen + ceftriaxone if breathing difficulty)"]
    RB -- No --> WORK["Start TB workup: interrupted treatment &gt; 2 months?;<br/>sputum TB NAAT; HIV test; urine LAM if HIV + TB symptoms + CD4 ≤ 200 or WHO stage 3/4"]
    WORK --> LAM{"Urine LAM positive?"}
    LAM -- Yes --> LAMTB["Diagnose TB on urine LAM, start DS-TB treatment"]
    LAM -- "No / not done" --> NAAT{"TB NAAT result"}
    NAAT -- "MTB detected: positive" --> P2{"Treated for TB in last 2 years?"}
    P2 -- Yes --> PY["Send sputum: baseline smear / smear, culture, DST;<br/>start DS-TB treatment; review culture and DST"]
    P2 -- No --> DST{"Current DST result"}
    DST -- "Rif sensitive or unsuccessful" --> PY
    DST -- "Rif sensitive + INH-resistant" --> INH["Diagnose INH-resistant TB"]
    DST -- "Rif resistant or Rif + INH resistant" --> RR["Diagnose RR-TB"]
    NAAT -- "MTB detected: trace" --> T2{"Treated for TB in last 2 years?"}
    T2 -- Yes --> TY{"Send culture/DST. TB symptoms and signs present?"}
    TY -- No --> ROUT1["Continue routine care; review culture/DST"]
    TY -- Yes --> DSTB["Start DS-TB treatment; review culture/DST"]
    T2 -- No --> TN{"TB symptoms/signs and/or abnormal CXR suggestive of TB?"}
    TN -- Yes --> DSTB
    TN -- No --> ROUT2["Continue routine care"]
```

¹ TB contact: shared an enclosed space for ≥ 1 night or frequent/extended daytime periods with an
adult/adolescent with pulmonary TB during the 3 months before the index patient started treatment.

## Decision nodes → rules

| Node | Modelled as | Rule |
|---|---|---|
| TB symptoms / test-without-symptoms (S) | `possible` TB from cough, weight decreased, night sweats, fever, or exposure to *M. tuberculosis complex* (TB contact) | `Diagnose possible TB (TB symptoms or TB contact)` |
| Suspected TB → check the red box | Task triggered by `(diagnosis Tuberculosis possible)` | `Check for urgent TB danger signs` |
| RB = Yes | `(and (diagnosis Tuberculosis possible) (or …red box…))` → Urgent | `Urgent: suspected TB with danger signs` |
| Workup, LAM, TB NAAT, DST, "treated in last 2 years" branches | Not modelled: lab results (LAM, NAAT, DST, CD4, CXR) cannot be expressed; all endpoints are management | none (see remaining-questions) |
| Diagnose TB on urine LAM / INH-resistant TB / RR-TB | Not modelled: evidence is lab results only | none |
