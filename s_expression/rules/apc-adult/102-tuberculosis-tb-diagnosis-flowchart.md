# Page 102 – Tuberculosis (TB): Diagnosis: flowchart

Source: APC 2026 e-book, page 102 (`inputs/2026/p102.png`).

```mermaid
flowchart TD
    S["TB symptoms: current cough, weight loss, drenching night sweats or fever<br/>or screening group: DS-TB in last 2 years, PLHIV, TB contact¹, abnormal digital CXR + CAD"]
    S --> SUS["Suspected TB"]
    SUS --> RB{"Any of: RR ≥ 30, pulse > 120, T > 39°C, breathlessness at rest/while talking,<br/>prominent use of breathing muscles, coughs up ≥ 1 tablespoon fresh blood,<br/>drowsy/confused, neck stiffness, persistent vomiting, new weakness of arm/leg,<br/>unable to walk unaided, severe malnutrition or wasted?"}
    RB -- Yes --> URG["Give urgent attention. Manage and refer urgently"]
    RB -- No --> WU["Workup: check interrupted treatment > 2 months; 1 sputum for TB NAAT;<br/>test for HIV; urine LAM if HIV + TB symptoms + CD4 ≤ 200 or WHO stage 3/4"]
    WU -- "LAM positive" --> LAM["Diagnose TB on urine LAM; start DS-TB treatment"]
    WU --> POS["MTB detected: TB NAAT positive<br/>Treated for TB in last 2 years?"]
    WU --> TR["MTB detected: TB NAAT trace<br/>Treated for TB in last 2 years?"]
    POS -- Yes --> DST["Check current DST result"]
    POS -- No --> DST
    DST -- "Rifampicin sensitive or unsuccessful" --> DS["Send sputum (smear / culture + DST); start DS-TB treatment"]
    DST -- "Rifampicin sensitive and INH-resistant" --> INH["Diagnose INH-resistant TB"]
    DST -- "Rifampicin resistant or both" --> RR["2nd sputum for DR-TB reflex test; Diagnose RR-TB"]
    TR -- Yes --> TRY["Send sputum for culture and DST.<br/>TB symptoms and signs present?"]
    TRY -- No --> RC1["Continue routine care; review culture and DST"]
    TRY -- Yes --> DST2["Start DS-TB treatment; review culture and DST"]
    TR -- No --> TRN{"TB symptoms and signs and/or abnormal CXR suggestive TB?"}
    TRN -- Yes --> DST2
    TRN -- No --> RC2["Continue routine care"]
```

¹ TB contact: shared an enclosed space for ≥ 1 night or frequent/extended daytime periods with an
index patient with pulmonary TB, in the 3 months before the index patient started treatment.

(The page's left "Yes" line from "treated for TB in last 2 years" runs down past the DST column;
the image does not show a separate destination box, so it is drawn as joining "Check current DST
result". Not modelled either way.)

## Decision nodes → rules

| Node | Modelled as | Rule |
|---|---|---|
| TB symptoms / TB contact / abnormal screening CXR → suspected TB | `or` of Cough, Weight decreased, Night sweats, active Fever, exposure to Mycobacterium tuberculosis complex, Plain X-ray of chest for tuberculosis screening abnormal | `Diagnose possible TB from TB symptoms, TB contact or abnormal screening CXR` |
| DS-TB in last 2 years, PLHIV screening schedule | Not modelled (timing schedule; see remaining questions) | — |
| Red box | `check_for` of the non-vital red-box items, triggered by possible TB | `Check for urgent suspected TB conditions` |
| Red box = Yes | `(and possible TB (or …red box…))` → Urgent | `Urgent: suspected TB with danger signs` |
| Workup, LAM, NAAT, DST branches, INH-resistant TB, RR-TB | Not modelled: lab results (NAAT, LAM, CD4, DST, culture) have no representation; the remainder is management | — |
