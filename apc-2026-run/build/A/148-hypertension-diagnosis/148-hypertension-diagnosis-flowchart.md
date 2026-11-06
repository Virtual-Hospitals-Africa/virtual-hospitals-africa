# Page 148 – Hypertension: diagnosis: flowchart

Source: `inputs/2026/p148.png` (APC 2026 e-book). The red box (urgent attention) and the lower
"Approach to interpreting a BP in a patient not needing urgent attention" chart.

## Red box: urgent attention

```mermaid
flowchart TD
    BP["Systolic BP ≥ 180 and/or diastolic BP ≥ 110<br/>and symptoms"]
    BP --> S["Sudden onset of: severe headache, weakness on 1 or both sides,<br/>seizure/s, visual disturbances, dizziness,<br/>difficulty speaking or swallowing"]
    S --> STROKE["Stroke likely → 152"]
    BP --> E{"SBP ≥ 180 and/or DBP ≥ 130<br/>and any of: severe headache, known kidney failure (eGFR &lt; 15),<br/>chest pain/unstable angina, shortness of breath/severe heart failure"}
    E -- Yes --> EMER["Hypertensive emergency likely<br/>Manage and refer urgently"]
    BP --> U{"SBP ≥ 180 and/or DBP ≥ 110<br/>and any of: severe headache, known kidney impairment (eGFR &lt; 60),<br/>difficulty breathing worse lying flat or leg swelling"}
    U -- Yes --> URG["Hypertensive urgency likely<br/>Manage and refer same day"]
    U -. "orthopnoea or leg swelling" .-> HF["Heart failure likely"]
```

## Lower chart: patient not needing urgent attention (not encoded, see remaining questions)

```mermaid
flowchart TD
    A["Interpret BP (use the higher category if SBP and DBP differ)"]
    A --> L["BP &lt; 140/90"] --> CVD["Assess CVD risk → 142; decide follow-up"]
    A --> M["BP 140/90 – 179/109"] --> R["Repeat BP on 2 further occasions ≥ 2 days apart<br/>(within 2 weeks if BP ≥ 160/100). Avoid diagnosing on one reading."]
    R --> R1["BP &lt; 140/90"] --> CVD
    R --> R2["BP 140/90 – 159/99"] --> MILD["Diagnose mild hypertension"]
    R --> R3["BP 160/100 – 179/109"] --> MOD["Diagnose moderate hypertension"]
    A --> H["BP ≥ 180/110"] --> H1["Check cuff size, rest 1 hour, ≥ 3 readings"] --> H2["BP confirmed ≥ 180/110"] --> SEV["Diagnose severe hypertension.<br/>Check if patient needs urgent attention (red box)"]
    MILD --> ROUT["Routine hypertension care → 149"]
    MOD --> ROUT
    SEV --> ROUT
    CVD --> F1["BP &lt; 120/80 and CVD risk &lt; 10% and no risk factors → check BP after 5 years"]
    CVD --> F2["BP 120/80 – 139/89 or CVD risk ≥ 10% or any risk factor → check BP after 1 year"]
```

## Decision nodes → rules

| Node | Modelled as | Rule |
|---|---|---|
| Red box header: SBP ≥ 180 and/or DBP ≥ 110 | `(or (>= SBP 180) (>= DBP 110))` | trigger of `Check for urgent severely raised BP conditions`; first `and` arm of `Urgent: severely raised BP with symptoms` |
| Sudden-onset symptoms → stroke likely | BP ≥ 180/110 **and** any of seven findings with the `Sudden onset` qualifier (severe headache also `Severe`) | `Diagnose probable stroke with severely raised BP` |
| Hypertensive emergency likely | (SBP ≥ 180 or DBP ≥ 130) **and** any of: severe headache, known renal failure, chest pain, preinfarction syndrome (unstable angina), dyspnoea, severe heart failure | `Diagnose probable hypertensive emergency` |
| Hypertensive urgency likely | (SBP ≥ 180 or DBP ≥ 110) **and** any of: severe headache, known renal impairment, orthopnoea, leg swelling | `Diagnose probable hypertensive urgency` |
| Heart failure likely | BP ≥ 180/110 **and** (orthopnoea or leg swelling) | `Diagnose probable heart failure with severely raised BP` |
| Give urgent attention | BP ≥ 180/110 **and** any of the three likely diagnoses above (active_condition) | `Urgent: severely raised BP with symptoms` |
| Manage and refer urgently / same day | management | not encoded (no `manage` tasks) |
| Lower chart: mild / moderate / severe hypertension | needs averaged readings on separate occasions | not encoded |

## Notes

- "and/or" is read as `or`.
- eGFR thresholds (< 15, < 60) cannot be expressed (no lab observable); the known-condition findings
  are used without them.
