# Page 177 – Routine antenatal care: flowchart

Source: `inputs/2026/p177.png` (the red box: the urgent-attention list, then the management columns).

```mermaid
flowchart TD
    P["Pregnant patient"] --> RB{"Any of the urgent list?<br/>Seizures; vaginal bleeding; BP ≥ 140/90 and persistent headache/blurred vision/abdominal pain;<br/>temperature ≥ 38°C and severe back/abdominal pain; BP ≥ 160/110 and ≥ 1+ proteinuria;<br/>difficulty breathing; BP ≥ 160/110 without proteinuria; swollen painful calf;<br/>painful contractions &lt; 37 weeks; decreased/no fetal movements;<br/>sudden gush of clear/pale fluid from vagina with no contractions; shock/systolic BP &lt; 80"}
    RB -- Yes --> URG["Give urgent attention. Manage below and refer urgently"]
    URG --> SZ["Seizures: if &lt; 20 weeks → 20; if 20 weeks to 1 week postpartum treat for eclampsia"]
    URG --> PE["Severe pre-eclampsia<br/>(BP ≥ 140/90 + persistent headache/blurred vision/abdominal pain,<br/>or BP ≥ 160/110 + ≥ 1+ proteinuria)"]
    URG --> SH["Severe hypertension<br/>(BP ≥ 160/110 without proteinuria)"]
    URG --> VB["Vaginal bleeding"]
    URG --> PL["Preterm labour<br/>(painful contractions &lt; 37 weeks)"]
    URG --> PROM["PROM likely<br/>(sudden gush of clear/pale fluid, no contractions)"]
    VB --> EARLY["Early pregnancy &lt; 22 weeks³"]
    VB --> LATE["Late pregnancy ≥ 22 weeks³: avoid digital VE, IV fluids"]
    EARLY --> Q{"Cervical os open/dilated or products of<br/>conception in cervical os/vagina?"}
    Q -- No --> TC["Threatened or complete miscarriage likely<br/>Refer to exclude ectopic pregnancy and confirm diagnosis"]
    Q -- Yes --> II["Incomplete or inevitable miscarriage likely<br/>Remove products of conception digitally if possible …"]
```

³ If gestation not known, manage as late pregnancy if uterus palpable above umbilicus.

## Decision nodes → rules

| Node | Modelled as | Rule |
|---|---|---|
| Pregnant patient (trigger) | `(active_condition Pregnancy)` | `Check for urgent signs in the pregnant patient (antenatal care)` |
| Urgent list = Yes | `(and Pregnancy (or …all twelve items…))` | `Urgent: pregnant patient with antenatal danger signs` |
| BP ≥ 140/90 + headache/blurred vision/abdominal pain; BP ≥ 160/110 + proteinuria | probable Severe pre-eclampsia | `Diagnose probable severe pre-eclampsia in pregnancy (antenatal care)` |
| BP ≥ 160/110 without proteinuria | written directly in the priority rule (no SNOMED concept for severe hypertension) | `Urgent: pregnant patient with antenatal danger signs` |
| Painful contractions < 37 weeks | possible Premature labor (gestational age not representable) | `Diagnose possible preterm labour from painful contractions in pregnancy` |
| Sudden gush of clear/pale fluid, no contractions | probable Premature rupture of membranes | `Diagnose probable prelabour rupture of membranes (antenatal care)` |
| Vaginal bleeding → cervical-os question | second `check_for` task | `Check cervical os and products of conception in pregnant patient with vaginal bleeding` |
| Q = No | possible Threatened abortion, possible Complete miscarriage, possible Ectopic pregnancy ("refer to exclude") | `Diagnose possible threatened miscarriage (antenatal vaginal bleeding)`, `Diagnose possible complete miscarriage (antenatal vaginal bleeding)`, `Diagnose possible ectopic pregnancy (antenatal vaginal bleeding, os closed)` |
| Q = Yes | possible Incomplete miscarriage, possible Inevitable abortion | `Diagnose possible incomplete miscarriage (antenatal vaginal bleeding)`, `Diagnose possible inevitable miscarriage (antenatal vaginal bleeding)` |
| Early < 22 weeks / late ≥ 22 weeks, Seizures < 20 weeks / eclampsia window | not modelled: gestational age has no unit in the language | — |

## Notes

- BP pairs are read as systolic **or** diastolic at or above the threshold.
- All management (oxygen, fluids, ceftriaxone, magnesium, nifedipine, betamethasone, anti-D,
  antibiotics for PROM) is out of scope.
