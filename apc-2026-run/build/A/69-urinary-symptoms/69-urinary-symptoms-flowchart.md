# Page 69 – Urinary symptoms: flowchart

Source: APC 2026 e-book page 69 (`inputs/2026/p69.png`). Red box, then the "Approach to the patient
with urinary symptoms not needing urgent attention" algorithm below it.

```mermaid
flowchart TD
    START["Patient with urinary symptoms"] --> RB{"Red box: any of?"}
    RB -- "Unable to pass urine + lower abdominal discomfort/distension" --> URG["Urgent: manage and refer"]
    RB -- "Flank pain + leucocytes/nitrites + any of vomiting, BP &lt; 90/60, pulse ≥ 100,<br/>diabetes, male, pregnant, post menopause" --> CPN["Complicated pyelonephritis likely"] --> URG
    RB -- "Blood/protein in urine + new face/feet swelling, BP ≥ 140/90 or passing little urine" --> KD["Kidney disease likely"] --> URG
    RB -- "Blood in urine + sudden severe one-sided flank/groin pain" --> KS["Kidney stone likely"] --> URG
    RB -- "None" --> NU["Not needing urgent attention"]
    NU --> UPN{"Flank pain with leucocytes/nitrites?"}
    UPN -- Yes --> UPNL["Uncomplicated pyelonephritis likely"]
    NU --> SPLIT{"Burning/frequency/urgency or leucocytes/nitrites on dipstick?"}
    SPLIT -- "Yes, woman" --> WLN{"Leucocytes/nitrites?"}
    WLN -- No --> WGLU["Glucose: exclude diabetes<br/>Frequency: exclude pregnancy<br/>None: discuss/refer"]
    WLN -- Yes --> WQ{"Catheter, diabetes, pregnancy or urinary tract problem?"}
    WQ -- No --> SUTI["Simple UTI likely"]
    WQ -- Yes --> CUTI["Complicated UTI likely"]
    SPLIT -- "Yes, man" --> MD{"Urethral discharge?"}
    MD -- Yes --> MUS1["MUS likely → 63"]
    SPLIT -- "Yes, man" --> MP{"Perineal/body pain or prostate tender on rectal exam?"}
    MP -- Yes --> PROS["Acute prostatitis likely"]
    MP -- No --> MLN{"Leucocytes/nitrites on dipstick?"}
    MLN -- Yes --> MFU{"Frequency/urgency?"}
    MFU -- No --> MUS2["MUS likely → 63"]
    MFU -- Yes --> CUTI
    MLN -- No --> MGLU["Glucose on dipstick: exclude diabetes<br/>No glucose: discuss/refer"]
    SPLIT -- "No" --> NOB["No burning/frequency/urgency and no leucocytes/nitrites"]
    NOB --> BLOOD["Blood on dipstick → urine microscopy (± Schistosoma ova)"]
    BLOOD --> SPOS["Schistosoma positive: Schistosomiasis likely"]
    BLOOD --> SNEG["Schistosoma negative / not at risk: if blood on microscopy, refer same week"]
    NOB --> FLOW["Flow problem: leakage of urine / poor stream or difficulty passing urine → management"]
```

## Decision nodes → rules

| Node | Modelled as | Rule |
|---|---|---|
| Presenting complaint | `(clinical_finding Urinary symptoms)` (not a recorded common symptom) | trigger of `Check for urgent urinary symptom conditions` and `Check for urinary infection features` |
| Red box: unable to pass urine | `Unable to void urine` **and** (lower abdominal discomfort **or** lower abdominal distension) | `Urgent: urinary symptoms with retention, complicated pyelonephritis, kidney disease or kidney stone`, first branch |
| Red box: complicated pyelonephritis likely | `Flank pain` **and** (leucocytes **or** nitrites) **and** any of the seven risk items | Priority rule second branch (inline evidence); `Diagnose probable acute pyelonephritis from urinary symptoms` (no SNOMED concept for "complicated") |
| Red box: kidney disease likely | (blood **or** protein in urine) **and** (new face/feet swelling **or** SBP ≥ 140 **or** DBP ≥ 90 **or** oliguria) | `Diagnose probable kidney disease from urinary symptoms`; priority third branch |
| Red box: kidney stone likely | `Blood in urine` **and** sudden severe left/right flank or inguinal pain | `Diagnose probable kidney stone from urinary symptoms`; priority fourth branch |
| Uncomplicated pyelonephritis likely | `Flank pain` **and** (leucocytes **or** nitrites) | `Diagnose probable acute pyelonephritis from urinary symptoms` |
| Woman, leucocytes/nitrites, Q = No | Female **and** (leucocytes **or** nitrites) **and** `(no …)` for catheter, diabetes, pregnancy, urinary tract disorder | `Diagnose probable simple UTI (urinary symptoms page)` |
| Woman Q = Yes; Man, no prostatitis features, leucocytes/nitrites, frequency/urgency | as described | `Diagnose probable complicated UTI (urinary symptoms page)` |
| Man: urethral discharge; or no prostatitis features, leucocytes/nitrites, no frequency/urgency | as described | `Diagnose probable MUS (urethritis) from urinary symptoms` |
| Man: perineal/body pain or tender prostate | Male **and** entry condition **and** any of the three | `Diagnose probable acute prostatitis from urinary symptoms` |
| Woman/Man, no leucocytes/nitrites, glucose: exclude diabetes | Glycosuria, with the branch conditions | `Diagnose possible diabetes from urinary symptoms` |
| Woman, no leucocytes/nitrites, frequency: exclude pregnancy | Female, `(no …)` leucocytes and nitrites, increased frequency | `Diagnose possible pregnancy from urinary symptoms` |
| Schistosoma positive → schistosomiasis likely | Not modelled: no SNOMED finding for "Schistosoma ova in urine" | — (see remaining questions) |
| Flow problem (leakage, poor stream) | Management only, no "likely" diagnosis | — |

## Notes

- BP < 90/60 is read as systolic < 90 **or** diastolic < 60; BP ≥ 140/90 as systolic ≥ 140 **or**
  diastolic ≥ 90.
- "No" branches are encoded with `(no …)`, which needs the health worker to have recorded "No".
