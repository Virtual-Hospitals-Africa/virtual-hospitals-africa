# Page 26 – Palpitations: flowchart

Source: APC 2026 e-book page 26. Red box, then the approach to the patient
with palpitations not needing urgent attention.

```mermaid
flowchart TD
    START["Patient with palpitations<br/>(unpleasant awareness of fast or irregular heartbeat)"]
    START --> RB{"Any of: faint/loss of consciousness, dizziness/light-headedness, confusion,<br/>chest pain, BP ≥ 180/110 or &lt; 90/60, pulse irregular / &gt; 150 / &lt; 50,<br/>fingerprick glucose &lt; 3 (&lt; 4 if diabetes), calf/thigh pain and/or swelling, Hb &lt; 8,<br/>difficulty breathing / RR ≥ 30 / SpO₂ &lt; 94%,<br/>orthopnoea + leg swelling (heart failure likely),<br/>new sudden asymmetric weakness/numbness, difficulty speaking, visual disturbance (consider stroke/TIA)"}
    RB -- Yes --> URGENT["Manage and refer urgently<br/>(ABC, oxygen, ECG, discuss with specialist)"]
    RB -- No --> APPROACH["Not needing urgent attention:<br/>heart disease / history of fainting / family history of sudden death → cardiology appointment same week.<br/>Do ECG if available."]
    APPROACH --> ECG{"ECG result"}
    ECG -- "ECG unavailable / PVCs / sinus tachycardia / sinus rhythm" --> CHECK["Check for fever, dehydration, anaemia, pregnancy and medication side effects"]
    ECG -- "Atrial fibrillation" --> AF["Discuss blood thinners and further management with specialist"]
    ECG -- "Other arrhythmia or abnormality" --> CARD["Arrange cardiology appointment same week if possible"]
    CHECK --> FEV["Temperature ≥ 38 °C → assess and manage fever 38"]
    CHECK --> DEH["Thirst, dry mouth, poor skin turgor or decreased urine output → dehydration likely"]
    CHECK --> ANA["Pallor → fingerprick Hb &lt; 12 (woman) / &lt; 13 (man) → anaemia likely 44"]
    CHECK --> PREG["Woman of child-bearing potential → urine pregnancy test; pregnant → 175"]
    CHECK --> MED["Review medication for QT prolongation; consider switch/stop"]
    FEV & DEH & ANA & PREG & MED --> NONE["If none of the above: consider thyroid or electrolyte abnormalities<br/>(TSH, potassium, magnesium). If ECG unavailable: refer same day."]
    NONE --> TRIG["Identify triggers (smoking, alcohol, caffeine, stimulants).<br/>Anxiety only once all other causes are excluded 98"]
    TRIG --> REVIEW["Review in 2 days; if palpitations persist, refer"]
```

## Decision nodes → rules

| Node | Modelled as | Rule |
|---|---|---|
| Presenting complaint | `(clinical_finding Palpitations)` as the trigger | `Check for urgent palpitations conditions`, `Check for causes of palpitations` |
| Red box (any of) | `(and Palpitations (or …red box items…))` | `Urgent: palpitations with danger signs` |
| Orthopnoea + leg swelling → heart failure likely | `probable` Heart failure: Palpitations **and** Orthopnea **and** Leg swelling symptom | `Diagnose probable heart failure from palpitations` (referenced from the priority rule via `active_condition`) |
| New sudden asymmetric weakness/numbness, difficulty speaking, visual disturbance → consider stroke/TIA | `possible` Cerebrovascular accident and `possible` Transient ischemic attack, each Palpitations **and** any of the four sudden-onset findings | `Diagnose possible stroke from palpitations`, `Diagnose possible TIA from palpitations` |
| Hb < 8 | Not representable (no Hb unit/observable) | — |
| ECG branches (PVCs, sinus tachycardia, sinus rhythm, AF, other arrhythmia) | Not representable (no ECG result in the language) | — |
| Temperature ≥ 38 °C → fever 38 | Cross-reference to the fever page; temperature is a routine vital | — (used as an exclusion in the thyroid/electrolyte rules) |
| Thirst, dry mouth, poor skin turgor or decreased urine output → dehydration likely | `probable` Dehydration: Palpitations **and** any of the four | `Diagnose probable dehydration from palpitations` |
| Pallor → Hb → anaemia likely | Not representable (needs fingerprick Hb) | — |
| Pregnancy test → 175 | Not representable (urine test result) / cross-reference | — |
| Medication review (QT) | Management | — |
| None of the above → consider thyroid or electrolyte abnormalities | `possible` Disorder of thyroid gland and `possible` Electrolyte imbalance: Palpitations **and** temperature < 38 °C **and** (no) each dehydration sign | `Diagnose possible thyroid disorder from palpitations`, `Diagnose possible electrolyte imbalance from palpitations` |
| Anxiety only once all other causes excluded | Not encoded (exclusion of ECG, Hb, pregnancy and medication causes is not representable) | — |

## Notes

- The ECG, Hb, pregnancy-test and medication-review steps cannot be expressed, so the
  thyroid/electrolyte "none of the above" exclusion only covers fever and the dehydration signs.
- Cardiology/referral steps, oxygen and ECG instructions are management and are not modelled.
