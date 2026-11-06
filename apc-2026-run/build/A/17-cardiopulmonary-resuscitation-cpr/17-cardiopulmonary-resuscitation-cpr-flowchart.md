# Page 17 – Cardiopulmonary resuscitation (CPR): flowchart

Source: `inputs/2026/p17.png` (red box 1). The algorithm is almost entirely management (shocks,
drugs, compressions); only the entry condition and the "look for possible cause" lines carry triage
or diagnostic logic.

```mermaid
flowchart TD
    START["If patient has no pulse, record the time and start chest compressions<br/>30:2 with BVM + 100% O2; attach monitor/defibrillator, check initial rhythm"]
    START --> VF["VF"]
    START --> PVT["pVT"]
    START --> ASY["Asystole"]
    START --> PEA0["Any other rhythm: PEA"]
    VF --> SHOCK1["Shock 120-150J (360J monophasic)"]
    PVT --> SHOCK1
    SHOCK1 --> CPR2["Restart CPR; after 2 min recheck rhythm"]
    ASY --> CPR2
    PEA0 --> CPR2
    CPR2 --> VF2["VF / pVT"] --> SHOCK2["Shock (increase joules)"] --> LOOP
    CPR2 --> ASY2["Asystole"] --> LOOP
    CPR2 --> OTHER["Other rhythm: feel carotid pulse ≤ 10 s"]
    OTHER -- "No pulse felt / Unsure" --> PEA["PEA"] --> LOOP
    OTHER -- "Pulse felt" --> STOP["Stop CPR and check breathing → 16"]
    LOOP["Restart CPR; adrenaline every 2 cycles; recheck every 2 min"] --> CPR2
    LOOP --> CAUSES["While giving CPR: look for and manage possible cause"]
    CAUSES --> TP["Resonant/decreased breath sounds on 1 side or deviated trachea → tension pneumothorax likely"]
    CAUSES --> DEH["Trauma, diarrhoea/vomiting or dehydration² → saline"]
    CAUSES --> GLU["Glucose < 3 (< 4 if diabetes) → 19; temp ≤ 35°C → 18; overdose/poisoning → 200"]
    LOOP --> STOPDEC["Decide when to stop CPR"]
```

² Thirst, dry mouth, poor skin turgor, BP < 90/60, dehydration likely.

## Decision nodes → rules

| Node | Modelled as | Rule |
|---|---|---|
| No pulse (entry) | Cardiac arrest warning sign or Absent pulse | `Emergency: no pulse, start CPR`; trigger of `Check for reversible causes during CPR` |
| Tension pneumothorax likely | Arrest context **and** any of unilateral hyperresonance, unilateral decreased breath sounds, displaced trachea | `Diagnose probable tension pneumothorax during CPR` |
| Dehydration² (footnote) | Arrest context **and** any of increased thirst, xerostomia, decreased skin turgor, SBP < 90, DBP < 60 | `Diagnose probable dehydration as a cause of cardiac arrest` |
| Rhythm branches (VF, pVT, asystole, PEA, pulse felt/unsure) | Not modelled: they route to management (shock / no shock / stop CPR) | — |
| Glucose, temperature, overdose/poisoning | Not modelled: pointers to pages 19, 18, 200 | — |
| Decide when to stop CPR | Not modelled: management | — |
