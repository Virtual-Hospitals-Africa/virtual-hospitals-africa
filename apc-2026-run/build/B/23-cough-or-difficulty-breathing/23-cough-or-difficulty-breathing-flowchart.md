# Page 23 – Cough or difficulty breathing: flowchart

Source: APC 2026 e-book page 23 (`inputs/2026/p23.png`). The red box is a flat "any of" list; the
lower half is a branching algorithm on duration and recurrence.

```mermaid
flowchart TD
    C["Cough or difficulty breathing"] --> RB{"Any red-box item?<br/>(heart failure likely, shock/SBP &lt; 80, wheeze/tight chest, pulse &gt; 120,<br/>cyanosed / SpO₂ &lt; 92% at rest or &lt; 87% on exertion, confused/agitated/reduced consciousness,<br/>coughs ≥ 1 tablespoon fresh blood, tension pneumothorax likely,<br/>breathless at rest or while talking, swelling and pain in one calf, RR ≥ 30)"}
    RB -- Yes --> URG["Urgent: manage and refer urgently"]
    RB -- No --> APP["Approach: test HIV, test TB, smoking advice.<br/>Ask about duration and recurrence"]
    APP --> SHORT["Cough &lt; 2 weeks and not recurrent"]
    APP --> LONG["Cough/difficulty breathing ≥ 2 weeks or recurrent episodes"]
    SHORT --> AUS{"Crackles or bronchial breathing on auscultation?"}
    AUS -- No --> VIR["Acute viral infection likely"]
    VIR --> BRON{"Recent cold and now tight/sore chest or coughing sputum?"}
    BRON -- Yes --> AB["Acute bronchitis likely"]
    AUS -- Yes --> PN["Pneumonia likely"]
    PN --> RF{"Any of: HIV, &gt; 65 y, lung/heart/liver/kidney disease, diabetes, alcohol misuse?"}
    RF -- Yes --> AMC["amoxicillin/clavulanic acid (management)"]
    RF -- No --> AMX["amoxicillin (management)"]
    LONG --> NOSE["If itchy/blocked nose or frequent throat clearing: consider nose problems"]
    LONG --> AC["Also consider asthma and COPD and other cause:"]
    AC --> PJP["HIV with CD4 &lt; 200 and dry cough, shortness of breath → PJP likely"]
    AC --> OSA["Persistent snoring or poor sleep → obstructive sleep apnoea likely"]
    AC --> PIC["Recent URTI, no difficulty breathing → post-infectious cough likely"]
    AC --> SMK["Smoker or recently stopped"]
    SMK --> LC["If weight loss: consider lung cancer"]
    SMK --> COPD["Cough most days of 3 months for ≥ 2 years: COPD likely"]
```

## Decision nodes → rules

| Node | Modelled as | Rule |
|---|---|---|
| Red box, any item | `(and (or Cough, Difficulty breathing) (or …items…))` | `Urgent: cough or difficulty breathing with danger signs`; findings asked by `Check for urgent cough or difficulty breathing conditions` |
| Heart failure likely | Orthopnea **and** leg swelling | `Diagnose probable heart failure from cough or difficulty breathing` → `(active_condition Heart failure)` in the priority rule |
| Tension pneumothorax likely | Sudden-onset dyspnoea **and** (hyperresonance / decreased breath sounds / unilateral chest pain) **and** trachea displaced **and** BP < 90/60 | `Diagnose probable tension pneumothorax from cough or difficulty breathing` → `(active_condition Tension pneumothorax)` in the priority rule |
| Cough < 2 weeks and not recurrent | `(<= (onset Cough) (time_ago 2 weeks))` **and** `(no Cough + Recurrent)` | used inside the pneumonia, viral infection and bronchitis rules |
| Crackles/bronchial breathing = Yes | short branch **and** (respiratory crackles or bronchial breathing) | `Diagnose probable pneumonia from short cough with crackles or bronchial breathing` |
| Crackles/bronchial breathing = No | short branch **and** `(no crackles)` **and** `(no bronchial breathing)` | `Diagnose probable acute viral respiratory infection from short cough` |
| Recent cold + tight/sore chest or sputum | viral branch **and** common cold **and** (tight chest / chest pain / productive cough) | `Diagnose probable acute bronchitis from short cough after a cold` |
| Pneumonia risk-factor question | antibiotic choice only | not modelled (management) |
| ≥ 2 weeks or recurrent | `(or (>= (onset Cough) (time_ago 2 weeks)) (>= (onset Difficulty breathing) (time_ago 2 weeks)) Cough+Recurrent DifficultyBreathing+Recurrent)` | used inside every long-branch rule |
| Itchy/blocked nose, throat clearing | long branch **and** (itching at nasal structure / nasal congestion); throat clearing has no SNOMED finding | `Diagnose possible nose problem from long-standing cough` |
| Also consider asthma and COPD | long branch | `Diagnose possible asthma from long-standing cough or difficulty breathing`, `Diagnose possible COPD from long-standing cough or difficulty breathing` |
| PJP likely | long branch **and** known HIV **and** dry cough **and** dyspnoea (CD4 < 200 not representable) | `Diagnose probable PJP from long-standing dry cough in HIV` |
| OSA likely | long branch **and** (snoring or poor sleep pattern) | `Diagnose probable obstructive sleep apnoea from long-standing cough` |
| Post-infectious cough likely | long branch **and** URTI **and** `(no Difficulty breathing)` | `Diagnose probable post-infectious cough` |
| Smoker + weight loss | long branch **and** (smoker / ex-smoker) **and** weight decreased | `Diagnose possible lung cancer from long-standing cough in a smoker` |
| Smoker + cough ≥ 2 years | (smoker / ex-smoker) **and** `(>= (onset Cough) (time_ago 2 years))` | `Diagnose probable COPD from cough for 2 years in a smoker` |

## Notes

- "< 2 weeks" is written `<=` (VHA's database accepts only `>=`/`<=` in onset comparisons), so a cough
  of exactly 2 weeks sits in both branches.
- Management steps (oxygen, cannula, fluids, ceftriaxone for severe pneumonia, glucose check,
  antibiotics, paracetamol, referral) are not modelled.
