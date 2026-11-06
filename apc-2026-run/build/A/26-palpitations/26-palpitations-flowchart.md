# Page 26 – Palpitations: flowchart

Source: `inputs/2026/p26.png` (APC 2026, page 26).

```mermaid
flowchart TD
    P["Palpitations"] --> RB{"Red box: any of faint/LOC, dizziness/light-headedness,<br/>confusion, chest pain, BP ≥ 180/110 or &lt; 90/60,<br/>pulse irregular/&gt;150/&lt;50, glucose &lt; 3 (&lt; 4 if diabetes),<br/>calf/thigh pain or swelling, Hb &lt; 8, difficulty breathing/RR ≥ 30/SpO₂ &lt; 94%,<br/>orthopnea + leg swelling (heart failure likely),<br/>new sudden focal neurology (consider stroke/TIA)?"}
    RB -- Yes --> URG["Urgent: manage and refer urgently"]
    RB -- No --> APP["Approach: cardiology appointment if heart disease, fainting history,<br/>family history of sudden death; do ECG"]
    APP --> ECG{"ECG result"}
    ECG -- "Unavailable / PVCs / sinus tachycardia / sinus rhythm" --> CHK["Check for fever, dehydration, anaemia, pregnancy, medication side effects"]
    ECG -- "Atrial fibrillation" --> AF["Discuss blood thinners with specialist"]
    ECG -- "Other arrhythmia/abnormality" --> CARD["Cardiology appointment same week"]
    CHK --> FEV["T ≥ 38°C: manage fever (p38)"]
    CHK --> DEH["Thirst, dry mouth, poor turgor or ↓ urine output: dehydration likely"]
    CHK --> ANA["Pallor + Hb &lt; 12/13: anaemia likely (p44)"]
    CHK --> PRG["Urine pregnancy test (p175)"]
    CHK --> MED["Review QT-prolonging medication"]
    CHK --> NONE["None of the above: consider thyroid/electrolytes; ECG unavailable → refer same day"]
```

## Decision nodes → rules

| Node | Modelled as | Rule |
|---|---|---|
| Palpitations (entry) | `(clinical_finding Palpitations)` trigger | `Check for urgent palpitations conditions`, `Check for dehydration in palpitations` |
| Red box | `(and Palpitations (or …all criteria except Hb < 8…))` | `Urgent: palpitations with danger signs` |
| Heart failure likely | Palpitations + Orthopnea + Leg swelling symptom → probable; priority uses `(active_condition Heart failure)` | `Diagnose probable heart failure in palpitations` |
| Consider stroke/TIA | Palpitations + any sudden-onset weakness/numbness/difficulty talking/visual disturbance → possible | `Diagnose possible stroke in palpitations`, `Diagnose possible TIA in palpitations` |
| Dehydration likely | Palpitations + any of thirst, xerostomia, decreased skin turgor, decreased urine output → probable | `Diagnose probable dehydration in palpitations` |
| ECG branches, AF, other arrhythmia | Not modelled (ECG results not recorded; management) | — |
| Fever, anaemia, pregnancy, medication, thyroid/electrolytes | Not modelled (pointer, Hb, urine test, management, "none of the above") | — |
