# Page 24 – Chest pain: flowchart

Source: `inputs/2026/p24.png` (APC 2026, page 24). The whole algorithm sits inside the red box,
below "Give urgent attention to the patient with chest pain and any of:".

```mermaid
flowchart TD
    RB["Give urgent attention to the patient with chest pain and any of:<br/>RR ≥ 30 or difficulty breathing · BP ≥ 180/110 or &lt; 90/60 · Pulse irregular, &gt; 100 or &lt; 50<br/>Severe pain · New pain/discomfort in centre or left side of chest · Pain radiates to neck, jaw, shoulder/s or arm/s<br/>Nausea or vomiting · Pallor or sweating · Known with ischaemic heart disease<br/>At risk of heart attack (diabetes, smoker, hypertension, high cholesterol, known CVD risk &gt; 20%, family history)"]
    RB --> ECG["Do an ECG (doctor to review)"]
    ECG --> ECGA["ECG abnormal<br/>(ST elevation, ST depression or left bundle branch block)"]
    ECG --> ECGN["ECG normal/other abnormalities or unavailable or uncertain"]
    ECGN --> POS{"Is chest pain worse on lying down,<br/>palpation or breathing deeply?"}
    POS -- Yes --> MRU["Manage and refer urgently"]
    MRU --> TP["Sudden breathlessness, more resonant/decreased breath sounds/pain on one side,<br/>deviated trachea → tension pneumothorax likely"]
    MRU --> PN["Chest pain worse on breathing deeply, coughing sputum and temperature ≥ 38°C<br/>→ pneumonia likely"]
    POS -- No --> FEAT
    ECGA --> FEAT{"Is chest pain/discomfort any of:<br/>Occurs at rest or with minimal effort · Not relieved by rest or sublingual nitrates<br/>Worse/lasts longer than usual · Occurs more often than usual · Lasts ≥ 10 minutes"}
    FEAT -- Yes --> ACS["Acute coronary syndrome (heart attack or unstable angina) likely.<br/>Manage and refer urgently"]
    FEAT -- No --> SA{"Is patient known with stable angina¹?"}
    SA -- No --> ACS
    SA -- Yes --> STABLE["Patient has stable angina.<br/>Give routine ischaemic heart disease care → 153"]
```

¹ Chest pain caused by ischaemic heart disease.

The image draws the line from "ECG abnormal" into the top of the "Is chest pain/discomfort any
of" box, the same box that the "No" of the positional question enters; it does not go straight to
"ACS likely". (Builder A read it this way, builder B as a direct route; the reconciler checked a
crop of the image and followed A.)

## Decision nodes → rules

| Node | Modelled as | Rule |
|---|---|---|
| Presenting complaint | `Chest pain` (warning sign) | trigger of every task |
| Red box criteria | `(and Chest pain (or …))` over every red-box item | `Check for urgent chest pain signs`, `Record known cardiovascular disease risk for chest pain`, `Urgent: chest pain with danger signs` |
| Do an ECG | `check_for` ST segment elevation, ST segment depression, Electrocardiographic left bundle branch block | `Do an ECG for chest pain (doctor to review)` |
| ECG abnormal → FEAT | any of the three ECG findings | first `or` of the ACS and stable angina rules |
| ECG normal/unavailable → POS | not gated (cannot express "unavailable or uncertain") | — |
| Positional question (POS) | `Pain aggravated by position` (lying down), `Tenderness of chest wall` (palpation), `Chest pain on breathing` (breathing deeply). "No" = all three recorded as No | `Check chest pain character for acute coronary syndrome` (check_for) |
| POS = No → FEAT | `(and (no …) (no …) (no …))` | first `or` of the ACS and stable angina rules |
| POS = Yes → Manage and refer urgently | Chest pain **and** any of the three positional findings | `Urgent: chest pain worse on lying down, palpation or breathing deeply`; `Check for tension pneumothorax or pneumonia in chest pain` |
| Tension pneumothorax likely | POS = Yes **and** sudden dyspnoea **and** one-sided sign (unilateral hyperresonance / unilateral decreased breath sounds / left or right sided pain) **and** trachea displaced | `Diagnose probable tension pneumothorax in chest pain` |
| Pneumonia likely | Chest pain on breathing **and** productive cough **and** temperature ≥ 38 °C | `Diagnose probable pneumonia in chest pain` |
| FEAT = Yes → ACS likely | chest pain at rest, chest pain worsening, chest pain prolonged, onset ≥ 10 minutes ago | second `or` of `Diagnose probable acute coronary syndrome in chest pain` |
| FEAT = No → SA = No → ACS likely | known stable angina recorded as No | second `or` of the same rule (see note) |
| SA = Yes → stable angina | entry (ECG abnormal or POS = No) **and** each FEAT item negative **and** known stable angina | `Diagnose probable stable angina in chest pain` |
| ACS likely → Manage and refer urgently | `(active_condition Acute coronary syndrome)` | `Urgent: probable acute coronary syndrome in chest pain` |

## Notes

- The two routes into ACS from FEAT (FEAT = Yes, or FEAT = No and not known with stable angina) are
  written as one `or`: (any FEAT item **or** known stable angina = No). This is logically the same
  as the page, because FEAT = Yes leads to ACS whatever the angina history.
- The positional Yes branch (and the tension pneumothorax / pneumonia rules) is not gated on an
  ECG that is normal or unavailable; those rules fire regardless of the ECG result.
- "Occurs with minimal effort", "not relieved by rest or sublingual nitrates" and "occurs more often
  than usual" have no SNOMED concept; see the remaining-questions file.
- Management steps (oxygen, aspirin, IV access, nitrates, morphine, streptokinase and its
  contraindications, cannula/chest tube, fluids for shock, amlodipine, ceftriaxone) are not modelled.
