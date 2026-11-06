# Page 122 – HIV: post-exposure prophylaxis (PEP): flowchart

Source: `inputs/2026/p122.png` (red box). Only the triage entry is modelled; every step after it is management.

```mermaid
flowchart TD
    H["Give urgent attention to the patient exposed to infectious fluid.<br/>Does patient have either of:<br/>• Exposure to blood, blood-stained fluid/tissue, pleural/pericardial/peritoneal/amniotic/synovial/CSF, vaginal secretions, semen or breast milk<br/>• Human bite severe enough to cause bleeding"]
    H -- Yes --> R["Was there sexual contact, sharps injury, splash to eye/open wound/mouth/nose?"]
    H -- No --> OTHER["If human bite severe enough to cause bleeding, prevent hepatitis B only (no HIV PEP).<br/>For all other exposures, reassure; avoid PEP. If unsure, discuss with HIV hotline or specialist."]
    R -- No --> OTHER
    R -- Yes --> S1["STEP 1. Immediate first aid"]
    S1 --> S2["STEP 2. Assess need for HIV PEP (≤ 72 hours). Check HIV status"]
    S2 -- "Known HIV positive / rapid test positive" --> ROUT["Avoid PEP, routine HIV care 126"]
    S2 -- "Negative / inconclusive / refuses test" --> PEP["Give HIV PEP if ≤ 72 hours, 28 days"]
    ROUT --> S3["STEP 3. Bloods from exposed patient"]
    PEP --> S3
    S3 --> S4["STEP 4. Bloods from source"] --> S5["STEP 5. Hepatitis B PEP if needed"] --> S6["STEP 6. Continue to assess and manage"]
```

## Decision nodes → rules

| Node | Modelled as | Rule |
|---|---|---|
| Presenting complaint "exposed to infectious fluid" | Exposure to Body fluid, or Human bite - wound | `Check for HIV PEP: exposure to infectious fluid or human bite` (trigger) |
| H = Yes (either of) | `or` of exposure to each listed fluid, or (human bite **and** bleeding) | `Urgent: HIV PEP, exposure to infectious fluid or bleeding human bite` |
| H = No | Not modelled (reassurance, management) | — |
| R (sexual/sharps/splash) | Not modelled: routes only between management branches | — |
| STEP 1–6, HIV status branches | Not modelled: management (no `manage` tasks this pass) | — |
