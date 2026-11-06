# Page 36 – Abnormal thoughts or behaviour: flowchart

APC 2026 page 36. The red box holds the urgent-attention criteria, a "Manage urgently" list and a
row of seven "look for" boxes, each leading to an "X likely" box. Below the red box is the approach
to the patient not needing urgent attention (dementia).

```mermaid
flowchart TD
    A[Abnormal thoughts or behaviour] --> B{Sudden onset or recent onset?}
    B -- Yes --> U[Give urgent attention]
    B -- No --> N[Not needing urgent attention]
    U --> MU[Manage urgently: seizure →20, aggressive →35, head injury →30, suicidal →34, oxygen, glucose, fluids, involuntary admission, CrAg/LP]
    MU --> S{New sudden asymmetric weakness/numbness face/arm/leg, difficulty speaking or visual disturbance?}
    S -- Yes --> ST[Consider stroke or TIA →152]
    MU --> L[Look for delirium, mania, psychosis, intoxication, withdrawal or poisoning]
    L --> D1{Varying levels of consciousness over hours/days AND temperature ≥ 38°C?}
    D1 -- Yes --> DL[Delirium likely]
    L --> D2{Abnormally happy, energetic, talkative, irritable or reckless?}
    D2 -- Yes --> ML[Mania likely]
    L --> D3{Lack of insight with ≥ 1 of hallucinations, delusions, disorganised speech or behaviour?}
    D3 -- Yes --> PL[Psychosis likely]
    L --> D4{Dilated pupils, restlessness, paranoia, nausea, sweating, pulse ≥ 100, BP ≥ 140/90?}
    D4 -- Yes --> SL[Stimulant drug intoxication likely]
    L --> D5{Smells of alcohol, slurred speech, incoordination, unsteady gait?}
    D5 -- Yes --> AL[Alcohol intoxication likely]
    L --> D6{Known alcohol/drug user who stopped/reduced intake, with tremor, sweating, nausea, severe restlessness/agitation or hallucinations?}
    D6 -- Yes --> WL[Alcohol/drug withdrawal likely]
    L --> D7{Exposure via ingestion/inhalation/absorption of medication/unknown substance?}
    D7 -- Yes --> PO[Poisoning likely]
    U --> R[Refer urgently unless known schizophrenia otherwise well / diabetes with low glucose on insulin resolving with dextrose / known alcohol use resolving once sober]
    N --> DM{For ≥ 6 months ≥ 1 of: memory problems, disorientation, language difficulty, less able to cope?}
    DM -- Yes --> DE[Consider dementia →166]
```

## Decision nodes

| Node | Page wording | Rule |
|---|---|---|
| A / B | "Give urgent attention to the patient with abnormal thoughts or behaviour and any of: Sudden onset … Recent onset …" | Task "Check for abnormal thoughts or behaviour features"; priority "Urgent: abnormal thoughts or behaviour of sudden or recent onset" |
| S | "If new sudden asymmetric weakness or numbness of face/arm/leg, difficulty speaking or visual disturbance, consider stroke or TIA" | "Diagnose possible stroke in abnormal thoughts or behaviour", "Diagnose possible TIA in abnormal thoughts or behaviour" |
| D1 | "Varying levels of consciousness over hours/days and temperature ≥ 38°C" → "Delirium likely" | "Diagnose probable delirium in abnormal thoughts or behaviour" |
| D2 | "Abnormally happy, energetic, talkative, irritable or reckless" → "Mania likely" | "Diagnose probable mania in abnormal thoughts or behaviour" |
| D3 | "Lack of insight with ≥ 1 of: …" → "Psychosis likely" | "Diagnose probable psychosis in abnormal thoughts or behaviour" |
| D4 | "Dilated pupils, restlessness, paranoia, nausea, sweating, pulse ≥ 100, BP ≥ 140/90" → "Stimulant drug intoxication likely" | "Diagnose probable stimulant intoxication in abnormal thoughts or behaviour" |
| D5 | "Smells of alcohol, slurred speech, incoordination, unsteady gait" → "Alcohol intoxication likely" | "Diagnose probable alcohol intoxication in abnormal thoughts or behaviour" |
| D6 | "Known alcohol/drug user who has stopped/reduced intake with …" → "Alcohol/drug withdrawal likely" | "Diagnose probable alcohol/drug withdrawal in abnormal thoughts or behaviour" |
| D7 | "Exposure via ingestion/inhalation/absorption of medication/unknown substance" → "Poisoning likely" | "Diagnose probable poisoning in abnormal thoughts or behaviour" |
| DM | "If for at least 6 months ≥ 1 of: … consider dementia" | "Diagnose possible dementia in abnormal thoughts or behaviour" |
| MU, R | Manage urgently items, Refer urgently unless | Not encoded (management steps and cross-references) |
