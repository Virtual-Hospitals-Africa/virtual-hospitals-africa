# Page 148 – Hypertension: diagnosis: flowchart

Source: APC 2026 e-book page 148 (red box and the "Approach to interpreting a BP" chart below it).

## Red box (urgent attention)

```mermaid
flowchart TD
    BP["Systolic BP ≥ 180 and/or diastolic BP ≥ 110"] --> SYM{"Symptoms?"}
    SYM -- "Sudden onset of: severe headache, weakness on 1 or both sides,<br/>seizure/s, visual disturbances, dizziness, difficulty speaking or swallowing" --> STROKE["Stroke likely → 152"]
    SYM -- "SBP ≥ 180 and/or DBP ≥ 130 and any of: severe headache,<br/>known kidney failure (eGFR &lt; 15), chest pain/unstable angina,<br/>shortness of breath/severe heart failure" --> HE["Hypertensive emergency likely<br/>Manage and refer urgently"]
    SYM -- "SBP ≥ 180 and/or DBP ≥ 110 and any of: severe headache,<br/>known kidney impairment (eGFR &lt; 60),<br/>difficulty breathing worse lying flat or leg swelling" --> HU["Hypertensive urgency likely<br/>Manage and refer same day"]
    HU -. "difficulty breathing worse lying flat or leg swelling" .-> HF["Heart failure likely"]
```

## Approach to interpreting a BP in a patient not needing urgent attention

```mermaid
flowchart TD
    A["Classify by the higher of SBP / DBP category"] --> L["BP &lt; 140/90"]
    A --> M["BP 140/90 – 179/109"]
    A --> H["BP ≥ 180/110"]
    M --> R["Repeat BP on 2 further occasions ≥ 2 days apart<br/>(within 2 weeks if BP ≥ 160/100).<br/>Avoid diagnosing hypertension on one reading alone."]
    R --> RL["BP &lt; 140/90"] --> CVD
    R --> RM["BP 140/90 – 159/99"] --> MILD["Diagnose mild hypertension"] --> CARE
    R --> RS["BP 160/100 – 179/109"] --> MOD["Diagnose moderate hypertension"] --> CARE
    H --> HR["Check cuff size if overweight; repeat after 1 hour rest;<br/>take ≥ 3 readings"] --> HC["BP confirmed ≥ 180/110"] --> SEV["Diagnose severe hypertension;<br/>check for urgent attention above"] --> CARE
    L --> CVD["Assess CVD risk 142; decide follow-up frequency"]
    CVD --> F5["BP &lt; 120/80 and CVD risk &lt; 10% and no CVD risk factors → check BP after 5 years"]
    CVD --> F1["BP 120/80 – 139/89 or CVD risk ≥ 10% or any CVD risk factors → check BP after 1 year"]
    CARE["Routine hypertension care 149; &lt; 30 years refer; &gt; 65 years no co-morbidity treat only when BP &gt; 160/90"]
```

## Decision nodes → rules

| Node | Modelled as | Rule |
|---|---|---|
| SBP ≥ 180 and/or DBP ≥ 110 | `(or (>= SBP 180) (>= DBP 110))`, triggers the check | `Check for urgent symptoms with BP ≥ 180/110` |
| Stroke likely | BP ≥ 180/110 **and** any sudden-onset item | `Diagnose probable stroke with BP ≥ 180/110 (hypertension diagnosis)` |
| Hypertensive emergency likely | `(or (>= SBP 180) (>= DBP 130))` **and** any of the four items | `Diagnose probable hypertensive emergency` |
| Hypertensive urgency likely | BP ≥ 180/110 **and** any of the three items | `Diagnose probable hypertensive urgency` |
| Heart failure likely | BP ≥ 180/110 **and** (orthopnoea or leg swelling) | `Diagnose probable heart failure with BP ≥ 180/110 (hypertension diagnosis)` |
| Give urgent attention | BP ≥ 180/110 **and** any red-box symptom | `Urgent: symptomatic BP ≥ 180/110 (hypertension diagnosis)` |
| Lower chart (mild / moderate / severe hypertension, follow-up) | Not modelled: needs readings on separate occasions, averaged readings, CVD risk score; see remaining questions | — |
