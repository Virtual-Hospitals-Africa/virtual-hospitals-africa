# Page 56 – Abdominal pain: flowchart

Source: `inputs/2026/p56.png` (APC 2026, page 56). Red box first, then the approach for the patient
not needing urgent attention.

```mermaid
flowchart TD
    START["Abdominal pain<br/>(check for pregnancy in all women of child-bearing potential)"]
    START --> RB{"Any red-box item?<br/>chest pain, pregnant with vaginal bleeding, recent delivery/miscarriage/TOP,<br/>glucose ≥ 11.1, unable to pass urine, jaundice, abdominal/pelvic mass,<br/>pulsatile mass (AAA), appendicitis, peritonitis, cholecystitis, pancreatitis,<br/>no stools or flatus ≥ 24 h, sudden pain + anaphylaxis features,<br/>guarding/rigidity + T ≥ 38 °C + abnormal vaginal discharge (infection)"}
    RB -- Yes --> URGENT["Give urgent attention; manage and refer urgently"]
    RB -- No --> APPROACH["Approach to the patient not needing urgent attention"]
    APPROACH --> GE["Cramping pain + recent vomiting, diarrhoea, loss of appetite,<br/>body pain or fever → gastroenteritis likely → 57"]
    APPROACH --> URI["Urinary symptoms / dipstick → 69"]
    APPROACH --> ART["On ART → check urgent side effects 131"]
    APPROACH --> Q1{"Pain in lower abdomen <i>and</i> patient a woman?"}
    Q1 -- Yes --> DYS["Crampy lower abdominal pain only during periods → dysmenorrhoea likely → 72"]
    Q1 -- Yes --> PEL{"Abnormal vaginal discharge or pain on moving cervix?"}
    PEL -- Yes --> LAP["Treat for lower abdominal pain (LAP) syndrome → 64"]
    PEL -- No --> OTHER
    Q1 -- No --> Q2{"Epigastric pain worse with eating, hunger or lying down/bending forward?"}
    Q2 -- No --> OTHER["Weight loss → 37<br/>Recurrent pain/discomfort + ≥ 2 IBS features → IBS likely<br/>Constipated → 60; diarrhoea → 58"]
    Q2 -- Yes --> DYSP["Dyspepsia (heartburn) likely<br/>BMI ≥ 25 and waist ≥ 80 cm (woman) / ≥ 94 cm (man) → GORD likely<br/>Discuss/refer criteria; omeprazole"]
    LAP --> END["If no better or diagnosis uncertain, discuss/refer"]
    OTHER --> END
    DYSP --> END
```

## Decision nodes → rules

| Node | Modelled as | Rule |
|---|---|---|
| Presenting complaint | `Abdominal pain` (a warning sign) | `Check for urgent abdominal pain conditions`, `Check for non-urgent causes of abdominal pain` |
| Pulsatile abdominal mass | `Pulsatile mass of abdomen` | `Diagnose probable abdominal aortic aneurysm (abdominal pain)` |
| RLQ pain + nausea/vomiting/fever | `Right lower quadrant pain` and any of nausea, vomiting, fever | `Diagnose probable appendicitis (abdominal pain)` |
| Guarding or rigidity | `Abdominal guarding` or `Abdominal rigidity` | `Diagnose probable peritonitis (abdominal pain)` |
| Severe RUQ pain + nausea/fever/loss of appetite | `Right upper quadrant pain` + Severe, and any of nausea, fever, loss of appetite | `Diagnose probable cholecystitis (abdominal pain)` |
| Sudden severe upper pain to back + nausea/vomiting | `Upper abdominal pain` + Sudden onset + Severe, radiating to back, and nausea or vomiting | `Diagnose probable pancreatitis (abdominal pain)` |
| Guarding/rigidity + T ≥ 38 °C + abnormal vaginal discharge | all three | `Diagnose probable infection (abdominal pain with guarding, fever and vaginal discharge)` |
| Sudden abdominal pain + anaphylaxis features | sudden-onset abdominal pain and any of the listed features or an allergen exposure | `Diagnose possible anaphylaxis (sudden abdominal pain)` (routes to page 28's check); also a branch of the urgent rule |
| Any red-box item | `(and Abdominal pain (or …))` | `Urgent: abdominal pain with danger signs` |
| Gastroenteritis likely | `Abdominal colic` and any of vomiting, diarrhoea, loss of appetite, body aches, fever | `Diagnose probable gastroenteritis (abdominal pain)` |
| Lower abdomen and woman? | not modelled (the language has no sex criterion) | — |
| Dysmenorrhoea likely | `Menstrual cramp` | `Diagnose probable dysmenorrhoea (abdominal pain)` |
| Abnormal discharge or pain on moving cervix → LAP syndrome | not a "likely" diagnosis and no SNOMED concept for LAP syndrome; routing only | — |
| Epigastric pain worse with eating/hunger/lying → dyspepsia likely | `Epigastric pain` + Postprandial, or `Hunger pain` (lying/bending: no concept) | `Diagnose probable dyspepsia (abdominal pain)` |
| GORD likely | dyspepsia evidence and BMI ≥ 25 and waist ≥ 80/≥ 94 cm | `Diagnose probable gastro-oesophageal reflux disease (abdominal pain)`; waist measured by `Measure waist circumference for dyspepsia` |
| IBS likely | recurrent pain/discomfort and ≥ 2 of distension, stool frequency/appearance change, mucus in stool (pain relieved by stool: no concept) | `Diagnose probable irritable bowel syndrome (abdominal pain)` |
| Pointers 24, 177, 182, 19, 69, 28, 57, 72, 64, 37, 60, 58, 131, 164, 156 | cross-references | — |

## Notes

- The flowchart's branch conditions ("not needing urgent attention", "lower abdomen and a woman",
  "No" to epigastric pain) are not used as negated preconditions; each "likely" rule fires on its
  own evidence, as Will's rules do.
- BP < 90/60 is read as systolic < 90 **or** diastolic < 60.
