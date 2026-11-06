# Page 17 – Cardiopulmonary resuscitation (CPR): flowchart

Source: APC 2026 e-book page 17 (red box).

```mermaid
flowchart TD
    START["Patient has no pulse:<br/>record the time, start chest compressions<br/>30:2 with bag-valve-mask, 100% O2"] --> RHY["Attach monitor/defibrillator,<br/>pause compressions, check initial rhythm"]
    RHY --> VF["VF"] & PVT["pVT"] & ASY["Asystole"] & PEA0["Any other rhythm: PEA"]
    VF --> SHOCK1["Shock 120-150J (360J monophasic)"]
    PVT --> SHOCK1
    SHOCK1 --> CPR1["Restart CPR; after 2 min recheck rhythm"]
    ASY --> CPR1
    PEA0 --> CPR1
    CPR1 --> VF2["VF / pVT"] --> SHOCK2["Shock (increase joules)"] --> CPR2
    CPR1 --> ASY2["Asystole"] --> CPR2
    CPR1 --> OTH["Other rhythm"] --> PULSE["Feel carotid pulse ≤ 10 s"]
    PULSE -- "No pulse felt / Unsure" --> PEA["PEA"] --> CPR2["Restart CPR; adrenaline every 2 cycles;<br/>recheck rhythm every 2 min, manage as above"]
    PULSE -- "Pulse felt" --> STOP["Stop CPR, check breathing → 16"]
    CPR2 --> CPR1
    CPR2 --> CAUSE["While giving CPR: look for and manage possible cause"]
    CAUSE --> TP["More resonant / decreased breath sounds on 1 side<br/>or deviated trachea → tension pneumothorax likely"]
    CAUSE --> DEH["Trauma, diarrhoea/vomiting or dehydration²<br/>(² thirst, dry mouth, poor skin turgor, BP &lt; 90/60: dehydration likely)"]
    CAUSE --> OTHERC["Glucose → 19; temperature ≤ 35°C → 18;<br/>overdose/poisoning → 200"]
    CAUSE --> DECIDE["Decide when to stop CPR"]
```

## Decision nodes → rules

| Node | Modelled as | Rule |
|---|---|---|
| Patient has no pulse | `(or Cardiac arrest, Absent pulse)` → Emergency | `Emergency: no pulse, start CPR` |
| Look for possible cause (trigger) | Same `or` as the task's `due_to` | `Check for reversible causes during CPR` |
| Tension pneumothorax likely | no pulse **and** any of unilateral hyperresonance, unilateral decreased breath sounds, trachea displaced | `Diagnose probable tension pneumothorax during CPR` |
| Dehydration likely (footnote 2) | no pulse **and** any of thirst, xerostomia, decreased skin turgor, SBP < 90, DBP < 60 | `Diagnose probable dehydration during CPR` |
| Rhythm branches (VF, pVT, asystole, PEA), pulse check, shocks, adrenaline | Not modelled: they route only to management | — |
| Glucose / temperature / overdose pointers | Cross-references to pages 19, 18, 200 | — |
| Decide when to stop CPR | Not modelled: management decision | — |
